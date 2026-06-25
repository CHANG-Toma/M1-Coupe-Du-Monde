import type { StatutMatch } from "@/lib/types";

interface StatusBadgeProps {
  statut: StatutMatch;
  minuteJeu?: number;
  className?: string;
}

const CONFIG: Record<StatutMatch, { label: string; className: string }> = {
  a_venir: {
    label: "À venir",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  },
  en_cours: {
    label: "En cours",
    className: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  },
  termine: {
    label: "Terminé",
    className: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  },
};

export default function StatusBadge({ statut, minuteJeu, className = "" }: StatusBadgeProps) {
  const { label, className: colorClass } = CONFIG[statut];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClass} ${className}`}
    >
      {statut === "en_cours" && (
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      )}
      {statut === "en_cours" && minuteJeu ? `${minuteJeu}'` : label}
    </span>
  );
}
