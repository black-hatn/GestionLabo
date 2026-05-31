/**
 * Next.js Edge Middleware — Protection des routes
 * Vérifie la présence du cookie d'authentification sur chaque requête
 * avant que la page ne soit rendue côté serveur.
 */
import { NextRequest, NextResponse } from "next/server";

/** Routes publiques accessibles sans authentification */
const PUBLIC_PATHS = ["/", "/login", "/services", "/about"];

/** Préfixes de routes qui nécessitent une authentification */
const PROTECTED_PREFIXES = ["/dashboard"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorer les fichiers statiques et les API routes Next.js
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // fichiers statiques (.png, .ico, etc.)
  ) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));
  const isPublic    = PUBLIC_PATHS.includes(pathname);

  if (!isProtected) return NextResponse.next();

  // Vérifier le cookie de session (posé lors du login)
  const authCookie = request.cookies.get("novabio_session");
  const hasSession = authCookie?.value === "1";

  if (!hasSession) {
    // Rediriger vers /login avec le chemin d'origine pour revenir après connexion
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Appliquer le middleware seulement aux routes pertinentes
  matcher: ["/dashboard/:path*"],
};
