import { useEffect, useState } from "react";
import { POLL_INTERVAL_MS } from "@/lib/config";

export function useLiveCount(): number {
  const [liveCount, setLiveCount] = useState(0);

  useEffect(() => {
    async function fetchLiveCount() {
      try {
        const res = await fetch("/api/matches?live=true");
        const json = await res.json();
        setLiveCount((json.data ?? []).length);
      } catch {
        // ignore
      }
    }
    fetchLiveCount();
    const interval = setInterval(fetchLiveCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return liveCount;
}
