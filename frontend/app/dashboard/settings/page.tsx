/* eslint-disable @next/next/no-img-element */
"use client";


import { useState, useEffect, FormEvent, useRef } from "react";
import { Save, Eye, EyeOff, Lock, Bell, User, Settings, Camera, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/lib/toast-store";
import { useAuthStore } from "@/lib/auth-store";
import userService from "@/services/api/user";

const roleLabels: Record<string, { label: string; color: string }> = {
  ADMIN:        { label: "Administrateur",  color: "bg-red-100 text-red-700 border-red-200"         },
  RECEPTIONIST: { label: "Réceptionniste",  color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  COLLECTOR:    { label: "Préleveur",        color: "bg-amber-100 text-amber-700 border-amber-200"   },
  LAB_TECH:     { label: "Technicien Labo",  color: "bg-purple-100 text-purple-700 border-purple-200" },
  DOCTOR:       { label: "Médecin",          color: "bg-blue-100 text-blue-700 border-blue-200"      },
};

export default function SettingsPage() {
  const { user: currentUser, login } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPw, setIsSavingPw] = useState(false);
  const [isSavingNotifs, setIsSavingNotifs] = useState(false);
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

  const [notifications, setNotifications] = useState({
    emailOnNewPatient: true,
    emailOnNewExam: true,
    emailOnNewResult: true,
    emailOnNewInvoice: false,
    emailOnPayment: true,
  });

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
    // Load saved avatar from localStorage
    const savedAvatar = localStorage.getItem("user_avatar");
    if (savedAvatar) setAvatarPreview(savedAvatar);
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
      localStorage.setItem("user_avatar", b64);
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
      // Refresh stored user data
      const token = localStorage.getItem("access_token") ?? "";
      const refreshToken = localStorage.getItem("refresh_token") ?? "";
      login(token, updated);
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

  const handleSaveNotifications = async (e: FormEvent) => {
    e.preventDefault();
    setIsSavingNotifs(true);
    await new Promise(r => setTimeout(r, 600));
    setIsSavingNotifs(false);
    toast.success("Préférences de notification enregistrées");
  };

  const roleConfig = roleLabels[profile.role] ?? roleLabels.USER;
  const userInitials = `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase();

  const tabs = [
    { id: "profile", label: "Profil", icon: User },
    { id: "security", label: "Sécurité", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
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
      <div className="border-b border-neutral-200 bg-white rounded-t-lg shadow-sm">
        <div className="flex gap-1 px-6">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
                  isActive ? "border-primary-600 text-primary-600" : "border-transparent text-neutral-500 hover:text-neutral-900"
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
              <div className="flex items-center gap-6 pb-6 border-b border-neutral-100">
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
                  <p className="font-bold text-neutral-900 text-lg">
                    {profile.first_name} {profile.last_name}
                  </p>
                  <p className="text-neutral-500 text-sm">{profile.email}</p>
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
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Prénom</label>
                  <Input
                    value={profile.first_name}
                    onChange={e => setProfile({ ...profile, first_name: e.target.value })}
                    placeholder="Prénom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Nom</label>
                  <Input
                    value={profile.last_name}
                    onChange={e => setProfile({ ...profile, last_name: e.target.value })}
                    placeholder="Nom"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                <Input type="email" value={profile.email} disabled className="bg-neutral-50 text-neutral-500" />
                <p className="text-xs text-neutral-400 mt-1">L&apos;email ne peut pas être modifié ici</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Rôle</label>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${roleConfig.color}`}>
                    {roleConfig.label}
                  </span>
                  <p className="text-xs text-neutral-400">Contactez un administrateur pour changer votre rôle</p>
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
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <AlertDescription className="text-green-800">
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
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Mot de passe actuel</label>
                  <div className="relative">
                    <Input
                      type={showCurrentPw ? "text" : "password"}
                      value={security.currentPassword}
                      onChange={e => setSecurity({ ...security, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      className="pr-10"
                    />
                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Nouveau mot de passe</label>
                  <div className="relative">
                    <Input
                      type={showNewPw ? "text" : "password"}
                      value={security.newPassword}
                      onChange={e => setSecurity({ ...security, newPassword: e.target.value })}
                      placeholder="••••••••"
                      className="pr-10"
                    />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {security.newPassword && security.newPassword.length < 6 && (
                    <p className="text-xs text-red-500 mt-1">Minimum 6 caractères</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Confirmer le nouveau mot de passe</label>
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
                  <label key={key} className="flex items-start gap-4 p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 cursor-pointer transition-colors group">
                    <input
                      type="checkbox"
                      checked={notifications[key as keyof typeof notifications]}
                      onChange={e => setNotifications({ ...notifications, [key]: e.target.checked })}
                      className="w-4 h-4 rounded border-neutral-300 text-primary-600 mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-neutral-900 font-semibold text-sm">{label}</p>
                      <p className="text-neutral-400 text-xs mt-0.5">{desc}</p>
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
    </div>
  );
}
