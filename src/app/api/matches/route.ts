import { NextRequest, NextResponse } from "next/server";
import { getMatches, isUsingMockData } from "@/lib/api/match-service";
import type { TypePhase } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const phase = searchParams.get("phase") as TypePhase | null;
    const equipeId = searchParams.get("equipeId") ?? undefined;
    const live = searchParams.get("live") === "true";

    const matches = await getMatches({
      phase: phase ?? undefined,
      equipeId,
      live: live || undefined,
    });

    return NextResponse.json({
      data: matches,
      total: matches.length,
      source: isUsingMockData() ? "mock" : "api",
    });
  } catch (error) {
    console.error("[API /matches]", error);
    return NextResponse.json(
      { error: "Impossible de charger les matchs." },
      { status: 500 }
    );
  }
}
