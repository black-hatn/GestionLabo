/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");

const BACKEND_URL = "https://gestionlabo.onrender.com";

const nextConfig = {
  // Le client API utilise /api/proxy → rewrite server-side vers Render.
  // Avantage : même origine (pas de CORS, pas d'adblocker).
  env: {
    NEXT_PUBLIC_API_BASE_URL: "/api/proxy",
  },
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
      // Health check accessible depuis le front sans adblocker
      {
        source: "/api/health",
        destination: `${BACKEND_URL}/health`,
      },
    ];
  },
  reactStrictMode: true,
  transpilePackages: ["@react-pdf/renderer"],
  experimental: {
    instrumentationHook: true,
  },
};

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: "novabio-lab",
  project: "novabio-frontend",
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  sourcemaps: {
    disable: true,
  },
});
