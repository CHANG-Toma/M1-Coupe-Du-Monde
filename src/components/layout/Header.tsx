"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/matches", label: "Matchs", icon: "⚽" },
  { href: "/standings", label: "Classements", icon: "📊" },
  { href: "/bracket", label: "Tableau", icon: "🏆" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-cdm-blue shadow-lg">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo / titre */}
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg hover:opacity-90 transition-opacity">
            <span className="text-xl">🌍</span>
            <span className="hidden sm:inline">Coupe du Monde</span>
            <span className="sm:hidden">CDM</span>
            <span className="text-cdm-gold font-black">2026</span>
          </Link>

          {/* Navigation principale */}
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="hidden sm:inline text-base">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
