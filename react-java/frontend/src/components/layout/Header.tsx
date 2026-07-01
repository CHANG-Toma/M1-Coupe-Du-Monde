import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS, isNavActive } from "@/components/layout/nav-items";
import { useLiveCount } from "@/hooks/useLiveCount";

const DESKTOP_NAV_ITEMS = NAV_ITEMS.filter((item) => item.href !== "/live");

export default function Header() {
  const { pathname } = useLocation();
  const liveCount = useLiveCount();

  return (
    <header className="sticky top-0 z-50 border-b border-[#1e2840] bg-[#0b0f1a]/95 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <Link
          to="/"
          className="text-sm font-bold tracking-widest text-white uppercase hover:opacity-80 transition-opacity sm:justify-self-start"
        >
          WCT <span className="text-[#4a7ef5]">2026</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1 sm:justify-self-center" aria-label="Navigation principale">
          {DESKTOP_NAV_ITEMS.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  active ? "text-white font-medium" : "text-[#6b7a9e] hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="sm:justify-self-end">
          <Link
            to="/live"
            className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all duration-300 ${
              pathname === "/live"
                ? "bg-[#00e676]/20 border border-[#00e676]/60 text-[#00e676]"
                : "bg-[#0d2818] border border-[#00e676]/30 text-[#00e676] hover:border-[#00e676]/60 hover:bg-[#00e676]/10"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
            En direct
            {liveCount > 0 && (
              <span className="bg-[#00e676] text-[#0b0f1a] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {liveCount}
              </span>
            )}
          </Link>

          <Link
            to="/live"
            className={`sm:hidden flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full transition-colors ${
              pathname === "/live"
                ? "bg-[#00e676]/15 text-[#00e676]"
                : liveCount > 0
                  ? "text-[#00e676]"
                  : "text-[#6b7a9e]"
            }`}
            aria-label={`En direct${liveCount > 0 ? `, ${liveCount} match${liveCount > 1 ? "s" : ""}` : ""}`}
          >
            {liveCount > 0 ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
                {liveCount} live
              </>
            ) : (
              <span className="text-[10px] uppercase tracking-wide">CDM</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
