"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "@/lib/toast-store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, CreditCard, Clock, Activity, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

type Patient = {
  id: string;
  record_number: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  sex: "M" | "F";
  email: string;
  phone: string;
  city: string;
  address?: string;
  insurance_number?: string;
  is_active: boolean;
};

type Demande = {
  id: string;
  record_number: string;
  status: string;
  created_at: string;
  exam?: { name: string };
};

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const accessToken = useAuthStore(state => state.accessToken);
  const id = (params?.id ?? "") as string;


  const [patient, setPatient] = useState<Patient | null>(null);
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Form edit fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [sex, setSex] = useState<"M" | "F">("M");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [insuranceNumber, setInsuranceNumber] = useState("");

  const loadPatientData = async () => {
    if (!accessToken || !id) return;
    setLoading(true);
    try {
      // Load patient
      const pData = await api.get<Patient>("patients", id, accessToken);
      setPatient(pData);
      
      // Initialize form fields
      setFirstName(pData.first_name);
      setLastName(pData.last_name);
      setBirthDate(pData.birth_date);
      setSex(pData.sex);
      setEmail(pData.email);
      setPhone(pData.phone);
      setCity(pData.city);
      setAddress(pData.address || "");
      setInsuranceNumber(pData.insurance_number || "");

      // Load patient's exam requests (demandes-examen)
      // Filter list of exam requests for this patient
      const allDemandes = await api.list<Demande & { patient_id: string }>("demandes-examen", accessToken);
      const patientDemandes = allDemandes.filter((d) => d.patient_id === id);
      setDemandes(patientDemandes);
    } catch {
      toast.error("Impossible de charger les détails du patient.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPatientData();
  }, [accessToken, id]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken || !patient) return;

    const payload = {
      ...patient,
      first_name: firstName,
      last_name: lastName,
      birth_date: birthDate,
      sex,
      email,
      phone,
      city,
      address: address || null,
      insurance_number: insuranceNumber || null,
    };

    try {
      await api.update("patients", patient.id, payload, accessToken);
      toast.success("Fiche patient mise à jour !");
      setIsEditing(false);
      void loadPatientData();
    } catch (err) {
      toast.error("Mise à jour échouée");
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status?.toUpperCase()) {
      case "TERMINE":
      case "COMPLETED":
        return "success";
      case "EN_COURS":
      case "PROCESSING":
        return "default";
      case "EN_ATTENTE":
      case "PENDING":
        return "warning";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-primary-600 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-neutral-500 dark:text-slate-400">Chargement de la fiche patient...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="py-20 text-center text-sm font-semibold text-neutral-400 dark:text-slate-500">
        Patient introuvable.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Return button header */}
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/[0.08] pb-4">
        <button
          onClick={() => router.push("/dashboard/patients")}
          className="flex items-center gap-2 text-sm font-bold text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white transition-colors focus:outline-none"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour au registre
        </button>
        <span className="text-xs font-bold text-neutral-400 dark:text-slate-500">N° DOSSIER : {patient.record_number}</span>
      </div>

      {/* Main split details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Profile card */}
        <div className="flex flex-col gap-6">
          <Card className="text-center relative">
            <CardContent className="p-0 flex flex-col items-center">
              {/* Profile Avatar */}
              <div className="w-20 h-20 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center text-primary-700 font-extrabold text-3xl shadow-inner mt-4">
                {patient.first_name[0]}{patient.last_name[0]}
              </div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-slate-100 mt-4">
                {patient.first_name} {patient.last_name}
              </h2>
              <Badge variant={patient.sex === "M" ? "default" : "warning"} className="mt-2">
                {patient.sex === "M" ? "Patient Masculin" : "Patiente Féminine"}
              </Badge>

              {/* Patient Core Attributes */}
              <div className="w-full mt-6 pt-6 border-t border-neutral-100 dark:border-white/[0.06] flex flex-col gap-3.5 text-left text-sm text-neutral-700 dark:text-slate-300">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-neutral-400 dark:text-slate-500" />
                  <span className="font-semibold">{patient.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-neutral-400 dark:text-slate-500" />
                  <span className="font-semibold truncate max-w-[200px]" title={patient.email}>{patient.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-neutral-400 dark:text-slate-500" />
                  <span className="font-semibold">{patient.city}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-neutral-400 dark:text-slate-500" />
                  <span className="font-semibold">Né(e) le : {formatDate(patient.birth_date)}</span>
                </div>
                {patient.insurance_number && (
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-neutral-400 dark:text-slate-500" />
                    <span className="font-semibold text-xs bg-neutral-100 dark:bg-white/[0.05] border dark:border-white/[0.08] px-2 py-0.5 rounded dark:text-slate-300">INS : {patient.insurance_number}</span>
                  </div>
                )}
              </div>

              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full mt-6 font-bold shadow-md shadow-primary-500/10"
                >
                  Éditer la Fiche
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right side layout: Editable Info Form / Clinical history tabs */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Modifier les Informations Cliniques</CardTitle>
              </CardHeader>
              <CardContent className="mt-4">
                <form onSubmit={handleUpdate} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Prénom"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                    <Input
                      label="Nom"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Date de Naissance"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      required
                    />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-neutral-700 dark:text-slate-300">Sexe</label>
                      <select
                        value={sex}
                        onChange={(e) => setSex(e.target.value as "M" | "F")}
                        className="w-full text-sm rounded-lg border border-neutral-300 dark:border-white/[0.08] py-2.5 px-3 focus:ring-2 focus:ring-primary-100 focus:outline-none dark:bg-white/[0.03] dark:text-slate-200"
                      >
                        <option value="M">Masculin</option>
                        <option value="F">Féminin</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Adresse Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Input
                      label="Téléphone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Ville de Résidence"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                    <Input
                      label="N° Sécurité Sociale / Assurance"
                      value={insuranceNumber}
                      onChange={(e) => setInsuranceNumber(e.target.value)}
                    />
                  </div>

                  <Input
                    label="Adresse Complète"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />

                  <div className="flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-white/[0.06] pt-4 mt-2">
                    <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" variant="default" className="font-semibold shadow-md shadow-primary-500/10">
                      Enregistrer les modifications
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-none pb-0">
                <div>
                  <CardTitle className="text-lg">Historique Clinique & Examens</CardTitle>
                  <p className="text-xs text-neutral-500 dark:text-slate-400 mt-0.5">Timeline des analyses médicales demandées</p>
                </div>
              </CardHeader>
              <CardContent className="mt-6">
                {demandes.length === 0 ? (
                  <div className="py-12 text-center text-sm font-semibold text-neutral-400 dark:text-slate-500 flex flex-col items-center gap-3">
                    <Clock className="w-10 h-10 text-neutral-300 dark:text-slate-600 animate-pulse" />
                    Aucune analyse demandée pour ce patient.
                  </div>
                ) : (
                  <div className="relative border-l border-neutral-200 dark:border-white/[0.08] ml-4 flex flex-col gap-8">
                    {demandes.map((d) => (
                      <div key={d.id} className="relative pl-6">
                        {/* Timeline Bullet */}
                        <span className="absolute -left-[11px] top-1.5 flex h-5.5 w-5.5 items-center justify-center rounded-full bg-white dark:bg-[var(--color-surface)] border-2 border-primary-500 text-primary-500">
                          <Activity className="w-3 h-3" />
                        </span>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-neutral-50 dark:bg-white/[0.03] border border-neutral-200/50 dark:border-white/[0.08] rounded-xl p-4 hover:shadow-sm transition-all">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-neutral-500 dark:text-slate-400">{d.record_number}</span>
                              <span className="text-xs font-semibold text-neutral-400 dark:text-slate-500">•</span>
                              <span className="text-xs font-semibold text-neutral-400 dark:text-slate-500">{formatDate(d.created_at)}</span>
                            </div>
                            <h4 className="text-sm font-bold text-neutral-800 dark:text-slate-200 mt-1">
                              {d.exam ? d.exam.name : "Analyse Hématologique / Biochimique Standard"}
                            </h4>
                          </div>
                          <Badge variant={getStatusVariant(d.status)}>
                            {d.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
