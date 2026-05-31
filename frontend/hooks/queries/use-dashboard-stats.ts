/**
 * React Query hook — Statistiques du tableau de bord
 * Charge tous les compteurs en une seule query avec cache partagé.
 */
import { useQuery } from "@tanstack/react-query";
import patientService       from "@/services/api/patient";
import examRequestService   from "@/services/api/exam-request";
import resultService        from "@/services/api/result";
import invoiceService       from "@/services/api/invoice";

export interface DashboardStats {
  patients:  number;
  exams:     number;
  results:   number;
  invoices:  number;
  critiques: number;
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [p, e, r, inv, allResults] = await Promise.all([
        patientService.getPatients(1, 1),
        examRequestService.getExamRequests(1, 1),
        resultService.getResults(1, 1),
        invoiceService.getInvoices(1, 1),
        resultService.getResults(1, 100),
      ]);

      const critiques = (allResults.items ?? []).filter(
        (res: any) => res.status === "CRITIQUE"
      ).length;

      return {
        patients:  p.total   ?? 0,
        exams:     e.total   ?? 0,
        results:   r.total   ?? 0,
        invoices:  inv.total ?? 0,
        critiques,
      };
    },
    staleTime:       60_000,   // données fraîches 1 minute
    refetchInterval: 120_000,  // rafraîchissement automatique toutes les 2 min
    refetchOnWindowFocus: true,
  });
}
