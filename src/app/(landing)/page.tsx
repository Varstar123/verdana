import Link from "next/link";
import { EarthScene } from "@/components/earth/EarthScene";
import { VisionMission } from "@/components/VisionMission";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { GLOBAL_STATS } from "@/lib/community";
import {
  LeafIcon,
  GlobeIcon,
  TrophyIcon,
  UsersIcon,
  StarIcon,
  TargetIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from "@/components/icons";

const features = [
  {
    icon: GlobeIcon,
    title: "Your living Earth",
    body: "A unique 3D planet that heals as you act — forests spread, oceans clear, glaciers return. Watch it transform in real time.",
  },
  {
    icon: TrophyIcon,
    title: "Changemakers board",
    body: "Compete by eco-score, trees, volunteering and more. Rise through the ranks against 58,000+ citizens worldwide.",
  },
  {
    icon: UsersIcon,
    title: "Profiles & Planet IDs",
    body: "Every citizen gets a searchable Planet ID. Follow friends, show off your Earth, and build your reputation.",
  },
  {
    icon: StarIcon,
    title: "Levels & badges",
    body: "Climb from Seed to Legend of Verdana. Unlock badges, themes, and Earth upgrades as you grow.",
  },
  {
    icon: TargetIcon,
    title: "Daily challenges",
    body: "Fresh challenges every day — recycle, bike, plant, learn. Earn XP, keep your streak, grow your planet.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Real, verified action",
    body: "Eco-score rewards genuine impact across recycling, volunteering and learning — not just donations.",
  },
];

export default function LandingPage() {
  const stats = [
    [`${(GLOBAL_STATS.trees / 1_000_000).toFixed(1)}M`, "Trees planted"],
    [GLOBAL_STATS.users.toLocaleString(), "Citizens"],
    [`${GLOBAL_STATS.countries}`, "Countries"],
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas">
      <div className="aurora-bg" />

      {/* Header */}
      <header className="container-px flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white shadow-glow">
            <LeafIcon className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-ink">
            Verdana
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <a href="#features" className="rounded-full px-4 py-2 text-sm font-medium text-muted hover:text-ink">
            Features
          </a>
          <a href="#mission" className="rounded-full px-4 py-2 text-sm font-medium text-muted hover:text-ink">
            Mission
          </a>
          <Link href="/leaderboard" className="rounded-full px-4 py-2 text-sm font-medium text-muted hover:text-ink">
            Changemakers
          </Link>
          <Link href="/dashboard" className="rounded-full px-4 py-2 text-sm font-medium text-muted hover:text-ink">
            Demo
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className="btn-ghost hidden sm:inline-flex">
            Sign in
          </Link>
          <Link href="/signup" className="btn-primary">
            Get started
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container-px grid items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-hairline/15 bg-surface px-4 py-1.5 text-sm font-medium text-brand">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
            {GLOBAL_STATS.online.toLocaleString()} citizens online now
          </span>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl">
            The social network for{" "}
            <span className="text-gradient">saving the planet</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">
            Build your own living Earth through real-world action. Plant, recycle,
            volunteer, and learn — then climb the global leaderboard with a
            community of millions. This is the GitHub of saving the planet.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup" className="btn-primary">
              Create your planet
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              Explore the demo
            </Link>
          </div>

          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6">
            {stats.map(([v, l]) => (
              <div key={l}>
                <dt className="font-display text-3xl font-semibold text-ink">{v}</dt>
                <dd className="mt-1 text-xs uppercase tracking-wide text-faint">{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Living Earth */}
        <div className="relative mx-auto h-[340px] w-full max-w-md sm:h-[440px]">
          <div className="absolute inset-0 rounded-full bg-brand/20 blur-3xl" />
          <EarthScene health={74} interactive={false} />
        </div>
      </section>

      {/* Vision & Mission */}
      <section id="mission" className="container-px scroll-mt-20 py-16">
        <VisionMission variant="full" />
      </section>

      {/* Features */}
      <section id="features" className="container-px py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Why Verdana</p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">
            Impact that feels like a game you want to win
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card-glass p-6">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/12 text-brand">
                <f.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="container-px py-16">
        <div className="card-glass relative overflow-hidden p-10 text-center sm:p-16">
          <div className="aurora-bg opacity-70" />
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Your planet is waiting. Make today the day it starts to heal.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Join a global community restoring the Earth — one real action at a
            time. Free to start, impossible to put down.
          </p>
          <Link href="/signup" className="btn-primary mx-auto mt-8">
            Start your living Earth
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-hairline/10">
        <div className="container-px flex flex-col items-center justify-between gap-3 py-8 text-sm text-faint sm:flex-row">
          <div className="flex items-center gap-2">
            <LeafIcon className="h-4 w-4 text-brand" />
            <span>© 2026 Verdana</span>
          </div>
          <p>Reforest the world. Together. 🌍</p>
        </div>
      </footer>
    </div>
  );
}
