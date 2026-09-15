import { NextRequest, NextResponse } from "next/server";
import { listPitches } from "@/lib/pitch-store";

export const runtime = "nodejs";

interface ResponseAnalytics {
  totalPitches: number;
  pitchesSent: number;
  pitchesResponded: number;
  pitchesBounced: number;
  pitchesNoResponse: number;
  responsRate: number;
  autoRepliesCount: number;
  manualRepliesCount: number;
  avgResponseTimeMs: number;
  responsesByOutlet: Record<
    string,
    {
      name: string;
      totalPitches: number;
      responsesCount: number;
      responseRate: number;
    }
  >;
  responseDistribution: {
    byDay: Record<string, number>;
    byHour: Record<number, number>;
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const outletId = searchParams.get("outletId");
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    const allPitches = await listPitches();

    // Filter by date range if provided
    let pitches = allPitches;
    if (fromDate || toDate) {
      const from = fromDate ? new Date(fromDate) : new Date("2000-01-01");
      const to = toDate ? new Date(toDate) : new Date();

      pitches = pitches.filter((p) => {
        const createdAt = new Date(p.createdAt);
        return createdAt >= from && createdAt <= to;
      });
    }

    // Filter by outlet if provided
    if (outletId) {
      pitches = pitches.filter((p) => p.outletId === outletId);
    }

    // Calculate analytics
    const analytics = calculateAnalytics(pitches);

    return NextResponse.json(analytics);
  } catch (err) {
    console.error("[responses/analytics GET]", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to calculate analytics",
      },
      { status: 500 }
    );
  }
}

function calculateAnalytics(pitches: any[]): ResponseAnalytics {
  const totalPitches = pitches.length;
  const pitchesSent = pitches.filter((p) => p.status !== "draft").length;
  const pitchesResponded = pitches.filter((p) => p.status === "responded").length;
  const pitchesBounced = pitches.filter((p) => p.status === "bounced").length;
  const pitchesNoResponse = pitches.filter((p) => p.status === "no_response").length;

  const responsRate = pitchesSent > 0 ? (pitchesResponded / pitchesSent) * 100 : 0;

  // Count response types
  let autoRepliesCount = 0;
  let manualRepliesCount = 0;
  let totalResponseTimeMs = 0;
  let responseCount = 0;

  for (const pitch of pitches) {
    if (pitch.responses && Array.isArray(pitch.responses)) {
      for (const response of pitch.responses) {
        if (response.type === "auto_reply") {
          autoRepliesCount++;
        } else if (response.type === "gmail_thread" || response.type === "manual") {
          manualRepliesCount++;
        }

        // Calculate response time
        if (pitch.sentAt && response.receivedAt) {
          const sentTime = new Date(pitch.sentAt).getTime();
          const receivedTime = new Date(response.receivedAt).getTime();
          totalResponseTimeMs += receivedTime - sentTime;
          responseCount++;
        }
      }
    }
  }

  const avgResponseTimeMs =
    responseCount > 0 ? Math.round(totalResponseTimeMs / responseCount) : 0;

  // Response analytics by outlet
  const responsesByOutlet: Record<string, any> = {};

  for (const pitch of pitches) {
    if (!responsesByOutlet[pitch.outletId]) {
      responsesByOutlet[pitch.outletId] = {
        name: pitch.outletId, // In real app, would fetch outlet name
        totalPitches: 0,
        responsesCount: 0,
        responseRate: 0,
      };
    }

    responsesByOutlet[pitch.outletId].totalPitches++;
    if (
      pitch.responses &&
      Array.isArray(pitch.responses) &&
      pitch.responses.length > 0
    ) {
      responsesByOutlet[pitch.outletId].responsesCount++;
    }
  }

  // Calculate outlet response rates
  for (const outletId in responsesByOutlet) {
    const outlet = responsesByOutlet[outletId];
    outlet.responseRate =
      outlet.totalPitches > 0
        ? (outlet.responsesCount / outlet.totalPitches) * 100
        : 0;
  }

  // Response distribution by time
  const responsesByDay: Record<string, number> = {};
  const responsesByHour: Record<number, number> = {};

  for (const pitch of pitches) {
    if (pitch.responses && Array.isArray(pitch.responses)) {
      for (const response of pitch.responses) {
        if (response.receivedAt) {
          const date = new Date(response.receivedAt);
          const dayKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
          const hour = date.getHours();

          responsesByDay[dayKey] = (responsesByDay[dayKey] || 0) + 1;
          responsesByHour[hour] = (responsesByHour[hour] || 0) + 1;
        }
      }
    }
  }

  return {
    totalPitches,
    pitchesSent,
    pitchesResponded,
    pitchesBounced,
    pitchesNoResponse,
    responsRate: Math.round(responsRate * 100) / 100,
    autoRepliesCount,
    manualRepliesCount,
    avgResponseTimeMs,
    responsesByOutlet,
    responseDistribution: {
      byDay: responsesByDay,
      byHour: responsesByHour,
    },
  };
}
