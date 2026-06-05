/* eslint-disable @next/next/no-img-element */
"use client";


import { useState, useEffect, FormEvent, useRef } from "react";
import { Save, Eye, EyeOff, Lock, Bell, User, Settings, Camera, Loader2, CheckCircle, AlertCircle, Mail, ToggleLeft, ToggleRight, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/lib/toast-store";
import { useAuthStore } from "@/lib/auth-store";
import { UserRole } from "@/lib/permissions";
import userService from "@/services/api/user";

const roleLabels: Record<string, { label: string; color: string }> = {
  ADMIN:        { label: "Administrateur",  color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"             },
  RECEPTIONIST: { label: "Réceptionniste",  color: "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20" },
  COLLECTOR:    { label: "Préleveur",        color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"      },
  LAB_TECH:     { label: "Technicien Labo",  color: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20" },
  DOCTOR:       { label: "Médecin",          color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"            },
};

export default function SettingsPage() {
  const currentUser  = useAuthStore(state => state.user);
  const login        = useAuthStore(state => state.login);
  const accessToken  = useAuthStore(state => state.accessToken);
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "email">("profile");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPw, setIsSavingPw] = useState(false);
  const [isSavingNotifs, setIsSavingNotifs] = useState(false);

  // Préférences de notification — persistées en localStorage par utilisateur
  const [smtpEnabled, setSmtpEnabled] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "USER",
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const NOTIF_DEFAULTS = {
    emailOnNewPatient: true,
    emailOnNewExam: true,
    emailOnNewResult: true,
    emailOnNewInvoice: false,
    emailOnPayment: true,
  };
  const [notifications, setNotifications] = useState(NOTIF_DEFAULTS);

  // Load real user data from localStorage / auth store
  useEffect(() => {
    if (currentUser) {
      setProfile({
        first_name: currentUser.first_name ?? "",
        last_name: currentUser.last_name ?? "",
        email: currentUser.email ?? "",
        role: currentUser.role ?? "USER",
      });
    }
    // Avatar
    const avatarKey = `user_avatar_${currentUser?.id ?? "guest"}`;
    const savedAvatar = localStorage.getItem(avatarKey);
    if (savedAvatar) setAvatarPreview(savedAvatar);

    // Préférences de notification
    const notifKey = `notif_prefs_${currentUser?.id ?? "guest"}`;
    const savedNotifs = localStorage.getItem(notifKey);
    if (savedNotifs) {
      try { setNotifications(JSON.parse(savedNotifs)); } catch { /* ignore */ }
    }
  }, [currentUser]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 2 Mo");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      setAvatarPreview(b64);
      const avatarKey = `user_avatar_${currentUser?.id}`;
      localStorage.setItem(avatarKey, b64);
      // Notifie la navbar du changement
      window.dispatchEvent(new StorageEvent("storage", { key: avatarKey, newValue: b64 }));
      toast.success("Photo de profil mise à jour !");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile.first_name || !profile.last_name) {
      toast.error("Prénom et nom sont requis");
      return;
    }
    setIsSavingProfile(true);
    try {
      const updated = await userService.updateMyProfile({
        first_name: profile.first_name,
        last_name: profile.last_name,
      });
      login(accessToken ?? "", { ...updated, role: (updated.role as UserRole) });
      toast.success("Profil mis à jour avec succès !");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || "Erreur lors de la mise à jour";
      toast.error(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!security.currentPassword || !security.newPassword) {
      toast.error("Tous les champs mot de passe sont requis");
      return;
    }
    if (security.newPassword !== security.confirmPassword) {
      toast.error("Les nouveaux mots de passe ne correspondent pas");
      return;
    }
    if (security.newPassword.length < 6) {
      toast.error("Le mot de passe doit faire au moins 6 caractères");
      return;
    }
    setIsSavingPw(true);
    try {
      await userService.changePassword(security.currentPassword, security.newPassword);
      setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Mot de passe mis à jour !");
    } catch (err: any) {
      const detail = err?.response?.data?.detail || "Mot de passe actuel incorrect ou erreur serveur";
      toast.error(detail);
    } finally {
      setIsSavingPw(false);
    }
  };

  const handleSaveNotifications = (e: FormEvent) => {
    e.preventDefault();
    setIsSavingNotifs(true);
    const notifKey = `notif_prefs_${currentUser?.id ?? "guest"}`;
    localStorage.setItem(notifKey, JSON.stringify(notifications));
    setIsSavingNotifs(false);
    toast.success("Préférences de notification enregistrées");
  };

  const roleConfig = roleLabels[profile.role] ?? { label: profile.role || "Utilisateur", color: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/[0.05] dark:text-slate-300 dark:border-white/[0.08]" };
  const userInitials = `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase() || "?";

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "security", label: "Sécurité", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "email", label: "Email SMTP", icon: Mail },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold mb-1">Paramètres ⚙️</h1>
            <p className="text-slate-300 text-lg">Gérez votre profil, sécurité et préférences</p>
          </div>
          <Settings className="w-24 h-24 opacity-20 hidden md:block" />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 bg-white rounded-t-lg shadow-sm dark:border-white/[0.08] dark:bg-[var(--color-surface)]">
        <div className="flex gap-1 px-6">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
                  isActive ? "border-primary-600 text-primary-600" : "border-transparent text-neutral-500 hover:text-neutral-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* PROFILE TAB */}
      {activeTab === "profile" && (
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">Informations du Profil</CardTitle>
            <CardDescription>Mettez à jour vos informations personnelles</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6 pb-6 border-b border-neutral-100 dark:border-white/[0.06]">
                <div className="relative group">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Photo de profil"
                      className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-cyan-600 flex items-center justify-center text-2xl font-extrabold text-white shadow-lg border-4 border-white">
                      {userInitials || "?"}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                  <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
                <div>
                  <p className="font-bold text-neutral-900 dark:text-white text-lg">
                    {profile.first_name} {profile.last_name}
                  </p>
                  <p className="text-neutral-500 dark:text-slate-400 text-sm">{profile.email}</p>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="text-xs text-primary-600 font-semibold hover:text-primary-700 mt-1 transition-colors"
                  >
                    Changer la photo de profil
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-2">Prénom</label>
                  <Input
                    value={profile.first_name}
                    onChange={e => setProfile({ ...profile, first_name: e.target.value })}
                    placeholder="Prénom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-2">Nom</label>
                  <Input
                    value={profile.last_name}
                    onChange={e => setProfile({ ...profile, last_name: e.target.value })}
                    placeholder="Nom"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-2">Email</label>
                <Input type="email" value={profile.email} disabled className="bg-neutral-50 text-neutral-500 dark:bg-white/[0.03] dark:text-slate-500" />
                <p className="text-xs text-neutral-400 dark:text-slate-500 mt-1">L&apos;email ne peut pas être modifié ici</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-2">Rôle</label>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${roleConfig.color}`}>
                    {roleConfig.label}
                  </span>
                  <p className="text-xs text-neutral-400 dark:text-slate-500">Contactez un administrateur pour changer votre rôle</p>
                </div>
              </div>

              <Button type="submit" disabled={isSavingProfile} className="gap-2">
                {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSavingProfile ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* SECURITY TAB */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <Alert className="border-green-200 bg-green-50 dark:border-green-500/20 dark:bg-green-500/10">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            <AlertDescription className="text-green-800 dark:text-green-400">
              <strong>Connexion sécurisée</strong> — Votre session est chiffrée et protégée par JWT.
            </AlertDescription>
          </Alert>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl">Changer le Mot de Passe</CardTitle>
              <CardDescription>Mettez à jour votre mot de passe régulièrement pour maintenir la sécurité</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-2">Mot de passe actuel</label>
                  <div className="relative">
                    <Input
                      type={showCurrentPw ? "text" : "password"}
                      value={security.currentPassword}
                      onChange={e => setSecurity({ ...security, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      className="pr-10"
                    />
                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-slate-500">
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-2">Nouveau mot de passe</label>
                  <div className="relative">
                    <Input
                      type={showNewPw ? "text" : "password"}
                      value={security.newPassword}
                      onChange={e => setSecurity({ ...security, newPassword: e.target.value })}
                      placeholder="••••••••"
                      className="pr-10"
                    />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-slate-500">
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {security.newPassword && security.newPassword.length < 6 && (
                    <p className="text-xs text-red-500 mt-1">Minimum 6 caractères</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-slate-300 mb-2">Confirmer le nouveau mot de passe</label>
                  <Input
                    type="password"
                    value={security.confirmPassword}
                    onChange={e => setSecurity({ ...security, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                  {security.confirmPassword && security.newPassword !== security.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
                  )}
                </div>
                <Button type="submit" disabled={isSavingPw} className="gap-2">
                  {isSavingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSavingPw ? "Mise à jour..." : "Mettre à jour le mot de passe"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* NOTIFICATIONS TAB */}
      {activeTab === "notifications" && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">Préférences de Notification</CardTitle>
            <CardDescription>Contrôlez les alertes que vous recevez par email</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveNotifications} className="space-y-6">
              <div className="space-y-3">
                {[
                  { key: "emailOnNewPatient", label: "Nouveau patient enregistré", desc: "Recevoir un email à chaque création de dossier patient" },
                  { key: "emailOnNewExam", label: "Nouvel examen demandé", desc: "Notification lors d'une nouvelle demande d'analyse" },
                  { key: "emailOnNewResult", label: "Résultat d'examen disponible", desc: "Alerte lors de la validation d'un résultat biologique" },
                  { key: "emailOnNewInvoice", label: "Nouvelle facture créée", desc: "Email à chaque émission de facture" },
                  { key: "emailOnPayment", label: "Paiement reçu", desc: "Confirmation lors d'un règlement effectué" },
                ].map(({ key, label, desc }) => (
                  <label key={key} className="flex items-start gap-4 p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 cursor-pointer transition-colors group dark:border-white/[0.08] dark:hover:bg-white/[0.03]">
                    <input
                      type="checkbox"
                      checked={notifications[key as keyof typeof notifications]}
                      onChange={e => setNotifications({ ...notifications, [key]: e.target.checked })}
                      className="w-4 h-4 rounded border-neutral-300 dark:border-white/[0.08] text-primary-600 mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-neutral-900 dark:text-white font-semibold text-sm">{label}</p>
                      <p className="text-neutral-400 dark:text-slate-500 text-xs mt-0.5">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <Button type="submit" disabled={isSavingNotifs} className="gap-2">
                {isSavingNotifs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSavingNotifs ? "Enregistrement..." : "Enregistrer les préférences"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* EMAIL SMTP TAB */}
      {activeTab === "email" && (
        <div className="space-y-6">
          {/* SMTP Config — read-only */}
          <div className="rounded-2xl dark:bg-[#0c1828] dark:border dark:border-white/[0.07] bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 dark:border-b dark:border-white/[0.07] border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <Mail className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold dark:text-white text-slate-900">Notifications Email</h2>
                <p className="text-xs dark:text-slate-500 text-slate-400">Configuration SMTP du serveur</p>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Read-only SMTP fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1.5 uppercase tracking-wide">
                    SMTP Host
                  </label>
                  <div className="h-10 rounded-xl border px-3 flex items-center text-sm
                      dark:bg-white/[0.03] dark:border-white/[0.08] dark:text-slate-300
                      bg-slate-50 border-slate-200 text-slate-700">
                    smtp.gmail.com
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1.5 uppercase tracking-wide">
                    Port
                  </label>
                  <div className="h-10 rounded-xl border px-3 flex items-center text-sm
                      dark:bg-white/[0.03] dark:border-white/[0.08] dark:text-slate-300
                      bg-slate-50 border-slate-200 text-slate-700">
                    587 (STARTTLS)
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1.5 uppercase tracking-wide">
                    Expéditeur
                  </label>
                  <div className="h-10 rounded-xl border px-3 flex items-center text-sm
                      dark:bg-white/[0.03] dark:border-white/[0.08] dark:text-slate-300
                      bg-slate-50 border-slate-200 text-slate-700">
                    noreply@novabiolog.lab
                  </div>
                </div>
              </div>

              <p className="text-xs dark:text-slate-500 text-slate-400">
                La configuration SMTP est définie dans les variables d&apos;environnement du serveur. Contactez l&apos;administrateur système pour la modifier.
              </p>

              {/* Enable switch */}
              <div className="flex items-center justify-between p-4 rounded-xl
                  dark:bg-white/[0.03] dark:border dark:border-white/[0.05]
                  bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-sm font-semibold dark:text-slate-200 text-slate-800">Activer les notifications</p>
                  <p className="text-xs dark:text-slate-500 text-slate-400 mt-0.5">
                    Envoyer des emails automatiques aux patients lors de la mise à disposition des résultats
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !smtpEnabled;
                    setSmtpEnabled(next);
                    toast.success(next ? "Notifications activées" : "Notifications désactivées");
                  }}
                  className="flex items-center gap-2 transition-colors"
                  aria-pressed={smtpEnabled}
                >
                  {smtpEnabled ? (
                    <ToggleRight className="w-10 h-10 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 dark:text-slate-600 text-slate-400" />
                  )}
                  <span className={`text-xs font-bold ${smtpEnabled ? "text-emerald-400" : "dark:text-slate-500 text-slate-400"}`}>
                    {smtpEnabled ? "Activé" : "Désactivé"}
                  </span>
                </button>
              </div>

              {/* Test connection button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => toast.info("Test SMTP non disponible dans cette version")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                    dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20
                    bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border dark:border-emerald-500/20 border-emerald-200 transition-colors"
                >
                  <Wifi className="w-4 h-4" />
                  Tester la connexion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
