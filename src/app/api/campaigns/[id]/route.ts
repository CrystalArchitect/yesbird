import { NextRequest, NextResponse } from "next/server";
import { getCampaign, updateCampaign } from "@/lib/campaign-store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const campaign = await getCampaign(id);

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ campaign });
  } catch (err) {
    console.error("[campaign GET]", err);
    return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await updateCampaign(id, body);

    if (!updated) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ campaign: updated });
  } catch (err) {
    console.error("[campaign PATCH]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update campaign" },
      { status: 400 },
    );
  }
}
