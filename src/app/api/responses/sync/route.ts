import { NextRequest, NextResponse } from "next/server";
import { gmailService } from "@/lib/gmail-service";
import { getPitch, updatePitch, listPitches } from "@/lib/pitch-store";

export const runtime = "nodejs";

/**
 * POST /api/responses/sync
 * Manually trigger a sync of all pitch responses from Gmail.
 * Requires GMAIL_API_KEY or GMAIL_ACCESS_TOKEN environment variable.
 */
export async function POST(req: NextRequest) {
  try {
    // Optional: accept query params for filtering
    const { searchParams } = new URL(req.url);
    const pitchId = searchParams.get("pitchId");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // Fetch pitches to sync
    let pitches = [];
    if (pitchId) {
      const pitch = await getPitch(pitchId);
      if (pitch) pitches.push(pitch);
    } else {
      // Sync all sent pitches without responses
      const allPitches = await listPitches();
      pitches = allPitches
        .filter((p) => p.status === "sent" || p.status === "no_response")
        .slice(0, limit);
    }

    if (pitches.length === 0) {
      return NextResponse.json({
        message: "No pitches to sync",
        synced: 0,
        updated: 0,
      });
    }

    let synced = 0;
    let updated = 0;
    const results = [];

    for (const pitch of pitches) {
      try {
        const responses = await gmailService.syncPitchResponses(
          pitch.contactEmail,
          pitch.subject,
          pitch.sentAt
        );

        if (responses.length > 0) {
          // Map Gmail responses to pitch responses
          const newResponses = responses.map((r) => ({
            receivedAt: r.receivedAt,
            type: r.isAutoReply ? ("auto_reply" as const) : ("gmail_thread" as const),
            content: r.content.substring(0, 1000), // Limit content length
            responder: r.from,
            sentiment: undefined, // Could add AI sentiment analysis here
          }));

          // Update pitch with new responses
          const updatedPitch = {
            ...pitch,
            responses: [...(pitch.responses || []), ...newResponses],
            status: responses.length > 0 ? "responded" as const : pitch.status,
            updatedAt: new Date(),
          };

          await updatePitch(pitch.id, updatedPitch);
          updated++;

          results.push({
            pitchId: pitch.id,
            contactEmail: pitch.contactEmail,
            responsesFound: responses.length,
          });
        }

        synced++;
      } catch (err) {
        console.error(`Failed to sync pitch ${pitch.id}:`, err);
        results.push({
          pitchId: pitch.id,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return NextResponse.json(
      {
        message: "Response sync complete",
        synced,
        updated,
        results,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[responses/sync POST]", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to sync responses",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/responses/sync?pitchId=<id>
 * Get sync status for a specific pitch.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pitchId = searchParams.get("pitchId");

    if (!pitchId) {
      return NextResponse.json(
        { error: "pitchId query parameter required" },
        { status: 400 }
      );
    }

    const pitch = await getPitch(pitchId);
    if (!pitch) {
      return NextResponse.json({ error: "Pitch not found" }, { status: 404 });
    }

    return NextResponse.json({
      pitchId: pitch.id,
      status: pitch.status,
      sentAt: pitch.sentAt,
      responses: pitch.responses || [],
      responseCount: (pitch.responses || []).length,
    });
  } catch (err) {
    console.error("[responses/sync GET]", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to get sync status",
      },
      { status: 500 }
    );
  }
}
