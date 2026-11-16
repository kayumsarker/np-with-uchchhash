import { PlayCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CATEGORY_LABELS } from "@/lib/categories";
import type { CourseCard as CourseCardData } from "@/lib/data/public";
import { plainExcerpt } from "@/lib/text";
import { youtubeThumbnailUrl } from "@/lib/youtube";

export function CourseCard({ course }: { course: CourseCardData }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-[0_8px_40px_-12px_rgba(47,128,255,0.45)]"
    >
      <div className="relative aspect-video bg-gradient-to-br from-primary/30 via-surface to-secondary/30">
        {course.thumbnailUrl || course.coverYoutubeId ? (
          <Image
            src={course.thumbnailUrl ?? youtubeThumbnailUrl(course.coverYoutubeId!)}
            alt=""
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="object-cover opacity-80 transition group-hover:opacity-100"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center font-mono text-2xl text-accent/80">
            F = ma
          </span>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-background/80 px-2.5 py-1 text-xs font-semibold text-accent backdrop-blur">
          {CATEGORY_LABELS[course.category]}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold group-hover:text-primary">{course.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">
          {plainExcerpt(course.description)}
        </p>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
          <PlayCircle className="size-4 text-primary" aria-hidden />
          {course.chapterCount} {course.chapterCount === 1 ? "lesson" : "lessons"}
        </p>
      </div>
    </Link>
  );
}
