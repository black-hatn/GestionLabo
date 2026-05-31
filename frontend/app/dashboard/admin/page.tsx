"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, Plus, Edit2, Trash2, Lock, Unlock, Loader2, AlertCircle, X, Check, Search, RefreshCw, Eye, EyeOff, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/lib/toast-store";
import { useAuthStore } from "@/lib/auth-store";
import userService, { UserData } from "@/services/api/user";

const roles = [
  { value: "ADMIN",        label: "Administrateur",  color: "bg-red-100 text-red-700 border-red-200"       },
  { value: "RECEPTIONIST", label: "Réceptionniste",  color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { value: "COLLECTOR",    label: "Préleveur",        color: "bg-amber-100 text-amber-700 border-amber-200"  },
  { value: "LAB_TECH",     label: "Technicien Labo",  color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "DOCTOR",       label: "Médecin",          color: "bg-blue-100 text-blue-700 border-blue-200"    },
];

const ROLE_AVATAR: Record<string, string> = {
  ADMIN:        "bg-red-100 text-red-700",
  RECEPTIONIST: "bg-indigo-100 text-indigo-700",
  COLLECTOR:    "bg-amber-100 text-amber-700",
  LAB_TECH:     "bg-purple-100 text-purple-700",
  DOCTOR:       "bg-blue-100 text-blue-700",
};

const getRoleConfig = (role: string) =>
  roles.find(r => r.value === role) ?? { value: role, label: role, color: "bg-gray-100 text-gray-700 border-gray-200" };

const getInitials = (firstName: string, lastName: string) =>
  `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`.toUpperCase();

interface FormData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
}

const defaultForm: FormData = {
  email: "",
  password: "",
  first_name: "",
  last_name: "",
  role: "DOCTOR",
  is_active: true,
};

