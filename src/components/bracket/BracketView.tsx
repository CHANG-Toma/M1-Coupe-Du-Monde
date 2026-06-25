import type { Match } from "@/lib/types";
import { PHASES } from "@/lib/types";
import Link from "next/link";
import TeamFlag from "@/components/ui/TeamFlag";
import StatusBadge from "@/components/ui/StatusBadge";

interface BracketViewProps {
  matches: Match[];
}

const PHASES_ELIM = PHASES.filter((p) => p.type !== "groupes");

interface BracketMatchCardProps {
  match: Match;
}

function BracketMatchCard({ match }: BracketMatchCardProps) {
  const scoreVisible = match.statut === "en_cours" || match.statut === "termine";

  return (
    <Link href={`/matches/${match.id}`}>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden hover:border-cdm-blue/50 transition-colors w-52">
        {/* Équipe domicile */}
        <div className={`flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-700 ${scoreVisible && match.scoreDomicile > match.scoreExterieur ? "bg-green-50 dark:bg-green-900/20" : ""}`}>
          <TeamFlag equipe={match.equipeDomicile} size="sm" />
          {scoreVisible && (
            <span className="font-bold text-sm tabular-nums ml-2">{match.scoreDomicile}</span>
          )}
        </div>
        {/* Équipe extérieur */}
        <div className={`flex items-center justify-between px-3 py-2 ${scoreVisible && match.scoreExterieur > match.scoreDomicile ? "bg-green-50 dark:bg-green-900/20" : ""}`}>
          <TeamFlag equipe={match.equipeExterieur} size="sm" />
          {scoreVisible && (
            <span className="font-bold text-sm tabular-nums ml-2">{match.scoreExterieur}</span>
          )}
        </div>
        {/* Statut */}
        <div className="px-3 py-1.5 border-t border-gray-50 dark:border-gray-700/50 flex justify-center">
          <StatusBadge statut={match.statut} minuteJeu={match.minuteJeu} />
        </div>
      </div>
    </Link>
  );
}

function PlaceholderCard({ label }: { label: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-200 dark:border-gray-600 rounded-lg w-52 h-24 flex items-center justify-center">
      <span className="text-xs text-gray-400 dark:text-gray-500 text-center px-2">{label}</span>
    </div>
  );
}

export default function BracketView({ matches }: BracketViewProps) {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-8 min-w-max">
        {PHASES_ELIM.map((phase) => {
          const phaseMatches = matches.filter((m) => m.phase.type === phase.type);

          return (
            <div key={phase.id} className="flex flex-col gap-3">
              {/* En-tête de la phase */}
              <div className="text-center">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {phase.nom}
                </span>
              </div>

              {/* Matchs de la phase */}
              <div className="flex flex-col gap-4 justify-around flex-1">
                {phaseMatches.length > 0 ? (
                  phaseMatches.map((match) => (
                    <BracketMatchCard key={match.id} match={match} />
                  ))
                ) : (
                  <PlaceholderCard label="À déterminer" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
