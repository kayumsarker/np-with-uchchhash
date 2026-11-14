"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import type { ActionState } from "@/lib/action-state";

/**
 * Runs a server action inside a transition, shows a toast for the result
 * and follows `redirectTo` on success.
 */
export function useActionRunner() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<ActionState>, onResult?: (result: ActionState) => void) {
    startTransition(async () => {
      let result: ActionState;
      try {
        result = await action();
      } catch {
        toast.error("Something went wrong. Please try again.");
        return;
      }
      if (result.status === "success") {
        toast.success(result.message);
        if (result.redirectTo) router.push(result.redirectTo);
      } else if (result.status === "error") {
        toast.error(result.message);
      }
      onResult?.(result);
    });
  }

  return { run, pending };
}
