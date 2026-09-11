import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InviteExperience } from "@/components/invite/invite-experience";
import { toPublicInvite } from "@/lib/schemas";
import { getInvite } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/to/[id]">): Promise<Metadata> {
  const { id } = await params;
  const invite = await getInvite(id);
  if (!invite) return { title: "Letter not found", robots: { index: false } };
  const title = `A letter for ${invite.recipientName} 💌`;
  const description = `${invite.senderName} made you something. Tap to open it.`;
  return {
    title: { absolute: title },
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function InvitePage({ params, searchParams }: PageProps<"/to/[id]">) {
  const { id } = await params;
  const { preview } = await searchParams;
  const invite = await getInvite(id);
  if (!invite) notFound();
  return <InviteExperience invite={toPublicInvite(invite)} preview={preview === "1"} />;
}
