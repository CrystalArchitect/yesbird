import { OG_SIZE, renderOgCard } from "@/lib/og";

export const alt = "Yesbird — the cutest way to ask someone out";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgCard({
    eyebrow: "Yesbird",
    title: "Ask them out. Let them say yes.",
    subtitle: "A tiny invitation with a No button that runs away.",
  });
}
