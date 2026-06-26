import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import type { NextFetchEvent } from "next/server";
import { isClerkConfigured } from "@/lib/env";

// Routes that require a signed-in user when Clerk is configured.
const isProtected = createRouteMatcher([
  "/dashboard(.*)",
  "/earth(.*)",
  "/leaderboard(.*)",
  "/profile(.*)",
  "/admin(.*)",
]);

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) await auth.protect();
});

/**
 * In demo mode (no Clerk keys) this is a pass-through so the whole app stays
 * browsable. With Clerk configured it enforces auth on protected routes.
 */
export default function middleware(req: NextRequest, ev: NextFetchEvent) {
  if (!isClerkConfigured) return NextResponse.next();
  return clerkHandler(req, ev);
}

export const config = {
  matcher: [
    "/((?!_next|.*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
