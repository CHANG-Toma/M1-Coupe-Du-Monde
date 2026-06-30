"use client";

import { useRef, useCallback, useMemo, useState, useEffect } from "react";
import type { Match, TypePhase } from "@/lib/types";
import Link from "next/link";
import { formatDateCourte } from "@/lib/utils/date";
import {
  KNOCKOUT_FEEDS,
  KNOCKOUT_ROUNDS,
  BRACKET_R32_PAIRS,
  BRACKET_SLOT_PX_MOBILE,
  BRACKET_SLOT_PX_DESKTOP,
  computeBracketPositions,
  getBracketTreeHeight,
  getPairBandBounds,
  getRelatedMatchIds,
  isKnockoutMatchFinished,
  matchesForRound,
  sortMatchesByBracketY,
} from "@/lib/bracket/bracket-layout";

interface BracketViewProps {
  matches: Match[];
}

const CARD_W: Record<TypePhase, string> = {
  groupes: "w-[148px] sm:w-[168px] lg:w-[188px]",
  seizieme: "w-[148px] sm:w-[168px] lg:w-[188px]",
  huitieme: "w-[132px] sm:w-[152px] lg:w-[172px]",
  quart: "w-[118px] sm:w-[136px] lg:w-[156px]",
  demi: "w-[108px] sm:w-[124px] lg:w-[140px]",
  petite_finale: "w-[100px] sm:w-[116px] lg:w-[132px]",
  finale: "w-[96px] sm:w-[112px] lg:w-[128px]",
};

const COL_W: Record<TypePhase, string> = {
  groupes: "w-[148px] sm:w-[168px] lg:w-[188px]",
  seizieme: "w-[148px] sm:w-[168px] lg:w-[188px]",
  huitieme: "w-[132px] sm:w-[152px] lg:w-[172px]",
  quart: "w-[118px] sm:w-[136px] lg:w-[156px]",
  demi: "w-[108px] sm:w-[124px] lg:w-[140px]",
  petite_finale: "w-[100px] sm:w-[116px] lg:w-[132px]",
  finale: "w-[96px] sm:w-[112px] lg:w-[128px]",
};

const GUTTER_W_MOBILE = 44;
const GUTTER_W_DESKTOP = 56;
const HEADER_H = 36;

function useBracketSlotPx(): number {
  const [slotPx, setSlotPx] = useState(BRACKET_SLOT_PX_MOBILE);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setSlotPx(mq.matches ? BRACKET_SLOT_PX_DESKTOP : BRACKET_SLOT_PX_MOBILE);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return slotPx;
}

function useBracketScale(
  scrollRef: React.RefObject<HTMLDivElement | null>,
  innerRef: React.RefObject<HTMLDivElement | null>,
  deps: unknown[]
): number {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = scrollRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    const fit = () => {
      const pad = 16;
      const available = container.clientWidth - pad;
      const contentW = inner.scrollWidth;
      if (contentW > 0 && contentW < available) {
        setScale(Math.min(available / contentW, 1.15));
      } else {
        setScale(1);
      }
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(container);
    ro.observe(inner);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scale;
}

function getFlagEmoji(codePays: string): string {
  if (codePays === "un") return "❓";
  const code = codePays.toLowerCase().replace("gb-eng", "gb");
  try {
    const codePoints = code.split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 97);
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🏳";
  }
}

