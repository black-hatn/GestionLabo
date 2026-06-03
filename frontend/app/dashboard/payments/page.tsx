"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import paymentService, { type Payment as PaymentAPI } from "@/services/api/payment";
import invoiceService, { type Invoice as InvoiceAPI } from "@/services/api/invoice";
import { toast } from "@/lib/toast-store";
import {
  Plus, Search, Trash2, Loader2, X,
  CreditCard, Banknote, FileText, RefreshCw,
  Calendar, Hash, ChevronLeft, ChevronRight, TrendingUp,
} from "lucide-react";

/* ── Types ── */
type PaymentMethod = "CARTE" | "ESPECES" | "CHEQUE" | "VIREMENT" | "MOBILE";
type Payment = PaymentAPI;
type Invoice = InvoiceAPI;

/* ── Helpers ── */
const METHOD_CONFIG: Record<PaymentMethod, { label: string; color: string; icon: React.ElementType }> = {
  CARTE:    { label: "Carte Bancaire", color: "text-blue-400 bg-blue-500/15 border-blue-500/25",           icon: CreditCard },
  ESPECES:  { label: "Espèces",        color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/25",  icon: Banknote },
  CHEQUE:   { label: "Chèque",         color: "text-amber-400 bg-amber-500/15 border-amber-500/25",        icon: FileText },
  VIREMENT: { label: "Virement",       color: "text-purple-400 bg-purple-500/15 border-purple-500/25",     icon: TrendingUp },
  MOBILE:   { label: "Mobile Money",   color: "text-pink-400 bg-pink-500/15 border-pink-500/25",           icon: Banknote },
};

const CURRENCY_SYMBOL: Record<string, string> = {
  XOF: "FCFA", EUR: "€", USD: "$",
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
function fmtAmount(n: number | string, currency = "XOF") {
  const num = parseFloat(String(n));
  if (currency === "XOF") {
    return num.toLocaleString("fr-FR", { minimumFractionDigits: 0 }) + " FCFA";
  }
  return num.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " " + currency;
}

function MethodBadge({ method }: { method: PaymentMethod }) {
  const cfg = METHOD_CONFIG[method] ?? METHOD_CONFIG.CARTE;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 border ${cfg.color}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  );
}

/* ── Modal Créer Paiement ── */
function CreateModal({
  invoices, onClose, onCreate,
}: { invoices: Invoice[]; onClose: () => void; onCreate: () => void }) {
  const [form, setForm] = useState({
    invoice_id: "", amount: "", method: "CARTE" as PaymentMethod,
    reference: "", notes: "",
  });
  const [saving, setSaving] = useState(false);

  const selectedInvoice = invoices.find(i => i.id === form.invoice_id);
  const remaining = selectedInvoice
    ? parseFloat(String(selectedInvoice.total_amount)) - parseFloat(String(selectedInvoice.paid_amount))
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.invoice_id || !form.amount) {
      toast.error("Sélectionnez une facture et saisissez un montant");
      return;
    }
    if (remaining !== null && parseFloat(form.amount) > remaining + 0.01) {
      toast.error(`Montant dépasse le solde restant (${fmtAmount(remaining)})`);
      return;
    }
    setSaving(true);
    try {
      await paymentService.createPayment({
        invoice_id: form.invoice_id,
        amount: parseFloat(form.amount),
        method: form.method,
        reference: form.reference || undefined,
        notes: form.notes || undefined,
      });
      toast.success("Paiement enregistré !");
      onCreate();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Erreur lors de l'enregistrement");
    } finally { setSaving(false); }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/[0.08] shadow-2xl" style={{ background: "#0c1828" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
            <h2 className="font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />Nouveau Paiement
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Facture */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Facture *</label>
              <select
                value={form.invoice_id}
                onChange={e => {
                  const inv = invoices.find(i => i.id === e.target.value);
                  const rem = inv
                    ? (parseFloat(String(inv.total_amount)) - parseFloat(String(inv.paid_amount))).toFixed(2)
                    : "";
                  setForm({ ...form, invoice_id: e.target.value, amount: rem });
                }}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/[0.08] bg-white/[0.03] text-white focus:border-emerald-500/50 focus:outline-none"
                required
              >
                <option value="">— Sélectionner une facture —</option>
                {invoices
                  .filter(i => i.status !== "PAYEE" && i.status !== "ANNULEE")
                  .map(i => (
                    <option key={i.id} value={i.id}>
                      #{i.invoice_number} — Total : {fmtAmount(i.total_amount)} · Restant : {fmtAmount(
                        parseFloat(String(i.total_amount)) - parseFloat(String(i.paid_amount))
                      )}
                    </option>
                  ))}
              </select>
              {remaining !== null && (
                <p className="text-[10px] text-emerald-400 mt-1">Solde restant : {fmtAmount(remaining)}</p>
              )}
            </div>
            {/* Montant */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Montant ({CURRENCY_SYMBOL[selectedInvoice?.currency ?? "XOF"] ?? "FCFA"}) *
              </label>
              <input
                type="number" step="0.01" min="0.01" value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/[0.08] bg-white/[0.03] text-white focus:border-emerald-500/50 focus:outline-none"
                required
              />
            </div>
            {/* Méthode */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Méthode de paiement *</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(METHOD_CONFIG) as [PaymentMethod, (typeof METHOD_CONFIG)[PaymentMethod]][]).map(([v, c]) => {
                  const Icon = c.icon;
                  return (
                    <button key={v} type="button" onClick={() => setForm({ ...form, method: v })}
                      className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold border-2 transition-all ${
                        form.method === v
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "bg-transparent text-slate-400 border-slate-600 hover:border-slate-400"
                      }`}>
                      <Icon className="w-3.5 h-3.5" />{c.label}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Référence */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Référence (optionnel)</label>
              <input
                type="text" value={form.reference}
                onChange={e => setForm({ ...form, reference: e.target.value })}
                placeholder="N° chèque, virement…"
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/[0.08] bg-white/[0.03] text-white placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none"
              />
            </div>
            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Notes (optionnel)</label>
              <textarea
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={2} placeholder="Observations…"
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/[0.08] bg-white/[0.03] text-white placeholder-slate-600 focus:border-emerald-500/50 focus:outline-none resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 h-10 text-sm font-semibold border-2 border-slate-600 text-slate-400 bg-transparent hover:border-slate-400 hover:text-white transition-all">
                Annuler
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 h-10 text-sm font-bold bg-emerald-500 text-white border-2 border-emerald-500 hover:bg-emerald-600 hover:border-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
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
export default function PaymentsPage() {
  const user = useAuthStore(s => s.user);
  const [payments, setPayments]       = useState<Payment[]>([]);
  const [invoices, setInvoices]       = useState<Invoice[]>([]);
  const [loading, setLoading]         = useState(true);
  const [total, setTotal]             = useState(0);
  const [totalPages, setTotalPages]   = useState(1);
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState("");
  const [filterMethod, setFilterMethod] = useState<"ALL" | PaymentMethod>("ALL");
  const [showCreate, setShowCreate]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentService.getPayments(page, 10);
      setPayments(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.pages || 1);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err?.message || "Erreur de chargement");
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    invoiceService.getInvoices(1, 200)
      .then(r => setInvoices(r.items || []))
      .catch(() => toast.error("Impossible de charger la liste des factures"));
  }, []);

  const handleDelete = async (p: Payment) => {
    if (!confirm("Supprimer ce paiement ?")) return;
    try {
      await paymentService.deletePayment(p.id);
      toast.success("Paiement supprimé");
      load();
    } catch { toast.error("Impossible de supprimer"); }
  };

  const invoiceNum = (id: string) => {
    const inv = invoices.find(i => i.id === id);
    return inv ? `#${inv.invoice_number}` : id.slice(0, 8) + "…";
  };

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    const matchS = !q || p.id.toLowerCase().includes(q)
      || invoiceNum(p.invoice_id).toLowerCase().includes(q)
      || (p.reference || "").toLowerCase().includes(q);
    const matchM = filterMethod === "ALL" || p.method === filterMethod;
    return matchS && matchM;
  });

  const totalAmount = payments.reduce((s, p) => s + parseFloat(String(p.amount)), 0);
  const byMethod = {
    CARTE:    payments.filter(p => p.method === "CARTE").length,
    ESPECES:  payments.filter(p => p.method === "ESPECES").length,
    CHEQUE:   payments.filter(p => p.method === "CHEQUE").length,
    VIREMENT: payments.filter(p => p.method === "VIREMENT").length,
    MOBILE:   payments.filter(p => p.method === "MOBILE").length,
  };

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["ADMIN", "RECEPTIONIST"]}>
        <div className="space-y-6 animate-fade-in">

          {/* Header */}
          <div className="relative rounded-2xl overflow-hidden border border-emerald-500/15 p-7">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/12 via-teal-600/8 to-transparent" />
            <div className="absolute inset-0 dot-pattern opacity-20" />
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-[0.05]">
              <CreditCard className="w-40 h-40" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Règlements</span>
                </div>
                <h1 className="text-2xl font-extrabold text-white font-display">Paiements</h1>
                <p className="text-slate-400 text-sm mt-1">
                  {total} paiement{total !== 1 ? "s" : ""} · Total encaissé : {fmtAmount(totalAmount)}
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={load}
                  className="h-9 px-3 text-xs font-semibold border-2 border-slate-600 text-slate-400 bg-transparent hover:border-slate-400 hover:text-white transition-all flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5" />Actualiser
                </button>
                <button onClick={() => setShowCreate(true)}
                  className="h-9 px-5 text-sm font-bold bg-emerald-500 text-white border-2 border-emerald-500 hover:bg-emerald-600 hover:border-emerald-600 transition-all flex items-center gap-2">
                  <Plus className="w-4 h-4" />Nouveau Paiement
                </button>
              </div>
            </div>
          </div>

          {/* Stats par méthode */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {(["CARTE", "ESPECES", "MOBILE", "VIREMENT"] as PaymentMethod[]).map(m => {
              const cfg = METHOD_CONFIG[m];
              const Icon = cfg.icon;
              return (
                <div key={m} className="card-premium rounded-2xl p-5 border border-white/[0.06] flex items-center gap-4">
                  <div className={`w-10 h-10 flex items-center justify-center border ${cfg.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-white font-display">{loading ? "—" : byMethod[m]}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">{cfg.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filtres */}
          <div className="card-premium rounded-2xl p-5 border border-white/[0.06]">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher par facture, référence…"
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-white/[0.08] bg-white/[0.03] text-white placeholder-slate-600 focus:border-emerald-500/40 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["ALL", "CARTE", "ESPECES", "MOBILE", "CHEQUE", "VIREMENT"] as const).map(m => (
                <button key={m} onClick={() => setFilterMethod(m)}
                  className={`px-3 py-1.5 text-xs font-semibold border-2 transition-all ${
                    filterMethod === m
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-transparent text-slate-400 border-slate-600 hover:border-emerald-500/50 hover:text-emerald-300"
                  }`}>
                  {m === "ALL" ? "Tous" : METHOD_CONFIG[m as PaymentMethod]?.label ?? m}
                </button>
              ))}
            </div>
          </div>

          {/* Liste */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="card-premium rounded-2xl p-10 border border-white/[0.06] text-center text-slate-500">
              <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
              {search || filterMethod !== "ALL"
                ? "Aucun paiement ne correspond aux filtres."
                : "Aucun paiement enregistré."}
              {!search && (
                <p className="mt-2 text-xs">
                  <button onClick={() => setShowCreate(true)} className="text-emerald-400 hover:underline">
                    Enregistrer le premier paiement
                  </button>
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(p => (
                <div key={p.id} className="card-premium rounded-2xl p-5 border border-white/[0.06] hover:border-emerald-500/20 transition-all">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className="text-lg font-extrabold text-emerald-400 font-display">
                          {fmtAmount(p.amount)}
                        </span>
                        <MethodBadge method={p.method as PaymentMethod} />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3 h-3 shrink-0" />
                          Facture : <span className="text-white font-semibold ml-1">{invoiceNum(p.invoice_id)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 shrink-0" />
                          {fmt(p.paid_at)} à {fmtTime(p.paid_at)}
                        </div>
                        {p.reference && (
                          <div className="flex items-center gap-1.5">
                            <Hash className="w-3 h-3 shrink-0" />Réf : {p.reference}
                          </div>
                        )}
                        {p.notes && (
                          <div className="flex items-center gap-1.5 italic text-slate-500 truncate">
                            {p.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    {user?.role === "ADMIN" && (
                      <button onClick={() => handleDelete(p)}
                        className="p-2 border-2 border-red-500/30 text-red-400 bg-transparent hover:bg-red-500/10 hover:border-red-500 transition-all shrink-0"
                        title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
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

        {showCreate && (
          <CreateModal invoices={invoices} onClose={() => setShowCreate(false)} onCreate={load} />
        )}
      </RoleGuard>
    </ProtectedRoute>
  );
}
