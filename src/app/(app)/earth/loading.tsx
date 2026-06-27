import { EarthSkeleton } from "@/components/app/Skeletons";

export default function Loading() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <div className="aurora-bg opacity-60" />
      <EarthSkeleton />
    </div>
  );
}
