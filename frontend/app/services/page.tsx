"use client";

import Link from "next/link";
import {
  Activity, ArrowRight, Droplet, FlaskConical, Microscope,
  Shield, Code2, Clock, CheckCircle2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";

const services = [
  {
    icon: Droplet,
    title: "Hématologie",
    color: "red",
    analyses: ["NFS", "Formule leucocytaire", "VS", "Groupage sanguin"],
    desc: "Exploration complète des cellules sanguines et de la coagulation.",
  },
  {
    icon: FlaskConical,
    title: "Biochimie",
    color: "amber",
    analyses: ["Glycémie", "Créatinine", "Urée", "Bilan lipidique", "Ionogramme"],
    desc: "Dosages biochimiques pour le suivi métabolique et rénal.",
  },
  {
    icon: Microscope,
    title: "Microbiologie",
    color: "teal",
    analyses: ["Hémocultures", "ECBU", "Coproculture", "Antibiogramme"],
    desc: "Identification des agents infectieux et tests de sensibilité.",
  },
  {
    icon: Shield,
    title: "Immunologie",
    color: "blue",
    analyses: ["Sérologies virales", "Marqueurs tumoraux", "ANCA", "ANA"],
    desc: "Bilan immunitaire approfondi, auto-immunité et oncologie.",
  },
  {
    icon: Activity,
    title: "Hormonologie",
    color: "purple",
    analyses: ["TSH", "T3/T4", "Prolactine", "Cortisol", "LH/FSH"],
    desc: "Exploration du système endocrinien et du bilan hormonal.",
  },
  {
    icon: Code2,
    title: "Génétique",
    color: "emerald",
    analyses: ["PCR", "FISH", "Analyses chromosomiques", "NGS"],
    desc: "Analyses moléculaires et génomiques de haute précision.",
  },
];

const colorMap: Record<string, { border: string; text: string; iconBg: string; badge: string }> = {
  red:     { border: "rgba(239,68,68,0.2)",    text: "text-red-400",     iconBg: "bg-red-500/10",     badge: "bg-red-500/10 border-red-500/20"       },
  amber:   { border: "rgba(245,158,11,0.2)",   text: "text-amber-400",   iconBg: "bg-amber-500/10",   badge: "bg-amber-500/10 border-amber-500/20"   },
  teal:    { border: "rgba(20,184,166,0.2)",   text: "text-teal-400",    iconBg: "bg-teal-500/10",    badge: "bg-teal-500/10 border-teal-500/20"     },
  blue:    { border: "rgba(59,130,246,0.2)",   text: "text-blue-400",    iconBg: "bg-blue-500/10",    badge: "bg-blue-500/10 border-blue-500/20"     },
  purple:  { border: "rgba(168,85,247,0.2)",   text: "text-purple-400",  iconBg: "bg-purple-500/10",  badge: "bg-purple-500/10 border-purple-500/20" },
  emerald: { border: "rgba(16,185,129,0.2)",   text: "text-emerald-400", iconBg: "bg-emerald-500/10", badge: "bg-emerald-500/10 border-emerald-500/20" },
};

const steps = [
  {
    num: "01",
    title: "Ordonnance médicale",
    desc: "Apportez votre ordonnance ou effectuez une demande en ligne via votre espace patient.",
  },
  {
    num: "02",
    title: "Prélèvement au laboratoire",
    desc: "Nos techniciens qualifiés réalisent votre prélèvement dans un environnement stérile et sécurisé.",
  },
  {
    num: "03",
    title: "Résultats en ligne",
    desc: "Consultez vos résultats directement sur votre espace sécurisé, notifiés par email ou SMS.",
  },
];

const delais = [
  { type: "Urgences",          delai: "< 2 heures",   color: "text-red-400",    badge: "bg-red-500/10 border-red-500/20"       },
  { type: "Analyses standard", delai: "24 heures",    color: "text-amber-400",  badge: "bg-amber-500/10 border-amber-500/20"   },
  { type: "Spécialisées",      delai: "48 – 72 h",    color: "text-blue-400",   badge: "bg-blue-500/10 border-blue-500/20"     },
  { type: "Génétique",         delai: "7 – 21 jours", color: "text-purple-400", badge: "bg-purple-500/10 border-purple-500/20" },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#050c1a" }}>

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-emerald-500/[0.05] rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-blue-600/[0.04] rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <Navbar />

      <main className="flex-1 relative z-10">

        {/* ════════ HERO ════════ */}
        <section className="max-w-4xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 border border-emerald-500/25 bg-emerald-500/[0.07] text-emerald-400 text-xs font-bold uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Analyses Médicales
          </div>

          <h1
            className="font-display font-extrabold text-white leading-[1.08] tracking-tight mb-6"
            style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)" }}
          >
            Nos Services d&apos;Analyses<br />
            <span className="text-emerald-400">Médicales</span>
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed max-w-xl mx-auto">
            Analyses biologiques de précision, disponibles{" "}
            <span className="text-white font-semibold">24h/24</span> — résultats sécurisés et accessibles en ligne.
          </p>
        </section>

        {/* ════════ SERVICES GRID ════════ */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map(({ icon: Icon, title, color, analyses, desc }) => {
              const c = colorMap[color];
              return (
                <div
                  key={title}
                  className="group flex flex-col gap-4 p-6 transition-all duration-300 hover:shadow-[0_0_32px_rgba(16,185,129,0.08)]"
                  style={{
                    background: "rgba(12,24,40,0.7)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(16,185,129,0.3)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}
                >
                  <div
                    className={`w-11 h-11 flex items-center justify-center border ${c.iconBg} ${c.text}`}
                    style={{ borderColor: c.border }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className={`font-bold text-base mb-1 ${c.text}`}>{title}</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
                  </div>

                  <ul className="flex flex-col gap-1.5 mt-auto">
                    {analyses.map(a => (
                      <li key={a} className="flex items-center gap-2 text-slate-400 text-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/60 shrink-0" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════ HOW IT WORKS ════════ */}
        <section className="border-t border-white/[0.06]" style={{ background: "rgba(10,18,32,0.6)" }}>
          <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="text-center mb-14">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Processus</span>
              <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white mt-3">
                Comment ça fonctionne ?
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connector line (desktop) */}
              <div className="hidden md:block absolute top-8 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-emerald-500/30 via-emerald-500/20 to-emerald-500/30" />

              {steps.map(({ num, title, desc }) => (
                <div key={num} className="flex flex-col items-center text-center gap-4 relative">
                  <div className="w-16 h-16 rounded-full border-2 border-emerald-500/40 bg-emerald-500/[0.08] flex items-center justify-center text-emerald-400 font-extrabold text-lg z-10">
                    {num}
                  </div>
                  <h3 className="font-bold text-white text-base">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ TURNAROUND TIMES ════════ */}
        <section className="max-w-4xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Délais de rendu</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white">
              Résultats rapides et fiables
            </h2>
          </div>

          <div
            className="overflow-hidden border border-white/[0.07]"
            style={{ background: "rgba(12,24,40,0.7)" }}
          >
            <div
              className="grid grid-cols-2 px-6 py-3 border-b border-white/[0.06]"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type d&apos;analyse</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Délai indicatif</span>
            </div>
            {delais.map(({ type, delai, color, badge }, i) => (
              <div
                key={type}
                className={`grid grid-cols-2 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors ${
                  i < delais.length - 1 ? "border-b border-white/[0.04]" : ""
                }`}
              >
                <span className="text-sm font-medium text-slate-300">{type}</span>
                <div className="flex justify-end">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${badge} ${color}`}>
                    {delai}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-slate-600 mt-4">
            Les délais peuvent varier selon le volume et la complexité des analyses. Urgences traitées en priorité absolue.
          </p>
        </section>

        {/* ════════ CTA ════════ */}
        <section className="border-t border-white/[0.06]" style={{ background: "rgba(10,18,32,0.7)" }}>
          <div className="max-w-3xl mx-auto px-6 py-20 text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white mb-4">
              Prêt à consulter vos résultats ?
            </h2>
            <p className="text-slate-400 text-base mb-8">
              Accédez à votre espace personnel et retrouvez l&apos;ensemble de vos analyses en toute sécurité.
            </p>
            <Link href="/login">
              <button className="
                h-11 px-10 text-sm font-bold
                bg-emerald-500 text-white border-2 border-emerald-500
                hover:bg-emerald-600 hover:border-emerald-600
                active:bg-emerald-700
                transition-all duration-150 inline-flex items-center gap-2 group shadow
              ">
                Accéder à mon espace
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
              { label: "Accueil",   href: "/"         },
              { label: "Services",  href: "/services" },
              { label: "À Propos",  href: "/about"    },
              { label: "Connexion", href: "/login"    },
            ].map(({ label, href }) => (
              <Link key={label} href={href} className="hover:text-slate-400 transition-colors">
                {label}
              </Link>
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
