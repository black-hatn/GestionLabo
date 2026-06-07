"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState, useEffect } from "react";

// Ping le backend au démarrage pour éviter le cold start Render.
// Utilise /api/keepalive (route Next.js avec timeout 65s) — pas bloqué par adblocker.
function useBackendWarmer() {
  useEffect(() => {
    fetch("/api/keepalive", { method: "GET" }).catch(() => {/* silencieux */});
    // Re-ping toutes les 10 min pour maintenir le backend chaud
    const id = setInterval(() => {
      fetch("/api/keepalive", { method: "GET" }).catch(() => {});
    }, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);
}

export function Providers({ children }: { children: React.ReactNode }) {
  useBackendWarmer();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange={false}
        themes={["dark", "light"]}
      >
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
