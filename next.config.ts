import type { NextConfig } from "next";

// Cloudinary uploads (course thumbnails, tutor photo, resource images). The cloud name is public.
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
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
