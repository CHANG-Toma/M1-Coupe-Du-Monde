import type { ReactNode } from "react";

export type NavItem = {
  href: string;
  label: string;
  shortLabel?: string;
  icon: (active: boolean) => ReactNode;
  highlight?: boolean;
  showLiveBadge?: boolean;
};

function iconClass(active: boolean, highlight?: boolean) {
  if (highlight) return active ? "text-[#00e676]" : "text-[#00e676]/55";
  return active ? "text-white" : "text-[#6b7a9e]";
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Accueil",
    icon: (active) => (
      <svg className={`w-5 h-5 ${iconClass(active)}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15v-7.5h-5.25V21.75H3.75A.75.75 0 013 21V9.75z" />
      </svg>
    ),
  },
  {
    href: "/matches",
    label: "Matchs",
    icon: (active) => (
      <svg className={`w-5 h-5 ${iconClass(active)}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" d="M12 3c2.5 2.2 4 5.2 4 9s-1.5 6.8-4 9M12 3C9.5 5.2 8 8.2 8 12s1.5 6.8 4 9M3 12h18" />
      </svg>
    ),
  },
  {
    href: "/live",
    label: "En direct",
    shortLabel: "Live",
    highlight: true,
    showLiveBadge: true,
    icon: (active) => (
      <svg className={`w-5 h-5 ${iconClass(active, true)}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
      </svg>
    ),
  },
  {
    href: "/standings",
    label: "Classements",
    shortLabel: "Groupes",
    icon: (active) => (
      <svg className={`w-5 h-5 ${iconClass(active)}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M6 16l3-9 3 5 3-7 3 11" />
      </svg>
    ),
  },
  {
    href: "/bracket",
    label: "Tableau",
    icon: (active) => (
      <svg className={`w-5 h-5 ${iconClass(active)}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6v12M6 6h4v5H6M14 10v8M14 10h4v3h-4M18 6v12" />
      </svg>
    ),
  },
];

export function isNavActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
