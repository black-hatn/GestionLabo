import axios from 'axios';
import AuthService from '../auth';

// Toujours passer par le proxy Next.js (même origine → invisible pour les adblockers).
// Si NEXT_PUBLIC_API_BASE_URL pointe vers localhost, on l'utilise (dev local backend).
const _envUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
const API_BASE_URL = _envUrl.startsWith('http://localhost')
  ? _envUrl
  : '/api/proxy';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 70000, // 70s — couvre le cold-start Render free tier (~50s)
});

// Source de vérité unique : Zustand persist sous "novabio-auth"
function getAuthToken(): string | null {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('novabio-auth');
      if (raw) {
        const parsed = JSON.parse(raw);
        const token = parsed?.state?.accessToken;
        if (token) return token;
      }
    }
  } catch { /* ignore */ }
  return AuthService.getToken();
}

// Met à jour Zustand avec le nouveau token après refresh
async function syncTokenToZustand(newToken: string): Promise<void> {
  try {
    const { useAuthStore } = await import('@/lib/auth-store');
    const state = useAuthStore.getState();
    if (state.user) {
      useAuthStore.getState().login(newToken, state.user);
    }
    if (typeof document !== 'undefined') {
      document.cookie = `novabio_session=${newToken}; path=/; max-age=86400; SameSite=Lax`;
    }
  } catch { /* ignore */ }
}

// Request interceptor — injecte le Bearer token
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor — gère les 401 avec refresh automatique
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const tokens = await AuthService.refreshToken();
        // Synchronise le nouveau token dans Zustand (source de vérité)
        await syncTokenToZustand(tokens.access_token);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`;
        }
        return apiClient(originalRequest);
      } catch {
        // Refresh échoué → déconnexion silencieuse
        const { useAuthStore } = await import('@/lib/auth-store').catch(() => ({ useAuthStore: null }));
        useAuthStore?.getState().logout();
        AuthService.logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(new Error("Session expirée - veuillez vous reconnecter"));
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
