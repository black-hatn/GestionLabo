/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Background Surfaces ── */
        bg:       "#050c1a",
        surface:  "#0c1828",
        surface2: "#111f33",
        surface3: "#162440",

        /* ── Emerald Accent (trust + health) ── */
        emerald: {
          50:  "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },

        /* ── Teal (secondary) ── */
        teal: {
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
        },

        /* ── Blue (info / tech) ── */
        blue: {
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
        },

        /* ── Slate system (neutral) ── */
        slate: {
          50:  "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          750: "#283548",
          800: "#1e293b",
          850: "#162032",
          900: "#0f172a",
          925: "#090f1e",
          950: "#020617",
        },

        /* ── Amber / Warning ── */
        amber: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },

        /* ── Red / Danger ── */
        red: {
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
        },

        /* ── Indigo / Purple ── */
        indigo: {
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
        },

        /* ── Cyan ── */
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
        },

        /* Backward compat aliases */
        primary: {
          50:  "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        secondary: {
          500: "#14b8a6",
          600: "#0d9488",
        },
        danger: {
          50:  "#fef2f2",
          100: "#fee2e2",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
        },
        warning: {
          50:  "#fffbeb",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        neutral: {
          50:  "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          750: "#283548",
          800: "#1e293b",
          850: "#162032",
          900: "#0f172a",
          950: "#020617",
        },
      },

      fontFamily: {
        sans:    ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "Outfit", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "ui-monospace", "monospace"],
      },

      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },

      backgroundImage: {
        "gradient-radial":    "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":     "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "emerald-glow":       "radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.15) 0%, transparent 70%)",
        "hero-glow":          "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(16,185,129,0.12) 0%, rgba(6,182,212,0.06) 50%, transparent 100%)",
        "card-shine":         "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 60%)",
        "sidebar-gradient":   "linear-gradient(180deg, #0c1828 0%, #060e1c 100%)",
      },

      animation: {
        "fade-in":          "fadeIn 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in-fast":     "fadeInFast 0.25s ease both",
        "slide-up":         "slideUp 0.6s cubic-bezier(0.16,1,0.3,1) both",
        "slide-down":       "slideDown 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "slide-in-right":   "slideInRight 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "slide-in-left":    "slideInLeft 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "scale-in":         "scaleIn 0.35s cubic-bezier(0.16,1,0.3,1) both",
        "float":            "float 6s ease-in-out infinite",
        "pulse-subtle":     "pulseSubtle 3s ease-in-out infinite",
        "pulse-glow":       "pulseGlow 2.5s ease-in-out infinite",
        "spin":             "spin 1s linear infinite",
        "ping":             "ping 1.2s cubic-bezier(0,0,0.2,1) infinite",
        "shimmer":          "shimmer 2.5s infinite",
        "gradient":         "gradientFlow 6s ease infinite",
        "border-glow":      "borderGlow 2.5s ease-in-out infinite",
      },

      keyframes: {
        fadeIn:      { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        fadeInFast:  { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp:     { from: { opacity: "0", transform: "translateY(32px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideDown:   { from: { opacity: "0", transform: "translateY(-24px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideInRight:{ from: { opacity: "0", transform: "translateX(32px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        slideInLeft: { from: { opacity: "0", transform: "translateX(-32px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        scaleIn:     { from: { opacity: "0", transform: "scale(0.93)" }, to: { opacity: "1", transform: "scale(1)" } },
        pulseSubtle: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.45" } },
        pulseGlow:   { "0%, 100%": { opacity: "1", boxShadow: "0 0 20px rgba(16,185,129,0.3)" }, "50%": { opacity: "0.8", boxShadow: "0 0 40px rgba(16,185,129,0.5)" } },
        float:       { "0%, 100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-10px)" } },
        spin:        { to: { transform: "rotate(360deg)" } },
        ping:        { "75%, 100%": { transform: "scale(2)", opacity: "0" } },
        shimmer:     { "0%": { backgroundPosition: "-1200px 0" }, "100%": { backgroundPosition: "1200px 0" } },
        gradientFlow:{ "0%": { backgroundPosition: "0% 50%" }, "50%": { backgroundPosition: "100% 50%" }, "100%": { backgroundPosition: "0% 50%" } },
        borderGlow:  { "0%, 100%": { borderColor: "rgba(16,185,129,0.2)" }, "50%": { borderColor: "rgba(16,185,129,0.6)" } },
      },

      boxShadow: {
        "card":           "0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)",
        "card-hover":     "0 12px 48px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)",
        "emerald":        "0 0 24px rgba(16,185,129,0.35), 0 0 60px rgba(16,185,129,0.1)",
        "emerald-lg":     "0 0 48px rgba(16,185,129,0.4), 0 0 100px rgba(16,185,129,0.15)",
        "blue":           "0 0 24px rgba(59,130,246,0.35), 0 0 60px rgba(59,130,246,0.1)",
        "inner-glow":     "inset 0 0 24px rgba(16,185,129,0.08)",
        "navbar":         "0 1px 24px rgba(0,0,0,0.5)",
        "dropdown":       "0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
        "none":           "none",
      },

      borderRadius: {
        "4xl":   "2rem",
        "5xl":   "2.5rem",
      },

      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "68": "17rem",
        "76": "19rem",
      },

      transitionTimingFunction: {
        "spring": "cubic-bezier(0.16,1,0.3,1)",
        "out-back": "cubic-bezier(0.34,1.56,0.64,1)",
      },

      transitionDuration: {
        "150": "150ms",
        "250": "250ms",
        "400": "400ms",
      },

      backdropBlur: {
        "xs": "4px",
      },
    },
  },
  plugins: [
    // Plugins can be added here
  ],
};
