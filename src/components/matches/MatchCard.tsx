import Link from "next/link";
import type { Match } from "@/lib/types";
import { formatDateCourte, formatHeure } from "@/lib/utils/date";

interface MatchCardProps {
  match: Match;
}

function getFlagEmoji(codePays: string): string {
  const code = codePays.toLowerCase().replace("gb-eng", "gb");
  try {
    return String.fromCodePoint(...code.split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 97));
  } catch { return "🏳"; }
}

function shortName(nom: string): string {
  const map: Record<string, string> = {
    "États-Unis": "USA", "Arabie Saoudite": "Arabie S.",
    "Corée du Sud": "Corée S.", "Côte d'Ivoire": "C. d'Ivoire",
  };
  return map[nom] ?? nom;
}

export default function MatchCard({ match }: MatchCardProps) {
  const isTermine  = match.statut === "termine";
  const isEnCours  = match.statut === "en_cours";
  const showScore  = isTermine || isEnCours;

  return (
    <Link href={`/matches/${match.id}`}>
      <article
        className={`group relative flex items-center gap-3 rounded-xl px-4 py-3.5 border transition-all duration-200 hover:scale-[1.01] hover:-translate-y-px ${
          isEnCours
            ? "bg-[#0d1f14] border-[#00e676]/30 hover:border-[#00e676]/60 animate-glow-live"
            : isTermine
            ? "bg-[#0f1420] border-[#1e2840] hover:border-[#2a3a5a]"
            : "bg-[#131929] border-[#1e2840] hover:border-[#4a7ef5]/30"
        }`}
      >
        {/* Indicateur live sur le côté gauche */}
        {isEnCours && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#00e676] rounded-r-full" />
        )}

        {/* Groupe */}
        <div className="hidden sm:block w-14 shrink-0">
          <span className="text-[11px] text-[#4a5a7a]">
            {match.groupe ? `Gr. ${match.groupe.lettre}` : ""}
          </span>
        </div>

        {/* Équipe domicile */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-lg leading-none shrink-0">{getFlagEmoji(match.equipeDomicile.codePays)}</span>
          <span className={`text-sm truncate transition-colors ${isTermine ? "text-white/60" : "text-white/90 group-hover:text-white"}`}>
            {shortName(match.equipeDomicile.nom)}
          </span>
        </div>

        {/* Centre */}
        <div className="flex flex-col items-center shrink-0 min-w-[72px]">
          {showScore ? (
            <span className={`text-sm font-bold tabular-nums ${
              isEnCours ? "text-[#00e676]" : "text-[#6b7a9e]"
            }`}>
              {match.scoreDomicile} – {match.scoreExterieur}
            </span>
          ) : (
            <span className="text-sm font-semibold text-white tabular-nums">
              {formatHeure(match.dateHeure)}
            </span>
          )}
          <span className="text-[11px] text-[#4a5a7a] mt-0.5">
            {isEnCours && match.minuteJeu ? `${match.minuteJeu}'` : formatDateCourte(match.dateHeure)}
          </span>
        </div>

        {/* Équipe extérieur */}
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className={`text-sm truncate text-right transition-colors ${isTermine ? "text-white/60" : "text-white/90 group-hover:text-white"}`}>
            {shortName(match.equipeExterieur.nom)}
          </span>
          <span className="text-lg leading-none shrink-0">{getFlagEmoji(match.equipeExterieur.codePays)}</span>
        </div>
      </article>
    </Link>
  );
}
