"use client";

import { useState, useEffect, useCallback } from "react";
import type { Match, TypePhase } from "@/lib/types";
import { usePolling } from "./usePolling";

interface UseMatchesResult {
  matches: Match[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const POLLING_INTERVAL = 20_000; // 20 secondes

export function useMatches(phase?: TypePhase): UseMatchesResult {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      const params = phase ? `?phase=${phase}` : "";
      const res = await fetch(`/api/matches${params}`);
      if (!res.ok) throw new Error("Erreur réseau");
      const json = await res.json();
      setMatches(json.data ?? []);
      setError(null);
    } catch {
      setError("Impossible de charger les matchs.");
    } finally {
      setLoading(false);
    }
  }, [phase]);

  // Chargement initial
  useEffect(() => {
    setLoading(true);
    fetchMatches();
  }, [fetchMatches]);

  // Vérifie si un match est en cours (pour activer le polling)
  const hasMatchEnCours = matches.some((m) => m.statut === "en_cours");

  usePolling(fetchMatches, {
    interval: POLLING_INTERVAL,
    enabled: hasMatchEnCours,
    visibilityAware: true,
  });

  return { matches, loading, error, refresh: fetchMatches };
}
