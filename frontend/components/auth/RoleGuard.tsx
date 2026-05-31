"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

/**
 * RoleGuard: Redirects users whose role is not in allowedRoles.
 * Works as a second layer of protection (after sidebar filtering).
 * Unauthorized users are sent back to /dashboard.
 */
export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;
    const role = user.role?.toUpperCase() || "USER";
    const isAllowed = allowedRoles.some(r => r.toUpperCase() === role);
    if (!isAllowed) {
      router.replace("/dashboard");
    }
  }, [user, allowedRoles, router]);

  if (!user) return null;

  const role = user.role?.toUpperCase() || "USER";
  const isAllowed = allowedRoles.some(r => r.toUpperCase() === role);

  if (!isAllowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
        <div className="text-6xl">🔒</div>
        <h2 className="text-2xl font-bold text-neutral-800">Accès refusé</h2>
        <p className="text-neutral-500 max-w-sm">
          Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
