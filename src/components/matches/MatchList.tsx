import type { Match } from "@/lib/types";
import MatchCard from "./MatchCard";

interface MatchListProps {
  matches: Match[];
  emptyMessage?: string;
}

export default function MatchList({
  matches,
  emptyMessage = "Aucun match disponible pour cette phase.",
}: MatchListProps) {
  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <span className="text-4xl">⚽</span>
        <p className="text-gray-500 dark:text-gray-400 max-w-xs">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}
