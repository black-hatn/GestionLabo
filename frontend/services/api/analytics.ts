import apiClient from './client';

export interface AnalyticsSummary {
  total_patients: number;
  active_patients: number;
  total_invoices: number;
  total_revenue: number;
  pending_revenue: number;
  invoices_by_status: {
    BROUILLON: number;
    ENVOYEE: number;
    PAYEE: number;
    EN_RETARD: number;
    ANNULEE: number;
  };
  total_exam_requests: number;
  exam_requests_by_status: {
    EN_ATTENTE: number;
    EN_COURS: number;
    TERMINE: number;
    ANNULE: number;
  };
  total_payments: number;
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const response = await apiClient.get<AnalyticsSummary>('/analytics/summary');
  return response.data;
}
