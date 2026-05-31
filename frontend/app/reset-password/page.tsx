"use client";

import { FormEvent, useRef, useState, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, ArrowLeft, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import apiClient from "@/services/api/client";

type Step = 1 | 2 | 3;

export default function ResetPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const digitRefs = useRef<Array<HTMLInputElement | null>>([]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  // ── Step 1: request code ──────────────────────────────────────────────────
  async function handleRequestCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiClient.post("/auth/password-reset-request", { email });
      showToast("Code envoyé — vérifiez votre boîte mail");
      setStep(2);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: verify code ───────────────────────────────────────────────────
  async function handleVerifyCode(e: FormEvent) {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < 6) {
      setError("Entrez les 6 chiffres du code.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await apiClient.post("/auth/password-reset-verify", { email, code });
      setResetToken(res.data.token);
      setStep(3);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e?.response?.data?.detail || "Code invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 3: set new password ──────────────────────────────────────────────
  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await apiClient.post("/auth/password-reset-confirm", {
        token: resetToken,
        new_password: newPassword,
      });
      showToast("Mot de passe réinitialisé avec succès !");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e?.response?.data?.detail || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  // ── OTP digit input helpers ───────────────────────────────────────────────
  function handleDigitChange(idx: number, val: string) {
    const char = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = char;
    setDigits(next);
    if (char && idx < 5) {
      digitRefs.current[idx + 1]?.focus();
    }
  }

  function handleDigitKeyDown(idx: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      digitRefs.current[idx - 1]?.focus();
    }
  }

  function handleDigitPaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    digitRefs.current[focusIdx]?.focus();
  }

  // ── Shared layout ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "#050c1a" }}>

      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/[0.07] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/[0.05] rounded-full blur-3xl pointer-events-none" />

      {/* Back to login */}
      <Link
        href="/login"
        className="absolute top-5 left-5 flex items-center gap-2 px-4 py-2 text-xs font-bold
          border-2 border-slate-600 text-slate-300 bg-transparent
          hover:border-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/[0.07]
          active:bg-emerald-500/15 transition-all duration-150 group"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Retour à la connexion
      </Link>

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl
          border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium shadow-xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {toast}
        </div>
      )}

      <div className="w-full max-w-[420px] relative z-10">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
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

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {([1, 2, 3] as Step[]).map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                  step === s
                    ? "bg-emerald-500 text-white"
                    : step > s
                    ? "bg-emerald-500/30 text-emerald-400"
                    : "bg-white/[0.06] text-slate-500"
                }`}>
                  {s}
                </div>
                {s < 3 && <div className={`flex-1 h-px w-8 transition-all duration-300 ${step > s ? "bg-emerald-500/40" : "bg-white/[0.06]"}`} />}
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 p-3.5 rounded-xl border border-red-500/20 bg-red-500/[0.07] text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <>
              <div className="mb-7">
                <h1 className="text-2xl font-extrabold text-white font-display">Mot de passe oublié</h1>
                <p className="text-sm text-slate-500 mt-1">Entrez votre email pour recevoir un code de réinitialisation.</p>
              </div>
              <form onSubmit={handleRequestCode} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#94a3b8" }}>
                    Adresse email
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
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl text-sm font-bold btn-emerald flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      Envoyer le code
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <>
              <div className="mb-7">
                <h1 className="text-2xl font-extrabold text-white font-display">Vérification</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Entrez le code à 6 chiffres envoyé à{" "}
                  <span className="text-emerald-400 font-semibold">{email}</span>.
                </p>
              </div>
              <form onSubmit={handleVerifyCode} className="space-y-6">
                {/* OTP boxes */}
                <div className="flex gap-2.5 justify-center">
                  {digits.map((d, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { digitRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                      onPaste={handleDigitPaste}
                      disabled={loading}
                      className="w-11 h-14 rounded-xl border text-center text-xl font-bold text-white outline-none transition-all duration-150 disabled:opacity-50"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        borderColor: d ? "rgba(16,185,129,0.6)" : "rgba(255,255,255,0.1)",
                        boxShadow: d ? "0 0 0 1px rgba(16,185,129,0.3)" : "none",
                      }}
                    />
                  ))}
                </div>
                <div className="space-y-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl text-sm font-bold btn-emerald flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Vérification...
                      </>
                    ) : (
                      <>
                        Vérifier le code
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(null); setDigits(["","","","","",""]); }}
                    className="w-full h-10 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-300 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Changer d&apos;adresse email
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <>
              <div className="mb-7">
                <h1 className="text-2xl font-extrabold text-white font-display">Nouveau mot de passe</h1>
                <p className="text-sm text-slate-500 mt-1">Choisissez un mot de passe sécurisé pour votre compte.</p>
              </div>
              <form onSubmit={handleResetPassword} className="space-y-5">
                {/* New password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#94a3b8" }}>
                    Nouveau mot de passe
                  </label>
                  <div className="relative input-ring rounded-xl border border-white/[0.08] overflow-hidden transition-all">
                    <input
                      type={showNew ? "text" : "password"}
                      placeholder="••••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full h-11 px-4 pr-11 text-sm text-white placeholder-slate-600 bg-transparent outline-none disabled:opacity-50 font-medium"
                      style={{ background: "rgba(255,255,255,0.02)" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {/* Confirm password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#94a3b8" }}>
                    Confirmer le mot de passe
                  </label>
                  <div className="relative input-ring rounded-xl border border-white/[0.08] overflow-hidden transition-all">
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full h-11 px-4 pr-11 text-sm text-white placeholder-slate-600 bg-transparent outline-none disabled:opacity-50 font-medium"
                      style={{ background: "rgba(255,255,255,0.02)" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl text-sm font-bold btn-emerald flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Réinitialisation...
                      </>
                    ) : (
                      <>
                        Réinitialiser le mot de passe
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(null); setDigits(["","","","","",""]); setNewPassword(""); setConfirmPassword(""); }}
                    className="w-full h-10 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-300 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Recommencer
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-[11px] mt-5" style={{ color: "#475569" }}>
          Connexion chiffrée AES-256 · Données hébergées en France
        </p>
      </div>
    </div>
  );
}
