"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Activity, ChevronRight, Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/services", label: "Fonctionnalités" },
  { href: "/about", label: "À Propos" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
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
        {/* Gradient line */}
        {scrolled && (
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
        )}

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-emerald group-hover:shadow-emerald-lg transition-all duration-300 group-hover:scale-105">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-bg">
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

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  active
                    ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                {label}
                {active && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <Link href="/login" className="hidden sm:block">
            <button className="h-9 px-4 rounded-full text-sm font-semibold text-slate-300 border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] hover:text-white hover:border-white/15 transition-all duration-200">
              Connexion
            </button>
          </Link>
          <Link href="/login">
            <button className="h-9 px-5 rounded-full text-sm font-bold btn-emerald flex items-center gap-1.5">
              Accéder au Dashboard
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </Link>
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-bg/80 backdrop-blur-xl" />
          <nav className="absolute top-[68px] left-4 right-4 glass-strong rounded-2xl p-4 border border-white/[0.08] animate-scale-in">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.06] font-medium transition-all"
              >
                {label}
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </Link>
            ))}
            <div className="mt-3 pt-3 border-t border-white/[0.06]">
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <button className="w-full h-11 rounded-xl text-sm font-bold btn-emerald">
                  Accéder au Dashboard
                </button>
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* Spacer */}
      <div className="h-[68px]" />
    </>
  );
}
