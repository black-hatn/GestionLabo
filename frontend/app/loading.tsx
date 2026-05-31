export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.3s]"></div>
        <div className="h-4 w-4 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.15s]"></div>
        <div className="h-4 w-4 animate-bounce rounded-full bg-blue-600"></div>
      </div>
      <p className="mt-4 text-sm font-medium text-neutral-500">Chargement en cours...</p>
    </div>
  )
}
