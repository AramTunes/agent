import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const thickness = {
  thin: "[scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5",
  md: "[scrollbar-width:auto] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2",
} as const;

export const ScrollArea = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    orientation?: "vertical" | "horizontal" | "both";
    size?: "thin" | "md";
    children?: ReactNode;
  }
>(function ScrollArea({ orientation = "vertical", size = "thin", className, children, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="scroll-area"
      className={cn(
        "min-h-0 min-w-0",
        orientation === "vertical" && "overflow-y-auto overflow-x-hidden",
        orientation === "horizontal" && "overflow-x-auto overflow-y-hidden",
        orientation === "both" && "overflow-auto",
        "[scrollbar-color:var(--line)_transparent]",
        "[&::-webkit-scrollbar-track]:bg-transparent",
        "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-line",
        "hover:[&::-webkit-scrollbar-thumb]:bg-ink/35",
        "[&::-webkit-scrollbar-corner]:bg-transparent",
        thickness[size],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
