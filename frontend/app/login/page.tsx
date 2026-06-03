"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthService from "@/services/auth";
import { Activity, Eye, EyeOff, AlertCircle, ShieldCheck, ArrowRight, Lock, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await AuthService.login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message || "Identifiants invalides");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden" style={{ background: "#050c1a" }}>

      {/* ── LEFT PANEL — Branding ── */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col items-center justify-center p-12 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/15 via-teal-600/8 to-transparent" />
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-3xl animate-pulse-subtle" />

        <div className="relative z-10 max-w-sm text-center">
          {/* Logo */}
          <div className="flex items-center gap-3 justify-center mb-12">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-emerald">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col leading-none text-left">
              <span className="font-extrabold text-xl text-white font-display">
                Nova<span className="text-emerald-400">Bio</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500 tracking-[0.18em] uppercase">Lab Platform</span>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-white font-display leading-tight mb-4">
            Gérez vos analyses médicales{" "}
            <span className="gradient-text-emerald">avec l&apos;IA.</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-10">
            Plateforme de gestion de laboratoire de nouvelle génération — sécurisée, intelligente et conforme HIPAA.
          </p>

          {/* Trust badges */}
          <div className="flex flex-col gap-3">
            {[
              { icon: ShieldCheck, label: "Chiffrement AES-256 de bout en bout" },
              { icon: Lock,        label: "Conformité RGPD & HIPAA garantie" },
              { icon: Activity,    label: "Disponibilité 99.9% — SLA inclus" },
            ].map(({ icon: Icon, label }) => (
              <div key={label}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-left"
                style={{ background: "rgba(12,24,40,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-xs font-medium" style={{ color: "#cbd5e1" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — Login Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Subtle right-side ambient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/[0.06] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/[0.05] rounded-full blur-3xl" />

        {/* Bouton Retour au site — Bootstrap outline style */}
        <Link
          href="/"
          className="absolute top-5 left-5 flex items-center gap-2 px-4 py-2 text-xs font-bold
            border-2 border-slate-600 text-slate-300 bg-transparent
            hover:border-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/[0.07]
            active:bg-emerald-500/15
            transition-all duration-150 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Retour au site
        </Link>

        <div className="w-full max-w-[420px] animate-fade-in relative z-10">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-emerald">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-[17px] text-white font-display">
              Nova<span className="text-emerald-400">Bio</span> Lab
            </span>
          </div>

          {/* Card */}
          <div className="rounded-2xl p-8 border border-white/[0.07]"
            style={{
              background: "linear-gradient(135deg, rgba(12,24,40,0.92) 0%, rgba(8,16,30,0.97) 100%)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)",
            }}>
            <div className="mb-7">
              <h1 className="text-2xl font-extrabold text-white font-display">Connexion</h1>
              <p className="text-sm text-slate-500 mt-1">Accédez à votre espace professionnel sécurisé</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl border border-red-500/20 bg-red-500/[0.07] text-red-400 text-sm animate-scale-in">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#94a3b8" }}>
                  Email professionnel
                </label>
                <div className="relative input-ring rounded-xl border border-white/[0.08] overflow-hidden transition-all">
                  <input
                    type="email"
                    placeholder="docteur@clinique.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full h-11 px-4 text-sm text-white placeholder-slate-600 bg-transparent outline-none disabled:opacity-50 font-medium"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#94a3b8" }}>
                    Mot de passe
                  </label>
                  <Link href="/reset-password" className="text-xs font-semibold text-emerald-500 hover:text-emerald-400 transition-colors">
                    Oublié ?
                  </Link>
                </div>
                <div className="relative input-ring rounded-xl border border-white/[0.08] overflow-hidden transition-all">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full h-11 px-4 pr-11 text-sm text-white placeholder-slate-600 bg-transparent outline-none disabled:opacity-50 font-medium"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl text-sm font-bold btn-emerald flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Accéder à mon espace
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Footer link */}
            <div className="mt-6 pt-5 text-center text-sm"
              style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ color: "#64748b" }}>Pas encore de compte ?{" "}</span>
              <Link href="/register" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
                S&apos;inscrire
              </Link>
            </div>
          </div>

          {/* Bottom note */}
          <p className="text-center text-[11px] mt-5" style={{ color: "#475569" }}>
            Connexion chiffrée AES-256 · Données hébergées en France
          </p>
        </div>
      </div>
    </div>
  );
}
