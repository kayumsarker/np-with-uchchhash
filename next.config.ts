import type { NextConfig } from "next";

// Cloudinary uploads (course thumbnails, tutor photo, resource images). The cloud name is public.
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const isDev = process.env.NODE_ENV === "development";

/**
 * Static CSP (no nonces, so pages stay prerendered/cached). Next.js inline
 * bootstrap scripts need 'unsafe-inline'. Uploads go browser → Cloudinary API;
 * Supabase is only called from the server, so it is not listed.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://i.ytimg.com https://res.cloudinary.com",
  "font-src 'self'",
  `connect-src 'self' https://api.cloudinary.com${isDev ? " ws:" : ""}`,
  "frame-src https://www.youtube-nocookie.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      // YouTube thumbnails (chapter previews, course card fallback).
      new URL("https://i.ytimg.com/vi/**"),
      ...(cloudName ? [new URL(`https://res.cloudinary.com/${cloudName}/image/upload/**`)] : []),
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
