"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Activity, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navLinks = [
  { href: "/",          label: "Accueil"         },
  { href: "/services",  label: "Fonctionnalités"  },
  { href: "/about",     label: "À Propos"         },
];

export function Navbar() {
  const pathname                    = usePathname();
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
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-[64px] px-6 sm:px-10 transition-all duration-300 ${
          scrolled ? "border-b border-white/[0.08] shadow-sm" : ""
        }`}
        style={{ background: scrolled ? "color-mix(in srgb, var(--color-bg) 95%, transparent)" : "color-mix(in srgb, var(--color-bg) 70%, transparent)", backdropFilter: "blur(12px)" }}
      >
        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-[17px] text-white font-display">
              Nova<span className="text-emerald-400">Bio</span>
            </span>
            <span className="text-[9px] font-semibold text-slate-500 tracking-[0.18em] uppercase">Lab Platform</span>
          </div>
        </Link>

        {/* ── Nav links — style Bootstrap (pas de cercles) ── */}
        <nav className="hidden md:flex items-center gap-0 text-sm">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`
                  px-4 py-2 text-sm font-medium transition-colors duration-150 border-b-2
                  ${active
                    ? "text-emerald-400 border-emerald-400"
                    : "text-slate-400 border-transparent hover:text-white hover:border-white/30"
                  }
                `}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ── Boutons Bootstrap ── */}
        <div className="flex items-center gap-2">
          <ThemeToggle compact />
          {/* Outline button */}
          <Link href="/login" className="hidden sm:block">
            <button className="
              h-9 px-5 text-sm font-semibold
              border-2 border-emerald-500 text-emerald-400 bg-transparent
              hover:bg-emerald-500 hover:text-white
              active:bg-emerald-600 active:border-emerald-600
              transition-all duration-150
            ">
              Connexion
            </button>
          </Link>

          {/* Solid button */}
          <Link href="/login">
            <button className="
              h-9 px-5 text-sm font-bold
              bg-emerald-500 text-white border-2 border-emerald-500
              hover:bg-emerald-600 hover:border-emerald-600
              active:bg-emerald-700
              transition-all duration-150 shadow-sm
            ">
              Dashboard
            </button>
          </Link>

          {/* Burger mobile */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ── Menu mobile ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 backdrop-blur-xl" style={{ background: "color-mix(in srgb, var(--color-bg) 90%, transparent)" }} />
          <nav
            className="absolute top-[64px] left-0 right-0 border-t border-white/[0.08] py-4 px-6 flex flex-col gap-1"
            style={{ background: "color-mix(in srgb, var(--color-bg) 98%, transparent)" }}
            onClick={e => e.stopPropagation()}
          >
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="py-3 px-4 text-slate-300 hover:text-white hover:bg-white/[0.05] font-medium border-b border-white/[0.05] last:border-0 transition-colors"
              >
                {label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between py-2 px-4 border-b border-white/[0.05]">
                <span className="text-sm text-slate-400 font-medium">Thème</span>
                <ThemeToggle />
              </div>
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <button className="w-full h-10 text-sm font-semibold border-2 border-emerald-500 text-emerald-400 bg-transparent hover:bg-emerald-500 hover:text-white transition-all">
                  Connexion
                </button>
              </Link>
              <Link href="/login" onClick={() => setMobileOpen(false)}>
                <button className="w-full h-10 text-sm font-bold bg-emerald-500 text-white border-2 border-emerald-500 hover:bg-emerald-600 transition-all">
                  Accéder au Dashboard
                </button>
              </Link>
            </div>
          </nav>
        </div>
      )}

      <div className="h-[64px]" />
    </>
  );
}
