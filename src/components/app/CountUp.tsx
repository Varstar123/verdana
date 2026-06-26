"use client";

import { animate, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { resolveFormat, type FormatKey } from "@/components/app/registry";

export function CountUp({
  value,
  format,
  formatKey,
  duration = 1.1,
}: {
  value: number;
  format?: (n: number) => string;
  formatKey?: FormatKey;
  duration?: number;
}) {
  const [n, setN] = useState(0);
  const reduce = useReducedMotion();
  const fmt = format ?? resolveFormat(formatKey);

  useEffect(() => {
    if (reduce) {
      setN(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setN(v),
    });
    return () => controls.stop();
  }, [value, duration, reduce]);

  return <>{fmt ? fmt(n) : Math.round(n).toLocaleString("en-US")}</>;
}
