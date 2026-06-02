"use client";

import Link from "next/link";
import {
  Activity, ArrowRight, Users, FlaskConical, Receipt,
  ClipboardList, ShieldCheck, CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";

/* ── 3 points clés ── */
const highlights = [
  {
    icon: Users,
    title: "Gestion des patients",
    desc: "Créez et gérez les dossiers patients avec numéro de dossier, historique et statut.",
    color: "blue",
  },
  {
    icon: ClipboardList,
    title: "Demandes & Résultats",
    desc: "Suivez chaque demande d'examen de la création jusqu'à la remise des résultats biologiques.",
    color: "teal",
  },
  {
    icon: Receipt,
    title: "Facturation intégrée",
    desc: "Générez les factures et suivez les paiements directement depuis la plateforme.",
    color: "amber",
  },
];

/* ── 5 rôles résumés ── */
const roles = [
  { label: "Administrateur",  desc: "Accès complet",              color: "red"     },
  { label: "Réceptionniste",  desc: "Patients & Facturation",     color: "indigo"  },
  { label: "Préleveur",       desc: "Gestion des prélèvements",   color: "amber"   },
  { label: "Technicien Labo", desc: "Saisie des résultats",       color: "purple"  },
  { label: "Médecin",         desc: "Consultation des résultats", color: "blue"    },
];

const dot: Record<string, string> = {
  red:    "bg-red-400",
  indigo: "bg-indigo-400",
  amber:  "bg-amber-400",
  purple: "bg-purple-400",
  blue:   "bg-blue-400",
  teal:   "bg-teal-400",
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] transition-colors duration-300">

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/[0.06] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-blue-600/[0.04] rounded-full blur-[100px]" />
        <div className="absolute inset-0 dot-pattern opacity-[0.15]" />
      </div>

      <Navbar />

      <main className="flex-1 relative z-10">

        {/* ════════ HERO ════════ */}
        <section className="max-w-4xl mx-auto px-6 pt-20 pb-28 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 border border-emerald-500/25 bg-emerald-500/[0.07] text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Plateforme de Laboratoire Médical
          </div>

          <h1
            className="font-display font-extrabold text-white leading-[1.08] tracking-tight mb-6"
            style={{ fontSize: "clamp(2.2rem, 5.5vw, 4.2rem)" }}
          >
            Gérez votre laboratoire<br />
            <span className="text-emerald-400">de A à Z.</span>
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed max-w-xl mx-auto mb-10">
            Patients, examens, résultats biologiques et facturation — centralisés en un seul endroit,
            avec un accès sécurisé pour chaque membre de votre équipe.
          </p>

          {/* Boutons Bootstrap */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login">
              <button className="
                h-11 px-8 text-sm font-bold
                bg-emerald-500 text-white border-2 border-emerald-500
                hover:bg-emerald-600 hover:border-emerald-600
                active:bg-emerald-700
                transition-all duration-150 flex items-center gap-2 group shadow
              ">
                Accéder à la plateforme
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/services">
              <button className="
                h-11 px-8 text-sm font-semibold
                bg-transparent text-slate-300 border-2 border-slate-600
                hover:border-slate-400 hover:text-white
                active:bg-white/[0.04]
                transition-all duration-150
              ">
                En savoir plus
              </button>
            </Link>
          </div>
        </section>

        {/* ════════ 3 POINTS CLÉS ════════ */}
        <section className="border-t border-white/[0.06]" style={{ background: "rgba(10,18,32,0.6)" }}>
          <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-6">
            {highlights.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="flex flex-col gap-4 p-6 border border-white/[0.06] rounded-sm" style={{ background: "rgba(10,21,37,0.7)" }}>
                <div className={`w-10 h-10 flex items-center justify-center border ${
                  color === "blue"  ? "bg-blue-500/10 border-blue-500/20 text-blue-400"   :
                  color === "teal"  ? "bg-teal-500/10 border-teal-500/20 text-teal-400"   :
                  "bg-amber-500/10 border-amber-500/20 text-amber-400"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ════════ RÔLES ════════ */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex flex-col md:flex-row gap-12 items-start">

            {/* Texte gauche */}
            <div className="md:w-1/3 shrink-0">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Contrôle d'accès</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white font-display leading-snug mb-3">
                5 rôles,<br />des accès précis.
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Chaque utilisateur voit et fait uniquement ce que son rôle lui permet.
                Aucun accès superflu, aucune donnée exposée inutilement.
              </p>
              <Link href="/login" className="mt-6 inline-block">
                <button className="
                  h-9 px-5 text-sm font-semibold
                  border-2 border-emerald-500 text-emerald-400 bg-transparent
                  hover:bg-emerald-500 hover:text-white
                  transition-all duration-150
                ">
                  Se connecter
                </button>
              </Link>
            </div>

            {/* Liste rôles */}
            <div className="flex-1 divide-y divide-white/[0.05]">
              {roles.map(({ label, desc, color }) => (
                <div key={label} className="flex items-center gap-4 py-4">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${dot[color]}`} />
                  <span className="font-semibold text-white text-sm w-36 shrink-0">{label}</span>
                  <span className="text-slate-500 text-sm">{desc}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500/50 ml-auto shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ CTA FINAL ════════ */}
        <section className="border-t border-white/[0.06]" style={{ background: "rgba(10,18,32,0.7)" }}>
          <div className="max-w-3xl mx-auto px-6 py-20 text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white mb-4">
              Prêt à commencer ?
            </h2>
            <p className="text-slate-400 text-base mb-8">
              Connectez-vous à votre espace et commencez à gérer votre laboratoire.
            </p>
            <Link href="/login">
              <button className="
                h-11 px-10 text-sm font-bold
                bg-emerald-500 text-white border-2 border-emerald-500
                hover:bg-emerald-600 hover:border-emerald-600
                active:bg-emerald-700
                transition-all duration-150 inline-flex items-center gap-2 group shadow
              ">
                Se connecter
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </section>

      </main>

      {/* ════════ FOOTER ════════ */}
      <footer className="border-t border-white/[0.05] py-6 relative z-10" style={{ background: "rgba(5,12,26,0.98)" }}>
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-slate-500">
              Nova<span className="text-emerald-500">Bio</span> Lab Platform
            </span>
          </div>

          <nav className="flex items-center gap-6">
            {[
              { label: "Accueil",         href: "/"          },
              { label: "Fonctionnalités", href: "/services"  },
              { label: "À Propos",        href: "/about"     },
              { label: "Connexion",       href: "/login"     },
            ].map(({ label, href }) => (
              <Link key={label} href={href} className="hover:text-slate-400 transition-colors">{label}</Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Système opérationnel</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
