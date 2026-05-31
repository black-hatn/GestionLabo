"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
  LayoutDashboard, Users, Activity, ClipboardList, FileSpreadsheet,
  Receipt, FileText, Settings, ShieldCheck, Shield,
  ChevronLeft, ChevronRight, Microscope, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";

const NAV_ITEMS = [
  { label: "Tableau de Bord",       href: "/dashboard",              icon: LayoutDashboard, roles: ["ADMIN","RECEPTIONIST","COLLECTOR","LAB_TECH","DOCTOR"] },
  { label: "Patients",               href: "/dashboard/patients",     icon: Users,           roles: ["ADMIN","RECEPTIONIST","COLLECTOR","LAB_TECH","DOCTOR"] },
  { label: "Catalogue Analyses",     href: "/dashboard/exams",        icon: Microscope,      roles: ["ADMIN","LAB_TECH","DOCTOR"] },
  { label: "Demandes d'Examens",    href: "/dashboard/exam-requests", icon: ClipboardList,   roles: ["ADMIN","RECEPTIONIST","COLLECTOR","LAB_TECH","DOCTOR"] },
  { label: "Résultats Biologiques", href: "/dashboard/results",       icon: FileSpreadsheet, roles: ["ADMIN","LAB_TECH","DOCTOR"] },
  { label: "Facturation",            href: "/dashboard/invoices",     icon: Receipt,         roles: ["ADMIN","RECEPTIONIST"] },
  { label: "Paiements",              href: "/dashboard/payments",     icon: FileText,        roles: ["ADMIN"] },
];

const ADMIN_ITEMS = [
  { label: "Panneau Admin",         href: "/dashboard/admin",        icon: Shield },
  { label: "Gestion Utilisateurs",  href: "/dashboard/users",        icon: ShieldCheck },
];

const BOTTOM_ITEMS = [
  { label: "Paramètres",            href: "/dashboard/settings",     icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [collapsed, setCollapsed] = React.useState(false);
  const isAdmin = user?.role === "ADMIN";

  const filtered = NAV_ITEMS.filter(i => i.roles.includes(user?.role ?? "USER"));

  const Item = ({ href, icon: Icon, label, danger = false }: { href: string; icon: React.ElementType; label: string; danger?: boolean }) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        title={collapsed ? label : undefined}
        className={cn(
          "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 select-none",
          active
            ? danger
              ? "bg-red-500/15 text-red-400 border border-red-500/25"
              : "bg-emerald-500/12 text-emerald-400 border border-emerald-500/20"
            : danger
              ? "text-slate-500 hover:text-red-400 hover:bg-red-500/8"
              : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]"
        )}
      >
        {/* Active indicator bar */}
        {active && (
          <div className={cn(
            "absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-full",
            danger ? "bg-red-400" : "bg-emerald-400"
          )} />
        )}
        <Icon className={cn("w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-110", active ? "" : "")} />
        <span className={cn(
          "transition-all duration-200 whitespace-nowrap leading-none",
          collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
        )}>
          {label}
        </span>
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col shrink-0 transition-all duration-300 ease-spring border-r border-white/[0.05] relative select-none",
        collapsed ? "w-[68px]" : "w-60"
      )}
      style={{ background: "linear-gradient(180deg, #0a1525 0%, #060e1c 100%)" }}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-7 -right-3 w-6 h-6 rounded-full flex items-center justify-center text-slate-500 hover:text-white transition-all z-50 border border-white/[0.08] shadow-card hover:border-emerald-500/30"
        style={{ background: "#0a1525" }}
        aria-label="Toggle Sidebar"
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
            <span className="font-extrabold text-[15px] text-white font-display">
              Nova<span className="text-emerald-400">Bio</span>
            </span>
            <span className="text-[9px] text-slate-600 tracking-[0.16em] uppercase font-semibold">Lab Platform</span>
          </div>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-5 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.15em] px-3 mb-2">
            Navigation
          </span>
        )}

        {filtered.map(i => <Item key={i.href} {...i} />)}

        {/* Admin section */}
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

        {/* Version badge */}
        {!collapsed && (
          <div className="mx-1 mt-3 p-3 rounded-xl border border-emerald-500/15 flex items-start gap-2.5" style={{ background: "rgba(16,185,129,0.05)" }}>
            <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-bold text-slate-300 block">Mode IA Activé</span>
              <span className="text-[10px] text-slate-600">NovaBio v2.0 · Médical</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
