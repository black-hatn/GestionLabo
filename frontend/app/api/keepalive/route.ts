/**
 * Keep-alive route — pings Render backend every 10 min via Vercel cron
 * Prevents Render free tier cold starts (service sleeps after 15 min inactivity)
 */
export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '')
    || 'https://gestionlabo.onrender.com';

  try {
    const res = await fetch(`${backendUrl}/health`, {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();
    return Response.json({
      ok: true,
      backend: data,
      pinged_at: new Date().toISOString()
    });
  } catch (e: any) {
    return Response.json({ ok: false, error: e.message }, { status: 503 });
  }
}
