import { useState, useEffect, useCallback } from "react";
import type { Match, TypePhase } from "@/types";
import { usePolling } from "./usePolling";
import { POLL_INTERVAL_MS } from "@/lib/config";

interface UseMatchesResult {
  matches: Match[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

interface UseMatchesOptions {
  alwaysPoll?: boolean;
  liveOnly?: boolean;
}

export function useMatches(
  phase?: TypePhase,
  options: UseMatchesOptions = {}
): UseMatchesResult {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (phase) params.set("phase", phase);
      if (options.liveOnly) params.set("live", "true");
      const qs = params.toString();
      const res = await fetch(`/api/matches${qs ? `?${qs}` : ""}`);
      if (!res.ok) throw new Error("Erreur réseau");
      const json = await res.json();
      setMatches(json.data ?? []);
      setError(null);
    } catch {
      setError("Impossible de charger les matchs.");
    } finally {
      setLoading(false);
    }
  }, [phase, options.liveOnly]);

  useEffect(() => {
    setLoading(true);
    fetchMatches();
  }, [fetchMatches]);

  const pollEnabled = options.liveOnly
    ? options.alwaysPoll !== false
    : Boolean(options.alwaysPoll);

  usePolling(fetchMatches, {
    interval: POLL_INTERVAL_MS,
    enabled: pollEnabled,
    visibilityAware: true,
  });

  return { matches, loading, error, refresh: fetchMatches };
}
