import { Link } from "@tanstack/react-router";
import { trackClickFn, trackBlockFn } from "@/lib/api";
import {
  AtSign,
  Briefcase,
  CalendarPlus,
  ChevronLeft,
  Download,
  File,
  FileText,
  Globe,
  GraduationCap,
  HelpCircle,
  Image as ImageIcon,
  Instagram,
  Link2,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Minus,
  Newspaper,
  Phone,
  Send,
  Share,
  Share2,
  ShoppingBag,
  Twitter,
  Type,
  Users,
  UtensilsCrossed,
  Video,
  X,
  Youtube,
} from "lucide-react";
import { createContext, useContext, useEffect, useRef, useState, type CSSProperties } from "react";
import { blockRadius, buttonChrome, pageBackground, resolveTheme, type PageDesign } from "@/lib/page-design";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { PageMark } from "@/lib/page-avatar";
import { BorderBeam } from "@/components/border-beam";
import { cn } from "@/lib/cn";
import { Accordion } from "@/components/ui/accordion";
import { Attachment, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentMedia, AttachmentTitle } from "@/components/ui/attachment";
import { pageIcon } from "@/lib/page-icons";
import { faFileSize, faNum } from "@/lib/booking/fa";

const kinds = [
  { type: "link", label: "لینک", hint: "یک پیوند بیرون از صفحه", icon: Link2 },
  { type: "contact", label: "تماس", hint: "شماره و راه‌های ارتباطی", icon: Phone },
  { type: "address", label: "آدرس", hint: "نشانی و موقعیت", icon: MapPin },
  { type: "booking", label: "رزرو نوبت", hint: "دیدن زمان‌های آزاد", icon: CalendarPlus },
  { type: "products", label: "محصولات", hint: "فهرست کالاها", icon: ShoppingBag },
  { type: "menu", label: "منوی دیجیتال", hint: "غذا و قیمت", icon: UtensilsCrossed },
  { type: "services", label: "خدمات", hint: "خدمت‌ها و قیمت", icon: Briefcase },
  { type: "form", label: "فرم‌ساز", hint: "ارسال اطلاعات", icon: FileText },
  { type: "event", label: "ایونت", hint: "زمان و جزئیات", icon: CalendarPlus },
  { type: "course", label: "دوره آموزشی", hint: "سرفصل و ثبت‌نام", icon: GraduationCap },
  { type: "blog", label: "وبلاگ", hint: "نوشته‌های تازه", icon: Newspaper },
  { type: "text", label: "متن ساده", hint: "یک توضیح کوتاه", icon: Type },
  { type: "social", label: "شبکه اجتماعی", hint: "پیج‌ها و کانال‌ها", icon: Share2 },
  { type: "faq", label: "سوالات متداول", hint: "پرسش و پاسخ", icon: HelpCircle },
  { type: "team", label: "تیم", hint: "اعضای مجموعه", icon: Users },
  { type: "gallery", label: "عکس", hint: "عکس‌های صفحه", icon: ImageIcon },
  { type: "video", label: "فیلم", hint: "ویدیو و لینک", icon: Video },
  { type: "resume", label: "رزومه", hint: "سوابق و مهارت", icon: FileText },
  { type: "file", label: "فایل", hint: "دریافت فایل", icon: File },
  { type: "divider", label: "جداکننده", hint: "", icon: Minus },
] as const;

export type ContactKind = "phone" | "email" | "whatsapp" | "telegram" | "eitaa" | "bale" | "rubika";
export type ContactItem = {
  id: string;
  kind: string;
  title?: string;
  value: string;
  size?: number;
  label?: string;
  note?: string;
  image?: string;
  price?: number;
  priceTo?: number;
  status?: string;
  priceType?: string;
  sku?: string;
  link?: string;
  featured?: boolean;
  categoryId?: string;
  labels?: string[];
  unit?: string;
  variants?: { id: string; title: string; price: number; status: string }[];
};

export const contactKinds: { kind: ContactKind; label: string; field: string; placeholder: string }[] = [
  { kind: "phone", label: "شماره تماس", field: "شماره", placeholder: "09123456789" },
  { kind: "email", label: "ایمیل", field: "ایمیل", placeholder: "name@email.com" },
  { kind: "whatsapp", label: "واتساپ", field: "شماره واتساپ", placeholder: "09123456789" },
  { kind: "telegram", label: "تلگرام", field: "آیدی تلگرام", placeholder: "username" },
  { kind: "eitaa", label: "ایتا", field: "آیدی ایتا", placeholder: "username" },
  { kind: "bale", label: "بله", field: "آیدی بله", placeholder: "username" },
  { kind: "rubika", label: "روبیکا", field: "آیدی روبیکا", placeholder: "username" },
];

export function contactKind(kind: string) {
  return contactKinds.find((item) => item.kind === kind) ?? contactKinds[0];
}

export const addressKinds: { kind: string; label: string; field: string; placeholder: string }[] = [
  { kind: "google", label: "گوگل مپ", field: "نشانی لینک", placeholder: "https://" },
  { kind: "neshan", label: "نشان", field: "نشانی لینک", placeholder: "https://" },
  { kind: "waze", label: "ویز", field: "نشانی لینک", placeholder: "https://" },
  { kind: "balad", label: "بلد", field: "نشانی لینک", placeholder: "https://" },
  { kind: "text", label: "آدرس متنی", field: "آدرس", placeholder: "" },
];

export function addressKind(kind: string) {
  return addressKinds.find((item) => item.kind === kind) ?? addressKinds[4];
}

