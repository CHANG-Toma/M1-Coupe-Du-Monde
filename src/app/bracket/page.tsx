import { getMatches } from "@/lib/api/match-service";
import BracketView from "@/components/bracket/BracketView";

export const revalidate = 120;

export default async function BracketPage() {
  let matches = null;
  let error = null;

  try {
    const all = await getMatches();
    matches = all.filter((m) => m.phase.type !== "groupes");
  } catch {
    error = "Impossible de charger le tableau éliminatoire.";
  }

  return (
    <div className="space-y-6">
      <h1 className="text-base font-bold text-white">Tableau éliminatoire</h1>

      {error ? (
        <p className="text-[#6b7a9e] text-sm py-16 text-center">{error}</p>
      ) : !matches || matches.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#6b7a9e] text-sm max-w-xs mx-auto">
            Le tableau éliminatoire sera disponible à l&apos;issue de la phase de groupes.
          </p>
        </div>
      ) : (
        <BracketView matches={matches} />
      )}
    </div>
  );
}
