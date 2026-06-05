"use client";

import { useEffect, useState, useCallback } from "react";
import { Shield, Search, ChevronLeft, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleGuard } from "@/components/auth/RoleGuard";
import apiClient from "@/services/api/client";
import { formatDate } from "@/lib/utils";

/* ─ Types ───────────────────────────────────────────────────────────── */
interface AuditLog {
  id: string;
  user_id: string;
  user_email: string;
  user_role: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, unknown> | null;
  status: string;
  ip_address: string;
  timestamp: string;
}

/* ─ Badge helpers ───────────────────────────────────────────────────── */
function statusBadge(status: string) {
  switch (status?.toUpperCase()) {
    case "SUCCESS": return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    case "FAILURE": return "bg-red-500/15 text-red-300 border-red-500/30";
    default:        return "bg-slate-500/15 text-slate-300 border-slate-500/30";
  }
}

function actionBadge(action: string) {
  switch (action?.toUpperCase()) {
    case "CREATE": return "bg-blue-500/15 text-blue-300 border-blue-500/30";
    case "READ":   return "bg-slate-500/15 text-slate-300 border-slate-500/30";
    case "UPDATE": return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    case "DELETE": return "bg-red-500/15 text-red-300 border-red-500/30";
    default:       return "bg-slate-500/15 text-slate-300 border-slate-500/30";
  }
}

function roleBadge(role: string) {
  switch (role?.toUpperCase()) {
    case "ADMIN":         return "bg-purple-500/15 text-purple-300 border-purple-500/30";
    case "DOCTOR":        return "bg-blue-500/15 text-blue-300 border-blue-500/30";
    case "LAB_TECH":      return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
    case "RECEPTIONIST":  return "bg-green-500/15 text-green-300 border-green-500/30";
    default:              return "bg-slate-500/15 text-slate-300 border-slate-500/30";
  }
}

const LIMIT = 50;

const RESOURCE_TYPES = [
  "patients", "factures", "paiements", "examens",
  "resultats", "utilisateurs", "demandes",
];

