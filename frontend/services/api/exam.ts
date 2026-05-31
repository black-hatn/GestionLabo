import apiClient from './client';

export interface Exam {
  id: string;
  name: string;
  description?: string;
  reference_values: Record<string, any>;
  unit?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExamsResponse {
  items: Exam[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const examService = {
  async getExams(page: number = 1, limit: number = 10): Promise<ExamsResponse> {
    const response = await apiClient.get<ExamsResponse>('/examens', {
      params: { page, limit }
    });
    return response.data;
  },

  async getExam(id: string): Promise<Exam> {
    const response = await apiClient.get<Exam>(`/examens/${id}`);
    return response.data;
  },

  async createExam(data: any): Promise<Exam> {
    const response = await apiClient.post<Exam>('/examens', data);
    return response.data;
  },

  async updateExam(id: string, data: any): Promise<Exam> {
    const response = await apiClient.put<Exam>(`/examens/${id}`, data);
    return response.data;
  },

  async deleteExam(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/examens/${id}`);
    return response.data;
  }
};

export default examService;
