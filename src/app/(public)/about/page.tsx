import type { Metadata } from "next";
import { Markdown } from "@/components/markdown";
import { SocialLinks } from "@/components/public/social-links";
import { getSiteSettings } from "@/lib/data/public";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: "About",
    description: `About ${settings.tutorName} — ${settings.tagline}`,
  };
}

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <p className="font-mono text-sm text-accent">About</p>
      <h1 className="mt-2 text-4xl font-bold">{settings.tutorName}</h1>
      <p className="mt-3 text-lg text-muted">{settings.tagline}</p>
      {/* TODO(Phase 6): tutor photo (Cloudinary). */}
      {settings.aboutContent ? (
        <Markdown className="mt-10">{settings.aboutContent}</Markdown>
      ) : (
        <p className="mt-10 text-muted">More about {settings.tutorName} coming soon.</p>
      )}
      <div className="mt-10">
        <SocialLinks settings={settings} />
      </div>
    </div>
  );
}