export const socialKinds: { kind: string; label: string; field: string; placeholder: string; input: "text" | "tel" | "email" | "url"; limit: number }[] = [
  { kind: "instagram", label: "اینستاگرام", field: "نام کاربری یا لینک", placeholder: "username", input: "text", limit: 200 },
  { kind: "telegram", label: "تلگرام", field: "نام کاربری یا لینک", placeholder: "username", input: "text", limit: 200 },
  { kind: "whatsapp", label: "واتساپ", field: "شماره واتساپ", placeholder: "09123456789", input: "tel", limit: 20 },
  { kind: "x", label: "ایکس/توییتر", field: "نام کاربری یا لینک", placeholder: "username", input: "text", limit: 200 },
  { kind: "youtube", label: "یوتیوب", field: "لینک یا شناسه", placeholder: "https://", input: "url", limit: 200 },
  { kind: "linkedin", label: "لینکدین", field: "لینک", placeholder: "https://", input: "url", limit: 200 },
  { kind: "kik", label: "کیک", field: "نام کاربری", placeholder: "username", input: "text", limit: 80 },
  { kind: "bale", label: "بله", field: "آیدی بله", placeholder: "username", input: "text", limit: 80 },
  { kind: "rubika", label: "روبیکا", field: "آیدی روبیکا", placeholder: "username", input: "text", limit: 80 },
  { kind: "igap", label: "آیگپ", field: "نام کاربری", placeholder: "username", input: "text", limit: 80 },
  { kind: "phone", label: "تماس", field: "شماره", placeholder: "09123456789", input: "tel", limit: 20 },
  { kind: "email", label: "ایمیل", field: "ایمیل", placeholder: "name@email.com", input: "email", limit: 80 },
  { kind: "website", label: "وبسایت", field: "نشانی وبسایت", placeholder: "https://", input: "url", limit: 200 },
];

export function socialKind(kind: string) {
  return socialKinds.find((item) => item.kind === kind) ?? socialKinds[0];
}

