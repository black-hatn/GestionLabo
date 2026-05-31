"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/auth-store";
import {
  Users, Activity, FileText, Receipt, TrendingUp, ArrowUpRight, ArrowDownRight,
  AlertCircle, Zap, Brain, Bell, Calendar, ChevronRight, FlaskConical, Beaker
} from "lucide-react";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";
import { ScheduleExamDialog } from "@/components/dashboard/schedule-exam-dialog";
import { ReportDialog } from "@/components/dashboard/report-dialog";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

/* ─ Static Demo Data ────────────────────────────────────── */
const chartData = [
  { month: "Jan", patients: 420, exams: 280, results: 350 },
  { month: "Fév", patients: 380, exams: 250, results: 320 },
  { month: "Mar", patients: 450, exams: 320, results: 400 },
  { month: "Avr", patients: 520, exams: 380, results: 480 },
  { month: "Mai", patients: 580, exams: 420, results: 550 },
  { month: "Jun", patients: 650, exams: 480, results: 620 },
];

const invoiceData = [
  { name: "Payées",     value: 65, color: "#10b981" },
  { name: "En attente", value: 25, color: "#f59e0b" },
  { name: "En retard",  value: 10, color: "#ef4444" },
];

const recentActivities = [
  { icon: "👤", label: "Nouveau patient ajouté",     patient: "Amina Diallo",    time: "2h",    type: "patient" },
  { icon: "🧪", label: "Examen analysé",             patient: "Ahmed Sow",       time: "45min", type: "exam" },
  { icon: "✓",  label: "Résultat validé",            patient: "Mimi Ndiaye",     time: "30min", type: "result" },
  { icon: "💰", label: "Facture émise",              patient: "Ousmane Ba",      time: "15min", type: "invoice" },
  { icon: "⚠️", label: "Résultat critique détecté",  patient: "Mariama Thiam",   time: "5min",  type: "alert" },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN:        "Administrateur",
  RECEPTIONIST: "Réceptionniste",
  COLLECTOR:    "Préleveur",
  LAB_TECH:     "Technicien de Laboratoire",
  DOCTOR:       "Médecin",
};

