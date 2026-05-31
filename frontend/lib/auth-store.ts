/**
 * Auth Store — Zustand-based reactive store
 * Conserve la session dans localStorage et expose les actions login/logout.
 * L'utilisation de Zustand garantit que les composants se re-rendent
 * automatiquement lors d'un changement d'état (ex: déconnexion).
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserRole } from "@/lib/permissions";

interface AuthUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  is_active: boolean;
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  login: (token: string, userData: Partial<AuthUser> & { sub?: string; role?: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,

      login: (token, userData) => {
        set({
          accessToken: token,
          user: {
            id: userData?.id || userData?.sub || "",
            email: userData?.email || "",
            first_name: userData?.first_name,
            last_name: userData?.last_name,
            role: (userData?.role as UserRole) || "RECEPTIONIST",
            is_active: userData?.is_active !== false,
          },
        });
      },

      logout: () => {
        set({ accessToken: null, user: null });
      },
    }),
    {
      name: "novabio-auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
