export function ChapterWarning({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <p className="text-red-300">
      Its {count} chapter{count === 1 ? "" : "s"} will be deleted too. Resources attached to those
      chapters are kept as standalone resources.
    </p>
  );
}
