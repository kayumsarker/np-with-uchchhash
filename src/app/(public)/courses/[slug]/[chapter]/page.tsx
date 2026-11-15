import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Markdown } from "@/components/markdown";
import { ResourceCard } from "@/components/public/resource-card";
import { YouTubeLite } from "@/components/public/youtube-lite";
import { getChapter, getPublishedChapterParams } from "@/lib/data/public";
import { plainExcerpt } from "@/lib/text";
import { youtubeThumbnailUrl } from "@/lib/youtube";

type Props = PageProps<"/courses/[slug]/[chapter]">;

/** Cache Components needs at least one param; the placeholder simply 404s. */
const PLACEHOLDER = { slug: "__none__", chapter: "__none__" };

export async function generateStaticParams() {
  const params = await getPublishedChapterParams();
  return params.length > 0 ? params : [PLACEHOLDER];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, chapter: chapterSlug } = await params;
  const data = await getChapter(slug, chapterSlug);
  if (!data) return { title: "Lesson not found" };

  const title = `${data.chapter.title} · ${data.course.title}`;
  const description = plainExcerpt(
    data.chapter.description || data.course.description || data.chapter.title,
    160,
  );
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "video.other",
      images: [{ url: youtubeThumbnailUrl(data.chapter.youtubeId), width: 480, height: 360 }],
    },
  };
}

export default function ChapterPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="mx-auto min-h-[60vh] max-w-6xl px-4 py-10" />}>
      <ChapterContent params={params} />
    </Suspense>
  );
}

async function ChapterContent({ params }: Pick<Props, "params">) {
  const { slug, chapter: chapterSlug } = await params;
  const data = await getChapter(slug, chapterSlug);
  if (!data) notFound();

  const { course, chapter, index, prev, next, resources } = data;
  const total = course.chapters.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted">
        <Link href="/courses" className="hover:text-primary">
          Courses
        </Link>{" "}
        /{" "}
        <Link href={`/courses/${course.slug}`} className="hover:text-primary">
          {course.title}
        </Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
        <article>
          <YouTubeLite videoId={chapter.youtubeId} title={chapter.title} priority />

          <p className="mt-6 font-mono text-xs text-muted">
            Lesson {index + 1} of {total}
          </p>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{chapter.title}</h1>

          {chapter.description && (
            <Markdown className="mt-6 text-foreground/90">{chapter.description}</Markdown>
          )}

          {resources.length > 0 && (
            <section aria-labelledby="resources-heading" className="mt-10">
              <h2 id="resources-heading" className="mb-4 text-xl font-bold">
                Resources for this lesson
              </h2>
              <ul className="grid gap-4">
                {resources.map((resource) => (
                  <li key={resource.id}>
                    <ResourceCard resource={resource} showChapter={false} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <nav
            aria-label="Lesson navigation"
            className="mt-12 grid gap-4 border-t border-border pt-8 sm:grid-cols-2"
          >
            {prev ? (
              <Link
                href={`/courses/${course.slug}/${prev.slug}`}
                className="group rounded-xl border border-border bg-surface p-4 transition hover:border-primary/60"
              >
                <span className="flex items-center gap-1 text-xs text-muted">
                  <ArrowLeft className="size-3.5" aria-hidden /> Previous
                </span>
                <span className="mt-1 block font-medium group-hover:text-primary">
                  {prev.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link
                href={`/courses/${course.slug}/${next.slug}`}
                className="group rounded-xl border border-border bg-surface p-4 text-right transition hover:border-primary/60"
              >
                <span className="flex items-center justify-end gap-1 text-xs text-muted">
                  Next <ArrowRight className="size-3.5" aria-hidden />
                </span>
                <span className="mt-1 block font-medium group-hover:text-primary">
                  {next.title}
                </span>
              </Link>
            )}
          </nav>
        </article>

        <aside aria-labelledby="sidebar-heading" className="lg:sticky lg:top-24 lg:self-start">
          <h2 id="sidebar-heading" className="mb-3 font-heading font-bold">
            <Link href={`/courses/${course.slug}`} className="hover:text-primary">
              {course.title}
            </Link>
          </h2>
          <ol className="max-h-[70vh] space-y-1 overflow-y-auto rounded-2xl border border-border bg-surface p-2">
            {course.chapters.map((item, i) => {
              const current = item.id === chapter.id;
              return (
                <li key={item.id}>
                  <Link
                    href={`/courses/${course.slug}/${item.slug}`}
                    aria-current={current ? "page" : undefined}
                    className={`flex gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                      current
                        ? "bg-primary/15 text-foreground"
                        : "text-muted hover:bg-white/5 hover:text-foreground"
                    }`}
                  >
                    <span className="w-5 shrink-0 font-mono text-xs leading-5">{i + 1}</span>
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </aside>
      </div>
    </div>
  );
}
