"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity, ArrowRight, Users, ClipboardList, FlaskConical,
  Receipt, ShieldCheck, Beaker, Stethoscope, UserCheck,
  TestTube2, FileText, ChevronRight, CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import patientService       from "@/services/api/patient";
import examRequestService   from "@/services/api/exam-request";
import resultService        from "@/services/api/result";
import { useAuthStore }     from "@/lib/auth-store";

/* ─────────────────────────────── WORKFLOW STEPS ─── */
const workflowSteps = [
  {
    step: "01",
    icon: Users,
    title: "Enregistrement Patient",
    desc: "La réceptionniste crée le dossier du patient avec toutes ses informations médicales et administratives.",
    actor: "Réceptionniste",
    color: "blue",
  },
  {
    step: "02",
    icon: ClipboardList,
    title: "Demande d'Examen",
    desc: "Le médecin ou la réceptionniste créée une demande d'analyse biologique pour le patient.",
    actor: "Médecin / Réceptionniste",
    color: "purple",
  },
  {
    step: "03",
    icon: TestTube2,
    title: "Prélèvement & Analyse",
    desc: "Le préleveur collecte l'échantillon. Le technicien réalise l'analyse et saisit les résultats.",
    actor: "Préleveur · Technicien",
    color: "teal",
  },
  {
    step: "04",
    icon: Receipt,
    title: "Résultats & Facturation",
    desc: "Les résultats sont consultables par le médecin. La réceptionniste génère la facture et enregistre le paiement.",
    actor: "Médecin · Admin",
    color: "emerald",
  },
];

/* ─────────────────────────────── ROLES ─────────────────── */
const roles = [
  {
    icon: ShieldCheck,
    title: "Administrateur",
    color: "red",
    perms: [
      "Accès complet à toutes les fonctionnalités",
      "Gestion des utilisateurs et des rôles",
      "Suppression de n'importe quel enregistrement",
      "Accès au panneau d'administration",
    ],
  },
  {
    icon: UserCheck,
    title: "Réceptionniste",
    color: "blue",
    perms: [
      "Enregistrement et modification des patients",
      "Création de demandes d'examens",
      "Gestion de la facturation",
      "Consultation de tous les dossiers",
    ],
  },
  {
    icon: Stethoscope,
    title: "Préleveur",
    color: "amber",
    perms: [
      "Consultation des demandes d'examens",
      "Prise en charge d'une demande (EN_ATTENTE → EN_COURS)",
      "Accès aux dossiers patients",
    ],
  },
  {
    icon: FlaskConical,
    title: "Technicien Labo",
    color: "teal",
    perms: [
      "Saisie et modification des résultats",
      "Clôture d'une demande (EN_COURS → TERMINÉ)",
      "Gestion du catalogue d'analyses",
    ],
  },
  {
    icon: Beaker,
    title: "Médecin",
    color: "emerald",
    perms: [
      "Consultation des résultats biologiques",
      "Accès aux dossiers patients",
      "Consultation des demandes d'examens",
    ],
  },
];

/* ─────────────────────────────── FEATURES ──────────────── */
const features = [
  { icon: Users,       title: "Gestion des Patients",       desc: "Dossiers complets avec numéro de dossier, historique, coordonnées et statut actif/inactif.", color: "blue"    },
  { icon: ClipboardList,title: "Demandes d'Examens",        desc: "Workflow de statuts (En attente → En cours → Terminé/Annulé) avec transitions contrôlées par rôle.", color: "purple"  },
  { icon: FlaskConical, title: "Résultats Biologiques",     desc: "Saisie des valeurs mesurées, valeurs de référence et statut (Normal / Anormal / Critique).", color: "teal"    },
  { icon: Receipt,      title: "Facturation & Paiements",   desc: "Création de factures liées aux demandes, suivi des paiements et statuts (Envoyée / Payée / En retard).", color: "amber"   },
  { icon: Beaker,       title: "Catalogue d'Analyses",      desc: "Bibliothèque des types d'examens avec unités de mesure et valeurs de référence configurables.", color: "cyan"    },
  { icon: ShieldCheck,  title: "Contrôle d'Accès (RBAC)",   desc: "5 rôles distincts avec permissions fines. Chaque action est vérifiée côté backend et frontend.", color: "emerald" },
];

