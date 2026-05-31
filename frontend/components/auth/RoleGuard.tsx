"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { UserRole } from "@/lib/permissions";
import { ShieldOff, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * RoleGuard — Protection de route basée sur le rôle (RBAC).
 * Affiche un écran "Accès refusé" stylisé dark si le rôle ne correspond pas,
 * et redirige automatiquement après 2 secondes vers le dashboard.
 */
export function RoleGuard({ allowedRoles, children, redirectTo = "/dashboard" }: RoleGuardProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  const role = user?.role?.toUpperCase() as UserRole | undefined;
  const isAllowed = role ? allowedRoles.includes(role) : false;

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!isAllowed) {
      const timer = setTimeout(() => router.replace(redirectTo), 2000);
      return () => clearTimeout(timer);
    }
  }, [user, isAllowed, router, redirectTo]);

  // Loading / not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
      </div>
    );
  }

  // Accès refusé — style dark premium
  if (!isAllowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <ShieldOff className="w-10 h-10 text-red-400" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-white mb-2">Accès refusé</h2>
          <p className="text-slate-400 text-sm max-w-sm">
            Votre rôle <span className="font-bold text-red-400">{user.role}</span> ne dispose pas
            des permissions pour accéder à cette section.
          </p>
          <p className="text-slate-600 text-xs mt-3">Redirection automatique dans 2 secondes…</p>
        </div>
        <Link
          href={redirectTo}
          className="flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
