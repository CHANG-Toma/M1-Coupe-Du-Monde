"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Match } from "@/lib/types";
import { usePolling } from "@/hooks/usePolling";
import TeamFlag from "@/components/ui/TeamFlag";
import StatusBadge from "@/components/ui/StatusBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { formatDateHeure } from "@/lib/utils/date";

export default function MatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatch = useCallback(async () => {
    try {
      const res = await fetch(`/api/matches/${id}`);
      if (!res.ok) throw new Error("Erreur réseau");
      const json = await res.json();
      setMatch(json.data);
      setError(null);
    } catch {
      setError("Impossible de charger ce match.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

  usePolling(fetchMatch, {
    interval: 15_000,
    enabled: match?.statut === "en_cours",
    visibilityAware: true,
  });

  if (loading) return <LoadingSpinner message="Chargement du match..." />;
  if (error || !match) return <ErrorMessage message={error ?? "Match introuvable."} onRetry={fetchMatch} />;

  const scoreVisible = match.statut === "en_cours" || match.statut === "termine";

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Bouton retour */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-cdm-blue dark:hover:text-blue-400 transition-colors"
      >
        ← Retour aux matchs
      </button>

      {/* Carte principale */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
        {/* En-tête : phase + groupe */}
        <div className="bg-cdm-blue px-6 py-4 text-white text-center">
          <p className="text-sm font-medium opacity-90">
            {match.groupe ? `Groupe ${match.groupe.lettre} — ` : ""}{match.phase.nom}
          </p>
          <p className="text-xs opacity-70 mt-0.5">{formatDateHeure(match.dateHeure)}</p>
        </div>

        {/* Corps : équipes + score */}
        <div className="px-6 py-8">
          <div className="flex items-center justify-between gap-6">
            {/* Équipe domicile */}
            <div className="flex-1 flex flex-col items-center gap-3 min-w-0">
              <TeamFlag equipe={match.equipeDomicile} size="lg" align="center" showName={false} />
              <span className="text-sm font-semibold text-center text-gray-800 dark:text-gray-100">
                {match.equipeDomicile.nom}
              </span>
            </div>

            {/* Score central */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              {scoreVisible ? (
                <div className="flex items-center gap-4">
                  <span className={`text-5xl font-black tabular-nums ${match.statut === "en_cours" ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"}`}>
                    {match.scoreDomicile}
                  </span>
                  <span className="text-2xl text-gray-300 dark:text-gray-600 font-light">–</span>
                  <span className={`text-5xl font-black tabular-nums ${match.statut === "en_cours" ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"}`}>
                    {match.scoreExterieur}
                  </span>
                </div>
              ) : (
                <div className="text-2xl font-semibold text-gray-400 dark:text-gray-500 tracking-widest">
                  vs
                </div>
              )}
              <StatusBadge statut={match.statut} minuteJeu={match.minuteJeu} />
            </div>

            {/* Équipe extérieur */}
            <div className="flex-1 flex flex-col items-center gap-3 min-w-0">
              <TeamFlag equipe={match.equipeExterieur} size="lg" align="center" showName={false} />
              <span className="text-sm font-semibold text-center text-gray-800 dark:text-gray-100">
                {match.equipeExterieur.nom}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Informations supplémentaires */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-700">
        {/* Date & heure */}
        <InfoRow label="Date et heure" value={formatDateHeure(match.dateHeure)} />

        {/* Phase */}
        <InfoRow label="Phase" value={match.phase.nom} />

        {/* Groupe */}
        {match.groupe && (
          <InfoRow label="Groupe" value={`Groupe ${match.groupe.lettre}`} />
        )}

        {/* Stade */}
        {match.stade ? (
          <InfoRow
            label="Stade"
            value={`${match.stade.nom}${match.stade.ville ? ` — ${match.stade.ville}` : ""}`}
          />
        ) : (
          <InfoRow label="Stade" value="Non renseigné" muted />
        )}

        {/* Statut */}
        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">Statut</span>
          <StatusBadge statut={match.statut} minuteJeu={match.minuteJeu} />
        </div>
      </div>

      {/* Indicateur polling */}
      {match.statut === "en_cours" && (
        <p className="text-xs text-center text-gray-400 dark:text-gray-600">
          Score mis à jour automatiquement toutes les 15 secondes
        </p>
      )}
    </div>
  );
}

function InfoRow({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className={`text-sm font-medium ${muted ? "text-gray-400 dark:text-gray-600 italic" : "text-gray-800 dark:text-gray-200"}`}>
        {value}
      </span>
    </div>
  );
}
