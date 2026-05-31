import apiClient from './client';

export interface Patient {
  id: string;
  record_number: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  sex: string;
  email: string;
  phone: string;
  city: string;
  address?: string;
  insurance_number?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientsResponse {
  items: Patient[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const patientService = {
  async getPatients(page: number = 1, limit: number = 10, search: string = ''): Promise<PatientsResponse> {
    const response = await apiClient.get<PatientsResponse>('/patients', {
      params: { page, limit, search }
    });
    return response.data;
  },

  async getPatient(id: string): Promise<Patient> {
    const response = await apiClient.get<Patient>(`/patients/${id}`);
    return response.data;
  },

  async createPatient(data: any): Promise<Patient> {
    const response = await apiClient.post<Patient>('/patients', data);
    return response.data;
  },

  async updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
    const response = await apiClient.put<Patient>(`/patients/${id}`, data);
    return response.data;
  },

  async deletePatient(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/patients/${id}`);
    return response.data;
  }
};

export default patientService;
