import { Link } from "@tanstack/react-router";
import Avatar from "boring-avatars";
import { Check, Copy, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { toast } from "sonner";
import { Button, Skeleton } from "@/components/ui";
import { faNum } from "@/lib/booking/fa";
import { avatarColors, readPageAvatar } from "@/lib/page-avatar";

const message = "برای تماس با ما از طریق لینک اقدام کنید";
const shareText = (url: string) => `سلام، وقت بخیر\nاگه می‌خوای با ما در تماس باشی از طریق لینک زیر می‌تونی اقدام کنی\n${url}`;

const posters = [
  { id: "x", label: "پست ایکس / توییتر", w: 1500, h: 675 },
  { id: "facebook", label: "پست فیسبوک", w: 1200, h: 630 },
  { id: "instagram", label: "پست اینستاگرام", w: 1080, h: 1350 },
  { id: "story", label: "استوری اینستاگرام", w: 1080, h: 1920 },
] as const;

function isPhoto(value: string) {
  return value.startsWith("data:") || value.startsWith("blob:") || value.startsWith("http") || value.startsWith("/");
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    if (/^https?:/i.test(src)) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image"));
    img.src = src;
  });
}

async function loadMark(value: string) {
  const src = value.trim();
  if (isPhoto(src)) {
    try {
      return await loadImage(src);
    } catch {
      return null;
    }
  }
  const beam = src.startsWith("beam:") ? src.slice(5) : "";
  if (!beam) return null;
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:-9999px;top:0;width:280px;height:280px;pointer-events:none";
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    await new Promise<void>((resolve) => {
      root.render(<Avatar size={280} name={beam} variant="beam" colors={avatarColors} />);
      requestAnimationFrame(() => resolve());
    });
    const svg = host.querySelector("svg");
    if (!svg) return null;
    if (!svg.getAttribute("xmlns")) svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const xml = new XMLSerializer().serializeToString(svg);
    return await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`);
  } catch {
    return null;
  } finally {
    root.unmount();
    host.remove();
  }
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function ellipsis(ctx: CanvasRenderingContext2D, text: string, max: number) {
  if (ctx.measureText(text).width <= max) return text;
  let out = text;
  while (out.length > 4 && ctx.measureText(`${out}…`).width > max) out = out.slice(0, -1);
  return `${out}…`;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > max) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function drawAvatar(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, name: string, cx: number, cy: number, r: number) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  if (img) {
    const scale = Math.max((r * 2) / img.width, (r * 2) / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
  } else {
    ctx.fillStyle = "#0e6b54";
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = "#f4fff9";
    ctx.direction = "rtl";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `800 ${Math.round(r * 0.86)}px Vazirmatn, sans-serif`;
    ctx.fillText(name.trim().slice(0, 1) || "ن", cx, cy);
  }
  ctx.restore();
}

function drawQr(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, size: number) {
  roundedRect(ctx, x, y, size, size, size * 0.07);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  const pad = size * 0.07;
  ctx.drawImage(img, x + pad, y + pad, size - pad * 2, size - pad * 2);
}

async function paintPoster(width: number, height: number, name: string, url: string, avatar: HTMLImageElement | null, qr: HTMLImageElement) {
  await document.fonts.load("800 64px Vazirmatn");
  await document.fonts.load("500 32px Vazirmatn");
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.fillStyle = "#f6f3ec";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#0e6b54";
  ctx.fillRect(0, 0, width, Math.max(10, Math.round(height * 0.012)));
  const wide = width / height > 1.35;
  if (wide) {
    const pad = Math.round(width * 0.045);
    const qrSize = Math.round(height * 0.7);
    const qrX = pad;
    const qrY = Math.round((height - qrSize) / 2);
    drawQr(ctx, qr, qrX, qrY, qrSize);
    const right = width - pad;
    const left = qrX + qrSize + pad;
    const col = right - left;
    const radius = Math.round(height * 0.105);
    const avatarCy = Math.round(height * 0.36);
    drawAvatar(ctx, avatar, name, right - radius, avatarCy, radius);
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#121212";
    const nameSize = Math.round(height * 0.085);
    ctx.font = `800 ${nameSize}px Vazirmatn, sans-serif`;
    ctx.fillText(ellipsis(ctx, name, col - radius * 2 - 28), right - radius * 2 - 24, avatarCy);
    const body = Math.round(height * 0.046);
    ctx.font = `500 ${body}px Vazirmatn, sans-serif`;
    ctx.fillStyle = "#3a3a3a";
    ctx.textBaseline = "top";
    let y = avatarCy + radius + Math.round(body * 0.4);
    for (const line of wrap(ctx, message, col)) {
      ctx.fillText(line, right, y);
      y += body * 1.55;
    }
    ctx.direction = "ltr";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "#0e6b54";
    ctx.font = `500 ${Math.round(height * 0.036)}px Vazirmatn, sans-serif`;
    ctx.fillText(ellipsis(ctx, url, col), left, height - pad);
  } else {
    const pad = Math.round(width * 0.08);
    const radius = Math.round(width * 0.125);
    let y = Math.round(height * (height > width * 1.5 ? 0.14 : 0.09));
    drawAvatar(ctx, avatar, name, width / 2, y + radius, radius);
    y += radius * 2 + Math.round(width * 0.05);
    ctx.direction = "rtl";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#121212";
    const nameSize = Math.round(width * 0.058);
    ctx.font = `800 ${nameSize}px Vazirmatn, sans-serif`;
    ctx.fillText(ellipsis(ctx, name, width - pad * 2), width / 2, y);
    y += nameSize * 1.45;
    const body = Math.round(width * 0.038);
    ctx.font = `500 ${body}px Vazirmatn, sans-serif`;
    ctx.fillStyle = "#3f3f3f";
    for (const line of wrap(ctx, message, width - pad * 2)) {
      ctx.fillText(line, width / 2, y);
      y += body * 1.55;
    }
    const qrSize = Math.round(Math.min(width * 0.5, height - y - pad * 1.6));
    y += Math.round(width * 0.04);
    drawQr(ctx, qr, (width - qrSize) / 2, y, qrSize);
    y += qrSize + Math.round(width * 0.04);
    ctx.direction = "ltr";
    ctx.fillStyle = "#0e6b54";
    ctx.font = `500 ${Math.round(width * 0.03)}px Vazirmatn, sans-serif`;
    ctx.fillText(ellipsis(ctx, url, width - pad * 2), width / 2, y);
  }
  return canvas;
}

type Poster = (typeof posters)[number];
type Preview = { url: string; blob: Blob; filename: string; label: string; w: number; h: number };

function canvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("blob"))), "image/png");
  });
}

function iosDevice() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function QrDialog({
  name,
  slug,
  url,
  avatar = "",
  businessId = "",
  onClose,
}: {
  name: string;
  slug: string;
  url: string;
  avatar?: string;
  businessId?: string;
  onClose: () => void;
}) {
  const [src, setSrc] = useState("");
  const [copied, setCopied] = useState(false);
  const [menu, setMenu] = useState(false);
  const [busy, setBusy] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<Preview | null>(null);
  const target = url || (typeof window !== "undefined" ? `${window.location.origin}/b/${slug}` : `/b/${slug}`);
  const photo = (() => {
    const local = readPageAvatar(businessId, slug);
    if (isPhoto(avatar)) return avatar;
    if (isPhoto(local)) return local;
    return avatar || local;
  })();

  useEffect(() => {
    let live = true;
    import("qrcode").then((QR) => QR.toDataURL(target, { width: 640, margin: 1, color: { dark: "#121212", light: "#ffffff" } })).then((next) => {
      if (live) setSrc(next);
    });
    return () => {
      live = false;
    };
  }, [target]);

  useEffect(() => {
    if (!menu) return;
    const close = (event: MouseEvent) => {
      const node = event.target;
      if (node instanceof Node && menuRef.current?.contains(node)) return;
      setMenu(false);
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menu]);

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current.url);
    };
  }, []);

  function closePreview() {
    const current = previewRef.current;
    previewRef.current = null;
    setPreview(null);
    if (current) window.setTimeout(() => URL.revokeObjectURL(current.url), 60_000);
  }

  async function openPreview(item: Poster) {
    if (busy) return;
    setBusy(item.id);
    try {
      const QR = await import("qrcode");
      const data = await QR.toDataURL(target, { width: 900, margin: 1, color: { dark: "#121212", light: "#ffffff" } });
      const [qr, mark] = await Promise.all([loadImage(data), loadMark(photo)]);
      const canvas = await paintPoster(item.w, item.h, name || "کسب‌وکار", target, mark, qr);
      const blob = await canvasBlob(canvas);
      const next: Preview = {
        url: URL.createObjectURL(blob),
        blob,
        filename: `agent-${item.id}.png`,
        label: item.label,
        w: item.w,
        h: item.h,
      };
      if (previewRef.current) URL.revokeObjectURL(previewRef.current.url);
      previewRef.current = next;
      setPreview(next);
      setMenu(false);
    } catch {
      toast.error("ساخت تصویر نشد");
    } finally {
      setBusy("");
    }
  }

  async function share() {
    const text = shareText(target);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: name || "صفحه من", text });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success("متن اشتراک‌گذاری کپی شد");
    } catch {
      toast.error("اشتراک‌گذاری ممکن نشد");
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="بستن" onClick={onClose} />
      <div className="relative z-10 grid max-h-[92dvh] w-full max-w-sm gap-3 overflow-y-auto rounded-card border border-line bg-card p-5 text-ink shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <h2 className="min-w-0 truncate font-extrabold">{name}</h2>
          <button type="button" aria-label="بستن" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-full text-ink hover:bg-paper">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        {src ? <img src={src} alt="" className="mx-auto size-52 rounded-xl bg-white p-2" /> : <Skeleton className="mx-auto size-52" />}
        <div className="flex items-center gap-2 rounded-xl border border-line bg-paper p-2">
          <p className="min-w-0 flex-1 truncate text-left text-sm text-ink" dir="ltr">{target}</p>
          <button
            type="button"
            className="h-10 shrink-0 rounded-lg bg-ink px-3 text-sm font-semibold text-on-ink"
            onClick={() => {
              void navigator.clipboard.writeText(target).then(() => {
                setCopied(true);
                toast.success("لینک کپی شد");
                window.setTimeout(() => setCopied(false), 1600);
              }).catch(() => toast.error("کپی نشد"));
            }}
          >
            <span className="inline-flex items-center gap-1.5">
              {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
              {copied ? "کپی شد" : "کپی"}
            </span>
          </button>
        </div>
        <div ref={menuRef} className="grid gap-2">
          {slug ? (
            <Link to="/b/$slug" params={{ slug }} className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-card px-3 text-sm font-semibold">
              صفحه من
            </Link>
          ) : (
            <Button type="button" variant="quiet" disabled>صفحه من</Button>
          )}
          <div className="grid gap-2">
            <Button
              type="button"
              variant="quiet"
              aria-expanded={menu}
              disabled={!slug}
              onClick={(event) => {
                event.stopPropagation();
                setMenu((open) => !open);
              }}
            >
              دانلود
            </Button>
            {menu ? (
              <div className="rounded-xl border border-line bg-paper p-1">
                {posters.map((item) => (
                  <button key={item.id} type="button" className="w-full rounded-lg px-3 py-2 text-start hover:bg-card disabled:opacity-50" disabled={Boolean(busy)} onClick={() => void openPreview(item)}>
                    <span className="block text-sm font-semibold">{busy === item.id ? "در حال ساخت…" : item.label}</span>
                    <span className="mt-0.5 block text-xs text-muted" dir="ltr">{faNum(item.w)}×{faNum(item.h)}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <Button type="button" variant="signup" disabled={!slug} onClick={() => void share()}>
            اشتراک‌گذاری
          </Button>
        </div>
      </div>
      {preview ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4">
          <div className="relative z-10 flex max-h-[92dvh] w-full max-w-sm flex-col gap-3 rounded-card border border-line bg-card p-4 text-ink shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate font-extrabold">{preview.label}</h2>
                <p className="text-xs text-muted" dir="ltr">{faNum(preview.w)}×{faNum(preview.h)}</p>
              </div>
              <button type="button" aria-label="بستن" onClick={closePreview} className="grid size-9 shrink-0 place-items-center rounded-full text-ink hover:bg-paper">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <img src={preview.url} alt={preview.label} className="max-h-[60dvh] w-full rounded-xl bg-paper object-contain" />
            <a
              href={preview.url}
              download={preview.filename}
              className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--signup-bg)] text-sm font-semibold text-[var(--signup-fg)]"
              onClick={(event) => {
                const current = previewRef.current;
                if (!current) return;
                const file = new File([current.blob], current.filename, { type: "image/png" });
                if (iosDevice() && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
                  event.preventDefault();
                  void navigator.share({ files: [file], title: name || current.label }).catch((error) => {
                    if (error instanceof Error && error.name === "AbortError") return;
                    toast.error("دانلود تصویر نشد");
                  });
                }
              }}
            >
              دانلود
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
