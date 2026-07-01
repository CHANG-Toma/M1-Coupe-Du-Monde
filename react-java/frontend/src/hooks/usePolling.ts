import { useEffect, useRef, useCallback } from "react";

interface UsePollingOptions {
  interval: number;
  enabled?: boolean;
  visibilityAware?: boolean;
}

export function usePolling(
  callback: () => void | Promise<void>,
  { interval, enabled = true, visibilityAware = true }: UsePollingOptions
) {
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
          callbackRef.current();
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