/* ─ Page ────────────────────────────────────────────────────────────── */
export default function AuditLogsPage() {
  const [logs, setLogs]                   = useState<AuditLog[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [page, setPage]                   = useState(0);          // offset = page * LIMIT
  const [hasMore, setHasMore]             = useState(false);

  // Filters
  const [actionFilter, setActionFilter]           = useState("");
  const [resourceTypeFilter, setResourceTypeFilter] = useState("");
  const [statusFilter, setStatusFilter]           = useState("");

  const loadLogs = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {
        limit: LIMIT,
        offset: pageNum * LIMIT,
      };
      if (actionFilter)       params.action        = actionFilter.toUpperCase();
      if (resourceTypeFilter) params.resource_type = resourceTypeFilter;
      if (statusFilter)       params.status        = statusFilter.toUpperCase();

      const resp = await apiClient.get<AuditLog[]>("/audit-logs", { params });
      const data: AuditLog[] = Array.isArray(resp.data) ? resp.data : [];
      setLogs(data);
      setHasMore(data.length === LIMIT);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        ?? "Impossible de charger les journaux d'audit.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [actionFilter, resourceTypeFilter, statusFilter]);

  useEffect(() => {
    setPage(0);
  }, [actionFilter, resourceTypeFilter, statusFilter]);

  useEffect(() => {
    void loadLogs(page);
  }, [loadLogs, page]);

  return (
    <ProtectedRoute>
    <RoleGuard allowedRoles={["ADMIN"]}>
    <div
      className="min-h-screen px-4 py-6"
      style={{ background: "linear-gradient(135deg, #060e1c 0%, #0a1525 60%, #050c18 100%)" }}
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-6">

        {/* ─ Page header ─ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
              <Shield className="w-4 h-4 text-purple-300" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">Journal d&apos;Audit</h1>
              <p className="text-xs text-slate-500 font-semibold">Traçabilité complète des opérations</p>
            </div>
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Admin uniquement
          </div>
        </div>

        {/* ─ Filter bar ─ */}
        <div
          className="rounded-2xl border p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center"
          style={{ background: "rgba(12,24,40,0.92)", borderColor: "rgba(255,255,255,0.07)" }}
        >
          {/* Action search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Filtrer par action (CREATE, DELETE…)"
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm font-semibold text-slate-200 placeholder-slate-600 outline-none border focus:border-emerald-500/40 transition-colors"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.07)",
              }}
            />
          </div>

          {/* Resource type select */}
          <select
            value={resourceTypeFilter}
            onChange={e => setResourceTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 outline-none border transition-colors cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.07)",
            }}
          >
            <option value="">Toutes les ressources</option>
            {RESOURCE_TYPES.map(rt => (
              <option key={rt} value={rt}>{rt}</option>
            ))}
          </select>

          {/* Status select */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-sm font-semibold text-slate-300 outline-none border transition-colors cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.07)",
            }}
          >
            <option value="">Tous les statuts</option>
            <option value="SUCCESS">Succès</option>
            <option value="FAILURE">Échec</option>
          </select>
        </div>

        {/* ─ Loading ─ */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-9 h-9 text-emerald-400 animate-spin" />
            <p className="text-sm font-semibold text-slate-400">Chargement des journaux...</p>
          </div>
        )}

        {/* ─ Error ─ */}
        {!loading && error && (
          <div
            className="rounded-2xl border p-6 flex items-center gap-3"
            style={{
              background: "rgba(239,68,68,0.07)",
              borderColor: "rgba(239,68,68,0.2)",
            }}
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm font-semibold text-red-300">{error}</p>
          </div>
        )}

        {/* ─ Empty state ─ */}
        {!loading && !error && logs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
            <Shield className="w-12 h-12 text-slate-700" />
            <p className="text-sm font-semibold">Aucun journal d&apos;audit trouvé.</p>
            <p className="text-xs text-slate-600">Modifiez les filtres ou attendez de nouvelles activités.</p>
          </div>
        )}

        {/* ─ Table ─ */}
        {!loading && !error && logs.length > 0 && (
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: "rgba(12,24,40,0.92)", borderColor: "rgba(255,255,255,0.07)" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                    {[
                      "Horodatage",
                      "Utilisateur",
                      "Rôle",
                      "Action",
                      "Ressource",
                      "ID",
                      "Statut",
                      "IP",
                    ].map(h => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => (
                    <tr
                      key={log.id}
                      className="border-t transition-colors hover:bg-white/[0.015]"
                      style={{ borderColor: "rgba(255,255,255,0.04)" }}
                    >
                      {/* Horodatage */}
                      <td className="px-4 py-3 text-slate-400 font-mono whitespace-nowrap">
                        {formatDate(log.timestamp)}
                      </td>

                      {/* Utilisateur */}
                      <td className="px-4 py-3 text-slate-300 font-semibold max-w-[160px] truncate">
                        {log.user_email}
                      </td>

                      {/* Rôle */}
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full border font-bold uppercase tracking-wide ${roleBadge(log.user_role)}`}>
                          {log.user_role}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full border font-bold uppercase tracking-wide ${actionBadge(log.action)}`}>
                          {log.action}
                        </span>
                      </td>

                      {/* Ressource */}
                      <td className="px-4 py-3 text-slate-400 font-semibold whitespace-nowrap">
                        {log.resource_type || "—"}
                      </td>

                      {/* ID */}
                      <td className="px-4 py-3 text-slate-600 font-mono max-w-[100px] truncate" title={log.resource_id}>
                        {log.resource_id ? log.resource_id.substring(0, 8) + "…" : "—"}
                      </td>

                      {/* Statut */}
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full border font-bold uppercase tracking-wide ${statusBadge(log.status)}`}>
                          {log.status === "SUCCESS" ? "Succès" : log.status === "FAILURE" ? "Échec" : log.status}
                        </span>
                      </td>

                      {/* IP */}
                      <td className="px-4 py-3 text-slate-500 font-mono whitespace-nowrap">
                        {log.ip_address || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ─ Pagination ─ */}
            <div
              className="flex items-center justify-between px-5 py-3 border-t"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <span className="text-xs font-semibold text-slate-500">
                Page {page + 1} · {logs.length} entrée{logs.length !== 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 border border-white/[0.07] hover:bg-white/[0.04] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Précédent
                </button>
                <button
                  disabled={!hasMore}
                  onClick={() => setPage(p => p + 1)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 border border-white/[0.07] hover:bg-white/[0.04] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Suivant
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </RoleGuard>
    </ProtectedRoute>
  );
}
