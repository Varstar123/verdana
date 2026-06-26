import type { MonthlyPoint } from "@/lib/types";

/**
 * Lightweight SVG bar chart (no chart lib). Bars grow in via CSS keyframes.
 */
export function BarChart({
  data,
  height = 160,
  color = "#22A155",
}: {
  data: MonthlyPoint[];
  height?: number;
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const gap = 8;
  const barW = 100 / data.length;

  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
      role="img"
      aria-label="Contribution chart"
    >
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="0.35" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const h = (d.value / max) * (height - 22);
        const x = i * barW;
        return (
          <g key={`${d.label}-${i}`}>
            <rect
              x={x + gap / 2}
              y={height - 18 - h}
              width={barW - gap}
              height={h}
              rx={2.5}
              fill="url(#barGrad)"
              style={{
                transformOrigin: `center ${height - 18}px`,
                animation: `barGrow 0.7s ${i * 0.04}s cubic-bezier(0.22,1,0.36,1) both`,
              }}
            />
            <text
              x={x + barW / 2}
              y={height - 5}
              textAnchor="middle"
              className="fill-faint"
              style={{ fontSize: 4.5 }}
            >
              {d.label}
            </text>
          </g>
        );
      })}
      <style>{`@keyframes barGrow{from{transform:scaleY(0)}to{transform:scaleY(1)}}`}</style>
    </svg>
  );
}
