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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Matchs</h1>
        <PhaseNav />
      </div>

      {loading ? (
        <LoadingSpinner message="Chargement des matchs..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={refresh} />
      ) : (
        <>
          {matches.some((m) => m.statut === "en_cours") && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Mise à jour automatique activée — matchs en cours
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