export function socialValueOk(kind: string, value: string) {
  const raw = value.trim();
  if (!raw) return false;
  if (kind === "phone" || kind === "whatsapp") {
    const digits = onlyDigits(raw);
    return digits.length >= 8 && digits.length <= 15;
  }
  if (kind === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw);
  if (/^https?:\/\/\S+$/i.test(raw)) return true;
  if (kind === "website" || kind === "linkedin" || kind === "youtube") return /^[\w.-]+\.[a-z]{2,}([/?#]\S*)?$/i.test(raw) || (kind !== "website" && /^@?[\w.-]{2,64}$/.test(raw));
  return /^@?[\w.]{2,64}$/.test(raw);
}

export function socialHref(item: { kind: string; value: string }) {
  const raw = item.value.trim();
  if (item.kind === "phone") return `tel:${onlyDigits(raw)}`;
  if (item.kind === "email") return `mailto:${raw}`;
  if (item.kind === "whatsapp") {
    if (/^https?:\/\//i.test(raw)) return raw;
    let number = onlyDigits(raw);
    if (number.startsWith("0")) number = `98${number.slice(1)}`;
    return `https://wa.me/${number}`;
  }
  if (/^https?:\/\//i.test(raw)) return raw;
  if (item.kind === "website") return `https://${raw}`;
  const handle = raw.replace(/^@/, "");
  if (item.kind === "youtube") return raw.includes(".") ? `https://${raw}` : `https://youtube.com/@${handle}`;
  if (item.kind === "linkedin") return raw.includes(".") ? `https://${raw}` : `https://www.linkedin.com/in/${handle}`;
  const bases: Record<string, string> = {
    instagram: "https://instagram.com/",
    telegram: "https://t.me/",
    x: "https://x.com/",
    kik: "https://kik.me/",
    bale: "https://ble.ir/",
    rubika: "https://rubika.ir/",
    igap: "https://igap.net/",
  };
  return `${bases[item.kind] ?? "https://"}${handle}`;
}

export type CustomerBlock = { id: string; type: string; active?: boolean; starred?: boolean; title?: string; url?: string; icon?: string; body?: string; items?: ContactItem[]; align?: string; image?: string; imagePos?: string; layout?: string; currency?: string };

function linkHost(url?: string) {
  if (!url) return "";
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function kindOf(type: string) {
  return kinds.find((item) => item.type === type) ?? { type, label: "بلوک", hint: "", icon: Link2 };
}

async function sharePage(url: string, name: string) {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: name, url });
      return;
    } catch {
      return;
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    toast.success("لینک صفحه کپی شد");
  } catch {
    toast.error("اشتراک‌گذاری ممکن نشد");
  }
}

type Face = { card: string; text: string; page: string; muted: string; radius: string; layout: "list" | "card"; columns: 1 | 2; chrome: CSSProperties };
const FaceContext = createContext<Face | null>(null);

function faceFrom(design: PageDesign, tokens: ReturnType<typeof resolveTheme>): Face {
  const themed = design.theme !== "dark";
  return {
    card: themed ? tokens.button : tokens.card,
    text: themed ? tokens.onButton : tokens.text,
    page: tokens.text,
    muted: tokens.muted,
    radius: blockRadius(design),
    layout: design.layout,
    columns: design.columns,
    chrome: buttonChrome(design, tokens),
  };
}

function useRow() {
  const face = useContext(FaceContext);
  if (!face) {
    return { face, className: "flex w-full items-center gap-3.5 rounded-[1.25rem] bg-[#1c1c1c] px-4 py-3.5 text-start text-white", style: undefined as CSSProperties | undefined };
  }
  const card = face.layout === "card";
  return {
    face,
    className: card ? "flex aspect-square w-full flex-col items-center justify-center gap-2 p-3 text-center" : "flex w-full items-center gap-3.5 px-4 py-3.5 text-start",
    style: face.chrome,
  };
}

export function CustomerLink({
  name,
  bio,
  avatar,
  slug,
  blocks,
  image,
  shareUrl,
  fill = false,
  className = "",
  design,
}: {
  name: string;
  bio: string;
  avatar?: string;
  slug: string;
  blocks: CustomerBlock[];
  image?: string;
  shareUrl?: string;
  fill?: boolean;
  className?: string;
  design?: PageDesign;
}) {
  const shown = blocks.filter((item) => item.active !== false && item.type !== "resume" && item.type !== "design");
  const footers = shown.filter((item) => item.type === "social" && item.layout === "footer");
  const listed = shown.filter((item) => !(item.type === "social" && item.layout === "footer"));
  const photo = image || avatar || "";
  const tokens = design ? resolveTheme(design) : null;
  const face: Face | null = tokens && design ? faceFrom(design, tokens) : null;
  const row = useRowFrom(face);
  const frame = cn("relative isolate overflow-hidden", design ? "" : "bg-black text-white", fill ? "h-full" : "h-dvh lg:h-full lg:min-h-0");
  return (
    <FaceContext.Provider value={face}>
    <div className={frame} style={tokens ? { background: tokens.bg, color: tokens.text } : undefined}>
      {design ? <PageBackdrop design={design} /> : null}
      <div className={cn("relative z-10 h-full overflow-y-auto", className)}>
      <div className="flex min-h-full flex-col px-6">
        <div className="flex items-center justify-between pt-6">
          <img src="/favicon.svg" alt="" className="size-11 rounded-xl" />
          <button
            type="button"
            aria-label="اشتراک‌گذاری لینک صفحه"
            className="grid size-11 place-items-center rounded-full hover:bg-black/10"
            style={{ color: tokens?.text ?? "#ffffff" }}
            onClick={() => {
              const url = shareUrl || window.location.href;
              void sharePage(url, name);
            }}
          >
            <Share className="size-6" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-9 grid justify-items-center text-center">
          <PageMark slug={slug} name={name} avatar={photo} size={104} />
          <h1 className="mt-4 text-2xl font-extrabold" style={tokens ? { color: tokens.text } : undefined}>{name}</h1>
          {bio ? <p className="mt-2 max-w-[22rem] text-base leading-7" style={{ color: tokens?.muted ?? "rgba(255,255,255,0.6)" }}>{bio}</p> : null}
        </div>
        <ul className={cn("mt-9", face?.layout === "card" ? (face.columns === 2 ? "grid grid-cols-2 gap-3" : "grid grid-cols-1 gap-3") : "grid gap-3.5")}>
          {listed.map((block) => {
            if (block.type === "menu" || block.type === "products" || block.type === "services") {
              const fallback = block.type === "products" ? "products" : block.type === "services" ? "services" : "menu";
              const path = (block.url?.trim() || fallback).replace(/^\/+|\/+$/g, "") || fallback;
              const heading = block.title?.trim() || (block.type === "products" ? "محصولات" : block.type === "services" ? "خدمات" : "منوی دیجیتال");
              const Icon = pageIcon(block.icon) ?? (block.type === "products" ? ShoppingBag : block.type === "services" ? Briefcase : UtensilsCrossed);
              return (
                <li key={block.id} data-block-id={block.id} data-block-label={heading}>
                  <Link to="/b/$slug/$page" params={{ slug, page: path }} className={row.className} style={row.style}>
                    <Icon className={cn("size-6 shrink-0", row.style ? "" : "text-white")} aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block truncate text-base font-medium leading-6">{heading}</span>
                      {design?.layout === "card" || !block.body?.trim() ? null : <span className={cn("mt-0.5 block truncate text-sm leading-5", row.style ? "opacity-70" : "text-white/55")}>{block.body}</span>}
                    </span>
                    {design?.layout === "card" ? null : <ChevronLeft className={cn("ms-auto size-6 shrink-0", row.style ? "opacity-70" : "text-white/75")} aria-hidden="true" />}
                  </Link>
                </li>
              );
            }
            if (block.type === "booking") {
              const path = (block.url?.trim() || "book").replace(/^\/+|\/+$/g, "") || "book";
              const heading = block.title?.trim() || "رزرو نوبت";
              const card = design?.layout === "card";
              const radius = face?.radius;
              return (
                <li key={block.id} data-block-id={block.id} data-block-label={heading} className={cn(card ? "aspect-square" : "")} style={row.style}>
                  {block.image && !card ? <img src={block.image} alt="" className="h-40 w-full object-cover" style={radius ? { borderRadius: radius } : undefined} /> : null}
                  <Link
                    to="/b/$slug/$page"
                    params={{ slug, page: path }}
                    className={card ? "relative flex h-full w-full flex-col items-center justify-center gap-2 overflow-hidden p-3 text-center" : "flex w-full items-center gap-3.5 px-4 py-3.5 text-start"}
                    style={card ? { borderRadius: radius } : undefined}
                  >
                    {card && block.image ? <img src={block.image} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
                    {card && block.image ? <span className="absolute inset-0 bg-black/35" /> : null}
                    <CalendarPlus className={cn("size-6 shrink-0", card && block.image ? "relative text-white" : row.style ? "" : "text-white")} aria-hidden="true" />
                    <span className={cn("min-w-0", card && block.image ? "relative text-white" : "")}>
                      <span className="block truncate text-base font-medium leading-6">{heading}</span>
                      {card || !block.body?.trim() ? null : <span className={cn("mt-0.5 block truncate text-sm leading-5", row.style ? "opacity-70" : "text-white/55")}>{block.body}</span>}
                    </span>
                    {card ? null : <ChevronLeft className={cn("ms-auto size-6 shrink-0", row.style ? "opacity-70" : "text-white/75")} aria-hidden="true" />}
                  </Link>
                </li>
              );
            }
            if (block.type === "divider") {
              const span = face?.layout === "card" && face.columns === 2;
              return (
                <li key={block.id} className={span ? "col-span-2 my-1" : "my-1"}>
                  <DividerLine text={block.body} align={block.align} tone={tokens?.light ? "dark" : "light"} />
                </li>
              );
            }
            return (
              <li key={block.id} data-block-id={block.id} data-block-label={block.title?.trim() || block.type}>
                <BlockRow block={block} />
              </li>
            );
          })}
        </ul>
        <div className="mt-auto flex flex-col items-center pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-12">
          {footers.map((block) => (
            <SocialFooter key={block.id} block={block} />
          ))}
          <BorderBeam duration={5} color="#f4fff9">
            <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white">
              <img src="/favicon.svg" alt="" className="size-5 rounded-[4px]" />
              <span>ساخته شده با ایجنت</span>
              <ChevronLeft className="size-4 text-white/80" aria-hidden="true" />
            </Link>
          </BorderBeam>
        </div>
      </div>
      </div>
    </div>
    </FaceContext.Provider>
  );
}

function useRowFrom(face: Face | null) {
  if (!face) {
    return { className: "flex w-full items-center gap-3.5 rounded-[1.25rem] bg-[#1c1c1c] px-4 py-3.5 text-start text-white", style: undefined as CSSProperties | undefined };
  }
  const card = face.layout === "card";
  return {
    className: card ? "flex aspect-square w-full flex-col items-center justify-center gap-2 p-3 text-center" : "flex w-full items-center gap-3.5 px-4 py-3.5 text-start",
    style: face.chrome,
  };
}

function PageBackdrop({ design }: { design: PageDesign }) {
  const tokens = resolveTheme(design);
  const tint = tokens.light ? "#000000" : "#FFFFFF";
  const blur = design.effect === "blur" ? `blur(${Math.round(design.effectAmount / 4)}px)` : undefined;
  const scale = design.effect === "blur" ? 1.12 : 1;
  const media = design.bgKind === "image" || design.bgKind === "video";
  if (design.bgKind === "solid" && !design.bgColor && design.effect === "none") return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {design.bgKind === "gradient" ? <div className="absolute inset-0" style={{ background: pageBackground(design, tokens) }} /> : null}
      {design.bgKind === "solid" && design.bgColor ? <div className="absolute inset-0" style={{ background: design.bgColor }} /> : null}
      {design.bgKind === "image" && design.image ? <img src={design.image} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ filter: blur, transform: `scale(${scale})` }} /> : null}
      {design.bgKind === "video" && design.video ? <video src={design.video} className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline style={{ filter: blur, transform: `scale(${scale})` }} /> : null}
      {design.effect === "tint" && media ? <div className="absolute inset-0" style={{ background: tint, opacity: design.effectAmount / 100 }} /> : null}
    </div>
  );
}

