import { getMatches } from "@/lib/api/match-service";
import BracketView from "@/components/bracket/BracketView";

export const revalidate = 120;

export default async function BracketPage() {
  let matches = null;
  let error = null;

  try {
    // On exclut les matchs de groupe
    const allMatches = await getMatches();
    matches = allMatches.filter((m) => m.phase.type !== "groupes");
  } catch {
    error = "Impossible de charger le tableau éliminatoire.";
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
        Tableau éliminatoire
      </h1>

      {error ? (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      ) : !matches || matches.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-4xl block mb-3">🏆</span>
          <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
            Le tableau éliminatoire sera disponible à l&apos;issue de la phase de groupes.
          </p>
        </div>
      ) : (
        <BracketView matches={matches} />
      )}

      <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
        Cliquez sur un match pour accéder au détail.
      </p>
    </div>
  );
}
