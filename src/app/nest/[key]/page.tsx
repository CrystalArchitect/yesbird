import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/brand";
import { NestView } from "@/components/nest-view";
import { Petals } from "@/components/petals";
import { TipJar } from "@/components/tip-jar";
import { Button } from "@/components/ui/button";
import { getInviteByManageKey } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your nest",
  robots: { index: false, follow: false },
};

export default async function NestPage({ params, searchParams }: PageProps<"/nest/[key]">) {
  const { key } = await params;
  const { fresh } = await searchParams;
  const invite = await getInviteByManageKey(key);
  if (!invite) notFound();

  return (
    <>
      <Petals count={10} />
      <SiteHeader
        right={
          <Button variant="outline" className="rounded-full" nativeButton={false} render={<Link href="/create" />}>
            Ask someone else
          </Button>
        }
      />
      <main className="mx-auto w-full max-w-3xl px-5 pb-24">
        <NestView initial={invite} manageKey={key} fresh={fresh === "1"} />
        <TipJar context="nest" className="mt-8" />
      </main>
    </>
  );
}
