/**
 * Générateur de rapport de résultat PDF — NovaBio Lab
 * Utilise @react-pdf/renderer pour produire un compte-rendu d'analyse A4.
 */
"use client";

import { useState, useEffect } from "react";
import {
  Document, Page, Text, View, StyleSheet, PDFDownloadLink,
} from "@react-pdf/renderer";
import type { ResultItem } from "@/services/api/result";

/* ── Standalone type (for dynamic import usage without full ResultItem) ── */
export interface ResultForPDF {
  id: string;
  value: string;
  reference_value?: string | null;
  status: string;
  notes?: string | null;
  tested_at: string;
  exam_name?: string;
  exam_unit?: string;
  patient_name?: string;
  record_number?: string;
  tested_by_name?: string;
}

/* ── Palette NovaBio ── */
const COLORS = {
  emerald:   "#10b981",
  emeraldDk: "#059669",
  slate900:  "#0f172a",
  slate700:  "#334155",
  slate500:  "#64748b",
  slate300:  "#cbd5e1",
  white:     "#ffffff",
  pureWhite: "#ffffff",
  lightBg:   "#f1f5f9",
  red:       "#ef4444",
  amber:     "#f59e0b",
  orange:    "#f97316",
  green:     "#22c55e",
  border:    "#e2e8f0",
  dark:      "#0f172a",
  muted:     "#64748b",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: COLORS.white,
    padding: 0,
  },

  /* ── Header ── */
  header: {
    backgroundColor: COLORS.slate900,
    padding: "24 40 20 40",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: { flexDirection: "column" },
  logoName: { fontSize: 22, fontFamily: "Helvetica-Bold", color: COLORS.white },
  logoNameAccent: { color: COLORS.emerald },
  logoSub: { fontSize: 8, color: COLORS.slate500, marginTop: 2, letterSpacing: 2 },
  headerRight: { flexDirection: "column", alignItems: "flex-end" },
  docTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", color: COLORS.emerald },
  docDate:  { fontSize: 9, color: COLORS.slate500, marginTop: 3 },

  /* ── Status badge ── */
  statusBar: {
    paddingHorizontal: 40,
    paddingVertical: 10,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: 10, fontFamily: "Helvetica-Bold" },

  /* ── Body ── */
  body: { padding: "24 40" },

  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.emerald,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 4,
  },

  row: { flexDirection: "row", marginBottom: 6 },
  label: { fontSize: 10, color: COLORS.slate500, width: 140 },
  value: { fontSize: 10, color: COLORS.slate700, flex: 1, fontFamily: "Helvetica-Bold" },

  /* ── Result highlight ── */
  resultBox: {
    borderWidth: 1,
    borderRadius: 4,
    padding: "12 16",
    marginVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultValue: { fontSize: 28, fontFamily: "Helvetica-Bold" },
  resultRef:   { fontSize: 10, color: COLORS.slate500, marginTop: 4 },
  resultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 2,
  },
  resultBadgeText: { fontSize: 11, fontFamily: "Helvetica-Bold", color: COLORS.white },

  /* ── Notes ── */
  notesBox: {
    backgroundColor: "#f8fafc",
    borderLeftWidth: 3,
    borderLeftColor: COLORS.emerald,
    padding: "8 12",
    borderRadius: 2,
    marginTop: 4,
  },
  notesText: { fontSize: 10, color: COLORS.slate700, lineHeight: 1.5 },

  /* ── Footer ── */
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 8, color: COLORS.slate500 },
});

/* ── Utilitaires ── */
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit", month: "long", year: "numeric",
    });
  } catch { return iso; }
}

function statusColor(status: string): string {
  switch (status.toUpperCase()) {
    case "CRITIQUE": return COLORS.red;
    case "ANORMAL":  return COLORS.orange;
    case "NORMAL":   return COLORS.green;
    default:         return COLORS.muted;
  }
}

function statusLabel(status: string): string {
  switch (status.toUpperCase()) {
    case "CRITIQUE": return "CRITIQUE";
    case "ANORMAL":  return "ANORMAL";
    case "NORMAL":   return "NORMAL";
    default:         return status.toUpperCase();
  }
}

