import { NextRequest, NextResponse } from "next/server";
import { getPitch, updatePitch } from "@/lib/pitch-store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const pitch = await getPitch(id);

    if (!pitch) {
      return NextResponse.json({ error: "Pitch not found" }, { status: 404 });
    }

    return NextResponse.json({ pitch });
  } catch (err) {
    console.error("[pitch GET]", err);
    return NextResponse.json({ error: "Failed to fetch pitch" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await updatePitch(id, body);

    if (!updated) {
      return NextResponse.json({ error: "Pitch not found" }, { status: 404 });
    }

    return NextResponse.json({ pitch: updated });
  } catch (err) {
    console.error("[pitch PATCH]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update pitch" },
      { status: 400 },
    );
  }
}
