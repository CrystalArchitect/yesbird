import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InviteExperience } from "@/components/invite/invite-experience";
import { toPublicInvite } from "@/lib/schemas";
import { getInvite } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/to/[id]">): Promise<Metadata> {
  const { id } = await params;
  const invite = await getInvite(id);
  if (!invite) return { title: "Letter not found" };
  return {
    title: `A letter for ${invite.recipientName}`,
    description: `${invite.senderName} has a question for you. Open it, if you dare.`,
  };
}

export default async function InvitePage({ params }: PageProps<"/to/[id]">) {
  const { id } = await params;
  const invite = await getInvite(id);
  if (!invite) notFound();
  return <InviteExperience invite={toPublicInvite(invite)} />;
}
