/**
 * Proxy API route — relaie toutes les requêtes vers le backend Render.
 * Avantage : même origine (novabio-labo.vercel.app), invisible pour les adblockers.
 * Tous les headers (Authorization, Content-Type…) sont transmis.
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND = "https://gestionlabo.onrender.com/api/v1";

async function proxy(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const pathStr = path.join("/");
  const search = req.nextUrl.search;
  const targetUrl = `${BACKEND}/${pathStr}${search}`;

  // Transmettre tous les headers sauf ceux qui cassent la requête sortante.
  // On retire aussi accept-encoding : Node fetch gère lui-même la décompression,
  // inutile de négocier gzip avec le backend (évite le double-décodage côté browser).
  const STRIP_REQ = ["host", "connection", "transfer-encoding", "accept-encoding"];
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!STRIP_REQ.includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const isBodyMethod = !["GET", "HEAD"].includes(req.method);

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: isBodyMethod ? req.body : undefined,
      // @ts-ignore — nécessaire pour le streaming du body
      duplex: "half",
    });

    // Copier les headers de réponse.
    // - content-encoding : Node fetch décompresse déjà le body (gzip/br) → on strip
    //   sinon le browser tente une 2e décompression → ERR_CONTENT_DECODING_FAILED.
    // - content-length : correspond à la taille COMPRESSÉE ; le body qu'on envoie
    //   est décompressé (plus long) → le browser couperait la lecture trop tôt → JSON tronqué.
    //   On laisse Next.js calculer la bonne Content-Length depuis l'arrayBuffer.
    const STRIP_RES = ["transfer-encoding", "connection", "content-encoding", "content-length"];
    const resHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      if (!STRIP_RES.includes(key.toLowerCase())) {
        resHeaders.set(key, value);
      }
    });

    // Lire le body complet avant de renvoyer — évite la troncature du ReadableStream
    // dans le runtime Next.js (body partiellement consommé → JSON invalide).
    const body = await upstream.arrayBuffer();

    return new NextResponse(body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: resHeaders,
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: `Proxy error: ${err.message}` },
      { status: 502 }
    );
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as DELETE, proxy as PATCH };
