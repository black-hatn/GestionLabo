"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "@/lib/toast-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Printer,
  FileDown,
  CheckCircle,
  Activity,
  Calendar,
  User,
  CreditCard,
  AlertTriangle,
  Coins,
} from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";

type Patient = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  address?: string;
};

type Invoice = {
  id: string;
  patient_id: string;
  invoice_number: string;
  total_amount: number;
  paid_amount: number;
  status: "BROUILLON" | "ENVOYEE" | "PAYEE" | "EN_RETARD" | "ANNULEE";
  issue_date: string;
  due_date: string;
  paid_date?: string;
  patient?: Patient;
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const accessToken = useAuthStore(state => state.accessToken);
  const id = (params?.id ?? "") as string;


  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const loadInvoiceData = useCallback(async () => {
    if (!accessToken || !id) return;
    setLoading(true);
    try {
      const data = await api.get<Invoice>("factures", id, accessToken);
      setInvoice(data);
    } catch {
      toast.error("Impossible de charger le détail de la facture.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, id]);

  useEffect(() => {
    void loadInvoiceData();
  }, [loadInvoiceData]);

  const handleMarkAsPaid = async () => {
    if (!invoice || !accessToken) return;

    const payload = {
      ...invoice,
      paid_amount: invoice.total_amount,
      status: "PAYEE",
      paid_date: new Date().toISOString().split("T")[0],
    };

    try {
      await api.update("factures", invoice.id, payload, accessToken);
      toast.success("Facture réglée et soldée !");
      void loadInvoiceData();
    } catch {
      toast.error("Échec de la transaction de règlement.");
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAYEE":
        return "success";
      case "ENVOYEE":
        return "default";
      case "BROUILLON":
        return "secondary";
      case "EN_RETARD":
        return "danger";
      case "ANNULEE":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAYEE":
        return "Payée";
      case "ENVOYEE":
        return "Envoyée";
      case "BROUILLON":
        return "Brouillon";
      case "EN_RETARD":
        return "En Retard";
      case "ANNULEE":
        return "Annulée";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-primary-600 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-neutral-500">Chargement de la facture...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="py-20 text-center text-sm font-semibold text-neutral-400">
        Facture introuvable.
      </div>
    );
  }

  const subtotal = invoice.total_amount / 1.1;
  const taxes = invoice.total_amount - subtotal;
  const dues = invoice.total_amount - invoice.paid_amount;

  return (
    <div className="flex flex-col gap-6 select-none max-w-4xl mx-auto">
      {/* Back button and quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <button
          onClick={() => router.push("/dashboard/invoices")}
          className="flex items-center gap-2 text-sm font-bold text-neutral-600 hover:text-neutral-900 transition-colors focus:outline-none"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour aux factures
        </button>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="font-semibold text-xs py-1.5 px-3 flex items-center gap-1"
          >
            <Printer className="w-4 h-4" />
            Imprimer
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Téléchargement du PDF démarré...")}
            className="font-semibold text-xs py-1.5 px-3 flex items-center gap-1"
          >
            <FileDown className="w-4 h-4" />
            Télécharger PDF
          </Button>
          {invoice.status !== "PAYEE" && (
            <Button
              variant="default"
              size="sm"
              onClick={handleMarkAsPaid}
              className="font-bold text-xs py-1.5 px-3 flex items-center gap-1 shadow shadow-primary-500/10"
            >
              <CheckCircle className="w-4 h-4" />
              Solder Prestation
            </Button>
          )}
        </div>
      </div>

      {/* Modern Printable Invoice Design Sheet */}
      <Card className="print:shadow-none print:border-none p-8 sm:p-12 border-neutral-200 shadow-xl rounded-2xl bg-white overflow-hidden relative">
        {/* Background watermark icon for print decoration */}
        <div className="absolute -top-10 -right-10 text-neutral-50/70 select-none pointer-events-none">
          <Activity className="w-48 h-48" />
        </div>

        {/* Invoice Header block */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 relative z-10 border-b border-neutral-100 pb-8">
          {/* Logo & Identity */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="bg-primary-600 p-2.5 rounded-xl text-white shadow-md shadow-primary-500/20">
                <Activity className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-xl text-neutral-900 tracking-tight">NovaBio Lab</span>
            </div>
            <p className="text-xs text-neutral-400 font-semibold leading-relaxed">
              12 Rue des Alouettes, 75008 Paris<br />
              Tél: +33 1 45 67 89 00<br />
              Email: contact@novabio-lab.fr
            </p>
          </div>

          {/* Invoice identifiers */}
          <div className="flex flex-col sm:items-end text-left sm:text-right gap-1.5">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Facture d&apos;Analyses</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900">{invoice.invoice_number}</h2>
            <Badge variant={getStatusVariant(invoice.status)} className="mt-1 uppercase text-[10px] py-1 px-2.5">
              {getStatusLabel(invoice.status)}
            </Badge>
          </div>
        </div>

        {/* Billing Context */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-neutral-100">
          <div>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">Facturé à</span>
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-bold">
                <User className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-sm text-neutral-700">
                <span className="font-extrabold text-neutral-900 text-base">
                  {invoice.patient ? `${invoice.patient.first_name} ${invoice.patient.last_name}` : "Patient Inconnu"}
                </span>
                <span className="mt-1 font-semibold">{invoice.patient?.phone}</span>
                <span className="text-neutral-500">{invoice.patient?.email}</span>
                <span className="text-xs text-neutral-400 mt-1">{invoice.patient?.city}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-3 text-sm text-neutral-600">
            <div className="flex gap-4">
              <span className="font-bold text-neutral-400">Date d&apos;Émission :</span>
              <span className="font-semibold text-neutral-800">{formatDate(invoice.issue_date)}</span>
            </div>
            <div className="flex gap-4">
              <span className="font-bold text-neutral-400">Échéance Règlement :</span>
              <span className="font-semibold text-danger-600">{formatDate(invoice.due_date)}</span>
            </div>
            {invoice.paid_date && (
              <div className="flex gap-4">
                <span className="font-bold text-neutral-400">Date Acquittement :</span>
                <span className="font-bold text-secondary-600">{formatDate(invoice.paid_date)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Exam items table */}
        <div className="py-8">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-4">Analyses & Diagnostics Réalisés</span>
          
          <div className="flex flex-col gap-4 text-sm text-neutral-700">
            {/* Simulated item lines with gorgeous medical dot styling */}
            <div className="flex justify-between items-center gap-2">
              <div className="font-bold text-neutral-800">1. Prestations d&apos;Analyses Cliniques standard</div>
              <div className="flex-1 border-b border-dotted border-neutral-300 mx-2 h-4" />
              <span className="font-bold text-neutral-900">{formatPrice(subtotal)}</span>
            </div>
            <div className="text-xs text-neutral-500 pl-4 italic">
              Dosages, Hématologie, Prélèvements veineux, traitement et diagnostics automatisés
            </div>
          </div>
        </div>

        {/* Invoice Summary Card */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-8 pt-8 border-t border-neutral-100 mt-4 text-sm">
          {/* payment status notes */}
          <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200/50 flex-1 w-full">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-2">Notes & Informations Légales</span>
            <p className="text-xs text-neutral-500 leading-relaxed font-semibold">
              TVA acquittée sur les encaissements. Les examens biologiques sont exonérés selon l&apos;art. 261-4-1° du CGI. En cas de retard de paiement, une pénalité forfaitaire de 40 € est exigible de plein droit.
            </p>
          </div>

          {/* Pricing Totals */}
          <div className="flex flex-col gap-3.5 w-full sm:w-64 text-neutral-600">
            <div className="flex justify-between font-semibold">
              <span>Sous-total HT :</span>
              <span className="font-bold text-neutral-800">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>TVA (10 %) :</span>
              <span className="font-bold text-neutral-800">{formatPrice(taxes)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-neutral-900 border-t border-neutral-200 pt-3">
              <span>NET À PAYER :</span>
              <span className="text-primary-700 text-lg">{formatPrice(invoice.total_amount)}</span>
            </div>

            <div className="flex justify-between font-semibold text-xs border-t border-dashed border-neutral-200 pt-3">
              <span className="text-secondary-700 bg-secondary-50 border border-secondary-200 px-1.5 py-0.5 rounded">RÉGLÉ :</span>
              <span className="font-bold text-secondary-600">{formatPrice(invoice.paid_amount)}</span>
            </div>

            <div className="flex justify-between font-extrabold text-xs">
              <span className="text-danger-700 bg-danger-50 border border-danger-200 px-1.5 py-0.5 rounded">SOLDE DÛ :</span>
              <span className="font-bold text-danger-600">{formatPrice(dues)}</span>
            </div>
          </div>
        </div>

        {/* Payments Histories Vertical Timeline */}
        {invoice.paid_amount > 0 && (
          <div className="mt-12 pt-8 border-t border-neutral-100">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-4 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-secondary-600" />
              Historique des Transactions
            </span>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-600 bg-secondary-50 border border-secondary-100 rounded-xl p-3.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary-500 animate-pulse" />
                  <span>Règlement enregistré le {formatDate(invoice.paid_date || invoice.issue_date)}</span>
                </div>
                <span className="font-mono text-neutral-400">Mode : Carte Bancaire</span>
                <span className="font-bold text-secondary-700">+{formatPrice(invoice.paid_amount)}</span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
