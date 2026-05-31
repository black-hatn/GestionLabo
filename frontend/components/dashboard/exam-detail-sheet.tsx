"use client";

import { X, Beaker, CheckCircle2, XCircle, Calendar, Hash, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExamData } from "@/hooks/use-exam-actions";

interface Props {
  exam: ExamData | null;
  open: boolean;
  onClose: () => void;
  onEdit: (exam: ExamData) => void;
  canEdit?: boolean;
}

/**
 * ExamDetailSheet — panneau latéral (slide-in) pour visualiser les détails
 * d'un examen sans quitter la page. Pattern "Sheet" de shadcn/ui.
 */
export function ExamDetailSheet({ exam, open, onClose, onEdit, canEdit = true }: Props) {
  if (!open || !exam) return null;

  const refValues = exam.reference_values
    ? Object.entries(exam.reference_values)
    : [];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet */}
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md
          dark:bg-[#0c1828] dark:border-l dark:border-white/[0.07]
          bg-white border-l border-slate-200
          flex flex-col shadow-2xl animate-slide-in-right">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4
            dark:border-b dark:border-white/[0.07]
            border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
              <Beaker className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="font-bold dark:text-white text-slate-900 leading-tight">{exam.name}</h2>
              <p className="text-xs dark:text-slate-500 text-slate-400">Détails de l&apos;examen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl dark:hover:bg-white/[0.06] hover:bg-slate-100 dark:text-slate-500 text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Status badge */}
          <div className="flex items-center gap-2">
            {exam.is_active ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" /> Actif dans le catalogue
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                <XCircle className="w-3 h-3" /> Inactif
              </span>
            )}
          </div>

          {/* Fields */}
          <div className="space-y-3">
            {[
              { icon: Hash,          label: "Identifiant",     value: exam.id,          mono: true },
              { icon: FlaskConical,  label: "Unité de mesure", value: exam.unit || "—" },
              { icon: Calendar,      label: "Créé le",         value: new Date(exam.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) },
            ].map(({ icon: Icon, label, value, mono }) => (
              <div key={label} className="flex items-start gap-3 p-3 rounded-xl
                  dark:bg-white/[0.03] dark:border dark:border-white/[0.05]
                  bg-slate-50 border border-slate-100">
                <Icon className="w-4 h-4 dark:text-slate-500 text-slate-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold dark:text-slate-500 text-slate-400 uppercase tracking-wide mb-0.5">{label}</div>
                  <div className={`text-sm dark:text-slate-200 text-slate-800 break-all ${mono ? "font-mono text-xs" : "font-medium"}`}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          {exam.description && (
            <div className="p-4 rounded-xl dark:bg-white/[0.03] dark:border dark:border-white/[0.05] bg-slate-50 border border-slate-100">
              <div className="text-[10px] font-semibold dark:text-slate-500 text-slate-400 uppercase tracking-wide mb-2">Description</div>
              <p className="text-sm dark:text-slate-300 text-slate-700 leading-relaxed">{exam.description}</p>
            </div>
          )}

          {/* Reference values */}
          <div className="p-4 rounded-xl dark:bg-white/[0.03] dark:border dark:border-white/[0.05] bg-slate-50 border border-slate-100">
            <div className="text-[10px] font-semibold dark:text-slate-500 text-slate-400 uppercase tracking-wide mb-3">
              Valeurs de Référence
            </div>
            {refValues.length === 0 ? (
              <p className="text-xs dark:text-slate-600 text-slate-400">Aucune valeur de référence définie</p>
            ) : (
              <div className="space-y-2">
                {refValues.map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="font-medium dark:text-slate-400 text-slate-500 capitalize">{key}</span>
                    <span className="font-bold dark:text-white text-slate-900">{String(val)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 dark:border-t dark:border-white/[0.07] border-t border-slate-100 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 btn-ghost h-10">
            Fermer
          </Button>
          {canEdit && (
            <Button
              onClick={() => { onClose(); onEdit(exam); }}
              className="flex-1 btn-emerald h-10 text-sm font-bold"
            >
              Modifier
            </Button>
          )}
        </div>
      </aside>
    </>
  );
}
