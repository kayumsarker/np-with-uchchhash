import type { Metadata } from "next";
import Image from "next/image";
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
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        {settings.photoUrl && (
          <Image
            src={settings.photoUrl}
            alt={`Photo of ${settings.tutorName}`}
            width={160}
            height={160}
            preload
            className="size-32 shrink-0 rounded-full border-2 border-primary/40 object-cover shadow-[0_0_40px_-8px_rgba(47,128,255,0.5)] sm:size-40"
          />
        )}
        <div>
          <p className="font-mono text-sm text-accent">About</p>
          <h1 className="mt-2 text-4xl font-bold">{settings.tutorName}</h1>
          <p className="mt-3 text-lg text-muted">{settings.tagline}</p>
        </div>
      </div>
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
