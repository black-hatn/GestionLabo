"use client";

import { useState, useEffect, useCallback } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Download, BarChart3, LineChart as LineChartIcon, Loader2, AlertCircle } from "lucide-react";
import { getAnalyticsSummary, type AnalyticsSummary } from "@/services/api/analytics";
import apiClient from "@/services/api/client";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function AnalyticsPage() {
  const [summary,      setSummary]      = useState<AnalyticsSummary | null>(null);
  const [tsData,       setTsData]       = useState<any>(null);
  const [examsByType,  setExamsByType]  = useState<{ name: string; value: number }[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, ts, byType] = await Promise.all([
        getAnalyticsSummary(),
        apiClient.get("/analytics/time-series?days=30"),
        apiClient.get("/analytics/exams-by-type"),
      ]);
      setSummary(data);
      setTsData(ts.data);
      setExamsByType(byType.data ?? []);
    } catch {
      setError("Impossible de charger les données analytiques.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* ── Graphe linéaire : croise patients / demandes / résultats par date ── */
  const buildMonthlyData = () => {
    if (!tsData) return [{ name: "—", patients: 0, examens: 0, resultats: 0 }];

    // Indexer chaque série par date
    const map: Record<string, { patients: number; examens: number; resultats: number }> = {};
    const ensure = (d: string) => { if (!map[d]) map[d] = { patients: 0, examens: 0, resultats: 0 }; };

    for (const r of tsData.patients_daily      ?? []) { ensure(r.date); map[r.date].patients  = r.count; }
    for (const r of tsData.exam_requests_daily ?? []) { ensure(r.date); map[r.date].examens   = r.count; }
    for (const r of tsData.results_daily       ?? []) { ensure(r.date); map[r.date].resultats = r.count; }

    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({
        name: new Date(date).toLocaleDateString("fr-FR", { month: "short", day: "numeric" }),
        ...v,
      }));
  };

  const monthlyData  = buildMonthlyData();
  const invoiceStatus = [
    { name: "Payée",      value: summary?.invoices_by_status?.PAYEE     ?? 0, color: "#10b981" },
    { name: "Envoyée",    value: summary?.invoices_by_status?.ENVOYEE   ?? 0, color: "#f59e0b" },
    { name: "En retard",  value: summary?.invoices_by_status?.EN_RETARD ?? 0, color: "#ef4444" },
    { name: "Brouillon",  value: summary?.invoices_by_status?.BROUILLON ?? 0, color: "#6b7280" },
    { name: "Annulée",    value: summary?.invoices_by_status?.ANNULEE   ?? 0, color: "#d1d5db" },
  ];

  const fmt = (v: number) =>
    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
    : v >= 1_000   ? `${(v / 1_000).toFixed(0)}K`
    : v.toFixed(0);

  const kpis = [
    { label: "Patients actifs",    value: summary?.active_patients    ?? 0, sub: `${summary?.total_patients ?? 0} total`,                     icon: "👥" },
    { label: "Demandes d'examen",  value: summary?.total_exam_requests ?? 0, sub: `${summary?.exam_requests_by_status?.EN_COURS ?? 0} en cours`, icon: "📋" },
    { label: "Factures",           value: summary?.total_invoices      ?? 0, sub: `${summary?.invoices_by_status?.EN_RETARD ?? 0} en retard`,   icon: "🧾" },
    { label: "Revenu encaissé",    value: null, raw: `${fmt(summary?.total_revenue ?? 0)} XOF`,
      sub: `${fmt(summary?.pending_revenue ?? 0)} XOF en attente`, icon: "💰" },
  ];

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["ADMIN", "LAB_TECH", "DOCTOR"]}>
        <div className="space-y-8 animate-fade-in">

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-extrabold mb-2">Analytique & Rapports 📊</h1>
                <p className="text-indigo-100 text-lg">Vue d&apos;ensemble des performances du laboratoire</p>
              </div>
              <div className="hidden md:block">
                <BarChart3 className="w-24 h-24 opacity-20" />
              </div>
            </div>
          </div>

          {/* Erreur */}
          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
              <button onClick={loadAll} className="ml-auto font-semibold underline hover:no-underline">Réessayer</button>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, i) => (
              <Card key={i} className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0">
                <div className="absolute top-0 right-0 w-20 h-20 opacity-10 rounded-full blur-2xl bg-indigo-500" />
                <CardContent className="pt-6 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-neutral-600 dark:text-slate-400 mb-2">{kpi.label}</p>
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                          <span className="text-neutral-400 dark:text-slate-500 text-sm">Chargement…</span>
                        </div>
                      ) : (
                        <>
                          <p className="text-3xl font-bold text-neutral-900 dark:text-slate-100">
                            {kpi.raw ?? (kpi.value ?? 0).toLocaleString("fr-FR")}
                          </p>
                          <div className="flex items-center gap-1 mt-3">
                            <TrendingUp className="w-4 h-4 text-indigo-400" />
                            <span className="text-sm font-medium text-indigo-400">{kpi.sub}</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="text-3xl">{kpi.icon}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Graphes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Courbes d'activité */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Tendances d&apos;Activité</CardTitle>
                    <CardDescription>Patients, demandes et résultats — 30 derniers jours</CardDescription>
                  </div>
                  <LineChartIcon className="w-6 h-6 text-indigo-600 opacity-30" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: "11px" }} />
                      <YAxis stroke="#6b7280" style={{ fontSize: "11px" }} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "0.75rem" }} />
                      <Legend wrapperStyle={{ paddingTop: "20px" }} />
                      <Line type="monotone" dataKey="patients"  stroke="#0ea5e9" strokeWidth={2} dot={false} name="Patients" />
                      <Line type="monotone" dataKey="examens"   stroke="#22c55e" strokeWidth={2} dot={false} name="Demandes" />
                      <Line type="monotone" dataKey="resultats" stroke="#f59e0b" strokeWidth={2} dot={false} name="Résultats" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Pie factures */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">État des Factures</CardTitle>
                    <CardDescription>Distribution par statut</CardDescription>
                  </div>
                  <BarChart3 className="w-6 h-6 text-indigo-600 opacity-30" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                  </div>
                ) : invoiceStatus.every(s => s.value === 0) ? (
                  <div className="flex flex-col items-center justify-center h-[300px] text-slate-400 gap-2">
                    <BarChart3 className="w-12 h-12 opacity-20" />
                    <p className="text-sm">Aucune facture pour le moment</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={invoiceStatus.filter(s => s.value > 0)}
                        cx="50%" cy="45%"
                        innerRadius={60} outerRadius={110}
                        paddingAngle={2}
                        label={({ name, value }) => `${name}: ${value}`}
                        dataKey="value"
                      >
                        {invoiceStatus.filter(s => s.value > 0).map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `${v} facture(s)`} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Examens par type */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Examens par Type</CardTitle>
                  <CardDescription>Répartition des demandes d&apos;examens par analyse</CardDescription>
                </div>
                <BarChart3 className="w-6 h-6 text-indigo-600 opacity-30" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-[300px]">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                </div>
              ) : examsByType.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-slate-400 gap-2">
                  <BarChart3 className="w-12 h-12 opacity-20" />
                  <p className="text-sm">Aucune demande d&apos;examen enregistrée</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={examsByType} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                    <XAxis type="number" stroke="#6b7280" style={{ fontSize: "11px" }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" stroke="#6b7280" style={{ fontSize: "11px" }} width={130} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "0.75rem" }} />
                    <Bar dataKey="value" fill="#6366f1" name="Demandes" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Export */}
          <div className="flex justify-end pt-4">
            <Button onClick={loadAll} variant="outline" className="gap-2 mr-3">
              <Loader2 className="w-4 h-4" />
              Actualiser
            </Button>
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md">
              <Download className="w-4 h-4" />
              Exporter le rapport
            </Button>
          </div>

        </div>
      </RoleGuard>
    </ProtectedRoute>
  );
}
