"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { EarthErrorBoundary } from "@/components/earth/EarthErrorBoundary";

// Three.js must never run on the server.
const LivingEarth = dynamic(() => import("@/components/earth/LivingEarth"), {
  ssr: false,
  loading: () => <EarthOrbFallback pulsing />,
});

function EarthOrbFallback({ pulsing = false }: { pulsing?: boolean }) {
  return (
    <div className="grid h-full w-full place-items-center">
      <div
        className={`h-44 w-44 rounded-full bg-[radial-gradient(circle_at_30%_30%,#43B86E,#0B522C_60%,#06140a)] shadow-glow ${
          pulsing ? "animate-pulse" : ""
        }`}
      />
    </div>
  );
}

export function EarthScene({
  health,
  interactive = true,
  className,
}: {
  health: number;
  interactive?: boolean;
  className?: string;
}) {
  return (
    <EarthErrorBoundary fallback={<EarthOrbFallback />}>
      <div className={`relative h-full w-full ${className ?? ""}`}>
        <Suspense fallback={<EarthOrbFallback pulsing />}>
          <LivingEarth
            health={health}
            interactive={interactive}
            className="!absolute inset-0"
          />
        </Suspense>
      </div>
    </EarthErrorBoundary>
  );
}
