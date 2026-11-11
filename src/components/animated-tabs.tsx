import { cn } from "@/lib/cn";

export function AnimatedTabs({
  items,
  value,
  onChange,
  className,
}: {
  items: { label: string; hint?: string }[];
  value: number;
  onChange: (index: number) => void;
  className?: string;
}) {
  const count = Math.max(items.length, 1);
  const index = Math.min(Math.max(value, 0), count - 1);
  return (
    <div role="tablist" className={cn("relative flex w-max min-w-full rounded-lg border border-line bg-paper p-1", className)}>
      <span
        aria-hidden="true"
        className="absolute inset-y-1 rounded-md bg-ink transition-[inset-inline-start] duration-300 ease-out"
        style={{ width: `calc((100% - 0.5rem) / ${count})`, insetInlineStart: `calc(0.25rem + ${index} * (100% - 0.5rem) / ${count})` }}
      />
      {items.map((item, itemIndex) => {
        const active = index === itemIndex;
        return (
          <button
            key={`${item.label}-${item.hint ?? itemIndex}`}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(itemIndex)}
            className="relative z-10 flex min-w-20 flex-1 cursor-pointer flex-col items-center px-1 py-1.5"
          >
            <span className={cn("whitespace-nowrap text-sm leading-5 transition-colors duration-300", active ? "font-semibold text-on-ink" : "text-ink")}>
              {item.label}
            </span>
            {item.hint ? (
              <span className={cn("whitespace-nowrap text-xs leading-4 transition-colors duration-300", active ? "text-on-ink/80" : "text-muted")}>
                {item.hint}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
