import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type AccordionItem = { id: string; title: ReactNode; content: ReactNode };

export function Accordion({
  items,
  multiple,
  defaultOpen = [],
  className,
}: {
  items: AccordionItem[];
  multiple?: boolean;
  defaultOpen?: string[];
  className?: string;
}) {
  const [open, setOpen] = useState<string[]>(defaultOpen);
  function toggle(id: string) {
    setOpen((current) => (current.includes(id) ? current.filter((item) => item !== id) : multiple ? [...current, id] : [id]));
  }
  return (
    <div className={cn("divide-y divide-current/15 rounded-xl border border-current/15", className)}>
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`acc-${item.id}`}
                onClick={() => toggle(item.id)}
                className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-start text-sm font-medium"
              >
                <span className="min-w-0">{item.title}</span>
                <ChevronDown className={cn("size-4 shrink-0 opacity-70 transition-transform duration-200", isOpen && "rotate-180")} aria-hidden="true" />
              </button>
            </h3>
            <div id={`acc-${item.id}`} className={cn("grid transition-[grid-template-rows] duration-200 ease-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
              <div className="overflow-hidden">
                <div className="px-4 pb-4 text-sm leading-7 whitespace-pre-wrap opacity-80 [overflow-wrap:anywhere]">{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
