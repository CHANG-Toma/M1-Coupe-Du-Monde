"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { TypePhase } from "@/lib/types";
import { useMatches } from "@/hooks/useMatches";
import PhaseNav from "@/components/matches/PhaseNav";
import MatchList from "@/components/matches/MatchList";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";

function MatchesContent() {
  const searchParams = useSearchParams();
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
            <div className="flex items-center gap-2 text-xs text-[#00e676] bg-[#0d1f14] border border-[#00e676]/20 px-3 py-2 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
              Mise à jour automatique — matchs en cours
            </div>
          )}
          <MatchList matches={matches} />
        </>
      )}
    </div>
  );
}

export default function MatchesPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MatchesContent />
    </Suspense>
  );
}
