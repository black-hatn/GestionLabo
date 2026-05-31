"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthService from "@/services/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      await AuthService.register(email, password, firstName, lastName);
      setSuccess(true);
      
      setTimeout(() => {
        AuthService.login(email, password).then(() => {
          router.push("/dashboard");
        });
      }, 1500);
    } catch (err: any) {
      const msg = err?.message || "Erreur lors de l'inscription";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-subtle" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse-subtle" style={{ animationDelay: "1s" }} />

      <div className="w-full max-w-[460px] animate-fade-in relative z-10">
        <div className="flex flex-col items-center mb-8">
          <Link href="/">
            <div className="bg-gradient-to-br from-primary-500 to-cyan-600 p-3.5 rounded-2xl text-white shadow-lg shadow-primary-500/20 mb-3 hover:scale-105 transition-transform duration-300">
              <Activity className="w-8 h-8" />
            </div>
          </Link>
          <h1 className="text-3xl font-extrabold text-white tracking-tight text-center">
            Laboratoire NovaBio
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            Création de compte professionnel
          </p>
        </div>

        <Card className="border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden p-8">
          <CardContent className="p-0">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">S&apos;inscrire</h2>
              <p className="text-sm text-slate-400 mt-1">Rejoignez le portail de gestion médicale sécurisé</p>
            </div>

            {success && (
              <div className="mb-6 flex items-start gap-3 p-3.5 rounded-xl bg-secondary-500/10 border border-secondary-500/20 text-secondary-400 text-sm">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="font-semibold">Inscription réussie! Redirection en cours...</div>
              </div>
            )}

            {error && (
              <div className="mb-6 flex items-start gap-3 p-3.5 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="font-semibold">{error}</div>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">Prénom</label>
                  <Input
                    type="text"
                    placeholder="Ex: Prénom"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={loading || success}
                    className="bg-slate-950 border-white/10 text-white placeholder:text-slate-600 focus:border-primary-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">Nom</label>
                  <Input
                    type="text"
                    placeholder="Ex: Nom"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={loading || success}
                    className="bg-slate-950 border-white/10 text-white placeholder:text-slate-600 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Email professionnel</label>
                <Input
                  type="email"
                  placeholder="docteur@clinique.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading || success}
                  className="bg-slate-950 border-white/10 text-white placeholder:text-slate-600 focus:border-primary-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Mot de passe</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading || success}
                    className="bg-slate-950 border-white/10 text-white placeholder:text-slate-600 focus:border-primary-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Confirmer le mot de passe</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading || success}
                    className="bg-slate-950 border-white/10 text-white placeholder:text-slate-600 focus:border-primary-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full mt-6 font-bold py-6 text-base bg-gradient-to-r from-primary-600 to-cyan-600 hover:from-primary-500 hover:to-cyan-500 text-white border-0 shadow-[0_0_20px_rgba(14,165,233,0.2)] rounded-xl transition-all hover:scale-[1.02]" disabled={loading || success}>
                {loading ? "Inscription en cours..." : "Créer mon compte"}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm border-t border-white/10 pt-6">
              <p className="text-slate-400">
                Déjà inscrit ?{" "}
                <Link href="/login" className="font-semibold text-primary-400 hover:text-primary-300 transition-colors">
                  Se connecter
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
