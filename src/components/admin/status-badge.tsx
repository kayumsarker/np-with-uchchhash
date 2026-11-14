export function StatusBadge({ published }: { published: boolean }) {
  return published ? (
    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-300">
      Published
    </span>
  ) : (
    <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs font-medium text-muted">
      Draft
    </span>
  );
}

export function FeaturedBadge() {
  return (
    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
      Featured
    </span>
  );
}
