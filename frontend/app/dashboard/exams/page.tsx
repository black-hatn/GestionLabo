"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleGuard } from "@/components/auth/RoleGuard";
import examService from "@/services/api/exam";
import { useAuthStore } from "@/lib/auth-store";
import {
  AlertCircle, Plus, Edit2, Trash2, Eye, Loader2, Beaker,
  TrendingUp, Search, RefreshCw, CheckCircle2, XCircle,
} from "lucide-react";
import { useExamActions, type ExamData } from "@/hooks/use-exam-actions";
import { ExamDetailSheet }    from "@/components/dashboard/exam-detail-sheet";
import { ExamFormDialog }     from "@/components/dashboard/exam-form-dialog";
import { DeleteConfirmDialog } from "@/components/dashboard/delete-confirm-dialog";

export default function ExamsPage() {
  const user = useAuthStore(state => state.user);
  const canEdit   = ["ADMIN", "LAB_TECH"].includes(user?.role ?? "");
  const canDelete = user?.role === "ADMIN";

  const [exams, setExams]           = useState<ExamData[]>([]);
  const [loading, setLoading]       = useState(true);
  const [loadError, setLoadError]   = useState<string | null>(null);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIF" | "INACTIF">("ALL");

  // ── Data loading ──────────────────────────────────────────────────────────
  const loadExams = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const response = await examService.getExams(page, 10);
      setExams(response.items ?? []);
      setTotalPages(response.pages ?? 1);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      setLoadError(e?.response?.data?.detail ?? e?.message ?? "Erreur lors du chargement des examens");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { loadExams(); }, [loadExams]);

  // ── Hook CRUD ─────────────────────────────────────────────────────────────
  const {
    modal, saving, error,
    openView, openEdit, openCreate, openDelete, closeModal,
    handleCreate, handleUpdate, handleDelete,
  } = useExamActions(loadExams);

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filteredExams = exams.filter((exam) => {
    const matchSearch = exam.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "ALL"    ? true :
      filterStatus === "ACTIF"  ? exam.is_active :
      !exam.is_active;
    return matchSearch && matchStatus;
  });

  const stats = {
    total:    exams.length,
    active:   exams.filter(e => e.is_active).length,
    inactive: exams.filter(e => !e.is_active).length,
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["ADMIN", "DOCTOR", "LAB_TECH"]}>
        <div className="space-y-6 animate-fade-in">

          {/* ── Header ── */}
          <div className="relative overflow-hidden rounded-2xl p-8
              bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold mb-1">Catalogue d&apos;Analyses</h1>
                <p className="text-cyan-100 text-sm">Gérez les types d&apos;examens et les normes de référence</p>
              </div>
              <Beaker className="hidden md:block w-20 h-20 opacity-20" />
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Total examens",  value: stats.total,    icon: Beaker,       color: "cyan"    },
              { label: "Actifs",         value: stats.active,   icon: CheckCircle2, color: "emerald" },
              { label: "Inactifs",       value: stats.inactive, icon: XCircle,      color: "amber"   },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-2xl p-5 flex items-center gap-4
                  dark:bg-[#0c1828] dark:border dark:border-white/[0.07]
                  bg-white border border-slate-200 shadow-sm">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center
                  ${color === "cyan"    ? "bg-cyan-500/15"    : ""}
                  ${color === "emerald" ? "bg-emerald-500/15" : ""}
                  ${color === "amber"   ? "bg-amber-500/15"   : ""}
                `}>
                  <Icon className={`w-5 h-5
                    ${color === "cyan"    ? "text-cyan-400"    : ""}
                    ${color === "emerald" ? "text-emerald-400" : ""}
                    ${color === "amber"   ? "text-amber-400"   : ""}
                  `} />
                </div>
                <div>
                  <div className="text-2xl font-extrabold dark:text-white text-slate-900">{value}</div>
                  <div className="text-xs dark:text-slate-500 text-slate-500 mt-0.5">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Toolbar ── */}
          <div className="rounded-2xl p-5
              dark:bg-[#0c1828] dark:border dark:border-white/[0.07]
              bg-white border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-slate-500 text-slate-400" />
                <Input
                  placeholder="Rechercher un examen..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Refresh */}
              <Button
                variant="outline"
                onClick={loadExams}
                disabled={loading}
                className="btn-ghost h-10 px-4 gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Actualiser
              </Button>

              {/* Add */}
              {canEdit && (
              <Button
                onClick={openCreate}
                className="btn-emerald h-10 px-4 gap-2 text-sm font-bold"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </Button>
              )}
            </div>

            {/* Status filters */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {(["ALL", "ACTIF", "INACTIF"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors
                    ${filterStatus === s
                      ? "bg-cyan-500 text-white"
                      : "dark:bg-white/[0.05] dark:text-slate-400 dark:hover:bg-white/[0.1] bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  {s === "ALL" ? "Tous" : s === "ACTIF" ? "Actifs" : "Inactifs"}
                </button>
              ))}
            </div>
          </div>

          {/* ── Load error ── */}
          {loadError && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm
                bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {loadError}
            </div>
          )}

          {/* ── Content ── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-3" />
              <p className="text-sm dark:text-slate-400 text-slate-500">Chargement des examens…</p>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl
                dark:bg-[#0c1828] dark:border dark:border-white/[0.07]
                bg-white border border-slate-200">
              <Beaker className="w-12 h-12 dark:text-slate-700 text-slate-300 mb-3" />
              <p className="text-sm dark:text-slate-400 text-slate-500">
                {search || filterStatus !== "ALL"
                  ? "Aucun examen ne correspond aux filtres"
                  : "Aucun examen dans le catalogue — cliquez Ajouter"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExams.map((exam) => (
                <div key={exam.id}
                  className="rounded-2xl px-5 py-4 flex items-center gap-4
                    dark:bg-[#0c1828] dark:border dark:border-white/[0.07] dark:hover:border-white/[0.14]
                    bg-white border border-slate-200 hover:border-slate-300
                    transition-all duration-150 shadow-sm">

                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center shrink-0">
                    <Beaker className="w-5 h-5 text-cyan-400" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold dark:text-white text-slate-900 truncate">{exam.name}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0
                        ${exam.is_active
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                        {exam.is_active ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                        {exam.is_active ? "Actif" : "Inactif"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs dark:text-slate-500 text-slate-400">
                      {exam.unit && <span>Unité : <span className="dark:text-slate-300 text-slate-600 font-medium">{exam.unit}</span></span>}
                      {exam.description && <span className="truncate max-w-xs">{exam.description}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openView(exam)}
                      title="Voir les détails"
                      className="w-8 h-8 rounded-lg flex items-center justify-center
                        dark:hover:bg-cyan-500/15 hover:bg-cyan-50
                        dark:text-slate-400 text-slate-500 dark:hover:text-cyan-400 hover:text-cyan-600
                        transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {canEdit && (
                    <button
                      onClick={() => openEdit(exam)}
                      title="Modifier"
                      className="w-8 h-8 rounded-lg flex items-center justify-center
                        dark:hover:bg-amber-500/15 hover:bg-amber-50
                        dark:text-slate-400 text-slate-500 dark:hover:text-amber-400 hover:text-amber-600
                        transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    )}
                    {canDelete && (
                    <button
                      onClick={() => openDelete(exam)}
                      title="Supprimer"
                      className="w-8 h-8 rounded-lg flex items-center justify-center
                        dark:hover:bg-red-500/15 hover:bg-red-50
                        dark:text-slate-400 text-slate-500 dark:hover:text-red-400 hover:text-red-600
                        transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex gap-2 justify-center items-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost"
              >
                Précédent
              </Button>
              <span className="text-sm dark:text-slate-400 text-slate-500 px-3">
                Page {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-ghost"
              >
                Suivant
              </Button>
            </div>
          )}

        </div>

        {/* ── Dialogs / Sheet ── */}
        <ExamDetailSheet
          open={modal.type === "view"}
          exam={modal.type === "view" ? modal.exam : null}
          onClose={closeModal}
          onEdit={openEdit}
          canEdit={canEdit}
        />

        <ExamFormDialog
          mode={modal.type === "edit" ? "edit" : "create"}
          exam={modal.type === "edit" ? modal.exam : null}
          open={modal.type === "create" || modal.type === "edit"}
          onClose={closeModal}
          saving={saving}
          error={error}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />

        <DeleteConfirmDialog
          open={modal.type === "delete"}
          itemName={modal.type === "delete" ? modal.exam.name : ""}
          itemType="cet examen"
          saving={saving}
          onConfirm={() => modal.type === "delete" && handleDelete(modal.exam.id)}
          onCancel={closeModal}
        />

      </RoleGuard>
    </ProtectedRoute>
  );
}