function BlockRow({ block }: { block: CustomerBlock }) {
  const [open, setOpen] = useState(false);
  const kind = kindOf(block.type);
  const Icon = block.type === "contact" ? Phone : block.type === "address" ? MapPin : block.type === "social" ? Share2 : pageIcon(block.icon) ?? kind.icon;
  const row = useRow();
  const title = block.title?.trim() || kind.label;
  const detailLine = block.type === "contact" || block.type === "address" || block.type === "social"
    ? (block.items ?? []).map((item) => item.title?.trim() || (block.type === "address" ? addressKind(item.kind).label : block.type === "social" ? socialKind(item.kind).label : contactKind(item.kind).label)).join("، ")
    : "";
  const dishes = block.type === "menu" || block.type === "products" || block.type === "services" ? (block.items ?? []).filter((item) => item.kind === "item").length : 0;
  const hint = block.type === "menu" || block.type === "products" || block.type === "services"
    ? (dishes ? `${faNum(dishes)} ${block.type === "products" ? "محصول" : block.type === "services" ? "خدمت" : "مورد"}` : kind.hint)
    : block.type === "contact" || block.type === "address" || block.type === "social" ? detailLine || kind.hint : block.url ? linkHost(block.url) || block.body?.trim() || kind.hint : block.body?.trim() || kind.hint;
  const className = row.className;
  const body = (
    <>
      <Icon className={cn("size-6 shrink-0", row.style ? "" : "text-white")} aria-hidden="true" />
      <span className="min-w-0">
        <span className="block text-base font-medium leading-6">{title}</span>
        {hint ? <span className="mt-0.5 block truncate text-sm leading-5 opacity-70">{hint}</span> : null}
      </span>
      {row.face?.layout === "card" ? null : <ChevronLeft className="ms-auto size-6 shrink-0 opacity-70" aria-hidden="true" />}
    </>
  );
  if (block.type === "text") return <TextBlock block={block} />;
  if (block.type === "faq") return <FaqBlock block={block} />;
  if (block.type === "gallery") return <GalleryBlock block={block} />;
  if (block.type === "video") return <VideoBlock block={block} />;
  if (block.type === "file") return <FileCard block={block} />;
  if (block.type === "social" && block.layout === "icons") return <SocialIcons items={block.items ?? []} />;
  if (block.type === "contact" || block.type === "address" || block.type === "social") {
    return (
      <>
        <button type="button" className={className} style={row.style} onClick={() => setOpen(true)}>
          {body}
        </button>
        {open ? <ContactWindow title={title} items={block.items ?? []} mode={block.type === "social" ? "social" : block.type} onClose={() => setOpen(false)} /> : null}
      </>
    );
  }
  if (block.url) {
    return (
      <a href={block.url} target="_blank" rel="noreferrer" className={className} style={row.style}>
        {body}
      </a>
    );
  }
  return <div className={className} style={row.style}>{body}</div>;
}

