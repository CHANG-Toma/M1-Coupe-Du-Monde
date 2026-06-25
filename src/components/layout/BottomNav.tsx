"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Accueil" },
  { href: "/matches", label: "Matchs" },
  { href: "/live", label: "⚡ Live", highlight: true },
  { href: "/standings", label: "Classements" },
  { href: "/bracket", label: "Tableau" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[#1e2840] bg-[#0b0f1a]/95 backdrop-blur-sm">
      <div className="flex">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 text-center py-3 text-xs transition-colors ${
                isActive
                  ? item.highlight
                    ? "text-[#00e676] font-bold"
                    : "text-white font-semibold"
                  : item.highlight
                  ? "text-[#00e676]/60"
                  : "text-[#6b7a9e]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
