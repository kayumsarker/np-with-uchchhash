import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iOS home-screen icon: same atom mark as icon.svg, full-bleed (iOS rounds corners). */
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#05060A",
      }}
    >
      <svg width="150" height="150" viewBox="0 0 64 64">
        <g fill="none" strokeWidth="3.5">
          <ellipse cx="32" cy="32" rx="25" ry="9.5" stroke="#2F80FF" transform="rotate(30 32 32)" />
          <ellipse
            cx="32"
            cy="32"
            rx="25"
            ry="9.5"
            stroke="#A855F7"
            transform="rotate(-30 32 32)"
          />
        </g>
        <circle cx="32" cy="32" r="6" fill="#F5C451" />
      </svg>
    </div>,
    size,
  );
}
