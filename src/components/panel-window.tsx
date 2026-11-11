import { ChevronRight, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

function useDismissEscape(onDismiss: () => void, enabled: boolean) {
  const ignoreUntil = useRef(0);
  const blurred = useRef(false);
  useEffect(() => {
    if (!enabled) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || Date.now() < ignoreUntil.current) return;
      onDismiss();
    };
    const onClick = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const input = target instanceof HTMLInputElement && target.type === "file" ? target : target.closest("label")?.querySelector('input[type="file"]');
      if (input) ignoreUntil.current = Date.now() + 60_000;
    };
    const onChange = (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement && target.type === "file") ignoreUntil.current = Date.now() + 700;
    };
    const onBlur = () => {
      blurred.current = true;
    };
    const onFocus = () => {
      if (!blurred.current) return;
      blurred.current = false;
      if (ignoreUntil.current > Date.now()) ignoreUntil.current = Date.now() + 700;
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick, true);
    document.addEventListener("change", onChange, true);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("change", onChange, true);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
    };
  }, [enabled, onDismiss]);
}

export function useIsDesktop() {
  const [desktop, setDesktop] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktop(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return desktop;
}

export function CenterWindow({ title, onClose, onBack, closeOnEscape = true, z = "z-50", children }: { title: string; onClose: () => void; onBack?: () => void; closeOnEscape?: boolean; z?: string; children: ReactNode }) {
  const titleId = useId();
  useDismissEscape(onClose, closeOnEscape);
  return (
    <div className={`fixed inset-0 ${z} flex items-center justify-center p-4`}>
      <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-label="بستن" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 flex max-h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-[1.375rem] border border-line bg-card text-ink shadow-[0_20px_50px_-20px_rgb(0_0_0/0.8)] [clip-path:inset(0_round_1.375rem)]"
      >
        <div className="grid min-h-0 gap-4 overflow-y-auto overscroll-contain p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-1">
            {onBack ? (
              <button type="button" aria-label="برگشت" onClick={onBack} className="grid size-9 shrink-0 place-items-center rounded-full text-ink hover:bg-paper">
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
            ) : null}
            <h2 id={titleId} className="truncate text-base font-semibold">{title}</h2>
          </div>
          <button type="button" aria-label="بستن" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-full text-ink hover:bg-paper">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        {children}
        </div>
      </div>
    </div>
  );
}

export function HalfSheet({ title, onClose, onBack, closeOnEscape = true, z = "z-50", bare = false, initialLevel = 1, children }: { title: string; onClose: () => void; onBack?: () => void; closeOnEscape?: boolean; z?: string; bare?: boolean; initialLevel?: number; children: ReactNode }) {
  const heights = ["42dvh", "68dvh", "calc(100dvh - 4rem)"];
  const [level, setLevel] = useState(initialLevel);
  const [leaving, setLeaving] = useState(false);
  useDismissEscape(() => setLeaving(true), closeOnEscape);
  function close() {
    setLeaving(true);
  }
  function resizeFrom(event: ReactPointerEvent<HTMLButtonElement>) {
    const startY = event.clientY;
    const start = level;
    const pointerId = event.pointerId;
    event.currentTarget.setPointerCapture(pointerId);
    const end = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      const dy = startY - ev.clientY;
      const steps = Math.abs(dy) > 140 ? Math.sign(dy) * 2 : Math.abs(dy) > 28 ? Math.sign(dy) : 0;
      setLevel(Math.min(2, Math.max(0, start + steps)));
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  }
  return (
    <div className={`fixed inset-0 ${z}`}>
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="بستن" onClick={close} />
      <div
        className={`absolute inset-x-0 bottom-0 flex flex-col overflow-hidden rounded-t-2xl border border-line bg-card shadow-xl transition-[height] duration-200 [clip-path:inset(0_round_1rem_1rem_0_0)] ${leaving ? "sheet-down" : "sheet-up"}`}
        style={{ height: heights[level] }}
        onAnimationEnd={() => {
          if (leaving) onClose();
        }}
      >
        <div className="relative flex items-center justify-between px-4 pt-2 pb-5">
          <div className="flex min-w-0 items-center gap-1">
            {onBack ? (
              <button type="button" aria-label="برگشت" onClick={onBack} className="grid size-9 shrink-0 place-items-center text-ink">
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
            ) : null}
            <h2 className="truncate font-bold">{title}</h2>
          </div>
          <button type="button" aria-label="اندازه صفحه" onPointerDown={resizeFrom} className="absolute left-1/2 top-1 -translate-x-1/2 px-8 py-2 touch-none">
            <span className="block h-1.5 w-10 rounded-full bg-muted/50" />
          </button>
          <button type="button" aria-label="بستن" onClick={close} className="grid size-9 place-items-center text-ink">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className={bare ? "relative min-h-0 flex-1 overflow-hidden" : "min-h-0 flex-1 overflow-y-auto px-4 pb-6"}>{children}</div>
      </div>
    </div>
  );
}

export function AppWindow({ title, onClose, onBack, closeOnEscape = true, z = "z-50", initialLevel = 2, children }: { title: string; onClose: () => void; onBack?: () => void; closeOnEscape?: boolean; z?: string; initialLevel?: number; children: ReactNode }) {
  const desktop = useIsDesktop();
  if (desktop) return <CenterWindow title={title} onClose={onClose} onBack={onBack} closeOnEscape={closeOnEscape} z={z}>{children}</CenterWindow>;
  return <HalfSheet title={title} onClose={onClose} onBack={onBack} closeOnEscape={closeOnEscape} z={z} initialLevel={initialLevel}>{children}</HalfSheet>;
}
