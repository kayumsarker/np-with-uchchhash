import { CATEGORY_LABELS } from "@/lib/categories";
import { getCourse } from "@/lib/data/public";
export { generateStaticParams } from "./page";
import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/og";

export const alt = "Course preview";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) return ogCard({ eyebrow: "Free course", title: "Physics course" });

  const lessons = course.chapters.length;
  return ogCard({
    eyebrow: `${CATEGORY_LABELS[course.category]} · ${lessons} ${lessons === 1 ? "lesson" : "lessons"}`,
    title: course.title,
    subtitle: "Free video course",
  });
}