export function DividerLine({ text, align, tone = "light" }: { text?: string; align?: string; tone?: "light" | "dark" }) {
  const label = text?.trim() ?? "";
  const place = align === "left" || align === "right" ? align : "center";
  const face = useContext(FaceContext);
  const line = face ? "" : tone === "dark" ? "bg-line" : "bg-white/25";
  const ink = face ? "" : tone === "dark" ? "text-muted" : "text-white/70";
  const lineStyle = face ? { background: face.muted } : undefined;
  const textStyle = face ? { color: face.muted } : undefined;
  if (!label) return <div className={`h-px w-full ${line}`} style={lineStyle} />;
  return (
    <div dir="rtl" className="flex w-full items-center gap-3">
      {place !== "right" ? <span className={`h-px min-w-4 flex-1 ${line}`} style={lineStyle} /> : null}
      <span className={`max-w-[70%] shrink-0 truncate text-xs leading-4 ${ink}`} style={textStyle}>{label}</span>
      {place !== "left" ? <span className={`h-px min-w-4 flex-1 ${line}`} style={lineStyle} /> : null}
    </div>
  );
}

function fileHref(url: string, name: string) {
  const query = new URLSearchParams();
  if (name) query.set("name", name);
  const extra = query.toString();
  return extra ? `${url}${url.includes("?") ? "&" : "?"}${extra}` : url;
}

function fileNameFromUrl(url: string) {
  try {
    const name = decodeURIComponent(new URL(url).pathname.split("/").filter(Boolean).pop() ?? "");
    return name.includes(".") ? name : "";
  } catch {
    return "";
  }
}

