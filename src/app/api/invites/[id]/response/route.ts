import { NextResponse } from "next/server";
import { notifyAskerOfYes } from "@/lib/notify";
import { responseSchema, toPublicInvite } from "@/lib/schemas";
import { saveResponse } from "@/lib/store";

function baseUrlFrom(req: Request) {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  const proto = req.headers.get("x-forwarded-proto") ?? new URL(req.url).protocol.replace(":", "");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? new URL(req.url).host;
  return `${proto}://${host}`;
}

export async function POST(
  req: Request,
  ctx: RouteContext<"/api/invites/[id]/response">,
) {
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = responseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Something's missing" },
      { status: 400 },
    );
  }

  const result = await saveResponse(id, parsed.data);
  if ("error" in result) {
    const status = result.error === "not_found" ? 404 : 409;
    const message =
      result.error === "not_found"
        ? "Invitation not found"
        : "This invitation was already answered";
    return NextResponse.json({ error: message }, { status });
  }

  // Awaited on purpose: serverless hosts freeze the function once the response is sent.
  await notifyAskerOfYes(result, baseUrlFrom(req));

  return NextResponse.json(toPublicInvite(result));
}
