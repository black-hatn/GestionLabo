"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, Eye, Trash2, Loader2, AlertCircle, Stethoscope,
  RefreshCw, X, CheckCircle2, XCircle, Clock, Activity, User, Beaker,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { type ExamRequest, type ExamRequestStatus } from "@/services/api/exam-request";
import patientService, { type Patient } from "@/services/api/patient";
import examService from "@/services/api/exam";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "@/lib/toast-store";
import { DeleteConfirmDialog } from "@/components/dashboard/delete-confirm-dialog";
import {
  useExamRequests,
  useCreateExamRequest,
  useUpdateExamRequestStatus,
  useDeleteExamRequest,
} from "@/hooks/queries/use-exam-requests";

// ── Status helpers ─────────────────────────────────────────────────────────
const STATUS_CFG: Record<ExamRequestStatus, { label: string; cls: string; icon: React.ElementType }> = {
  EN_ATTENTE: { label: "En attente", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20",       icon: Clock },
  EN_COURS:   { label: "En cours",   cls: "bg-blue-500/10 text-blue-400 border-blue-500/20",          icon: Activity },
  TERMINE:    { label: "Terminé",    cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
  ANNULE:     { label: "Annulé",     cls: "bg-red-500/10 text-red-400 border-red-500/20",             icon: XCircle },
};

function StatusBadge({ status }: { status: ExamRequestStatus }) {
  const c = STATUS_CFG[status] ?? STATUS_CFG.EN_ATTENTE;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${c.cls}`}>
      <Icon className="w-3 h-3" />{c.label}
    </span>
  );
}

// ── Create Form Dialog ────────────────────────────────────────────────────
interface CreateFormProps {
  open: boolean;
  onClose: () => void;
  saving: boolean;
  error: string | null;
  patients: { id: string; label: string }[];
  exams: { id: string; label: string }[];
  userId: string;
  onSubmit: (data: { patient_id: string; doctor_id: string; exam_id: string; sample_type: string; clinical_info?: string }) => void;
}

function CreateExamRequestDialog({ open, onClose, saving, error, patients, exams, userId, onSubmit }: CreateFormProps) {
  const [patientId, setPatientId]   = useState("");
  const [examId, setExamId]         = useState("");
  const [sampleType, setSampleType] = useState("");
  const [clinicalInfo, setClinical] = useState("");

  useEffect(() => {
    if (!open) { setPatientId(""); setExamId(""); setSampleType(""); setClinical(""); }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-scale-in
          dark:bg-[#0c1828] dark:border dark:border-white/[0.08]
          bg-white border border-slate-200">

        <div className="flex items-center justify-between px-6 py-4
            dark:border-b dark:border-white/[0.07] border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-purple-400" />
            </div>
            <h2 className="text-sm font-bold dark:text-white text-slate-900">Nouvelle Demande d&apos;Examen</h2>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl dark:hover:bg-white/[0.06] hover:bg-slate-100 dark:text-slate-500 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={e => { e.preventDefault(); onSubmit({ patient_id: patientId, doctor_id: userId, exam_id: examId, sample_type: sampleType, clinical_info: clinicalInfo || undefined }); }}>
          <div className="px-6 py-5 space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1.5">Patient *</label>
              <select required value={patientId} onChange={e => setPatientId(e.target.value)}
                className="w-full h-10 rounded-xl border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40
                  dark:bg-white/[0.03] dark:border-white/[0.08] dark:text-slate-200 bg-white border-slate-200 text-slate-800">
                <option value="">— Sélectionner un patient —</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1.5">Type d&apos;examen *</label>
              <select required value={examId} onChange={e => setExamId(e.target.value)}
                className="w-full h-10 rounded-xl border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40
                  dark:bg-white/[0.03] dark:border-white/[0.08] dark:text-slate-200 bg-white border-slate-200 text-slate-800">
                <option value="">— Sélectionner un examen —</option>
                {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1.5">Type de prélèvement *</label>
              <Input value={sampleType} onChange={e => setSampleType(e.target.value)} placeholder="Ex : Sang veineux, Urine, Selles…" required />
            </div>

            <div>
              <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1.5">Informations cliniques</label>
              <textarea rows={2} value={clinicalInfo} onChange={e => setClinical(e.target.value)}
                placeholder="Symptômes, traitements en cours…"
                className="w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40
                  dark:bg-white/[0.03] dark:border-white/[0.08] dark:text-slate-200 dark:placeholder-slate-600
                  bg-white border-slate-200 text-slate-800 placeholder-slate-400" />
            </div>
          </div>

          <div className="flex gap-3 px-6 py-4 dark:border-t dark:border-white/[0.07] border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 btn-ghost h-10">Annuler</Button>
            <Button type="submit" disabled={saving} className="flex-1 btn-emerald h-10 text-sm font-bold">
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Créer la demande
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Detail Sheet ───────────────────────────────────────────────────────────
function allowedNextStatuses(role: string, current: ExamRequestStatus): ExamRequestStatus[] {
  if (current === "TERMINE" || current === "ANNULE") return [];
  if (role === "COLLECTOR") return current === "EN_ATTENTE" ? ["EN_COURS"] : [];
  if (role === "LAB_TECH")  return current === "EN_COURS"   ? ["TERMINE", "ANNULE"] : [];
  if (role === "ADMIN" || role === "RECEPTIONIST") {
    return (["EN_ATTENTE", "EN_COURS", "TERMINE", "ANNULE"] as ExamRequestStatus[]).filter(s => s !== current);
  }
  return []; // DOCTOR: view only
}

function ExamRequestSheet({ er, open, onClose, onStatusChange, userRole }: {
  er: ExamRequest | null; open: boolean; onClose: () => void;
  onStatusChange: (id: string, s: ExamRequestStatus) => void;
  userRole: string;
}) {
  if (!open || !er) return null;
  const nextStatuses = allowedNextStatuses(userRole, er.status);
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col shadow-2xl animate-slide-in-right
          dark:bg-[#0c1828] dark:border-l dark:border-white/[0.07]
          bg-white border-l border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 dark:border-b dark:border-white/[0.07] border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="font-bold dark:text-white text-slate-900">{er.exam_name ?? "Demande"}</h2>
              <p className="text-xs dark:text-slate-500 text-slate-400">Demande d&apos;examen</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl dark:hover:bg-white/[0.06] hover:bg-slate-100 dark:text-slate-500 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <StatusBadge status={er.status} />

          {[
            { icon: User,        label: "Patient",         value: `${er.patient_name ?? "—"} (${er.record_number ?? "—"})` },
            { icon: Beaker,      label: "Examen",          value: er.exam_name ?? "—" },
            { icon: Stethoscope, label: "Médecin",         value: er.doctor_name ?? er.doctor_id },
            { icon: Activity,    label: "Prélèvement",     value: er.sample_type },
            { icon: Clock,       label: "Date de demande", value: new Date(er.requested_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 p-3 rounded-xl
                dark:bg-white/[0.03] dark:border dark:border-white/[0.05]
                bg-slate-50 border border-slate-100">
              <Icon className="w-4 h-4 dark:text-slate-500 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-[10px] font-semibold dark:text-slate-500 text-slate-400 uppercase tracking-wide mb-0.5">{label}</div>
                <div className="text-sm font-medium dark:text-slate-200 text-slate-800">{value}</div>
              </div>
            </div>
          ))}

          {er.clinical_info && (
            <div className="p-4 rounded-xl dark:bg-white/[0.03] dark:border dark:border-white/[0.05] bg-slate-50 border border-slate-100">
              <div className="text-[10px] font-semibold dark:text-slate-500 text-slate-400 uppercase tracking-wide mb-2">Informations cliniques</div>
              <p className="text-sm dark:text-slate-300 text-slate-700 leading-relaxed">{er.clinical_info}</p>
            </div>
          )}

          {nextStatuses.length > 0 && (
            <div className="p-4 rounded-xl dark:bg-white/[0.03] dark:border dark:border-white/[0.05] bg-slate-50 border border-slate-100">
              <div className="text-[10px] font-semibold dark:text-slate-500 text-slate-400 uppercase tracking-wide mb-3">Changer le statut</div>
              <div className="flex gap-2 flex-wrap">
                {nextStatuses.map(s => {
                  const c = STATUS_CFG[s];
                  return (
                    <button key={s} onClick={() => onStatusChange(er.id, s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${c.cls}`}>
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 dark:border-t dark:border-white/[0.07] border-t border-slate-100">
          <Button variant="outline" onClick={onClose} className="w-full btn-ghost h-10">Fermer</Button>
        </div>
      </aside>
    </>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
type ModalState =
  | { type: "idle" }
  | { type: "view";   er: ExamRequest }
  | { type: "create" }
  | { type: "delete"; er: ExamRequest };

export default function ExamRequestsPage() {
  const user = useAuthStore(state => state.user);
  const role = user?.role ?? "";
  const canCreate = ["ADMIN", "RECEPTIONIST"].includes(role);
  const canDelete = role === "ADMIN";

  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | ExamRequestStatus>("ALL");

  const [modal, setModal]         = useState<ModalState>({ type: "idle" });
  const [formError, setFormError] = useState<string | null>(null);

  const [patientOptions, setPatientOptions] = useState<{ id: string; label: string }[]>([]);
  const [examOptions, setExamOptions]       = useState<{ id: string; label: string }[]>([]);

  // ── React Query hooks ───────────────────────────────────────────────────
  const { data, isLoading, isFetching, isError, error, refetch } = useExamRequests(page, 10);
  const createExamRequest      = useCreateExamRequest();
  const updateExamRequestStatus = useUpdateExamRequestStatus();
  const deleteExamRequest      = useDeleteExamRequest();

  const requests   = data?.items ?? [];
  const totalPages = data?.pages ?? 1;
  const total      = data?.total ?? 0;

  const loading = isLoading || isFetching;
  const loadError = isError
    ? ((error as any)?.response?.data?.detail ?? (error as any)?.message ?? "Erreur de chargement")
    : null;

  const loadDropdowns = useCallback(async () => {
    try {
      const [patRes, exRes] = await Promise.all([
        patientService.getPatients(1, 200),
        examService.getExams(1, 200),
      ]);
      setPatientOptions((patRes.items as Patient[]).map(p => ({
        id: p.id,
        label: `${p.first_name} ${p.last_name} (${p.record_number})`,
      })));
      setExamOptions(exRes.items.map((ex: any) => ({
        id: ex.id,
        label: `${ex.name}${ex.unit ? ` — ${ex.unit}` : ""}`,
      })));
    } catch (err: any) {
      toast.error("Impossible de charger les patients et examens disponibles");
    }
  }, []);

  const openCreate = () => { setFormError(null); loadDropdowns(); setModal({ type: "create" }); };
  const openView   = (er: ExamRequest) => setModal({ type: "view", er });
  const openDelete = (er: ExamRequest) => setModal({ type: "delete", er });
  const closeModal = () => { setModal({ type: "idle" }); setFormError(null); };

  const handleCreate = (data: any) => {
    setFormError(null);
    createExamRequest.mutate(data, {
      onSuccess: closeModal,
      onError: (err: any) => setFormError(err?.response?.data?.detail ?? err?.message ?? "Erreur"),
    });
  };

  const handleStatusChange = (id: string, status: ExamRequestStatus) => {
    updateExamRequestStatus.mutate({ id, status }, {
      onSuccess: closeModal,
    });
  };

  const handleDelete = () => {
    if (modal.type !== "delete") return;
    deleteExamRequest.mutate(modal.er.id, {
      onSuccess: closeModal,
      onError: (err: any) => setFormError(err?.response?.data?.detail ?? err?.message ?? "Erreur"),
    });
  };

  const saving = createExamRequest.isPending || updateExamRequestStatus.isPending || deleteExamRequest.isPending;

  const filtered = requests.filter(r => {
    const q = search.toLowerCase();
    const matchSearch =
      (r.patient_name ?? "").toLowerCase().includes(q) ||
      (r.exam_name ?? "").toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q);
    const matchStatus = filterStatus === "ALL" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total,
    enAttente: requests.filter(r => r.status === "EN_ATTENTE").length,
    enCours:   requests.filter(r => r.status === "EN_COURS").length,
    termine:   requests.filter(r => r.status === "TERMINE").length,
  };

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["ADMIN", "RECEPTIONIST", "COLLECTOR", "LAB_TECH", "DOCTOR"]}>
        <div className="space-y-6 animate-fade-in">

          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl p-8
              bg-gradient-to-r from-purple-700 to-purple-600 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold mb-1">Demandes d&apos;Examens</h1>
                <p className="text-purple-100 text-sm">{total} demande{total > 1 ? "s" : ""} enregistrée{total > 1 ? "s" : ""}</p>
              </div>
              <Stethoscope className="hidden md:block w-20 h-20 opacity-20" />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total",      value: stats.total,     color: "purple",  icon: Stethoscope },
              { label: "En attente", value: stats.enAttente, color: "amber",   icon: Clock },
              { label: "En cours",   value: stats.enCours,   color: "blue",    icon: Activity },
              { label: "Terminées",  value: stats.termine,   color: "emerald", icon: CheckCircle2 },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="rounded-2xl p-4 flex items-center gap-3
                  dark:bg-[#0c1828] dark:border dark:border-white/[0.07]
                  bg-white border border-slate-200 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                  ${color === "purple"  ? "bg-purple-500/15"  : ""}
                  ${color === "amber"   ? "bg-amber-500/15"   : ""}
                  ${color === "blue"    ? "bg-blue-500/15"    : ""}
                  ${color === "emerald" ? "bg-emerald-500/15" : ""}
                `}>
                  <Icon className={`w-5 h-5
                    ${color === "purple"  ? "text-purple-400"  : ""}
                    ${color === "amber"   ? "text-amber-400"   : ""}
                    ${color === "blue"    ? "text-blue-400"    : ""}
                    ${color === "emerald" ? "text-emerald-400" : ""}
                  `} />
                </div>
                <div>
                  <div className="text-xl font-extrabold dark:text-white text-slate-900">{value}</div>
                  <div className="text-xs dark:text-slate-500 text-slate-500">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="rounded-2xl p-5
              dark:bg-[#0c1828] dark:border dark:border-white/[0.07]
              bg-white border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-slate-500 text-slate-400" />
                <Input placeholder="Rechercher par patient, examen, ID…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Button variant="outline" onClick={() => refetch()} disabled={loading} className="btn-ghost h-10 px-4 gap-2">
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
              {canCreate && (
                <Button onClick={openCreate} className="btn-emerald h-10 px-4 gap-2 text-sm font-bold">
                  <Plus className="w-4 h-4" />
                  Nouvelle Demande
                </Button>
              )}
            </div>

            <div className="flex gap-2 mt-3 flex-wrap">
              {(["ALL", "EN_ATTENTE", "EN_COURS", "TERMINE", "ANNULE"] as const).map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors
                    ${filterStatus === s
                      ? "bg-purple-500 text-white"
                      : "dark:bg-white/[0.05] dark:text-slate-400 dark:hover:bg-white/[0.1] bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}>
                  {s === "ALL" ? "Tous" : STATUS_CFG[s as ExamRequestStatus].label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {loadError && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm
                bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />{loadError}
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400 mb-3" />
              <p className="text-sm dark:text-slate-400 text-slate-500">Chargement des demandes…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl
                dark:bg-[#0c1828] dark:border dark:border-white/[0.07]
                bg-white border border-slate-200">
              <Stethoscope className="w-12 h-12 dark:text-slate-700 text-slate-300 mb-3" />
              <p className="text-sm dark:text-slate-400 text-slate-500">
                {search || filterStatus !== "ALL" ? "Aucune demande ne correspond aux filtres" : "Aucune demande — cliquez Nouvelle Demande"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(er => (
                <div key={er.id}
                  className="rounded-2xl px-5 py-4 flex items-center gap-4
                    dark:bg-[#0c1828] dark:border dark:border-white/[0.07] dark:hover:border-white/[0.14]
                    bg-white border border-slate-200 hover:border-slate-300
                    transition-all shadow-sm">

                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-5 h-5 text-purple-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold dark:text-white text-slate-900 truncate">{er.exam_name ?? er.exam_id}</span>
                      <StatusBadge status={er.status} />
                    </div>
                    <div className="flex items-center gap-3 text-xs dark:text-slate-500 text-slate-400">
                      <span>{er.patient_name ?? er.patient_id}</span>
                      <span>·</span>
                      <span>{er.sample_type}</span>
                      <span>·</span>
                      <span>{new Date(er.requested_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openView(er)} title="Voir"
                      className="w-8 h-8 rounded-lg flex items-center justify-center
                        dark:hover:bg-purple-500/15 hover:bg-purple-50
                        dark:text-slate-400 text-slate-500 dark:hover:text-purple-400 hover:text-purple-600 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    {canDelete && (
                      <button onClick={() => openDelete(er)} title="Supprimer"
                        className="w-8 h-8 rounded-lg flex items-center justify-center
                          dark:hover:bg-red-500/15 hover:bg-red-50
                          dark:text-slate-400 text-slate-500 dark:hover:text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex gap-2 justify-center items-center pt-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost">Précédent</Button>
              <span className="text-sm dark:text-slate-400 text-slate-500 px-3">Page {page} / {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost">Suivant</Button>
            </div>
          )}

        </div>

        {/* Dialogs */}
        <ExamRequestSheet
          open={modal.type === "view"}
          er={modal.type === "view" ? modal.er : null}
          onClose={closeModal}
          onStatusChange={handleStatusChange}
          userRole={role}
        />

        <CreateExamRequestDialog
          open={modal.type === "create"}
          onClose={closeModal}
          saving={saving}
          error={formError}
          patients={patientOptions}
          exams={examOptions}
          userId={user?.id ?? ""}
          onSubmit={handleCreate}
        />

        <DeleteConfirmDialog
          open={modal.type === "delete"}
          itemName={modal.type === "delete" ? `${modal.er.exam_name ?? "Demande"} — ${modal.er.patient_name ?? ""}` : ""}
          itemType="cette demande"
          saving={saving}
          onConfirm={handleDelete}
          onCancel={closeModal}
        />

      </RoleGuard>
    </ProtectedRoute>
  );
}
