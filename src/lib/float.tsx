import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

export function themeOf(el: Element | null | undefined) {
  return el?.closest("[data-theme]")?.getAttribute("data-theme") ?? undefined;
}

export type FloatSide = "top" | "bottom";
export type FloatAlign = "start" | "center" | "end";

export function floatStyle(
  el: HTMLElement,
  {
    side = "bottom",
    align = "start",
    gap = 8,
    panel,
    matchWidth,
  }: {
    side?: FloatSide;
    align?: FloatAlign;
    gap?: number;
    panel?: HTMLElement | null;
    matchWidth?: boolean;
  } = {},
): CSSProperties {
  const r = el.getBoundingClientRect();
  const rtl = getComputedStyle(el).direction === "rtl";
  const ph = panel?.offsetHeight ?? 0;
  const pw = panel?.offsetWidth ?? 0;
  let actual: FloatSide = side;
  if (ph) {
    if (side === "bottom" && r.bottom + gap + ph > window.innerHeight && r.top - gap - ph >= gap) actual = "top";
    else if (side === "top" && r.top - gap - ph < gap && r.bottom + gap + ph <= window.innerHeight) actual = "bottom";
  }
  const s: CSSProperties = {};
  if (actual === "bottom") s.top = r.bottom + gap;
  else s.bottom = window.innerHeight - r.top + gap;
  if (matchWidth) {
    s.width = r.width;
    s.left = r.left;
  } else if (align === "center") s.left = Math.max(gap, r.left + r.width / 2 - pw / 2);
  else if ((align === "start") === !rtl) s.left = r.left;
  else s.right = window.innerWidth - r.right;
  return s;
}

export function useFloat(
  open: boolean,
  anchor: RefObject<HTMLElement | null>,
  opts: { side?: FloatSide; align?: FloatAlign; gap?: number; matchWidth?: boolean } = {},
) {
  const { side = "bottom", align = "start", gap = 8, matchWidth = false } = opts;
  const [mounted, setMounted] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({});
  const [theme, setTheme] = useState<string | undefined>();
  const panel = useRef<HTMLDivElement>(null);

  const update = useCallback(() => {
    const el = anchor.current;
    if (!el) return;
    setStyle(floatStyle(el, { side, align, gap, matchWidth, panel: panel.current }));
    setTheme(themeOf(el));
  }, [anchor, side, align, gap, matchWidth]);

  useEffect(() => setMounted(true), []);

  useLayoutEffect(() => {
    if (!open) return;
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, update]);

  return { mounted, style, theme, panel, update };
}

export function FloatPortal({
  open,
  mounted,
  style,
  theme,
  panelRef,
  className,
  children,
}: {
  open: boolean;
  mounted: boolean;
  style: CSSProperties;
  theme?: string;
  panelRef?: RefObject<HTMLDivElement | null>;
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
  if (!mounted || !open) return null;
  return createPortal(
    <div ref={panelRef} data-theme={theme} style={style} className={className}>
      {children}
    </div>,
    document.body,
  );
}
