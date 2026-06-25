import { getStandings } from "@/lib/api/standing-service";
import StandingsTable from "@/components/standings/StandingsTable";

export const revalidate = 120;

export default async function StandingsPage() {
  let standings = null;
  let error = null;

  try {
    standings = await getStandings();
  } catch {
    error = "Impossible de charger les classements.";
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
        Classements — Phase de groupes
      </h1>

      {error ? (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      ) : !standings || standings.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-4xl block mb-3">📊</span>
          <p className="text-gray-500 dark:text-gray-400">
            Les classements ne sont pas encore disponibles.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {standings.map((groupe) => (
            <StandingsTable key={groupe.groupe.id} groupe={groupe} />
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
        ● Les 2 premiers de chaque groupe se qualifient pour les seizièmes de finale.
        <br />
        Les 8 meilleurs troisièmes se qualifient également.
      </p>
    </div>
  );
}
