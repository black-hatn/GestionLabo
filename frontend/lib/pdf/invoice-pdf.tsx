/**
 * Générateur de facture PDF — NovaBio Lab
 * Utilise @react-pdf/renderer pour produire une facture officielle A4.
 */
"use client";

import { useState, useEffect } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

/* ── Types ── */
export interface InvoiceForPDF {
  id: string;
  invoice_number: string;
  total_amount: number;
  paid_amount: number;
  status: string;
  issue_date: string;
  due_date: string;
  paid_date?: string;
}

export interface PatientForPDF {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  record_number?: string;
}

export interface PaymentForPDF {
  id: string;
  amount: number;
  method: string;
  reference?: string;
  paid_at: string;
}

/* ── Palette ── */
const C = {
  emerald:  "#10b981",
  dark:     "#0f172a",
  cardBg:   "#1e293b",
  muted:    "#64748b",
  red:      "#ef4444",
  white:    "#f8fafc",
  pureWhite:"#ffffff",
  border:   "#334155",
  lightBg:  "#f1f5f9",
  slate300: "#cbd5e1",
};

/* ── Styles ── */
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: C.pureWhite,
    padding: 0,
  },

  /* Header */
  header: {
    backgroundColor: C.emerald,
    padding: "22 40 18 40",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: { flexDirection: "column" },
  logoName: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: C.pureWhite,
  },
  logoSub: {
    fontSize: 8,
    color: C.dark,
    marginTop: 3,
    letterSpacing: 2,
  },
  headerAddress: {
    fontSize: 8,
    color: C.dark,
    marginTop: 2,
    opacity: 0.8,
  },
  headerRight: { flexDirection: "column", alignItems: "flex-end" },
  docTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: C.pureWhite,
    letterSpacing: 3,
  },
  docSubtitle: {
    fontSize: 9,
    color: C.dark,
    marginTop: 4,
    opacity: 0.85,
  },

  /* Meta row */
  metaRow: {
    backgroundColor: C.dark,
    padding: "10 40",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaCell: { flexDirection: "column", alignItems: "flex-start" },
  metaLabel: { fontSize: 7, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 },
  metaValue: { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.white },

  /* Status badge */
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
    marginTop: 2,
  },
  statusText: { fontSize: 9, fontFamily: "Helvetica-Bold" },

  /* Body */
  body: { padding: "24 40" },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: C.emerald,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 4,
  },

  /* Billing */
  billingBox: {
    backgroundColor: C.lightBg,
    padding: "12 16",
    borderRadius: 3,
    borderLeftWidth: 3,
    borderLeftColor: C.emerald,
  },
  billingName: { fontSize: 13, fontFamily: "Helvetica-Bold", color: C.dark, marginBottom: 4 },
  billingLine: { fontSize: 9, color: C.muted, marginBottom: 2 },

  /* Table */
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.dark,
    padding: "7 10",
    borderRadius: 2,
    marginBottom: 0,
  },
  tableRow: {
    flexDirection: "row",
    padding: "8 10",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tableRowAlt: {
    flexDirection: "row",
    padding: "8 10",
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  colDesc:  { flex: 3, fontSize: 9 },
  colQty:   { flex: 1, fontSize: 9, textAlign: "center" },
  colPU:    { flex: 1.5, fontSize: 9, textAlign: "right" },
  colTotal: { flex: 1.5, fontSize: 9, textAlign: "right" },
  thText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.white },
  tdText: { color: C.dark },

  /* Totals */
  totalsWrapper: { flexDirection: "row", justifyContent: "flex-end", marginTop: 8 },
  totalsBox: {
    width: 220,
    backgroundColor: C.lightBg,
    borderRadius: 3,
    overflow: "hidden",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  totalsRowDark: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: C.dark,
  },
  totalsLabel: { fontSize: 9, color: C.muted },
  totalsValue: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.dark },
  totalsLabelDark: { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.white },
  totalsValueDark: { fontSize: 12, fontFamily: "Helvetica-Bold", color: C.emerald },
  totalsRowRed: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#fff5f5",
  },
  totalsLabelRed: { fontSize: 9, color: C.red },
  totalsValueRed: { fontSize: 9, fontFamily: "Helvetica-Bold", color: C.red },

  /* Payments table */
  payHeader: {
    flexDirection: "row",
    backgroundColor: "#334155",
    padding: "6 10",
    borderRadius: 2,
    marginBottom: 0,
  },
  payRow: {
    flexDirection: "row",
    padding: "7 10",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  payColDate:   { flex: 2, fontSize: 9 },
  payColMode:   { flex: 1.5, fontSize: 9 },
  payColRef:    { flex: 2, fontSize: 9 },
  payColAmount: { flex: 1.5, fontSize: 9, textAlign: "right" },

  /* Footer */
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
  },
  footerLine1: { fontSize: 8, color: C.muted, textAlign: "center", marginBottom: 3 },
  footerLine2: { fontSize: 8, color: C.muted, textAlign: "center", marginBottom: 5 },
  footerBrand: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: C.emerald,
    textAlign: "center",
  },
});

