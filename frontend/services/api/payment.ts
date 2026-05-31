import apiClient from './client';

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  method: string;
  reference?: string;
  notes?: string;
  paid_at: string;
  created_at: string;
}

export interface PaymentsResponse {
  items: Payment[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const paymentService = {
  async getPayments(page: number = 1, limit: number = 10): Promise<PaymentsResponse> {
    const response = await apiClient.get<PaymentsResponse>('/paiements', {
      params: { page, limit }
    });
    return response.data;
  },

  async getPayment(id: string): Promise<Payment> {
    const response = await apiClient.get<Payment>(`/paiements/${id}`);
    return response.data;
  },

  async createPayment(data: any): Promise<Payment> {
    const response = await apiClient.post<Payment>('/paiements', data);
    return response.data;
  },

  async deletePayment(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/paiements/${id}`);
    return response.data;
  }
};

export default paymentService;
