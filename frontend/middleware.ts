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

  // Vérifier le cookie de session (qui contient maintenant le token JWT)
  const authCookie = request.cookies.get("novabio_session");
  const token = authCookie?.value;

  if (!token) {
    return redirectToLogin(request, pathname);
  }

  // Décodage et vérification basique du JWT
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return redirectToLogin(request, pathname);
    }
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);

    // Vérifier l'expiration (exp) et le type
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowInSeconds) {
      return redirectToLogin(request, pathname);
    }
    if (payload.type !== "access") {
      return redirectToLogin(request, pathname);
    }
  } catch (err) {
    return redirectToLogin(request, pathname);
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest, pathname: string) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  
  // Créer une réponse de redirection et vider le cookie invalide
  const response = NextResponse.redirect(loginUrl);
  response.cookies.set("novabio_session", "", { path: "/", maxAge: 0 });
  return response;
}


export const config = {
  // Appliquer le middleware seulement aux routes pertinentes
  matcher: ["/dashboard/:path*"],
};
