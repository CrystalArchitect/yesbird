import { NextRequest, NextResponse } from "next/server";
import { CreateCampaignSchema } from "@/lib/campaign-schemas";
import { createCampaign, listCampaigns } from "@/lib/campaign-store";
import { sendCampaign } from "@/lib/notify";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = CreateCampaignSchema.parse(body);

    const campaign = await createCampaign(input);

    // Auto-send if requested
    if (body.autoSend) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
      const result = await sendCampaign(campaign, baseUrl);
      return NextResponse.json({ campaign, sendResult: result }, { status: 201 });
    }

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (err) {
    console.error("[campaigns POST]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create campaign" },
      { status: 400 },
    );
  }
}

export async function GET() {
  try {
    const campaigns = await listCampaigns();
    return NextResponse.json({ campaigns });
  } catch (err) {
    console.error("[campaigns GET]", err);
    return NextResponse.json(
      { error: "Failed to list campaigns" },
      { status: 500 },
    );
  }
}
