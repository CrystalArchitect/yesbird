import { NextResponse } from "next/server";
import { getInviteByManageKey } from "@/lib/store";

export async function GET(_req: Request, ctx: RouteContext<"/api/nest/[key]">) {
  const { key } = await ctx.params;
  const invite = await getInviteByManageKey(key);
  if (!invite) {
    return NextResponse.json({ error: "Nest not found" }, { status: 404 });
  }
  return NextResponse.json(invite, {
    headers: { "Cache-Control": "no-store" },
  });
}
