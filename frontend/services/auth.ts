const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
}

class AuthService {
  private static TOKEN_KEY = 'access_token';
  private static REFRESH_TOKEN_KEY = 'refresh_token';

  static async register(
    email: string,
    password: string,
    first_name: string,
    last_name: string
  ): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        first_name,
        last_name,
        role: 'DOCTOR'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }

    return response.json();
  }

  static async login(email: string, password: string): Promise<AuthTokens> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }

    const tokens: AuthTokens = await response.json();

    // Fetch full user profile (with role) immediately after login
    let userData: User | null = null;
    try {
      const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      if (userResponse.ok) {
        userData = await userResponse.json();
      }
    } catch (_) {
      // Non-blocking: will degrade gracefully
    }

    // ── Stocker les tokens en localStorage (pour le refresh) ──
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, tokens.access_token);
      if (tokens.refresh_token) {
        localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh_token);
      }
    }

    // ── Hydrater le store Zustand (source de vérité unique) ──
    // useAuthStore.getState() fonctionne en dehors des composants React
    const { useAuthStore } = await import('@/lib/auth-store');
    useAuthStore.getState().login(tokens.access_token, {
      id:         userData?.id         || '',
      email:      userData?.email      || email,
      first_name: userData?.first_name,
      last_name:  userData?.last_name,
      role:       (userData?.role as any) || 'RECEPTIONIST',
      is_active:  userData?.is_active  !== false,
    });

    // ── Cookie de session pour le middleware Edge Next.js ──
    if (typeof document !== 'undefined') {
      document.cookie = "novabio_session=1; path=/; max-age=86400; SameSite=Lax";
    }

    return tokens;
  }

  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      // Supprimer le cookie de session
      document.cookie = "novabio_session=; path=/; max-age=0";
    }
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  static getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  static isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  static async refreshToken(): Promise<AuthTokens> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (!response.ok) {
      this.logout();
      throw new Error('Token refresh failed');
    }

    const tokens: AuthTokens = await response.json();

    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, tokens.access_token);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh_token);
    }

    return tokens;
  }

  static async getCurrentUser(): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token available');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.logout();
      }
      throw new Error('Failed to fetch user');
    }

    return response.json();
  }
}

export default AuthService;
