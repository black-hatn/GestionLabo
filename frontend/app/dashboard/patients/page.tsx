"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import {
  Plus, Search, Edit2, Trash2, Eye, Loader2, AlertCircle,
  Users, Mail, Phone, MapPin, Calendar, RefreshCw, X,
  CheckCircle2, XCircle, LayoutGrid, LayoutList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { type Patient } from "@/services/api/patient";
import { DeleteConfirmDialog } from "@/components/dashboard/delete-confirm-dialog";
import {
  usePatients,
  useCreatePatient,
  useUpdatePatient,
  useDeletePatient,
} from "@/hooks/queries/use-patients";

// ── Patient Form Dialog ────────────────────────────────────────────────────
interface PatientFormProps {
  mode: "create" | "edit";
  patient?: Patient | null;
  open: boolean;
  onClose: () => void;
  saving: boolean;
  error: string | null;
  onSubmit: (data: Partial<Patient> & { record_number?: string }) => void;
}

function PatientFormDialog({ mode, patient, open, onClose, saving, error, onSubmit }: PatientFormProps) {
  const [f, setF] = useState({
    record_number: "", first_name: "", last_name: "", birth_date: "",
    sex: "M" as "M" | "F", email: "", phone: "", city: "",
    address: "", insurance_number: "", is_active: true,
  });

  useEffect(() => {
    if (mode === "edit" && patient) {
      setF({
        record_number: patient.record_number,
        first_name: patient.first_name,
        last_name: patient.last_name,
        birth_date: patient.birth_date ?? "",
        sex: patient.sex as "M" | "F",
        email: patient.email,
        phone: patient.phone,
        city: patient.city,
        address: patient.address ?? "",
        insurance_number: patient.insurance_number ?? "",
        is_active: patient.is_active,
      });
    } else {
      setF({ record_number: "", first_name: "", last_name: "", birth_date: "",
        sex: "M", email: "", phone: "", city: "", address: "", insurance_number: "", is_active: true });
    }
  }, [mode, patient, open]);

  if (!open) return null;

  const field = (label: string, key: keyof typeof f, opts?: { type?: string; placeholder?: string; required?: boolean }) => (
    <div>
      <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1.5">
        {label}{opts?.required !== false ? " *" : ""}
      </label>
      <Input
        type={opts?.type ?? "text"}
        value={String(f[key])}
        onChange={e => setF(p => ({ ...p, [key]: e.target.value }))}
        placeholder={opts?.placeholder}
        required={opts?.required !== false}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-scale-in
          dark:bg-[#0c1828] dark:border dark:border-white/[0.08]
          bg-white border border-slate-200">

        <div className="flex items-center justify-between px-6 py-4
            dark:border-b dark:border-white/[0.07] border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <h2 className="text-sm font-bold dark:text-white text-slate-900">
              {mode === "create" ? "Nouveau Patient" : "Modifier le Patient"}
            </h2>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl dark:hover:bg-white/[0.06] hover:bg-slate-100 dark:text-slate-500 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={e => { e.preventDefault(); onSubmit(f); }}>
          <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            {mode === "create" && field("N° Dossier", "record_number", { placeholder: "ex: PAT-0001" })}

            <div className="grid grid-cols-2 gap-3">
              {field("Prénom", "first_name", { placeholder: "ex: Aminata" })}
              {field("Nom", "last_name", { placeholder: "ex: Traoré" })}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1.5">Date de naissance *</label>
                <Input type="date" value={f.birth_date} onChange={e => setF(p => ({ ...p, birth_date: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-xs font-semibold dark:text-slate-400 text-slate-600 mb-1.5">Sexe *</label>
                <div className="flex gap-2 h-10">
                  {(["M", "F"] as const).map(s => (
                    <button type="button" key={s} onClick={() => setF(p => ({ ...p, sex: s }))}
                      className={`flex-1 rounded-xl text-xs font-bold border transition-colors
                        ${f.sex === s
                          ? "bg-blue-500 text-white border-blue-500"
                          : "dark:bg-white/[0.03] dark:border-white/[0.08] dark:text-slate-400 bg-slate-50 border-slate-200 text-slate-600"
                        }`}>
                      {s === "M" ? "Masculin" : "Féminin"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {field("Email", "email", { type: "email", placeholder: "ex: patient@exemple.fr" })}

            <div className="grid grid-cols-2 gap-3">
              {field("Téléphone", "phone", { placeholder: "ex: 77 123 45 67" })}
              {field("Ville", "city", { placeholder: "ex: Dakar" })}
            </div>

            {field("Adresse", "address", { placeholder: "ex: Rue 10, Médina", required: false })}
            {field("N° Assurance", "insurance_number", { placeholder: "ex: CNAM-00123", required: false })}

            {mode === "edit" && (
              <div className="flex items-center gap-3 p-3 rounded-xl
                  dark:bg-white/[0.03] dark:border dark:border-white/[0.05]
                  bg-slate-50 border border-slate-100">
                <label className="text-xs font-semibold dark:text-slate-400 text-slate-600">Statut</label>
                <label className="relative inline-flex items-center cursor-pointer ml-auto">
                  <input type="checkbox" checked={f.is_active} onChange={e => setF(p => ({ ...p, is_active: e.target.checked }))} className="sr-only peer" />
                  <div className="w-10 h-5 bg-slate-700 rounded-full peer peer-checked:bg-emerald-500 transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </label>
                <span className={`text-xs font-bold ${f.is_active ? "text-emerald-400" : "text-slate-500"}`}>
                  {f.is_active ? "Actif" : "Inactif"}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-3 px-6 py-4 dark:border-t dark:border-white/[0.07] border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 btn-ghost h-10">Annuler</Button>
            <Button type="submit" disabled={saving} className="flex-1 btn-emerald h-10 text-sm font-bold">
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {mode === "create" ? "Créer le Patient" : "Enregistrer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Patient Detail Sheet ───────────────────────────────────────────────────
function PatientSheet({ patient, open, onClose, onEdit }: {
  patient: Patient | null; open: boolean; onClose: () => void; onEdit: (p: Patient) => void;
}) {
  if (!open || !patient) return null;
  const initials = `${patient.first_name[0]}${patient.last_name[0]}`.toUpperCase();
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col shadow-2xl animate-slide-in-right
          dark:bg-[#0c1828] dark:border-l dark:border-white/[0.07]
          bg-white border-l border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 dark:border-b dark:border-white/[0.07] border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg">
              {initials}
            </div>
            <div>
              <h2 className="font-bold dark:text-white text-slate-900">{patient.first_name} {patient.last_name}</h2>
              <p className="text-xs dark:text-slate-500 text-slate-400">{patient.record_number}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl dark:hover:bg-white/[0.06] hover:bg-slate-100 dark:text-slate-500 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            {patient.is_active
              ? <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3 h-3" />Actif</span>
              : <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20"><XCircle className="w-3 h-3" />Inactif</span>
            }
          </div>

          {[
            { icon: Mail,     label: "Email",           value: patient.email },
            { icon: Phone,    label: "Téléphone",        value: patient.phone },
            { icon: MapPin,   label: "Ville",            value: patient.city },
            { icon: Calendar, label: "Date de naissance", value: patient.birth_date ? new Date(patient.birth_date).toLocaleDateString("fr-FR") : "—" },
            { icon: Users,    label: "Sexe",             value: patient.sex === "M" ? "Masculin" : "Féminin" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 p-3 rounded-xl
                dark:bg-white/[0.03] dark:border dark:border-white/[0.05]
                bg-slate-50 border border-slate-100">
              <Icon className="w-4 h-4 dark:text-slate-500 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-[10px] font-semibold dark:text-slate-500 text-slate-400 uppercase tracking-wide mb-0.5">{label}</div>
                <div className="text-sm font-medium dark:text-slate-200 text-slate-800">{value}</div>
              </div>
            </div>
          ))}

          {patient.address && (
            <div className="p-3 rounded-xl dark:bg-white/[0.03] dark:border dark:border-white/[0.05] bg-slate-50 border border-slate-100">
              <div className="text-[10px] font-semibold dark:text-slate-500 text-slate-400 uppercase tracking-wide mb-1">Adresse</div>
              <p className="text-sm dark:text-slate-300 text-slate-700">{patient.address}</p>
            </div>
          )}
          {patient.insurance_number && (
            <div className="p-3 rounded-xl dark:bg-white/[0.03] dark:border dark:border-white/[0.05] bg-slate-50 border border-slate-100">
              <div className="text-[10px] font-semibold dark:text-slate-500 text-slate-400 uppercase tracking-wide mb-1">N° Assurance</div>
              <p className="text-sm font-mono dark:text-slate-300 text-slate-700">{patient.insurance_number}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 dark:border-t dark:border-white/[0.07] border-t border-slate-100 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 btn-ghost h-10">Fermer</Button>
          <Button onClick={() => { onClose(); onEdit(patient); }} className="flex-1 btn-emerald h-10 text-sm font-bold">Modifier</Button>
        </div>
      </aside>
    </>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
type ModalState =
  | { type: "idle" }
  | { type: "view";   patient: Patient }
  | { type: "edit";   patient: Patient }
  | { type: "create" }
  | { type: "delete"; patient: Patient };

export default function PatientsPage() {
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [modal, setModal]         = useState<ModalState>({ type: "idle" });
  const [formError, setFormError] = useState<string | null>(null);

  const user = useAuthStore(state => state.user);
  const canCreate = ["ADMIN", "RECEPTIONIST"].includes(user?.role ?? "");
  const canEdit   = ["ADMIN", "RECEPTIONIST"].includes(user?.role ?? "");
  const canDelete = user?.role === "ADMIN";

  // ── React Query hooks ───────────────────────────────────────────────────
  const { data, isLoading, isFetching, isError, error, refetch } = usePatients(page, 12);
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const deletePatient = useDeletePatient();

  const patients   = data?.items ?? [];
  const totalPages = data?.pages ?? 1;
  const total      = data?.total ?? 0;

  const loading = isLoading || isFetching;
  const loadError = isError
    ? ((error as any)?.response?.data?.detail ?? (error as any)?.message ?? "Erreur de chargement")
    : null;

  const openCreate = () => { setFormError(null); setModal({ type: "create" }); };
  const openEdit   = (p: Patient) => { setFormError(null); setModal({ type: "edit", patient: p }); };
  const openView   = (p: Patient) => setModal({ type: "view", patient: p });
  const openDelete = (p: Patient) => setModal({ type: "delete", patient: p });
  const closeModal = () => { setModal({ type: "idle" }); setFormError(null); };

  const handleSubmit = (data: any) => {
    setFormError(null);
    if (modal.type === "create") {
      createPatient.mutate(data, {
        onSuccess: closeModal,
        onError: (err: any) => setFormError(err?.response?.data?.detail ?? err?.message ?? "Erreur"),
      });
    } else if (modal.type === "edit") {
      updatePatient.mutate({ id: modal.patient.id, data }, {
        onSuccess: closeModal,
        onError: (err: any) => setFormError(err?.response?.data?.detail ?? err?.message ?? "Erreur"),
      });
    }
  };

  const handleDelete = () => {
    if (modal.type !== "delete") return;
    deletePatient.mutate(modal.patient.id, {
      onSuccess: closeModal,
      onError: (err: any) => setFormError(err?.response?.data?.detail ?? err?.message ?? "Erreur lors de la suppression"),
    });
  };

  const saving = createPatient.isPending || updatePatient.isPending || deletePatient.isPending;

  const initials = (p: Patient) =>
    `${p.first_name[0]}${p.last_name[0]}`.toUpperCase();

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["ADMIN", "RECEPTIONIST", "COLLECTOR", "LAB_TECH", "DOCTOR"]}>
        <div className="space-y-6 animate-fade-in">

          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl p-8
              bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold mb-1">Gestion Patients</h1>
                <p className="text-blue-100 text-sm">{total} patient{total > 1 ? "s" : ""} enregistré{total > 1 ? "s" : ""}</p>
              </div>
              <Users className="hidden md:block w-20 h-20 opacity-20" />
            </div>
          </div>

          {/* Toolbar */}
          <div className="rounded-2xl p-5
              dark:bg-[#0c1828] dark:border dark:border-white/[0.07]
              bg-white border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 dark:text-slate-500 text-slate-400" />
                <Input
                  placeholder="Rechercher par nom, email ou n° dossier..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => refetch()} disabled={loading} className="btn-ghost h-10 px-3">
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
                <Button variant="outline" onClick={() => setViewMode(v => v === "grid" ? "table" : "grid")} className="btn-ghost h-10 px-3">
                  {viewMode === "grid" ? <LayoutList className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
                </Button>
                {canCreate && (
                  <Button onClick={openCreate} className="btn-emerald h-10 px-4 gap-2 text-sm font-bold">
                    <Plus className="w-4 h-4" />
                    Nouveau
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Error */}
          {loadError && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm
                bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />{loadError}
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400 mb-3" />
              <p className="text-sm dark:text-slate-400 text-slate-500">Chargement des patients…</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl
                dark:bg-[#0c1828] dark:border dark:border-white/[0.07]
                bg-white border border-slate-200">
              <Users className="w-12 h-12 dark:text-slate-700 text-slate-300 mb-3" />
              <p className="text-sm dark:text-slate-400 text-slate-500">
                {search ? "Aucun patient ne correspond à la recherche" : "Aucun patient — cliquez Nouveau"}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patients.map(p => (
                <div key={p.id}
                  className="rounded-2xl p-5
                    dark:bg-[#0c1828] dark:border dark:border-white/[0.07] dark:hover:border-white/[0.14]
                    bg-white border border-slate-200 hover:border-slate-300
                    transition-all shadow-sm">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-base shrink-0">
                      {initials(p)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold dark:text-white text-slate-900 truncate">
                        {p.first_name} {p.last_name}
                      </div>
                      <div className="text-xs dark:text-slate-500 text-slate-400">{p.record_number}</div>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border
                      ${p.is_active
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}>
                      {p.is_active ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                      {p.is_active ? "Actif" : "Inactif"}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs dark:text-slate-400 text-slate-500 mb-4">
                    <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /><span className="truncate">{p.email}</span></div>
                    <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /><span>{p.phone}</span></div>
                    <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /><span>{p.city}</span></div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t dark:border-white/[0.06] border-slate-100">
                    <button onClick={() => openView(p)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold
                        dark:bg-white/[0.05] dark:text-slate-300 dark:hover:bg-white/[0.1]
                        bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                      <Eye className="w-3.5 h-3.5 inline mr-1" />Voir
                    </button>
                    {canEdit && (
                    <button onClick={() => openEdit(p)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold
                        dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20
                        bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors">
                      <Edit2 className="w-3.5 h-3.5 inline mr-1" />Modifier
                    </button>
                    )}
                    {canDelete && (
                    <button onClick={() => openDelete(p)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold
                        dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20
                        bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 inline mr-1" />Supprimer
                    </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden
                dark:bg-[#0c1828] dark:border dark:border-white/[0.07]
                bg-white border border-slate-200 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-premium">
                  <thead>
                    <tr className="dark:border-b dark:border-white/[0.06] border-b border-slate-100">
                      {["Patient", "Email", "Téléphone", "Ville", "Statut", "Actions"].map(h => (
                        <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider
                            dark:text-slate-500 text-slate-400 first:pl-6 last:pr-6 last:text-right">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map(p => (
                      <tr key={p.id} className="dark:border-b dark:border-white/[0.04] border-b border-slate-50
                          dark:hover:bg-white/[0.02] hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
                              {initials(p)}
                            </div>
                            <div>
                              <div className="font-semibold dark:text-white text-slate-900">{p.first_name} {p.last_name}</div>
                              <div className="text-xs dark:text-slate-500 text-slate-400">{p.record_number}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 dark:text-slate-400 text-slate-500 text-xs">{p.email}</td>
                        <td className="px-5 py-4 dark:text-slate-400 text-slate-500 text-xs">{p.phone}</td>
                        <td className="px-5 py-4 dark:text-slate-400 text-slate-500 text-xs">{p.city}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border
                            ${p.is_active
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                            }`}>
                            {p.is_active ? "Actif" : "Inactif"}
                          </span>
                        </td>
                        <td className="px-5 py-4 pr-6">
                          <div className="flex items-center justify-end gap-1">
                            {[
                              { icon: Eye,    fn: () => openView(p),   color: "cyan",  show: true       },
                              { icon: Edit2,  fn: () => openEdit(p),   color: "amber", show: canEdit    },
                              { icon: Trash2, fn: () => openDelete(p), color: "red",   show: canDelete  },
                            ].filter(a => a.show).map(({ icon: Icon, fn, color }) => (
                              <button key={color} onClick={fn}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                  dark:text-slate-400 text-slate-500
                                  ${color === "cyan"  ? "dark:hover:bg-cyan-500/15 hover:bg-cyan-50 dark:hover:text-cyan-400 hover:text-cyan-600"   : ""}
                                  ${color === "amber" ? "dark:hover:bg-amber-500/15 hover:bg-amber-50 dark:hover:text-amber-400 hover:text-amber-600" : ""}
                                  ${color === "red"   ? "dark:hover:bg-red-500/15 hover:bg-red-50 dark:hover:text-red-400 hover:text-red-600"         : ""}
                                `}>
                                <Icon className="w-4 h-4" />
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex gap-2 justify-center items-center pt-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost">Précédent</Button>
              <span className="text-sm dark:text-slate-400 text-slate-500 px-3">Page {page} / {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost">Suivant</Button>
            </div>
          )}

        </div>

        {/* Dialogs */}
        <PatientSheet
          open={modal.type === "view"}
          patient={modal.type === "view" ? modal.patient : null}
          onClose={closeModal}
          onEdit={openEdit}
        />
        <PatientFormDialog
          mode={modal.type === "edit" ? "edit" : "create"}
          patient={modal.type === "edit" ? modal.patient : null}
          open={modal.type === "create" || modal.type === "edit"}
          onClose={closeModal}
          saving={saving}
          error={formError}
          onSubmit={handleSubmit}
        />
        <DeleteConfirmDialog
          open={modal.type === "delete"}
          itemName={modal.type === "delete" ? `${modal.patient.first_name} ${modal.patient.last_name}` : ""}
          itemType="ce patient"
          saving={saving}
          onConfirm={handleDelete}
          onCancel={closeModal}
        />

      </RoleGuard>
    </ProtectedRoute>
  );
}
