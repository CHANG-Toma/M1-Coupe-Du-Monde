import type { GroupeClassement } from "@/lib/types";

interface StandingsTableProps {
  groupe: GroupeClassement;
}

function getFlagEmoji(codePays: string): string {
  const code = codePays.toLowerCase().replace("gb-eng", "gb");
  try {
    const codePoints = code.split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 97);
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🏳";
  }
}

export default function StandingsTable({ groupe }: StandingsTableProps) {
  const sorted = [...groupe.classement].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.differenceButs !== a.differenceButs) return b.differenceButs - a.differenceButs;
    return b.butsPour - a.butsPour;
  });

  return (
    <div className="rounded-xl border border-[#1e2840] overflow-hidden">
      {/* En-tête groupe */}
      <div className="px-4 py-2.5 bg-[#131929] border-b border-[#1e2840] flex items-center justify-between">
        <span className="text-xs font-bold tracking-widest text-[#6b7a9e] uppercase">
          Groupe {groupe.groupe.lettre}
        </span>
        <span className="text-[11px] text-[#4a5a7a]">MJ V N D DB Pts</span>
      </div>

      {/* Lignes */}
      <div className="bg-[#0f1523]">
        {sorted.map((ligne, index) => {
          const qualifie = index < 2;
          return (
            <div
              key={ligne.equipe.id}
              className={`flex items-center gap-3 px-4 py-2.5 border-b border-[#1e2840]/60 last:border-0 ${
                qualifie ? "bg-[#0a1a10]/60" : ""
              }`}
            >
              {/* Rang */}
              <span className="w-4 text-xs text-[#4a5a7a] font-medium shrink-0">
                {index + 1}
              </span>

              {/* Flag + nom */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-base leading-none">{getFlagEmoji(ligne.equipe.codePays)}</span>
                <span className="text-sm text-white/90 truncate">{ligne.equipe.nom}</span>
                {qualifie && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] shrink-0" />
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-3 shrink-0 text-xs tabular-nums text-[#6b7a9e]">
                <span className="w-4 text-center">{ligne.matchsJoues}</span>
                <span className="w-4 text-center">{ligne.victoires}</span>
                <span className="w-4 text-center">{ligne.nuls}</span>
                <span className="w-4 text-center">{ligne.defaites}</span>
                <span className="w-6 text-center">
                  {ligne.differenceButs > 0 ? `+${ligne.differenceButs}` : ligne.differenceButs}
                </span>
                <span className="w-5 text-center font-bold text-white">{ligne.points}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
