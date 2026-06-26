"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignIn, SignUp } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/env";
import { ArrowRightIcon, LeafIcon } from "@/components/icons";

function Brand() {
  return (
    <Link href="/" className="mb-8 flex items-center gap-2.5">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-white shadow-glow">
        <LeafIcon className="h-5 w-5" />
      </span>
      <span className="font-display text-2xl font-semibold tracking-tight text-ink">
        Verdana
      </span>
    </Link>
  );
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const isSignup = mode === "signup";

  // --- Live mode: Clerk (Google sign-in) ---
  if (isClerkConfigured) {
    const appearance = { variables: { colorPrimary: "#138445" } };
    return (
      <div className="flex w-full flex-col items-center">
        <Brand />
        {isSignup ? (
          <SignUp
            routing="hash"
            signInUrl="/login"
            fallbackRedirectUrl="/dashboard"
            appearance={appearance}
          />
        ) : (
          <SignIn
            routing="hash"
            signUpUrl="/signup"
            fallbackRedirectUrl="/dashboard"
            appearance={appearance}
          />
        )}
      </div>
    );
  }

  // --- Demo mode: no auth backend, drop straight into the app ---
  return (
    <div className="w-full max-w-md">
      <Brand />
      <h1 className="font-display text-3xl font-semibold text-ink">
        {isSignup ? "Join the movement" : "Welcome back"}
      </h1>
      <p className="mt-2 text-muted">
        {isSignup
          ? "Create your planet and start restoring the Earth."
          : "Sign in to tend your living Earth."}
      </p>

      <div className="mt-6 rounded-2xl border border-aurora-violet/30 bg-aurora-violet/10 p-4 text-sm text-muted">
        <span className="font-semibold text-ink">Demo mode.</span> Clerk
        isn&apos;t configured, so Google sign-in is simulated — continue to
        explore with seeded data.
      </div>

      <button
        type="button"
        disabled
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-hairline/15 bg-surface px-5 py-3 text-sm font-medium text-faint"
      >
        <GoogleGlyph />
        Continue with Google (set up Clerk to enable)
      </button>

      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="btn-primary mt-3 w-full"
      >
        Enter Verdana (demo)
        <ArrowRightIcon className="h-4 w-4" />
      </button>

      <p className="mt-6 text-sm text-muted">
        {isSignup ? "Already a citizen?" : "New to Verdana?"}{" "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-semibold text-brand hover:underline"
        >
          {isSignup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
