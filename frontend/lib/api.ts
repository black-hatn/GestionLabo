const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export const api = {
  async get<T>(endpoint: string, id: string, token: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}/${id}`);
    }

    return response.json();
  },

  async list<T>(endpoint: string, token: string, page = 1, limit = 100): Promise<T[]> {
    const response = await fetch(`${API_BASE_URL}/${endpoint}?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}`);
    }

    const data = await response.json();
    return data.items || [];
  },

  async create<T>(endpoint: string, payload: any, token: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to create ${endpoint}`);
    }

    return response.json();
  },

  async update<T>(endpoint: string, id: string, payload: any, token: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to update ${endpoint}/${id}`);
    }

    return response.json();
  },

  async delete(endpoint: string, id: string, token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete ${endpoint}/${id}`);
    }
  },
};
