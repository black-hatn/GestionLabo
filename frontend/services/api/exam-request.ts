import apiClient from './client';

export type ExamRequestStatus = "EN_ATTENTE" | "EN_COURS" | "TERMINE" | "ANNULE";

export interface ExamRequest {
  id: string;
  patient_id: string;
  doctor_id: string;
  exam_id: string;
  status: ExamRequestStatus;
  clinical_info?: string;
  sample_type: string;
  requested_at: string;
  created_at: string;
  updated_at: string;
  // enriched
  patient_name?: string;
  record_number?: string;
  exam_name?: string;
  exam_unit?: string;
  doctor_name?: string;
}

export interface ExamRequestsResponse {
  items: ExamRequest[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ExamRequestCreatePayload {
  patient_id: string;
  doctor_id: string;
  exam_id: string;
  sample_type: string;
  clinical_info?: string;
}

const examRequestService = {
  async getExamRequests(page = 1, limit = 10): Promise<ExamRequestsResponse> {
    const res = await apiClient.get<ExamRequestsResponse>('/demandes-examen', { params: { page, limit } });
    return res.data;
  },

  async getExamRequest(id: string): Promise<ExamRequest> {
    const res = await apiClient.get<ExamRequest>(`/demandes-examen/${id}`);
    return res.data;
  },

  async createExamRequest(data: ExamRequestCreatePayload): Promise<ExamRequest> {
    const res = await apiClient.post<ExamRequest>('/demandes-examen', data);
    return res.data;
  },

  async updateStatus(id: string, status: ExamRequestStatus): Promise<ExamRequest> {
    const res = await apiClient.put<ExamRequest>(`/demandes-examen/${id}`, { status });
    return res.data;
  },

  async deleteExamRequest(id: string): Promise<{ message: string }> {
    const res = await apiClient.delete<{ message: string }>(`/demandes-examen/${id}`);
    return res.data;
  },
};

export default examRequestService;
