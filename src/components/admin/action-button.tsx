"use client";

import type { ReactNode } from "react";
import type { ActionState } from "@/lib/action-state";
import { useActionRunner } from "./use-action-runner";

type Props = {
  action: () => Promise<ActionState>;
  /** Accessible name, also used as tooltip. */
  label: string;
  className: string;
  disabled?: boolean;
  children: ReactNode;
};

/** Small button that runs a bound server action (reorder, publish toggle, …). */
export function ActionButton({ action, label, className, disabled, children }: Props) {
  const { run, pending } = useActionRunner();

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={className}
      onClick={() => run(action)}
    >
      {children}
    </button>
  );
}
