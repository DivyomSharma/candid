import { ImageResponse } from "next/og";
import { getPublicProfileByHandle } from "@/lib/candid/public-profile";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const profile = await getPublicProfileByHandle(handle);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          background:
            "radial-gradient(circle at top right, rgba(191, 164, 255, 0.18), transparent 28%), linear-gradient(135deg, #17131d, #1f1926 55%, #18141d)",
          color: "#f5f1f8",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 28, opacity: 0.72 }}>candid</div>
          <div style={{ fontSize: 22, opacity: 0.56 }}>{profile?.handle ?? `@${handle}`}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 68, fontWeight: 300, lineHeight: 1.02 }}>{profile?.username ?? "candid profile"}</div>
          <div style={{ maxWidth: 860, fontSize: 28, lineHeight: 1.45, opacity: 0.84 }}>
            {profile?.shareCards[0]?.lines.join(" ") ?? "conversation may feel unusually natural"}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
            {(profile?.interests ?? ["films that linger", "internet rabbit holes"]).slice(0, 2).map((item) => (
              <div
                key={item}
                style={{
                  padding: "10px 18px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.12)",
                  fontSize: 20,
                  opacity: 0.82,
                }}
              >
                {item}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 24, opacity: 0.56 }}>{profile?.resonanceIndicators[0] ?? "made to be quietly shared"}</div>
        </div>
      </div>
    ),
    size,
  );
}
