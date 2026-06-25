"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Accueil" },
  { href: "/matches", label: "Matchs" },
  { href: "/standings", label: "Classements" },
  { href: "/bracket", label: "Tableau" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[#1e2840] bg-[#0b0f1a]/95 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-sm font-bold tracking-widest text-white uppercase">
          WCT <span className="text-[#4a7ef5]">2026</span>
        </Link>

        {/* Navigation desktop */}
        <nav className="hidden sm:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  isActive
                    ? "text-white font-medium"
                    : "text-[#6b7a9e] hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Badge En direct */}
        <LiveBadge />
      </div>
    </header>
  );
}

function LiveBadge() {
  return (
    <div className="flex items-center gap-1.5 bg-[#0d2818] border border-[#00e676]/30 text-[#00e676] text-xs font-medium px-2.5 py-1 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
      En direct
    </div>
  );
}
