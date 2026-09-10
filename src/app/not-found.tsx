import Link from "next/link";
import { SiteHeader } from "@/components/brand";
import { Mascot } from "@/components/mascots";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 pb-24 text-center">
        <Mascot kind="bunny" mood="sad" className="h-40 w-40" />
        <h1 className="mt-4 font-display text-3xl font-semibold">This letter got lost in the mail</h1>
        <p className="mt-2 text-muted-foreground">
          The link might be missing a character, or the invitation was never sealed. The bunny is very sorry.
        </p>
        <Button className="mt-6 rounded-full" render={<Link href="/" />}>
          Back home
        </Button>
      </main>
    </>
  );
}
