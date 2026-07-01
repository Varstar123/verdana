/**
 * Verdana's vision & mission — the single source of truth for the purpose copy.
 *
 * Rendered by <VisionMission /> on the public landing page, the in-app
 * `/mission` page, and the dashboard. Edit the wording here and it updates
 * everywhere at once.
 */

import type { IconKey } from "@/components/app/registry";

export const MISSION_INTRO =
  "Verdana is the social network for saving the planet. We believe protecting the Earth shouldn't feel like a chore or a one-off donation — it should be something you do every day, alongside millions of others, and actually see working.";

export const VISION = {
  label: "Our vision",
  headline: "A living planet everyone can grow",
  statement:
    "A world where every person can see — and grow — their impact on a living planet, until restoring the Earth is simply part of how we live, together.",
};

export const MISSION = {
  label: "Our mission",
  headline: "Turn everyday action into real impact",
  statement:
    "To turn everyday environmental action into a shared, measurable movement — making it easy and rewarding to plant, recycle, volunteer and learn, then watch your Earth, and the world's, heal in real time.",
};

export const PRINCIPLES: {
  iconKey: IconKey;
  title: string;
  body: string;
}[] = [
  {
    iconKey: "shield",
    title: "Real, verified action",
    body: "Impact comes from genuine effort across recycling, volunteering, planting and learning — not just money.",
  },
  {
    iconKey: "globe",
    title: "Impact you can see",
    body: "Every action heals your living 3D Earth, so progress is something you watch happen, not just a number on a page.",
  },
  {
    iconKey: "users",
    title: "Better together",
    body: "Restoring the planet is a team sport. As a global community we grow faster than any of us could alone.",
  },
];
