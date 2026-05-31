"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — render only after mount
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;

  const isDark = theme === "dark";

  const toggle = () => setTheme(isDark ? "light" : "dark");

  if (compact) {
    return (
      <button
        onClick={toggle}
        aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
        className="relative p-2 rounded-xl transition-all duration-200
          text-slate-400 hover:text-white
          hover:bg-white/[0.06]
          dark:text-slate-400 dark:hover:text-white
          light:text-slate-500 light:hover:text-slate-900 light:hover:bg-black/[0.06]"
      >
        {isDark ? (
          <Sun className="w-4.5 h-4.5 text-amber-400" />
        ) : (
          <Moon className="w-4.5 h-4.5 text-slate-500" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      className={`
        relative flex items-center gap-1 h-8 rounded-full border px-1 transition-all duration-300
        ${isDark
          ? "bg-slate-800/80 border-white/10 hover:border-white/20"
          : "bg-white border-slate-200 hover:border-emerald-300 shadow-sm"
        }
      `}
    >
      {/* Track */}
      <div
        className={`
          absolute top-1 h-6 w-6 rounded-full transition-all duration-300 ease-spring
          ${isDark
            ? "left-1 bg-slate-700"
            : "left-[calc(100%-28px)] bg-emerald-50"
          }
        `}
      />

      {/* Sun icon */}
      <span className={`relative z-10 w-6 h-6 flex items-center justify-center rounded-full transition-all duration-200 ${!isDark ? "text-amber-500" : "text-slate-600"}`}>
        <Sun className="w-3.5 h-3.5" />
      </span>

      {/* Moon icon */}
      <span className={`relative z-10 w-6 h-6 flex items-center justify-center rounded-full transition-all duration-200 ${isDark ? "text-indigo-300" : "text-slate-300"}`}>
        <Moon className="w-3.5 h-3.5" />
      </span>
    </button>
  );
}
