import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

type Card = {
  /** Small gold label above the title, e.g. "HSC · 6 lessons". */
  eyebrow: string;
  title: string;
  subtitle?: string;
};

/**
 * Shared 1200×630 link-preview card in the site's dark theme.
 * Uses the built-in OG font (no font files to ship); formulas stick to
 * characters it renders reliably.
 */
export function ogCard({ eyebrow, title, subtitle }: Card) {
  const titleSize = title.length > 60 ? 54 : title.length > 32 ? 66 : 80;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        background: "#05060A",
        backgroundImage:
          "radial-gradient(circle at 85% 20%, rgba(47,128,255,0.35), transparent 45%), radial-gradient(circle at 75% 95%, rgba(168,85,247,0.30), transparent 45%)",
        color: "#E8EAF2",
        position: "relative",
      }}
    >
      {/* Orbit mark, top right */}
      <svg
        width="300"
        height="300"
        viewBox="0 0 64 64"
        style={{ position: "absolute", right: 60, top: 60, opacity: 0.9 }}
      >
        <g fill="none" strokeWidth="1.2">
          <ellipse cx="32" cy="32" rx="28" ry="10" stroke="#2F80FF" transform="rotate(30 32 32)" />
          <ellipse cx="32" cy="32" rx="28" ry="10" stroke="#A855F7" transform="rotate(-30 32 32)" />
          <ellipse
            cx="32"
            cy="32"
            rx="28"
            ry="10"
            stroke="#2F80FF"
            opacity="0.5"
            transform="rotate(90 32 32)"
          />
        </g>
        <circle cx="32" cy="32" r="3.5" fill="#F5C451" />
      </svg>

      <div style={{ display: "flex", fontSize: 28, color: "#9AA3B8", letterSpacing: 1 }}>
        {SITE_NAME}
      </div>

      <div style={{ display: "flex", flexDirection: "column", maxWidth: 860 }}>
        <div style={{ display: "flex", fontSize: 30, color: "#F5C451", marginBottom: 18 }}>
          {eyebrow}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: titleSize,
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: -1.5,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div style={{ display: "flex", fontSize: 32, color: "#9AA3B8", marginTop: 24 }}>
            {subtitle}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 40, fontSize: 26, color: "#5B6480" }}>
        <span>F = ma</span>
        <span>E = mc²</span>
        <span>PV = nRT</span>
        <span style={{ color: "#2F80FF", marginLeft: "auto" }}>Free physics lessons</span>
      </div>
    </div>,
    OG_SIZE,
  );
}
