import { Link } from "react-router-dom";
import type { Match } from "@/types";
import { formatDateCourte, formatHeure } from "@/lib/utils/date";
import { useMatches } from "@/hooks/useMatches";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

function LiveMatchCard({ match }: { match: Match }) {
  return (
    <Link to={`/matches/${match.id}`}>
      <div className="relative rounded-xl border border-[#00e676]/40 bg-[#0d1f14] p-5 hover:border-[#00e676]/70 transition-colors">
        <div className="absolute inset-0 rounded-xl bg-[#00e676]/3 pointer-events-none" />
        <div className="flex items-center justify-between gap-4">
          <TeamBlock codePays={match.equipeDomicile.codePays} nom={match.equipeDomicile.nom} align="left" />
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-[#00e676] tabular-nums">{match.scoreDomicile}</span>
              <span className="text-lg text-[#1e2840] font-bold">–</span>
              <span className="text-3xl font-black text-[#00e676] tabular-nums">{match.scoreExterieur}</span>
            </div>
            <span className="flex items-center gap-1 text-[#00e676] text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
              {match.minuteJeu ? `${match.minuteJeu}'` : "En cours"}
            </span>
          </div>
          <TeamBlock codePays={match.equipeExterieur.codePays} nom={match.equipeExterieur.nom} align="right" />
        </div>
        {match.stade && (
          <p className="mt-3 text-center text-xs text-[#4a5a7a]">{match.stade.ville}</p>
        )}
      </div>
    </Link>
  );
}

function MatchRow({ match }: { match: Match }) {
  const isTermine = match.statut === "termine";
  const showScore = isTermine || match.statut === "en_cours";

  return (
    <Link to={`/matches/${match.id}`}>
      <div className="flex items-center justify-between gap-3 rounded-lg bg-[#131929] border border-[#1e2840] px-4 py-3.5 hover:border-[#2a3a5a] hover:scale-[1.01] transition-all duration-200 group">
        <span className="flex-1 text-sm text-white/90 group-hover:text-white truncate">
          {shortName(match.equipeDomicile.nom)}
        </span>
        <div className="flex flex-col items-center shrink-0 min-w-[72px]">
          {showScore ? (
            <span className={`text-sm font-bold tabular-nums ${isTermine ? "text-[#6b7a9e]" : "text-[#00e676]"}`}>
              {match.scoreDomicile} – {match.scoreExterieur}
            </span>
          ) : (
            <span className="text-sm font-semibold text-white tabular-nums">{formatHeure(match.dateHeure)}</span>
          )}
          <span className="text-[11px] text-[#4a5a7a] mt-0.5">{formatDateCourte(match.dateHeure)}</span>
        </div>
        <span className="flex-1 text-sm text-white/90 group-hover:text-white truncate text-right">
          {shortName(match.equipeExterieur.nom)}
        </span>
      </div>
    </Link>
  );
}

function TeamBlock({ codePays, nom, align }: { codePays: string; nom: string; align: "left" | "right" }) {
  return (
    <div className={`flex flex-col items-center gap-1.5 flex-1 min-w-0 ${align === "right" ? "items-end" : "items-start"}`}>
      <span className="text-2xl leading-none">{getFlagEmoji(codePays)}</span>
      <span className="text-sm font-semibold text-white/90 truncate max-w-full">{shortName(nom)}</span>
    </div>
  );
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

function getFlagEmoji(codePays: string): string {
  const code = codePays.toLowerCase().replace("gb-eng", "gb");
  try {
    return String.fromCodePoint(...code.split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 97));
  } catch {
    return "🏳";
  }
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-[#6b7a9e] uppercase tracking-wider mb-3">{children}</h2>
  );
}

export default function HomeDashboard() {
  const { matches: liveMatches } = useMatches(undefined, { liveOnly: true, alwaysPoll: true });
  const { matches: dbMatches, loading } = useMatches(undefined);

  const enCours = liveMatches;
  const aVenir = dbMatches.filter((m) => m.statut === "a_venir").slice(0, 4);
  const termines = dbMatches.filter((m) => m.statut === "termine").slice(-3).reverse();

  if (loading) {
    return <LoadingSpinner message="Chargement des matchs..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="pt-2">
        <div className="flex flex-col items-center gap-3 mb-8 text-center animate-fade-up">
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#4a7ef5] bg-[#4a7ef5]/10 border border-[#4a7ef5]/20 px-3 py-1 rounded-full">
            FIFA World Cup 2026 · USA · Canada · Mexique
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">World Cup Tracker</h1>
          <p className="text-[#6b7a9e] text-sm">
            Suivez la compétition en temps réel
          </p>
        </div>

        {enCours.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <SectionTitle>En direct</SectionTitle>
              <Link to="/live" className="text-xs text-[#00e676] hover:underline flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
                Tableau de bord live
              </Link>
            </div>
            {enCours.map((m) => (
              <LiveMatchCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </section>

      {aVenir.length > 0 && (
        <section className="animate-fade-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center justify-between mb-3">
            <SectionTitle>Prochains Matchs</SectionTitle>
            <Link to="/matches?phase=groupes" className="text-xs text-[#4a7ef5] hover:underline">
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

      {termines.length > 0 && (
        <section className="animate-fade-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center justify-between mb-3">
            <SectionTitle>Derniers Résultats</SectionTitle>
            <Link to="/matches?phase=groupes" className="text-xs text-[#4a7ef5] hover:underline">
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

      {enCours.length === 0 && aVenir.length === 0 && termines.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[#6b7a9e] text-sm">Aucun match disponible pour le moment.</p>
        </div>
      )}
    </div>
  );
}
