import { getMatches } from "@/lib/api/match-service";
import BracketView from "@/components/bracket/BracketView";

export const dynamic = "force-dynamic";

export default async function BracketPage() {
  let knockoutMatches = null;
  let error = null;

  try {
    const all = await getMatches();
    knockoutMatches = all.filter((m) => m.phase.type !== "groupes");
  } catch {
    error = "Impossible de charger le tableau éliminatoire.";
  }

  return (
    <div className="flex flex-col min-h-[calc(100dvh-8rem)]">
      <div className="mb-2 sm:mb-3">
        <h1 className="text-base sm:text-lg font-bold text-white">Phase éliminatoire</h1>
        <p className="text-[10px] text-[#4a5a7a] mt-1">
          Survolez un match pour voir son parcours · sur mobile, touchez puis retouchez pour ouvrir
        </p>
      </div>

      {error ? (
        <p className="text-[#6b7a9e] text-sm py-16 text-center">{error}</p>
      ) : !knockoutMatches || knockoutMatches.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#6b7a9e] text-sm max-w-xs text-center px-4">
            Le tableau éliminatoire sera disponible à l&apos;issue de la phase de groupes.
          </p>
        </div>
      ) : (
        <BracketView matches={knockoutMatches} />
      )}
    </div>
  );
}
