"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Download, BarChart3, LineChart as LineChartIcon, Loader2 } from "lucide-react";
import { getAnalyticsSummary, type AnalyticsSummary } from "@/services/api/analytics";
import apiClient from "@/services/api/client";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [tsData, setTsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSummary() {
      try {
        setLoading(true);
        setError(null);
        const data = await getAnalyticsSummary();
        setSummary(data);
        const ts = await apiClient.get('/analytics/time-series?days=30');
        setTsData(ts.data);
      } catch {
        setError("Impossible de charger les données analytiques.");
      } finally {
        setLoading(false);
      }
    }
    loadSummary();
  }, []);

  const monthlyData = tsData?.patients_daily?.map((d: any) => ({
    name: new Date(d.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
    patients: d.count,
    exams: 0,
    results: 0,
  })) ?? [
    { name: "—", patients: 0, exams: 0, results: 0 },
  ];

  const invoiceStatus = [
    { name: "Payée", value: summary?.invoices_by_status?.PAYEE ?? 0, color: "#10b981" },
    { name: "Envoyée", value: summary?.invoices_by_status?.ENVOYEE ?? 0, color: "#f59e0b" },
    { name: "En retard", value: summary?.invoices_by_status?.EN_RETARD ?? 0, color: "#ef4444" },
    { name: "Brouillon", value: summary?.invoices_by_status?.BROUILLON ?? 0, color: "#6b7280" },
    { name: "Annulée", value: summary?.invoices_by_status?.ANNULEE ?? 0, color: "#d1d5db" },
  ];

  const examsByType = [
    { name: "Analyse Sang", value: 245 },
    { name: "Radiographie", value: 180 },
    { name: "Échographie", value: 150 },
    { name: "IRM", value: 120 },
    { name: "Scanner", value: 95 },
  ];

  const formatRevenue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toFixed(0);
  };

  const kpis = [
    {
      label: "Patients actifs",
      value: loading ? "…" : (summary?.active_patients ?? 0).toLocaleString("fr-FR"),
      change: loading ? "" : `${summary?.total_patients ?? 0} total`,
      icon: "👥",
    },
    {
      label: "Demandes d'examen",
      value: loading ? "…" : (summary?.total_exam_requests ?? 0).toLocaleString("fr-FR"),
      change: loading ? "" : `${summary?.exam_requests_by_status?.EN_COURS ?? 0} en cours`,
      icon: "📋",
    },
    {
      label: "Factures",
      value: loading ? "…" : (summary?.total_invoices ?? 0).toLocaleString("fr-FR"),
      change: loading ? "" : `${summary?.invoices_by_status?.EN_RETARD ?? 0} en retard`,
      icon: "🧾",
    },
    {
      label: "Revenu encaissé",
      value: loading ? "…" : `${formatRevenue(summary?.total_revenue ?? 0)} XOF`,
      change: loading ? "" : `${formatRevenue(summary?.pending_revenue ?? 0)} XOF en attente`,
      icon: "💰",
    },
  ];

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["ADMIN", "LAB_TECH", "DOCTOR"]}>
    <div className="space-y-8 animate-fade-in">
      {/* Professional Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold mb-2">Analytique & Rapports 📊</h1>
            <p className="text-indigo-100 text-lg">Vue d'ensemble des performances du laboratoire</p>
          </div>
          <div className="hidden md:block">
            <BarChart3 className="w-24 h-24 opacity-20" />
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Time Range Selector */}
      <div className="flex gap-2 flex-wrap">
        {(["week", "month", "year"] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? "default" : "outline"}
            onClick={() => setTimeRange(range)}
            className={timeRange === range ? "bg-indigo-600 hover:bg-indigo-700 shadow-md" : "hover:bg-neutral-100 dark:hover:bg-white/[0.06]"}
          >
            {range === "week" ? "Semaine" : range === "month" ? "Mois" : "Année"}
          </Button>
        ))}
      </div>

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className="relative overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10 rounded-full blur-2xl bg-indigo-500"></div>
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
                      <p className="text-3xl font-bold text-neutral-900 dark:text-slate-100">{kpi.value}</p>
                      <div className="flex items-center gap-1 mt-3">
                        <TrendingUp className="w-4 h-4 text-secondary-600" />
                        <span className="text-sm font-medium text-secondary-600">{kpi.change}</span>
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Tendances d'Activité</CardTitle>
                <CardDescription>Patients, examen et résultats par mois</CardDescription>
              </div>
              <LineChartIcon className="w-6 h-6 text-indigo-600 opacity-30" />
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: "12px" }} />
                <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "2px solid #0ea5e9", borderRadius: "0.75rem", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }} />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                <Line type="monotone" dataKey="patients" stroke="#0ea5e9" strokeWidth={3} dot={{ fill: "#0ea5e9", r: 5 }} activeDot={{ r: 7 }} name="Patients" />
                <Line type="monotone" dataKey="exams" stroke="#22c55e" strokeWidth={3} dot={{ fill: "#22c55e", r: 5 }} activeDot={{ r: 7 }} name="Examen" />
                <Line type="monotone" dataKey="results" stroke="#f59e0b" strokeWidth={3} dot={{ fill: "#f59e0b", r: 5 }} activeDot={{ r: 7 }} name="Résultats" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={invoiceStatus.filter((s) => s.value > 0)}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={2}
                    label={({ name, value }) => `${name}: ${value}`}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {invoiceStatus.filter((s) => s.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} facture(s)`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Examens par Type</CardTitle>
              <CardDescription>Répartition des examens réalisés</CardDescription>
            </div>
            <BarChart3 className="w-6 h-6 text-indigo-600 opacity-30" />
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={examsByType}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: "12px" }} />
              <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
              <Tooltip contentStyle={{ backgroundColor: "#fff", border: "2px solid #0ea5e9", borderRadius: "0.75rem", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }} />
              <Bar dataKey="value" fill="#0ea5e9" name="Nombre d'examen" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Export Button */}
      <div className="flex justify-end pt-4">
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all">
          <Download className="w-4 h-4" />
          Exporter le rapport
        </Button>
      </div>
    </div>
      </RoleGuard>
    </ProtectedRoute>
  );
}
