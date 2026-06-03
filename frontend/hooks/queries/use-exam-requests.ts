/**
 * React Query hooks — Demandes d'examens
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import examRequestService, {
  ExamRequestCreatePayload,
  ExamRequestStatus,
} from "@/services/api/exam-request";

export const EXAM_REQUESTS_KEY = "exam-requests";

export function useExamRequests(page = 1, limit = 10, search = "") {
  return useQuery({
    queryKey: [EXAM_REQUESTS_KEY, page, limit, search],
    queryFn: () => examRequestService.getExamRequests(page, limit, search),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useExamRequest(id: string) {
  return useQuery({
    queryKey: [EXAM_REQUESTS_KEY, id],
    queryFn: () => examRequestService.getExamRequest(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useExamRequestCount() {
  return useQuery({
    queryKey: [EXAM_REQUESTS_KEY, "count"],
    queryFn: async () => {
      const data = await examRequestService.getExamRequests(1, 1);
      return data.total ?? 0;
    },
    staleTime: 60_000,
  });
}

/** Demandes en attente — pour le badge dashboard */
export function usePendingExamRequests() {
  return useQuery({
    queryKey: [EXAM_REQUESTS_KEY, "pending"],
    queryFn: async () => {
      const data = await examRequestService.getExamRequests(1, 100);
      return (data.items ?? []).filter(r => r.status === "EN_ATTENTE");
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useCreateExamRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ExamRequestCreatePayload) => examRequestService.createExamRequest(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EXAM_REQUESTS_KEY] }),
  });
}

export function useUpdateExamRequestStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ExamRequestStatus }) =>
      examRequestService.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EXAM_REQUESTS_KEY] }),
  });
}

export function useDeleteExamRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => examRequestService.deleteExamRequest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EXAM_REQUESTS_KEY] }),
  });
}
