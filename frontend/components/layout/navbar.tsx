/* eslint-disable @next/next/no-img-element */
"use client";

import { useAuthStore } from "@/lib/auth-store";
import { useToastStore } from "@/lib/toast-store";
import { LogOut, Bell, Activity, Zap, AlertTriangle } from "lucide-react";
import { GlobalSearch } from "@/components/search/global-search";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import resultService, { ResultItem } from "@/services/api/result";

/* ── Composant badge santé backend ─────────────────────────────────────── */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

function SystemStatus() {
  const [status, setStatus] = useState<"checking" | "ok" | "down">("checking");

  useEffect(() => {
    let cancelled = false;
    let timerId: ReturnType<typeof setTimeout>;
    // Délai de retry fixe de 15s (pas d'exponential backoff pour ne pas
    // rester rouge trop longtemps pendant le cold start Render ~50s)
    const RETRY_DELAY = 15_000;
    const POLL_INTERVAL = 5 * 60 * 1000; // 5 min quand tout va bien

    const check = async () => {
      try {
        // Timeout 65s : couvre le cold start Render free tier (50s+)
        const res = await fetch(`${API_BASE.replace("/api/v1", "")}/health`, {
          signal: AbortSignal.timeout(65_000),
          cache: "no-store",
        });
        if (!cancelled) {
          if (res.ok) {
            setStatus("ok");
            timerId = setTimeout(check, POLL_INTERVAL);
          } else {
            setStatus("down");
            timerId = setTimeout(check, RETRY_DELAY);
          }
        }
      } catch {
        if (!cancelled) {
          setStatus("down");
          timerId = setTimeout(check, RETRY_DELAY);
        }
      }
    };

    check();
    return () => { cancelled = true; clearTimeout(timerId); };
  }, []);

  // Pendant le checking : badge "Démarrage..." (amber) au lieu de rien
  if (status === "checking") {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border ml-2 border-amber-500/20"
           style={{ background: "rgba(245,158,11,0.06)" }}>
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
        </span>
        <span className="text-[10px] font-bold tracking-wide text-amber-400/80">Démarrage…</span>
      </div>
    );
  }

  const ok = status === "ok";
  return (
    <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border ml-2 ${
      ok ? "border-emerald-500/20" : "border-red-500/20"
    }`} style={{ background: ok ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)" }}>
      <span className="relative flex h-1.5 w-1.5">
        {ok && <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${ok ? "bg-emerald-500" : "bg-red-500"}`} />
      </span>
      <span className={`text-[10px] font-bold tracking-wide ${ok ? "text-emerald-400/80" : "text-red-400/80"}`}>
        {ok ? "Système OK" : "Serveur hors ligne"}
      </span>
    </div>
  );
}

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  ADMIN:        { label: "Administrateur", color: "text-red-400 border-red-500/25 bg-red-500/8"         },
  RECEPTIONIST: { label: "Réceptionniste", color: "text-indigo-400 border-indigo-500/25 bg-indigo-500/8" },
  COLLECTOR:    { label: "Préleveur",       color: "text-amber-400 border-amber-500/25 bg-amber-500/8"   },
  LAB_TECH:     { label: "Technicien Labo", color: "text-emerald-400 border-emerald-500/25 bg-emerald-500/8" },
  DOCTOR:       { label: "Médecin",         color: "text-blue-400 border-blue-500/25 bg-blue-500/8"     },
};

