/** Shared admin class names (Tailwind scans .ts files, so these are generated). */
export const btn = {
  base: "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
  primary: "bg-primary text-white hover:bg-primary/90",
  secondary: "border border-border text-foreground hover:border-primary hover:text-primary",
  danger: "bg-red-600 text-white hover:bg-red-500",
  ghostDanger: "border border-red-500/40 text-red-300 hover:bg-red-500/10",
  icon: "inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-border disabled:hover:text-muted",
};

export const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none placeholder:text-muted/60 focus:border-primary aria-invalid:border-red-400";

export const cardClass = "rounded-2xl border border-border bg-surface";
