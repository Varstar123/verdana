/**
 * Input size caps for user-generated content. Plain shared module (safe to import
 * on both client and server) so the UI's maxLength matches the server's clamp.
 * The server is the source of truth — it always re-clamps; client caps are UX only.
 */
export const POST_BODY_MAX = 2000;
export const COMMENT_BODY_MAX = 1000;
export const THREAD_TITLE_MAX = 160;
export const THREAD_BODY_MAX = 5000;
export const HASHTAGS_MAX = 6;
export const BIO_MAX = 280;

/** Trim and hard-cap a string to `max` characters. */
export function clampText(s: string, max: number): string {
  return s.trim().slice(0, max);
}

/** Extract up to `max` `#hashtags` (alphanumeric, ≤30 chars) from text, server-side. */
export function extractHashtags(body: string, max = HASHTAGS_MAX): string[] {
  return Array.from(body.matchAll(/#(\w{1,30})/g))
    .map((m) => m[1])
    .slice(0, max);
}
