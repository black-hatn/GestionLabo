"use client";

import { X, Brain, TrendingUp, AlertTriangle, CheckCircle2, Download, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getAnalyticsSummary, type AnalyticsSummary } from "@/services/api/analytics";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ReportDialog({ open, onClose }: Props) {
  const [summary,     setSummary]     = useState<AnalyticsSummary | null>(null);
  const [loading,     setLoading]     = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getAnalyticsSummary()
      .then(setSummary)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  const fmt = (v: number) =>
    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
    : v >= 1_000   ? `${(v / 1_000).toFixed(0)}K`
    : String(v);

  const kpis = [
    {
      label:  "Patients",
      value:  fmt(summary?.total_patients ?? 0),
      delta:  `${summary?.active_patients ?? 0} actifs`,
      up: true,
    },
    {
      label:  "Examens",
      value:  fmt(summary?.total_exam_requests ?? 0),
      delta:  `${summary?.exam_requests_by_status?.EN_COURS ?? 0} en cours`,
      up: true,
    },
    {
      label:  "Critiques",
      value:  String(summary?.invoices_by_status?.EN_RETARD ?? 0),
      delta:  "factures en retard",
      up: false,
    },
  ];

  const sections = [
    {
      icon: TrendingUp,
      color: "emerald",
      title: "Activité Générale",
      items: [
        `${summary?.total_patients ?? "—"} patients au total, ${summary?.active_patients ?? "—"} actifs`,
        `${summary?.total_exam_requests ?? "—"} demandes d'examens enregistrées`,
        `${summary?.total_invoices ?? "—"} factures — revenu encaissé : ${fmt(summary?.total_revenue ?? 0)} XOF`,
      ],
    },
    {
      icon: AlertTriangle,
      color: "amber",
      title: "Points d'Attention",
      items: [
        ...(summary?.invoices_by_status?.EN_RETARD
          ? [`${summary.invoices_by_status.EN_RETARD} facture(s) EN_RETARD — relance recommandée`]
          : ["Aucune facture en retard"]),
        ...(summary?.exam_requests_by_status?.EN_COURS
          ? [`${summary.exam_requests_by_status.EN_COURS} demande(s) d'examen en cours`]
          : ["Aucune demande en cours"]),
        `${summary?.pending_revenue ?? 0} XOF de revenus en attente de paiement`,
      ],
    },
    {
      icon: CheckCircle2,
      color: "blue",
      title: "Recommandations",
      items: [
        "Valider les résultats en attente pour débloquer la facturation",
        "Relancer les factures EN_RETARD par email depuis la page Facturation",
        "Consulter la page Analytique pour les tendances d'activité détaillées",
      ],
    },
  ];

  const colorMap: Record<string, { bg: string; icon: string; dot: string }> = {
    emerald: { bg: "bg-emerald-500/10", icon: "text-emerald-400", dot: "bg-emerald-400" },
    amber:   { bg: "bg-amber-500/10",   icon: "text-amber-400",   dot: "bg-amber-400"   },
    blue:    { bg: "bg-blue-500/10",    icon: "text-blue-400",    dot: "bg-blue-400"    },
  };

  const handleDownload = async () => {
    setDownloading(true);
    // Génération d'un CSV simple exportable
    const lines = [
      ["Rapport NovaBio Lab", new Date().toLocaleDateString("fr-FR")],
      [],
      ["Indicateur", "Valeur"],
      ["Patients total", summary?.total_patients ?? 0],
      ["Patients actifs", summary?.active_patients ?? 0],
      ["Demandes d'examens", summary?.total_exam_requests ?? 0],
      ["Factures total", summary?.total_invoices ?? 0],
      ["Revenu encaissé (XOF)", summary?.total_revenue ?? 0],
      ["Revenu en attente (XOF)", summary?.pending_revenue ?? 0],
      ["Factures en retard", summary?.invoices_by_status?.EN_RETARD ?? 0],
    ];
    const csv = lines.map(r => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `rapport-novabio-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-scale-in
          dark:bg-[#0c1828] dark:border dark:border-white/[0.08] bg-white border border-slate-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4
            dark:border-b dark:border-white/[0.07] border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <Brain className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold dark:text-white text-slate-900">Rapport du Jour</h2>
              <p className="text-xs dark:text-slate-500 text-slate-400">
                {new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl dark:hover:bg-white/[0.06] hover:bg-slate-100 dark:text-slate-500 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* KPI row */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 px-6 py-4
              dark:border-b dark:border-white/[0.05] border-b border-slate-100">
            {kpis.map(({ label, value, delta, up }) => (
              <div key={label} className="text-center">
                <div className="text-xl font-extrabold dark:text-white text-slate-900 leading-none">{value}</div>
                <div className="text-[10px] dark:text-slate-500 text-slate-400 mt-0.5">{label}</div>
                <div className={`text-[10px] font-bold mt-1 ${up ? "text-emerald-400" : "text-amber-400"}`}>
                  {up ? "▲" : "⚠"} {delta}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sections */}
        <div className="px-6 py-4 space-y-4 max-h-[340px] overflow-y-auto">
          {sections.map(({ icon: Icon, color, title, items }) => {
            const c = colorMap[color];
            return (
              <div key={title} className={`rounded-xl p-4 ${c.bg}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`w-4 h-4 ${c.icon}`} />
                  <span className={`text-xs font-bold ${c.icon}`}>{title}</span>
                </div>
                <ul className="space-y-1.5">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs dark:text-slate-300 text-slate-600">
                      <div className={`w-1.5 h-1.5 rounded-full ${c.dot} mt-1 shrink-0`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4
            dark:border-t dark:border-white/[0.07] border-t border-slate-100">
          <Button variant="outline" onClick={onClose} className="flex-1 h-10 text-sm">
            Fermer
          </Button>
          <Button onClick={handleDownload} disabled={downloading || loading}
            className="flex-1 btn-emerald h-10 text-sm font-bold gap-2">
            {downloading
              ? <><Loader2 className="w-4 h-4 animate-spin" />Génération...</>
              : <><Download className="w-4 h-4" />Télécharger CSV</>
            }
          </Button>
        </div>
      </div>
    </div>
  );
}
