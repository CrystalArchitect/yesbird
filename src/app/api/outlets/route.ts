import { NextRequest, NextResponse } from "next/server";
import { CreateOutletSchema } from "@/lib/pitch-schemas";
import { createOutlet, listOutlets } from "@/lib/pitch-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = CreateOutletSchema.parse(body);

    const outlet = await createOutlet(input);
    return NextResponse.json({ outlet }, { status: 201 });
  } catch (err) {
    console.error("[outlets POST]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create outlet" },
      { status: 400 },
    );
  }
}

export async function GET() {
  try {
    const outlets = await listOutlets();
    return NextResponse.json({ outlets });
  } catch (err) {
    console.error("[outlets GET]", err);
    return NextResponse.json(
      { error: "Failed to list outlets" },
      { status: 500 },
    );
  }
}
