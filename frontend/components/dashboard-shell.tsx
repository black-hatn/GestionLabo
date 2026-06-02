"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { Navbar } from "./layout/navbar";
import { Sidebar } from "./layout/sidebar";
import { ToastContainer } from "./ui/toast";

/**
 * DashboardShell — Layout principal du Dashboard.
 * Vérifie l'authentification via le store Zustand réactif.
 * Si l'utilisateur n'est pas connecté, redirige vers /login.
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore(state => state.accessToken);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (isMounted && !accessToken) {
      router.push("/login");
    }
  }, [isMounted, accessToken, router]);

  if (!isMounted || !accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] transition-colors duration-300">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {/* Ambient glow */}
          <div className="pointer-events-none fixed top-[60px] left-60 right-0 h-[200px] bg-emerald-500/[0.03] blur-3xl -z-10" />
          <div className="max-w-7xl w-full mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
