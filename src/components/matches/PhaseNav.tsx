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
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors focus:outline-none ${
                isActive
                  ? "bg-[#4a7ef5] text-white"
                  : "bg-[#131929] text-[#6b7a9e] border border-[#1e2840] hover:text-white hover:border-[#2a3a5a]"
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
