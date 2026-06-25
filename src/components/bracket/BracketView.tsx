import type { Match } from "@/lib/types";
import { PHASES } from "@/lib/types";
import Link from "next/link";
import { formatDateCourte, formatHeure } from "@/lib/utils/date";

interface BracketViewProps {
  matches: Match[];
}

const PHASES_ELIM = PHASES.filter((p) => p.type !== "groupes");

function getFlagEmoji(codePays: string): string {
  const code = codePays.toLowerCase().replace("gb-eng", "gb");
  try {
    const codePoints = code.split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 97);
    return String.fromCodePoint(...codePoints);
  } catch { return "🏳"; }
}

function BracketMatchCard({ match }: { match: Match }) {
  const isTermine = match.statut === "termine";
  const isEnCours = match.statut === "en_cours";
  const showScore = isTermine || isEnCours;

  const domWin = showScore && match.scoreDomicile > match.scoreExterieur;
  const extWin = showScore && match.scoreExterieur > match.scoreDomicile;

  return (
    <Link href={`/matches/${match.id}`}>
      <div className={`rounded-lg border overflow-hidden w-48 hover:border-[#2a3a5a] transition-colors ${
        isEnCours ? "border-[#00e676]/30 bg-[#0d1f14]" : "border-[#1e2840] bg-[#131929]"
      }`}>
        {/* Domicile */}
        <div className={`flex items-center justify-between px-3 py-2 border-b border-[#1e2840] ${domWin ? "text-white" : "text-white/60"}`}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm">{getFlagEmoji(match.equipeDomicile.codePays)}</span>
            <span className="text-xs truncate">{match.equipeDomicile.nom}</span>
          </div>
          {showScore && <span className={`text-xs font-bold ml-2 tabular-nums ${domWin ? "text-white" : ""}`}>{match.scoreDomicile}</span>}
        </div>
        {/* Extérieur */}
        <div className={`flex items-center justify-between px-3 py-2 ${extWin ? "text-white" : "text-white/60"}`}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm">{getFlagEmoji(match.equipeExterieur.codePays)}</span>
            <span className="text-xs truncate">{match.equipeExterieur.nom}</span>
          </div>
          {showScore && <span className={`text-xs font-bold ml-2 tabular-nums ${extWin ? "text-white" : ""}`}>{match.scoreExterieur}</span>}
        </div>
        {/* Date */}
        <div className="px-3 py-1.5 border-t border-[#1e2840] text-[11px] text-[#4a5a7a] text-center">
          {match.statut === "a_venir"
            ? `${formatDateCourte(match.dateHeure)} · ${formatHeure(match.dateHeure)}`
            : isEnCours
              ? <span className="text-[#00e676]">{match.minuteJeu ? `${match.minuteJeu}'` : "En cours"}</span>
              : "Terminé"
          }
        </div>
      </div>
    </Link>
  );
}

function PlaceholderCard() {
  return (
    <div className="border border-dashed border-[#1e2840] rounded-lg w-48 h-20 flex items-center justify-center">
      <span className="text-xs text-[#4a5a7a]">À déterminer</span>
    </div>
  );
}

export default function BracketView({ matches }: BracketViewProps) {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-6 min-w-max items-start">
        {PHASES_ELIM.map((phase) => {
          const phaseMatches = matches.filter((m) => m.phase.type === phase.type);
          return (
            <div key={phase.id} className="flex flex-col gap-3">
              <span className="text-[11px] font-semibold text-[#6b7a9e] uppercase tracking-wider text-center">
                {phase.nom}
              </span>
              <div className="flex flex-col gap-3">
                {phaseMatches.length > 0
                  ? phaseMatches.map((m) => <BracketMatchCard key={m.id} match={m} />)
                  : <PlaceholderCard />
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
