import Link from "next/link";
import { getMatches } from "@/lib/api/match-service";
import type { Match } from "@/lib/types";
import { formatDateCourte, formatHeure } from "@/lib/utils/date";

export const revalidate = 30;

// ─── Carte d'un match en cours (hero) ────────────────────────────────────────

function LiveMatchCard({ match }: { match: Match }) {
  return (
    <Link href={`/matches/${match.id}`}>
      <div className="relative rounded-xl border border-[#00e676]/40 bg-[#0d1f14] p-5 hover:border-[#00e676]/70 transition-colors">
        {/* Halo subtil */}
        <div className="absolute inset-0 rounded-xl bg-[#00e676]/3 pointer-events-none" />

        <div className="flex items-center justify-between gap-4">
          {/* Équipe domicile */}
          <TeamBlock
            codePays={match.equipeDomicile.codePays}
            nom={match.equipeDomicile.nom}
            align="left"
          />

          {/* Score */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-[#00e676] tabular-nums">
                {match.scoreDomicile}
              </span>
              <span className="text-lg text-[#1e2840] font-bold">–</span>
              <span className="text-3xl font-black text-[#00e676] tabular-nums">
                {match.scoreExterieur}
              </span>
            </div>
            <span className="flex items-center gap-1 text-[#00e676] text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
              {match.minuteJeu ? `${match.minuteJeu}'` : "En cours"}
            </span>
          </div>

          {/* Équipe extérieur */}
          <TeamBlock
            codePays={match.equipeExterieur.codePays}
            nom={match.equipeExterieur.nom}
            align="right"
          />
        </div>

        {match.stade && (
          <p className="mt-3 text-center text-xs text-[#4a5a7a]">
            {match.stade.ville}
          </p>
        )}
      </div>
    </Link>
  );
}

// ─── Carte match standard (liste) ────────────────────────────────────────────

function MatchRow({ match }: { match: Match }) {
  const isTermine = match.statut === "termine";
  const showScore = isTermine || match.statut === "en_cours";

  return (
    <Link href={`/matches/${match.id}`}>
      <div className="flex items-center justify-between gap-3 rounded-lg bg-[#131929] border border-[#1e2840] px-4 py-3.5 hover:border-[#2a3a5a] transition-colors group">
        {/* Équipe domicile */}
        <span className="flex-1 text-sm text-white/90 group-hover:text-white truncate">
          {shortName(match.equipeDomicile.nom)}
        </span>

        {/* Centre : heure/date ou score */}
        <div className="flex flex-col items-center shrink-0 min-w-[72px]">
          {showScore ? (
            <span className={`text-sm font-bold tabular-nums ${isTermine ? "text-[#6b7a9e]" : "text-[#00e676]"}`}>
              {match.scoreDomicile} – {match.scoreExterieur}
            </span>
          ) : (
            <span className="text-sm font-semibold text-white tabular-nums">
              {formatHeure(match.dateHeure)}
            </span>
          )}
          <span className="text-[11px] text-[#4a5a7a] mt-0.5">
            {formatDateCourte(match.dateHeure)}
          </span>
        </div>

        {/* Équipe extérieur */}
        <span className="flex-1 text-sm text-white/90 group-hover:text-white truncate text-right">
          {shortName(match.equipeExterieur.nom)}
        </span>
      </div>
    </Link>
  );
}

// ─── Bloc équipe avec drapeau ─────────────────────────────────────────────────

function TeamBlock({
  codePays,
  nom,
  align,
}: {
  codePays: string;
  nom: string;
  align: "left" | "right";
}) {
  const flag = getFlagEmoji(codePays);
  return (
    <div className={`flex flex-col items-center gap-1.5 flex-1 min-w-0 ${align === "right" ? "items-end" : "items-start"}`}>
      <span className="text-2xl leading-none">{flag}</span>
      <span className="text-sm font-semibold text-white/90 truncate max-w-full">
        {shortName(nom)}
      </span>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shortName(nom: string): string {
  // Raccourcit les noms trop longs
  const map: Record<string, string> = {
    "États-Unis": "USA",
    "Arabie Saoudite": "Arabie S.",
    "Corée du Sud": "Corée S.",
    "Côte d'Ivoire": "C. d'Ivoire",
  };
  return map[nom] ?? nom;
}

function getFlagEmoji(codePays: string): string {
  const code = codePays.toLowerCase().replace("gb-eng", "gb");
  const codePoints = code
    .split("")
    .map((c) => 0x1f1e6 + c.charCodeAt(0) - 97);
  return String.fromCodePoint(...codePoints);
}

// ─── Section title ────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-[#6b7a9e] uppercase tracking-wider mb-3">
      {children}
    </h2>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default async function HomePage() {
  const allMatches = await getMatches();

  const enCours = allMatches.filter((m) => m.statut === "en_cours");
  const aVenir = allMatches
    .filter((m) => m.statut === "a_venir")
    .slice(0, 4);
  const termines = allMatches
    .filter((m) => m.statut === "termine")
    .slice(-3)
    .reverse();

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="pt-2">
        <div className="flex flex-col items-center gap-3 mb-8 text-center">
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#4a7ef5] bg-[#4a7ef5]/10 border border-[#4a7ef5]/20 px-3 py-1 rounded-full">
            FIFA World Cup 2026 · USA · Canada · Mexique
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            World Cup Tracker
          </h1>
          <p className="text-[#6b7a9e] text-sm">
            Suivez la compétition en temps réel
          </p>
        </div>

        {/* Match(s) en cours */}
        {enCours.length > 0 && (
          <div className="space-y-3">
            <SectionTitle>En direct</SectionTitle>
            {enCours.map((m) => (
              <LiveMatchCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </section>

      {/* Prochains matchs */}
      {aVenir.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <SectionTitle>Prochains Matchs</SectionTitle>
            <Link href="/matches?phase=groupes" className="text-xs text-[#4a7ef5] hover:underline">
              Voir tous
            </Link>
          </div>
          <div className="space-y-2">
            {aVenir.map((m) => (
              <MatchRow key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}

      {/* Derniers résultats */}
      {termines.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <SectionTitle>Derniers Résultats</SectionTitle>
            <Link href="/matches?phase=groupes" className="text-xs text-[#4a7ef5] hover:underline">
              Voir tous
            </Link>
          </div>
          <div className="space-y-2">
            {termines.map((m) => (
              <MatchRow key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}

      {/* Raccourcis si rien en cours */}
      {enCours.length === 0 && aVenir.length === 0 && termines.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[#6b7a9e] text-sm">Aucun match disponible pour le moment.</p>
        </div>
      )}
    </div>
  );
}
