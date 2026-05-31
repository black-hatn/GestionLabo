import apiClient from './client';

export type ResultStatus = "NORMAL" | "ANORMAL" | "CRITIQUE";

export interface ResultItem {
  id: string;
  exam_request_id: string;
  tested_by: string;
  tested_by_name?: string;
  value: string;
  reference_value?: string;
  status: ResultStatus;
  notes?: string;
  tested_at: string;
  created_at: string;
  updated_at: string;
  // enriched fields
  patient_id?: string;
  patient_name?: string;
  record_number?: string;
  exam_id?: string;
  exam_name?: string;
  exam_unit?: string;
}

export interface ResultsResponse {
  items: ResultItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ResultCreatePayload {
  exam_request_id: string;
  tested_by: string;
  value: string;
  reference_value?: string;
  status?: ResultStatus;
  notes?: string;
}

export interface ResultUpdatePayload {
  value?: string;
  reference_value?: string;
  status?: ResultStatus;
  notes?: string;
}

const resultService = {
  async getResults(page = 1, limit = 10): Promise<ResultsResponse> {
    const res = await apiClient.get<ResultsResponse>('/resultats/', { params: { page, limit } });
    return res.data;
  },

  async getResult(id: string): Promise<ResultItem> {
    const res = await apiClient.get<ResultItem>(`/resultats/${id}`);
    return res.data;
  },

  async createResult(data: ResultCreatePayload): Promise<ResultItem> {
    const res = await apiClient.post<ResultItem>('/resultats/', data);
    return res.data;
  },

  async updateResult(id: string, data: ResultUpdatePayload): Promise<ResultItem> {
    const res = await apiClient.put<ResultItem>(`/resultats/${id}`, data);
    return res.data;
  },

  async deleteResult(id: string): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>(`/resultats/${id}`);
    return res.data;
  },
};

export default resultService;
