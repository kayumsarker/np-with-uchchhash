"use client";

/**
 * Writes one query param to the URL without a navigation (Next.js syncs
 * window.history.replaceState with useSearchParams). Keeps filter state shareable
 * while the page itself stays fully static.
 */
export function replaceSearchParam(key: string, value: string | null) {
  const params = new URLSearchParams(window.location.search);
  if (value) params.set(key, value);
  else params.delete(key);
  const query = params.toString();
  window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
}
