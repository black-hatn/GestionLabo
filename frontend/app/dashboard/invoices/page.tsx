"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/lib/auth-store";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import invoiceService, { type Invoice as InvoiceAPI } from "@/services/api/invoice";
import patientService, { type Patient as PatientAPI } from "@/services/api/patient";
import paymentService from "@/services/api/payment";
import type { PaymentForPDF } from "@/lib/pdf/invoice-pdf";
import { toast } from "@/lib/toast-store";
import {
  Plus, Search, Edit2, Trash2, Loader2, AlertCircle, X,
  Receipt, CheckCircle2, Clock, AlertTriangle, RefreshCw,
  FileText, Calendar, User, DollarSign, ChevronLeft, ChevronRight,
} from "lucide-react";
import type { InvoiceForPDF, PatientForPDF } from "@/lib/pdf/invoice-pdf";
import { InvoiceDocument } from "@/lib/pdf/invoice-pdf";
import { DeleteConfirmDialog } from "@/components/dashboard/delete-confirm-dialog";

/* ── Chargement dynamique PDFDownloadLink (pas de SSR pour @react-pdf/renderer) ── */
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then(mod => mod.PDFDownloadLink),
  { ssr: false }
);

/* ── Types ── */
type InvoiceStatus = "BROUILLON" | "ENVOYEE" | "PAYEE" | "EN_RETARD" | "ANNULEE";
type Invoice = InvoiceAPI;
type Patient = Pick<PatientAPI, "id" | "first_name" | "last_name" | "record_number" | "email" | "phone" | "city">;

