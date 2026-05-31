"use client";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { Sentry.captureException(error); }, [error]);
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-red-400" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">Une erreur est survenue</h2>
        <p className="text-slate-400 text-sm mb-6">L&apos;équipe technique a été notifiée automatiquement.</p>
        <button onClick={reset} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold transition-colors">
          Réessayer
        </button>
      </div>
    </div>
  );
}
