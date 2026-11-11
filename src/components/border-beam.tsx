import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Light traveling around a border. Matches the vibefarsi border-beam motion. */
export function BorderBeam({
  children,
  className,
  duration = 4,
  color = "#fafafa",
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
  color?: string;
}) {
  return (
    <div className={cn("relative inline-flex overflow-hidden rounded-full p-px", className)}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[-100%]"
        style={{
          background: `conic-gradient(from var(--beam-angle), transparent 0 78%, ${color} 92%, transparent 100%)`,
          animation: `beam ${duration}s linear infinite`,
        }}
      />
      <div className="relative rounded-full bg-black">{children}</div>
    </div>
  );
}
