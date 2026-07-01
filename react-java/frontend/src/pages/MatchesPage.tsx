import { useSearchParams } from "react-router-dom";
import type { TypePhase } from "@/types";
import { useMatches } from "@/hooks/useMatches";
import PhaseNav from "@/components/matches/PhaseNav";
import MatchList from "@/components/matches/MatchList";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { Link } from "react-router-dom";

export default function MatchesPage() {
  const [searchParams] = useSearchParams();
  const phase = (searchParams.get("phase") as TypePhase) ?? "groupes";
  const { matches, loading, error, refresh } = useMatches(phase);

  return (
    <div className="space-y-5">
      <h1 className="text-base font-bold text-white">Matchs</h1>

      <PhaseNav />

      {loading ? (
        <LoadingSpinner message="Chargement des matchs..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={refresh} />
      ) : (
        <>
          {matches.some((m) => m.statut === "en_cours") && (
            <div className="flex items-center gap-2 text-xs text-[#6b7a9e] bg-[#131929] border border-[#1e2840] px-3 py-2 rounded-lg">
              Scores en direct disponibles sur la page{" "}
              <Link to="/live" className="text-[#00e676] hover:underline">Live</Link>
            </div>
          )}
          <MatchList matches={matches} />
        </>
      )}
    </div>
  );
}
