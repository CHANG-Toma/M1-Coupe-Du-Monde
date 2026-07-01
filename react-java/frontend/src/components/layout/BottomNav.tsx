import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS, isNavActive } from "@/components/layout/nav-items";
import { useLiveCount } from "@/hooks/useLiveCount";

export default function BottomNav() {
  const { pathname } = useLocation();
  const liveCount = useLiveCount();

  return (
    <nav
      className="sm:hidden fixed bottom-0 inset-x-0 z-50 border-t border-[#1e2840] bg-[#0b0f1a]/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Navigation principale"
    >
      <div className="flex items-stretch h-16 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const active = isNavActive(pathname, item.href);
          const label = item.shortLabel ?? item.label;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 min-w-0 px-1 transition-colors ${
                active
                  ? item.highlight
                    ? "text-[#00e676]"
                    : "text-white"
                  : item.highlight
                    ? "text-[#00e676]/60"
                    : "text-[#6b7a9e]"
              }`}
            >
              {active && (
                <span
                  className={`absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full ${
                    item.highlight ? "bg-[#00e676]" : "bg-[#4a7ef5]"
                  }`}
                />
              )}

              <span className="relative">
                {item.icon(active)}
                {item.showLiveBadge && liveCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#00e676] text-[#0b0f1a] text-[9px] font-bold flex items-center justify-center leading-none">
                    {liveCount}
                  </span>
                )}
              </span>

              <span className={`text-[10px] leading-none truncate max-w-full ${active ? "font-semibold" : "font-medium"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
