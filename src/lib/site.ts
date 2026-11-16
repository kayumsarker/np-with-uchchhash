/** Site-wide constants used by metadata, sitemap, robots and OG images. */

export const SITE_NAME = "Natural Philosophy with Uchchhash";
export const SITE_DESCRIPTION = "Free physics courses for SSC, HSC and advanced learners.";

/** Absolute origin without trailing slash, from NEXT_PUBLIC_SITE_URL (localhost in dev). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
  /\/+$/,
  "",
);
