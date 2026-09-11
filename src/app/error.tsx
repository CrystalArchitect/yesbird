"use client";

import Link from "next/link";
import { useEffect } from "react";
import { SiteHeader } from "@/components/brand";
import { Mascot } from "@/components/mascots";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 pb-24 text-center">
        <Mascot kind="bear" mood="cry" className="h-40 w-40" />
        <h1 className="mt-4 font-display text-3xl font-semibold">Something tripped over its own paws</h1>
        <p className="mt-2 text-muted-foreground">
          Nothing you did. Give it another go, and if it keeps happening, the bear would like to apologize in person.
        </p>
        <div className="mt-6 flex gap-2">
          <Button className="rounded-full" onClick={reset}>
            Try again
          </Button>
          <Button variant="outline" className="rounded-full" nativeButton={false} render={<Link href="/" />}>
            Back home
          </Button>
        </div>
      </main>
    </>
  );
}
