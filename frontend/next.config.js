/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  // URL du backend Render — hardcodée ici pour éviter les problèmes de variable
  // d'environnement Vercel qui revient à sa valeur par défaut.
  env: {
    NEXT_PUBLIC_API_BASE_URL: "https://gestionlabo.onrender.com/api/v1",
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
