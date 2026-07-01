import type { Match } from "@/types";
import MatchCard from "./MatchCard";

interface MatchListProps {
  matches: Match[];
  emptyMessage?: string;
}

export default function MatchList({ matches, emptyMessage = "Aucun match disponible pour cette phase." }: MatchListProps) {
  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center animate-fade-in">
        <p className="text-[#6b7a9e] text-sm max-w-xs">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 stagger">
      {matches.map((match) => (
        <div key={match.id} className="animate-fade-up">
          <MatchCard match={match} />
        </div>
      ))}
    </div>
  );
}
