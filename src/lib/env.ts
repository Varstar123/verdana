/**
 * Public environment access. The app is fully functional in "demo mode" when
 * neither Clerk (auth) nor Supabase (database) is configured — these flags are
 * the switches the auth + data layers read.
 */

// --- Supabase (database) ---
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// --- Clerk (authentication: Google sign-in) ---
export const CLERK_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
export const isClerkConfigured = Boolean(CLERK_PUBLISHABLE_KEY);
