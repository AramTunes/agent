import type { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const attachmentVariants = cva(
  "group/attachment relative flex w-full max-w-full min-w-0 shrink-0 rounded-2xl border bg-card text-ink transition-colors data-[state=error]:border-danger/40 data-[state=idle]:border-dashed",
  {
    variants: {
      size: {
        default: "gap-2 text-sm has-data-[slot=attachment-content]:px-2.5 has-data-[slot=attachment-content]:py-2 has-data-[slot=attachment-media]:p-2",
        sm: "gap-2 text-xs has-data-[slot=attachment-content]:px-2 has-data-[slot=attachment-content]:py-1.5 has-data-[slot=attachment-media]:p-1.5",
        xs: "gap-1.5 rounded-xl text-xs has-data-[slot=attachment-content]:px-1.5 has-data-[slot=attachment-content]:py-1 has-data-[slot=attachment-media]:p-1",
      },
      orientation: {
        horizontal: "min-w-40 items-center",
        vertical: "w-24 flex-col",
      },
    },
    defaultVariants: { size: "default", orientation: "horizontal" },
  },
);

const attachmentMediaVariants = cva(
  "relative flex aspect-square w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-paper text-ink group-data-[orientation=vertical]/attachment:w-full group-data-[size=sm]/attachment:w-8 group-data-[size=xs]/attachment:w-7 group-data-[size=xs]/attachment:rounded-md group-data-[state=error]/attachment:bg-danger-soft group-data-[state=error]/attachment:text-danger [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        icon: "",
        image: "*:[img]:aspect-square *:[img]:w-full *:[img]:object-cover",
      },
    },
    defaultVariants: { variant: "icon" },
  },
);

export function Attachment({
  className,
  state = "done",
  size = "default",
  orientation = "horizontal",
  ...props
}: HTMLAttributes<HTMLDivElement> & VariantProps<typeof attachmentVariants> & {
  state?: "idle" | "uploading" | "processing" | "error" | "done";
}) {
  return (
    <div
      data-slot="attachment"
      data-state={state}
      data-size={size}
      data-orientation={orientation}
      className={cn(attachmentVariants({ size, orientation }), className)}
      {...props}
    />
  );
}

export function AttachmentMedia({
  className,
  variant = "icon",
  ...props
}: HTMLAttributes<HTMLDivElement> & VariantProps<typeof attachmentMediaVariants>) {
  return <div data-slot="attachment-media" data-variant={variant} className={cn(attachmentMediaVariants({ variant }), className)} {...props} />;
}

export function AttachmentContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="attachment-content" className={cn("min-w-0 flex-1 leading-tight", className)} {...props} />;
}

export function AttachmentTitle({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="attachment-title"
      className={cn(
        "block min-w-0 truncate font-medium group-data-[state=processing]/attachment:attachment-shimmer group-data-[state=uploading]/attachment:attachment-shimmer",
        className,
      )}
      {...props}
    />
  );
}

export function AttachmentDescription({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="attachment-description"
      className={cn("mt-0.5 block min-w-0 truncate text-xs text-muted group-data-[state=error]/attachment:text-danger", className)}
      {...props}
    />
  );
}

export function AttachmentActions({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="attachment-actions" className={cn("relative z-20 flex shrink-0 items-center", className)} {...props} />;
}

export function AttachmentAction({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      data-slot="attachment-action"
      className={cn("grid size-6 place-items-center rounded-md text-muted hover:bg-paper hover:text-ink [&_svg]:size-3.5", className)}
      {...props}
    />
  );
}
