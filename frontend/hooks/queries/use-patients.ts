/**
 * React Query hooks — Patients
 * Centralise la gestion du cache, du chargement et des mutations pour les patients.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import patientService from "@/services/api/patient";

export const PATIENTS_KEY = "patients";

/** Liste paginée des patients */
export function usePatients(page = 1, limit = 10) {
  return useQuery({
    queryKey: [PATIENTS_KEY, page, limit],
    queryFn: () => patientService.getPatients(page, limit),
    staleTime: 30_000,       // 30 secondes avant de considérer les données obsolètes
    placeholderData: (prev) => prev,  // garde les données précédentes pendant le chargement
  });
}

/** Un seul patient par ID */
export function usePatient(id: string) {
  return useQuery({
    queryKey: [PATIENTS_KEY, id],
    queryFn: () => patientService.getPatient(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

/** Comptage total (pour le dashboard) */
export function usePatientCount() {
  return useQuery({
    queryKey: [PATIENTS_KEY, "count"],
    queryFn: async () => {
      const data = await patientService.getPatients(1, 1);
      return data.total ?? 0;
    },
    staleTime: 60_000,
  });
}

/** Créer un patient */
export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: patientService.createPatient,
    onSuccess: () => qc.invalidateQueries({ queryKey: [PATIENTS_KEY] }),
  });
}

/** Modifier un patient */
export function useUpdatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof patientService.updatePatient>[1] }) =>
      patientService.updatePatient(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [PATIENTS_KEY] });
      qc.invalidateQueries({ queryKey: [PATIENTS_KEY, id] });
    },
  });
}

/** Supprimer un patient */
export function useDeletePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patientService.deletePatient(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PATIENTS_KEY] }),
  });
}
