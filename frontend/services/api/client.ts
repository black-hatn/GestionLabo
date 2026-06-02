import axios from 'axios';
import AuthService from '../auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Lit le token depuis zustand (source de vérité) OU localStorage fallback
function getAuthToken(): string | null {
  try {
    // Zustand persist stocke sous "novabio-auth" dans localStorage
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('novabio-auth');
      if (raw) {
        const parsed = JSON.parse(raw);
        const token = parsed?.state?.accessToken;
        if (token) return token;
      }
    }
  } catch { /* ignore */ }
  // Fallback: AuthService legacy key
  return AuthService.getToken();
}

// Request interceptor - add token to every request
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor - handle 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await AuthService.refreshToken();
        const token = AuthService.getToken();
        if (token && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch {
        // Refresh échoué → déconnexion et redirection sans afficher "Network Error"
        AuthService.logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return new Promise(() => {}); // promesse jamais résolue = page reste silencieuse
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
