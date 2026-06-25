"use client";

import { useEffect, useRef, useCallback } from "react";

interface UsePollingOptions {
  interval: number; // en millisecondes
  enabled?: boolean;
  visibilityAware?: boolean; // arrêt si onglet masqué
}

/**
 * Hook de polling — exécute `callback` à intervalle régulier.
 * S'arrête automatiquement si la page est masquée (visibilityAware).
 */
export function usePolling(
  callback: () => void | Promise<void>,
  { interval, enabled = true, visibilityAware = true }: UsePollingOptions
) {
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Garder la référence du callback à jour
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const start = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      callbackRef.current();
    }, interval);
  }, [interval]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }

    start();

    if (visibilityAware) {
      const handleVisibility = () => {
        if (document.hidden) {
          stop();
        } else {
          callbackRef.current(); // refresh immédiat au retour
          start();
        }
      };
      document.addEventListener("visibilitychange", handleVisibility);
      return () => {
        document.removeEventListener("visibilitychange", handleVisibility);
        stop();
      };
    }

    return stop;
  }, [enabled, start, stop, visibilityAware]);
}
