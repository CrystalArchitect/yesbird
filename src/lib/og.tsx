import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

async function fonts() {
  const dir = path.join(process.cwd(), "src", "assets", "fonts");
  const [fredoka, nunito] = await Promise.all([
    readFile(path.join(dir, "Fredoka-SemiBold.ttf")),
    readFile(path.join(dir, "Nunito-SemiBold.ttf")),
  ]);
  return [
    { name: "Fredoka", data: fredoka, weight: 600 as const, style: "normal" as const },
    { name: "Nunito", data: nunito, weight: 600 as const, style: "normal" as const },
  ];
}

function HeartIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.7 4.5 6.4 4.1c2-.2 3.9.8 5.6 2.9 1.7-2.1 3.6-3.1 5.6-2.9 3.7.4 5.5 4.3 4 7.7C19.5 16.4 12 21 12 21z"
        fill={color}
      />
    </svg>
  );
}

/** A sealed pink envelope, drawn with plain boxes so it renders identically everywhere. */
function Envelope() {
  return (
    <div style={{ display: "flex", position: "relative", width: 360, height: 250 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 34,
          background: "linear-gradient(160deg, #ffe1e9 0%, #ffcfdc 60%, #ffc3d3 100%)",
          boxShadow: "0 40px 80px -30px rgba(233, 77, 120, 0.45)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 30,
          right: 30,
          top: 26,
          height: 150,
          borderRadius: 22,
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          padding: "22px 26px",
          boxShadow: "0 16px 40px -24px rgba(90, 30, 55, 0.4)",
        }}
      >
        <div style={{ width: 200, height: 12, borderRadius: 6, background: "#ffd6e0" }} />
        <div style={{ width: 260, height: 12, borderRadius: 6, background: "#ffd6e0", marginTop: 14 }} />
        <div style={{ width: 150, height: 12, borderRadius: 6, background: "#ffd6e0", marginTop: 14 }} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 150,
          borderRadius: "0 0 34px 34px",
          background: "linear-gradient(180deg, #ffd8e2 0%, #ffcfdb 100%)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 148,
          top: 88,
          width: 64,
          height: 64,
          borderRadius: 32,
          background: "radial-gradient(circle at 35% 30%, #ff7fa3 0%, #e94d78 55%, #c93a62 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 12px 26px -8px rgba(201, 58, 98, 0.7)",
        }}
      >
        <HeartIcon size={30} color="#ffffff" />
      </div>
    </div>
  );
}

export async function renderOgCard({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 84px",
          background: "linear-gradient(135deg, #fff1f4 0%, #fff7f2 45%, #f3efff 100%)",
          fontFamily: "Nunito",
          color: "#3d2230",
          position: "relative",
        }}
      >
        {[
          { left: 60, top: 70, size: 34, color: "#ffb3c7" },
          { left: 1080, top: 90, size: 46, color: "#c9b8ff" },
          { left: 980, top: 500, size: 30, color: "#ffd27a" },
          { left: 140, top: 520, size: 26, color: "#f0668a" },
          { left: 700, top: 60, size: 22, color: "#ffb3c7" },
        ].map((h, i) => (
          <div key={i} style={{ position: "absolute", left: h.left, top: h.top, display: "flex", opacity: 0.7 }}>
            <HeartIcon size={h.size} color={h.color} />
          </div>
        ))}

        <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingRight: 48 }}>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#e94d78",
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontFamily: "Fredoka",
              fontSize: title.length > 26 ? 66 : 80,
              lineHeight: 1.05,
              color: "#3d2230",
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 30, color: "#8a6b75", lineHeight: 1.35 }}>
            {subtitle}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 40,
              fontFamily: "Fredoka",
              fontSize: 28,
              color: "#e94d78",
            }}
          >
            <HeartIcon size={26} color="#e94d78" />
            <span style={{ marginLeft: 10 }}>yesbird</span>
          </div>
        </div>

        <Envelope />
      </div>
    ),
    { ...OG_SIZE, fonts: await fonts() },
  );
}
