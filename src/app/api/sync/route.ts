import { NextRequest, NextResponse } from "next/server";
import { getSyncStatus, maybeTriggerSync, runCatalogSync } from "@/lib/sync/sync-scheduler";
import { canRunCatalogSync, SYNC_ADVISORY_LOCK_KEY } from "@/lib/sync/sync-config";
import {
  isDbAvailable,
  tryAdvisoryLock,
  releaseAdvisoryLock,
} from "@/lib/db/client";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.SYNC_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV !== "production";
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

/** GET — état de la dernière synchronisation */
export async function GET() {
  try {
    if (!(await isDbAvailable())) {
      return NextResponse.json(
        { error: "Base de données indisponible." },
        { status: 503 }
      );
    }
    const status = await getSyncStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error("[API /sync GET]", error);
    return NextResponse.json({ error: "Impossible de lire le statut sync." }, { status: 500 });
  }
}

/** POST — force une synchronisation API → BDD (cron ou manuel) */
export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  if (!canRunCatalogSync()) {
    return NextResponse.json(
      { error: "Sync impossible : DATABASE_URL ou USE_MOCK_DATA manquant." },
      { status: 400 }
    );
  }

  if (!(await isDbAvailable())) {
    return NextResponse.json(
      { error: "Base de données indisponible." },
      { status: 503 }
    );
  }

  const locked = await tryAdvisoryLock(SYNC_ADVISORY_LOCK_KEY);
  if (!locked) {
    return NextResponse.json(
      { message: "Synchronisation déjà en cours." },
      { status: 409 }
    );
  }

  try {
    const result = await runCatalogSync();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[API /sync POST]", error);
    return NextResponse.json(
      { error: (error as Error).message ?? "Échec de la synchronisation." },
      { status: 500 }
    );
  } finally {
    await releaseAdvisoryLock(SYNC_ADVISORY_LOCK_KEY);
  }
}

/** PATCH — synchronise si les données sont périmées */
export async function PATCH(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  await maybeTriggerSync(false);
  const status = await getSyncStatus();
  return NextResponse.json({ ok: true, ...status });
}
