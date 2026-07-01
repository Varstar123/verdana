import Link from "next/link";
import { GlobeIcon, TargetIcon, ChevronRightIcon } from "@/components/icons";
import { ICONS } from "@/components/app/registry";
import {
  MISSION_INTRO,
  VISION,
  MISSION,
  PRINCIPLES,
} from "@/lib/mission";

/**
 * Verdana's vision & mission, rendered from the shared copy in `@/lib/mission`.
 *
 * - `variant="full"` — a marketing-style block with heading, intro, the two
 *   statements and the guiding principles. Used on the landing page and the
 *   in-app `/mission` page.
 * - `variant="panel"` — a compact single-card summary that links through to the
 *   full page. Used on the dashboard.
 */
export function VisionMission({
  variant = "full",
  className = "",
}: {
  variant?: "full" | "panel";
  className?: string;
}) {
  if (variant === "panel") {
    return (
      <div className={`card-glass relative overflow-hidden p-6 sm:p-8 ${className}`}>
        <div className="aurora-bg opacity-50" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Our purpose</p>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
              Why we&apos;re here
            </h2>
          </div>
          <Link href="/mission" className="btn-secondary">
            Read our mission
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand/12 text-brand">
                <GlobeIcon className="h-5 w-5" />
              </span>
              <span className="font-display text-sm font-semibold uppercase tracking-wide text-ink">
                {VISION.label}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {VISION.statement}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand/12 text-brand">
                <TargetIcon className="h-5 w-5" />
              </span>
              <span className="font-display text-sm font-semibold uppercase tracking-wide text-ink">
                {MISSION.label}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {MISSION.statement}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Our purpose</p>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">
          Why Verdana exists
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-muted">{MISSION_INTRO}</p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
        <article className="card-glass p-8">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/12 text-brand">
            <GlobeIcon className="h-6 w-6" />
          </span>
          <p className="eyebrow mt-5">{VISION.label}</p>
          <h3 className="mt-2 font-display text-xl font-semibold text-ink">
            {VISION.headline}
          </h3>
          <p className="mt-3 leading-relaxed text-muted">{VISION.statement}</p>
        </article>

        <article className="card-glass p-8">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/12 text-brand">
            <TargetIcon className="h-6 w-6" />
          </span>
          <p className="eyebrow mt-5">{MISSION.label}</p>
          <h3 className="mt-2 font-display text-xl font-semibold text-ink">
            {MISSION.headline}
          </h3>
          <p className="mt-3 leading-relaxed text-muted">{MISSION.statement}</p>
        </article>
      </div>

      <div className="mx-auto mt-5 grid max-w-4xl gap-5 sm:grid-cols-3">
        {PRINCIPLES.map((p) => {
          const Icon = ICONS[p.iconKey];
          return (
            <div key={p.title} className="card-glass p-6">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/12 text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <h4 className="mt-4 font-display text-base font-semibold text-ink">
                {p.title}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
