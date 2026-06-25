import type { GroupeClassement } from "@/lib/types";

const eq = (id: string, nom: string, codePays: string) => ({
  id,
  nom,
  codePays,
  logoUrl: `https://flagcdn.com/${codePays.toLowerCase()}.svg`,
});

export const MOCK_STANDINGS: GroupeClassement[] = [
  // ─── Groupe A ─────────────────────────────────────────────────────────────
  {
    groupe: { id: "A", lettre: "A" },
    classement: [
      { equipe: eq("1", "Mexique", "mx"), groupe: { id: "A", lettre: "A" }, points: 7, matchsJoues: 3, victoires: 2, nuls: 1, defaites: 0, butsPour: 7, butsContre: 3, differenceButs: 4 },
      { equipe: eq("4", "Maroc", "ma"), groupe: { id: "A", lettre: "A" }, points: 5, matchsJoues: 3, victoires: 1, nuls: 2, defaites: 0, butsPour: 4, butsContre: 3, differenceButs: 1 },
      { equipe: eq("3", "Suisse", "ch"), groupe: { id: "A", lettre: "A" }, points: 4, matchsJoues: 3, victoires: 1, nuls: 1, defaites: 1, butsPour: 4, butsContre: 4, differenceButs: 0 },
      { equipe: eq("2", "Équateur", "ec"), groupe: { id: "A", lettre: "A" }, points: 1, matchsJoues: 3, victoires: 0, nuls: 1, defaites: 2, butsPour: 2, butsContre: 7, differenceButs: -5 },
    ],
  },
  // ─── Groupe B ─────────────────────────────────────────────────────────────
  {
    groupe: { id: "B", lettre: "B" },
    classement: [
      { equipe: eq("5", "Argentine", "ar"), groupe: { id: "B", lettre: "B" }, points: 7, matchsJoues: 3, victoires: 2, nuls: 1, defaites: 0, butsPour: 6, butsContre: 1, differenceButs: 5 },
      { equipe: eq("7", "Canada", "ca"), groupe: { id: "B", lettre: "B" }, points: 5, matchsJoues: 3, victoires: 1, nuls: 2, defaites: 0, butsPour: 4, butsContre: 3, differenceButs: 1 },
      { equipe: eq("6", "Islande", "is"), groupe: { id: "B", lettre: "B" }, points: 2, matchsJoues: 3, victoires: 0, nuls: 2, defaites: 1, butsPour: 1, butsContre: 3, differenceButs: -2 },
      { equipe: eq("8", "Pérou", "pe"), groupe: { id: "B", lettre: "B" }, points: 0, matchsJoues: 3, victoires: 0, nuls: 0, defaites: 3, butsPour: 1, butsContre: 5, differenceButs: -4 },
    ],
  },
  // ─── Groupe C ─────────────────────────────────────────────────────────────
  {
    groupe: { id: "C", lettre: "C" },
    classement: [
      { equipe: eq("11", "Uruguay", "uy"), groupe: { id: "C", lettre: "C" }, points: 6, matchsJoues: 2, victoires: 2, nuls: 0, defaites: 0, butsPour: 4, butsContre: 1, differenceButs: 3 },
      { equipe: eq("10", "Jamaïque", "jm"), groupe: { id: "C", lettre: "C" }, points: 4, matchsJoues: 2, victoires: 1, nuls: 1, defaites: 0, butsPour: 3, butsContre: 3, differenceButs: 0 },
      { equipe: eq("9", "États-Unis", "us"), groupe: { id: "C", lettre: "C" }, points: 3, matchsJoues: 2, victoires: 1, nuls: 0, defaites: 1, butsPour: 4, butsContre: 3, differenceButs: 1 },
      { equipe: eq("12", "Bolivie", "bo"), groupe: { id: "C", lettre: "C" }, points: 0, matchsJoues: 2, victoires: 0, nuls: 0, defaites: 2, butsPour: 0, butsContre: 4, differenceButs: -4 },
    ],
  },
  // ─── Groupe D ─────────────────────────────────────────────────────────────
  {
    groupe: { id: "D", lettre: "D" },
    classement: [
      { equipe: eq("13", "France", "fr"), groupe: { id: "D", lettre: "D" }, points: 6, matchsJoues: 2, victoires: 2, nuls: 0, defaites: 0, butsPour: 5, butsContre: 1, differenceButs: 4 },
      { equipe: eq("14", "Belgique", "be"), groupe: { id: "D", lettre: "D" }, points: 4, matchsJoues: 2, victoires: 1, nuls: 1, defaites: 0, butsPour: 4, butsContre: 1, differenceButs: 3 },
      { equipe: eq("15", "Paraguay", "py"), groupe: { id: "D", lettre: "D" }, points: 1, matchsJoues: 2, victoires: 0, nuls: 1, defaites: 1, butsPour: 2, butsContre: 4, differenceButs: -2 },
      { equipe: eq("16", "Arabie Saoudite", "sa"), groupe: { id: "D", lettre: "D" }, points: 0, matchsJoues: 2, victoires: 0, nuls: 0, defaites: 2, butsPour: 0, butsContre: 5, differenceButs: -5 },
    ],
  },
  // ─── Groupe E ─────────────────────────────────────────────────────────────
  {
    groupe: { id: "E", lettre: "E" },
    classement: [
      { equipe: eq("17", "Espagne", "es"), groupe: { id: "E", lettre: "E" }, points: 5, matchsJoues: 2, victoires: 1, nuls: 2, defaites: 0, butsPour: 4, butsContre: 3, differenceButs: 1 },
      { equipe: eq("18", "Portugal", "pt"), groupe: { id: "E", lettre: "E" }, points: 4, matchsJoues: 2, victoires: 1, nuls: 1, defaites: 0, butsPour: 3, butsContre: 2, differenceButs: 1 },
      { equipe: eq("19", "Côte d'Ivoire", "ci"), groupe: { id: "E", lettre: "E" }, points: 1, matchsJoues: 2, victoires: 0, nuls: 1, defaites: 1, butsPour: 2, butsContre: 3, differenceButs: -1 },
      { equipe: eq("20", "Nigeria", "ng"), groupe: { id: "E", lettre: "E" }, points: 1, matchsJoues: 2, victoires: 0, nuls: 1, defaites: 1, butsPour: 1, butsContre: 2, differenceButs: -1 },
    ],
  },
  // ─── Groupe F ─────────────────────────────────────────────────────────────
  {
    groupe: { id: "F", lettre: "F" },
    classement: [
      { equipe: eq("22", "Angleterre", "gb-eng"), groupe: { id: "F", lettre: "F" }, points: 6, matchsJoues: 2, victoires: 2, nuls: 0, defaites: 0, butsPour: 3, butsContre: 1, differenceButs: 2 },
      { equipe: eq("23", "Serbie", "rs"), groupe: { id: "F", lettre: "F" }, points: 3, matchsJoues: 2, victoires: 1, nuls: 0, defaites: 1, butsPour: 3, butsContre: 2, differenceButs: 1 },
      { equipe: eq("21", "Allemagne", "de"), groupe: { id: "F", lettre: "F" }, points: 3, matchsJoues: 2, victoires: 1, nuls: 0, defaites: 1, butsPour: 5, butsContre: 3, differenceButs: 2 },
      { equipe: eq("24", "Cameroun", "cm"), groupe: { id: "F", lettre: "F" }, points: 0, matchsJoues: 2, victoires: 0, nuls: 0, defaites: 2, butsPour: 2, butsContre: 7, differenceButs: -5 },
    ],
  },
];
