import { OG_SIZE, renderOgCard } from "@/lib/og";
import { getInvite } from "@/lib/store";

export const alt = "A letter for you";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invite = await getInvite(id);
  if (!invite) {
    return renderOgCard({
      eyebrow: "Yesbird",
      title: "This letter got lost.",
      subtitle: "Ask for a fresh link.",
    });
  }
  return renderOgCard({
    eyebrow: "A letter arrived",
    title: `For ${invite.recipientName}`,
    subtitle: `${invite.senderName} made you something. Tap to open it.`,
  });
}
