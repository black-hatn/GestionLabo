"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Plus, Search, Edit2, Eye, Trash2, Loader2, AlertCircle,
  CheckCircle2, TrendingUp, Activity, RefreshCw, X, Beaker,
  FlaskConical, User, FileText, XCircle, Download, Mail, FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuthStore } from "@/lib/auth-store";
import { type ResultItem, type ResultStatus } from "@/services/api/result";
import examRequestService from "@/services/api/exam-request";
import { DeleteConfirmDialog } from "@/components/dashboard/delete-confirm-dialog";
import {
  useResults,
  useCreateResult,
  useUpdateResult,
  useDeleteResult,
} from "@/hooks/queries/use-results";
import { toast } from "@/lib/toast-store";
import apiClient from "@/services/api/client";

// Lazy-load le composant PDF (bundle volumineux — chargement à la demande)
const DownloadResultPDFButton = dynamic(
  () => import("@/lib/pdf/result-report").then(m => ({ default: m.DownloadResultPDFButton })),
  { ssr: false, loading: () => <span className="text-xs text-slate-500">PDF…</span> }
);

// ── Status helpers ─────────────────────────────────────────────────────────
const STATUS_LABEL: Record<ResultStatus, string> = {
  NORMAL:   "Normal",
  ANORMAL:  "Anormal",
  CRITIQUE: "Critique",
};

