import apiClient from './client';

export interface Invoice {
  id: string;
  patient_id: string;
  invoice_number: string;
  total_amount: number;
  paid_amount: number;
  status: string;
  issue_date: string;
  due_date: string;
  paid_date?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoicesResponse {
  items: Invoice[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const invoiceService = {
  async getInvoices(page: number = 1, limit: number = 10): Promise<InvoicesResponse> {
    const response = await apiClient.get<InvoicesResponse>('/factures', {
      params: { page, limit }
    });
    return response.data;
  },

  async getInvoice(id: string): Promise<Invoice> {
    const response = await apiClient.get<Invoice>(`/factures/${id}`);
    return response.data;
  },

  async createInvoice(data: any): Promise<Invoice> {
    const response = await apiClient.post<Invoice>('/factures', data);
    return response.data;
  },

  async updateInvoice(id: string, data: any): Promise<Invoice> {
    const response = await apiClient.put<Invoice>(`/factures/${id}`, data);
    return response.data;
  },

  async deleteInvoice(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/factures/${id}`);
    return response.data;
  }
};

export default invoiceService;