/* ─────────────────────────────── COLOR MAPS ────────────── */
const colorMap: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  blue:    { bg: "bg-blue-500/10",    text: "text-blue-400",    border: "border-blue-500/20",    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20"    },
  purple:  { bg: "bg-purple-500/10",  text: "text-purple-400",  border: "border-purple-500/20",  badge: "bg-purple-500/10 text-purple-400 border-purple-500/20"  },
  teal:    { bg: "bg-teal-500/10",    text: "text-teal-400",    border: "border-teal-500/20",    badge: "bg-teal-500/10 text-teal-400 border-teal-500/20"    },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  amber:   { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/20",   badge: "bg-amber-500/10 text-amber-400 border-amber-500/20"   },
  red:     { bg: "bg-red-500/10",     text: "text-red-400",     border: "border-red-500/20",     badge: "bg-red-500/10 text-red-400 border-red-500/20"     },
  cyan:    { bg: "bg-cyan-500/10",    text: "text-cyan-400",    border: "border-cyan-500/20",    badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"    },
};

/* ─────────────────────────────── LIVE STATS HOOK ───────── */
function useLiveStats() {
  const { accessToken } = useAuthStore();
  const [stats, setStats] = useState<{ patients: number; requests: number; results: number } | null>(null);

  useEffect(() => {
    if (!accessToken) return; // only fetch if authenticated
    (async () => {
      try {
        const [p, r, res] = await Promise.all([
          patientService.getPatients(1, 1),
          examRequestService.getExamRequests(1, 1),
          resultService.getResults(1, 1),
        ]);
        setStats({ patients: p.total ?? 0, requests: r.total ?? 0, results: res.total ?? 0 });
      } catch { /* silent */ }
    })();
  }, [accessToken]);

  return stats;
}

/* ─────────────────────────────── PAGE ──────────────────── */
export default function HomePage() {
  const stats = useLiveStats();

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden" style={{ background: "#050c1a" }}>

      {/* ── Ambient glow ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-emerald-500/[0.05] rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-32 w-[600px] h-[600px] bg-blue-600/[0.04] rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 left-0 w-[500px] h-[400px] bg-teal-500/[0.04] rounded-full blur-[100px]" />
        <div className="absolute inset-0 dot-pattern opacity-20" />
      </div>

      <Navbar />

      <main className="flex-1 relative z-10">

        {/* ══════════════════ HERO ══════════════════════════════════ */}
        <section className="relative pt-16 pb-24 px-5 flex flex-col items-center text-center">

          {/* Pill badge */}
          <div className="animate-fade-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/[0.07] text-emerald-400 text-xs font-bold uppercase tracking-widest mb-8">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Plateforme Médicale · Gestion de Laboratoire
          </div>

          {/* Headline */}
          <h1
            className="animate-slide-up max-w-4xl font-display font-extrabold tracking-tight leading-[1.08] text-white mb-6"
            style={{ fontSize: "clamp(2.4rem, 6vw, 4.8rem)" }}
          >
            Gérez votre laboratoire médical{" "}
            <span className="gradient-text-hero">de A à Z.</span>
          </h1>

          <p className="animate-slide-up delay-100 max-w-2xl text-base md:text-lg text-slate-400 leading-relaxed mb-10">
            NovaBio centralise la gestion des patients, des demandes d&apos;examens, des résultats biologiques
            et de la facturation — avec un contrôle d&apos;accès précis pour chaque rôle de votre équipe.
          </p>

          {/* Bootstrap-style CTA buttons */}
          <div className="animate-slide-up delay-200 flex flex-col sm:flex-row gap-3 mb-14">
            <Link href="/login">
              <button className="
                h-12 px-8 rounded text-base font-bold
                bg-emerald-500 text-white border-2 border-emerald-500
                hover:bg-emerald-600 hover:border-emerald-600
                active:bg-emerald-700
                transition-all duration-150 flex items-center gap-2 group shadow
              ">
                Accéder à la plateforme
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <a href="#workflow">
              <button className="
                h-12 px-8 rounded text-base font-semibold
                bg-transparent text-slate-300 border-2 border-slate-600
                hover:border-slate-400 hover:text-white
                active:bg-white/[0.05]
                transition-all duration-150 flex items-center gap-2
              ">
                Comment ça marche
                <ChevronRight className="w-4 h-4" />
              </button>
            </a>
          </div>

          {/* Live stats — only shown when authenticated */}
          {stats && (
            <div className="animate-fade-in flex flex-wrap justify-center gap-6">
              {[
                { label: "Patients enregistrés", value: stats.patients, icon: Users,         color: "blue"    },
                { label: "Demandes d'examens",   value: stats.requests, icon: ClipboardList,  color: "purple"  },
                { label: "Résultats enregistrés",value: stats.results,  icon: FlaskConical,   color: "teal"    },
              ].map(({ label, value, icon: Icon, color }) => {
                const c = colorMap[color];
                return (
                  <div key={label} className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${c.border} ${c.bg}`}>
                    <Icon className={`w-5 h-5 ${c.text}`} />
                    <div className="text-left">
                      <div className={`text-2xl font-extrabold ${c.text}`}>{value}</div>
                      <div className="text-xs text-slate-500">{label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Static trust badges when not authenticated */}
          {!stats && (
            <div className="animate-fade-in delay-300 flex flex-wrap justify-center gap-2">
              {[
                { icon: ShieldCheck, label: "Accès basé sur les rôles (RBAC)" },
                { icon: CheckCircle2, label: "Workflow de statuts intégré"    },
                { icon: FileText,    label: "Export & Facturation"             },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-semibold text-slate-400 border border-white/[0.06]">
                  <Icon className="w-3.5 h-3.5 text-emerald-400" />
                  {label}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ══════════════════ WORKFLOW ══════════════════════════════ */}
        <section id="workflow" className="relative py-24 border-y border-white/[0.05]" style={{ background: "rgba(10,18,32,0.6)" }}>
          <div className="max-w-6xl mx-auto px-6">

            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.1] bg-white/[0.03] text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Comment ça marche
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold font-display text-white mb-3">
                Le flux complet en <span className="gradient-text-emerald">4 étapes</span>
              </h2>
              <p className="text-slate-400 text-base max-w-lg mx-auto">
                De l&apos;enregistrement du patient jusqu&apos;à la délivrance des résultats et la facturation.
              </p>
            </div>

            {/* Steps grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
              {/* Connector line (desktop only) */}
              <div className="hidden lg:block absolute top-[2.75rem] left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-blue-500/30 via-teal-500/30 to-emerald-500/30" />

              {workflowSteps.map(({ step, icon: Icon, title, desc, actor, color }, i) => {
                const c = colorMap[color];
                return (
                  <div key={step} className={`relative flex flex-col rounded-2xl p-6 border ${c.border} ${c.bg} animate-fade-in`}
                    style={{ animationDelay: `${i * 100}ms` }}>
                    {/* Step number */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-5 h-5 ${c.text}`} />
                      </div>
                      <span className={`text-3xl font-extrabold font-display ${c.text} opacity-30`}>{step}</span>
                    </div>
                    <h3 className="font-bold text-white text-base mb-2 leading-snug">{title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed flex-1">{desc}</p>
                    <div className={`mt-4 inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${c.badge}`}>
                      {actor}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════ ROLES ═════════════════════════════════ */}
        <section id="roles" className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.1] bg-white/[0.03] text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              Gestion des accès
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold font-display text-white mb-3">
              5 rôles, <span className="gradient-text-emerald">des permissions précises</span>
            </h2>
            <p className="text-slate-400 text-base max-w-lg mx-auto">
              Chaque membre de votre équipe dispose exactement des accès dont il a besoin, ni plus, ni moins.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {roles.map(({ icon: Icon, title, color, perms }, i) => {
              const c = colorMap[color];
              return (
                <div key={title}
                  className={`group rounded-2xl p-5 border border-white/[0.07] hover:border-current transition-all duration-300 animate-fade-in`}
                  style={{ background: "rgba(10,21,37,0.7)", animationDelay: `${i * 80}ms` }}
                >
                  <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${c.text}`} />
                  </div>
                  <h3 className={`font-bold text-sm mb-3 ${c.text}`}>{title}</h3>
                  <ul className="space-y-1.5">
                    {perms.map((p) => (
                      <li key={p} className="flex items-start gap-1.5 text-xs text-slate-400">
                        <CheckCircle2 className={`w-3 h-3 ${c.text} shrink-0 mt-0.5`} />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════════ FEATURES ══════════════════════════════ */}
        <section id="features" className="relative py-24 border-t border-white/[0.05]" style={{ background: "rgba(10,18,32,0.5)" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.1] bg-white/[0.03] text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">
                <Beaker className="w-3.5 h-3.5 text-teal-400" />
                Fonctionnalités
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold font-display text-white mb-3">
                Tout ce dont votre labo a besoin
              </h2>
              <p className="text-slate-400 text-base max-w-lg mx-auto">
                Un système intégré couvrant l&apos;ensemble du cycle d&apos;analyse biologique.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map(({ icon: Icon, title, desc, color }, i) => {
                const c = colorMap[color];
                return (
                  <div key={title}
                    className={`group rounded-2xl p-7 border border-white/[0.06] hover:border-current transition-all duration-300 animate-fade-in hover:shadow-xl`}
                    style={{ background: "rgba(10,21,37,0.8)", animationDelay: `${i * 80}ms` }}
                  >
                    <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-5 h-5 ${c.text}`} />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════ CTA FINAL ═════════════════════════════ */}
        <section className="max-w-4xl mx-auto px-6 py-24">
          <div className="relative rounded-2xl overflow-hidden border border-emerald-500/20 p-12 md:p-16 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-teal-600/5 to-blue-600/10" />
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold font-display text-white mb-4">
                Prêt à démarrer ?
              </h2>
              <p className="text-slate-400 text-base mb-10 max-w-md mx-auto">
                Connectez-vous à votre espace et commencez à gérer votre laboratoire dès maintenant.
              </p>

              {/* Bootstrap-style buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/login">
                  <button className="
                    h-12 px-10 rounded text-base font-bold
                    bg-emerald-500 text-white border-2 border-emerald-500
                    hover:bg-emerald-600 hover:border-emerald-600
                    active:bg-emerald-700
                    transition-all duration-150 flex items-center gap-2 group shadow-md
                  ">
                    Se connecter
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <a href="#workflow">
                  <button className="
                    h-12 px-10 rounded text-base font-semibold
                    bg-transparent text-slate-300 border-2 border-slate-600
                    hover:border-slate-400 hover:text-white
                    transition-all duration-150
                  ">
                    Revoir le fonctionnement
                  </button>
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ══════════════════ FOOTER ════════════════════════════════ */}
      <footer className="relative border-t border-white/[0.05] pt-12 pb-7 z-10" style={{ background: "rgba(5,12,26,0.98)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-extrabold text-[17px] text-white font-display">
                    Nova<span className="text-emerald-400">Bio</span>
                  </span>
                  <span className="text-[9px] font-semibold text-slate-600 tracking-[0.18em] uppercase">Lab Platform</span>
                </div>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                Plateforme de gestion de laboratoire médical avec contrôle d&apos;accès par rôle, workflow de résultats et facturation intégrée.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-widest">Navigation</h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                {[
                  { label: "Accueil",        href: "/"          },
                  { label: "Fonctionnement", href: "#workflow"   },
                  { label: "Rôles",          href: "#roles"      },
                  { label: "Fonctionnalités",href: "#features"   },
                  { label: "Connexion",      href: "/login"      },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="hover:text-emerald-400 transition-colors">{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modules */}
            <div>
              <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-widest">Modules</h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                {["Patients", "Demandes d'examens", "Résultats biologiques", "Facturation", "Catalogue d'analyses"].map(l => (
                  <li key={l} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500/60 shrink-0" />
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/[0.05] pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-600 gap-3">
            <p>© {new Date().getFullYear()} NovaBio Lab. Tous droits réservés.</p>
            <div className="flex items-center gap-2">
              <div className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </div>
              <span>Tous les systèmes opérationnels</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
