"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/auth-store";
import { useState, useEffect, useCallback } from "react";
import {
  Users, Activity, Receipt, AlertCircle, Zap, Brain,
  ChevronRight, FlaskConical, ShieldOff, Loader2,
  ClipboardList, Beaker, UserCheck,
} from "lucide-react";
import { useDashboardActions } from "@/hooks/use-dashboard-actions";
import { ScheduleExamDialog } from "@/components/dashboard/schedule-exam-dialog";
import { ReportDialog }        from "@/components/dashboard/report-dialog";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import patientService       from "@/services/api/patient";
import examRequestService   from "@/services/api/exam-request";
import resultService        from "@/services/api/result";
import invoiceService       from "@/services/api/invoice";

/* ─ Constants ──────────────────────────────────────────── */
const VALID_ROLES = ["ADMIN", "RECEPTIONIST", "COLLECTOR", "LAB_TECH", "DOCTOR"] as const;
type ValidRole = typeof VALID_ROLES[number];

const ROLE_LABELS: Record<ValidRole, string> = {
  ADMIN:        "Administrateur",
  RECEPTIONIST: "Réceptionniste",
  COLLECTOR:    "Préleveur",
  LAB_TECH:     "Technicien de Laboratoire",
  DOCTOR:       "Médecin",
};

/* Actions rapides par rôle */
const QUICK_ACTIONS: Record<ValidRole, { label: string; href: string; icon: React.ElementType; color: string }[]> = {
  ADMIN: [
    { label: "Nouveau Patient",   href: "/dashboard/patients",      icon: Users,        color: "emerald" },
    { label: "Demande d'Examen",  href: "/dashboard/exam-requests", icon: ClipboardList, color: "purple"  },
    { label: "Saisir Résultat",   href: "/dashboard/results",       icon: FlaskConical,  color: "teal"    },
    { label: "Gestion Utilisateurs", href: "/dashboard/users",      icon: UserCheck,     color: "red"     },
  ],
  RECEPTIONIST: [
    { label: "Nouveau Patient",   href: "/dashboard/patients",      icon: Users,        color: "emerald" },
    { label: "Demande d'Examen",  href: "/dashboard/exam-requests", icon: ClipboardList, color: "purple"  },
    { label: "Facturation",       href: "/dashboard/invoices",      icon: Receipt,       color: "amber"   },
    { label: "Tous les Patients", href: "/dashboard/patients",      icon: Users,        color: "blue"    },
  ],
  COLLECTOR: [
    { label: "Mes Prélèvements",  href: "/dashboard/exam-requests", icon: ClipboardList, color: "amber"  },
    { label: "Patients",          href: "/dashboard/patients",      icon: Users,        color: "blue"    },
    { label: "Résultats",         href: "/dashboard/results",       icon: Activity,     color: "teal"    },
    { label: "Tableau de Bord",   href: "/dashboard",               icon: Beaker,       color: "emerald" },
  ],
  LAB_TECH: [
    { label: "Saisir Résultat",   href: "/dashboard/results",       icon: FlaskConical,  color: "teal"    },
    { label: "Demandes en cours", href: "/dashboard/exam-requests", icon: ClipboardList, color: "purple"  },
    { label: "Catalogue Analyses",href: "/dashboard/exams",         icon: Beaker,        color: "cyan"    },
    { label: "Patients",          href: "/dashboard/patients",      icon: Users,        color: "blue"    },
  ],
  DOCTOR: [
    { label: "Résultats",         href: "/dashboard/results",       icon: FlaskConical,  color: "teal"    },
    { label: "Patients",          href: "/dashboard/patients",      icon: Users,        color: "blue"    },
    { label: "Demandes Examens",  href: "/dashboard/exam-requests", icon: ClipboardList, color: "purple"  },
    { label: "Catalogue",         href: "/dashboard/exams",         icon: Beaker,        color: "cyan"    },
  ],
};

