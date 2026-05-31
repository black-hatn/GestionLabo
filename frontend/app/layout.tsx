import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";
import { Inter, Outfit } from "next/font/google";

const inter = Outfit({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });

export const metadata: Metadata = {
  title: "NovaBio Lab - Plateforme de Gestion de Laboratoire",
  description: "Système de gestion des examens de laboratoire de niveau médical 2.0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${outfit.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans antialiased bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
