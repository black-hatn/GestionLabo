"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import {
  LayoutDashboard, Users, Activity, ClipboardList, FileSpreadsheet,
  Receipt, FileText, Settings, ShieldCheck, Shield,
  ChevronLeft, ChevronRight, Microscope, Zap, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import { useToastStore } from "@/lib/toast-store";
import { UserRole } from "@/lib/permissions";

/* ─ Navigation config — pilotée par les rôles ─────────────────────── */
const NAV_ITEMS: {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}[] = [
  { label: "Tableau de Bord",      href: "/dashboard",              icon: LayoutDashboard, roles: ["ADMIN","RECEPTIONIST","COLLECTOR","LAB_TECH","DOCTOR"] },
  { label: "Patients",              href: "/dashboard/patients",     icon: Users,           roles: ["ADMIN","RECEPTIONIST","COLLECTOR","LAB_TECH","DOCTOR"] },
  { label: "Catalogue Analyses",    href: "/dashboard/exams",        icon: Microscope,      roles: ["ADMIN","LAB_TECH","DOCTOR"] },
  { label: "Demandes d'Examens",   href: "/dashboard/exam-requests", icon: ClipboardList,   roles: ["ADMIN","RECEPTIONIST","COLLECTOR","LAB_TECH","DOCTOR"] },
  { label: "Résultats Biologiques",href: "/dashboard/results",       icon: FileSpreadsheet, roles: ["ADMIN","LAB_TECH","DOCTOR"] },
  { label: "Facturation",           href: "/dashboard/invoices",     icon: Receipt,         roles: ["ADMIN","RECEPTIONIST"] },
  { label: "Paiements",             href: "/dashboard/payments",     icon: FileText,        roles: ["ADMIN"] },
];

const ADMIN_ITEMS = [
  { label: "Panneau Admin",        href: "/dashboard/admin",       icon: Shield },
  { label: "Gestion Utilisateurs", href: "/dashboard/users",       icon: ShieldCheck },
  { label: "Journal d'Audit",      href: "/dashboard/audit-logs",  icon: Shield },
];

const BOTTOM_ITEMS = [
  { label: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

/* ─ Sidebar Component ──────────────────────────────────────────────── */
export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = { user: useAuthStore(state => state.user), logout: useAuthStore(state => state.logout) };
  const toast = useToastStore();
  const [collapsed, setCollapsed] = React.useState(false);

  const role    = user?.role as UserRole | undefined;
  const isAdmin = role === "ADMIN";
  const filtered = NAV_ITEMS.filter(i => role && i.roles.includes(role));

  const handleLogout = () => {
    logout();
    toast.info("À bientôt !");
    router.push("/login");
  };

  /* ─ Nav Item ─ */
  const Item = ({
    href,
    icon: Icon,
    label,
    danger = false,
  }: {
    href: string;
    icon: React.ElementType;
    label: string;
    danger?: boolean;
  }) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        title={collapsed ? label : undefined}
        className={cn(
          "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 select-none",
          active
            ? danger
              ? "bg-red-500/15 text-red-300 border border-red-500/30"
              : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
            : danger
              ? "text-slate-400 light:text-slate-600 border border-transparent hover:bg-red-500/8 hover:text-red-400 hover:border-red-500/20"
              : "text-slate-400 light:text-slate-600 border border-transparent hover:bg-white/[0.04] light:hover:bg-black/[0.04] hover:text-white light:hover:text-slate-900 hover:border-white/[0.06] light:hover:border-black/[0.06]"
        )}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span
          className={cn(
            "transition-all duration-200 whitespace-nowrap leading-none",
            collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
          )}
        >
          {label}
        </span>
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col shrink-0 transition-all duration-300 ease-in-out border-r border-white/[0.05] relative select-none",
        collapsed ? "w-[68px]" : "w-60"
      )}
      style={{ background: "var(--color-sidebar)" }}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-7 -right-3 w-6 h-6 rounded-full flex items-center justify-center text-slate-500 hover:text-white transition-all z-50 border border-white/[0.08] shadow-card hover:border-emerald-500/30"
        style={{ background: "var(--color-surface)" }}
        aria-label="Réduire la barre latérale"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Brand header */}
      <div className={cn("flex items-center gap-3 px-4 pt-6 pb-5 border-b border-white/[0.04]", collapsed && "justify-center px-2")}>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-emerald shrink-0">
          <Activity className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-[15px] text-white light:text-slate-900 font-display">
              Nova<span className="text-emerald-400">Bio</span>
            </span>
            <span className="text-[9px] text-slate-600 light:text-slate-400 tracking-[0.16em] uppercase font-semibold">Lab Platform</span>
          </div>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-5 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
          <span className="text-[9px] font-bold text-slate-600 light:text-slate-400 uppercase tracking-[0.15em] px-3 mb-2">
            Navigation
          </span>
        )}

        {filtered.map(i => <Item key={i.href} {...i} />)}

        {/* Admin section — visible uniquement par l'ADMIN */}
        {isAdmin && (
          <div className={cn("mt-5 pt-5 border-t border-white/[0.04] flex flex-col gap-1")}>
            {!collapsed && (
              <span className="text-[9px] font-bold text-red-500/70 uppercase tracking-[0.15em] px-3 mb-2 flex items-center gap-1.5">
                <Shield className="w-2.5 h-2.5" />
                Administration
              </span>
            )}
            {ADMIN_ITEMS.map(i => <Item key={i.href} {...i} danger />)}
          </div>
        )}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 py-4 border-t border-white/[0.04] flex flex-col gap-1">
        {BOTTOM_ITEMS.map(i => <Item key={i.href} {...i} />)}

        {/* Logout button */}
        <button
          onClick={handleLogout}
          title={collapsed ? "Déconnexion" : undefined}
          className={cn(
            "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 select-none w-full mt-1",
            "text-slate-400 light:text-slate-600 border border-transparent hover:bg-red-500/[0.08] hover:text-red-400 hover:border-red-500/20"
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span
            className={cn(
              "transition-all duration-200 whitespace-nowrap leading-none",
              collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
            )}
          >
            Déconnexion
          </span>
        </button>

        {/* Version badge */}
        {!collapsed && (
          <div
            className="mx-1 mt-3 p-3 rounded-xl border border-emerald-500/15 flex items-start gap-2.5"
            style={{ background: "rgba(16,185,129,0.05)" }}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-bold text-slate-300 light:text-slate-700 block">Mode IA Activé</span>
              <span className="text-[10px] text-slate-600 light:text-slate-400">NovaBio v2.0 · Médical</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
