import type { GroupeClassement } from "@/lib/types";
import TeamFlag from "@/components/ui/TeamFlag";

interface StandingsTableProps {
  groupe: GroupeClassement;
}

export default function StandingsTable({ groupe }: StandingsTableProps) {
  const sorted = [...groupe.classement].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.differenceButs !== a.differenceButs) return b.differenceButs - a.differenceButs;
    return b.butsPour - a.butsPour;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* En-tête groupe */}
      <div className="px-4 py-3 bg-cdm-blue text-white">
        <h3 className="font-bold text-sm tracking-wide">GROUPE {groupe.groupe.lettre}</h3>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
              <th className="text-left px-4 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium w-8">#</th>
              <th className="text-left px-4 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium">Équipe</th>
              <th className="text-center px-2 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium" title="Matchs joués">MJ</th>
              <th className="text-center px-2 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium" title="Victoires">V</th>
              <th className="text-center px-2 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium" title="Nuls">N</th>
              <th className="text-center px-2 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium" title="Défaites">D</th>
              <th className="text-center px-2 py-2 text-xs text-gray-500 dark:text-gray-400 font-medium" title="Différence de buts">DB</th>
              <th className="text-center px-3 py-2 text-xs text-gray-500 dark:text-gray-400 font-semibold" title="Points">Pts</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((ligne, index) => {
              const isQualifie = index < 2;
              return (
                <tr
                  key={ligne.equipe.id}
                  className={`border-b border-gray-50 dark:border-gray-700/50 last:border-0 ${
                    isQualifie ? "bg-green-50/50 dark:bg-green-900/10" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500">
                    {index + 1}
                    {isQualifie && (
                      <span className="ml-1 w-1.5 h-1.5 inline-block rounded-full bg-green-500" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <TeamFlag equipe={ligne.equipe} size="sm" />
                  </td>
                  <td className="text-center px-2 py-3 text-gray-700 dark:text-gray-300 tabular-nums">{ligne.matchsJoues}</td>
                  <td className="text-center px-2 py-3 text-gray-700 dark:text-gray-300 tabular-nums">{ligne.victoires}</td>
                  <td className="text-center px-2 py-3 text-gray-700 dark:text-gray-300 tabular-nums">{ligne.nuls}</td>
                  <td className="text-center px-2 py-3 text-gray-700 dark:text-gray-300 tabular-nums">{ligne.defaites}</td>
                  <td className="text-center px-2 py-3 text-gray-700 dark:text-gray-300 tabular-nums">
                    {ligne.differenceButs > 0 ? `+${ligne.differenceButs}` : ligne.differenceButs}
                  </td>
                  <td className="text-center px-3 py-3 font-bold text-cdm-blue dark:text-blue-400 tabular-nums">{ligne.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Légende */}
      <div className="px-4 py-2 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-50 dark:border-gray-700/50">
        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
        Qualifié pour les seizièmes de finale
      </div>
    </div>
  );
}
