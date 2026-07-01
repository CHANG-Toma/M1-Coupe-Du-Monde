import { useState, useEffect } from "react";
import type { GroupeClassement } from "@/types";
import StandingsTable from "@/components/standings/StandingsTable";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function StandingsPage() {
  const [standings, setStandings] = useState<GroupeClassement[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/standings")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((json) => setStandings(json.data ?? []))
      .catch(() => setError("Impossible de charger les classements."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Chargement des classements..." />;

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