function shortName(nom: string): string {
  if (!nom || nom === "undefined") return "À déterminer";
  const winner = nom.match(/Winner Match (\d+)/i);
  if (winner) return `Vainq. M${winner[1]}`;
  const loser = nom.match(/Loser Match (\d+)/i);
  if (loser) return `Perd. M${loser[1]}`;
  if (/runner.?up group ([a-l])/i.test(nom)) {
    const g = nom.match(/group ([a-l])/i);
    return g ? `2e Gr.${g[1]}` : "2e";
  }
  if (/winner group ([a-l])/i.test(nom)) {
    const g = nom.match(/group ([a-l])/i);
    return g ? `1er Gr.${g[1]}` : "1er";
  }
  if (/3rd group/i.test(nom)) return "3e meilleur";

  const map: Record<string, string> = {
    "United States": "USA",
    "South Korea": "Corée S.",
    "South Africa": "Af. Sud",
    "Czech Republic": "Tchéq.",
    "Saudi Arabia": "Arabie S.",
    "New Zealand": "N. Zél.",
    Netherlands: "Pays-Bas",
    "Democratic Republic of the Congo": "RD Congo",
    "Ivory Coast": "Côte Ivoire",
    "Bosnia and Herzegovina": "Bosnie",
    "Cape Verde": "Cap-Vert",
  };
  if (map[nom]) return map[nom];
  return nom.length > 12 ? `${nom.slice(0, 11)}…` : nom;
}

function TeamRow({
  flag,
  name,
  score,
  win,
}: {
  flag: string;
  name: string;
  score?: number;
  win?: boolean;
}) {
  return (
    <div className={`flex items-center gap-1.5 min-h-[20px] ${win ? "text-white" : "text-white/70"}`}>
      <span className="text-[11px] leading-none shrink-0">{flag}</span>
      <span className="text-[10px] sm:text-[11px] truncate flex-1 leading-tight">{name}</span>
      {score !== undefined && (
        <span className={`text-[11px] font-bold tabular-nums shrink-0 ${win ? "text-white" : "text-white/50"}`}>
          {score}
        </span>
      )}
    </div>
  );
}

