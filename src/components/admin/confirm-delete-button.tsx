"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useRef, type ReactNode } from "react";
import type { ActionState } from "@/lib/action-state";
import { btn } from "./styles";
import { useActionRunner } from "./use-action-runner";

type Props = {
  action: () => Promise<ActionState>;
  /** What is being deleted, e.g. `course "Motion"`. */
  itemLabel: string;
  /** Extra consequences shown in the dialog. */
  warning?: ReactNode;
  /** "icon" for list rows, "button" for page-level delete. */
  variant?: "icon" | "button";
  /** Where to go after a successful delete (e.g. back to the parent page). */
  redirectTo?: string;
};

export function ConfirmDeleteButton({
  action,
  itemLabel,
  warning,
  variant = "icon",
  redirectTo,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const router = useRouter();
  const { run, pending } = useActionRunner();

  return (
    <>
      <button
        type="button"
        aria-label={`Delete ${itemLabel}`}
        title="Delete"
        className={
          variant === "icon"
            ? `${btn.icon} hover:border-red-400 hover:text-red-300`
            : `${btn.base} ${btn.ghostDanger}`
        }
        onClick={() => dialogRef.current?.showModal()}
      >
        <Trash2 className="size-4" aria-hidden />
        {variant === "button" && "Delete"}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-surface p-6 text-foreground backdrop:bg-black/70"
        onCancel={(e) => pending && e.preventDefault()}
      >
        <h2 id={titleId} className="text-lg font-bold">
          Delete {itemLabel}?
        </h2>
        <div className="mt-2 space-y-2 text-sm text-muted">
          {warning}
          <p>This cannot be undone.</p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            autoFocus
            disabled={pending}
            className={`${btn.base} ${btn.secondary}`}
            onClick={() => dialogRef.current?.close()}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            className={`${btn.base} ${btn.danger}`}
            onClick={() =>
              run(action, (result) => {
                if (result.status !== "success") return;
                dialogRef.current?.close();
                if (redirectTo) router.push(redirectTo);
              })
            }
          >
            {pending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </dialog>
    </>
  );
}
