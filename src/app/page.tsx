import Link from "next/link";
import { getMatches } from "@/lib/api/match-service";
import MatchCard from "@/components/matches/MatchCard";

export const revalidate = 60;

export default async function HomePage() {
  const [matchsEnCours, prochainMatchs] = await Promise.all([
    getMatches().then((m) => m.filter((match) => match.statut === "en_cours")),
    getMatches().then((m) =>
      m.filter((match) => match.statut === "a_venir").slice(0, 3)
    ),
  ]);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center py-8">
        <div className="text-5xl mb-3">🏆</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Coupe du Monde{" "}
          <span className="text-cdm-blue dark:text-blue-400">FIFA 2026</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Suivez en temps réel les matchs, scores et l&apos;évolution du tournoi.
        </p>

        {/* Raccourcis */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Link
            href="/matches?phase=groupes"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-cdm-blue text-white rounded-lg font-medium hover:bg-cdm-blue/90 transition-colors shadow-md shadow-cdm-blue/20"
          >
            ⚽ Matchs
          </Link>
          <Link
            href="/standings"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg font-medium border border-gray-200 dark:border-gray-600 hover:border-cdm-blue/40 transition-colors"
          >
            📊 Classements
          </Link>
          <Link
            href="/bracket"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg font-medium border border-gray-200 dark:border-gray-600 hover:border-cdm-blue/40 transition-colors"
          >
            🏆 Tableau
          </Link>
        </div>
      </section>

      {/* Matchs en cours */}
      {matchsEnCours.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <h2 className="font-bold text-gray-900 dark:text-white">En direct</h2>
          </div>
          <div className="flex flex-col gap-3">
            {matchsEnCours.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {/* Prochains matchs */}
      {prochainMatchs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white">Prochains matchs</h2>
            <Link
              href="/matches?phase=groupes"
              className="text-sm text-cdm-blue dark:text-blue-400 hover:underline"
            >
              Voir tous →
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {prochainMatchs.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {/* Stats rapides */}
      <section className="grid grid-cols-3 gap-4">
        {[
          { label: "Équipes", value: "48", icon: "🌍" },
          { label: "Matchs", value: "104", icon: "⚽" },
          { label: "Stades", value: "16", icon: "🏟️" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 text-center"
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-xl font-bold text-cdm-blue dark:text-blue-400">{stat.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
