import type { Metadata } from "next";
import { SiteHeader } from "@/components/brand";
import { CreateForm } from "@/components/create-form";
import { Petals } from "@/components/petals";
import { TipJar } from "@/components/tip-jar";

export const metadata: Metadata = {
  title: "Make an invitation",
};

export default function CreatePage() {
  return (
    <>
      <Petals count={10} />
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-5 pb-24">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-semibold text-balance">Let&apos;s write your ask</h1>
          <p className="mt-2 text-muted-foreground">
            Four little steps. No account. Takes about two minutes, plus however long you stare at the message box.
          </p>
        </div>
        <TipJar className="mb-6 animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-700 [animation-delay:400ms]" />
        <CreateForm />
      </main>
    </>
  );
}
