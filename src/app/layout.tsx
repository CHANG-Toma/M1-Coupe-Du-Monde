import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "World Cup Tracker 2026",
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
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body className={`${geist.variable} antialiased min-h-screen bg-[#0b0f1a] text-white`}>
        <Header />
        <main className="max-w-2xl mx-auto px-4 pt-4 sm:pt-6 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:pb-8">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
