import { NextRequest, NextResponse } from "next/server";
import { getOutlet, updateOutlet } from "@/lib/pitch-store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const outlet = await getOutlet(id);

    if (!outlet) {
      return NextResponse.json({ error: "Outlet not found" }, { status: 404 });
    }

    return NextResponse.json({ outlet });
  } catch (err) {
    console.error("[outlet GET]", err);
    return NextResponse.json({ error: "Failed to fetch outlet" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await updateOutlet(id, body);

    if (!updated) {
      return NextResponse.json({ error: "Outlet not found" }, { status: 404 });
    }

    return NextResponse.json({ outlet: updated });
  } catch (err) {
    console.error("[outlet PATCH]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update outlet" },
      { status: 400 },
    );
  }
}
