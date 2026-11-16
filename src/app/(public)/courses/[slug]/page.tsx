import { ArrowRight, PlayCircle } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Markdown } from "@/components/markdown";
import { CATEGORY_LABELS } from "@/lib/categories";
import { getCourse, getPublishedCourses } from "@/lib/data/public";
import { plainExcerpt } from "@/lib/text";
import { youtubeThumbnailUrl } from "@/lib/youtube";

type Props = PageProps<"/courses/[slug]">;

/** Cache Components needs at least one param; the placeholder simply 404s. */
const PLACEHOLDER = "__none__";

export async function generateStaticParams() {
  const courses = await getPublishedCourses();
  return courses.length > 0 ? courses.map((c) => ({ slug: c.slug })) : [{ slug: PLACEHOLDER }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) return { title: "Course not found" };
  const description = plainExcerpt(course.description, 160);
  return {
    title: course.title,
    description,
    alternates: { canonical: `/courses/${course.slug}` },
    openGraph: { title: course.title, description, url: `/courses/${course.slug}` },
  };
}

export default function CoursePage({ params }: Props) {
  return (
    <Suspense fallback={<div className="mx-auto min-h-[60vh] max-w-6xl px-4 py-14" />}>
      <CourseContent params={params} />
    </Suspense>
  );
}

async function CourseContent({ params }: Pick<Props, "params">) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();

  const first = course.chapters[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
        <Link href="/courses" className="hover:text-primary">
          Courses
        </Link>{" "}
        /{" "}
        <Link
          href={`/courses?category=${course.category.toLowerCase()}`}
          className="hover:text-primary"
        >
          {CATEGORY_LABELS[course.category]}
        </Link>
      </nav>

      <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
        <div>
          <h1 className="text-4xl font-bold sm:text-5xl">{course.title}</h1>
          <p className="mt-3 flex items-center gap-2 text-sm text-muted">
            <span className="rounded-full bg-accent/15 px-2.5 py-0.5 font-semibold text-accent">
              {CATEGORY_LABELS[course.category]}
            </span>
            {course.chapters.length} {course.chapters.length === 1 ? "lesson" : "lessons"}
          </p>
          {first && (
            <Link
              href={`/courses/${course.slug}/${first.slug}`}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90"
            >
              Start learning <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
          <Markdown className="mt-10 text-foreground/90">{course.description}</Markdown>
        </div>

        <section aria-labelledby="lessons-heading">
          <h2 id="lessons-heading" className="mb-4 text-xl font-bold">
            Lessons
          </h2>
          {course.chapters.length === 0 ? (
            <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted">
              Lessons are coming soon.
            </p>
          ) : (
            <ol className="space-y-3">
              {course.chapters.map((chapter, index) => (
                <li key={chapter.id}>
                  <Link
                    href={`/courses/${course.slug}/${chapter.slug}`}
                    className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-3 transition hover:border-primary/60"
                  >
                    <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-black">
                      <Image
                        src={youtubeThumbnailUrl(chapter.youtubeId)}
                        alt=""
                        fill
                        sizes="112px"
                        className="object-cover opacity-80 group-hover:opacity-100"
                      />
                      <PlayCircle
                        className="absolute inset-0 m-auto size-7 text-white drop-shadow"
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-muted">Lesson {index + 1}</p>
                      <p className="font-medium group-hover:text-primary">{chapter.title}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
