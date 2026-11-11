import { useEffect, useRef, useState } from "react";
import { faNum } from "@/lib/booking/fa";

export function ProgressRing({
  value,
  size = 48,
  stroke = 5,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const radius = (size - stroke) / 2;
  const turn = 2 * Math.PI * radius;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setShown(pct);
      return;
    }
    const watcher = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      setShown(pct);
      watcher.disconnect();
    });
    watcher.observe(node);
    return () => watcher.disconnect();
  }, [pct]);

  return (
    <span
      ref={ref}
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `${faNum(pct)} درصد`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--jade)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={turn}
          strokeDashoffset={turn - (turn * shown) / 100}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <span className="absolute text-xs font-bold tabular-nums">{faNum(shown)}٪</span>
    </span>
  );
}