/* ── Document PDF ── */
export function ResultReport({ result }: { result: ResultItem | ResultForPDF }) {
  const color = statusColor(result.status);

  return (
    <Document
      title={`Rapport Résultat — NovaBio Lab`}
      author="NovaBio Lab Platform"
      subject="Résultat d'analyse biologique"
    >
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.logoName}>NovaBio Lab</Text>
            <Text style={styles.logoSub}>LABORATOIRE D'ANALYSES MÉDICALES</Text>
            <Text style={[styles.logoSub, { letterSpacing: 0, marginTop: 2 }]}>
              Quartier Moursal, N'Djamena, Tchad
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.docTitle}>RAPPORT DE RÉSULTAT</Text>
            <Text style={styles.docDate}>
              Émis le {formatDate(result.tested_at)}
            </Text>
            <Text style={[styles.docDate, { marginTop: 2 }]}>
              Réf. {result.id.slice(0, 8).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Status bar */}
        <View style={styles.statusBar}>
          <View style={[styles.statusDot, { backgroundColor: color }]} />
          <Text style={[styles.statusLabel, { color }]}>
            Statut : {statusLabel(result.status)}
          </Text>
        </View>

        {/* Body */}
        <View style={styles.body}>

          {/* Patient */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations Patient</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Patient</Text>
              <Text style={styles.value}>{result.patient_name || "—"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>N° Dossier</Text>
              <Text style={styles.value}>{result.record_number || "—"}</Text>
            </View>
          </View>

          {/* Analyse */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Analyse prescrite</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Analyse</Text>
              <Text style={styles.value}>{result.exam_name || "—"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Unité</Text>
              <Text style={styles.value}>{result.exam_unit || "—"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Technicien</Text>
              <Text style={styles.value}>{result.tested_by_name || "—"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Date d'analyse</Text>
              <Text style={styles.value}>{formatDate(result.tested_at)}</Text>
            </View>
          </View>

          {/* Résultat */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Résultat</Text>
            <View style={[styles.resultBox, { borderColor: color, backgroundColor: `${color}08` }]}>
              <View>
                <Text style={[styles.resultValue, { color }]}>
                  {result.value} {result.exam_unit || ""}
                </Text>
                <Text style={styles.resultRef}>
                  Valeur de référence : {result.reference_value || "Non renseignée"}
                </Text>
              </View>
              <View style={[styles.resultBadge, { backgroundColor: color }]}>
                <Text style={styles.resultBadgeText}>{statusLabel(result.status)}</Text>
              </View>
            </View>
          </View>

          {/* Notes */}
          {result.notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Observations cliniques</Text>
              <View style={styles.notesBox}>
                <Text style={styles.notesText}>{result.notes}</Text>
              </View>
            </View>
          )}

          {/* Validation */}
          <View style={[styles.section, { marginTop: 20 }]}>
            <Text style={styles.sectionTitle}>Validation</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Validé par</Text>
              <Text style={styles.value}>{result.tested_by_name || "Technicien de laboratoire"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Signature électronique</Text>
              <Text style={styles.value}>NovaBio Lab — Certifié conforme</Text>
            </View>
          </View>

        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            NovaBio Lab — Quartier Moursal, N'Djamena, Tchad — Tél : +235 99 00 00 00
          </Text>
          <Text style={styles.footerText}>
            Ce document est généré automatiquement et constitue un résultat officiel.
          </Text>
          <Text style={styles.footerText}>Page 1/1</Text>
        </View>

      </Page>
    </Document>
  );
}

/* ── Alias: ResultReportDocument (required export) ── */
export function ResultReportDocument({ result }: { result: ResultForPDF }) {
  return <ResultReport result={result} />;
}

/* ── Bouton de téléchargement (legacy — accepts full ResultItem) ── */
export function DownloadResultPDFButton({
  result,
  className = "",
}: {
  result: ResultItem | ResultForPDF;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const filename = `NovaBio-Resultat-${(result.patient_name ?? result.id.slice(0, 8)).replace(/\s+/g, "-")}-${new Date(result.tested_at).toISOString().split("T")[0]}.pdf`;

  return (
    <PDFDownloadLink
      document={<ResultReport result={result} />}
      fileName={filename}
    >
      {({ loading }) => (
        <span className={className}>
          {loading ? "Génération…" : "Télécharger PDF"}
        </span>
      )}
    </PDFDownloadLink>
  );
}

/* ── ResultDownloadButton (standalone, for dynamic import in row) ── */
export function ResultDownloadButton({
  result,
  className,
}: {
  result: ResultForPDF;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const safeName = (result.patient_name ?? result.id).replace(/\s+/g, "-");
  const safeExam = (result.exam_name ?? "analyse").replace(/\s+/g, "-");
  const filename = `Resultat-${safeExam}-${safeName}.pdf`;

  return (
    <PDFDownloadLink
      document={<ResultReportDocument result={result} />}
      fileName={filename}
      className={className}
    >
      {({ loading }) => (loading ? "Génération..." : "Télécharger PDF")}
    </PDFDownloadLink>
  );
}
