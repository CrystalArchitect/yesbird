import { NextResponse } from "next/server";
import { createInviteSchema } from "@/lib/schemas";
import { createInvite } from "@/lib/store";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createInviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid invitation" },
      { status: 400 },
    );
  }

  const { invite, manageKey } = await createInvite(parsed.data);
  return NextResponse.json({ id: invite.id, manageKey }, { status: 201 });
}
