"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Activity, Menu, X } from "lucide-react";

const navLinks = [
  { href: "/",         label: "Accueil" },
  { href: "/#workflow", label: "Fonctionnement" },
  { href: "/#roles",   label: "Rôles" },
  { href: "/#features",label: "Fonctionnalités" },
];

export function Navbar() {
  const pathname  = usePathname();
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-[68px] px-6 sm:px-10 transition-all duration-500 ${
          scrolled
            ? "glass-strong shadow-navbar border-b border-white/[0.06]"
            : "bg-transparent"
        }`}
      >
        {scrolled && (
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
        )}

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-emerald group-hover:scale-105 transition-transform duration-300">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#050c1a]">
              <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
            </div>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-[17px] text-white tracking-tight font-display">
              Nova<span className="text-emerald-400">Bio</span>
            </span>
            <span className="text-[9px] font-semibold text-slate-500 tracking-[0.18em] uppercase">Lab Platform</span>
          </div>
        </Link>

        {/* ── Nav links ── */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <a
                key={href}
                href={href}
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  active
                    ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                {label}
              </a>
            );
          })}
        </nav>

        {/* ── Bootstrap-style action buttons ── */}
        <div className="flex items-center gap-2.5">
          {/* btn-outline (Bootstrap outline style) */}
          <Link href="/login" className="hidden sm:block">
            <button
              className="
                h-9 px-5 rounded text-sm font-semibold
                border-2 border-emerald-500 text-emerald-400
                bg-transparent
                hover:bg-emerald-500 hover:text-white
                active:bg-emerald-600 active:border-emerald-600
                transition-all duration-150 select-none
              "
            >
              Connexion
            </button>
          </Link>

          {/* btn-solid (Bootstrap solid style) */}
          <Link href="/login">
            <button
              className="
                h-9 px-5 rounded text-sm font-bold
                bg-emerald-500 text-white border-2 border-emerald-500
                hover:bg-emerald-600 hover:border-emerald-600
                active:bg-emerald-700
                transition-all duration-150 select-none
                shadow-sm
              "
            >
              Accéder au Dashboard
            </button>
          </Link>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 rounded text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-[#050c1a]/90 backdrop-blur-xl" />
          <nav
            className="absolute top-[68px] left-4 right-4 rounded-2xl p-4 border border-white/[0.08] animate-scale-in"
            style={{ background: "rgba(10,21,37,0.97)" }}
            onClick={e => e.stopPropagation()}
          >
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] font-medium transition-all"
              >
                {label}
              </a>
            ))}
            <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <button className="w-full h-11 rounded text-sm font-semibold border-2 border-emerald-500 text-emerald-400 bg-transparent hover:bg-emerald-500 hover:text-white transition-all">
                  Connexion
                </button>
              </Link>
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <button className="w-full h-11 rounded text-sm font-bold bg-emerald-500 text-white border-2 border-emerald-500 hover:bg-emerald-600 transition-all">
                  Accéder au Dashboard
                </button>
              </Link>
            </div>
          </nav>
        </div>
      )}

      <div className="h-[68px]" />
    </>
  );
}
