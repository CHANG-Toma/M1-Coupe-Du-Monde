import Link from "next/link";
import type { Match } from "@/lib/types";
import { formatDateCourte, formatHeure } from "@/lib/utils/date";

interface MatchCardProps {
  match: Match;
}

function getFlagEmoji(codePays: string): string {
  const code = codePays.toLowerCase().replace("gb-eng", "gb");
  try {
    const codePoints = code
      .split("")
      .map((c) => 0x1f1e6 + c.charCodeAt(0) - 97);
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🏳";
  }
}

function shortName(nom: string): string {
  const map: Record<string, string> = {
    "États-Unis": "USA",
    "Arabie Saoudite": "Arabie S.",
    "Corée du Sud": "Corée S.",
    "Côte d'Ivoire": "C. d'Ivoire",
  };
  return map[nom] ?? nom;
}

export default function MatchCard({ match }: MatchCardProps) {
  const isTermine = match.statut === "termine";
  const isEnCours = match.statut === "en_cours";
  const showScore = isTermine || isEnCours;

  return (
    <Link href={`/matches/${match.id}`}>
      <article
        className={`flex items-center justify-between gap-3 rounded-lg px-4 py-3.5 border transition-colors group ${
          isEnCours
            ? "bg-[#0d1f14] border-[#00e676]/30 hover:border-[#00e676]/60"
            : "bg-[#131929] border-[#1e2840] hover:border-[#2a3a5a]"
        }`}
      >
        {/* Groupe / phase */}
        <div className="hidden sm:block w-16 shrink-0">
          <span className="text-[11px] text-[#4a5a7a]">
            {match.groupe ? `Gr. ${match.groupe.lettre}` : ""}
          </span>
        </div>

        {/* Équipe domicile */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-lg leading-none shrink-0">{getFlagEmoji(match.equipeDomicile.codePays)}</span>
          <span className="text-sm text-white/90 group-hover:text-white truncate">
            {shortName(match.equipeDomicile.nom)}
          </span>
        </div>

        {/* Centre */}
        <div className="flex flex-col items-center shrink-0 min-w-[72px]">
          {showScore ? (
            <span className={`text-sm font-bold tabular-nums ${isEnCours ? "text-[#00e676]" : "text-[#6b7a9e]"}`}>
              {match.scoreDomicile} – {match.scoreExterieur}
            </span>
          ) : (
            <span className="text-sm font-semibold text-white tabular-nums">
              {formatHeure(match.dateHeure)}
            </span>
          )}
          <span className="text-[11px] text-[#4a5a7a] mt-0.5">
            {isEnCours && match.minuteJeu
              ? `${match.minuteJeu}'`
              : formatDateCourte(match.dateHeure)}
          </span>
        </div>

        {/* Équipe extérieur */}
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className="text-sm text-white/90 group-hover:text-white truncate text-right">
            {shortName(match.equipeExterieur.nom)}
          </span>
          <span className="text-lg leading-none shrink-0">{getFlagEmoji(match.equipeExterieur.codePays)}</span>
        </div>
      </article>
    </Link>
  );
}
