import Link from "next/link";
import { SiteHeader } from "@/components/brand";
import { LandingDemo } from "@/components/landing-demo";
import { Mascot } from "@/components/mascots";
import { Petals } from "@/components/petals";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    n: "01",
    title: "Write the ask",
    body: "Their name, your name, a sweet line, and the days you're free. Pick a mascot to do the asking.",
    emoji: "💌",
  },
  {
    n: "02",
    title: "Send one link",
    body: "Text it, DM it, slide it under a door. They open a little letter and get asked, properly.",
    emoji: "🔗",
  },
  {
    n: "03",
    title: "They say yes",
    body: "The No button runs away. When they say yes, they pick a time, their cravings, and how to reach them.",
    emoji: "💗",
  },
];

const SHARED = [
  { emoji: "🗓️", label: "A time that works", body: "Chosen from the days and hours you offered." },
  { emoji: "🍜", label: "What they're craving", body: "Cuisines, a place they've wanted to try, dietary notes." },
  { emoji: "🎬", label: "Little things they love", body: "So you can plan the after-dinner part too." },
  { emoji: "📱", label: "Their number", body: "Plus how they'd like you to reach out. Text, call, DM." },
];

export default function HomePage() {
  return (
    <>
      <Petals />
      <SiteHeader
        right={
          <Button className="rounded-full" nativeButton={false} render={<Link href="/create" />}>
            Make an invitation
          </Button>
        }
      />

      <main className="mx-auto w-full max-w-5xl px-5 pb-24">
        <section className="grid items-center gap-10 py-10 *:min-w-0 md:grid-cols-[1.1fr_0.9fr] md:py-16">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3.5 py-1.5 text-sm font-semibold text-primary ring-1 ring-primary/15">
              <span aria-hidden>🐦</span> For hopeless romantics with shaky hands
            </span>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] text-balance sm:text-5xl lg:text-6xl">
              Ask them out. <br />
              <span className="text-primary">Let them say yes.</span>
            </h1>
            <p className="max-w-lg text-lg text-muted-foreground text-balance">
              Yesbird turns “so… are you free sometime?” into a tiny, adorable invitation. Send one link.
              They pick a time, tell you what they love, and leave their number. The No button? Decorative.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" className="h-12 rounded-full px-7 text-base" nativeButton={false} render={<Link href="/create" />}>
                Make an invitation
              </Button>
              <span className="text-sm text-muted-foreground">Free · no account · takes 2 minutes</span>
            </div>
          </div>

          <div className="relative mx-auto flex h-60 w-full max-w-sm items-end justify-center overflow-hidden sm:h-80">
            <div className="absolute inset-x-8 bottom-6 h-40 rounded-[3rem] bg-gradient-to-t from-blush to-transparent blur-2xl" />
            <div className="relative -mr-6 mb-2 animate-float [animation-delay:-1s] sm:-mr-8">
              <Mascot kind="bear" mood="shy" className="h-28 w-28 sm:h-44 sm:w-44" />
            </div>
            <div className="relative z-10 animate-float">
              <Mascot kind="bunny" mood="love" className="h-36 w-36 sm:h-56 sm:w-56" />
            </div>
            <div className="relative -ml-6 mb-4 animate-float [animation-delay:-2s] sm:-ml-8">
              <Mascot kind="lovebirds" mood="happy" className="h-28 w-28 sm:h-44 sm:w-44" />
            </div>
          </div>
        </section>

        <section className="py-12" aria-labelledby="how">
          <h2 id="how" className="mb-8 text-center font-display text-3xl font-semibold">
            How it works
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="card-cute p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-3xl" aria-hidden>
                    {s.emoji}
                  </span>
                  <span className="font-display text-sm font-semibold text-primary/70">{s.n}</span>
                </div>
                <h3 className="font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12" aria-labelledby="demo">
          <div className="mb-8 text-center">
            <h2 id="demo" className="font-display text-3xl font-semibold">
              The No button, demonstrated
            </h2>
            <p className="mt-2 text-muted-foreground">It gets shy. Then it gets small. Then it gives up.</p>
          </div>
          <LandingDemo />
        </section>

        <section className="py-12" aria-labelledby="shared">
          <div className="card-cute grid gap-8 p-8 md:grid-cols-[0.8fr_1.2fr] md:p-10">
            <div>
              <h2 id="shared" className="font-display text-3xl font-semibold text-balance">
                Everything you need to plan the actual date
              </h2>
              <p className="mt-3 text-muted-foreground">
                After the yes, they answer four cute questions. You get it all on a private page only you can see.
              </p>
              <Button className="mt-6 rounded-full" nativeButton={false} render={<Link href="/create" />}>
                Start yours
              </Button>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {SHARED.map((s) => (
                <li key={s.label} className="rounded-3xl bg-blush/40 p-4">
                  <div className="text-2xl" aria-hidden>
                    {s.emoji}
                  </div>
                  <div className="mt-2 font-display font-semibold">{s.label}</div>
                  <p className="text-sm text-muted-foreground">{s.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-5xl px-5 pb-10 text-center text-sm text-muted-foreground">
        Made with a lot of blushing. Be kind, be brave, bring flowers.
      </footer>
    </>
  );
}
