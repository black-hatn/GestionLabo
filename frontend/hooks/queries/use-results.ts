/**
 * React Query hooks — Résultats biologiques
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import resultService, { ResultCreatePayload, ResultUpdatePayload } from "@/services/api/result";

export const RESULTS_KEY = "results";

export function useResults(page = 1, limit = 10) {
  return useQuery({
    queryKey: [RESULTS_KEY, page, limit],
    queryFn: () => resultService.getResults(page, limit),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useResult(id: string) {
  return useQuery({
    queryKey: [RESULTS_KEY, id],
    queryFn: () => resultService.getResult(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

/** Résultats critiques — pour les notifications */
export function useCriticalResults() {
  return useQuery({
    queryKey: [RESULTS_KEY, "critiques"],
    queryFn: async () => {
      const data = await resultService.getResults(1, 100);
      return (data.items ?? []).filter(r => r.status === "CRITIQUE");
    },
    staleTime: 30_000,
    refetchInterval: 60_000,  // rafraîchissement automatique toutes les 60s
  });
}

export function useResultCount() {
  return useQuery({
    queryKey: [RESULTS_KEY, "count"],
    queryFn: async () => {
      const data = await resultService.getResults(1, 1);
      return data.total ?? 0;
    },
    staleTime: 60_000,
  });
}

export function useCreateResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ResultCreatePayload) => resultService.createResult(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [RESULTS_KEY] });
    },
  });
}

export function useUpdateResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResultUpdatePayload }) =>
      resultService.updateResult(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [RESULTS_KEY] });
      qc.invalidateQueries({ queryKey: [RESULTS_KEY, id] });
    },
  });
}

export function useDeleteResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resultService.deleteResult(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [RESULTS_KEY] }),
  });
}
