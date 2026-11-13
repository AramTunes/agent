import { ChevronLeft, ChevronRight } from "lucide-react";
import { faNum } from "@/lib/booking/fa";
import { cn } from "@/lib/cn";

export function Pagination({
  page,
  total,
  onChange,
  siblings = 1,
  size = "md",
  className,
}: {
  page: number;
  total: number;
  onChange: (page: number) => void;
  siblings?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  if (total < 1) return null;
  const btn = cn(
    size === "sm" ? "size-8 text-xs" : "size-9 text-sm",
    "flex cursor-pointer items-center justify-center rounded-md border border-line text-muted transition-colors hover:bg-paper hover:text-ink disabled:cursor-not-allowed disabled:opacity-40",
  );
  return (
    <nav aria-label="صفحه‌بندی" className={cn("flex items-center gap-1", className)}>
      <button type="button" aria-label="صفحه‌ی قبل" disabled={page <= 1} onClick={() => onChange(page - 1)} className={btn}>
        <ChevronRight className="size-4" />
      </button>
      {pageRange(page, total, siblings).map((item, index) =>
        item === "…" ? (
          <span key={`gap-${index}`} className="px-1 text-muted">…</span>
        ) : (
          <button
            key={item}
            type="button"
            aria-current={item === page ? "page" : undefined}
            onClick={() => onChange(item)}
            className={cn(btn, item === page && "border-jade bg-jade font-semibold text-on-jade hover:bg-jade hover:text-on-jade")}
          >
            {faNum(item)}
          </button>
        ),
      )}
      <button type="button" aria-label="صفحه‌ی بعد" disabled={page >= total} onClick={() => onChange(page + 1)} className={btn}>
        <ChevronLeft className="size-4" />
      </button>
    </nav>
  );
}

function pageRange(page: number, total: number, siblings: number): (number | "…")[] {
  const pages = new Set<number>([1, total]);
  for (let next = page - siblings; next <= page + siblings; next++) {
    if (next >= 1 && next <= total) pages.add(next);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((item, index) => {
    if (index > 0 && item - sorted[index - 1] > 1) out.push("…");
    out.push(item);
  });
  return out;
}
