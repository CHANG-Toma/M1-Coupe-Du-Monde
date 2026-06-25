"use client";

import { PHASES } from "@/lib/types";
import type { TypePhase } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";

export default function PhaseNav() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phaseActive = (searchParams.get("phase") as TypePhase) ?? "groupes";

  function handleClick(type: TypePhase) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("phase", type);
    router.push(`/matches?${params.toString()}`);
  }

  return (
    <nav aria-label="Navigation par phase" className="w-full overflow-x-auto">
      <div className="flex gap-2 pb-2 min-w-max">
        {PHASES.map((phase) => {
          const isActive = phaseActive === phase.type;
          return (
            <button
              key={phase.id}
              onClick={() => handleClick(phase.type)}
              aria-current={isActive ? "page" : undefined}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cdm-blue/50 ${
                isActive
                  ? "bg-cdm-blue text-white shadow-md shadow-cdm-blue/20"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:border-cdm-blue/40 hover:text-cdm-blue"
              }`}
            >
              {phase.nom}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
