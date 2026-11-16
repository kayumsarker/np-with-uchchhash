import { z } from "zod";

/** Result every admin server action returns to its client form/button. */
export type ActionState =
  | { status: "idle" }
  | { status: "success"; message: string; redirectTo?: string; warning?: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[] | undefined> };

export const idleState: ActionState = { status: "idle" };

/** `warning` is shown as an extra toast (e.g. an old Cloudinary file could not be deleted). */
export function success(message: string, redirectTo?: string, warning?: string): ActionState {
  return { status: "success", message, redirectTo, warning };
}

export function failure(
  message: string,
  fieldErrors?: Record<string, string[] | undefined>,
): ActionState {
  return { status: "error", message, fieldErrors };
}

export function validationFailure(error: z.ZodError): ActionState {
  return failure("Please fix the highlighted fields.", z.flattenError(error).fieldErrors);
}
