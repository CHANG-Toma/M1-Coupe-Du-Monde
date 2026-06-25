import { getStandings } from "@/lib/api/standing-service";
import StandingsTable from "@/components/standings/StandingsTable";

export const dynamic = "force-dynamic";

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
      <h1 className="text-base font-bold text-white">Classements — Phase de groupes</h1>

      {error ? (
        <p className="text-[#6b7a9e] text-sm py-16 text-center">{error}</p>
      ) : !standings || standings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#6b7a9e] text-sm">
            Les classements ne sont pas encore disponibles.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {standings.map((groupe) => (
            <StandingsTable key={groupe.groupe.id} groupe={groupe} />
          ))}
        </div>
      )}

      <p className="text-[11px] text-[#4a5a7a] text-center">
        ● Les 2 premiers de chaque groupe + les 8 meilleurs troisièmes se qualifient.
      </p>
    </div>
  );
}
