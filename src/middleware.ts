import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import type { NextFetchEvent } from "next/server";
import { isClerkConfigured } from "@/lib/env";

// Attaches Clerk auth context + handles the dev-browser handshake. Route
// protection itself lives in the (app) and (admin) layouts (they redirect
// signed-out users to /login), which gives a clean redirect instead of Clerk's
// protect() interstitial.
const clerkHandler = clerkMiddleware();

/**
 * In demo mode (no Clerk keys) this is a pass-through so the whole app stays
 * browsable. With Clerk configured it enables auth on every request.
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
