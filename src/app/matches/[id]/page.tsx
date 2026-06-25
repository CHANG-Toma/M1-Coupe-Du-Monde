"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Match } from "@/lib/types";
import { usePolling } from "@/hooks/usePolling";
import StatusBadge from "@/components/ui/StatusBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { formatDateHeure } from "@/lib/utils/date";

function getFlagEmoji(codePays: string): string {
  const code = codePays.toLowerCase().replace("gb-eng", "gb");
  try {
    const codePoints = code.split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 97);
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🏳";
  }
}

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
      if (!res.ok) throw new Error();
      const json = await res.json();
      setMatch(json.data);
      setError(null);
    } catch {
      setError("Impossible de charger ce match.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchMatch(); }, [fetchMatch]);

  usePolling(fetchMatch, {
    interval: 15_000,
    enabled: match?.statut === "en_cours",
    visibilityAware: true,
  });

  if (loading) return <LoadingSpinner message="Chargement du match..." />;
  if (error || !match) return <ErrorMessage message={error ?? "Match introuvable."} onRetry={fetchMatch} />;

  const isEnCours = match.statut === "en_cours";
  const scoreVisible = isEnCours || match.statut === "termine";

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      {/* Retour */}
      <button
        onClick={() => router.back()}
        className="text-sm text-[#6b7a9e] hover:text-white transition-colors"
      >
        ← Retour
      </button>

      {/* Carte score principale */}
      <div className={`rounded-xl border p-6 ${
        isEnCours
          ? "bg-[#0d1f14] border-[#00e676]/40"
          : "bg-[#131929] border-[#1e2840]"
      }`}>
        {/* Phase + groupe */}
        <p className="text-center text-xs text-[#6b7a9e] mb-5">
          {match.groupe ? `Groupe ${match.groupe.lettre} · ` : ""}{match.phase.nom}
        </p>

        {/* Équipes + score */}
        <div className="flex items-center justify-between gap-4">
          {/* Domicile */}
          <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
            <span className="text-4xl">{getFlagEmoji(match.equipeDomicile.codePays)}</span>
            <span className="text-sm font-semibold text-white text-center">
              {match.equipeDomicile.nom}
            </span>
          </div>

          {/* Score / vs */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            {scoreVisible ? (
              <div className="flex items-center gap-4">
                <span className={`text-4xl font-black tabular-nums ${isEnCours ? "text-[#00e676]" : "text-white"}`}>
                  {match.scoreDomicile}
                </span>
                <span className="text-xl text-[#2a3a5a]">–</span>
                <span className={`text-4xl font-black tabular-nums ${isEnCours ? "text-[#00e676]" : "text-white"}`}>
                  {match.scoreExterieur}
                </span>
              </div>
            ) : (
              <span className="text-xl font-semibold text-[#4a5a7a]">vs</span>
            )}
            <StatusBadge statut={match.statut} minuteJeu={match.minuteJeu} />
          </div>

          {/* Extérieur */}
          <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
            <span className="text-4xl">{getFlagEmoji(match.equipeExterieur.codePays)}</span>
            <span className="text-sm font-semibold text-white text-center">
              {match.equipeExterieur.nom}
            </span>
          </div>
        </div>
      </div>

      {/* Infos */}
      <div className="rounded-xl border border-[#1e2840] overflow-hidden divide-y divide-[#1e2840]">
        <InfoRow label="Date et heure" value={formatDateHeure(match.dateHeure)} />
        <InfoRow label="Phase" value={match.phase.nom} />
        {match.groupe && <InfoRow label="Groupe" value={`Groupe ${match.groupe.lettre}`} />}
        {match.stade
          ? <InfoRow label="Stade" value={`${match.stade.nom}${match.stade.ville ? ` · ${match.stade.ville}` : ""}`} />
          : <InfoRow label="Stade" value="Non renseigné" muted />
        }
      </div>

      {isEnCours && (
        <p className="text-[11px] text-center text-[#4a5a7a]">
          Score rafraîchi automatiquement toutes les 15 secondes
        </p>
      )}
    </div>
  );
}

function InfoRow({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#131929]">
      <span className="text-sm text-[#6b7a9e]">{label}</span>
      <span className={`text-sm ${muted ? "text-[#4a5a7a] italic" : "text-white/90"}`}>{value}</span>
    </div>
  );
}
