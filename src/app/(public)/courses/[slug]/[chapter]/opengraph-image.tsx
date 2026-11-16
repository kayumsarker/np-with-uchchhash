import { CATEGORY_LABELS } from "@/lib/categories";
import { getChapter } from "@/lib/data/public";
export { generateStaticParams } from "./page";
import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og";

export const alt = "Lesson preview";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}) {
  const { slug, chapter } = await params;
  const data = await getChapter(slug, chapter);
  if (!data) return ogCard({ eyebrow: "Free lesson", title: "Physics lesson" });

  return ogCard({
    eyebrow: `${CATEGORY_LABELS[data.course.category]} · Lesson ${data.index + 1} of ${data.course.chapters.length}`,
    title: data.chapter.title,
    subtitle: data.course.title,
  });
}
