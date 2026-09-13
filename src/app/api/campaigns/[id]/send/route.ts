import { NextRequest, NextResponse } from "next/server";
import { getCampaign, updateCampaign } from "@/lib/campaign-store";
import { sendCampaign } from "@/lib/notify";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const campaign = await getCampaign(id);

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.sentAt) {
      return NextResponse.json(
        { error: "Campaign has already been sent" },
        { status: 409 },
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const result = await sendCampaign(campaign, baseUrl);

    // Update campaign with send timestamp and initial stats
    const updated = await updateCampaign(id, {
      sentAt: new Date(),
      stats: {
        ...campaign.stats,
        totalSent: result.sent,
      },
    });

    return NextResponse.json({
      campaign: updated,
      result,
    });
  } catch (err) {
    console.error("[campaign send]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send campaign" },
      { status: 500 },
    );
  }
}
