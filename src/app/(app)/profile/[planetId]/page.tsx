import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getProfileByPlanetId,
  getLeaderboard,
  GLOBAL_RANK,
  DEMO_PROFILE,
} from "@/lib/community";
import {
  computeEcoScore,
  computeEarthHealth,
  getEarthStage,
  getLevel,
  formatCompact,
} from "@/lib/scoring";
import { EarthScene } from "@/components/earth/EarthScene";
import { Avatar } from "@/components/app/Avatar";
import { BadgeChip } from "@/components/app/BadgeChip";
import { FollowButton } from "@/components/app/FollowButton";
import { BADGES } from "@/lib/scoring";
import { getSession } from "@/lib/session";
import { isFirebaseAdminConfigured } from "@/lib/env";
import { getFollowState } from "@/app/(app)/social-actions";
import {
  StarIcon,
  MapPinIcon,
  FlameIcon,
  TreeIcon,
  LeafIcon,
  RecycleIcon,
  HeartIcon,
  TrophyIcon,
} from "@/components/icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ planetId: string }>;
}): Promise<Metadata> {
  const { planetId } = await params;
  const profile = getProfileByPlanetId(planetId);
  return { title: profile ? `${profile.displayName} (${profile.planetId})` : "Profile" };
}

function rankFor(planetId: string, id: string): number | null {
  if (id === DEMO_PROFILE.id) return GLOBAL_RANK.rank;
  const board = getLeaderboard("ecoScore");
  return board.find((e) => e.planetId === planetId)?.rank ?? null;
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ planetId: string }>;
}) {
  const { planetId } = await params;
  const profile = getProfileByPlanetId(planetId);
  if (!profile) notFound();

  const s = profile.stats;
  const ecoScore = computeEcoScore(s);
  const level = getLevel(ecoScore);
  const health = computeEarthHealth(ecoScore);
  const { stage } = getEarthStage(health);
  const rank = rankFor(profile.planetId, profile.id);

  const session = await getSession();
  const isYou = profile.planetId === session.profile.planetId;
  const persisted = isFirebaseAdminConfigured;
  const initialFollowing = persisted ? await getFollowState(profile.planetId) : false;

  const miniStats = [
    { label: "Trees", value: s.treesPlanted, icon: TreeIcon },
    { label: "CO₂ kg", value: s.co2OffsetKg, icon: LeafIcon, fmt: formatCompact },
    { label: "Plastic kg", value: s.plasticRemovedKg, icon: RecycleIcon },
    { label: "Donated", value: s.donationsUsd, icon: HeartIcon, fmt: (n: number) => `$${formatCompact(n)}` },
  ];

  return (
    <div className="pb-10">
      {/* Cover */}
      <div
        className="relative h-44 w-full sm:h-56"
        style={{
          background: `linear-gradient(120deg, hsl(${profile.avatarHue} 60% 28%), hsl(${(profile.avatarHue + 70) % 360} 55% 22%))`,
        }}
      >
        <div className="aurora-bg opacity-50" />
      </div>

      <div className="container-px">
        {/* Header */}
        <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <Avatar
              name={profile.displayName}
              hue={profile.avatarHue}
              size={104}
              className="ring-4 ring-canvas"
            />
            <div className="pb-1">
              <h1 className="font-display text-2xl font-semibold text-ink">
                {profile.displayName}
              </h1>
              <p className="font-mono text-sm text-faint">{profile.planetId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pb-1">
            {!isYou && (
              <FollowButton
                targetPlanetId={profile.planetId}
                targetName={profile.displayName}
                persisted={persisted}
                initialFollowing={initialFollowing}
              />
            )}
            {isYou && (
              <span className="btn-secondary cursor-default">Your profile</span>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold text-white"
            style={{ background: level.accent }}
          >
            <StarIcon className="h-3.5 w-3.5" /> Lv {level.index + 1} · {level.name}
          </span>
          {rank && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-3 py-1 text-muted">
              <TrophyIcon className="h-3.5 w-3.5" /> Rank #{rank.toLocaleString()}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-3 py-1 text-muted">
            {profile.country}
          </span>
          {profile.location && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-3 py-1 text-muted">
              <MapPinIcon className="h-3.5 w-3.5" /> {profile.location}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FB923C]/12 px-3 py-1 font-semibold text-[#FB923C]">
            <FlameIcon className="h-3.5 w-3.5" /> {s.streakDays}d streak
          </span>
        </div>

        {profile.bio && <p className="mt-4 max-w-2xl text-muted">{profile.bio}</p>}

        <div className="mt-3 flex gap-5 text-sm">
          <span>
            <span className="font-semibold text-ink">
              {profile.followers.toLocaleString()}
            </span>{" "}
            <span className="text-faint">followers</span>
          </span>
          <span>
            <span className="font-semibold text-ink">
              {profile.following.toLocaleString()}
            </span>{" "}
            <span className="text-faint">following</span>
          </span>
          {profile.org && (
            <span className="text-faint">🎓 {profile.org}</span>
          )}
        </div>

        {/* Body */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          {/* Earth */}
          <div className="card-glass relative overflow-hidden p-6">
            <p className="eyebrow">Their living Earth</p>
            <div className="mx-auto my-3 h-56 w-56">
              <EarthScene health={health} interactive={false} />
            </div>
            <p className="text-center text-sm font-semibold text-ink">
              {stage.title}
            </p>
            <p className="text-center text-xs text-faint">{health}% restored</p>
          </div>

          {/* Stats + badges */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {miniStats.map((m) => (
                <div key={m.label} className="card-glass p-4 text-center">
                  <m.icon className="mx-auto h-5 w-5 text-brand" />
                  <p className="mt-2 font-display text-xl font-semibold text-ink">
                    {m.fmt ? m.fmt(m.value) : m.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-faint">{m.label}</p>
                </div>
              ))}
            </div>

            <div className="card-glass p-6">
              <p className="eyebrow">Badges · {profile.badgeIds.length}/{BADGES.length}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {BADGES.map((b) => (
                  <BadgeChip
                    key={b.id}
                    id={b.id}
                    earned={profile.badgeIds.includes(b.id)}
                  />
                ))}
              </div>
            </div>

            <div className="card-glass p-6">
              <p className="eyebrow">Contribution timeline</p>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                  <span className="text-muted">
                    Reached <span className="font-semibold text-ink">{level.name}</span> with an eco-score of {ecoScore.toLocaleString()}.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-aurora-cyan" />
                  <span className="text-muted">
                    Planted <span className="font-semibold text-ink">{s.treesPlanted.toLocaleString()}</span> trees and offset {formatCompact(s.co2OffsetKg)} kg of CO₂.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-aurora-violet" />
                  <span className="text-muted">
                    Volunteered <span className="font-semibold text-ink">{s.volunteerHours}</span> hours and completed {s.challengesCompleted} challenges.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-faint" />
                  <span className="text-muted">
                    Joined Verdana on {new Date(profile.joinedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
