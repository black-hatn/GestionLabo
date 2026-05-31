"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "@/lib/toast-store";
import invoiceService from "@/services/api/invoice";
import patientService from "@/services/api/patient";
import paymentService from "@/services/api/payment";
import { Invoice } from "@/services/api/invoice";
import { Patient } from "@/services/api/patient";
import { Payment } from "@/services/api/payment";
import {
  ArrowLeft,
  FileDown,
  CheckCircle,
  Activity,
  Calendar,
  User,
  Coins,
  AlertCircle,
} from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";

/* ─ Status helpers ─────────────────────────────────────────────────── */
function getStatusColors(status: string) {
  switch (status?.toUpperCase()) {
    case "PAYEE":     return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    case "ENVOYEE":   return "bg-blue-500/15 text-blue-300 border-blue-500/30";
    case "BROUILLON": return "bg-slate-500/15 text-slate-300 border-slate-500/30";
    case "EN_RETARD": return "bg-red-500/15 text-red-300 border-red-500/30";
    case "ANNULEE":   return "bg-orange-500/15 text-orange-300 border-orange-500/30";
    default:          return "bg-slate-500/15 text-slate-300 border-slate-500/30";
  }
}

function getStatusLabel(status: string) {
  switch (status?.toUpperCase()) {
    case "PAYEE":     return "Payée";
    case "ENVOYEE":   return "Envoyée";
    case "BROUILLON": return "Brouillon";
    case "EN_RETARD": return "En Retard";
    case "ANNULEE":   return "Annulée";
    default:          return status;
  }
}

function getMethodLabel(method: string) {
  switch (method?.toUpperCase()) {
    case "CARD":          return "Carte Bancaire";
    case "CASH":          return "Espèces";
    case "BANK_TRANSFER": return "Virement";
    case "CHEQUE":        return "Chèque";
    default:              return method || "—";
  }
}