export function Navbar() {
  const router = useRouter();
  const user   = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const toast  = useToastStore();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [critiques, setCritiques] = useState<ResultItem[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const lastFetchRef = useRef<number>(0);

  useEffect(() => {
    if (!user?.id) return;
    const avatarKey = `user_avatar_${user.id}`;
    const savedAvatar = localStorage.getItem(avatarKey);
    if (savedAvatar) setAvatar(savedAvatar);
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === avatarKey) setAvatar(e.newValue);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [user?.id]);

  const loadCritiques = useCallback(async () => {
    const now = Date.now();
    if (now - lastFetchRef.current < 2 * 60 * 1000) return; // skip si < 2min
    lastFetchRef.current = now;
    setNotifLoading(true);
    try {
      const data = await resultService.getResults(1, 50);
      const crit = (data.items ?? []).filter(r => r.status === "CRITIQUE");
      setCritiques(crit);
    } catch { /* silent */ }
    finally { setNotifLoading(false); }
  }, []);

  useEffect(() => { loadCritiques(); }, [loadCritiques]);

  const unreadCount = critiques.filter(r => !readIds.has(r.id)).length;

  const markAllRead = () => {
    setReadIds(new Set(critiques.map(r => r.id)));
    setNotifOpen(false);
  };

  const handleLogout = () => {
    logout();
    toast.info("À bientôt !");
    router.push("/login");
  };

  const getInitials = () => {
    if (!user) return "?";
    return `${user.first_name?.charAt(0) ?? ""}${user.last_name?.charAt(0) ?? ""}`.toUpperCase() || "?";
  };

  const roleConfig = ROLE_CONFIG[user?.role ?? "ADMIN"] ?? Object.values(ROLE_CONFIG)[0];

  return (
    <header
      className="sticky top-0 z-40 w-full h-[60px] flex items-center justify-between px-6 border-b
        border-[var(--color-border)]
        dark:[background:rgba(10,21,37,0.9)]
        light:[background:rgba(255,255,255,0.92)]"
      style={{ backdropFilter: "blur(20px)" }}
    >
      {/* Left: Brand */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-emerald group-hover:scale-105 transition-transform">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-[15px] text-white light:text-slate-900 font-display hidden sm:block">
            Nova<span className="text-emerald-400">Bio</span>
          </span>
        </Link>

        {/* System status — vrai health check */}
        <SystemStatus />
      </div>

      {/* Center: Search */}
      <div className="hidden md:flex">
        <GlobalSearch />
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle compact />

        {/* AI indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
          <Zap className="w-3 h-3 text-amber-400" />
          <span className="text-[10px] font-bold text-slate-500">IA Active</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) loadCritiques(); }}
            className="relative p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[14px] h-[14px] bg-red-500 rounded-full border border-[#0a1525] flex items-center justify-center text-[9px] font-bold text-white px-0.5">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 top-[calc(100%+8px)] w-80 rounded-2xl border border-white/[0.08] overflow-hidden shadow-dropdown animate-scale-in"
              style={{ background: "rgba(10,21,37,0.98)", backdropFilter: "blur(24px)" }}
            >
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <span className="text-sm font-bold text-white">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold text-red-400 px-2 py-0.5 rounded-full border border-red-500/20 bg-red-500/10">
                    {unreadCount} critique{unreadCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto">
                {notifLoading ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-600">Chargement…</div>
                ) : critiques.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-600">
                    Aucun résultat critique en attente
                  </div>
                ) : (
                  critiques.map(r => {
                    const isRead = readIds.has(r.id);
                    const date = new Date(r.tested_at || r.created_at);
                    const now = new Date();
                    const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
                    const timeLabel = diffMin < 60
                      ? `Il y a ${diffMin} min`
                      : diffMin < 1440
                      ? `Il y a ${Math.floor(diffMin / 60)} h`
                      : `Il y a ${Math.floor(diffMin / 1440)} j`;
                    return (
                      <Link
                        key={r.id}
                        href="/dashboard/results"
                        onClick={() => setNotifOpen(false)}
                        className={`flex items-start gap-3 px-4 py-3.5 border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors ${isRead ? "opacity-50" : ""}`}
                      >
                        <div className="w-7 h-7 rounded-full bg-red-500/15 flex items-center justify-center shrink-0 mt-0.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-slate-200 truncate">
                            Résultat critique détecté
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 truncate">
                            {r.patient_name
                              ? `Patient ${r.patient_name}`
                              : r.exam_name
                              ? `Analyse : ${r.exam_name}`
                              : `Résultat #${r.id.slice(0, 6)}`}
                            {" · "}
                            {timeLabel}
                          </div>
                        </div>
                        {!isRead && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5" />}
                      </Link>
                    );
                  })
                )}
              </div>

              <div className="px-4 py-2.5 border-t border-white/[0.05] flex items-center justify-between">
                <Link
                  href="/dashboard/results"
                  onClick={() => setNotifOpen(false)}
                  className="text-xs text-emerald-400 font-semibold hover:text-emerald-300 transition-colors"
                >
                  Voir tous les résultats
                </Link>
                {critiques.length > 0 && (
                  <button
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    onClick={markAllRead}
                  >
                    Tout marquer comme lu
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User info */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-white/[0.06] ml-1">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-sm font-bold text-white light:text-slate-900 leading-none">
              {user?.first_name || user?.last_name
                ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
                : "Utilisateur"}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 tracking-wide ${roleConfig.color}`}>
              {roleConfig.label}
            </span>
          </div>

          {/* Avatar */}
          <Link href="/dashboard/settings">
            <div className="w-9 h-9 rounded-full border border-emerald-500/25 overflow-hidden hover:border-emerald-500/50 hover:scale-105 transition-all cursor-pointer shrink-0">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 flex items-center justify-center text-sm font-extrabold text-emerald-300">
                  {getInitials()}
                </div>
              )}
            </div>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-600 hover:text-red-400 hover:bg-red-500/[0.08] transition-all"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
