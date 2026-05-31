/**
 * React Query hooks — Factures
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import invoiceService from "@/services/api/invoice";

export const INVOICES_KEY = "invoices";

export function useInvoices(page = 1, limit = 10) {
  return useQuery({
    queryKey: [INVOICES_KEY, page, limit],
    queryFn: () => invoiceService.getInvoices(page, limit),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: [INVOICES_KEY, id],
    queryFn: () => invoiceService.getInvoice(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useInvoiceCount() {
  return useQuery({
    queryKey: [INVOICES_KEY, "count"],
    queryFn: async () => {
      const data = await invoiceService.getInvoices(1, 1);
      return data.total ?? 0;
    },
    staleTime: 60_000,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => invoiceService.createInvoice(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INVOICES_KEY] }),
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      invoiceService.updateInvoice(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: [INVOICES_KEY] });
      qc.invalidateQueries({ queryKey: [INVOICES_KEY, id] });
    },
  });
}

export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invoiceService.deleteInvoice(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [INVOICES_KEY] }),
  });
}
