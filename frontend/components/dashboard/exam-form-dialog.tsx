"use client";

import { useState, useEffect } from "react";
import { X, Beaker, Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ExamData } from "@/hooks/use-exam-actions";

interface Props {
  mode: "create" | "edit";
  exam?: ExamData | null;
  open: boolean;
  onClose: () => void;
  saving: boolean;
  error: string | null;
  onCreate: (payload: {
    name: string;
    description?: string;
    unit?: string;
    reference_values?: Record<string, unknown>;
  }) => Promise<void>;
  onUpdate: (id: string, payload: {
    name?: string;
    description?: string;
    unit?: string;
    is_active?: boolean;
    reference_values?: Record<string, unknown>;
  }) => Promise<void>;
}

/**
 * ExamFormDialog — Dialog create/edit pour les examens.
 * Reçoit les handlers du hook useExamActions.
 */
export function ExamFormDialog({
  mode, exam, open, onClose, saving, error, onCreate, onUpdate,
}: Props) {
  const [name, setName]           = useState("");
  const [desc, setDesc]           = useState("");
  const [unit, setUnit]           = useState("");
  const [isActive, setIsActive]   = useState(true);
  // Valeurs de référence : liste de paires clé/valeur
  const [refs, setRefs] = useState<{ key: string; val: string }[]>([]);

  // Sync form when exam changes (edit mode)
  useEffect(() => {
    if (mode === "edit" && exam) {
      setName(exam.name);
      setDesc(exam.description ?? "");
      setUnit(exam.unit ?? "");
      setIsActive(exam.is_active);
      const entries = exam.reference_values
        ? Object.entries(exam.reference_values).map(([key, val]) => ({ key, val: String(val) }))
        : [];
      setRefs(entries);
    } else {
      setName(""); setDesc(""); setUnit(""); setIsActive(true); setRefs([]);
    }
  }, [mode, exam, open]);

  if (!open) return null;

  const buildRefValues = (): Record<string, unknown> =>
    Object.fromEntries(refs.filter(r => r.key.trim()).map(r => [r.key.trim(), r.val]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const refValues = buildRefValues();
    if (mode === "create") {
      await onCreate({ name, description: desc || undefined, unit: unit || undefined, reference_values: refValues });
    } else if (exam) {
      await onUpdate(exam.id, { name, description: desc || undefined, unit: unit || undefined, is_active: isActive, reference_values: refValues });
    }
  };

  const addRef    = () => setRefs(r => [...r, { key: "", val: "" }]);
  const removeRef = (i: number) => setRefs(r => r.filter((_, idx) => idx !== i));
  const updateRef = (i: number, field: "key" | "val", value: string) =>
    setRefs(r => r.map((item, idx) => idx === i ? { ...item, [field]: value } : item));

  const isEdit = mode === "edit";

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
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 flex items-center justify-center">
              <Beaker className="w-4.5 h-4.5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold dark:text-white text-slate-900">
                {isEdit ? "Modifier l'examen" : "Nouvel examen"}
              </h2>
              <p className="text-xs dark:text-slate-500 text-slate-400">
                {isEdit ? exam?.name : "Ajouter au catalogue"}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl dark:hover:bg-white/[0.06] hover:bg-slate-100 dark:text-slate-500 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1.5">Nom de l&apos;examen *</label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex : Numération Formule Sanguine"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1.5">Description</label>
              <textarea
                rows={2}
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Description optionnelle..."
                className="w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40
                  dark:bg-white/[0.03] dark:border-white/[0.08] dark:text-slate-200 dark:placeholder-slate-600
                  bg-white border-slate-200 text-slate-800 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1.5">Unité de mesure</label>
              <Input value={unit} onChange={e => setUnit(e.target.value)} placeholder="Ex : g/L, mmol/L, UI/L" />
            </div>

            {/* Valeurs de référence */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold dark:text-slate-400 text-slate-600">Valeurs de référence</label>
                <button type="button" onClick={addRef}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
                  <Plus className="w-3 h-3" /> Ajouter
                </button>
              </div>
              <div className="space-y-2">
                {refs.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={r.key}
                      onChange={e => updateRef(i, "key", e.target.value)}
                      placeholder="Clé (ex: homme)"
                      className="flex-1"
                    />
                    <Input
                      value={r.val}
                      onChange={e => updateRef(i, "val", e.target.value)}
                      placeholder="Valeur (ex: 13–17 g/dL)"
                      className="flex-1"
                    />
                    <button type="button" onClick={() => removeRef(i)}
                      className="p-2 rounded-lg dark:hover:bg-red-500/10 hover:bg-red-50 text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {refs.length === 0 && (
                  <p className="text-xs dark:text-slate-600 text-slate-400 italic">Aucune valeur de référence — cliquez Ajouter</p>
                )}
              </div>
            </div>

            {isEdit && (
              <div className="flex items-center gap-3 p-3 rounded-xl
                  dark:bg-white/[0.03] dark:border dark:border-white/[0.05]
                  bg-slate-50 border border-slate-100">
                <label className="text-xs font-semibold dark:text-slate-400 text-slate-600">Statut dans le catalogue</label>
                <label className="relative inline-flex items-center cursor-pointer ml-auto">
                  <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="sr-only peer" />
                  <div className="w-10 h-5 bg-slate-700 rounded-full peer peer-checked:bg-emerald-500 transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </label>
                <span className={`text-xs font-bold ${isActive ? "text-emerald-400" : "text-slate-500"}`}>
                  {isActive ? "Actif" : "Inactif"}
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 dark:border-t dark:border-white/[0.07] border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 btn-ghost h-10">
              Annuler
            </Button>
            <Button type="submit" disabled={saving} className="flex-1 btn-emerald h-10 text-sm font-bold">
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {isEdit ? "Enregistrer" : "Créer l'examen"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
