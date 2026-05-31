"use client";

import { useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Download, BarChart3, LineChart as LineChartIcon } from "lucide-react";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");

  const monthlyData = [
    { name: "Jan", patients: 65, exams: 45, results: 38 },
    { name: "Feb", patients: 72, exams: 52, results: 42 },
    { name: "Mar", patients: 78, exams: 61, results: 55 },
    { name: "Apr", patients: 85, exams: 68, results: 62 },
    { name: "May", patients: 92, exams: 75, results: 70 },
    { name: "Jun", patients: 98, exams: 82, results: 78 },
  ];

  const invoiceStatus = [
    { name: "Payée", value: 1240, color: "#10b981" },
    { name: "En attente", value: 340, color: "#f59e0b" },
    { name: "En retard", value: 180, color: "#ef4444" },
  ];

  const examsByType = [
    { name: "Analyse Sang", value: 245 },
    { name: "Radiographie", value: 180 },
    { name: "Échographie", value: 150 },
    { name: "IRM", value: 120 },
    { name: "Scanner", value: 95 },
  ];

  const kpis = [
    { label: "Patients actifs", value: "1,234", change: "+12%", positive: true, icon: "👥" },
    { label: "Examen moyen/jour", value: "34", change: "+8%", positive: true, icon: "📋" },
    { label: "Résultats en retard", value: "12", change: "-5%", positive: true, icon: "⏱️" },
    { label: "Revenu total", value: "125K€", change: "+18%", positive: true, icon: "💰" },
  ];

  return (
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

      {/* Time Range Selector */}
      <div className="flex gap-2 flex-wrap">
        {(["week", "month", "year"] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? "default" : "outline"}
            onClick={() => setTimeRange(range)}
            className={timeRange === range ? "bg-indigo-600 hover:bg-indigo-700 shadow-md" : "hover:bg-neutral-100"}
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
                <div>
                  <p className="text-sm font-semibold text-neutral-600 mb-2">{kpi.label}</p>
                  <p className="text-3xl font-bold text-neutral-900">{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-3">
                    <TrendingUp className="w-4 h-4 text-secondary-600" />
                    <span className="text-sm font-medium text-secondary-600">{kpi.change}</span>
                  </div>
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
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={invoiceStatus}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={2}
                  label={({ name, value }) => `${name}: ${value}`}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {invoiceStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}€`} />
              </PieChart>
            </ResponsiveContainer>
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
  );
}
