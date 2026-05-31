/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import {
  Activity, ArrowRight, ChevronRight, Zap, ShieldCheck, Clock, Brain, BarChart3,
  TestTube2, Stethoscope, Star, Lock, Globe, Award, Check, Users, TrendingUp, Beaker
} from "lucide-react";
import { Navbar } from "@/components/Navbar";

/* ─ DATA ─────────────────────────────────────────── */
const stats = [
  { value: "1.2M+", label: "Analyses traitées", icon: Beaker },
  { value: "99.9%", label: "Précision IA", icon: Brain },
  { value: "50+",   label: "Établissements", icon: Users },
  { value: "<2s",   label: "Temps de réponse", icon: Zap },
];

const features = [
  {
    icon: Brain,
    title: "IA Prédictive NLP",
    desc: "Notre moteur d'IA analyse les valeurs biologiques et génère automatiquement des conclusions médicales contextualisées.",
    accent: "emerald",
    tag: "Nouveau",
  },
  {
    icon: Clock,
    title: "Alertes Temps Réel",
    desc: "Notifications instantanées pour les résultats critiques avec escalade automatique vers le médecin prescripteur.",
    accent: "teal",
    tag: null,
  },
  {
    icon: ShieldCheck,
    title: "Sécurité Niveau Militaire",
    desc: "Chiffrement AES-256 de bout en bout. Conformité totale aux normes RGPD, HIPAA et ISO 27001.",
    accent: "blue",
    tag: null,
  },
  {
    icon: BarChart3,
    title: "Analytics Avancés",
    desc: "Tableaux de bord personnalisables avec graphiques interactifs et tendances prédictives par cohorte.",
    accent: "indigo",
    tag: null,
  },
  {
    icon: TestTube2,
    title: "Catalogue d'Examens",
    desc: "Bibliothèque de 500+ types d'analyses avec plages de référence automatiquement intégrées et validées.",
    accent: "cyan",
    tag: null,
  },
  {
    icon: Stethoscope,
    title: "Aide au Diagnostic",
    desc: "Suggestions de corrélations biologiques croisées pour accompagner le praticien dans sa décision.",
    accent: "emerald",
    tag: "IA",
  },
];

const accentStyles: Record<string, { ring: string; icon: string; tag: string; glow: string }> = {
  emerald: {
    ring:  "group-hover:border-emerald-500/30",
    icon:  "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/15",
    tag:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    glow:  "group-hover:shadow-emerald-500/10",
  },
  teal: {
    ring:  "group-hover:border-teal-500/30",
    icon:  "bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/15",
    tag:   "bg-teal-500/10 text-teal-400 border-teal-500/20",
    glow:  "group-hover:shadow-teal-500/10",
  },
  blue: {
    ring:  "group-hover:border-blue-500/30",
    icon:  "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/15",
    tag:   "bg-blue-500/10 text-blue-400 border-blue-500/20",
    glow:  "group-hover:shadow-blue-500/10",
  },
  indigo: {
    ring:  "group-hover:border-indigo-500/30",
    icon:  "bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/15",
    tag:   "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    glow:  "group-hover:shadow-indigo-500/10",
  },
  cyan: {
    ring:  "group-hover:border-cyan-500/30",
    icon:  "bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/15",
    tag:   "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    glow:  "group-hover:shadow-cyan-500/10",
  },
};

const testimonials = [
  {
    name:   "Dr. Fatiha Benali",
    role:   "Chef de service, CHU Mustapha",
    quote:  "NovaBio Lab a transformé notre workflow. La détection automatique des anomalies critiques nous permet d'intervenir 3× plus vite.",
    avatar: "FB",
    color:  "from-emerald-500 to-teal-600",
  },
  {
    name:   "Pr. Ibrahima Sow",
    role:   "Biologiste médical, Clinique du Fleuve",
    quote:  "La qualité des interprétations IA est remarquable. Notre équipe gagne en moyenne 2h par jour sur la rédaction des comptes-rendus.",
    avatar: "IS",
    color:  "from-blue-500 to-indigo-600",
  },
  {
    name:   "Dr. Amara Koné",
    role:   "Médecin généraliste, Cabinet privé",
    quote:  "Interface intuitive, résultats instantanés. Je prescris et consulte les analyses de mes patients en quelques secondes depuis n'importe où.",
    avatar: "AK",
    color:  "from-teal-500 to-cyan-600",
  },
];

