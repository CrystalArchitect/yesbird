export default function Loading() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 text-center" aria-busy>
      <span className="animate-heartbeat text-5xl" aria-hidden>
        💗
      </span>
      <p className="text-sm font-semibold text-muted-foreground">Fluffing the pillows…</p>
    </main>
  );
}