/* ─ Page ───────────────────────────────────────────────────────────── */
export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id ?? "") as string;

  const [invoice, setInvoice]   = useState<Invoice | null>(null);
  const [patient, setPatient]   = useState<Patient | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading]   = useState(true);
  const [paying, setPaying]     = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const inv = await invoiceService.getInvoice(id);
      setInvoice(inv);

      // Load patient and all payments in parallel
      const [pat, paymentsResp] = await Promise.all([
        patientService.getPatient(inv.patient_id),
        paymentService.getPayments(1, 100),
      ]);
      setPatient(pat);
      setPayments(paymentsResp.items.filter(p => p.invoice_id === id));
    } catch {
      toast.error("Impossible de charger le détail de la facture.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void loadData(); }, [loadData]);

  const handleMarkAsPaid = async () => {
    if (!invoice) return;
    setPaying(true);
    try {
      await invoiceService.updateInvoice(id, {
        status: "PAYEE",
        paid_amount: invoice.total_amount,
        paid_date: new Date().toISOString().split("T")[0],
      });
      toast.success("Facture réglée et soldée !");
      void loadData();
    } catch {
      toast.error("Échec de la transaction de règlement.");
    } finally {
      setPaying(false);
    }
  };

  /* ─ Loading state ─ */
  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Chargement de la facture...</p>
      </div>
    );
  }

  /* ─ Not found ─ */
  if (!invoice) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
        <AlertCircle className="w-12 h-12 text-slate-600" />
        <p className="text-sm font-semibold">Facture introuvable.</p>
        <button
          onClick={() => router.push("/dashboard/invoices")}
          className="mt-2 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          ← Retour aux factures
        </button>
      </div>
    );
  }

  const subtotal = invoice.total_amount / 1.1;
  const taxes    = invoice.total_amount - subtotal;
  const dues     = invoice.total_amount - invoice.paid_amount;

  const patientInitials = patient
    ? `${patient.first_name[0] ?? ""}${patient.last_name[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <div
      className="min-h-screen px-4 py-6"
      style={{ background: "linear-gradient(135deg, #060e1c 0%, #0a1525 60%, #050c18 100%)" }}
    >
      <div className="max-w-4xl mx-auto flex flex-col gap-6">

        {/* ─ Header bar ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
          <button
            onClick={() => router.push("/dashboard/invoices")}
            className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          <div className="flex items-center gap-2.5 flex-wrap">
            {invoice.status !== "PAYEE" && invoice.status !== "ANNULEE" && (
              <button
                onClick={handleMarkAsPaid}
                disabled={paying}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-4 h-4" />
                {paying ? "Traitement..." : "Solder"}
              </button>
            )}
            <button
              onClick={() => toast.success("Téléchargement du PDF démarré...")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 border border-white/[0.08] hover:bg-white/[0.04] hover:text-white transition-all"
            >
              <FileDown className="w-4 h-4" />
              Télécharger PDF
            </button>
          </div>
        </div>

        {/* ─ Invoice card ──────────────────────────────────────────── */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{
            background: "rgba(12,24,40,0.92)",
            borderColor: "rgba(255,255,255,0.07)",
          }}
        >
          {/* Brand header */}
          <div
            className="px-8 py-7 border-b flex flex-col sm:flex-row justify-between items-start gap-6"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            {/* Logo */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                  <Activity className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
                </div>
                <span className="font-extrabold text-xl text-white tracking-tight">
                  Nova<span className="text-emerald-400">Bio</span> Lab
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed pl-0.5">
                12 Rue des Alouettes, 75008 Paris<br />
                Tél : +33 1 45 67 89 00<br />
                Email : contact@novabio-lab.fr
              </p>
            </div>

            {/* Invoice number + status */}
            <div className="flex flex-col sm:items-end gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Facture d&apos;Analyses
              </span>
              <h2 className="text-2xl font-extrabold text-white">{invoice.invoice_number}</h2>
              <span
                className={`mt-1 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${getStatusColors(invoice.status)}`}
              >
                {getStatusLabel(invoice.status)}
              </span>
            </div>
          </div>

          {/* Patient info + dates */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-8 px-8 py-7 border-b"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            {/* Patient */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">
                Facturé à
              </span>
              {patient ? (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-extrabold text-sm shrink-0">
                    {patientInitials}
                  </div>
                  <div className="flex flex-col gap-0.5 text-sm">
                    <span className="font-extrabold text-white text-base">
                      {patient.first_name} {patient.last_name}
                    </span>
                    <span className="font-semibold text-slate-300">{patient.phone}</span>
                    <span className="text-slate-400">{patient.email}</span>
                    <span className="text-xs text-slate-500 mt-0.5">{patient.city}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-500">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-semibold">Patient inconnu</span>
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="flex flex-col sm:items-end gap-3 text-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0">
                Dates
              </span>
              <div className="flex items-center gap-3">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-400 font-semibold">Émission :</span>
                <span className="font-bold text-slate-200">{formatDate(invoice.issue_date)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-3.5 h-3.5 text-red-400" />
                <span className="text-slate-400 font-semibold">Échéance :</span>
                <span className="font-bold text-red-300">{formatDate(invoice.due_date)}</span>
              </div>
              {invoice.paid_date && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-400 font-semibold">Acquitté le :</span>
                  <span className="font-bold text-emerald-300">{formatDate(invoice.paid_date)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Exam lines */}
          <div
            className="px-8 py-7 border-b"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-4">
              Analyses & Diagnostics Réalisés
            </span>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-bold text-slate-200">1. Prestations d&apos;Analyses Cliniques</span>
                <div className="flex-1 border-b border-dotted border-white/[0.08]" />
                <span className="font-bold text-white">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-slate-500 italic pl-4">
                Dosages, Hématologie, Prélèvements veineux, traitement et diagnostics automatisés
              </p>
            </div>
          </div>

          {/* Totals + legal */}
          <div className="px-8 py-7 flex flex-col sm:flex-row justify-between gap-8">
            {/* Legal note */}
            <div
              className="flex-1 rounded-xl p-4 border"
              style={{
                background: "rgba(255,255,255,0.02)",
                borderColor: "rgba(255,255,255,0.05)",
              }}
            >
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
                Notes &amp; Informations Légales
              </span>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                TVA acquittée sur les encaissements. Les examens biologiques sont exonérés selon
                l&apos;art. 261‑4‑1° du CGI. En cas de retard de paiement, une pénalité
                forfaitaire de 40 € est exigible de plein droit.
              </p>
            </div>

            {/* Price breakdown */}
            <div className="flex flex-col gap-3 w-full sm:w-64 text-sm">
              <div className="flex justify-between text-slate-400 font-semibold">
                <span>Sous-total HT :</span>
                <span className="text-slate-200 font-bold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400 font-semibold">
                <span>TVA (10 %) :</span>
                <span className="text-slate-200 font-bold">{formatPrice(taxes)}</span>
              </div>
              <div
                className="flex justify-between font-extrabold text-white border-t pt-3"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              >
                <span>NET À PAYER :</span>
                <span className="text-emerald-400 text-base">{formatPrice(invoice.total_amount)}</span>
              </div>
              <div
                className="flex justify-between font-semibold text-xs border-t pt-3"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                <span className="px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-300 border-emerald-500/20">
                  RÉGLÉ :
                </span>
                <span className="font-bold text-emerald-300">{formatPrice(invoice.paid_amount)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-xs">
                <span className="px-2 py-0.5 rounded border bg-red-500/10 text-red-300 border-red-500/20">
                  SOLDE DÛ :
                </span>
                <span className={`font-bold ${dues > 0 ? "text-red-300" : "text-slate-400"}`}>
                  {formatPrice(dues)}
                </span>
              </div>
            </div>
          </div>

          {/* ─ Payments history ──────────────────────────────────── */}
          {payments.length > 0 && (
            <div
              className="px-8 py-7 border-t"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                Historique des Transactions
              </span>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Mode</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Référence</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Notes</th>
                      <th className="px-4 py-3 text-right font-bold text-slate-500 uppercase tracking-wider">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p, idx) => (
                      <tr
                        key={p.id}
                        className="border-t transition-colors hover:bg-white/[0.02]"
                        style={{ borderColor: "rgba(255,255,255,0.04)" }}
                      >
                        <td className="px-4 py-3 text-slate-300 font-semibold">
                          {formatDate(p.paid_at)}
                        </td>
                        <td className="px-4 py-3 text-slate-400 font-semibold">
                          {getMethodLabel(p.method)}
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-mono">
                          {p.reference || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-500 italic">
                          {p.notes || "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-300">
                          +{formatPrice(p.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
