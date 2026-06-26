import type { ComponentType, SVGProps } from "react";
import {
  TreeIcon,
  LeafIcon,
  RecycleIcon,
  HeartIcon,
  BoltIcon,
  FlameIcon,
  DropletIcon,
  StarIcon,
  GlobeIcon,
  UsersIcon,
  ShieldCheckIcon,
  TrophyIcon,
} from "@/components/icons";
import { formatCompact } from "@/lib/scoring";

/**
 * String → component / formatter maps. Server Components can't pass functions
 * across the RSC boundary to Client Components, so they pass these string keys
 * instead and the client resolves them here.
 */

export type IconKey =
  | "tree"
  | "leaf"
  | "recycle"
  | "heart"
  | "bolt"
  | "flame"
  | "droplet"
  | "star"
  | "globe"
  | "users"
  | "shield"
  | "trophy";

export const ICONS: Record<IconKey, ComponentType<SVGProps<SVGSVGElement>>> = {
  tree: TreeIcon,
  leaf: LeafIcon,
  recycle: RecycleIcon,
  heart: HeartIcon,
  bolt: BoltIcon,
  flame: FlameIcon,
  droplet: DropletIcon,
  star: StarIcon,
  globe: GlobeIcon,
  users: UsersIcon,
  shield: ShieldCheckIcon,
  trophy: TrophyIcon,
};

export type FormatKey = "compact" | "usd" | "plain";

export function resolveFormat(
  key?: FormatKey,
): ((n: number) => string) | undefined {
  switch (key) {
    case "compact":
      return (n) => formatCompact(n);
    case "usd":
      return (n) => `$${formatCompact(n)}`;
    default:
      return undefined;
  }
}
