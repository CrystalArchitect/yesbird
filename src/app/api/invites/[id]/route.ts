import { NextResponse } from "next/server";
import { toPublicInvite } from "@/lib/schemas";
import { getInvite } from "@/lib/store";

export async function GET(_req: Request, ctx: RouteContext<"/api/invites/[id]">) {
  const { id } = await ctx.params;
  const invite = await getInvite(id);
  if (!invite) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }
  return NextResponse.json(toPublicInvite(invite));
}
