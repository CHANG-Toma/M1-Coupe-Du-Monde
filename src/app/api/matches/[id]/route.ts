import { NextRequest, NextResponse } from "next/server";
import { getMatchById } from "@/lib/api/match-service";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const match = await getMatchById(id);

    if (!match) {
      return NextResponse.json({ error: "Match introuvable." }, { status: 404 });
    }

    return NextResponse.json({ data: match });
  } catch (error) {
    console.error("[API /matches/[id]]", error);
    return NextResponse.json(
      { error: "Impossible de charger le match." },
      { status: 500 }
    );
  }
}