/* ─ Stat Card ──────────────────────────────────────────── */
function StatCard({ title, value, icon: Icon, color, loading }: {
  title: string; value: number | null; icon: React.ElementType; color: string; loading: boolean;
}) {
  const colorMap: Record<string, string> = {
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    blue:    "text-blue-400 bg-blue-500/10 border-blue-500/20",
    teal:    "text-teal-400 bg-teal-500/10 border-teal-500/20",
    amber:   "text-amber-400 bg-amber-500/10 border-amber-500/20",
    purple:  "text-purple-400 bg-purple-500/10 border-purple-500/20",
  };
  const c = colorMap[color] ?? colorMap.emerald;
  return (
    <div className={`card-premium rounded-2xl p-6 border border-white/[0.06] hover:shadow-xl transition-all duration-300`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${c}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-3xl font-extrabold text-white font-display leading-none mb-1">
        {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-600" /> : (value ?? 0).toLocaleString("fr-FR")}
      </div>
      <div className="text-xs font-medium text-slate-500">{title}</div>
    </div>
  );
}

/* ─ Accès refusé ────────────────────────────────────────── */
function AccessDenied({ role }: { role: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-5 animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <ShieldOff className="w-10 h-10 text-red-400" />
      </div>
      <div>
        <h2 className="text-2xl font-extrabold text-white mb-2">Rôle non reconnu</h2>
        <p className="text-slate-400 text-sm max-w-sm">
          Votre compte a le rôle <span className="font-bold text-red-400">&quot;{role}&quot;</span> qui n&apos;est plus valide dans ce système.
          Veuillez contacter l&apos;administrateur pour mettre à jour votre rôle.
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <p className="text-xs text-slate-600">Rôles valides :</p>
        {VALID_ROLES.map(r => (
          <div key={r} className="flex items-center gap-2 text-xs text-slate-400 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            {ROLE_LABELS[r]}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─ Page ────────────────────────────────────────────────── */
export default function DashboardPage() {
  const user = useAuthStore(state => state.user);
  const role = (user?.role ?? "") as ValidRole;
  const isValidRole = VALID_ROLES.includes(role);

  /* Stats live */
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError]     = useState(false);
  const [stats, setStats] = useState({ patients: 0, exams: 0, results: 0, invoices: 0 });
  const [critiques, setCritiques] = useState(0);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(false);
    const newStats = { patients: 0, exams: 0, results: 0, invoices: 0 };
    let failed = 0;

    try {
      const p = await patientService.getPatients(1, 1);
      newStats.patients = p?.total ?? 0;
    } catch { failed++; }

    try {
      const e = await examRequestService.getExamRequests(1, 1);
      newStats.exams = e?.total ?? 0;
    } catch { failed++; }

    if (role === "ADMIN" || role === "DOCTOR" || role === "LAB_TECH" || role === "COLLECTOR") {
      try {
        const r = await resultService.getResults(1, 1);
        newStats.results = r?.total ?? 0;
      } catch { failed++; }
    }

    if (role === "ADMIN" || role === "RECEPTIONIST" || role === "DOCTOR" || role === "LAB_TECH") {
      try {
        const inv = await invoiceService.getInvoices(1, 1);
        newStats.invoices = inv?.total ?? 0;
      } catch { failed++; }
    }

    setStats(newStats);
    if (failed > 0) setStatsError(true);

    if (role === "ADMIN" || role === "DOCTOR" || role === "LAB_TECH" || role === "COLLECTOR") {
      try {
        const allResults = await resultService.getResults(1, 100);
        const crit = (allResults?.items ?? []).filter((res: any) => res.status === "CRITIQUE").length;
        setCritiques(crit);
      } catch { /* non bloquant */ }
    }

    setStatsLoading(false);
  }, [role]);

  useEffect(() => { if (isValidRole) loadStats(); }, [isValidRole, loadStats]);

  /* Rôle invalide → écran d'accès refusé */
  if (!isValidRole) return <AccessDenied role={user?.role ?? "inconnu"} />;

  const roleLabel   = ROLE_LABELS[role];
  const quickActions = QUICK_ACTIONS[role] ?? QUICK_ACTIONS.DOCTOR;

  /* Stats à afficher selon le rôle */
  const statCards = (() => {
    if (role === "COLLECTOR") return [
      { title: "Patients",            value: stats.patients, icon: Users,        color: "blue"    },
      { title: "Demandes d'examens",  value: stats.exams,    icon: ClipboardList, color: "purple"  },
    ];
    if (role === "DOCTOR") return [
      { title: "Patients",            value: stats.patients, icon: Users,        color: "blue"    },
      { title: "Demandes d'examens",  value: stats.exams,    icon: ClipboardList, color: "purple"  },
      { title: "Résultats",           value: stats.results,  icon: FlaskConical,  color: "teal"    },
    ];
    if (role === "LAB_TECH") return [
      { title: "Demandes d'examens",  value: stats.exams,    icon: ClipboardList, color: "purple"  },
      { title: "Résultats saisis",    value: stats.results,  icon: FlaskConical,  color: "teal"    },
      { title: "Patients",            value: stats.patients, icon: Users,        color: "blue"    },
    ];
    if (role === "RECEPTIONIST") return [
      { title: "Patients enregistrés", value: stats.patients, icon: Users,        color: "emerald" },
      { title: "Demandes d'examens",   value: stats.exams,    icon: ClipboardList, color: "purple"  },
      { title: "Factures",             value: stats.invoices, icon: Receipt,       color: "amber"   },
    ];
    /* ADMIN : tout */
    return [
      { title: "Patients",           value: stats.patients, icon: Users,        color: "emerald" },
      { title: "Demandes d'examens", value: stats.exams,    icon: ClipboardList, color: "purple"  },
      { title: "Résultats",          value: stats.results,  icon: FlaskConical,  color: "teal"    },
      { title: "Factures",           value: stats.invoices, icon: Receipt,       color: "amber"   },
    ];
  })();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { openDialog, openSchedule, openReport, closeDialog } = useDashboardActions();

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Dialogs */}
      <ScheduleExamDialog open={openDialog === "schedule"} onClose={closeDialog} />
      <ReportDialog       open={openDialog === "report"}   onClose={closeDialog} />

      {/* ── Welcome Banner ── */}
      <div className="relative rounded-2xl overflow-hidden border border-emerald-500/15 p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-teal-600/8 to-blue-600/5" />
        <div className="absolute inset-0 dot-pattern opacity-20" />
        <div className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-[0.04]">
          <Brain className="w-48 h-48" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
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
            <button onClick={openSchedule}
              className="h-9 px-4 rounded-xl text-xs font-bold btn-ghost flex items-center gap-2">
              Planifier
            </button>
            <button onClick={openReport}
              className="h-9 px-4 rounded-xl text-xs font-bold btn-emerald flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" />
              Rapport
            </button>
          </div>
        </div>
      </div>

      {/* ── Alerte résultats critiques RÉELS ── */}
      {critiques > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 animate-scale-in" style={{ background: "rgba(239,68,68,0.05)" }}>
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <span className="font-bold text-red-300">{critiques} résultat{critiques > 1 ? "s" : ""} critique{critiques > 1 ? "s" : ""}</span>
            <span className="text-red-400/70"> nécessite{critiques > 1 ? "nt" : ""} une attention immédiate</span>
          </div>
          <Link href="/dashboard/results">
            <button className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1">
              Voir <ChevronRight className="w-3 h-3" />
            </button>
          </Link>
        </div>
      )}

      {/* ── Erreur stats ── */}
      {statsError && !statsLoading && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] text-amber-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Certaines statistiques n&apos;ont pas pu être chargées. Vérifiez la connexion au serveur.</span>
          <button onClick={loadStats} className="ml-auto text-xs font-bold underline hover:no-underline">Réessayer</button>
        </div>
      )}

      {/* ── Stats réelles ── */}
      <div className={`grid gap-4 ${statCards.length === 4 ? "grid-cols-2 lg:grid-cols-4" : statCards.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"}`}>
        {statCards.map(s => (
          <StatCard key={s.title} {...s} loading={statsLoading} />
        ))}
      </div>

      {/* ── Actions rapides selon le rôle ── */}
      <div className="card-premium rounded-2xl p-6 border border-white/[0.06]">
        <div className="mb-5">
          <h2 className="text-base font-bold text-white">Actions Rapides</h2>
          <p className="text-xs text-slate-500 mt-0.5">Raccourcis adaptés à votre rôle — {roleLabel}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map(({ label, href, icon: Icon, color }) => {
            const c: Record<string, string> = {
              emerald: "border-emerald-500/15 hover:border-emerald-500/30 hover:bg-emerald-500/[0.05] text-emerald-400",
              blue:    "border-blue-500/15 hover:border-blue-500/30 hover:bg-blue-500/[0.05] text-blue-400",
              teal:    "border-teal-500/15 hover:border-teal-500/30 hover:bg-teal-500/[0.05] text-teal-400",
              amber:   "border-amber-500/15 hover:border-amber-500/30 hover:bg-amber-500/[0.05] text-amber-400",
              purple:  "border-purple-500/15 hover:border-purple-500/30 hover:bg-purple-500/[0.05] text-purple-400",
              cyan:    "border-cyan-500/15 hover:border-cyan-500/30 hover:bg-cyan-500/[0.05] text-cyan-400",
              red:     "border-red-500/15 hover:border-red-500/30 hover:bg-red-500/[0.05] text-red-400",
            };
            return (
              <Link key={href + label} href={href}>
                <div className={`flex flex-col items-center gap-3 p-5 rounded-xl border transition-all duration-200 text-center cursor-pointer ${c[color] ?? c.blue}`}>
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-semibold text-slate-300 leading-tight">{label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Résumé rôle ── */}
      <div className="p-4 rounded-xl border border-emerald-500/15 flex items-start gap-3" style={{ background: "rgba(16,185,129,0.04)" }}>
        <Brain className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-bold text-emerald-400 mb-0.5">Votre espace {roleLabel}</div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            {{
              ADMIN:        "Accès complet. Vous gérez les utilisateurs, patients, analyses, résultats, factures et paiements.",
              RECEPTIONIST: "Vous enregistrez les patients, créez les demandes d'examens et gérez la facturation.",
              COLLECTOR:    "Vous prenez en charge les demandes d'examens en attente et effectuez les prélèvements.",
              LAB_TECH:     "Vous saisissez les résultats biologiques et gérez le catalogue d'analyses.",
              DOCTOR:       "Vous consultez les résultats biologiques et les dossiers patients.",
            }[role]}
          </p>
        </div>
      </div>
    </div>
  );
}