function BracketMatchCard({
  match,
  dimmed,
  highlighted,
  isPinned,
  onHover,
  onLeave,
  onPin,
}: {
  match: Match;
  dimmed?: boolean;
  highlighted?: boolean;
  isPinned?: boolean;
  onHover?: () => void;
  onLeave?: () => void;
  onPin?: () => void;
}) {
  const isTermine = match.statut === "termine";
  const isEnCours = match.statut === "en_cours";
  const showScore = isTermine || isEnCours;
  const domWin = showScore && match.scoreDomicile > match.scoreExterieur;
  const extWin = showScore && match.scoreExterieur > match.scoreDomicile;
  const isFinale = match.phase.type === "finale";
  const isPlaceholder =
    match.equipeDomicile.codePays === "un" ||
    match.equipeExterieur.codePays === "un" ||
    match.equipeDomicile.nom.startsWith("Winner") ||
    match.equipeExterieur.nom.startsWith("Winner") ||
    match.equipeDomicile.nom.startsWith("Loser");

  return (
    <Link
      href={`/matches/${match.id}`}
      className={`block group transition-opacity duration-150 ${dimmed ? "opacity-35" : "opacity-100"}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onPointerDown={(e) => {
        if (e.pointerType !== "touch" || !onPin) return;
        e.preventDefault();
        if (isPinned) {
          window.location.assign(`/matches/${match.id}`);
        } else {
          onPin();
        }
      }}
    >
      <div
        className={`relative rounded-lg border overflow-hidden transition-all duration-200
          group-hover:scale-[1.02] group-active:scale-[0.98]
          ${CARD_W[match.phase.type]}
          ${highlighted ? "ring-2 ring-[#4a7ef5]/70 ring-offset-1 ring-offset-[#0b0f1a]" : ""}
          ${
            isEnCours
              ? "border-[#00e676]/50 bg-[#0a1a12]"
              : isFinale
                ? "border-[#4a7ef5]/60 bg-gradient-to-b from-[#141e35] to-[#0f1523]"
                : isPlaceholder
                  ? "border-dashed border-[#2a3a5a] bg-[#0f1523]/60"
                  : "border-[#1e2840] bg-[#131929] group-hover:border-[#3a4a6a]"
          }`}
      >
        {isEnCours && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#00e676] animate-pulse" />}
        <div className="px-2 py-1.5 space-y-0.5">
          <TeamRow
            flag={getFlagEmoji(match.equipeDomicile.codePays)}
            name={shortName(match.equipeDomicile.nom)}
            score={showScore ? match.scoreDomicile : undefined}
            win={domWin}
          />
          <div className="h-px bg-[#1e2840]/80" />
          <TeamRow
            flag={getFlagEmoji(match.equipeExterieur.codePays)}
            name={shortName(match.equipeExterieur.nom)}
            score={showScore ? match.scoreExterieur : undefined}
            win={extWin}
          />
        </div>
        <div className="px-2 pb-1 flex justify-between items-center">
          <span className="text-[8px] text-[#4a5a7a] font-mono">M{match.id}</span>
          <span className="text-[8px] text-[#4a5a7a]">
            {isEnCours ? (
              <span className="text-[#00e676]">{match.minuteJeu ? `${match.minuteJeu}'` : "Live"}</span>
            ) : match.statut === "a_venir" ? (
              formatDateCourte(match.dateHeure)
            ) : (
              "Terminé"
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}

function BracketTConnector({
  childMatches,
  positions,
  treeHeight,
  gutterW,
  activeId,
  matchesById,
}: {
  childMatches: Match[];
  positions: Map<number, number>;
  treeHeight: number;
  gutterW: number;
  activeId: number | null;
  matchesById: Map<number, Match>;
}) {
  const related = activeId !== null ? getRelatedMatchIds(activeId) : null;
  const midX = gutterW / 2;

  return (
    <div
      className="relative shrink-0"
      style={{ width: gutterW, height: treeHeight + HEADER_H }}
      aria-hidden
    >
      <svg
        width={gutterW}
        height={treeHeight + HEADER_H}
        className="overflow-visible block"
      >
        <g transform={`translate(0, ${HEADER_H})`}>
          {childMatches.map((child) => {
            const childId = parseInt(child.id, 10);
            const feeders = KNOCKOUT_FEEDS[childId];
            if (!feeders) return null;

            const yEnd = positions.get(childId);
            const y1 = positions.get(feeders[0]);
            const y2 = positions.get(feeders[1]);
            if (yEnd === undefined || y1 === undefined || y2 === undefined) return null;

            const laneActive =
              related !== null &&
              (related.has(childId) || related.has(feeders[0]) || related.has(feeders[1]));
            const laneDimmed = related !== null && !laneActive;

            const feeder1 = matchesById.get(feeders[0]);
            const feeder2 = matchesById.get(feeders[1]);
            const feeder1Done = feeder1 ? isKnockoutMatchFinished(feeder1) : false;
            const feeder2Done = feeder2 ? isKnockoutMatchFinished(feeder2) : false;
            const childDone = isKnockoutMatchFinished(child);

            const yTop = Math.min(y1, y2);
            const yBot = Math.max(y1, y2);

            const stroke = laneActive ? "#4a7ef5" : "#3a4a6a";
            const strokeW = laneActive ? 2 : 1.4;
            const opacity = laneDimmed ? 0.12 : laneActive ? 1 : 0.65;
            const cap = "square" as const;

            const arm1Stroke = feeder1Done && !laneDimmed ? "#00e676" : stroke;
            const arm2Stroke = feeder2Done && !laneDimmed ? "#00e676" : stroke;

            return (
              <g key={childId}>
                <path
                  d={`M 0 ${y1} H ${midX}`}
                  stroke={arm1Stroke}
                  strokeWidth={strokeW}
                  strokeLinecap={cap}
                  fill="none"
                  opacity={opacity}
                />
                <path
                  d={`M 0 ${y2} H ${midX}`}
                  stroke={arm2Stroke}
                  strokeWidth={strokeW}
                  strokeLinecap={cap}
                  fill="none"
                  opacity={opacity}
                />
                <path
                  d={`M ${midX} ${yTop} V ${yBot}`}
                  stroke={stroke}
                  strokeWidth={strokeW}
                  strokeLinecap={cap}
                  fill="none"
                  opacity={opacity}
                />
                <path
                  d={`M ${midX} ${yEnd} H ${gutterW}`}
                  stroke={childDone && !laneDimmed ? "#00e676" : stroke}
                  strokeWidth={strokeW}
                  strokeLinecap={cap}
                  fill="none"
                  opacity={opacity}
                />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

function RoundColumn({
  roundMatches,
  positions,
  treeHeight,
  label,
  short,
  phaseType,
  isFinale,
  activeId,
  pinnedId,
  onHoverMatch,
  onLeaveMatch,
  onPinMatch,
  slotPx,
}: {
  roundMatches: Match[];
  positions: Map<number, number>;
  treeHeight: number;
  label: string;
  short: string;
  phaseType: TypePhase;
  isFinale?: boolean;
  activeId: number | null;
  pinnedId: number | null;
  onHoverMatch: (id: number) => void;
  onLeaveMatch: () => void;
  onPinMatch: (id: number) => void;
  slotPx: number;
}) {
  const related = activeId !== null ? getRelatedMatchIds(activeId) : null;

  return (
    <div
      className={`relative shrink-0 snap-center rounded-xl ${COL_W[phaseType]} ${
        isFinale ? "bg-[#4a7ef5]/5" : "bg-[#131929]/30"
      }`}
      style={{ height: treeHeight + HEADER_H }}
    >
      <div className="h-9 flex items-center justify-center">
        <span
          className={`px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
            isFinale
              ? "bg-[#4a7ef5]/20 text-[#4a7ef5] border border-[#4a7ef5]/30"
              : "bg-[#1e2840] text-[#6b7a9e] border border-[#2a3a5a]"
          }`}
        >
          <span className="sm:hidden">{short}</span>
          <span className="hidden sm:inline">{label}</span>
        </span>
      </div>
      <div className="relative w-full" style={{ height: treeHeight }}>
        {phaseType === "seizieme" &&
          BRACKET_R32_PAIRS.map((pair) => {
            const bounds = getPairBandBounds(pair.feeders, positions, slotPx);
            if (!bounds) return null;
            const pairActive =
              related !== null &&
              (related.has(pair.parent) ||
                related.has(pair.feeders[0]) ||
                related.has(pair.feeders[1]));
            return (
              <div
                key={pair.parent}
                className={`absolute inset-x-0.5 rounded-lg border transition-colors duration-150 ${
                  pairActive
                    ? "bg-[#4a7ef5]/10 border-[#4a7ef5]/30"
                    : "bg-[#161d30]/60 border-[#1e2840]/80"
                }`}
                style={{ top: bounds.top, height: bounds.height }}
              />
            );
          })}
        {roundMatches.map((m) => {
          const matchId = parseInt(m.id, 10);
          const y = positions.get(matchId);
          if (y === undefined) return null;
          const isHighlighted = related?.has(matchId) ?? false;
          const isDimmed = related !== null && !isHighlighted;
          return (
            <div
              key={m.id}
              className="absolute left-1/2 z-10"
              style={{ top: y, transform: "translate(-50%, -50%)" }}
            >
              <BracketMatchCard
                match={m}
                highlighted={isHighlighted}
                dimmed={isDimmed}
                isPinned={pinnedId === matchId}
                onHover={() => onHoverMatch(matchId)}
                onLeave={onLeaveMatch}
                onPin={() => onPinMatch(matchId)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BracketView({ matches }: BracketViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [pinnedId, setPinnedId] = useState<number | null>(null);
  const [hoverId, setHoverId] = useState<number | null>(null);
  const activeId = pinnedId ?? hoverId;

  const slotPx = useBracketSlotPx();
  const treeHeight = getBracketTreeHeight(slotPx);
  const positions = useMemo(() => computeBracketPositions(matches, slotPx), [matches, slotPx]);
  const gutterW = slotPx >= BRACKET_SLOT_PX_DESKTOP ? GUTTER_W_DESKTOP : GUTTER_W_MOBILE;

  const matchesById = useMemo(
    () => new Map(matches.map((m) => [parseInt(m.id, 10), m])),
    [matches]
  );

  const petiteFinale = matches.filter((m) => m.phase.type === "petite_finale");

  const roundsData = useMemo(
    () =>
      KNOCKOUT_ROUNDS.map((round) => ({
        ...round,
        matches: sortMatchesByBracketY(matchesForRound(matches, round.type), positions),
      })).filter((r) => r.matches.length > 0),
    [matches, positions]
  );

  const scale = useBracketScale(scrollRef, innerRef, [roundsData, slotPx, treeHeight]);

  const scrollToRound = useCallback((index: number) => {
    scrollRef.current
      ?.querySelector(`[data-round="${index}"]`)
      ?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, []);

  const handlePinMatch = useCallback((id: number) => {
    setPinnedId((prev) => (prev === id ? null : id));
  }, []);

  const scaledHeight = (treeHeight + HEADER_H) * scale;

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 shrink-0">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1 min-w-0">
          {KNOCKOUT_ROUNDS.map((round, i) => {
            const count = matchesForRound(matches, round.type).length;
            if (count === 0) return null;
            return (
              <button
                key={round.type}
                type="button"
                onClick={() => scrollToRound(i)}
                className="shrink-0 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold
                  bg-[#131929] border border-[#1e2840] text-[#6b7a9e]
                  hover:border-[#4a7ef5]/50 hover:text-[#4a7ef5] transition-colors"
              >
                {round.short}
                <span className="ml-1.5 text-[#4a5a7a] font-normal">{count}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[9px] text-[#4a5a7a] shrink-0 hidden sm:block">
          Survolez un match pour voir son chemin
        </p>
      </div>

      <div className="relative flex-1 min-h-0">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 z-10 bg-gradient-to-r from-[#0b0f1a] to-transparent sm:hidden" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 z-10 bg-gradient-to-l from-[#0b0f1a] to-transparent sm:hidden" />

        <div
          ref={scrollRef}
          className="h-full overflow-x-auto overflow-y-auto overscroll-x-contain touch-pan-x snap-x snap-mandatory pb-2 px-2"
          style={{ maxHeight: `calc(100dvh - 11rem)` }}
        >
          <div className="flex justify-center w-full min-h-0" style={{ minHeight: scaledHeight }}>
            <div
              ref={innerRef}
              className="flex items-start min-w-max py-1"
              style={{
                transform: scale !== 1 ? `scale(${scale})` : undefined,
                transformOrigin: "top center",
              }}
            >
              {roundsData.map((round, roundIndex) => (
                <div key={round.type} data-round={roundIndex} className="flex items-start">
                  {roundIndex > 0 && (
                    <BracketTConnector
                      childMatches={round.matches}
                      positions={positions}
                      treeHeight={treeHeight}
                      gutterW={gutterW}
                      activeId={activeId}
                      matchesById={matchesById}
                    />
                  )}
                  <RoundColumn
                    roundMatches={round.matches}
                    positions={positions}
                    treeHeight={treeHeight}
                    label={round.label}
                    short={round.short}
                    phaseType={round.type}
                    isFinale={round.type === "finale"}
                    activeId={activeId}
                    pinnedId={pinnedId}
                    onHoverMatch={setHoverId}
                    onLeaveMatch={() => setHoverId(null)}
                    onPinMatch={handlePinMatch}
                    slotPx={slotPx}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {petiteFinale.length > 0 && (
        <div className="shrink-0 flex flex-col items-center gap-2 pt-3 border-t border-[#1e2840]">
          <span className="text-[10px] font-semibold text-[#6b7a9e] uppercase tracking-wider">
            3e place
          </span>
          <div className="flex gap-3 flex-wrap justify-center">
            {petiteFinale.map((m) => (
              <BracketMatchCard key={m.id} match={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
