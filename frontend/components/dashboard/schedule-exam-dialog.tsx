"use client";

import { useState } from "react";
import { X, Calendar, FlaskConical, User, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Step = "form" | "success";

export function ScheduleExamDialog({ open, onClose }: Props) {
  const [step, setStep]       = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [form, setForm]       = useState({
    patient:   "",
    exam:      "",
    date:      "",
    time:      "",
    notes:     "",
  });

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call — remplace par examRequestService.create() plus tard
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setStep("success");
  };

  const handleClose = () => {
    setStep("form");
    setForm({ patient: "", exam: "", date: "", time: "", notes: "" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-scale-in
          dark:bg-[#0c1828] dark:border dark:border-white/[0.08]
          bg-white border border-slate-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4
            dark:border-b dark:border-white/[0.07]
            border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <Calendar className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold dark:text-white text-slate-900">Planifier un Examen</h2>
              <p className="text-xs dark:text-slate-500 text-slate-400">Nouvelle demande d&apos;examen</p>
            </div>
          </div>
          <button onClick={handleClose}
            className="p-2 rounded-xl dark:hover:bg-white/[0.06] hover:bg-slate-100 dark:text-slate-500 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === "success" ? (
          <div className="px-6 py-12 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center animate-scale-in">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg dark:text-white text-slate-900 mb-1">Examen planifié !</h3>
              <p className="text-sm dark:text-slate-400 text-slate-500">
                La demande pour <strong className="dark:text-white text-slate-800">{form.patient}</strong> a été créée avec succès.
              </p>
            </div>
            <Button onClick={handleClose} className="btn-emerald mt-2 px-8 h-10">Fermer</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1.5">
                <User className="w-3 h-3 inline mr-1" />Patient *
              </label>
              <Input
                placeholder="Nom du patient ou numéro de dossier"
                value={form.patient}
                onChange={e => setForm(f => ({ ...f, patient: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1.5">
                <FlaskConical className="w-3 h-3 inline mr-1" />Type d&apos;examen *
              </label>
              <Input
                placeholder="Ex : Numération Formule Sanguine"
                value={form.exam}
                onChange={e => setForm(f => ({ ...f, exam: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1.5">Date *</label>
                <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1.5">Heure</label>
                <Input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1.5">Notes cliniques</label>
              <textarea
                rows={2}
                placeholder="Informations cliniques pertinentes..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40
                  dark:bg-white/[0.03] dark:border-white/[0.08] dark:text-slate-200 dark:placeholder-slate-600
                  bg-white border-slate-200 text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1 btn-ghost h-10">
                Annuler
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 btn-emerald h-10 text-sm font-bold">
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Planifier
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