function FileCard({ block }: { block: CustomerBlock }) {
  const [open, setOpen] = useState(false);
  const row = useRow();
  const files = (block.items ?? []).filter((item) => item.kind === "file" && item.value.startsWith("/api/v1/media/"));
  const remote = block.url?.trim() ?? "";
  const total = files.length + (remote ? 1 : 0);
  if (total === 0) return null;
  const shell = row.style ? row.className : "flex w-full items-center gap-3.5 rounded-[1.25rem] bg-[#1c1c1c] px-4 py-3.5 text-start text-white";
  const mute = row.style ? "opacity-70" : "text-white/55";
  if (total === 1) {
    const file = files[0];
    const name = file?.title?.trim() || fileNameFromUrl(remote) || linkHost(remote) || "فایل";
    const title = block.title?.trim() || name;
    const size = file && typeof file.size === "number" && file.size > 0 ? faFileSize(file.size) : "";
    const hint = size || (remote ? linkHost(remote) : "");
    return (
      <a
        href={file ? fileHref(file.value, name) : remote}
        {...(file ? { download: name } : { target: "_blank", rel: "noreferrer" })}
        className={shell}
        style={row.style}
      >
        <File className={cn("size-6 shrink-0", row.style ? "" : "text-white")} aria-hidden="true" />
        <span className="min-w-0">
          <span className="block truncate text-base font-medium leading-6" dir="auto">{title}</span>
          {row.face?.layout === "card" || !hint ? null : <span className={cn("mt-0.5 block truncate text-sm leading-5", mute)} dir="auto">{hint}</span>}
        </span>
        {row.face?.layout === "card" ? null : <Download className={cn("ms-auto size-6 shrink-0", row.style ? "opacity-70" : "text-white/75")} aria-hidden="true" />}
      </a>
    );
  }
  const title = block.title?.trim() || "فایل‌ها";
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={shell} style={row.style}>
        <File className={cn("size-6 shrink-0", row.style ? "" : "text-white")} aria-hidden="true" />
        <span className="min-w-0">
          <span className="block truncate text-base font-medium leading-6" dir="auto">{title}</span>
          {row.face?.layout === "card" ? null : <span className={cn("mt-0.5 block truncate text-sm leading-5", mute)}>{faNum(total)} فایل</span>}
        </span>
        {row.face?.layout === "card" ? null : <ChevronLeft className={cn("ms-auto size-6 shrink-0", row.style ? "opacity-70" : "text-white/75")} aria-hidden="true" />}
      </button>
      {open ? <FileWindow title={title} files={files} remote={remote} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function FileWindow({ title, files, remote, onClose }: { title: string; files: ContactItem[]; remote: string; onClose: () => void }) {
  const [desktop, setDesktop] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktop(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const cards = (
    <div dir="rtl" className="flex flex-col gap-2">
      {files.map((item) => {
        const name = item.title?.trim() || "فایل";
        const label = item.label?.trim() || name;
        const size = typeof item.size === "number" && item.size > 0 ? faFileSize(item.size) : "";
        return (
          <a key={item.id} href={fileHref(item.value, name)} download={name} className="block w-full">
            <Attachment dir="rtl" state="done">
              <AttachmentMedia>
                <File aria-hidden="true" />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle><bdi>{label}</bdi></AttachmentTitle>
                <AttachmentDescription>{item.note?.trim() || (size ? `بارگذاری شد · ${size}` : "بارگذاری شد")}</AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <Download className="size-4 text-muted" aria-hidden="true" />
              </AttachmentActions>
            </Attachment>
          </a>
        );
      })}
      {remote ? (
        <a href={remote} target="_blank" rel="noreferrer" className="block w-full">
          <Attachment dir="rtl" state="done">
            <AttachmentMedia>
              <File aria-hidden="true" />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle><bdi>{fileNameFromUrl(remote) || linkHost(remote) || "فایل"}</bdi></AttachmentTitle>
              <AttachmentDescription>{linkHost(remote) || "بارگذاری شد"}</AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <Download className="size-4 text-muted" aria-hidden="true" />
            </AttachmentActions>
          </Attachment>
        </a>
      ) : null}
    </div>
  );
  const panel = desktop ? (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-label="بستن" onClick={onClose} />
      <div role="dialog" aria-modal="true" className="relative z-10 grid max-h-[85dvh] w-full min-w-0 max-w-md gap-4 overflow-x-hidden overflow-y-auto rounded-[1.375rem] border border-line bg-card p-5 text-ink shadow-[0_20px_50px_-20px_rgb(0_0_0/0.8)]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="min-w-0 truncate text-base font-semibold">{title}</h2>
          <button type="button" aria-label="بستن" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-full text-ink hover:bg-paper">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        {cards}
      </div>
    </div>
  ) : (
    <div className="fixed inset-0 z-[80]">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="بستن" onClick={onClose} />
      <div className="sheet-up absolute inset-x-0 bottom-0 max-h-[85dvh] w-full min-w-0 overflow-x-hidden overflow-y-auto rounded-t-2xl border border-line bg-card px-4 pt-4 pb-6 text-ink shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="min-w-0 truncate font-bold">{title}</h2>
          <button type="button" aria-label="بستن" onClick={onClose} className="grid size-9 shrink-0 place-items-center text-ink">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        {cards}
      </div>
    </div>
  );
  if (typeof document === "undefined") return null;
  return createPortal(panel, document.body);
}

function GalleryBlock({ block }: { block: CustomerBlock }) {
  const photos = (block.items ?? []).filter((item) => item.value.startsWith("data:image/"));
  const face = useContext(FaceContext);
  if (face?.layout === "card") {
    const shown = photos.slice(0, 4);
    return (
      <div className="flex aspect-square flex-col overflow-hidden" style={face.chrome}>
        {shown.length > 0 ? (
          <div className={`grid min-h-0 flex-1 gap-1 ${shown.length > 1 ? "grid-cols-2" : ""}`}>
            {shown.map((item) => (
              <img key={item.id} src={item.value} alt="" draggable={false} className="h-full w-full object-cover" />
            ))}
          </div>
        ) : null}
        {block.title?.trim() ? <p className="truncate px-2 py-1.5 text-center text-sm font-medium">{block.title}</p> : null}
      </div>
    );
  }
  return (
    <div style={face ? { color: face.page } : undefined} className={face ? "" : "text-white"}>
      {block.title?.trim() ? <p className="text-base font-medium leading-6">{block.title}</p> : null}
      {block.body?.trim() ? <p className="mt-1 text-sm leading-6" style={{ color: face?.muted ?? "rgba(255,255,255,0.7)" }}>{block.body}</p> : null}
      {photos.length > 0 ? (
        <div className={`flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${block.title?.trim() || block.body?.trim() ? "mt-3" : ""}`}>
          {photos.map((item) => (
            <img key={item.id} src={item.value} alt="" draggable={false} className="h-52 w-[84%] shrink-0 snap-center object-cover" style={{ borderRadius: face?.radius ?? "0.75rem" }} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function videoWatch(kind: string, value: string) {
  const raw = value.trim();
  if (kind === "youtube") {
    const id = youtubeId(raw);
    return id ? `https://www.youtube.com/watch?v=${id}` : "";
  }
  if (kind === "aparat") {
    const hash = aparatHash(raw);
    return hash ? `https://www.aparat.com/v/${hash}` : "";
  }
  return "";
}

export function videoEmbed(kind: string, value: string) {
  if (kind === "youtube") {
    const id = youtubeId(value);
    return id ? `https://www.youtube.com/embed/${id}` : "";
  }
  if (kind === "aparat") {
    const hash = aparatHash(value);
    return hash ? `https://www.aparat.com/video/video/embed/videohash/${hash}/vt/frame` : "";
  }
  return "";
}

function youtubeId(value: string) {
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return cleanId(url.pathname.split("/").filter(Boolean)[0] ?? "", true);
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") return cleanId(url.searchParams.get("v") ?? "", true);
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live") return cleanId(parts[1] ?? "", true);
    }
  } catch {
    return "";
  }
  return "";
}

function aparatHash(value: string) {
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    const host = url.hostname.replace(/^www\./, "");
    if (host !== "aparat.com") return "";
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "v" && parts[1]) return cleanId(parts[1], false);
    const at = parts.indexOf("videohash");
    if (at >= 0 && parts[at + 1]) return cleanId(parts[at + 1], false);
  } catch {
    return "";
  }
  return "";
}

function cleanId(value: string, youtube: boolean) {
  const id = value.split("?")[0] ?? "";
  return (youtube ? /^[A-Za-z0-9_-]{6,20}$/ : /^[A-Za-z0-9]{4,20}$/).test(id) ? id : "";
}

function VideoBlock({ block }: { block: CustomerBlock }) {
  const clips = (block.items ?? []).filter((item) => item.kind === "file" || videoEmbed(item.kind, item.value));
  const face = useContext(FaceContext);
  if (face?.layout === "card") {
    const clip = clips[0];
    return (
      <div className="relative aspect-square overflow-hidden" style={face.chrome}>
        {clip?.kind === "file" ? (
          <video src={clip.value} controls playsInline className="absolute inset-0 h-full w-full bg-black object-cover" />
        ) : clip ? (
          <iframe src={videoEmbed(clip.kind, clip.value)} title={clip.kind === "aparat" ? "آپارات" : "یوتیوب"} className="absolute inset-0 h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        ) : (
          <p className="flex h-full items-center justify-center px-3 text-center text-sm font-medium">{block.title?.trim() || "فیلم"}</p>
        )}
      </div>
    );
  }
  return (
    <div style={face ? { color: face.page } : undefined} className={face ? "" : "text-white"}>
      {block.title?.trim() ? <p className="text-base font-medium leading-6">{block.title}</p> : null}
      {block.body?.trim() ? <p className="mt-1 text-sm leading-6" style={{ color: face?.muted ?? "rgba(255,255,255,0.7)" }}>{block.body}</p> : null}
      {clips.length > 0 ? (
        <div className={`grid gap-3 ${block.title?.trim() || block.body?.trim() ? "mt-3" : ""}`}>
          {clips.map((item) => item.kind === "file" ? (
            <video key={item.id} src={item.value} controls playsInline className="w-full bg-black object-cover" style={{ borderRadius: face?.radius ?? "0.75rem" }} />
          ) : (
            <iframe key={item.id} src={videoEmbed(item.kind, item.value)} title={item.kind === "aparat" ? "آپارات" : "یوتیوب"} className="aspect-video w-full" style={{ borderRadius: face?.radius ?? "0.75rem" }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FaqBlock({ block }: { block: CustomerBlock }) {
  const Icon = pageIcon(block.icon) ?? HelpCircle;
  const face = useContext(FaceContext);
  const questions = (block.items ?? []).filter((item) => item.title?.trim() && item.value.trim());
  return (
    <div className={cn("px-4 py-3.5", face ? "overflow-hidden" : "rounded-[1.25rem] bg-[#1c1c1c] text-white", face?.layout === "card" ? "flex aspect-square flex-col justify-center" : "")} style={face ? { background: face.card, color: face.text, borderRadius: face.radius } : undefined}>
      <div className="mb-3 flex items-center gap-2">
        <Icon className={cn("size-5 shrink-0", face ? "" : "text-white")} aria-hidden="true" />
        <span className="min-w-0">
          <span className="block text-base font-medium leading-6">{block.title?.trim() || "سوالات متداول"}</span>
          {block.body?.trim() ? <span className={cn("mt-0.5 block text-sm leading-6", face ? "opacity-70" : "text-white/60")}>{block.body}</span> : null}
        </span>
      </div>
      {questions.length > 0 ? (
        <Accordion
          multiple
          items={questions.map((item) => ({ id: item.id, title: item.title, content: item.value }))}
        />
      ) : null}
    </div>
  );
}

function TextBlock({ block }: { block: CustomerBlock }) {
  const Icon = pageIcon(block.icon) ?? Type;
  const face = useContext(FaceContext);
  const align = block.align === "center" || block.align === "left" ? block.align : "right";
  const alignClass = align === "center" ? "text-center" : align === "left" ? "text-left" : "text-right";
  const photo = block.image ? <img src={block.image} alt="" className="w-full object-cover" style={{ borderRadius: face?.radius ?? "0.75rem" }} /> : null;
  return (
    <div className={cn("px-4 py-3.5", face ? "overflow-hidden" : "rounded-[1.25rem] bg-[#1c1c1c] text-white", face?.layout === "card" ? "flex aspect-square flex-col items-center justify-center text-center" : "")} style={face ? { background: face.card, color: face.text, borderRadius: face.radius } : undefined}>
      {photo && block.imagePos !== "after" ? <div className="mb-3">{photo}</div> : null}
      <div className="flex items-center gap-2">
        <Icon className={cn("size-5 shrink-0", face ? "" : "text-white")} aria-hidden="true" />
        <span className="min-w-0 text-base font-medium leading-6">{block.title?.trim() || "متن ساده"}</span>
      </div>
      {block.body?.trim() ? <p className={`mt-2 whitespace-pre-wrap text-sm leading-7 [overflow-wrap:anywhere] ${face ? "opacity-80" : "text-white/80"} ${alignClass}`}>{block.body}</p> : null}
      {photo && block.imagePos === "after" ? <div className="mt-3">{photo}</div> : null}
    </div>
  );
}

function SocialMark({ kind, className = "size-5" }: { kind: string; className?: string }) {
  const letters: Record<string, string> = { kik: "ک", bale: "ب", rubika: "ر", igap: "آ" };
  if (letters[kind]) return <span className="text-sm font-bold leading-none">{letters[kind]}</span>;
  const Icon = kind === "instagram" ? Instagram : kind === "telegram" ? Send : kind === "x" ? Twitter : kind === "youtube" ? Youtube : kind === "linkedin" ? Linkedin : kind === "email" ? Mail : kind === "phone" ? Phone : kind === "website" ? Globe : kind === "whatsapp" ? MessageCircle : AtSign;
  return <Icon className={className} aria-hidden="true" />;
}

function SocialIcons({ items }: { items: ContactItem[] }) {
  const face = useContext(FaceContext);
  return (
    <div className="flex flex-wrap justify-center gap-2.5">
      {items.map((item) => (
        <a key={item.id} href={socialHref(item)} target={item.kind === "phone" || item.kind === "email" ? undefined : "_blank"} rel="noreferrer" aria-label={item.title?.trim() || socialKind(item.kind).label} className={cn("grid size-12 place-items-center", face ? "" : "rounded-full border border-white/15 text-white")} style={face ? { ...face.chrome, borderRadius: "999px" } : undefined}>
          <SocialMark kind={item.kind} />
        </a>
      ))}
    </div>
  );
}

function SocialFooter({ block }: { block: CustomerBlock }) {
  const items = block.items ?? [];
  const face = useContext(FaceContext);
  return (
    <div className="mb-4 flex w-full max-w-sm overflow-hidden" style={face ? { ...face.chrome, borderRadius: "999px" } : { background: "#1c1c1c", color: "#fff", borderRadius: "999px" }}>
      {items.map((item, index) => (
        <a
          key={item.id}
          href={socialHref(item)}
          target={item.kind === "phone" || item.kind === "email" ? undefined : "_blank"}
          rel="noreferrer"
          aria-label={item.title?.trim() || socialKind(item.kind).label}
          className={`grid h-12 min-w-12 flex-1 place-items-center ${index > 0 ? "border-s border-current/20" : ""}`}
        >
          <SocialMark kind={item.kind} />
        </a>
      ))}
    </div>
  );
}

function ContactWindow({ title, items, mode, onClose }: { title: string; items: ContactItem[]; mode: "contact" | "address" | "social"; onClose: () => void }) {
  const [desktop, setDesktop] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktop(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const list = (
    <ul className="grid min-w-0 gap-2">
      {items.map((item) => {
        if (mode === "address" && item.kind === "text") {
          return (
            <li key={item.id} className="min-w-0">
              <div className="flex w-full min-w-0 items-start gap-3 rounded-xl bg-paper px-3 py-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-jade" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold leading-6">آدرس متنی</span>
                  <span className="mt-0.5 block whitespace-pre-wrap text-sm leading-6 text-muted [overflow-wrap:anywhere]">{item.value}</span>
                </span>
              </div>
            </li>
          );
        }
        const kind = mode === "address" ? addressKind(item.kind) : mode === "social" ? socialKind(item.kind) : contactKind(item.kind);
        const href = mode === "address" ? item.value : mode === "social" ? socialHref(item) : contactHref(item);
        const external = mode === "address" || mode === "social" ? item.kind !== "phone" && item.kind !== "email" : item.kind !== "phone" && item.kind !== "email";
        return (
          <li key={item.id} className="min-w-0">
            <a href={href} target={external ? "_blank" : undefined} rel="noreferrer" className="flex w-full min-w-0 items-center gap-3 rounded-xl bg-paper px-3 py-3">
              {mode === "address" ? <MapPin className="size-5 shrink-0 text-jade" aria-hidden="true" /> : mode === "social" ? <span className="text-jade"><SocialMark kind={item.kind} /></span> : <ContactMark kind={item.kind} />}
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold leading-6">{item.title?.trim() || kind.label}</span>
                <span dir="ltr" className="mt-0.5 block text-end text-sm leading-5 text-muted [overflow-wrap:anywhere]">{item.value}</span>
              </span>
              <ChevronLeft className="size-4 shrink-0 text-muted" aria-hidden="true" />
            </a>
          </li>
        );
      })}
    </ul>
  );
  const panel = desktop ? (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-label="بستن" onClick={onClose} />
      <div role="dialog" aria-modal="true" className="relative z-10 grid max-h-[85dvh] w-full min-w-0 max-w-md gap-4 overflow-x-hidden overflow-y-auto rounded-[1.375rem] border border-line bg-card p-5 text-ink shadow-[0_20px_50px_-20px_rgb(0_0_0/0.8)]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="min-w-0 truncate text-base font-semibold">{title}</h2>
          <button type="button" aria-label="بستن" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-full text-ink hover:bg-paper">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        {list}
      </div>
    </div>
  ) : (
    <div className="fixed inset-0 z-[80]">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="بستن" onClick={onClose} />
      <div className="sheet-up absolute inset-x-0 bottom-0 max-h-[85dvh] w-full min-w-0 overflow-x-hidden overflow-y-auto rounded-t-2xl border border-line bg-card px-4 pt-4 pb-6 text-ink shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="min-w-0 truncate font-bold">{title}</h2>
          <button type="button" aria-label="بستن" onClick={onClose} className="grid size-9 shrink-0 place-items-center text-ink">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        {list}
      </div>
    </div>
  );
  if (typeof document === "undefined") return null;
  return createPortal(panel, document.body);
}

function ContactMark({ kind }: { kind: string }) {
  const Icon = kind === "email" ? Mail : kind === "telegram" ? Send : kind === "phone" ? Phone : MessageCircle;
  return <Icon className="size-5 shrink-0 text-jade" aria-hidden="true" />;
}

function contactHref(item: ContactItem) {
  const value = item.value.trim();
  if (item.kind === "phone") return `tel:${onlyDigits(value)}`;
  if (item.kind === "email") return `mailto:${value}`;
  if (item.kind === "whatsapp") {
    let number = onlyDigits(value);
    if (number.startsWith("0")) number = `98${number.slice(1)}`;
    return `https://wa.me/${number}`;
  }
  if (/^https?:\/\//i.test(value)) return value;
  const handle = value.replace(/^@/, "");
  if (item.kind === "telegram") return `https://t.me/${handle}`;
  if (item.kind === "eitaa") return `https://eitaa.com/${handle}`;
  if (item.kind === "bale") return `https://ble.ir/${handle}`;
  return `https://rubika.ir/${handle}`;
}

function onlyDigits(value: string) {
  const persian = "۰۱۲۳۴۵۶۷۸۹";
  const english = value.replace(/[۰-۹]/g, (digit) => String(persian.indexOf(digit)));
  return english.replace(/\D/g, "");
}

export function CustomerLinkStage(props: {
  name: string;
  bio: string;
  avatar?: string;
  slug: string;
  blocks: CustomerBlock[];
  design?: PageDesign;
}) {
  const frame = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = frame.current;
    if (!root || !props.slug) return;
    const seen = new Set<string>();
    const watch = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        const id = el.dataset.blockId || "";
        if (!id || seen.has(id)) continue;
        seen.add(id);
        void trackBlockFn(props.slug, id, el.dataset.blockLabel || id);
        watch.unobserve(el);
      }
    }, { threshold: 0.5 });
    root.querySelectorAll<HTMLElement>("[data-block-id]").forEach((el) => watch.observe(el));
    return () => watch.disconnect();
  }, [props.slug, props.blocks]);
  return (
    <div
      ref={frame}
      className="h-dvh overflow-hidden bg-black lg:grid lg:h-auto lg:min-h-dvh lg:place-items-center lg:bg-[#242424] lg:px-4 lg:py-6"
      onClickCapture={(event) => {
        const target = event.target instanceof Element ? event.target.closest("a,button") : null;
        if (!target || target.getAttribute("aria-label") === "اشتراک‌گذاری لینک صفحه") return;
        void trackClickFn(props.slug);
      }}
    >
      <div className="mx-auto flex h-full w-full max-w-[480px] flex-col lg:h-[min(58rem,calc(100dvh-3rem))] lg:w-[30rem] lg:max-w-none lg:overflow-hidden lg:rounded-[2.9rem] lg:bg-black lg:shadow-[0_40px_90px_-28px_rgb(0_0_0/0.75)] lg:ring-1 lg:ring-white/10">
        <CustomerLink {...props} />
      </div>
    </div>
  );
}