/* ─ Stat Card ───────────────────────────────────────────── */
function StatCard({
  title, value, icon: Icon, growth, color,
}: {
  title: string; value: number; icon: React.ElementType; growth: number; color: string;
}) {
  const positive = growth >= 0;
  const colorMap: Record<string, { icon: string; ring: string; glow: string }> = {
    emerald: { icon: "text-emerald-400 bg-emerald-500/10 border-emerald-500/15", ring: "border-emerald-500/20", glow: "shadow-emerald-500/5" },
    blue:    { icon: "text-blue-400 bg-blue-500/10 border-blue-500/15",          ring: "border-blue-500/20",    glow: "shadow-blue-500/5" },
    teal:    { icon: "text-teal-400 bg-teal-500/10 border-teal-500/15",          ring: "border-teal-500/20",    glow: "shadow-teal-500/5" },
    amber:   { icon: "text-amber-400 bg-amber-500/10 border-amber-500/15",       ring: "border-amber-500/20",   glow: "shadow-amber-500/5" },
  };
  const c = colorMap[color] ?? colorMap.emerald;

  return (
    <div className={`group card-premium rounded-2xl p-6 border ${c.ring} hover:shadow-xl ${c.glow} transition-all duration-300`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${c.icon} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${positive ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : "text-red-400 bg-red-500/10 border border-red-500/20"}`}>
          {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(growth)}%
        </div>
      </div>
      <div className="text-3xl font-extrabold text-white font-display leading-none mb-1">
        {value.toLocaleString("fr-FR")}
      </div>
      <div className="text-xs font-medium text-slate-500">{title}</div>
    </div>
  );
}

/* ─ Custom Recharts Tooltip ─────────────────────────────── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl p-3 border border-white/[0.08] shadow-dropdown">
      <p className="text-xs font-bold text-slate-400 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-xs font-semibold">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-white">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ─ Page ────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user } = useAuthStore();
  const roleLabel = ROLE_LABELS[user?.role ?? ""] ?? "Utilisateur";
  const isPatient = false; // Aucun rôle "patient" dans le système

  const stats = { totalPatients: 1250, totalExams: 3420, totalResults: 2890, totalInvoices: 450 };
  const growth = { patients: 12.5, exams: 8.3, results: 15.2, invoices: 5.8 };

  /* Patient view */
  if (isPatient) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Welcome */}
        <div className="relative rounded-2xl overflow-hidden border border-emerald-500/15 p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-teal-600/8 to-transparent" />
          <div className="absolute inset-0 dot-pattern opacity-20" />
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white font-display">
              Bonjour, {user?.first_name || "Patient"} 👋
            </h1>
            <p className="text-slate-400 mt-1">Espace Patient — NovaBio Lab</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="card-premium rounded-2xl p-6 border border-white/[0.06]">
            <h2 className="text-base font-bold text-white mb-1">Mes Derniers Résultats</h2>
            <p className="text-xs text-slate-500 mb-6">Consultez vos analyses biologiques récentes</p>
            <div className="text-center py-8">
              <Beaker className="w-10 h-10 mx-auto text-slate-700 mb-3" />
              <p className="text-sm text-slate-600">Aucun résultat disponible pour le moment</p>
            </div>
            <Link href="/dashboard/results">
              <button className="w-full h-10 rounded-xl text-sm font-bold btn-emerald mt-2">Voir tout l&apos;historique</button>
            </Link>
          </div>

          <div className="card-premium rounded-2xl p-6 border border-white/[0.06]">
            <h2 className="text-base font-bold text-white mb-1">Mes Factures</h2>
            <p className="text-xs text-slate-500 mb-6">Suivi de vos règlements</p>
            <div className="text-center py-8">
              <Receipt className="w-10 h-10 mx-auto text-slate-700 mb-3" />
              <p className="text-sm text-slate-600">Vous êtes à jour dans vos paiements</p>
            </div>
            <Link href="/dashboard/invoices">
              <button className="w-full h-10 rounded-xl text-sm font-semibold btn-ghost mt-2">Voir mes factures</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* Staff / Admin view */
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { openDialog, openSchedule, openReport, openAlert, closeDialog } = useDashboardActions();

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Dialogs */}
      <ScheduleExamDialog open={openDialog === "schedule"} onClose={closeDialog} />
      <ReportDialog       open={openDialog === "report"}   onClose={closeDialog} />

      {/* Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-emerald-500/15 p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-teal-600/8 to-blue-600/5" />
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-[0.04]">
          <Brain className="w-48 h-48" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Système opérationnel</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white font-display">
              Bienvenue, {user?.first_name || "Utilisateur"} 👋
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              {roleLabel} · NovaBio Lab · {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openSchedule}
              className="h-9 px-4 rounded-xl text-xs font-bold btn-ghost flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              Planifier
            </button>
            <button
              onClick={openReport}
              className="h-9 px-4 rounded-xl text-xs font-bold btn-emerald flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              Rapport IA
            </button>
          </div>
        </div>
      </div>

      {/* Critical Alert */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 animate-scale-in" style={{ background: "rgba(245,158,11,0.05)" }}>
        <AlertCircle className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1 text-sm">
          <span className="font-bold text-amber-300">3 résultats critiques</span>
          <span className="text-amber-400/70"> en attente de validation — action requise</span>
        </div>
        <Link href="/dashboard/results">
          <button className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
            Voir <ChevronRight className="w-3 h-3" />
          </button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Patients Actifs"    value={stats.totalPatients}  icon={Users}          growth={growth.patients}  color="emerald" />
        <StatCard title="Examens Traités"    value={stats.totalExams}     icon={FlaskConical}   growth={growth.exams}     color="blue" />
        <StatCard title="Résultats Validés"  value={stats.totalResults}   icon={Activity}       growth={growth.results}   color="teal" />
        <StatCard title="Factures Émises"    value={stats.totalInvoices}  icon={Receipt}        growth={growth.invoices}  color="amber" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Line Chart */}
        <div className="lg:col-span-2 card-premium rounded-2xl p-6 border border-white/[0.06]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white">Tendances d&apos;Activité</h2>
              <p className="text-xs text-slate-500 mt-0.5">Patients, examens et résultats sur 6 mois</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              {[
                { color: "#10b981", label: "Patients" },
                { color: "#3b82f6", label: "Examens" },
                { color: "#14b8a6", label: "Résultats" },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 0, right: 4, left: -24, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#4b6a8a" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#4b6a8a" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="patients" name="Patients" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="exams"    name="Examens"  stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="6 3" />
              <Line type="monotone" dataKey="results"  name="Résultats" stroke="#14b8a6" strokeWidth={2} dot={false} strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart */}
        <div className="card-premium rounded-2xl p-6 border border-white/[0.06] flex flex-col">
          <div className="mb-5">
            <h2 className="text-base font-bold text-white">Statut Factures</h2>
            <p className="text-xs text-slate-500 mt-0.5">Répartition des paiements</p>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={invoiceData} cx="50%" cy="50%" innerRadius={52} outerRadius={76} paddingAngle={4} dataKey="value">
                  {invoiceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`]} contentStyle={{ background: "rgba(10,21,37,0.98)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#e2e8f0", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            {invoiceData.map(({ name, value, color }) => (
              <div key={name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-slate-400">{name}</span>
                </div>
                <span className="font-bold text-white">{value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Activity Feed */}
        <div className="card-premium rounded-2xl p-6 border border-white/[0.06]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white">Activité Récente</h2>
              <p className="text-xs text-slate-500 mt-0.5">Dernières actions sur la plateforme</p>
            </div>
            <Bell className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex flex-col gap-3">
            {recentActivities.map(({ icon, label, patient, time, type }, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-default ${
                  type === "alert"
                    ? "border-amber-500/20 bg-amber-500/[0.04] hover:bg-amber-500/[0.07]"
                    : "border-white/[0.04] hover:bg-white/[0.03]"
                }`}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0" style={{ background: "rgba(255,255,255,0.05)" }}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-200 leading-none mb-0.5">{label}</div>
                  <div className="text-xs text-slate-500">{patient}</div>
                </div>
                <div className="text-[11px] text-slate-600 shrink-0">Il y a {time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-premium rounded-2xl p-6 border border-white/[0.06]">
          <div className="mb-5">
            <h2 className="text-base font-bold text-white">Actions Rapides</h2>
            <p className="text-xs text-slate-500 mt-0.5">Raccourcis vers les modules principaux</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Nouveau Patient",    href: "/dashboard/patients",     icon: Users,        color: "emerald" },
              { label: "Demande d'Examen",   href: "/dashboard/exam-requests",icon: FlaskConical, color: "blue" },
              { label: "Saisir Résultat",    href: "/dashboard/results",      icon: Activity,     color: "teal" },
              { label: "Créer Facture",      href: "/dashboard/invoices",     icon: Receipt,      color: "amber" },
            ].map(({ label, href, icon: Icon, color }) => {
              const c: Record<string, string> = {
                emerald: "border-emerald-500/15 hover:border-emerald-500/30 hover:bg-emerald-500/[0.05] text-emerald-400",
                blue:    "border-blue-500/15 hover:border-blue-500/30 hover:bg-blue-500/[0.05] text-blue-400",
                teal:    "border-teal-500/15 hover:border-teal-500/30 hover:bg-teal-500/[0.05] text-teal-400",
                amber:   "border-amber-500/15 hover:border-amber-500/30 hover:bg-amber-500/[0.05] text-amber-400",
              };
              return (
                <Link key={href} href={href}>
                  <div className={`flex flex-col items-center gap-3 p-5 rounded-xl border transition-all duration-200 text-center cursor-pointer ${c[color]}`}>
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-semibold text-slate-300 leading-tight">{label}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* IA summary */}
          <div className="mt-4 p-3.5 rounded-xl border border-emerald-500/15 flex items-start gap-3" style={{ background: "rgba(16,185,129,0.04)" }}>
            <Brain className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-emerald-400 mb-0.5">Résumé IA du jour</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Activité stable, +12.5% de patients actifs. Aucune anomalie systémique détectée. 3 résultats critiques à valider.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
