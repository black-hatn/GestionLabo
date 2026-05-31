"use client";

import { X, Brain, TrendingUp, AlertTriangle, CheckCircle2, Activity, Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
}

const REPORT_SECTIONS = [
  {
    icon: TrendingUp,
    color: "emerald",
    title: "Activité Générale",
    items: [
      "Activité stable — +12.5% de patients actifs ce mois",
      "Taux de traitement des examens : 94.3% (objectif : 90%)",
      "Délai moyen de rendu des résultats : 3h42 (−18min vs mois précédent)",
    ],
  },
  {
    icon: AlertTriangle,
    color: "amber",
    title: "Points d'Attention",
    items: [
      "3 résultats CRITIQUE en attente de validation biologique",
      "2 factures EN_RETARD — relance automatique recommandée",
      "1 examen sans résultat depuis plus de 48h (Dossier PAT-2024-0892)",
    ],
  },
  {
    icon: CheckCircle2,
    color: "blue",
    title: "Recommandations IA",
    items: [
      "Augmenter la capacité d'analyse le mardi matin (+34% de demandes)",
      "Regrouper les prélèvements sanguins par plage horaire pour optimiser",
      "Activer les rappels automatiques pour les résultats critiques",
    ],
  },
];

export function ReportDialog({ open, onClose }: Props) {
  const [downloading, setDownloading] = useState(false);

  if (!open) return null;

  const handleDownload = async () => {
    setDownloading(true);
    // Simulate PDF generation
    await new Promise(r => setTimeout(r, 1200));
    setDownloading(false);
    // In production: call an API to generate and download PDF
    alert("PDF généré — intégration API PDF à connecter");
  };

  const colorMap: Record<string, { bg: string; icon: string; dot: string }> = {
    emerald: { bg: "bg-emerald-500/10 dark:bg-emerald-500/10",  icon: "text-emerald-400",  dot: "bg-emerald-400" },
    amber:   { bg: "bg-amber-500/10 dark:bg-amber-500/10",      icon: "text-amber-400",    dot: "bg-amber-400" },
    blue:    { bg: "bg-blue-500/10 dark:bg-blue-500/10",        icon: "text-blue-400",     dot: "bg-blue-400" },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-scale-in
          dark:bg-[#0c1828] dark:border dark:border-white/[0.08]
          bg-white border border-slate-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4
            dark:border-b dark:border-white/[0.07]
            border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <Brain className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold dark:text-white text-slate-900">Rapport IA du Jour</h2>
              <p className="text-xs dark:text-slate-500 text-slate-400">
                Généré le {new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl dark:hover:bg-white/[0.06] hover:bg-slate-100 dark:text-slate-500 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-3 gap-3 px-6 py-4 dark:border-b dark:border-white/[0.05] border-b border-slate-100">
          {[
            { label: "Patients", value: "1 250", delta: "+12.5%", up: true },
            { label: "Examens",  value: "3 420",  delta: "+8.3%",  up: true },
            { label: "Critiques", value: "3",    delta: "action", up: false },
          ].map(({ label, value, delta, up }) => (
            <div key={label} className="text-center">
              <div className="text-xl font-extrabold dark:text-white text-slate-900 leading-none">{value}</div>
              <div className="text-[10px] dark:text-slate-500 text-slate-400 mt-0.5">{label}</div>
              <div className={`text-[10px] font-bold mt-1 ${up ? "text-emerald-400" : "text-amber-400"}`}>
                {up ? "▲" : "⚠"} {delta}
              </div>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="px-6 py-4 space-y-4 max-h-[340px] overflow-y-auto">
          {REPORT_SECTIONS.map(({ icon: Icon, color, title, items }) => {
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
        <div className="flex gap-3 px-6 py-4 dark:border-t dark:border-white/[0.07] border-t border-slate-100">
          <Button variant="outline" onClick={onClose} className="flex-1 btn-ghost h-10 text-sm">
            Fermer
          </Button>
          <Button onClick={handleDownload} disabled={downloading} className="flex-1 btn-emerald h-10 text-sm font-bold gap-2">
            {downloading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Génération...</>
              : <><Download className="w-4 h-4" /> Télécharger PDF</>
            }
          </Button>
        </div>
      </div>
    </div>
  );
}