/* ── Helpers ── */
const STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string; icon: React.ElementType }> = {
  BROUILLON:  { label: "Brouillon",  color: "text-slate-400 bg-slate-500/15 border-slate-500/25", icon: FileText },
  ENVOYEE:    { label: "Envoyée",    color: "text-blue-400 bg-blue-500/15 border-blue-500/25",    icon: Clock },
  PAYEE:      { label: "Payée",      color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/25", icon: CheckCircle2 },
  EN_RETARD:  { label: "En Retard",  color: "text-red-400 bg-red-500/15 border-red-500/25",       icon: AlertTriangle },
  ANNULEE:    { label: "Annulée",    color: "text-slate-500 bg-slate-500/10 border-slate-500/20", icon: X },
};

type Currency = "XOF" | "EUR" | "USD";
const CURRENCY_CONFIG: Record<Currency, { label: string; symbol: string; flag: string }> = {
  XOF: { label: "FCFA",   symbol: "FCFA", flag: "🌍" },
  EUR: { label: "Euro",   symbol: "€",    flag: "🇪🇺" },
  USD: { label: "Dollar", symbol: "$",    flag: "🇺🇸" },
};

const PAYMENT_TYPES = [
  { value: "CASH",          label: "💵 Espèces" },
  { value: "CARD",          label: "💳 Carte bancaire" },
  { value: "BANK_TRANSFER", label: "🏦 Virement bancaire" },
  { value: "MOBILE_MONEY",  label: "📱 Mobile Money" },
  { value: "CHEQUE",        label: "📄 Chèque" },
];

function fmt(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtAmount(n: number | string, currency = "XOF") {
  const val = parseFloat(String(n)).toLocaleString("fr-FR", { minimumFractionDigits: 2 });
  const cfg = CURRENCY_CONFIG[currency as Currency] ?? CURRENCY_CONFIG.XOF;
  return currency === "EUR" ? `${val} ${cfg.symbol}` : currency === "USD" ? `${cfg.symbol}${val}` : `${val} ${cfg.symbol}`;
}
function todayISO() { return new Date().toISOString().split("T")[0]; }

/* ── Bouton PDF téléchargement ── */
function InvoiceDownloadButton({ invoice, patient }: { invoice: Invoice; patient: Patient | undefined }) {
  const [mounted, setMounted]       = useState(false);
  const [payments, setPayments]     = useState<PaymentForPDF[]>([]);
  const [fetchingPay, setFetchingPay] = useState(false);
  const [ready, setReady]           = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleClick = async () => {
    if (ready) return; // paiements déjà chargés, PDFDownloadLink prend la main
    setFetchingPay(true);
    try {
      const items = await paymentService.getPaymentsByInvoice(invoice.id);
      setPayments(items.map(p => ({
        id: p.id,
        amount: parseFloat(String(p.amount)),
        method: p.method,
        reference: p.reference,
        paid_at: p.paid_at,
      })));
    } catch { /* silent — PDF généré sans paiements */ }
    finally {
      setFetchingPay(false);
      setReady(true);
    }
  };

  if (!mounted) return null;

  const invoiceData: InvoiceForPDF = {
    id: invoice.id,
    invoice_number: invoice.invoice_number,
    total_amount: parseFloat(String(invoice.total_amount)),
    paid_amount: parseFloat(String(invoice.paid_amount)),
    status: invoice.status,
    issue_date: invoice.issue_date,
    due_date: invoice.due_date,
    paid_date: invoice.paid_date ?? undefined,
  };

  const patientData: PatientForPDF = patient
    ? {
        first_name: patient.first_name,
        last_name: patient.last_name,
        email: patient.email ?? "",
        phone: patient.phone ?? "",
        city: patient.city ?? "",
        record_number: patient.record_number,
      }
    : {
        first_name: "Patient",
        last_name: invoice.patient_id.slice(0, 8),
        email: "",
        phone: "",
        city: "",
      };

  const filename = `Facture-${invoice.invoice_number}-${patientData.last_name}.pdf`;

  if (!ready) {
    return (
      <button
        title="Télécharger PDF"
        disabled={fetchingPay}
        onClick={handleClick}
        className="p-2 border-2 border-purple-500/30 text-purple-400 bg-transparent hover:bg-purple-500/10 hover:border-purple-500 transition-all disabled:opacity-40 dark:bg-purple-500/10 dark:text-purple-400 dark:hover:bg-purple-500/20"
      >
        {fetchingPay ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
      </button>
    );
  }

  return (
    <PDFDownloadLink
      document={<InvoiceDocument invoice={invoiceData} patient={patientData} payments={payments} />}
      fileName={filename}
    >
      {({ loading }: { loading: boolean }) => (
        <button
          title="Télécharger PDF"
          disabled={loading}
          className="p-2 border-2 border-purple-500/30 text-purple-400 bg-transparent hover:bg-purple-500/10 hover:border-purple-500 transition-all disabled:opacity-40 dark:bg-purple-500/10 dark:text-purple-400 dark:hover:bg-purple-500/20"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
        </button>
      )}
    </PDFDownloadLink>
  );
}

/* ── Badge ── */
function StatusBadge({ status }: { status: InvoiceStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.BROUILLON;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 border ${cfg.color}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  );
}

/* ── Modal Créer ── */
function CreateModal({
  patients, onClose, onCreate,
}: { patients: Patient[]; onClose: () => void; onCreate: () => void }) {
  const [form, setForm] = useState({
    patient_id: "",
    total_amount: "", issue_date: todayISO(), due_date: todayISO(),
    currency: "XOF" as Currency,
    payment_type: "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_id || !form.total_amount || !form.due_date) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    setSaving(true);
    try {
      await invoiceService.createInvoice({
        patient_id: form.patient_id,
        total_amount: parseFloat(form.total_amount),
        issue_date: form.issue_date,
        due_date: form.due_date,
        currency: form.currency,
        payment_type: form.payment_type || null,
      });
      toast.success("Facture créée avec succès !");
      onCreate();
      onClose();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      const msg = Array.isArray(detail)
        ? detail.map((e: any) => e.msg ?? JSON.stringify(e)).join(" · ")
        : typeof detail === "string"
        ? detail
        : err?.code === "ECONNABORTED"
        ? "Le serveur met du temps à démarrer, réessayez dans 30 secondes"
        : err?.message || "Erreur lors de la création";
      toast.error(msg);
    } finally { setSaving(false); }
  };

  const currSymbol = CURRENCY_CONFIG[form.currency]?.symbol ?? "FCFA";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-md rounded-2xl border border-white/[0.08] shadow-2xl my-4" style={{ background: "#0c1828" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-400" />Nouvelle Facture
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Patient */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Patient *</label>
              <select
                value={form.patient_id}
                onChange={e => setForm({ ...form, patient_id: e.target.value })}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/[0.08] bg-white/[0.03] text-white focus:border-amber-500/50 focus:outline-none"
                required
              >
                <option value="">— Sélectionner un patient —</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.last_name} {p.first_name} ({p.record_number})
                  </option>
                ))}
              </select>
            </div>

            {/* N° Facture — auto-généré par le serveur */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">N° Facture</label>
              <div className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/[0.06] bg-white/[0.02] text-slate-500 italic flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                Auto-généré (FAC-{new Date().getFullYear()}-XXXX)
              </div>
            </div>

            {/* Devise + Montant */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Devise *</label>
                <div className="flex gap-1">
                  {(["XOF", "EUR", "USD"] as Currency[]).map(c => (
                    <button
                      key={c} type="button"
                      onClick={() => setForm({ ...form, currency: c })}
                      className={`flex-1 py-2 text-xs font-bold border-2 transition-all ${
                        form.currency === c
                          ? "bg-amber-500 text-white border-amber-500"
                          : "bg-transparent text-slate-400 border-slate-600 hover:border-amber-500/50 hover:text-amber-300"
                      }`}
                    >
                      {CURRENCY_CONFIG[c].flag} {c === "XOF" ? "FCFA" : c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Montant total ({currSymbol}) *
                </label>
                <input
                  type="number" step="0.01" min="0" value={form.total_amount}
                  onChange={e => setForm({ ...form, total_amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/[0.08] bg-white/[0.03] text-white focus:border-amber-500/50 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Mode de paiement */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Mode de paiement</label>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_TYPES.map(pt => (
                  <button
                    key={pt.value} type="button"
                    onClick={() => setForm({ ...form, payment_type: form.payment_type === pt.value ? "" : pt.value })}
                    className={`px-3 py-2 text-xs font-semibold border-2 text-left transition-all ${
                      form.payment_type === pt.value
                        ? "bg-amber-500/15 text-amber-300 border-amber-500/60"
                        : "bg-transparent text-slate-400 border-slate-600/60 hover:border-amber-500/40 hover:text-slate-300"
                    }`}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Date d'émission *</label>
                <input
                  type="date" value={form.issue_date}
                  onChange={e => setForm({ ...form, issue_date: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/[0.08] bg-white/[0.03] text-white focus:border-amber-500/50 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Échéance *</label>
                <input
                  type="date" value={form.due_date}
                  onChange={e => setForm({ ...form, due_date: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/[0.08] bg-white/[0.03] text-white focus:border-amber-500/50 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 h-10 text-sm font-semibold border-2 border-slate-600 text-slate-400 bg-transparent hover:border-slate-400 hover:text-white transition-all">
                Annuler
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 h-10 text-sm font-bold bg-amber-500 text-white border-2 border-amber-500 hover:bg-amber-600 hover:border-amber-600 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Créer
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

/* ── Modal Modifier statut ── */
function EditStatusModal({
  invoice, onClose, onSave,
}: { invoice: Invoice; onClose: () => void; onSave: () => void }) {
  const [status, setStatus] = useState<InvoiceStatus>(invoice.status as InvoiceStatus);
  const [paidAmount, setPaidAmount] = useState(String(invoice.paid_amount));
  const [currency, setCurrency] = useState<Currency>((invoice.currency as Currency) || "XOF");
  const [paymentType, setPaymentType] = useState(invoice.payment_type || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await invoiceService.updateInvoice(invoice.id, {
        status,
        paid_amount: parseFloat(paidAmount),
        currency,
        payment_type: paymentType || null,
        ...(status === "PAYEE" ? { paid_date: todayISO() } : {}),
      });
      toast.success("Facture mise à jour !");
      onSave();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Erreur lors de la mise à jour");
    } finally { setSaving(false); }
  };

  const currSymbol = CURRENCY_CONFIG[currency]?.symbol ?? "FCFA";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] shadow-2xl my-4" style={{ background: "#0c1828" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-amber-400" />Modifier #{invoice.invoice_number}
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Statut */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Statut</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as InvoiceStatus)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/[0.08] bg-white/[0.03] text-white focus:border-amber-500/50 focus:outline-none"
              >
                {Object.entries(STATUS_CONFIG).map(([v, c]) => (
                  <option key={v} value={v}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Devise */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Devise</label>
              <div className="flex gap-2">
                {(["XOF", "EUR", "USD"] as Currency[]).map(c => (
                  <button
                    key={c} type="button"
                    onClick={() => setCurrency(c)}
                    className={`flex-1 py-2 text-xs font-bold border-2 transition-all ${
                      currency === c
                        ? "bg-amber-500 text-white border-amber-500"
                        : "bg-transparent text-slate-400 border-slate-600 hover:border-amber-500/50 hover:text-amber-300"
                    }`}
                  >
                    {CURRENCY_CONFIG[c].flag} {c === "XOF" ? "FCFA" : c}
                  </button>
                ))}
              </div>
            </div>

            {/* Montant payé */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Montant payé ({currSymbol})
              </label>
              <input
                type="number" step="0.01" min="0" value={paidAmount}
                onChange={e => setPaidAmount(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/[0.08] bg-white/[0.03] text-white focus:border-amber-500/50 focus:outline-none"
              />
            </div>

            {/* Mode de paiement */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Mode de paiement</label>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_TYPES.map(pt => (
                  <button
                    key={pt.value} type="button"
                    onClick={() => setPaymentType(paymentType === pt.value ? "" : pt.value)}
                    className={`px-3 py-2 text-xs font-semibold border-2 text-left transition-all ${
                      paymentType === pt.value
                        ? "bg-amber-500/15 text-amber-300 border-amber-500/60"
                        : "bg-transparent text-slate-400 border-slate-600/60 hover:border-amber-500/40 hover:text-slate-300"
                    }`}
                  >
                    {pt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 h-10 text-sm font-semibold border-2 border-slate-600 text-slate-400 bg-transparent hover:border-slate-400 hover:text-white transition-all">
                Annuler
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 h-10 text-sm font-bold bg-amber-500 text-white border-2 border-amber-500 hover:bg-amber-600 hover:border-amber-600 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

/* ── Page principale ── */
export default function InvoicesPage() {
  const user = useAuthStore(s => s.user);
  const canWrite  = ["ADMIN", "RECEPTIONIST", "LAB_TECH", "DOCTOR"].includes(user?.role ?? "");
  const canDelete = user?.role === "ADMIN";

  const [invoices, setInvoices]       = useState<Invoice[]>([]);
  const [patients, setPatients]       = useState<Patient[]>([]);
  const [loading, setLoading]         = useState(true);
  const [total, setTotal]             = useState(0);
  const [totalPages, setTotalPages]   = useState(1);
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | InvoiceStatus>("ALL");
  const [modal, setModal]             = useState<"none" | "create" | { type: "edit"; inv: Invoice }>("none");
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; invoice: Invoice | null; saving: boolean }>({ open: false, invoice: null, saving: false });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await invoiceService.getInvoices(
        page,
        10,
        filterStatus !== "ALL" ? filterStatus : undefined,
      );
      setInvoices(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.pages || 1);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err?.message || "Erreur de chargement");
    } finally { setLoading(false); }
  }, [page, filterStatus]);

  // Réinitialiser la page à 1 quand le filtre change
  useEffect(() => { setPage(1); }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    patientService.getPatients(1, 500)
      .then(r => setPatients(r.items || []))
      .catch(() => toast.error("Impossible de charger la liste des patients"));
  }, []);

  const handleDelete = (inv: Invoice) => {
    setDeleteConfirm({ open: true, invoice: inv, saving: false });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.invoice) return;
    setDeleteConfirm(d => ({ ...d, saving: true }));
    try {
      await invoiceService.deleteInvoice(deleteConfirm.invoice.id);
      toast.success("Facture supprimée");
      setDeleteConfirm({ open: false, invoice: null, saving: false });
      load();
    } catch {
      toast.error("Impossible de supprimer");
      setDeleteConfirm(d => ({ ...d, saving: false }));
    }
  };

  const pname = (id: string) => {
    const p = patients.find(p => p.id === id);
    return p ? `${p.last_name} ${p.first_name}` : id.slice(0, 8) + "…";
  };

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase();
    const matchSearch = !q || inv.invoice_number.toLowerCase().includes(q) || pname(inv.patient_id).toLowerCase().includes(q);
    const matchStatus = filterStatus === "ALL" || inv.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    paid:    invoices.filter(i => i.status === "PAYEE").length,
    pending: invoices.filter(i => i.status === "ENVOYEE").length,
    late:    invoices.filter(i => i.status === "EN_RETARD").length,
    totalAmt: invoices.reduce((s, i) => s + parseFloat(String(i.total_amount)), 0),
    paidAmt:  invoices.reduce((s, i) => s + parseFloat(String(i.paid_amount)), 0),
  };

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["ADMIN", "RECEPTIONIST", "LAB_TECH", "DOCTOR"]}>
        <div className="space-y-6 animate-fade-in">

          {/* ── Header ── */}
          <div className="relative rounded-2xl overflow-hidden border border-amber-500/15 p-7">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600/12 via-orange-600/8 to-transparent" />
            <div className="absolute inset-0 dot-pattern opacity-20" />
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-[0.05]">
              <Receipt className="w-40 h-40" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Receipt className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Facturation</span>
                </div>
                <h1 className="text-2xl font-extrabold text-white font-display">
                  Facturation & Devis
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  {total} facture{total !== 1 ? "s" : ""} enregistrée{total !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={load} className="h-9 px-3 text-xs font-semibold border-2 border-slate-600 text-slate-400 bg-transparent hover:border-slate-400 hover:text-white transition-all flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5" />Actualiser
                </button>
                {canWrite && (
                  <button onClick={() => setModal("create")}
                    className="h-9 px-5 text-sm font-bold bg-amber-500 text-white border-2 border-amber-500 hover:bg-amber-600 hover:border-amber-600 transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" />Nouvelle Facture
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Factures",  val: total,           sub: fmtAmount(stats.totalAmt), color: "amber" },
              { label: "Payées",          val: stats.paid,      sub: fmtAmount(stats.paidAmt),  color: "emerald" },
              { label: "En Attente",      val: stats.pending,   sub: "À relancer",              color: "blue" },
              { label: "En Retard",       val: stats.late,      sub: "Action requise",          color: "red" },
            ].map(({ label, val, sub, color }) => {
              const cs: Record<string, string> = {
                amber:   "text-amber-400 bg-amber-500/10 border-amber-500/20",
                emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                blue:    "text-blue-400 bg-blue-500/10 border-blue-500/20",
                red:     "text-red-400 bg-red-500/10 border-red-500/20",
              };
              return (
                <div key={label} className="card-premium rounded-2xl p-5 border border-white/[0.06]">
                  <div className={`text-xs font-bold mb-2 ${cs[color].split(" ")[0]}`}>{label}</div>
                  <div className="text-2xl font-extrabold text-white font-display">{loading ? "—" : val}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
                </div>
              );
            })}
          </div>

          {/* ── Filtres + Recherche ── */}
          <div className="card-premium rounded-2xl p-5 border border-white/[0.06]">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher par n° facture ou patient…"
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-white/[0.08] bg-white/[0.03] text-white placeholder-slate-600 focus:border-amber-500/40 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["ALL", "BROUILLON", "ENVOYEE", "PAYEE", "EN_RETARD", "ANNULEE"] as const).map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 text-xs font-semibold border-2 transition-all ${
                    filterStatus === s
                      ? "bg-amber-500 text-white border-amber-500"
                      : "bg-transparent text-slate-400 border-slate-600 hover:border-amber-500/50 hover:text-amber-300"
                  }`}>
                  {s === "ALL" ? "Tous" : STATUS_CONFIG[s as InvoiceStatus]?.label ?? s}
                </button>
              ))}
            </div>
          </div>

          {/* ── Liste ── */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-7 h-7 animate-spin text-amber-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="card-premium rounded-2xl p-10 border border-white/[0.06] text-center text-slate-500">
              <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
              {search || filterStatus !== "ALL" ? "Aucune facture ne correspond aux filtres." : "Aucune facture enregistrée."}
              {canWrite && !search && (
                <p className="mt-2 text-xs">
                  <button onClick={() => setModal("create")} className="text-amber-400 hover:underline">Créer la première facture</button>
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(inv => {
                const pct = Math.min(100, (parseFloat(String(inv.paid_amount)) / parseFloat(String(inv.total_amount))) * 100);
                return (
                  <div key={inv.id} className="card-premium rounded-2xl p-5 border border-white/[0.06] hover:border-amber-500/20 transition-all">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <span className="font-bold text-white">#{inv.invoice_number}</span>
                          <StatusBadge status={inv.status as InvoiceStatus} />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <User className="w-3 h-3 shrink-0" />
                            <span className="truncate">{pname(inv.patient_id)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <DollarSign className="w-3 h-3 shrink-0" />
                            <span className="text-white font-semibold">{fmtAmount(inv.total_amount, inv.currency)}</span>
                            <span className="text-[10px] px-1.5 py-0.5 border border-white/[0.08] text-slate-500 ml-1">
                              {CURRENCY_CONFIG[(inv.currency as Currency) ?? "XOF"]?.flag} {inv.currency || "XOF"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Calendar className="w-3 h-3 shrink-0" />Émise : {fmt(inv.issue_date)}
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            {inv.payment_type
                              ? <span className="text-amber-400/80">{PAYMENT_TYPES.find(p => p.value === inv.payment_type)?.label ?? inv.payment_type}</span>
                              : <><Clock className="w-3 h-3 shrink-0" />Éch : {fmt(inv.due_date)}</>
                            }
                          </div>
                        </div>
                        {/* Barre de progression */}
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                            <span>Payé : {fmtAmount(inv.paid_amount, inv.currency)}</span>
                            <span>{pct.toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <InvoiceDownloadButton
                          invoice={inv}
                          patient={patients.find(p => p.id === inv.patient_id)}
                        />
                        {canWrite && (
                          <button
                            onClick={() => setModal({ type: "edit", inv })}
                            className="p-2 border-2 border-amber-500/30 text-amber-400 bg-transparent hover:bg-amber-500/10 hover:border-amber-500 transition-all"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(inv)}
                            className="p-2 border-2 border-red-500/30 text-red-400 bg-transparent hover:bg-red-500/10 hover:border-red-500 transition-all"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-2 border-slate-600 text-slate-400 bg-transparent hover:border-slate-400 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft className="w-3.5 h-3.5" />Précédent
              </button>
              <span className="text-sm text-slate-400">Page {page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-2 border-slate-600 text-slate-400 bg-transparent hover:border-slate-400 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                Suivant<ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* ── Modales ── */}
        {modal === "create" && (
          <CreateModal patients={patients} onClose={() => setModal("none")} onCreate={load} />
        )}
        {typeof modal === "object" && modal.type === "edit" && (
          <EditStatusModal invoice={modal.inv} onClose={() => setModal("none")} onSave={load} />
        )}
        <DeleteConfirmDialog
          open={deleteConfirm.open}
          itemName={deleteConfirm.invoice ? `Facture ${deleteConfirm.invoice.invoice_number}` : ""}
          itemType="cette facture"
          saving={deleteConfirm.saving}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm({ open: false, invoice: null, saving: false })}
        />
      </RoleGuard>
    </ProtectedRoute>
  );
}
