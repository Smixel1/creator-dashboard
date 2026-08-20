import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          background: "linear-gradient(145deg, #fdf2f0 0%, #faf8f5 100%)",
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 999,
            background: "#e05a4f",
            boxShadow: "0 2px 8px rgba(224, 90, 79, 0.35)",
          }}
        />
      </div>
    ),
    size
  );
}
