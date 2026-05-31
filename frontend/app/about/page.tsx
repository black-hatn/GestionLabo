"use client";

import Link from "next/link";
import {
  Activity, ArrowRight, Star, Shield, Zap,
  MapPin, Phone, Mail, Award,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";

/* ── Mission cards ── */
const missions = [
  {
    icon: Star,
    title: "Excellence scientifique",
    desc: "Chaque analyse est réalisée selon les protocoles les plus rigoureux, avec des équipements de pointe calibrés et maintenus quotidiennement.",
    color: "amber",
  },
  {
    icon: Shield,
    title: "Confidentialité absolue",
    desc: "Vos données médicales sont chiffrées de bout en bout et hébergées sur des serveurs certifiés HDS en France. Conformité RGPD totale.",
    color: "blue",
  },
  {
    icon: Zap,
    title: "Innovation continue",
    desc: "Nous intégrons en permanence les dernières avancées en biologie médicale et en informatique de santé pour vous offrir le meilleur service.",
    color: "emerald",
  },
];

/* ── Team ── */
const team = [
  {
    initials: "AK",
    name: "Dr. Ahmed Koné",
    role: "Directeur & Biologiste médical",
    avatarBg: "from-emerald-500/40 to-teal-500/40",
    textColor: "text-emerald-300",
    border: "border-emerald-500/30",
  },
  {
    initials: "FT",
    name: "Dr. Fatima Traoré",
    role: "Biologiste spécialisée hématologie",
    avatarBg: "from-teal-500/40 to-cyan-500/40",
    textColor: "text-teal-300",
    border: "border-teal-500/30",
  },
  {
    initials: "ID",
    name: "M. Ibrahim Diallo",
    role: "Chef des techniciens",
    avatarBg: "from-blue-500/40 to-indigo-500/40",
    textColor: "text-blue-300",
    border: "border-blue-500/30",
  },
  {
    initials: "AB",
    name: "Mme Aminata Ba",
    role: "Responsable qualité & accréditation",
    avatarBg: "from-purple-500/40 to-violet-500/40",
    textColor: "text-purple-300",
    border: "border-purple-500/30",
  },
];

/* ── Certifications ── */
const certifs = [
  { label: "ISO 15189:2022",    desc: "Norme internationale laboratoires médicaux"      },
  { label: "COFRAC n°8-2847",   desc: "Accréditation française officielle"              },
  { label: "Conformité RGPD",   desc: "Protection des données personnelles"             },
  { label: "Agrément ANSM",     desc: "Agence nationale de sécurité du médicament"     },
];

/* ── Stats ── */
const stats = [
  { value: "50 000+",  label: "Analyses par an"        },
  { value: "8 ans",    label: "D'expérience"            },
  { value: "4.9/5",    label: "Satisfaction patient"    },
  { value: "99.9%",    label: "Disponibilité"           },
];

const missionColorMap: Record<string, { icon: string; bg: string; border: string }> = {
  amber:   { icon: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20"   },
  blue:    { icon: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20"    },
  emerald: { icon: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#050c1a" }}>

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-emerald-500/[0.05] rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-purple-600/[0.04] rounded-full blur-[100px]" />
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
            Notre histoire
          </div>

          <h1
            className="font-display font-extrabold text-white leading-[1.08] tracking-tight mb-6"
            style={{ fontSize: "clamp(2rem, 5vw, 3.8rem)" }}
          >
            À Propos de{" "}
            <span className="text-emerald-400">NovaBio Lab</span>
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
            Fondé en{" "}
            <span className="text-white font-semibold">2018</span>, NovaBio Lab est un laboratoire
            d&apos;analyses médicales de référence, réalisant plus de{" "}
            <span className="text-white font-semibold">50 000 analyses par an</span> avec une
            précision et une réactivité inégalées.
          </p>
        </section>

        {/* ════════ MISSION ════════ */}
        <section className="border-t border-white/[0.06]" style={{ background: "rgba(10,18,32,0.6)" }}>
          <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="text-center mb-14">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Notre mission</span>
              <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white mt-3">
                Nos valeurs fondamentales
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {missions.map(({ icon: Icon, title, desc, color }) => {
                const c = missionColorMap[color];
                return (
                  <div
                    key={title}
                    className="flex flex-col gap-4 p-6 transition-all duration-300"
                    style={{
                      background: "rgba(12,24,40,0.7)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <div className={`w-11 h-11 flex items-center justify-center border ${c.bg} ${c.icon} ${c.border}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ════════ TEAM ════════ */}
        <section className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Équipe</span>
            <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white mt-3">
              Des experts à votre service
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {team.map(({ initials, name, role, avatarBg, textColor, border }) => (
              <div
                key={name}
                className="flex flex-col items-center text-center gap-4 p-6 transition-all duration-300 hover:shadow-[0_0_24px_rgba(16,185,129,0.07)]"
                style={{
                  background: "rgba(12,24,40,0.7)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  className={`w-16 h-16 rounded-full bg-gradient-to-br ${avatarBg} flex items-center justify-center font-extrabold text-lg border ${border} ${textColor}`}
                >
                  {initials}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{name}</p>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════ CERTIFICATIONS ════════ */}
        <section className="border-t border-white/[0.06]" style={{ background: "rgba(10,18,32,0.6)" }}>
          <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Accréditations</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white">
                Certifications & Conformité
              </h2>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              {certifs.map(({ label, desc }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 px-5 py-3 border border-emerald-500/20 bg-emerald-500/[0.06]"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-300">{label}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ KEY STATS ════════ */}
        <section className="max-w-5xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Chiffres clés</span>
            <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white mt-3">
              NovaBio Lab en chiffres
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {stats.map(({ value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center gap-2 p-6"
                style={{
                  background: "rgba(12,24,40,0.7)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <span className="text-3xl font-extrabold font-display text-emerald-400">{value}</span>
                <span className="text-slate-500 text-sm">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ════════ CONTACT / LOCATION ════════ */}
        <section className="border-t border-white/[0.06]" style={{ background: "rgba(10,18,32,0.6)" }}>
          <div className="max-w-4xl mx-auto px-6 py-20">
            <div className="text-center mb-12">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Contact</span>
              <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white mt-3">
                Nous trouver
              </h2>
            </div>

            <div
              className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.06] overflow-hidden border border-white/[0.07]"
              style={{ background: "rgba(12,24,40,0.7)" }}
            >
              {[
                {
                  icon: MapPin,
                  label: "Adresse",
                  value: "12 Rue des Alouettes\n75008 Paris",
                  color: "text-emerald-400",
                  bg: "bg-emerald-500/10",
                },
                {
                  icon: Phone,
                  label: "Téléphone",
                  value: "+33 1 45 67 89 00",
                  color: "text-blue-400",
                  bg: "bg-blue-500/10",
                },
                {
                  icon: Mail,
                  label: "Email",
                  value: "contact@novabio-lab.fr",
                  color: "text-teal-400",
                  bg: "bg-teal-500/10",
                },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className="flex flex-col items-center text-center gap-3 p-8">
                  <div className={`w-11 h-11 flex items-center justify-center ${bg} ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                  <p className={`text-sm font-semibold whitespace-pre-line ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════ CTA ════════ */}
        <section className="border-t border-white/[0.06]" style={{ background: "rgba(10,18,32,0.7)" }}>
          <div className="max-w-3xl mx-auto px-6 py-20 text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white mb-4">
              Rejoignez NovaBio Lab
            </h2>
            <p className="text-slate-400 text-base mb-8">
              Accédez à votre espace patient et profitez de nos services d&apos;analyse de pointe.
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
