import { useState, useEffect } from "react";
import type { Match } from "@/types";
import BracketView from "@/components/bracket/BracketView";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function BracketPage() {
  const [knockoutMatches, setKnockoutMatches] = useState<Match[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/matches")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((json) => {
        const all: Match[] = json.data ?? [];
        setKnockoutMatches(all.filter((m) => m.phase.type !== "groupes"));
      })
      .catch(() => setError("Impossible de charger le tableau éliminatoire."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner message="Chargement du tableau..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full max-w-none mx-0">
      <div className="shrink-0 mb-2 sm:mb-3 px-1">
        <h1 className="text-base sm:text-lg font-bold text-white">Phase éliminatoire</h1>
        <p className="text-[10px] sm:text-xs text-[#4a5a7a] mt-1">
          <span className="hidden sm:inline">Survolez un match pour voir son parcours</span>
          <span className="sm:hidden">Touchez un match pour le surligner · retouchez pour ouvrir</span>
        </p>
      </div>

      {error ? (
        <p className="text-[#6b7a9e] text-sm py-16 text-center">{error}</p>
      ) : !knockoutMatches || knockoutMatches.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#6b7a9e] text-sm max-w-xs text-center px-4">
            Le tableau éliminatoire sera disponible à l&apos;issue de la phase de groupes.
          </p>
        </div>
      ) : (
        <BracketView matches={knockoutMatches} fullScreen />
      )}
    </div>
  );
}
