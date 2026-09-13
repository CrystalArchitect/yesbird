import { NextRequest, NextResponse } from "next/server";
import { CreatePitchSchema } from "@/lib/pitch-schemas";
import { createPitch, listPitches, getOutlet } from "@/lib/pitch-store";
import { sendPitch } from "@/lib/notify";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = CreatePitchSchema.parse(body);

    const pitch = await createPitch(input);

    // Auto-send if requested
    if (body.autoSend && pitch.status === "sent") {
      const outlet = await getOutlet(pitch.outletId);
      if (outlet) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
        await sendPitch(pitch, outlet, baseUrl);
      }
    }

    return NextResponse.json({ pitch }, { status: 201 });
  } catch (err) {
    console.error("[pitches POST]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create pitch" },
      { status: 400 },
    );
  }
}

export async function GET() {
  try {
    const pitches = await listPitches();
    return NextResponse.json({ pitches });
  } catch (err) {
    console.error("[pitches GET]", err);
    return NextResponse.json(
      { error: "Failed to list pitches" },
      { status: 500 },
    );
  }
}
