import { NextRequest, NextResponse } from "next/server";
import { getStandings, getStandingsByGroup } from "@/lib/api/standing-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const group = searchParams.get("group");

    if (group) {
      const data = await getStandingsByGroup(group.toUpperCase());
      if (!data) {
        return NextResponse.json({ error: "Groupe introuvable." }, { status: 404 });
      }
      return NextResponse.json({ data: [data] });
    }

    const data = await getStandings();
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[API /standings]", error);
    return NextResponse.json(
      { error: "Impossible de charger les classements." },
      { status: 500 }
    );
  }
}