/* ── Utilitaires ── */
function fmt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  } catch { return iso; }
}

function fmtAmount(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " FCFA";
}

function statusColor(status: string): string {
  switch (status) {
    case "PAYEE":     return C.emerald;
    case "EN_RETARD": return C.red;
    case "ENVOYEE":   return "#f59e0b";
    case "ANNULEE":   return C.muted;
    default:          return "#64748b"; // BROUILLON
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "PAYEE":     return "PAYÉE";
    case "EN_RETARD": return "EN RETARD";
    case "ENVOYEE":   return "ENVOYÉE";
    case "ANNULEE":   return "ANNULÉE";
    default:          return "BROUILLON";
  }
}

/* ── Document ── */
export function InvoiceDocument({
  invoice,
  patient,
  payments,
}: {
  invoice: InvoiceForPDF;
  patient: PatientForPDF;
  payments: PaymentForPDF[];
}) {
  const tva = invoice.total_amount * 0.1;
  const ht  = invoice.total_amount / 1.1;
  const balance = invoice.total_amount - invoice.paid_amount;
  const color = statusColor(invoice.status);

  return (
    <Document
      title={`Facture ${invoice.invoice_number} — NovaBio Lab`}
      author="NovaBio Lab Platform"
      subject="Facture de prestations biologiques"
    >
      <Page size="A4" style={styles.page}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.logoName}>NovaBio Lab</Text>
            <Text style={styles.logoSub}>LABORATOIRE D'ANALYSES MÉDICALES</Text>
            <Text style={styles.headerAddress}>123 Avenue de la Santé — N'Djamena, Tchad</Text>
            <Text style={styles.headerAddress}>Tél : +235 99 00 00 00 | contact@novabio.td</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.docTitle}>FACTURE</Text>
            <Text style={styles.docSubtitle}>Document comptable officiel</Text>
          </View>
        </View>

        {/* ── Meta row ── */}
        <View style={styles.metaRow}>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>N° Facture</Text>
            <Text style={styles.metaValue}>{invoice.invoice_number}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>Date d'émission</Text>
            <Text style={styles.metaValue}>{fmt(invoice.issue_date)}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>Échéance</Text>
            <Text style={styles.metaValue}>{fmt(invoice.due_date)}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>Statut</Text>
            <View style={[styles.statusBadge, { backgroundColor: color }]}>
              <Text style={[styles.statusText, { color: C.pureWhite }]}>
                {statusLabel(invoice.status)}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Body ── */}
        <View style={styles.body}>

          {/* Billing */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Facturé à</Text>
            <View style={styles.billingBox}>
              <Text style={styles.billingName}>
                {patient.first_name} {patient.last_name}
              </Text>
              {patient.record_number ? (
                <Text style={styles.billingLine}>N° Dossier : {patient.record_number}</Text>
              ) : null}
              <Text style={styles.billingLine}>Tél : {patient.phone}</Text>
              <Text style={styles.billingLine}>Email : {patient.email}</Text>
              <Text style={styles.billingLine}>Ville : {patient.city}</Text>
            </View>
          </View>

          {/* Services table */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Détail des prestations</Text>

            {/* Table header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.colDesc,  styles.thText]}>Description</Text>
              <Text style={[styles.colQty,   styles.thText]}>Qté</Text>
              <Text style={[styles.colPU,    styles.thText]}>PU HT</Text>
              <Text style={[styles.colTotal, styles.thText]}>Total HT</Text>
            </View>

            {/* Single data row */}
            <View style={styles.tableRow}>
              <Text style={[styles.colDesc,  styles.tdText]}>Analyses biologiques — prestation médicale</Text>
              <Text style={[styles.colQty,   styles.tdText, { textAlign: "center" }]}>1</Text>
              <Text style={[styles.colPU,    styles.tdText, { textAlign: "right" }]}>
                {fmtAmount(ht)}
              </Text>
              <Text style={[styles.colTotal, styles.tdText, { textAlign: "right" }]}>
                {fmtAmount(ht)}
              </Text>
            </View>
          </View>

          {/* Totals */}
          <View style={styles.totalsWrapper}>
            <View style={styles.totalsBox}>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Sous-total HT</Text>
                <Text style={styles.totalsValue}>{fmtAmount(ht)}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>TVA 10 %</Text>
                <Text style={styles.totalsValue}>{fmtAmount(tva)}</Text>
              </View>
              <View style={styles.totalsRowDark}>
                <Text style={styles.totalsLabelDark}>NET À PAYER</Text>
                <Text style={styles.totalsValueDark}>{fmtAmount(invoice.total_amount)}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Déjà réglé</Text>
                <Text style={[styles.totalsValue, { color: C.emerald }]}>
                  {fmtAmount(invoice.paid_amount)}
                </Text>
              </View>
              {balance > 0 ? (
                <View style={styles.totalsRowRed}>
                  <Text style={styles.totalsLabelRed}>Solde dû</Text>
                  <Text style={styles.totalsValueRed}>{fmtAmount(balance)}</Text>
                </View>
              ) : (
                <View style={styles.totalsRow}>
                  <Text style={[styles.totalsLabel, { color: C.emerald }]}>Solde dû</Text>
                  <Text style={[styles.totalsValue, { color: C.emerald }]}>0,00 FCFA</Text>
                </View>
              )}
            </View>
          </View>

          {/* Payments */}
          {payments.length > 0 && (
            <View style={[styles.section, { marginTop: 20 }]}>
              <Text style={styles.sectionTitle}>Historique des règlements</Text>
              <View style={styles.payHeader}>
                <Text style={[styles.payColDate,   styles.thText]}>Date</Text>
                <Text style={[styles.payColMode,   styles.thText]}>Mode</Text>
                <Text style={[styles.payColRef,    styles.thText]}>Référence</Text>
                <Text style={[styles.payColAmount, styles.thText]}>Montant</Text>
              </View>
              {payments.map((p, i) => (
                <View key={p.id} style={i % 2 === 0 ? styles.payRow : styles.tableRowAlt}>
                  <Text style={[styles.payColDate,   { fontSize: 9, color: C.dark }]}>{fmt(p.paid_at)}</Text>
                  <Text style={[styles.payColMode,   { fontSize: 9, color: C.dark }]}>{p.method}</Text>
                  <Text style={[styles.payColRef,    { fontSize: 9, color: C.muted }]}>{p.reference || "—"}</Text>
                  <Text style={[styles.payColAmount, { fontSize: 9, color: C.dark, fontFamily: "Helvetica-Bold" }]}>
                    {fmtAmount(p.amount)}
                  </Text>
                </View>
              ))}
            </View>
          )}

        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerLine1}>
            Règlement par virement : IBAN — TD00 0000 0000 0000 0000 0000 000 | BIC : NOVBTDNJ
          </Text>
          <Text style={styles.footerLine2}>
            Toute contestation doit être adressée dans les 30 jours suivant la réception de cette facture.
            Conformément à la loi, aucun escompte ne sera accordé pour paiement anticipé.
          </Text>
          <Text style={styles.footerBrand}>Merci de votre confiance — NovaBio Lab</Text>
        </View>

      </Page>
    </Document>
  );
}

/* ── Bouton de téléchargement ── */
export function DownloadInvoicePDFButton({
  invoice,
  patient,
  payments,
}: {
  invoice: InvoiceForPDF;
  patient: PatientForPDF;
  payments: PaymentForPDF[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const filename = `Facture-${invoice.invoice_number}-${patient.last_name}.pdf`;

  return (
    <PDFDownloadLink
      document={<InvoiceDocument invoice={invoice} patient={patient} payments={payments} />}
      fileName={filename}
    >
      {({ loading }) => (
        <button className="flex items-center gap-2 px-4 py-2 border-2 border-slate-600 text-slate-300 hover:border-emerald-500 hover:text-emerald-400 text-sm font-bold transition-all">
          {loading ? "Génération..." : "⬇ Télécharger PDF"}
        </button>
      )}
    </PDFDownloadLink>
  );
}
