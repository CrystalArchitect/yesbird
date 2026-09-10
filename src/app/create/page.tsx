import type { Metadata } from "next";
import { SiteHeader } from "@/components/brand";
import { CreateForm } from "@/components/create-form";
import { Petals } from "@/components/petals";

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
        <CreateForm />
      </main>
    </>
  );
}