const planFeatures = [
  "Gestion illimitée des patients",
  "IA interprétative intégrée",
  "Alertes critiques en temps réel",
  "Export PDF des rapports",
  "Support prioritaire 24/7",
  "Conformité RGPD & HIPAA garantie",
];

/* ─ COMPONENT ────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden" style={{ background: "#050c1a" }}>
      {/* ── Global ambient light ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-emerald-500/[0.06] rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-32 w-[600px] h-[600px] bg-blue-600/[0.05] rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 left-0 w-[500px] h-[400px] bg-teal-500/[0.05] rounded-full blur-[100px]" />
        {/* Subtle dot grid */}
        <div className="absolute inset-0 dot-pattern opacity-30" />
      </div>

      <Navbar />

      <main className="flex-1 relative z-10">

        {/* ══════════════════════════════ HERO ══════════════════════════ */}
        <section className="relative pt-12 pb-28 px-5 flex flex-col items-center text-center overflow-hidden">
          {/* Live badge */}
          <div className="animate-fade-in inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-emerald-500/25 bg-emerald-500/[0.07] text-emerald-400 text-xs font-bold uppercase tracking-[0.15em] mb-8 backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Plateforme Médicale IA · Nouvelle Génération
          </div>

          {/* Headline */}
          <h1 className="animate-slide-up max-w-4xl font-display font-extrabold tracking-tight leading-[1.06]" style={{ fontSize: "clamp(2.6rem, 7vw, 5.5rem)" }}>
            Le diagnostic biologique,{" "}
            <span className="gradient-text-hero glow-text-emerald">
              réinventé par l&apos;IA.
            </span>
          </h1>

          <p className="animate-slide-up delay-100 mt-7 max-w-2xl text-base md:text-lg text-slate-400 leading-relaxed">
            Centralisez vos analyses, automatisez vos rapports et accédez à des diagnostics prédictifs
            en temps réel dans un environnement{" "}
            <span className="text-slate-200 font-semibold">100% sécurisé et conforme HIPAA</span>.
          </p>

          {/* CTA Row */}
          <div className="animate-slide-up delay-200 flex flex-col sm:flex-row gap-4 mt-11">
            <Link href="/login">
              <button className="h-13 px-8 rounded-full text-base font-bold btn-emerald flex items-center gap-2 group">
                Démarrer gratuitement
                <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/services">
              <button className="h-13 px-8 rounded-full text-base font-semibold btn-ghost flex items-center gap-2 group">
                Voir la démo
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="animate-fade-in delay-400 flex flex-wrap justify-center gap-2 mt-10">
            {[
              { icon: ShieldCheck, label: "RGPD & HIPAA" },
              { icon: Lock,        label: "Chiffrement AES-256" },
              { icon: Globe,       label: "+50 Établissements" },
              { icon: Award,       label: "Certifié ISO 27001" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-semibold text-slate-400">
                <Icon className="w-3.5 h-3.5 text-emerald-400" />
                {label}
              </div>
            ))}
          </div>

        </section>

        {/* ══════════════════════════════ STATS ════════════════════════ */}
        <section className="relative py-16 border-y border-white/[0.05]" style={{ background: "rgba(12,24,40,0.4)" }}>
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ value, label, icon: Icon }, i) => (
              <div
                key={label}
                className={`text-center animate-fade-in`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-3 mx-auto">
                  <Icon className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-3xl md:text-4xl font-extrabold font-display gradient-text-emerald leading-none">{value}</div>
                <div className="text-sm text-slate-500 mt-1.5 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════ FEATURES ════════════════════ */}
        <section className="max-w-7xl mx-auto px-6 py-28">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400 text-xs font-bold uppercase tracking-[0.15em] mb-5">
              <Zap className="w-3.5 h-3.5" />
              Fonctionnalités
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold font-display text-white mb-4 leading-tight">
              Pourquoi choisir{" "}
              <span className="gradient-text-emerald">NovaBio Lab</span> ?
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Une infrastructure médicale robuste, pensée pour les professionnels de santé les plus exigeants.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, accent, tag }, i) => {
              const a = accentStyles[accent] ?? accentStyles.emerald;
              return (
                <div
                  key={title}
                  className={`group card-premium rounded-2xl p-7 border border-white/[0.06] cursor-default transition-all duration-500 hover:shadow-xl ${a.ring} ${a.glow} animate-fade-in`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-11 h-11 rounded-xl ${a.icon} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                      <Icon className="w-5.5 h-5.5" />
                    </div>
                    {tag && (
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-widest ${a.tag}`}>
                        {tag}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 leading-snug">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                  <div className="mt-5 flex items-center text-xs font-semibold text-emerald-500 group-hover:text-emerald-400 transition-colors">
                    En savoir plus
                    <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════ TESTIMONIALS ════════════════ */}
        <section className="relative py-24 overflow-hidden" style={{ background: "rgba(12,24,40,0.35)" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-slate-400 text-xs font-bold uppercase tracking-[0.15em] mb-5">
                <Star className="w-3.5 h-3.5 text-amber-400" />
                Témoignages
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold font-display text-white">
                La confiance des professionnels de santé
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {testimonials.map(({ name, role, quote, avatar, color }, i) => (
                <div
                  key={name}
                  className="card-premium rounded-2xl p-7 border border-white/[0.06] flex flex-col gap-5 animate-slide-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed flex-1">
                    &ldquo;{quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-xs font-extrabold text-white shrink-0`}>
                      {avatar}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{name}</div>
                      <div className="text-xs text-slate-500">{role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════ CTA BANNER ══════════════════ */}
        <section className="max-w-5xl mx-auto px-6 py-24">
          <div className="relative rounded-3xl overflow-hidden border border-emerald-500/20 p-12 md:p-16 text-center animate-border-glow">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/15 via-teal-600/10 to-blue-600/10" />
            <div className="absolute inset-0 dot-pattern opacity-20" />
            {/* Orbs */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/[0.06] text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
                <TrendingUp className="w-3.5 h-3.5" />
                Prêt à transformer votre laboratoire ?
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold font-display text-white mb-5">
                Rejoignez{" "}
                <span className="gradient-text-emerald">50+</span>{" "}
                établissements médicaux
              </h2>
              <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
                Déployez NovaBio Lab en moins de 48h et découvrez comment l&apos;IA peut transformer vos analyses biologiques.
              </p>

              {/* Plan features */}
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-10">
                {planFeatures.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login">
                  <button className="h-13 px-9 rounded-full text-base font-bold btn-emerald flex items-center gap-2 group">
                    Démarrer maintenant — Gratuit
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <Link href="/about">
                  <button className="h-13 px-9 rounded-full text-base font-semibold btn-ghost flex items-center gap-2">
                    En savoir plus
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ══════════════════════════════ FOOTER ══════════════════════════ */}
      <footer className="relative border-t border-white/[0.05] pt-14 pb-8 z-10" style={{ background: "rgba(5,12,26,0.95)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-emerald">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-extrabold text-[17px] text-white font-display">
                    Nova<span className="text-emerald-400">Bio</span>
                  </span>
                  <span className="text-[9px] font-semibold text-slate-600 tracking-[0.18em] uppercase">Lab Platform</span>
                </div>
              </div>
              <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
                La plateforme de gestion de laboratoire médical de nouvelle génération, propulsée par l&apos;intelligence artificielle.
              </p>
              <div className="flex gap-2 mt-5">
                {["RGPD", "HIPAA", "ISO 27001", "AES-256"].map((b) => (
                  <span key={b} className="text-[9px] font-bold px-2.5 py-1 rounded-full border border-white/[0.08] text-slate-500">
                    {b}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-[0.15em]">Plateforme</h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                {["Fonctionnalités", "Notre IA Médicale", "Connexion"].map((l) => (
                  <li key={l}>
                    <Link href={l === "Connexion" ? "/login" : "/"} className="hover:text-emerald-400 transition-colors">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-[0.15em]">Légal</h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                {["Confidentialité", "Conditions d'utilisation", "Conformité RGPD"].map((l) => (
                  <li key={l}>
                    <Link href="#" className="hover:text-emerald-400 transition-colors">{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/[0.05] pt-7 flex flex-col md:flex-row items-center justify-between text-xs text-slate-600 gap-3">
            <p>© {new Date().getFullYear()} Laboratoire NovaBio. Tous droits réservés.</p>
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
