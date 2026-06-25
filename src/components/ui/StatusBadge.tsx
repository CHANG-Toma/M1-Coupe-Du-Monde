import type { StatutMatch } from "@/lib/types";

interface StatusBadgeProps {
  statut: StatutMatch;
  minuteJeu?: number;
  className?: string;
}

const CONFIG: Record<StatutMatch, { label: string; className: string }> = {
  a_venir: {
    label: "À venir",
    className: "bg-[#1a2240] text-[#4a7ef5] border border-[#4a7ef5]/20",
  },
  en_cours: {
    label: "En cours",
    className: "bg-[#0d2818] text-[#00e676] border border-[#00e676]/30",
  },
  termine: {
    label: "Terminé",
    className: "bg-[#131929] text-[#6b7a9e] border border-[#1e2840]",
  },
};

export default function StatusBadge({ statut, minuteJeu, className = "" }: StatusBadgeProps) {
  const { label, className: colorClass } = CONFIG[statut];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}
    >
      {statut === "en_cours" && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
      )}
      {statut === "en_cours" && minuteJeu ? `${minuteJeu}'` : label}
    </span>
  );
}
