import apiClient from './client';

export interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface UserCreatePayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
}

export interface UserUpdatePayload {
  first_name?: string;
  last_name?: string;
  role?: string;
  is_active?: boolean;
}

const userService = {
  async getUsers(page = 1, limit = 50, search = ''): Promise<{ items: UserData[]; total: number; pages: number }> {
    const params: Record<string, any> = { page, limit };
    if (search) params.search = search;
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  async getUser(id: string): Promise<UserData> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  async createUser(payload: UserCreatePayload): Promise<UserData> {
    const response = await apiClient.post('/users', payload);
    return response.data;
  },

  async updateUser(id: string, payload: UserUpdatePayload): Promise<UserData> {
    const response = await apiClient.put(`/users/${id}`, payload);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  async toggleActive(id: string): Promise<UserData> {
    const response = await apiClient.patch(`/users/${id}/toggle-active`);
    return response.data;
  },

  async updateMyProfile(payload: { first_name?: string; last_name?: string }): Promise<UserData> {
    // Uses the auth/me approach — update via users endpoint (admin) or a dedicated profile endpoint
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Not authenticated');
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    if (!user?.id) throw new Error('No user ID found');
    return this.updateUser(user.id, payload);
  },

  async changePassword(current_password: string, new_password: string): Promise<void> {
    await apiClient.post('/auth/change-password', { current_password, new_password });
  },
};

export default userService;