export default function AdminControlPanel() {
  const currentUser = useAuthStore(state => state.user);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<FormData>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUsers(1, 100, search);
      setUsers(data.items);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || "Impossible de charger les utilisateurs";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleEdit = (user: UserData) => {
    setEditingId(user.id);
    setShowCreateForm(false);
    setFormData({
      email: user.email,
      password: "",
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_active: user.is_active,
    });
  };

  const handleSave = async () => {
    if (!editingId) return;
    setSubmitting(true);
    try {
      await userService.updateUser(editingId, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
        is_active: formData.is_active,
      });
      toast.success("Utilisateur mis à jour avec succès !");
      setEditingId(null);
      setFormData(defaultForm);
      await loadUsers();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Erreur lors de la mise à jour";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
      toast.error("Tous les champs sont requis");
      return;
    }
    setSubmitting(true);
    try {
      await userService.createUser(formData);
      toast.success(`Compte créé pour ${formData.first_name} ${formData.last_name} !`);
      setShowCreateForm(false);
      setFormData(defaultForm);
      await loadUsers();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Erreur lors de la création";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user: UserData) => {
    if (user.id === currentUser?.id) {
      toast.error("Vous ne pouvez pas supprimer votre propre compte");
      return;
    }
    if (!window.confirm(`Supprimer ${user.first_name} ${user.last_name} ? Cette action est irréversible.`)) return;
    setDeletingId(user.id);
    try {
      await userService.deleteUser(user.id);
      toast.success("Utilisateur supprimé avec succès");
      setUsers(prev => prev.filter(u => u.id !== user.id));
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Erreur lors de la suppression";
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (user: UserData) => {
    if (user.id === currentUser?.id) {
      toast.error("Vous ne pouvez pas désactiver votre propre compte");
      return;
    }
    setTogglingId(user.id);
    try {
      const updated = await userService.toggleActive(user.id);
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      toast.success(updated.is_active ? "Compte réactivé" : "Compte désactivé");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Erreur de mise à jour";
      toast.error(msg);
    } finally {
      setTogglingId(null);
    }
  };

  const stats = {
    total:         users.length,
    admins:        users.filter(u => u.role === "ADMIN").length,
    receptionists: users.filter(u => u.role === "RECEPTIONIST").length,
    collectors:    users.filter(u => u.role === "COLLECTOR").length,
    techs:         users.filter(u => u.role === "LAB_TECH").length,
    doctors:       users.filter(u => u.role === "DOCTOR").length,
    active:        users.filter(u => u.is_active).length,
  };

  return (
    <RoleGuard allowedRoles={["ADMIN"]}>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 to-red-800 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold mb-1">🔐 Panneau Admin</h1>
              <p className="text-red-200 text-lg">Gestion complète des utilisateurs — Administrateur</p>
              <p className="text-red-300 text-sm mt-1">Connecté en tant que : {currentUser?.first_name} {currentUser?.last_name}</p>
            </div>
            <Shield className="w-24 h-24 opacity-20 hidden md:block" />
          </div>
        </div>

        {/* Error */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
          {[
            { label: "Total",           value: stats.total,         color: "text-neutral-900"  },
            { label: "Admins",          value: stats.admins,        color: "text-red-700"       },
            { label: "Réceptionnistes", value: stats.receptionists, color: "text-indigo-700"    },
            { label: "Préleveurs",      value: stats.collectors,    color: "text-amber-700"     },
            { label: "Techniciens",     value: stats.techs,         color: "text-purple-700"    },
            { label: "Médecins",        value: stats.doctors,       color: "text-blue-700"      },
            { label: "Actifs",          value: stats.active,        color: "text-emerald-700"   },
          ].map(({ label, value, color }) => (
            <Card key={label} className="border-0 shadow-md text-center p-3">
              <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
              <div className="text-[11px] text-neutral-500 mt-1 font-medium leading-tight">{label}</div>
            </Card>
          ))}
        </div>

        {/* Search + Actions Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm" onClick={loadUsers} className="gap-2 flex-shrink-0">
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
          <Button
            size="sm"
            onClick={() => { setShowCreateForm(true); setEditingId(null); setFormData(defaultForm); }}
            className="gap-2 bg-red-600 hover:bg-red-700 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nouvel Utilisateur
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card className="border-2 border-red-200 bg-red-50 shadow-md">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl text-red-800">➕ Créer un Utilisateur</CardTitle>
                <CardDescription>Tous les champs sont requis</CardDescription>
              </div>
              <button onClick={() => setShowCreateForm(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Prénom *" value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} />
                <Input placeholder="Nom *" value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
                <Input type="email" placeholder="Email *" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mot de passe *"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <select className="px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium col-span-full md:col-span-1" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                  {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleCreate} disabled={submitting} className="gap-2 bg-red-600 hover:bg-red-700">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Créer le compte
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>Annuler</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Form */}
        {editingId && (
          <Card className="border-2 border-blue-200 bg-blue-50 shadow-md">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl text-blue-800">✏️ Modifier l&apos;Utilisateur</CardTitle>
              </div>
              <button onClick={() => setEditingId(null)} className="text-neutral-400 hover:text-neutral-600">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Prénom" value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} />
                <Input placeholder="Nom" value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
                <Input type="email" value={formData.email} disabled className="bg-neutral-100 text-neutral-500" />
                <select className="px-3 py-2 border border-neutral-300 rounded-md text-sm font-medium" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                  {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSave} disabled={submitting} className="gap-2 bg-blue-600 hover:bg-blue-700">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Enregistrer
                </Button>
                <Button variant="outline" onClick={() => setEditingId(null)}>Annuler</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users List */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <UserCog className="w-6 h-6 text-red-600" />
                  Utilisateurs du Système
                </CardTitle>
                <CardDescription>{users.length} compte(s) enregistré(s)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12 gap-3 text-neutral-500">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Chargement des utilisateurs...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-neutral-400 gap-2">
                <AlertCircle className="w-8 h-8" />
                <p>Aucun utilisateur trouvé</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map(user => {
                  const roleConfig = getRoleConfig(user.role);
                  const isCurrentUser = user.id === currentUser?.id;
                  const isDeleting = deletingId === user.id;
                  const isToggling = togglingId === user.id;

                  return (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        isCurrentUser
                          ? "bg-primary-50 border-primary-200"
                          : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100"
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Avatar */}
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${ROLE_AVATAR[user.role] ?? "bg-gray-100 text-gray-700"}`}>
                          {getInitials(user.first_name, user.last_name)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-neutral-900">
                              {user.first_name} {user.last_name}
                              {isCurrentUser && <span className="text-primary-600 font-medium text-xs ml-1">(Vous)</span>}
                            </h3>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${roleConfig.color}`}>
                              {roleConfig.label}
                            </span>
                            {user.is_active ? (
                              <Badge variant="success" className="text-xs">Actif</Badge>
                            ) : (
                              <Badge variant="danger" className="text-xs">Inactif</Badge>
                            )}
                          </div>
                          <p className="text-sm text-neutral-500 truncate mt-0.5">{user.email}</p>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            Créé le {new Date(user.created_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      {!isCurrentUser && (
                        <div className="flex gap-1.5 flex-shrink-0 ml-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-9 w-9 p-0 hover:bg-blue-100 hover:text-blue-700"
                            onClick={() => handleEdit(user)}
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`h-9 w-9 p-0 ${user.is_active ? "hover:bg-warning-100 hover:text-warning-700" : "hover:bg-green-100 hover:text-green-700"}`}
                            onClick={() => handleToggleActive(user)}
                            disabled={isToggling}
                            title={user.is_active ? "Désactiver" : "Activer"}
                          >
                            {isToggling ? <Loader2 className="w-4 h-4 animate-spin" /> : user.is_active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-9 w-9 p-0 hover:bg-red-100 hover:text-red-700"
                            onClick={() => handleDelete(user)}
                            disabled={isDeleting}
                            title="Supprimer définitivement"
                          >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
