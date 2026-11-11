import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { FloatPortal, useFloat } from "@/lib/float";
import { cn } from "@/lib/cn";

export function Combobox({
  options,
  value = "",
  onChange,
  placeholder = "جست‌وجو…",
  emptyText = "چیزی پیدا نشد",
  className,
  id,
  name,
  disabled,
  strict,
}: {
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  strict?: boolean;
}) {
  const [query, setQuery] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const listId = useId();
  const root = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const { mounted, style, theme, panel } = useFloat(open, root, { matchWidth: true, gap: 4 });

  if (value !== prevValue) {
    setPrevValue(value);
    setQuery(value);
  }

  const q = query.trim();
  const filtered = useMemo(() => {
    const folded = fold(q);
    if (!folded || q === value) return options;
    const starts = options.filter((option) => fold(option).startsWith(folded));
    const contains = options.filter((option) => !fold(option).startsWith(folded) && fold(option).includes(folded));
    return [...starts, ...contains];
  }, [options, q, value]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector(`[data-index="${index}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, index]);

  function pick(next: string) {
    setQuery(next);
    onChange?.(next);
    setOpen(false);
  }

  function commit() {
    setOpen(false);
    if (!strict || query === value) return;
    const folded = fold(query.trim());
    const exact = folded ? options.find((option) => fold(option) === folded) : undefined;
    if (exact) pick(exact);
    else if (!folded && value) pick("");
    else setQuery(value);
  }

  return (
    <div ref={root} className={cn("relative", className)}>
      <div className={cn("flex min-h-11 w-full items-center rounded-xl border border-line bg-card pe-2 ps-3 focus-within:ring-2 focus-within:ring-ink/20", disabled && "cursor-not-allowed opacity-50")}>
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          disabled={disabled}
          autoComplete="off"
          value={query}
          placeholder={placeholder}
          onChange={(event) => {
            const next = event.target.value;
            setQuery(next);
            setOpen(true);
            setIndex(0);
            if (!strict) onChange?.(next);
          }}
          onFocus={(event) => {
            setOpen(true);
            if (query === value) event.currentTarget.select();
          }}
          onBlur={() => setTimeout(commit, 120)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setIndex((current) => Math.min(filtered.length - 1, current + 1));
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setIndex((current) => Math.max(0, current - 1));
            }
            if (event.key === "Enter" && open && filtered[index]) {
              event.preventDefault();
              pick(filtered[index]);
            }
            if (event.key === "Escape") setOpen(false);
          }}
          className="h-11 min-w-0 flex-1 bg-transparent pe-1 text-sm text-ink outline-none placeholder:text-muted disabled:cursor-not-allowed"
        />
        <ChevronDown className={cn("size-4 text-muted transition-transform", open && "rotate-180")} />
      </div>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <FloatPortal open={open} mounted={mounted} style={style} theme={theme} panelRef={panel} className="fixed z-[80]">
        <ul id={listId} ref={listRef} role="listbox" className="max-h-56 overflow-auto rounded-xl border border-line bg-card p-1 text-sm text-ink shadow-lg">
          {filtered.length === 0 ? <li className="px-2.5 py-2 text-muted">{emptyText}</li> : null}
          {filtered.map((option, i) => (
            <li
              key={option}
              role="option"
              data-index={i}
              aria-selected={option === value}
              onMouseDown={(event) => {
                event.preventDefault();
                pick(option);
              }}
              onMouseEnter={() => setIndex(i)}
              className={cn("flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2", i === index && "bg-paper")}
            >
              <span>
                {q && q !== value && option.startsWith(q) ? (
                  <>
                    <span className="font-semibold">{q}</span>
                    {option.slice(q.length)}
                  </>
                ) : (
                  option
                )}
              </span>
              {option === value ? <Check className="size-3.5 shrink-0" /> : null}
            </li>
          ))}
        </ul>
      </FloatPortal>
    </div>
  );
}

function fold(value: string) {
  return value.replace(/ي/g, "ی").replace(/ى/g, "ی").replace(/ك/g, "ک").replace(/[آأإ]/g, "ا").replace(/[\s‌]+/g, "");
}
