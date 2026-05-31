"use client"

import { useEffect } from "react"
import { AlertCircle } from "lucide-react"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
      <h2 className="mb-2 text-2xl font-semibold text-neutral-900">
        Une erreur inattendue est survenue
      </h2>
      <p className="mb-6 text-neutral-500 max-w-md">
        Nous sommes désolés, mais une erreur s'est produite lors du chargement de cette page. Notre équipe a été notifiée.
      </p>
      <button
        onClick={() => reset()}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        Réessayer
      </button>
    </div>
  )
}
