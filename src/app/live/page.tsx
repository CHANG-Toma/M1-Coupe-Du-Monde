"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import type { Match } from "@/lib/types";
import { usePolling } from "@/hooks/usePolling";
import { formatHeure, formatDateCourte } from "@/lib/utils/date";
import { POLL_INTERVAL_MS } from "@/lib/config";

function getFlagEmoji(code: string) {
  const c = code.toLowerCase().replace("gb-eng", "gb");
  try {
    return String.fromCodePoint(...c.split("").map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 97));
  } catch { return "🏳"; }
}

// ─── Carte match en direct ────────────────────────────────────────────────────

function LiveCard({ match, fresh }: { match: Match; fresh: boolean }) {
  const scoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fresh && scoreRef.current) {
      scoreRef.current.classList.remove("animate-score-pop");
      void scoreRef.current.offsetWidth; // reflow
      scoreRef.current.classList.add("animate-score-pop");
    }
  }, [match.scoreDomicile, match.scoreExterieur, fresh]);

  return (
    <Link href={`/matches/${match.id}`}>
      <article className="animate-glow-live rounded-2xl border border-[#00e676]/30 bg-[#0d1f14] overflow-hidden hover:border-[#00e676]/60 transition-colors group cursor-pointer">
        {/* Barre supérieure */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#00e676]/10">
          <span className="text-[11px] text-[#00e676]/70 font-medium tracking-wide uppercase">
            {match.groupe ? `Groupe ${match.groupe.lettre}` : match.phase.nom}
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-[#00e676] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
            {match.minuteJeu ? `${match.minuteJeu}'` : "En cours"}
          </span>
        </div>

        {/* Score central */}
        <div className="px-5 py-6 flex items-center justify-between gap-4">
          {/* Équipe domicile */}
          <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
            <span className="text-4xl">{getFlagEmoji(match.equipeDomicile.codePays)}</span>
            <span className="text-sm font-semibold text-white/90 text-center leading-tight">
              {match.equipeDomicile.nom}
            </span>
          </div>

          {/* Score */}
          <div ref={scoreRef} className="flex items-center gap-4 shrink-0 px-4">
            <span className="text-5xl font-black text-[#00e676] tabular-nums leading-none">
              {match.scoreDomicile}
            </span>
            <span className="text-2xl text-[#1e3a28] font-bold">–</span>
            <span className="text-5xl font-black text-[#00e676] tabular-nums leading-none">
              {match.scoreExterieur}
            </span>
          </div>

          {/* Équipe extérieur */}
          <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
            <span className="text-4xl">{getFlagEmoji(match.equipeExterieur.codePays)}</span>
            <span className="text-sm font-semibold text-white/90 text-center leading-tight">
              {match.equipeExterieur.nom}
            </span>
          </div>
        </div>

        {/* Stade */}
        {match.stade && (
          <div className="px-4 pb-3 text-center text-[11px] text-[#4a5a7a]">
            {match.stade.nom} · {match.stade.ville}
          </div>
        )}
      </article>
    </Link>
  );
}

// ─── Carte match à venir (compact) ───────────────────────────────────────────

function UpcomingRow({ match }: { match: Match }) {
  return (
    <Link href={`/matches/${match.id}`}>
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#131929] border border-[#1e2840] hover:border-[#2a3a5a] transition-colors group animate-fade-up">
        <span className="text-lg">{getFlagEmoji(match.equipeDomicile.codePays)}</span>
        <span className="flex-1 text-sm text-white/80 group-hover:text-white truncate">
          {match.equipeDomicile.nom}
        </span>
        <div className="flex flex-col items-center shrink-0">
          <span className="text-sm font-semibold text-white tabular-nums">{formatHeure(match.dateHeure)}</span>
          <span className="text-[11px] text-[#4a5a7a]">{formatDateCourte(match.dateHeure)}</span>
        </div>
        <span className="flex-1 text-sm text-white/80 group-hover:text-white truncate text-right">
          {match.equipeExterieur.nom}
        </span>
        <span className="text-lg">{getFlagEmoji(match.equipeExterieur.codePays)}</span>
      </div>
    </Link>
  );
}

// ─── Indicateur de refresh ────────────────────────────────────────────────────

function RefreshBar({ countdown }: { countdown: number }) {
  const pct = (countdown / (POLL_INTERVAL_MS / 1000)) * 100;
  return (
    <div className="h-0.5 w-full bg-[#1e2840] rounded-full overflow-hidden">
      <div
        className="h-full bg-[#00e676]/50 rounded-full transition-all duration-1000 ease-linear"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function LivePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(POLL_INTERVAL_MS / 1000);
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set());

  const fetchAll = useCallback(async () => {
    try {
      const res = await fetch("/api/matches");
      const json = await res.json();
      const next: Match[] = json.data ?? [];

      // Détecte les scores changés pour l'animation pop
      setMatches((prev) => {
        const changed = new Set<string>();
        next.forEach((m) => {
          const old = prev.find((p) => p.id === m.id);
          if (
            old &&
            (old.scoreDomicile !== m.scoreDomicile ||
              old.scoreExterieur !== m.scoreExterieur)
          ) {
            changed.add(m.id);
          }
        });
        if (changed.size) setFreshIds(changed);
        return next;
      });

      setLastUpdate(new Date());
      setCountdown(POLL_INTERVAL_MS / 1000);
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Countdown visuel
  useEffect(() => {
    const t = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [lastUpdate]);

  usePolling(fetchAll, { interval: POLL_INTERVAL_MS, enabled: true, visibilityAware: true });

  const enCours = matches.filter((m) => m.statut === "en_cours");
  const aVenir  = matches.filter((m) => m.statut === "a_venir").slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* En-tête */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00e676] animate-pulse" />
            En direct
          </h1>
          {lastUpdate && (
            <span className="text-[11px] text-[#4a5a7a]">
              Mis à jour {lastUpdate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
        </div>
        <RefreshBar countdown={countdown} />
      </div>

      {/* Matchs en cours */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#1e2840] border-t-[#00e676] rounded-full animate-spin" />
        </div>
      ) : enCours.length === 0 ? (
        <div className="text-center py-16 space-y-3 animate-fade-up">
          <p className="text-[#6b7a9e] text-sm">Aucun match en cours pour le moment.</p>
          <Link href="/matches?phase=groupes" className="text-xs text-[#4a7ef5] hover:underline">
            Voir tous les matchs →
          </Link>
        </div>
      ) : (
        <div className="space-y-4 stagger">
          {enCours.map((m) => (
            <div key={m.id} className="animate-fade-up">
              <LiveCard match={m} fresh={freshIds.has(m.id)} />
            </div>
          ))}
        </div>
      )}

      {/* Prochains matchs */}
      {!loading && aVenir.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-[#6b7a9e] uppercase tracking-wider">
            Prochains matchs
          </h2>
          <div className="space-y-2 stagger">
            {aVenir.map((m) => (
              <UpcomingRow key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