function StatusBadge({ status }: { status: ResultStatus }) {
  const cfg = {
    NORMAL:   { cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
    ANORMAL:  { cls: "bg-amber-500/10 text-amber-400 border-amber-500/20",       icon: AlertCircle  },
    CRITIQUE: { cls: "bg-red-500/10 text-red-400 border-red-500/20",             icon: XCircle      },
  }[status] ?? { cls: "bg-slate-500/10 text-slate-400 border-slate-500/20", icon: AlertCircle };

  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cfg.cls}`}>
      <Icon className="w-3 h-3" />
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

// ── Result Form Dialog ─────────────────────────────────────────────────────
interface FormDialogProps {
  mode: "create" | "edit";
  result?: ResultItem | null;
  open: boolean;
  onClose: () => void;
  saving: boolean;
  error: string | null;
  userId: string;
  examRequests: { id: string; label: string }[];
  onSubmit: (data: {
    exam_request_id: string;
    tested_by: string;
    value: string;
    reference_value?: string;
    status: ResultStatus;
    notes?: string;
  }) => void;
}

function ResultFormDialog({
  mode, result, open, onClose, saving, error, userId, examRequests, onSubmit,
}: FormDialogProps) {
  const [examRequestId, setExamRequestId] = useState("");
  const [value, setValue]                 = useState("");
  const [refVal, setRefVal]               = useState("");
  const [status, setStatus]               = useState<ResultStatus>("NORMAL");
  const [notes, setNotes]                 = useState("");

  useEffect(() => {
    if (mode === "edit" && result) {
      setExamRequestId(result.exam_request_id);
      setValue(result.value);
      setRefVal(result.reference_value ?? "");
      setStatus(result.status);
      setNotes(result.notes ?? "");
    } else {
      setExamRequestId(""); setValue(""); setRefVal(""); setStatus("NORMAL"); setNotes("");
    }
  }, [mode, result, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-scale-in
          dark:bg-[#0c1828] dark:border dark:border-white/[0.08]
          bg-white border border-slate-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4
            dark:border-b dark:border-white/[0.07] border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-emerald-400" />
            </div>
            <h2 className="text-sm font-bold dark:text-white text-slate-900">
              {mode === "create" ? "Nouveau Résultat" : "Modifier le Résultat"}
            </h2>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl dark:hover:bg-white/[0.06] hover:bg-slate-100 dark:text-slate-500 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={e => { e.preventDefault(); onSubmit({ exam_request_id: examRequestId, tested_by: userId, value, reference_value: refVal || undefined, status, notes: notes || undefined }); }}>
          <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            {mode === "create" && (
              <div>
                <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1.5">
                  Demande d&apos;examen *
                </label>
                <select
                  required
                  value={examRequestId}
                  onChange={e => setExamRequestId(e.target.value)}
                  className="w-full h-10 rounded-xl border px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40
                    dark:bg-white/[0.03] dark:border-white/[0.08] dark:text-slate-200
                    bg-white border-slate-200 text-slate-800"
                >
                  <option value="">— Sélectionner une demande —</option>
                  {examRequests.map(er => (
                    <option key={er.id} value={er.id}>{er.label}</option>
                  ))}
                </select>
                {examRequests.length === 0 && (
                  <p className="text-xs text-amber-400 mt-1">Aucune demande d&apos;examen disponible — créez-en une d&apos;abord.</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1.5">Valeur mesurée *</label>
                <Input value={value} onChange={e => setValue(e.target.value)} placeholder="Ex : 1.10" required />
              </div>
              <div>
                <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1.5">Valeur de référence</label>
                <Input value={refVal} onChange={e => setRefVal(e.target.value)} placeholder="Ex : 0.70-1.00" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1.5">Statut *</label>
              <div className="flex gap-2">
                {(["NORMAL", "ANORMAL", "CRITIQUE"] as ResultStatus[]).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      status === s
                        ? s === "NORMAL"   ? "bg-emerald-500 text-white border-emerald-500"
                          : s === "ANORMAL" ? "bg-amber-500 text-white border-amber-500"
                          : "bg-red-500 text-white border-red-500"
                        : "dark:bg-white/[0.03] dark:border-white/[0.08] dark:text-slate-400 bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1.5">Notes / Observations</label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Observations, conditions du prélèvement..."
                className="w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/40
                  dark:bg-white/[0.03] dark:border-white/[0.08] dark:text-slate-200 dark:placeholder-slate-600
                  bg-white border-slate-200 text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          <div className="flex gap-3 px-6 py-4 dark:border-t dark:border-white/[0.07] border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 btn-ghost h-10">Annuler</Button>
            <Button type="submit" disabled={saving} className="flex-1 btn-emerald h-10 text-sm font-bold">
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {mode === "create" ? "Enregistrer" : "Mettre à jour"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Detail Sheet ───────────────────────────────────────────────────────────
function ResultDetailSheet({ result, open, onClose, onEdit, canEdit }: {
  result: ResultItem | null; open: boolean; onClose: () => void; onEdit: (r: ResultItem) => void; canEdit: boolean;
}) {
  if (!open || !result) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col shadow-2xl animate-slide-in-right
          dark:bg-[#0c1828] dark:border-l dark:border-white/[0.07]
          bg-white border-l border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 dark:border-b dark:border-white/[0.07] border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-bold dark:text-white text-slate-900">{result.exam_name ?? "Résultat"}</h2>
              <p className="text-xs dark:text-slate-500 text-slate-400">Détails du résultat</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl dark:hover:bg-white/[0.06] hover:bg-slate-100 dark:text-slate-500 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <StatusBadge status={result.status} />

          {[
            { icon: User,        label: "Patient",          value: `${result.patient_name ?? "—"} (${result.record_number ?? "—"})` },
            { icon: Beaker,      label: "Examen",           value: result.exam_name ?? "—" },
            { icon: FlaskConical,label: "Valeur mesurée",   value: `${result.value}${result.exam_unit ? " " + result.exam_unit : ""}` },
            { icon: Activity,    label: "Valeur référence", value: result.reference_value ?? "—" },
            { icon: FileText,    label: "Analysé par",      value: result.tested_by_name ?? result.tested_by },
            { icon: TrendingUp,  label: "Date d'analyse",   value: new Date(result.tested_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) },
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

          {result.notes && (
            <div className="p-4 rounded-xl dark:bg-white/[0.03] dark:border dark:border-white/[0.05] bg-slate-50 border border-slate-100">
              <div className="text-[10px] font-semibold dark:text-slate-500 text-slate-400 uppercase tracking-wide mb-2">Notes</div>
              <p className="text-sm dark:text-slate-300 text-slate-700 leading-relaxed">{result.notes}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 dark:border-t dark:border-white/[0.07] border-t border-slate-100 flex gap-3 flex-wrap">
          <Button variant="outline" onClick={onClose} className="flex-1 btn-ghost h-10">Fermer</Button>
          {/* Bouton téléchargement PDF */}
          <div className="flex items-center h-10 px-4 border-2 border-blue-500/40 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 bg-transparent transition-all text-sm font-semibold cursor-pointer">
            <Download className="w-4 h-4 mr-2 shrink-0" />
            <DownloadResultPDFButton result={result} className="text-sm font-semibold" />
          </div>
          {canEdit && (
            <Button onClick={() => { onClose(); onEdit(result); }} className="flex-1 btn-emerald h-10 text-sm font-bold">
              Modifier
            </Button>
          )}
        </div>
      </aside>
    </>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
type ModalState =
  | { type: "idle" }
  | { type: "view"; result: ResultItem }
  | { type: "edit"; result: ResultItem }
  | { type: "create" }
  | { type: "delete"; result: ResultItem };

export default function ResultsPage() {
  const user = useAuthStore(state => state.user);
  const canEdit   = ["ADMIN", "LAB_TECH"].includes(user?.role ?? "");
  const canDelete = user?.role === "ADMIN";

  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | ResultStatus>("ALL");

  // Reset to page 1 when status filter changes
  const handleFilterStatus = (s: "ALL" | ResultStatus) => {
    setFilterStatus(s);
    setPage(1);
  };

  // Modal state
  const [modal, setModal]         = useState<ModalState>({ type: "idle" });
  const [formError, setFormError] = useState<string | null>(null);

  // Notify state — tracks which result is being notified
  const [notifyingId, setNotifyingId] = useState<string | null>(null);

  const handleNotify = async (r: ResultItem) => {
    setNotifyingId(r.id);
    try {
      await apiClient.post(`/resultats/${r.id}/notify`);
      toast.success(`Notification envoyée pour ${r.patient_name ?? r.id}`);
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? err?.message ?? "Erreur lors de l'envoi";
      toast.error(detail);
    } finally {
      setNotifyingId(null);
    }
  };

  // Exam requests for the create form dropdown
  const [examRequests, setExamRequests] = useState<{ id: string; label: string }[]>([]);

  // ── React Query hooks ───────────────────────────────────────────────────
  const { data, isLoading, isFetching, isError, error, refetch } = useResults(page, 10, filterStatus);
  const createResult = useCreateResult();
  const updateResult = useUpdateResult();
  const deleteResult = useDeleteResult();

  const results    = data?.items ?? [];
  const totalPages = data?.pages ?? 1;
  const total      = data?.total ?? 0;

  const loading = isLoading || isFetching;
  const loadError = isError
    ? ((error as any)?.response?.data?.detail ?? (error as any)?.message ?? "Erreur de chargement")
    : null;

  // Load exam requests for the form dropdown (EN_ATTENTE ou EN_COURS)
  const loadExamRequests = useCallback(async () => {
    try {
      const res = await examRequestService.getExamRequests(1, 100);
      const pending = (res.items as any[]).filter(
        er => er.status === "EN_ATTENTE" || er.status === "EN_COURS"
      );
      setExamRequests(pending.map((er: any) => ({
        id: er.id,
        label: `${er.patient_name ?? er.patient_id} — ${er.exam_name ?? er.exam_id} (${er.status})`,
      })));
    } catch (err: any) {
      toast.error("Impossible de charger les demandes d'examens disponibles");
    }
  }, []);

  const openCreate = () => { setFormError(null); loadExamRequests(); setModal({ type: "create" }); };
  const openEdit   = (r: ResultItem) => { setFormError(null); setModal({ type: "edit", result: r }); };
  const openView   = (r: ResultItem) => setModal({ type: "view", result: r });
  const openDelete = (r: ResultItem) => setModal({ type: "delete", result: r });
  const closeModal = () => { setModal({ type: "idle" }); setFormError(null); };

  const handleSubmit = (data: Parameters<FormDialogProps["onSubmit"]>[0]) => {
    setFormError(null);
    if (modal.type === "create") {
      createResult.mutate(data, {
        onSuccess: closeModal,
        onError: (err: any) => setFormError(err?.response?.data?.detail ?? err?.message ?? "Erreur"),
      });
    } else if (modal.type === "edit") {
      updateResult.mutate({
        id: modal.result.id,
        data: {
          value: data.value,
          reference_value: data.reference_value,
          status: data.status,
          notes: data.notes,
        },
      }, {
        onSuccess: closeModal,
        onError: (err: any) => setFormError(err?.response?.data?.detail ?? err?.message ?? "Erreur"),
      });
    }
  };

  const handleDelete = () => {
    if (modal.type !== "delete") return;
    deleteResult.mutate(modal.result.id, {
      onSuccess: closeModal,
      onError: (err: any) => setFormError(err?.response?.data?.detail ?? err?.message ?? "Erreur"),
    });
  };

  const saving = createResult.isPending || updateResult.isPending || deleteResult.isPending;

  // Filtering — status is server-side via useResults; search is client-side on current page
  const filtered = results.filter(r => {
    const q = search.toLowerCase();
    return !q ||
      (r.patient_name ?? "").toLowerCase().includes(q) ||
      (r.exam_name ?? "").toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q);
  });

  const stats = {
    total,
    normal:   results.filter(r => r.status === "NORMAL").length,
    anormal:  results.filter(r => r.status === "ANORMAL").length,
    critique: results.filter(r => r.status === "CRITIQUE").length,
  };

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["ADMIN", "RECEPTIONIST", "COLLECTOR", "LAB_TECH", "DOCTOR"]}>
      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl p-8
            bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold mb-1">Résultats Biologiques</h1>
              <p className="text-emerald-100 text-sm">Analyses en temps réel — {total} résultat{total > 1 ? "s" : ""} enregistré{total > 1 ? "s" : ""}</p>
            </div>
            <FlaskConical className="hidden md:block w-20 h-20 opacity-20" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total",    value: stats.total,    color: "cyan",    icon: Activity },
            { label: "Normaux",  value: stats.normal,   color: "emerald", icon: CheckCircle2 },
            { label: "Anormaux", value: stats.anormal,  color: "amber",   icon: AlertCircle },
            { label: "Critiques",value: stats.critique, color: "red",     icon: XCircle },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="rounded-2xl p-4 flex items-center gap-3
                dark:bg-[#0c1828] dark:border dark:border-white/[0.07]
                bg-white border border-slate-200 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                ${color === "cyan"    ? "bg-cyan-500/15"    : ""}
                ${color === "emerald" ? "bg-emerald-500/15" : ""}
                ${color === "amber"   ? "bg-amber-500/15"   : ""}
                ${color === "red"     ? "bg-red-500/15"     : ""}
              `}>
                <Icon className={`w-5 h-5
                  ${color === "cyan"    ? "text-cyan-400"    : ""}
                  ${color === "emerald" ? "text-emerald-400" : ""}
                  ${color === "amber"   ? "text-amber-400"   : ""}
                  ${color === "red"     ? "text-red-400"     : ""}
                `} />
              </div>
              <div>
                <div className="text-xl font-extrabold dark:text-white text-slate-900">{value}</div>
                <div className="text-xs dark:text-slate-500 text-slate-500">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Alerte critiques */}
        {stats.critique > 0 && (
          <div className="flex items-center gap-3 rounded-xl px-5 py-3
              bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {stats.critique} résultat{stats.critique > 1 ? "s" : ""} critique{stats.critique > 1 ? "s" : ""} — action requise
          </div>
        )}

        {/* Toolbar */}
        <div className="rounded-2xl p-5
            dark:bg-[#0c1828] dark:border dark:border-white/[0.07]
            bg-white border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-slate-500 text-slate-400" />
              <Input
                placeholder="Rechercher par patient, examen, ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={() => refetch()} disabled={loading} className="btn-ghost h-10 px-4 gap-2">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Actualiser
            </Button>
            {canEdit && (
              <Button onClick={openCreate} className="btn-emerald h-10 px-4 gap-2 text-sm font-bold">
                <Plus className="w-4 h-4" />
                Nouveau Résultat
              </Button>
            )}
          </div>

          <div className="flex gap-2 mt-3 flex-wrap">
            {(["ALL", "NORMAL", "ANORMAL", "CRITIQUE"] as const).map(s => (
              <button
                key={s}
                onClick={() => handleFilterStatus(s)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors
                  ${filterStatus === s
                    ? "bg-emerald-500 text-white"
                    : "dark:bg-white/[0.05] dark:text-slate-400 dark:hover:bg-white/[0.1] bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                {s === "ALL" ? "Tous" : STATUS_LABEL[s as ResultStatus]}
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

        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
            <p className="text-sm dark:text-slate-400 text-slate-500">Chargement des résultats…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-2xl
              dark:bg-[#0c1828] dark:border dark:border-white/[0.07]
              bg-white border border-slate-200">
            <FlaskConical className="w-12 h-12 dark:text-slate-700 text-slate-300 mb-3" />
            <p className="text-sm dark:text-slate-400 text-slate-500">
              {search || filterStatus !== "ALL" ? "Aucun résultat ne correspond aux filtres" : "Aucun résultat enregistré — cliquez Nouveau Résultat"}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden
              dark:bg-[#0c1828] dark:border dark:border-white/[0.07]
              bg-white border border-slate-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-premium">
                <thead>
                  <tr className="dark:border-b dark:border-white/[0.06] border-b border-slate-100">
                    {["Examen / Patient", "Valeur", "Référence", "Statut", "Date", "Actions"].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider
                          dark:text-slate-500 text-slate-400 first:pl-6 last:pr-6 last:text-right">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id}
                      className="dark:border-b dark:border-white/[0.04] border-b border-slate-50
                        dark:hover:bg-white/[0.02] hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 pl-6">
                        <div className="font-semibold dark:text-white text-slate-900">{r.exam_name ?? "—"}</div>
                        <div className="text-xs dark:text-slate-500 text-slate-400 mt-0.5">
                          {r.patient_name ?? "—"}
                          {r.record_number ? ` · ${r.record_number}` : ""}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold dark:text-white text-slate-900">{r.value}</span>
                        {r.exam_unit && <span className="text-xs dark:text-slate-500 text-slate-400 ml-1">{r.exam_unit}</span>}
                        {r.notes && <div className="text-xs dark:text-slate-500 text-slate-400 italic mt-0.5 max-w-[160px] truncate">{r.notes}</div>}
                      </td>
                      <td className="px-5 py-4 dark:text-slate-400 text-slate-500 font-medium">
                        {r.reference_value ?? "—"}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-5 py-4 text-xs dark:text-slate-500 text-slate-400">
                        {new Date(r.tested_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-5 py-4 pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openView(r)} title="Voir"
                            className="w-8 h-8 rounded-lg flex items-center justify-center
                              dark:hover:bg-cyan-500/15 hover:bg-cyan-50
                              dark:text-slate-400 text-slate-500 dark:hover:text-cyan-400 hover:text-cyan-600 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleNotify(r)}
                            disabled={notifyingId === r.id}
                            title="Notifier le patient par email"
                            className="inline-flex items-center gap-1 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 text-xs px-2 py-1 rounded-lg
                              bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {notifyingId === r.id
                              ? <Loader2 className="w-3 h-3 animate-spin" />
                              : <Mail className="w-3 h-3" />}
                            Notifier
                          </button>
                          <span
                            title="Télécharger le rapport PDF"
                            className="inline-flex items-center gap-1 dark:bg-violet-500/10 dark:text-violet-400 dark:hover:bg-violet-500/20 rounded-lg px-2 py-1 text-xs
                              bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors cursor-pointer"
                          >
                            <FileDown className="w-3 h-3 shrink-0" />
                            <DownloadResultPDFButton result={r} className="text-xs" />
                          </span>
                          {canEdit && (
                            <button onClick={() => openEdit(r)} title="Modifier"
                              className="w-8 h-8 rounded-lg flex items-center justify-center
                                dark:hover:bg-amber-500/15 hover:bg-amber-50
                                dark:text-slate-400 text-slate-500 dark:hover:text-amber-400 hover:text-amber-600 transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={() => openDelete(r)} title="Supprimer"
                              className="w-8 h-8 rounded-lg flex items-center justify-center
                                dark:hover:bg-red-500/15 hover:bg-red-50
                                dark:text-slate-400 text-slate-500 dark:hover:text-red-400 hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex gap-2 justify-center items-center pt-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost">
              Précédent
            </Button>
            <span className="text-sm dark:text-slate-400 text-slate-500 px-3">Page {page} / {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost">
              Suivant
            </Button>
          </div>
        )}

      </div>

      {/* Dialogs */}
      <ResultDetailSheet
        open={modal.type === "view"}
        result={modal.type === "view" ? modal.result : null}
        onClose={closeModal}
        onEdit={openEdit}
        canEdit={canEdit}
      />

      <ResultFormDialog
        mode={modal.type === "edit" ? "edit" : "create"}
        result={modal.type === "edit" ? modal.result : null}
        open={modal.type === "create" || modal.type === "edit"}
        onClose={closeModal}
        saving={saving}
        error={formError}
        userId={user?.id ?? ""}
        examRequests={examRequests}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmDialog
        open={modal.type === "delete"}
        itemName={modal.type === "delete" ? `Résultat de ${modal.result.patient_name ?? modal.result.id}` : ""}
        itemType="ce résultat"
        saving={saving}
        onConfirm={handleDelete}
        onCancel={closeModal}
      />
      </RoleGuard>
    </ProtectedRoute>
  );
}
