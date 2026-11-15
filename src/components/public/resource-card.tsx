import { ExternalLink, FileText, ImageIcon, Link2 } from "lucide-react";
import Link from "next/link";
import type { ResourceType } from "@/generated/prisma/enums";
import { CATEGORY_LABELS } from "@/lib/categories";
import type { ResourceItem } from "@/lib/data/public";
import { plainExcerpt } from "@/lib/text";

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  PDF: "PDF",
  IMAGE: "Image",
  LINK: "Link",
};

const ICONS = { PDF: FileText, IMAGE: ImageIcon, LINK: Link2 } as const;

export function ResourceCard({
  resource,
  showChapter = true,
}: {
  resource: ResourceItem;
  showChapter?: boolean;
}) {
  const Icon = ICONS[resource.type];

  return (
    <article className="flex h-full gap-4 rounded-2xl border border-border bg-surface p-5">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-primary"
          >
            {resource.title}
            <ExternalLink className="size-3.5 text-muted" aria-hidden />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </h3>
        {resource.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted">
            {plainExcerpt(resource.description, 160)}
          </p>
        )}
        <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="rounded-full bg-white/5 px-2 py-0.5">
            {RESOURCE_TYPE_LABELS[resource.type]}
          </span>
          {resource.category && (
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-accent">
              {CATEGORY_LABELS[resource.category]}
            </span>
          )}
          {showChapter && resource.chapter && (
            <Link
              href={`/courses/${resource.chapter.courseSlug}/${resource.chapter.slug}`}
              className="underline-offset-2 hover:text-primary hover:underline"
            >
              {resource.chapter.courseTitle} · {resource.chapter.title}
            </Link>
          )}
        </p>
      </div>
    </article>
  );
}
