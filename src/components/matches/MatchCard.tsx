import Link from "next/link";
import type { Match } from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import TeamFlag from "@/components/ui/TeamFlag";
import { formatDateCourte, formatHeure } from "@/lib/utils/date";

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const scoreVisible = match.statut === "en_cours" || match.statut === "termine";

  return (
    <Link href={`/matches/${match.id}`}>
      <article className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-cdm-blue/40 hover:shadow-md transition-all duration-200 overflow-hidden group">
        {/* En-tête : groupe / phase + date */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {match.groupe ? `Groupe ${match.groupe.lettre}` : match.phase.nom}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDateCourte(match.dateHeure)} · {formatHeure(match.dateHeure)}
          </span>
        </div>

        {/* Corps : équipes + score */}
        <div className="px-4 py-4 flex items-center justify-between gap-4">
          {/* Équipe domicile */}
          <div className="flex-1 min-w-0">
            <TeamFlag equipe={match.equipeDomicile} size="md" align="left" />
          </div>

          {/* Score / VS */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            {scoreVisible ? (
              <div className="flex items-center gap-3">
                <span className={`text-2xl font-bold tabular-nums ${match.statut === "en_cours" ? "text-green-600 dark:text-green-400" : "text-gray-800 dark:text-gray-100"}`}>
                  {match.scoreDomicile}
                </span>
                <span className="text-gray-400 dark:text-gray-500 font-semibold">–</span>
                <span className={`text-2xl font-bold tabular-nums ${match.statut === "en_cours" ? "text-green-600 dark:text-green-400" : "text-gray-800 dark:text-gray-100"}`}>
                  {match.scoreExterieur}
                </span>
              </div>
            ) : (
              <span className="text-lg font-semibold text-gray-400 dark:text-gray-500 tracking-widest">vs</span>
            )}
            <StatusBadge statut={match.statut} minuteJeu={match.minuteJeu} />
          </div>

          {/* Équipe extérieur */}
          <div className="flex-1 min-w-0 flex justify-end">
            <TeamFlag equipe={match.equipeExterieur} size="md" align="right" />
          </div>
        </div>

        {/* Stade */}
        {match.stade && (
          <div className="px-4 pb-2 text-xs text-gray-400 dark:text-gray-500 text-center">
            📍 {match.stade.nom}{match.stade.ville ? ` — ${match.stade.ville}` : ""}
          </div>
        )}
      </article>
    </Link>
  );
}
