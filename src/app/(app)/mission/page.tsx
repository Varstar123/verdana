import type { Metadata } from "next";
import { VisionMission } from "@/components/VisionMission";

export const metadata: Metadata = { title: "Our Mission" };

export default function MissionPage() {
  return (
    <div className="container-px py-12">
      <VisionMission variant="full" />
    </div>
  );
}
