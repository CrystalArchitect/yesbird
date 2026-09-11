import type { Metadata, Viewport } from "next";
import { Caveat, Fredoka, Nunito } from "next/font/google";
import { MotionProvider } from "@/components/motion-provider";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Yesbird — the cutest way to ask someone out",
    template: "%s · Yesbird",
  },
  description:
    "Make a little invitation, send one link, and let them say yes. (The No button doesn't really work.)",
};

export const viewport: Viewport = {
  themeColor: "#fff5f6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${fredoka.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
