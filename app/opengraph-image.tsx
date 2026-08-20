import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/seo/site";

export const runtime = "edge";

export const alt = "CreatorPulse — creator analytics platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          background: "linear-gradient(145deg, #faf8f5 0%, #fdf2f0 55%, #f5f0eb 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 320,
            height: 320,
            borderRadius: "9999px",
            background: "rgba(201, 184, 232, 0.18)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 9999,
              background: "#e05a4f",
            }}
          />
          <div
            style={{
              fontSize: 22,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#8a817a",
            }}
          >
            Creator Platform
          </div>
        </div>
        <div
          style={{
            fontSize: 88,
            lineHeight: 0.95,
            fontWeight: 600,
            color: "#2a2420",
            letterSpacing: "-0.03em",
            maxWidth: 900,
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 30,
            color: "#5c534d",
            maxWidth: 760,
            lineHeight: 1.35,
          }}
        >
          Premium analytics workspace for creators
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 72,
            left: 80,
            width: 120,
            height: 4,
            borderRadius: 9999,
            background: "linear-gradient(90deg, #e05a4f 0%, #c9b8e8 100%)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
