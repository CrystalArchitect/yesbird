import { NextResponse } from "next/server";
import { responseSchema, toPublicInvite } from "@/lib/schemas";
import { saveResponse } from "@/lib/store";

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

  return NextResponse.json(toPublicInvite(result));
}
