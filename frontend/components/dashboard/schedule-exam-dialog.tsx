"use client";

import { useState, useEffect } from "react";
import { X, Calendar, FlaskConical, User, Loader2, CheckCircle2, AlertCircle, Beaker } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/auth-store";
import { useToastStore } from "@/lib/toast-store";
import patientService, { type Patient } from "@/services/api/patient";
import examService, { type Exam } from "@/services/api/exam";
import examRequestService from "@/services/api/exam-request";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Step = "form" | "success";

const SELECT_CLS =
  "w-full h-10 rounded-xl border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 " +
  "dark:bg-white/[0.03] dark:border-white/[0.08] dark:text-slate-200 bg-white border-slate-200 text-slate-800";

export function ScheduleExamDialog({ open, onClose }: Props) {
  const user  = useAuthStore(s => s.user);
  const toast = useToastStore();

  const [step, setStep]       = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [exams, setExams]       = useState<Exam[]>([]);

  const [patientId,   setPatientId]   = useState("");
  const [examId,      setExamId]      = useState("");
  const [sampleType,  setSampleType]  = useState("");
  const [clinicalInfo, setClinical]   = useState("");

  // created exam name/patient shown on success screen
  const [createdPatientName, setCreatedPatientName] = useState("");

  /* ── Load lists on open ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!open) return;
    setLoadingData(true);
    Promise.all([
      patientService.getPatients(1, 200),
      examService.getExams(1, 200),
    ])
      .then(([pRes, eRes]) => {
        setPatients(pRes.items.filter(p => p.is_active));
        setExams(eRes.items.filter(e => e.is_active));
      })
      .catch(() => setError("Impossible de charger les listes. Réessayez."))
      .finally(() => setLoadingData(false));
  }, [open]);

  if (!open) return null;

  const reset = () => {
    setStep("form");
    setPatientId("");
    setExamId("");
    setSampleType("");
    setClinical("");
    setError(null);
    setCreatedPatientName("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) { setError("Utilisateur non identifié."); return; }
    setLoading(true);
    setError(null);
    try {
      await examRequestService.createExamRequest({
        patient_id:   patientId,
        doctor_id:    user.id,
        exam_id:      examId,
        sample_type:  sampleType,
        clinical_info: clinicalInfo || undefined,
      });

      const selectedPatient = patients.find(p => p.id === patientId);
      setCreatedPatientName(
        selectedPatient
          ? `${selectedPatient.first_name} ${selectedPatient.last_name}`
          : "le patient"
      );
      setStep("success");
      toast.success("Demande d'examen créée avec succès !");
    } catch {
      setError("Échec de la création. Vérifiez vos droits ou réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-scale-in
          dark:bg-[#0c1828] dark:border dark:border-white/[0.08]
          bg-white border border-slate-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4
            dark:border-b dark:border-white/[0.07] border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-emerald-400" />
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

        {/* Success screen */}
        {step === "success" ? (
          <div className="px-6 py-12 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center animate-scale-in">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg dark:text-white text-slate-900 mb-1">Examen planifié !</h3>
              <p className="text-sm dark:text-slate-400 text-slate-500">
                La demande pour{" "}
                <strong className="dark:text-white text-slate-800">{createdPatientName}</strong>{" "}
                a été créée avec succès.
              </p>
            </div>
            <Button onClick={handleClose} className="btn-emerald mt-2 px-8 h-10">Fermer</Button>
          </div>
        ) : (
          /* Form screen */
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Loading lists */}
            {loadingData && (
              <div className="flex items-center gap-2 text-xs dark:text-slate-500 text-slate-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />Chargement des listes…
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            {/* Patient dropdown */}
            <div>
              <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1.5">
                <User className="w-3 h-3 inline mr-1" />Patient *
              </label>
              <select
                required
                value={patientId}
                onChange={e => setPatientId(e.target.value)}
                className={SELECT_CLS}
                disabled={loadingData}
              >
                <option value="">— Sélectionner un patient —</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name} · {p.record_number}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam dropdown */}
            <div>
              <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1.5">
                <FlaskConical className="w-3 h-3 inline mr-1" />Type d&apos;examen *
              </label>
              <select
                required
                value={examId}
                onChange={e => setExamId(e.target.value)}
                className={SELECT_CLS}
                disabled={loadingData}
              >
                <option value="">— Sélectionner un examen —</option>
                {exams.map(ex => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}{ex.unit ? ` (${ex.unit})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Sample type */}
            <div>
              <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1.5">
                <Beaker className="w-3 h-3 inline mr-1" />Type de prélèvement *
              </label>
              <Input
                placeholder="Ex : Sang veineux, Urine, Selles…"
                value={sampleType}
                onChange={e => setSampleType(e.target.value)}
                required
              />
            </div>

            {/* Clinical notes */}
            <div>
              <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1.5">
                Notes cliniques
              </label>
              <textarea
                rows={2}
                placeholder="Symptômes, traitements en cours…"
                value={clinicalInfo}
                onChange={e => setClinical(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40
                  dark:bg-white/[0.03] dark:border-white/[0.08] dark:text-slate-200 dark:placeholder-slate-600
                  bg-white border-slate-200 text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1 btn-ghost h-10">
                Annuler
              </Button>
              <Button type="submit" disabled={loading || loadingData} className="flex-1 btn-emerald h-10 text-sm font-bold">
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
