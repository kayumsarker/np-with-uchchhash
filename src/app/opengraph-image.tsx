import { getSiteSettings } from "@/lib/data/public";
import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og";
import { SITE_NAME } from "@/lib/site";

export const alt = SITE_NAME;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Default link preview for every page without its own opengraph-image. */
export default async function Image() {
  const settings = await getSiteSettings();
  return ogCard({
    eyebrow: "SSC · HSC · Advanced",
    title: "Physics, from first principles.",
    subtitle: settings.tagline,
  });
}
