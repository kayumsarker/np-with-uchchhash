import Link from "next/link";
import { cardClass } from "./styles";

/**
 * Shown instead of notFound() on admin edit pages. After a delete, the action's
 * response re-renders the current (now missing) page before the client navigates
 * away — this keeps that moment calm instead of flashing a 404.
 */
export function MissingNotice({ what, backHref }: { what: string; backHref: string }) {
  return (
    <div className={`${cardClass} p-6 text-center`}>
      <p className="text-muted">This {what} does not exist or was just deleted.</p>
      <Link href={backHref} className="mt-3 inline-block text-primary underline">
        Go back
      </Link>
    </div>
  );
}
