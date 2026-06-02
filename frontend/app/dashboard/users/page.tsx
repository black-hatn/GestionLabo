"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck, Plus, Search, Loader2, AlertCircle,
  Edit2, Trash2, Eye, EyeOff, X, RefreshCw, UserCheck, UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import userService, { UserData, UserCreatePayload } from "@/services/api/user";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleGuard } from "@/components/auth/RoleGuard";

// ── Types ──────────────────────────────────────────────────────────────────
type ModalMode = "create" | "edit" | "view" | null;

const ROLES = ["ADMIN", "RECEPTIONIST", "COLLECTOR", "LAB_TECH", "DOCTOR"] as const;
const ROLE_LABELS: Record<string, string> = {
  ADMIN:        "Administrateur",
  RECEPTIONIST: "Réceptionniste",
  COLLECTOR:    "Préleveur",
  LAB_TECH:     "Technicien Labo",
  DOCTOR:       "Médecin",
};
const ROLE_COLORS: Record<string, string> = {
  ADMIN:        "bg-red-500/10 text-red-400 border-red-500/20",
  RECEPTIONIST: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  COLLECTOR:    "bg-amber-500/10 text-amber-400 border-amber-500/20",
  LAB_TECH:     "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  DOCTOR:       "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

// ── Composant Modal ────────────────────────────────────────────────────────
function UserModal({
  mode,
  user,
  onClose,
  onSaved,
}: {
  mode: ModalMode;
  user: UserData | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? "",
    email: user?.email ?? "",
    password: "",
    role: user?.role ?? "DOCTOR",
    is_active: user?.is_active ?? true,
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readOnly = mode === "view";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "create") {
        await userService.createUser(form as UserCreatePayload);
      } else if (mode === "edit" && user) {
        await userService.updateUser(user.id, {
          first_name: form.first_name,
          last_name: form.last_name,
          role: form.role,
          is_active: form.is_active,
        });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const title = mode === "create" ? "Nouvel utilisateur" : mode === "edit" ? "Modifier l'utilisateur" : "Détails utilisateur";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in border border-white/[0.08]" style={{ background: "rgba(12,20,36,0.97)" }}>
        {/* Header modal */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.07]">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Prénom *</label>
              <Input
                value={form.first_name}
                onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                required
                disabled={readOnly}
                placeholder="Prénom"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Nom *</label>
              <Input
                value={form.last_name}
                onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                required
                disabled={readOnly}
                placeholder="Nom"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Email *</label>
            <Input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              disabled={readOnly || mode === "edit"}
              placeholder="email@exemple.com"
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500"
            />
          </div>

          {mode === "create" && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Mot de passe *</label>
              <div className="relative">
                <Input
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  placeholder="Mot de passe"
                  className="pr-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  onClick={() => setShowPwd(v => !v)}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Rôle *</label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              disabled={readOnly}
              className="w-full border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              style={{ background: "#0f1c2e", color: "#cbd5e1" }}
            >
              {ROLES.map(r => (
                <option key={r} value={r} style={{ background: "#0f1c2e", color: "#cbd5e1" }}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>

          {(mode === "edit" || mode === "view") && (
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-400">Statut</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                  disabled={readOnly}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:bg-emerald-500 transition-colors"></div>
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
              </label>
              <span className={`text-xs font-medium ${form.is_active ? "text-emerald-600" : "text-neutral-400"}`}>
                {form.is_active ? "Actif" : "Inactif"}
              </span>
            </div>
          )}

          {mode === "view" && user && (
            <div className="rounded-lg p-3 text-xs text-slate-500 space-y-1 border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p>ID : <span className="font-mono">{user.id}</span></p>
              <p>Créé le : {new Date(user.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</p>
            </div>
          )}

          {!readOnly && (
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Annuler
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {mode === "create" ? "Créer" : "Enregistrer"}
              </Button>
            </div>
          )}
          {readOnly && (
            <Button type="button" onClick={onClose} className="w-full">Fermer</Button>
          )}
        </form>
      </div>
    </div>
  );
}

// ── Composant Confirmation Suppression ────────────────────────────────────
function DeleteConfirm({
  user,
  onConfirm,
  onCancel,
  loading,
}: {
  user: UserData;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in border border-white/[0.08]" style={{ background: "rgba(12,20,36,0.97)" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="font-bold text-white">Supprimer l'utilisateur</h3>
            <p className="text-sm text-slate-400">{user.first_name} {user.last_name}</p>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-6">
          Cette action est irréversible. L'utilisateur sera définitivement supprimé du système.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">Annuler</Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // Delete state
  const [deleteUser, setDeleteUser] = useState<UserData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toggle loading per-user
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await userService.getUsers(1, 100, debouncedSearch);
      setUsers(result.items);
      setTotal(result.total);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Impossible de charger les utilisateurs");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleDelete = async () => {
    if (!deleteUser) return;
    setDeleteLoading(true);
    try {
      await userService.deleteUser(deleteUser.id);
      setDeleteUser(null);
      loadUsers();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Erreur lors de la suppression");
      setDeleteUser(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggle = async (user: UserData) => {
    setTogglingId(user.id);
    try {
      await userService.toggleActive(user.id);
      loadUsers();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Erreur lors du changement de statut");
    } finally {
      setTogglingId(null);
    }
  };

  const stats = {
    total: total,
    active: users.filter(u => u.is_active).length,
    admins: users.filter(u => u.role === "ADMIN").length,
  };

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["ADMIN"]}>
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold mb-2">Gestion des Utilisateurs</h1>
            <p className="text-indigo-100 text-lg">Gérer les comptes et les rôles d&apos;accès au système</p>
          </div>
          <div className="hidden md:block">
            <ShieldCheck className="w-24 h-24 opacity-20" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Utilisateurs", value: stats.total, sub: "Comptes enregistrés", color: "indigo" },
          { label: "Actifs", value: stats.active, sub: "Comptes actifs", color: "green" },
          { label: "Admins", value: stats.admins, sub: "Administrateurs", color: "blue" },
        ].map(({ label, value, sub, color }) => (
          <Card key={label} className="relative overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 dark:bg-[var(--color-surface-2)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</CardTitle>
              <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-500/10">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{loading ? "…" : value}</div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recherche + Ajouter */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl dark:text-slate-100">Recherche et Filtres</CardTitle>
              <CardDescription>Trouvez les utilisateurs que vous recherchez</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadUsers} disabled={loading} className="gap-2">
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 py-3"
              />
            </div>
            <Button
              onClick={() => { setSelectedUser(null); setModalMode("create"); }}
              className="gap-2 w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Ajouter Utilisateur
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Erreur globale */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-red-800 ml-2">{error}</span>
          <button className="ml-auto text-red-600 hover:text-red-800" onClick={() => setError(null)}>
            <X className="w-4 h-4" />
          </button>
        </Alert>
      )}

      {/* Liste */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="text-neutral-500 text-sm">Chargement des utilisateurs...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center p-16 rounded-2xl border-2 border-dashed bg-neutral-50 dark:bg-white/[0.02] border-neutral-200 dark:border-white/[0.08]">
          <ShieldCheck className="w-12 h-12 text-neutral-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="font-semibold text-neutral-600 dark:text-slate-400 mb-2">Aucun utilisateur trouvé</p>
          <p className="text-sm text-neutral-400 dark:text-slate-500">
            {search ? `Aucun résultat pour "${search}"` : "Créez le premier utilisateur."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map(user => (
            <Card key={user.id} className={`relative overflow-hidden hover:shadow-lg transition-all duration-200 border-0 ${!user.is_active ? "opacity-60" : ""}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Avatar + Infos */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-700 font-bold text-sm">
                      {user.first_name[0]}{user.last_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-bold text-lg text-neutral-900 dark:text-slate-100">
                          {user.first_name} {user.last_name}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${ROLE_COLORS[user.role] ?? ROLE_COLORS["USER"]}`}>
                          {ROLE_LABELS[user.role] ?? user.role}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.is_active ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-500"}`}>
                          {user.is_active ? "● Actif" : "○ Inactif"}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-xs text-neutral-400 dark:text-slate-500 block">Email</span>
                          <span className="font-medium text-neutral-700 dark:text-slate-300 truncate block">{user.email}</span>
                        </div>
                        <div>
                          <span className="text-xs text-neutral-400 dark:text-slate-500 block">Rôle système</span>
                          <span className="font-medium text-neutral-700 dark:text-slate-300">{user.role}</span>
                        </div>
                        <div>
                          <span className="text-xs text-neutral-400 dark:text-slate-500 block">Créé le</span>
                          <span className="font-medium text-neutral-700 dark:text-slate-300">
                            {new Date(user.created_at).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => { setSelectedUser(user); setModalMode("view"); }}
                      className="p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-700 dark:hover:text-indigo-400 text-neutral-400 transition-colors"
                      title="Voir"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setSelectedUser(user); setModalMode("edit"); }}
                      className="p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-700 dark:hover:text-indigo-400 text-neutral-400 transition-colors"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggle(user)}
                      disabled={togglingId === user.id}
                      className={`p-2 rounded-lg transition-colors text-neutral-400 ${user.is_active ? "hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-400" : "hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-400"}`}
                      title={user.is_active ? "Désactiver" : "Activer"}
                    >
                      {togglingId === user.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : user.is_active
                          ? <UserX className="w-4 h-4" />
                          : <UserCheck className="w-4 h-4" />
                      }
                    </button>
                    <button
                      onClick={() => setDeleteUser(user)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-400 text-neutral-400 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Total */}
      {!loading && users.length > 0 && (
        <p className="text-xs text-neutral-400 dark:text-slate-600 text-center">
          {users.length} utilisateur{users.length > 1 ? "s" : ""} affiché{users.length > 1 ? "s" : ""}
          {total > users.length ? ` sur ${total}` : ""}
        </p>
      )}

      {/* Modals */}
      {modalMode && (
        <UserModal
          mode={modalMode}
          user={selectedUser}
          onClose={() => { setModalMode(null); setSelectedUser(null); }}
          onSaved={loadUsers}
        />
      )}
      {deleteUser && (
        <DeleteConfirm
          user={deleteUser}
          onConfirm={handleDelete}
          onCancel={() => setDeleteUser(null)}
          loading={deleteLoading}
        />
      )}
    </div>
      </RoleGuard>
    </ProtectedRoute>
  );
}
