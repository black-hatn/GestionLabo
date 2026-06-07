/**
 * Keep-alive route — pings Render backend pour éviter le cold start.
 * URL hardcodée (indépendante de NEXT_PUBLIC_API_BASE_URL qui pointe vers le proxy).
 */
const RENDER_HEALTH = "https://gestionlabo.onrender.com/health";

export async function GET() {
  try {
    const res = await fetch(RENDER_HEALTH, {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(65_000), // couvre le cold start (~50s)
    });
    const data = await res.json().catch(() => ({}));
    return Response.json({
      ok: res.ok,
      status: res.status,
      backend: data,
      pinged_at: new Date().toISOString(),
    });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 503 });
  }
}
