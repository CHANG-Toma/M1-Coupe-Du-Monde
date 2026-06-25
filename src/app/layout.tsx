import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Coupe du Monde 2026 — Scores & Résultats",
  description:
    "Suivez en temps réel les matchs, scores, classements et le tableau éliminatoire de la Coupe du monde FIFA 2026.",
  keywords: ["coupe du monde", "FIFA 2026", "scores", "résultats", "football"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${geist.variable} antialiased min-h-screen bg-gray-50 dark:bg-gray-900`}>
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
        <footer className="mt-12 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4 py-4 text-center text-xs text-gray-400 dark:text-gray-600">
            Coupe du Monde FIFA 2026 · Application de suivi · Données via API-Football
          </div>
        </footer>
      </body>
    </html>
  );
}
