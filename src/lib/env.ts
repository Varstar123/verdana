/**
 * Public environment access. The app is fully functional in "demo mode" when
 * neither Clerk (auth) nor Firebase (database) is configured — these flags are
 * the switches the auth + data layers read.
 */

// --- Firebase (database: Firestore) ---
export const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};
/** Client (browser) Firestore is usable. */
export const isFirebaseConfigured = Boolean(
  FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId,
);
/** Server (admin) Firestore is usable — needs a service account. */
export const isFirebaseAdminConfigured = Boolean(
  process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY,
);

// --- Clerk (authentication: Google sign-in) ---
export const CLERK_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
export const isClerkConfigured = Boolean(CLERK_PUBLISHABLE_KEY);

/**
 * Emails that automatically get admin access (comma-separated, server-only).
 * These users skip the need for Clerk publicMetadata role and are routed
 * straight to /admin on sign-in.
 */
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// --- AI photo review for quests ---
/**
 * Quest photos are reviewed by a vision AI. Two ways to configure it:
 *   1) Any OpenAI-compatible provider (Groq, Google Gemini, xAI Grok,
 *      OpenRouter, …) — set AI_VISION_BASE_URL + AI_VISION_API_KEY +
 *      AI_VISION_MODEL. This is how you use a FREE model (Groq / Gemini).
 *   2) Anthropic Claude — set ANTHROPIC_API_KEY (best quality, paid). Used only
 *      when the AI_VISION_* vars are empty.
 * With neither configured, uploads are auto-approved (demo mode).
 */
export const AI_VISION_BASE_URL = process.env.AI_VISION_BASE_URL || "";
export const AI_VISION_API_KEY = process.env.AI_VISION_API_KEY || "";
export const AI_VISION_MODEL = process.env.AI_VISION_MODEL || "";
/** An OpenAI-compatible vision provider (Groq/Gemini/Grok/OpenRouter) is set. */
export const isOpenAiVisionConfigured = Boolean(
  AI_VISION_BASE_URL && AI_VISION_API_KEY && AI_VISION_MODEL,
);

/** Anthropic Claude is available as the fallback provider. */
export const isAnthropicConfigured = Boolean(process.env.ANTHROPIC_API_KEY);
/** Claude vision model. Override to trade cost for capability. */
export const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

/** Any vision provider available at all (else demo auto-approve). */
export const isAiVisionConfigured =
  isOpenAiVisionConfigured || isAnthropicConfigured;
