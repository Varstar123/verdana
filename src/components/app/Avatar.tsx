function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({
  name,
  hue,
  size = 40,
  className = "",
}: {
  name: string;
  hue: number;
  size?: number;
  className?: string;
}) {
  const bg = `linear-gradient(135deg, hsl(${hue} 72% 56%), hsl(${(hue + 55) % 360} 70% 42%))`;
  return (
    <div
      aria-hidden
      style={{ width: size, height: size, background: bg, fontSize: size * 0.4 }}
      className={`grid shrink-0 place-items-center rounded-full font-semibold text-white shadow-glass ${className}`}
    >
      {initialsOf(name)}
    </div>
  );
}
