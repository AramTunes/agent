import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import {
  Briefcase,
  CalendarPlus,
  ChevronLeft,
  Copy,
  Ellipsis,
  File,
  FileText,
  GraduationCap,
  GripVertical,
  HelpCircle,
  Image as ImageIcon,
  ImagePlus,
  Link2,
  MapPin,
  Minus,
  Newspaper,
  Palette,
  Pencil,
  Phone,
  Plus,
  Settings,
  Share2,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  Trash2,
  Type,
  User,
  Users,
  UtensilsCrossed,
  Video,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { CenterWindow, HalfSheet, useIsDesktop } from "@/components/panel-window";
import { usePanel } from "@/components/account";
import { AnimatedTabs } from "@/components/animated-tabs";
import { ScrollArea } from "@/components/scroll-area";
import { Switch } from "@/components/switch";
import { Area, Button, Field, Skeleton, TextInput } from "@/components/ui";
import { FileUpload } from "@/components/ui/file-upload";
import { Attachment, AttachmentAction, AttachmentActions, AttachmentContent, AttachmentDescription, AttachmentMedia, AttachmentTitle } from "@/components/ui/attachment";
import { categoriesFn, manageBusinessFn, publicBusinessFn, updateBusinessFn, uploadPageFile, uploadPageVideo } from "@/lib/api";
import { iconsForSlug, pageIcon } from "@/lib/page-icons";
import { RoundAvatar, fitAvatar, pageImageKey, readPageAvatar, readyAvatars, rememberPageAvatar } from "@/lib/page-avatar";
import { faFileSize, faNum } from "@/lib/booking/fa";
import { fitImage } from "@/lib/fit-image";
import { CustomerLink, DividerLine, addressKinds, contactKind, contactKinds, socialKinds, socialValueOk, videoWatch, type ContactItem } from "@/components/link-page";
import { DesignStudio, DesktopDesign } from "@/components/page-design-studio";
import { QrDialog } from "@/components/qr-share";
import { defaultPageDesign, normalizeDesign, parseDesign, themeColors, type PageDesign } from "@/lib/page-design";
import { fitsTopic, topicBlock } from "@/lib/business-focus";
import { BookingFields, bookingPath } from "@/components/booking-block";
import { MenuFields } from "@/components/menu-block";

export const Route = createFileRoute("/panel/links")({ component: LinksPage });

const catalog = [
  { type: "link", label: "لینک", icon: Link2 },
  { type: "contact", label: "تماس", icon: Phone },
  { type: "address", label: "آدرس", icon: MapPin },
  { type: "booking", label: "رزرو نوبت", icon: CalendarPlus },
  { type: "products", label: "محصولات", icon: ShoppingBag },
  { type: "menu", label: "منوی دیجیتال", icon: UtensilsCrossed },
  { type: "services", label: "خدمات", icon: Briefcase },
  { type: "form", label: "فرم‌ساز", icon: FileText },
  { type: "event", label: "ایونت", icon: CalendarPlus },
  { type: "course", label: "دوره آموزشی", icon: GraduationCap },
  { type: "blog", label: "وبلاگ", icon: Newspaper },
  { type: "text", label: "متن ساده", icon: Type },
  { type: "social", label: "شبکه اجتماعی", icon: Share2 },
  { type: "faq", label: "سوالات متداول", icon: HelpCircle },
  { type: "team", label: "تیم", icon: Users },
  { type: "gallery", label: "عکس", icon: ImageIcon },
  { type: "video", label: "فیلم", icon: Video },
  { type: "resume", label: "رزومه", icon: FileText },
  { type: "file", label: "فایل", icon: File },
  { type: "divider", label: "جداکننده", icon: Minus },
] as const;

type BlockType = (typeof catalog)[number]["type"];
type Block = { id: string; type: BlockType; active: boolean; starred: boolean; title?: string; url?: string; icon?: string; body?: string; items?: ContactItem[]; align?: string; image?: string; imagePos?: string; layout?: string; currency?: string };
type Sheet = "" | "preview" | "settings" | "design";
type Drag = { id: string; origin: number; over: number; slot: number; dy: number };
type Service = { id: string; name: string; description: string; durationMinutes: number; priceToman: number };
type Person = { id: string; name: string; title: string; weekly: { weekday: number; startMin: number; endMin: number }[] };
type Biz = {
  name: string;
  description: string;
  categoryName: string;
  city: string;
  address: string;
  phone: string;
  avatar?: string;
  services: Service[];
  staff: Person[];
};

const defaultDesign: PageDesign = defaultPageDesign;

function kindOf(type: BlockType) {
  return catalog.find((item) => item.type === type) ?? catalog[0];
}

function designKey(businessId: string) {
  return `agent.page-design.${businessId}`;
}

function storageKey(businessId: string) {
  return `agent.page-blocks.${businessId}`;
}

function reorder(items: Block[], fromId: string, toId: string) {
  const next = [...items];
  const from = next.findIndex((item) => item.id === fromId);
  const to = next.findIndex((item) => item.id === toId);
  if (from < 0 || to < 0 || from === to) return items;
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

function LinksPage() {
  const { businessId, memberships, role } = usePanel();
  const categoryId = memberships.find((item) => item.businessId === businessId)?.categoryId;
  const topic = topicBlock(categoryId);
  const current = memberships.find((item) => item.businessId === businessId);
  const slug = current?.slug ?? "";
  const url = slug && typeof window !== "undefined" ? `${window.location.origin}/b/${slug}` : "";
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [ready, setReady] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editor, setEditor] = useState<{ mode: "add" | "edit"; block: Block } | null>(null);
  const [copied, setCopied] = useState(false);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [menuId, setMenuId] = useState("");
  const [specialId, setSpecialId] = useState("");
  const listRef = useRef<HTMLUListElement>(null);
  const blocksRef = useRef<Block[]>([]);
  const [sheet, setSheet] = useState<Sheet>("");
  const desktop = useIsDesktop();
  const [qrOpen, setQrOpen] = useState(false);
  const [design, setDesign] = useState<PageDesign>(defaultDesign);
  const [draft, setDraft] = useState<PageDesign>(defaultDesign);
  const designRef = useRef(defaultDesign);
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (!businessId) {
      blocksRef.current = [];
      setBlocks([]);
      setReady(false);
      return;
    }
    let live = true;
    setReady(false);
    manageBusinessFn({ data: { businessId } }).then((res) => {
      if (!live) return;
      let next: Block[] = [];
      const remote = res.ok && Array.isArray(res.data?.pageBlocks) ? (res.data.pageBlocks as Array<{ type: string; body?: string }>) : null;
      if (remote) next = remote.filter((item) => item.type !== "design") as Block[];
      if (next.length === 0 && !remote?.some((item) => item.type === "design")) {
        try {
          const raw = localStorage.getItem(storageKey(businessId));
          const parsed = raw ? (JSON.parse(raw) as Array<{ type: string }>) : [];
          if (Array.isArray(parsed) && parsed.length) next = parsed.filter((item) => item.type !== "design") as Block[];
        } catch {
          next = [];
        }
      }
      const designBody = remote?.find((item) => item.type === "design")?.body;
      const loaded = designBody ? parseDesign(designBody) : readStoredDesign(businessId);
      designRef.current = loaded;
      setDesign(loaded);
      setDraft(loaded);
      blocksRef.current = next;
      setBlocks(next);
      try {
        localStorage.setItem(storageKey(businessId), JSON.stringify(next));
        if (slug) localStorage.setItem(`agent.page-blocks.slug.${slug}`, JSON.stringify(next));
      } catch {
        /* preview can read the server copy */
      }
      setReady(true);
    });
    return () => {
      live = false;
    };
  }, [businessId, slug]);

  useEffect(() => {
    const value = readPageAvatar(businessId, slug);
    setAvatar(value);
    if (value) rememberPageAvatar(businessId, slug, value);
  }, [businessId, slug, sheet]);

  function persistDesign(next: PageDesign) {
    const clean = normalizeDesign(next);
    designRef.current = clean;
    setDesign(clean);
    setDraft(clean);
    if (businessId) {
      try {
        localStorage.setItem(designKey(businessId), JSON.stringify(clean));
      } catch {
        /* server copy is enough */
      }
    }
    commit((items) => items);
  }

  function openDesign() {
    setDraft(designRef.current);
    setSheet("design");
  }

  function commit(recipe: (items: Block[]) => Block[]) {
    const next = recipe(blocksRef.current).filter((item) => (item.type as string) !== "design");
    blocksRef.current = next;
    setBlocks(next);
    if (!businessId) return;
    try {
      localStorage.setItem(storageKey(businessId), JSON.stringify(next));
      if (slug) localStorage.setItem(`agent.page-blocks.slug.${slug}`, JSON.stringify(next));
    } catch {
      /* the server copy is the one that matters */
    }
    const payload = [...next, { id: "page-design", type: "design", active: true, starred: false, body: JSON.stringify(designRef.current) }];
    void updateBusinessFn({ data: { businessId, pageBlocks: payload } }).then((res) => {
      if (!res.ok) toast.error(res.error);
    });
  }

  useEffect(() => {
    if (!menuId) return;
    const close = () => setMenuId("");
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menuId]);

  useEffect(() => {
    const onAction = (event: Event) => {
      const action = (event as CustomEvent<string>).detail;
      if (action === "qr") setQrOpen(true);
      if (action === "preview" || action === "settings") setSheet(action);
      if (action === "design") openDesign();
    };
    window.addEventListener("agent-links-action", onAction);
    return () => window.removeEventListener("agent-links-action", onAction);
  }, []);

  function pick(type: BlockType) {
    setAdding(false);
    setEditor({
      mode: "add",
      block: { id: "", type, active: true, starred: false, icon: type === "contact" || type === "address" || type === "social" || type === "divider" ? "" : defaultIcon(type), title: "", url: "", body: "", items: [], layout: type === "menu" || type === "products" || type === "services" ? "list" : "buttons", currency: type === "menu" || type === "products" || type === "services" ? "toman" : undefined, align: type === "divider" ? "center" : undefined },
    });
  }

  function openEditor(block: Block) {
    setMenuId("");
    setEditor({ mode: "edit", block });
  }

  function saveEditor(data: { icon: string; title: string; url: string; body: string; items?: ContactItem[]; align?: string; image?: string; imagePos?: string; layout?: string; currency?: string }) {
    if (!editor) return;
    if (editor.mode === "edit") update(editor.block.id, data);
    else commit((items) => [...items, { id: crypto.randomUUID(), type: editor.block.type, active: true, starred: false, ...data }]);
    setEditor(null);
  }

  function update(id: string, patch: Partial<Block>) {
    commit((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function beginDrag(event: ReactPointerEvent<HTMLButtonElement>, id: string) {
    const row = event.currentTarget.closest("[data-block]") as HTMLElement | null;
    const list = listRef.current;
    if (!row || !list) return;
    event.preventDefault();
    event.stopPropagation();
    const pointerId = event.pointerId;
    event.currentTarget.setPointerCapture(pointerId);
    const rows = [...list.querySelectorAll<HTMLElement>("[data-block]")];
    const origin = rows.findIndex((item) => item.dataset.block === id);
    if (origin < 0) return;
    const rect = row.getBoundingClientRect();
    const centers = rows.map((item) => {
      const box = item.getBoundingClientRect();
      return box.top + box.height / 2;
    });
    const nextTop = rows[origin + 1]?.getBoundingClientRect().top;
    const slot = nextTop ? nextTop - rect.top : rect.height + 12;
    const startY = event.clientY;
    let over = origin;
    setDrag({ id, origin, over, slot, dy: 0 });
    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      ev.preventDefault();
      const dy = ev.clientY - startY;
      const y = centers[origin] + dy;
      let nextOver = 0;
      let best = Infinity;
      centers.forEach((center, index) => {
        const dist = Math.abs(center - y);
        if (dist < best) {
          best = dist;
          nextOver = index;
        }
      });
      over = nextOver;
      setDrag({ id, origin, over, slot, dy });
    };
    const end = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      if (over !== origin) {
        const targetId = rows[over]?.dataset.block ?? "";
        if (targetId) commit((items) => reorder(items, id, targetId));
      }
      setDrag(null);
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  }

  async function copyLink() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  const pageBlocks = blocks.filter((block) => block.type !== "resume" && fitsTopic(block.type, categoryId));
  const previewBlocks = blocks.filter((block) => fitsTopic(block.type, categoryId));
  if (role === "staff") return <Navigate to="/panel" />;

  return (
    <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
      <section className="min-w-0">
        <div className="flex items-center gap-2">
          <button type="button" className="inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-ink px-3 text-sm font-medium text-on-ink" onClick={() => setAdding(true)}>
            <Plus className="size-4" aria-hidden="true" />
            افزودن بلوک
          </button>
          <button type="button" className="hidden h-10 shrink-0 items-center gap-2 rounded-full border border-line bg-paper px-3 text-sm font-medium lg:inline-flex" onClick={() => setSheet("settings")}>
            <Settings className="size-4" aria-hidden="true" />
            تنظیمات صفحه
          </button>
          <button type="button" className="hidden h-10 shrink-0 items-center gap-2 rounded-full border border-line bg-paper px-3 text-sm font-medium lg:inline-flex" onClick={openDesign}>
            <Palette className="size-4" aria-hidden="true" />
            طراحی صفحه
          </button>
        </div>
        <ul ref={listRef} className="mt-4 grid gap-3 lg:gap-2">
          {!ready ? <li className="rounded-card border border-dashed border-line px-3 py-8 text-center text-sm text-muted">در حال خواندن بلوک‌ها</li> : null}
          {ready && pageBlocks.length === 0 ? <li className="rounded-card border border-dashed border-line px-3 py-8 text-center text-sm text-muted">هنوز بلوکی به صفحه اضافه نشده.</li> : null}
          {pageBlocks.map((block, index) => {
            const kind = kindOf(block.type);
            const Mark = block.type === "file" ? File : (pageIcon(block.icon) ?? kind.icon);
            const fileName = block.type === "file" ? block.items?.find((item) => item.kind === "file")?.title?.trim() || block.url?.replace(/^https?:\/\//, "") : "";
            const label = block.type === "divider" ? block.body?.trim() || kind.label : block.type === "booking" ? block.title?.trim() || "رزرو نوبت" : block.title?.trim() || fileName || kind.label;
            let shift = 0;
            if (drag && drag.id !== block.id) {
              if (drag.origin < drag.over && index > drag.origin && index <= drag.over) shift = -drag.slot;
              else if (drag.origin > drag.over && index >= drag.over && index < drag.origin) shift = drag.slot;
            }
            const held = drag?.id === block.id;
            const copyBlock = () => commit((items) => {
              const at = items.findIndex((item) => item.id === block.id);
              if (at < 0) return items;
              const next = [...items];
              next.splice(at + 1, 0, { ...block, id: crypto.randomUUID(), starred: false });
              return next;
            });
            return (
              <li
                key={block.id}
                data-block={block.id}
                className=""
                style={
                  held
                    ? { transform: `translateY(${drag.dy}px)`, opacity: 0.45, zIndex: 30, position: "relative", transition: "none", boxShadow: "0 10px 24px rgb(0 0 0 / 0.14)" }
                    : {
                        transform: shift ? `translateY(${shift}px)` : undefined,
                        transition: shift ? "transform 180ms ease" : undefined,
                        position: "relative",
                        zIndex: menuId === block.id ? 40 : undefined,
                      }
                }
              >
                <div className="relative lg:hidden">
                <div className={`flex items-center gap-3 rounded-card border border-line bg-card p-4 ${block.active || held ? "" : "opacity-60"}`}>
                  <button
                    type="button"
                    aria-label="جابه‌جایی"
                    className="grid size-8 shrink-0 cursor-grab touch-none place-items-center text-muted select-none active:cursor-grabbing"
                    onPointerDown={(event) => beginDrag(event, block.id)}
                  >
                    <GripVertical className="size-4" aria-hidden="true" />
                  </button>
                  <Mark className="size-5 shrink-0 text-jade" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate font-bold">{label}</span>
                  <button
                    type="button"
                    aria-label="گزینه‌ها"
                    aria-expanded={menuId === block.id}
                    className="grid size-8 shrink-0 place-items-center rounded-full text-ink"
                    onClick={(event) => {
                      event.stopPropagation();
                      setMenuId((currentId) => (currentId === block.id ? "" : block.id));
                    }}
                  >
                    <Ellipsis className="size-5" aria-hidden="true" />
                  </button>
                </div>
                  {menuId === block.id ? (
                    <div className="absolute end-3 top-14 z-40 w-48 rounded-lg border border-line bg-card p-1 shadow-md" onClick={(event) => event.stopPropagation()}>
                      <div className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm">
                        <span>فعال</span>
                        <Switch checked={block.active} label={block.active ? "فعال" : "غیرفعال"} onCheckedChange={(active) => update(block.id, { active })} />
                      </div>
                      <button type="button" className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm hover:bg-paper" onClick={() => { setMenuId(""); setSpecialId(block.id); }}>
                        <Star className={`size-4 ${block.starred ? "fill-current text-copper" : ""}`} aria-hidden="true" />
                        بلوک ویژه
                      </button>
                      <button type="button" className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm hover:bg-paper" onClick={() => openEditor(block)}>
                        <Pencil className="size-4" aria-hidden="true" />
                        ویرایش
                      </button>
                      <button type="button" className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm hover:bg-paper" onClick={() => { copyBlock(); setMenuId(""); }}>
                        <Copy className="size-4" aria-hidden="true" />
                        کپی
                      </button>
                      <button type="button" className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm font-semibold text-[#e11d2e] hover:bg-danger-soft" onClick={() => { commit((items) => items.filter((item) => item.id !== block.id)); setMenuId(""); }}>
                        <Trash2 className="size-4" aria-hidden="true" />
                        حذف
                      </button>
                    </div>
                  ) : null}
                </div>
                <div className="hidden items-center gap-3 rounded-card border border-line bg-card p-4 lg:flex">
                  <button
                    type="button"
                    aria-label="جابه‌جایی"
                    className={`grid size-8 shrink-0 cursor-grab touch-none place-items-center text-muted select-none active:cursor-grabbing ${block.active || held ? "" : "opacity-60"}`}
                    onPointerDown={(event) => beginDrag(event, block.id)}
                  >
                    <GripVertical className="size-4" aria-hidden="true" />
                  </button>
                  <Mark className={`size-5 shrink-0 text-jade ${block.active || held ? "" : "opacity-60"}`} aria-hidden="true" />
                  <span className={`min-w-0 flex-1 truncate font-bold ${block.active || held ? "" : "opacity-60"}`}>{label}</span>
                  <Switch checked={block.active} label={block.active ? "فعال" : "غیرفعال"} onCheckedChange={(active) => update(block.id, { active })} />
                  <button type="button" aria-label="بلوک ویژه" className="grid size-8 place-items-center rounded-full text-ink" onClick={() => setSpecialId(block.id)}>
                    <Star className={`size-4 ${block.starred ? "fill-current text-copper" : ""}`} aria-hidden="true" />
                  </button>
                  <button type="button" aria-label="ویرایش" className="grid size-8 place-items-center rounded-full text-ink" onClick={() => openEditor(block)}>
                    <Pencil className="size-4" aria-hidden="true" />
                  </button>
                  <button type="button" aria-label="کپی" className="grid size-8 place-items-center rounded-full text-ink" onClick={copyBlock}>
                    <Copy className="size-4" aria-hidden="true" />
                  </button>
                  <button type="button" aria-label="حذف" className="grid size-8 place-items-center rounded-full text-[#e11d2e]" onClick={() => commit((items) => items.filter((item) => item.id !== block.id))}>
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
      <aside className="hidden min-w-0 lg:grid lg:gap-3">
        <button type="button" onClick={() => void copyLink()} title={url || undefined} className="w-full min-w-0 overflow-hidden rounded-xl border border-line bg-card p-3 text-start">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Share2 className="size-4 shrink-0" aria-hidden="true" />
            {copied ? "کپی شد" : "اشتراک‌گذاری"}
          </span>
          <span className="mt-2 block w-full break-all text-xs leading-5 text-muted" dir="ltr">{url || "نشانی صفحه هنوز آماده نیست"}</span>
        </button>
        <div className="rounded-[1.4rem] border-2 border-ink bg-ink p-px">
          <div className="overflow-hidden rounded-[1.3rem] bg-black">
            <PhoneScreen slug={slug} blocks={previewBlocks} design={design} image={avatar} />
          </div>
        </div>
      </aside>
      {adding ? <BlockPicker topic={topic} onClose={() => setAdding(false)} onPick={pick} /> : null}
      {editor ? (
        <BlockEditor
          businessId={businessId}
          slug={slug}
          mode={editor.mode}
          block={editor.block}
          onBack={() => {
            const backToPicker = editor.mode === "add";
            setEditor(null);
            if (backToPicker) setAdding(true);
          }}
          onClose={() => setEditor(null)}
          onSave={saveEditor}
        />
      ) : null}
      {sheet === "preview" ? (
        <HalfSheet title="پیش‌نمایش" onClose={() => setSheet("")} bare initialLevel={2}>
          <div className="absolute inset-0 overflow-hidden border-2 border-ink bg-black">
            <PhoneScreen slug={slug} blocks={previewBlocks} design={design} image={avatar} className="h-full" />
          </div>
        </HalfSheet>
      ) : null}
      {sheet === "settings" ? (
        desktop ? (
          <CenterWindow title="تنظیمات صفحه" onClose={() => setSheet("")}>
            <PageSettings businessId={businessId} slug={slug} onClose={() => setSheet("")} />
          </CenterWindow>
        ) : (
          <HalfSheet title="تنظیمات صفحه" onClose={() => setSheet("")}>
            <PageSettings businessId={businessId} slug={slug} onClose={() => setSheet("")} />
          </HalfSheet>
        )
      ) : null}
      {sheet === "design" && desktop ? (
        <DesktopDesign
          design={draft}
          businessId={businessId}
          onChange={setDraft}
          onClose={() => { setDraft(designRef.current); setSheet(""); }}
          onSave={() => { persistDesign(draft); setSheet(""); }}
          preview={<PhoneScreen slug={slug} blocks={previewBlocks} design={draft} image={avatar} className="h-full" />}
        />
      ) : null}
      {sheet === "design" && !desktop ? (
        <MobileDesign slug={slug} blocks={previewBlocks} image={avatar} design={draft} businessId={businessId} onChange={setDraft} onClose={() => { setDraft(designRef.current); setSheet(""); }} onSave={() => { persistDesign(draft); setSheet(""); }} />
      ) : null}
      {qrOpen && current ? <QrDialog name={current.name} slug={slug} url={url} avatar={avatar || current.avatar || ""} businessId={businessId} onClose={() => setQrOpen(false)} /> : null}
      {specialId ? <SpecialBlockDialog onClose={() => setSpecialId("")} /> : null}
    </div>
  );
}

function SpecialBlockDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="بستن" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-card border border-line bg-card p-5 shadow-xl">
        <h2 className="font-extrabold">بلوک ویژه</h2>
        <div className="mt-4 flex justify-end">
          <Button type="button" variant="quiet" onClick={onClose}>بستن</Button>
        </div>
      </div>
    </div>
  );
}

function readStoredDesign(businessId: string) {
  try {
    const raw = localStorage.getItem(designKey(businessId));
    return raw ? normalizeDesign(JSON.parse(raw) as Partial<PageDesign>) : defaultDesign;
  } catch {
    return defaultDesign;
  }
}

function MobileDesign({
  slug,
  blocks,
  image,
  design,
  businessId,
  onChange,
  onClose,
  onSave,
}: {
  slug: string;
  blocks: Block[];
  image: string;
  design: PageDesign;
  businessId: string;
  onChange: (next: PageDesign) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black"
      onClickCapture={(event) => {
        const target = event.target as HTMLElement | null;
        if (target?.closest("a")) event.preventDefault();
      }}
    >
      <PhoneScreen slug={slug} blocks={blocks} design={design} image={image} className="h-full" scrollClassName="pb-[54dvh]" />
      <DesignStudio design={design} businessId={businessId} onChange={onChange} onClose={onClose} onSave={onSave} />
    </div>,
    document.body,
  );
}

function PhoneScreen({ slug, blocks, image = "", design = defaultDesign, className = "h-[40rem]", scrollClassName = "" }: { slug: string; blocks: Block[]; design?: PageDesign; image?: string; className?: string; scrollClassName?: string }) {
  const [biz, setBiz] = useState<Biz | null>(null);
  useEffect(() => {
    if (!slug) return;
    let live = true;
    publicBusinessFn({ data: { slug, track: false } }).then((res) => {
      if (live && res.ok) setBiz(res.data as Biz);
    });
    return () => {
      live = false;
    };
  }, [slug]);
  const shareUrl = slug && typeof window !== "undefined" ? `${window.location.origin}/b/${encodeURIComponent(slug)}` : "";
  return (
    <div className={`bg-black ${className}`}>
      {!slug || !biz ? (
        <p className="px-3 py-10 text-center text-xs text-white/50">صفحه هنوز برای مشتری چیده نشده.</p>
      ) : (
        <CustomerLink
          fill
          className={`h-full min-h-0 ${scrollClassName}`}
          name={biz.name}
          bio={biz.description}
          avatar={biz.avatar}
          image={image}
          slug={slug}
          blocks={blocks}
          shareUrl={shareUrl}
          design={design}
        />
      )}
    </div>
  );
}

function imageKey(businessId: string) {
  return pageImageKey(businessId);
}

function readGalleryImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("image"));
      img.onload = () => {
        const max = 640;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("canvas"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function PageSettings({ businessId, slug, onClose }: { businessId: string; slug: string; onClose: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageOpen, setImageOpen] = useState(false);
  const [form, setForm] = useState<{ name: string; description: string; city: string; phone: string; address: string; categoryId: string; timezone: string; cancelBeforeMinutes: number; minLeadMinutes: number; maxHorizonDays: number; slotStepMinutes: number; allowAnyStaff: boolean } | null>(null);
  const [image, setImage] = useState("");
  const [cleared, setCleared] = useState(false);
  const [pending, setPending] = useState(false);
  useEffect(() => {
    if (!businessId) return;
    manageBusinessFn({ data: { businessId } }).then((res) => {
      if (!res.ok) return;
      const data = res.data;
      const local = readPageAvatar(businessId, slug);
      setImage(data.avatar || local || "");
      setCleared(false);
      setForm({
        name: data.name ?? "",
        description: String(data.description ?? "").slice(0, 100),
        city: data.city ?? "",
        phone: data.phone ?? "",
        address: data.address ?? "",
        categoryId: data.categoryId ?? "",
        timezone: data.timezone ?? "Asia/Tehran",
        cancelBeforeMinutes: data.cancelBeforeMinutes ?? 0,
        minLeadMinutes: data.minLeadMinutes ?? 0,
        maxHorizonDays: data.maxHorizonDays ?? 30,
        slotStepMinutes: data.slotStepMinutes ?? 15,
        allowAnyStaff: Boolean(data.allowAnyStaff),
      });
    });
  }, [businessId, slug]);
  if (!form) return <Skeleton className="h-40" />;
  return (
    <form
      className="grid"
      onSubmit={(event) => {
        event.preventDefault();
        setPending(true);
        void (async () => {
          const payload: Record<string, unknown> = { businessId, ...form, description: form.description.slice(0, 100) };
          if (cleared) {
            payload.avatar = "";
            try {
              localStorage.removeItem(pageImageKey(businessId));
              if (slug) localStorage.removeItem(`agent.page-image.slug.${slug}`);
              window.dispatchEvent(new Event("agent-avatar"));
            } catch {
              toast.error("تصویر ذخیره نشد");
            }
          } else if (image) {
            payload.avatar = await fitAvatar(image);
            try {
              rememberPageAvatar(businessId, slug, image);
            } catch {
              toast.error("تصویر ذخیره نشد");
            }
          }
          const res = await updateBusinessFn({ data: payload });
          setPending(false);
          if (!res.ok) {
            toast.error(res.error);
            return;
          }
          toast.success("تنظیمات صفحه ذخیره شد");
          window.dispatchEvent(new Event("agent-account"));
          onClose();
        })();
      }}
    >
      <div className="grid justify-items-center">
        <span className="grid size-24 place-items-center overflow-hidden rounded-full bg-jade-soft text-jade">
          {image ? <RoundAvatar value={image} size={96} /> : <User className="size-10" aria-hidden="true" />}
        </span>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            void readGalleryImage(file).then(setImage).catch(() => toast.error("این تصویر باز نشد"));
          }}
        />
        <button type="button" className="mt-3 inline-flex h-10 items-center gap-2 rounded-full border border-line bg-paper px-4 text-sm font-medium" onClick={() => setImageOpen(true)}>
          <ImagePlus className="size-4" aria-hidden="true" />
          تغییر تصویر
        </button>
        {imageOpen ? (
          <ImageDialog
            image={image}
            onPick={(next) => { setCleared(false); setImage(next); }}
            onClear={() => { setCleared(true); setImage(""); }}
            onUpload={() => fileRef.current?.click()}
            onClose={() => setImageOpen(false)}
          />
        ) : null}
      </div>
      <div className="mt-5">
        <Field label="نام صفحه">
          <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </Field>
      </div>
      <div className="mt-3">
        <label className="grid gap-1.5 text-sm">
          <span className="flex items-center justify-between gap-3">
            <span className="font-medium">بیو</span>
            <span className="text-xs tabular-nums text-muted">{faNum(form.description.length)}/{faNum(100)}</span>
          </span>
          <Area
            value={form.description}
            maxLength={100}
            onChange={(e) => setForm({ ...form, description: e.target.value.slice(0, 100) })}
          />
        </label>
      </div>
      <Link to="/panel/settings" className="mt-4 flex items-center gap-2.5 rounded-xl border border-line bg-paper px-3 py-2.5">
        <SlidersHorizontal className="size-4 shrink-0 text-jade" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold">تنظیمات کامل صفحه</span>
          <span className="mt-0.5 block text-xs leading-5 text-muted">آدرس، دیده شدن در گوگل، اشتراک گذاری و اشتراک</span>
        </span>
        <ChevronLeft className="size-4 shrink-0 text-muted" aria-hidden="true" />
      </Link>
      <div className="mt-8 flex gap-2">
        <button type="submit" disabled={pending} className="inline-flex h-11 min-w-0 flex-1 items-center justify-center rounded-full bg-ink text-sm font-semibold text-on-ink disabled:opacity-50">
          {pending ? "در حال ذخیره" : "ذخیره"}
        </button>
        <button type="button" className="inline-flex h-11 min-w-0 flex-1 items-center justify-center rounded-full border border-line bg-paper text-sm font-semibold text-ink" onClick={onClose}>
          انصراف
        </button>
      </div>
    </form>
  );
}

function ImageDialog({ image, onPick, onUpload, onClear, onClose }: { image: string; onPick: (next: string) => void; onUpload: () => void; onClear: () => void; onClose: () => void }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="page-image-title"
        className="grid max-h-[85dvh] w-full max-w-sm gap-4 overflow-y-auto rounded-[1.375rem] border border-line bg-card p-5 text-ink shadow-[0_20px_50px_-20px_rgb(0_0_0/0.8)]"
      >
        <h2 id="page-image-title" className="text-base font-semibold">تصویر صفحه</h2>
        <span className="mx-auto grid size-24 place-items-center overflow-hidden rounded-full bg-jade-soft text-jade">
          {image ? <RoundAvatar value={image} size={96} /> : <User className="size-10" aria-hidden="true" />}
        </span>
        <button type="button" className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink text-sm font-semibold text-on-ink" onClick={onUpload}>
          <ImagePlus className="size-4" aria-hidden="true" />
          تغییر تصویر
        </button>
        <div>
          <p className="text-sm font-semibold">آواتارهای آماده</p>
          <ScrollArea className="mt-3 max-h-48">
            <div className="grid grid-cols-5 gap-2 pe-1">
              {readyAvatars.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label="آواتار آماده"
                  className={`grid size-12 place-items-center overflow-hidden rounded-full ${image === item.id ? "ring-2 ring-jade ring-offset-2 ring-offset-card" : ""}`}
                  onClick={() => onPick(item.id)}
                >
                  <RoundAvatar value={item.id} size={48} />
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
        <button type="button" className="text-sm font-semibold text-[#e11d2e]" onClick={onClear}>
          حذف تصویر آپلود شده
        </button>
        <button type="button" className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-paper text-sm font-semibold text-ink" onClick={onClose}>
          بستن
        </button>
      </div>
    </div>,
    document.body,
  );
}

function DesignSettings({ design, onChange }: { design: PageDesign; onChange: (next: PageDesign) => void }) {
  const theme = design.theme === "light" || design.theme === "custom" ? design.theme : "dark";
  return (
    <div className="grid gap-4">
      <Choice label="تم" value={theme} options={[["light", "روشن"], ["dark", "تیره"], ["custom", "اختصاصی"]]} onChange={(next) => onChange({ ...design, theme: next })} />
      {theme === "custom" ? (
        <div>
          <p className="mb-2 text-sm font-semibold">رنگ دکمه</p>
          <div className="flex flex-wrap gap-2">
            {themeColors.map((color) => (
              <button key={color.hex} type="button" aria-label={color.name} className={`size-9 rounded-full border-2 ${design.accent.toUpperCase() === color.hex ? "border-ink" : "border-transparent"}`} style={{ background: color.hex }} onClick={() => onChange({ ...design, theme: "custom", accent: color.hex })} />
            ))}
          </div>
        </div>
      ) : null}
      <Choice label="چینش" value={design.layout} options={[["list", "لیستی"], ["card", "کارتی"]]} onChange={(layout) => onChange({ ...design, layout: layout === "card" ? "card" : "list" })} />
      <Choice label="گوشه‌ها" value={design.radius} options={[["sharp", "تیز"], ["round", "گرد"], ["pill", "دایره‌ای"]]} onChange={(radius) => onChange({ ...design, radius: radius === "sharp" || radius === "pill" ? radius : "round" })} />
    </div>
  );
}

function Choice({ label, value, options, onChange }: { label: string; value: string; options: string[][]; onChange: (value: string) => void }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(([id, text]) => (
          <button key={id} type="button" className={`h-9 rounded-full border px-3 text-sm ${value === id ? "border-ink bg-ink text-on-ink" : "border-line bg-paper"}`} onClick={() => onChange(id)}>
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

const hiddenTypes = new Set(["form", "event", "course", "blog", "resume", "team"]);

const topicTypes = new Set(["booking", "menu", "products", "services"]);

function BlockPicker({ topic, onClose, onPick }: { topic: ReturnType<typeof topicBlock>; onClose: () => void; onPick: (type: BlockType) => void }) {
  const desktop = useIsDesktop();
  const body = (
    <div className="grid grid-cols-2 gap-2">
      {catalog.filter((item) => !hiddenTypes.has(item.type) && (!topicTypes.has(item.type) || item.type === topic)).map((item) => (
        <button key={item.type} type="button" className="flex min-h-20 flex-col justify-between rounded-xl border border-line bg-paper p-3 text-start" onClick={() => onPick(item.type)}>
          <item.icon className="size-5 text-jade" aria-hidden="true" />
          <span className="text-sm font-semibold">{item.label}</span>
        </button>
      ))}
    </div>
  );
  if (desktop) return <CenterWindow title="افزودن بلوک" onClose={onClose}>{body}</CenterWindow>;
  return <HalfSheet title="افزودن بلوک" onClose={onClose}>{body}</HalfSheet>;
}

function normalizeLink(value: string) {
  const next = value.trim();
  if (!next) return "";
  if (/^https?:\/\//i.test(next)) return next;
  if (/^[\w.-]+\.[a-z]{2,}([/?#].*)?$/i.test(next)) return `https://${next}`;
  return "";
}

const blockForms: Record<string, { title: string; extra?: { key: "url" | "body"; label: string; kind: "url" | "phone" | "text"; required: boolean } }> = {
  link: { title: "عنوان بلوک", extra: { key: "url", label: "نشانی لینک", kind: "url", required: true } },
  contact: { title: "عنوان", extra: { key: "body", label: "شماره تماس", kind: "phone", required: true } },
  address: { title: "عنوان", extra: { key: "body", label: "آدرس", kind: "text", required: true } },
  booking: { title: "عنوان" },
  products: { title: "عنوان", extra: { key: "body", label: "توضیح کوتاه", kind: "text", required: false } },
  menu: { title: "عنوان", extra: { key: "body", label: "توضیح کوتاه", kind: "text", required: false } },
  services: { title: "عنوان", extra: { key: "body", label: "توضیح کوتاه", kind: "text", required: false } },
  form: { title: "عنوان", extra: { key: "body", label: "توضیح فرم", kind: "text", required: false } },
  event: { title: "عنوان", extra: { key: "body", label: "جزئیات", kind: "text", required: false } },
  course: { title: "عنوان", extra: { key: "body", label: "توضیح دوره", kind: "text", required: false } },
  blog: { title: "عنوان", extra: { key: "body", label: "توضیح", kind: "text", required: false } },
  text: { title: "عنوان", extra: { key: "body", label: "متن", kind: "text", required: true } },
  social: { title: "عنوان", extra: { key: "url", label: "نشانی شبکه", kind: "url", required: true } },
  faq: { title: "پرسش", extra: { key: "body", label: "پاسخ", kind: "text", required: true } },
  team: { title: "عنوان", extra: { key: "body", label: "معرفی", kind: "text", required: false } },
  gallery: { title: "عنوان" },
  video: { title: "عنوان", extra: { key: "url", label: "نشانی ویدیو", kind: "url", required: true } },
  resume: { title: "عنوان", extra: { key: "body", label: "خلاصه", kind: "text", required: false } },
  file: { title: "عنوان", extra: { key: "body", label: "توضیحات", kind: "text", required: false } },
};

const defaultIcons: Record<string, string> = {
  link: "link",
  contact: "phone",
  address: "map",
  booking: "calendar",
  products: "bag",
  menu: "utensils",
  services: "store",
  form: "notebook",
  event: "calendar",
  course: "graduation",
  blog: "book",
  text: "pencil",
  social: "globe",
  faq: "messages",
  team: "user",
  gallery: "camera",
  video: "camera",
  resume: "book",
  file: "link",
};

function defaultIcon(type: string) {
  return defaultIcons[type] ?? "link";
}

function BlockEditor({
  businessId,
  slug,
  mode,
  block,
  onBack,
  onClose,
  onSave,
}: {
  businessId: string;
  slug: string;
  mode: "add" | "edit";
  block: Block;
  onBack: () => void;
  onClose: () => void;
  onSave: (data: { icon: string; title: string; url: string; body: string; items?: ContactItem[]; align?: string; image?: string; imagePos?: string; layout?: string; currency?: string }) => void;
}) {
  const desktop = useIsDesktop();
  const form = blockForms[block.type] ?? { title: "عنوان" };
  const kind = kindOf(block.type);
  const [icon, setIcon] = useState(block.icon || defaultIcon(block.type));
  const [title, setTitle] = useState(block.title ?? "");
  const [url, setUrl] = useState(block.url ?? "");
  const [body, setBody] = useState(block.body ?? "");
  const [items, setItems] = useState<ContactItem[]>(block.items ?? []);
  const [align, setAlign] = useState(block.type === "divider" ? (block.align === "left" || block.align === "right" ? block.align : "center") : block.align === "center" || block.align === "left" ? block.align : "right");
  const [image, setImage] = useState(block.image ?? "");
  const [imagePos, setImagePos] = useState(block.imagePos === "after" ? "after" : "before");
  const [layout, setLayout] = useState(block.type === "menu" || block.type === "products" || block.type === "services" ? (block.layout === "grid" || block.layout === "card" ? block.layout : "list") : block.layout === "icons" || block.layout === "footer" ? block.layout : "buttons");
  const [currency, setCurrency] = useState(block.currency || "toman");
  const [faqDraft, setFaqDraft] = useState<{ id: string; question: string; answer: string; fresh: boolean } | null>(null);
  const [iconsOpen, setIconsOpen] = useState(false);
  const [menuDialog, setMenuDialog] = useState(false);
  const Icon = pageIcon(icon) ?? Link2;
  function saveBooking() {
    const cleanTitle = title.trim();
    if (cleanTitle && cleanTitle.length < 2) {
      toast.error("عنوان را کامل‌تر بنویسید");
      return;
    }
    const path = bookingPath(url);
    if (url.trim() && !path) {
      toast.error("نشانی صفحه رزرو فقط یک بخش بعد از نام کاربری است");
      return;
    }
    onSave({ icon: "", title: cleanTitle, url: path, body: body.trim().slice(0, 100), image });
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (block.type === "contact" || block.type === "address") {
      if (cleanTitle.length < 2) {
        toast.error("عنوان بلوک را وارد کنید");
        return;
      }
      const address = block.type === "address";
      let invalid = false;
      const cleanItems = items.flatMap((item) => {
        if (address && item.kind !== "text") {
          const url = normalizeLink(item.value);
          if (item.value.trim() && !url) invalid = true;
          if (!url) return [];
          return [{ ...item, title: item.title?.trim() ?? "", value: url }];
        }
        const value = item.value.trim();
        if (!value) return [];
        return [{ ...item, title: address ? "" : item.title?.trim() ?? "", value }];
      });
      if (invalid) {
        toast.error("نشانی لینک معتبر نیست");
        return;
      }
      if (cleanItems.length === 0) {
        toast.error(address ? "حداقل یک آدرس را کامل کنید" : "حداقل یک راه تماس را کامل کنید");
        return;
      }
      onSave({ icon: "", title: cleanTitle, url: "", body: "", items: cleanItems });
      return;
    }
    if (block.type === "social") {
      if (cleanTitle.length < 2) {
        toast.error("عنوان را وارد کنید");
        return;
      }
      let invalid = false;
      const cleanItems = items.flatMap((item) => {
        const value = item.value.trim();
        if (value && !socialValueOk(item.kind, value)) invalid = true;
        if (!value || !socialValueOk(item.kind, value)) return [];
        return [{ ...item, title: item.title?.trim() ?? "", value }];
      });
      if (invalid) {
        toast.error("اطلاعات شبکه معتبر نیست");
        return;
      }
      if (cleanItems.length === 0) {
        toast.error("حداقل یک شبکه را کامل کنید");
        return;
      }
      onSave({ icon: "", title: cleanTitle, url: "", body: "", items: cleanItems, layout });
      return;
    }
    if (block.type === "text") {
      const cleanBody = body.trim();
      if (cleanTitle.length < 2) {
        toast.error("عنوان را وارد کنید");
        return;
      }
      if (cleanBody.length < 1) {
        toast.error("متن را وارد کنید");
        return;
      }
      onSave({ icon, title: cleanTitle, url: "", body: cleanBody.slice(0, 500), align, image, imagePos: image ? imagePos : "before" });
      return;
    }
    if (block.type === "faq") {
      if (faqDraft) {
        toast.error("اول سوال باز را ذخیره یا لغو کنید");
        return;
      }
      const cleanItems = items.flatMap((item) => {
        const question = item.title?.trim() ?? "";
        const answer = item.value.trim();
        if (question.length < 2 || answer.length < 1) return [];
        return [{ id: item.id, kind: "qa", title: question, value: answer }];
      });
      if (cleanItems.length === 0) {
        toast.error("حداقل یک سوال را ذخیره کنید");
        return;
      }
      onSave({ icon, title: cleanTitle, url: "", body: body.trim().slice(0, 160), items: cleanItems });
      return;
    }
    if (block.type === "gallery") {
      if (cleanTitle.length < 2) {
        toast.error("عنوان را وارد کنید");
        return;
      }
      const cleanItems = items.flatMap((item) => (item.value.startsWith("data:image/") ? [{ id: item.id, kind: "photo", title: "", value: item.value }] : []));
      if (cleanItems.length === 0) {
        toast.error("حداقل یک عکس اضافه کنید");
        return;
      }
      onSave({ icon: "", title: cleanTitle, url: "", body: body.trim().slice(0, 120), items: cleanItems });
      return;
    }
    if (block.type === "video") {
      if (cleanTitle.length < 2) {
        toast.error("عنوان را وارد کنید");
        return;
      }
      let invalid = false;
      const cleanItems = items.flatMap((item) => {
        if (item.kind === "file") return item.value.startsWith("/api/v1/media/") ? [{ ...item, title: "", value: item.value }] : [];
        if (item.kind !== "youtube" && item.kind !== "aparat") return [];
        const next = videoWatch(item.kind, item.value);
        if (item.value.trim() && !next) invalid = true;
        if (!next) return [];
        return [{ ...item, title: "", value: next }];
      });
      if (invalid) {
        toast.error("لینک یوتیوب یا آپارات معتبر نیست");
        return;
      }
      if (cleanItems.length === 0) {
        toast.error("یک فیلم آپلود کنید یا لینک بگذارید");
        return;
      }
      onSave({ icon: "", title: cleanTitle, url: "", body: body.trim().slice(0, 120), items: cleanItems });
      return;
    }
    if (block.type === "file") {
      if (cleanTitle && cleanTitle.length < 2) {
        toast.error("عنوان را کامل‌تر بنویسید");
        return;
      }
      const cleanUrl = normalizeLink(url);
      if (url.trim() && !cleanUrl) {
        toast.error("نشانی فایل معتبر نیست");
        return;
      }
      const files = items.filter((item) => item.kind === "file" && item.value.startsWith("/api/v1/media/") && item.title?.trim() && (item.size ?? 0) > 0);
      if (files.length === 0 && !cleanUrl) {
        toast.error("یک فایل آپلود کنید یا نشانی‌اش را بگذارید");
        return;
      }
      if (files.length > 8) {
        toast.error("بیشتر از ۸ فایل نمی‌شود");
        return;
      }
      const many = files.length + (cleanUrl ? 1 : 0) > 1;
      onSave({
        icon: "",
        title: cleanTitle,
        url: cleanUrl,
        body: many ? "" : body.trim().slice(0, 200),
        items: files.map((file) => ({
          id: file.id,
          kind: "file",
          title: file.title?.trim().slice(0, 120),
          value: file.value,
          size: file.size,
          label: many ? file.label?.trim().slice(0, 80) || "" : "",
          note: many ? file.note?.trim().slice(0, 200) || "" : "",
        })),
      });
      return;
    }
    if (block.type === "divider") {
      const place = align === "left" || align === "right" ? align : "center";
      onSave({ icon: "", title: "", url: "", body: body.trim().slice(0, 40), align: place });
      return;
    }
    if (block.type === "booking") {
      saveBooking();
      return;
    }
    if (block.type === "menu" || block.type === "products" || block.type === "services") {
      const fallback = block.type === "products" ? "products" : block.type === "services" ? "services" : "menu";
      const path = url.trim().replace(/^\/+|\/+$/g, "");
      if (path && (path.includes("/") || path.length > 40)) {
        toast.error(block.type === "products" ? "نشانی صفحه محصولات فقط یک بخش بعد از نام کاربری است" : block.type === "services" ? "نشانی صفحه خدمات فقط یک بخش بعد از نام کاربری است" : "نشانی صفحه منو فقط یک بخش بعد از نام کاربری است");
        return;
      }
      onSave({
        icon: icon || (block.type === "products" ? "bag" : block.type === "services" ? "store" : "utensils"),
        title: cleanTitle,
        url: path || fallback,
        body: body.trim().slice(0, 100),
        items,
        layout: layout === "grid" || layout === "card" ? layout : "list",
        currency: currency || "toman",
      });
      return;
    }
    const extra = form.extra;
    const cleanUrl = extra?.kind === "url" ? normalizeLink(url) : "";
    const cleanBody = extra && extra.kind !== "url" ? body.trim() : "";
    if (cleanTitle.length < 2) {
      toast.error(`${form.title} را وارد کنید`);
      return;
    }
    if (extra?.required && extra.kind === "url" && !cleanUrl) {
      toast.error("نشانی معتبر نیست");
      return;
    }
    if (extra?.required && extra.kind !== "url" && cleanBody.length < 2) {
      toast.error(`${extra.label} را وارد کنید`);
      return;
    }
    onSave({ icon, title: cleanTitle, url: cleanUrl, body: cleanBody });
  }
  const bodyFields = (
    <form onSubmit={submit}>
      {block.type === "contact" || block.type === "address" ? (
        <ContactFields
          title={title}
          items={items}
          onTitle={setTitle}
          onItems={setItems}
          specs={block.type === "address" ? addressKinds : contactKinds}
          empty={block.type === "address" ? "با دکمه‌های بالا آدرس اضافه کنید." : "با دکمه‌های بالا راه تماس اضافه کنید."}
          textKinds={block.type === "address" ? ["text"] : []}
        />
      ) : block.type === "social" ? (
        <ContactFields
          title={title}
          items={items}
          onTitle={setTitle}
          onItems={setItems}
          specs={socialKinds}
          empty="با دکمه‌های بالا شبکه اضافه کنید."
          textKinds={[]}
          max={20}
          afterTitle={
            <div className="mt-3">
              <Field label="نحوه نمایش">
                <AnimatedTabs
                  className="bg-card"
                  items={[{ label: "دکمه‌ها" }, { label: "ردیف آیکون" }, { label: "پاورقی" }]}
                  value={layout === "icons" ? 1 : layout === "footer" ? 2 : 0}
                  onChange={(next) => setLayout(next === 1 ? "icons" : next === 2 ? "footer" : "buttons")}
                />
              </Field>
            </div>
          }
        />
      ) : block.type === "text" ? (
        <TextFields
          icon={icon}
          title={title}
          body={body}
          align={align}
          image={image}
          imagePos={imagePos}
          onIcon={() => setIconsOpen(true)}
          onTitle={setTitle}
          onBody={setBody}
          onAlign={setAlign}
          onImage={setImage}
          onImagePos={setImagePos}
        />
      ) : block.type === "faq" ? (
        <FaqFields
          icon={icon}
          title={title}
          body={body}
          items={items}
          draft={faqDraft}
          onIcon={() => setIconsOpen(true)}
          onTitle={setTitle}
          onBody={setBody}
          onItems={setItems}
          onDraft={setFaqDraft}
        />
      ) : block.type === "gallery" ? (
        <GalleryFields title={title} body={body} items={items} onTitle={setTitle} onBody={setBody} onItems={setItems} />
      ) : block.type === "video" ? (
        <VideoFields businessId={businessId} title={title} body={body} items={items} onTitle={setTitle} onBody={setBody} onItems={setItems} />
      ) : block.type === "file" ? (
        <FileFields businessId={businessId} title={title} body={body} url={url} items={items} onTitle={setTitle} onBody={setBody} onUrl={setUrl} onItems={setItems} />
      ) : block.type === "divider" ? (
        <DividerFields text={body} align={align} onText={setBody} onAlign={setAlign} />
      ) : block.type === "booking" ? (
        <BookingFields businessId={businessId} slug={slug} title={title} body={body} url={url} image={image} onTitle={setTitle} onBody={setBody} onUrl={setUrl} onImage={setImage} onBack={onBack} onSaveBlock={saveBooking} />
      ) : block.type === "menu" || block.type === "products" || block.type === "services" ? (
        <MenuFields
          mode={block.type === "products" ? "products" : block.type === "services" ? "services" : "menu"}
          items={items}
          icon={icon}
          title={title}
          body={body}
          path={url}
          layout={layout}
          currency={currency}
          prefix={slug ? `/b/${slug}/` : "/b/نام‌کاربری/"}
          onItems={setItems}
          onIcon={() => setIconsOpen(true)}
          onTitle={setTitle}
          onBody={setBody}
          onPath={setUrl}
          onLayout={setLayout}
          onCurrency={setCurrency}
          onDialog={setMenuDialog}
        />
      ) : (
        <>
      <Field label="آیکون">
        <button type="button" onClick={() => setIconsOpen(true)} className="flex min-h-11 w-full items-center gap-3 rounded-xl border border-line bg-card px-3 text-start">
          <Icon className="size-5 shrink-0" aria-hidden="true" />
          <span className="text-sm">انتخاب آیکون</span>
        </button>
      </Field>
      <div className="mt-3">
        <Field label={form.title}>
          <TextInput value={title} maxLength={80} onChange={(event) => setTitle(event.target.value)} required />
        </Field>
      </div>
      {form.extra?.kind === "url" ? (
        <div className="mt-3">
          <Field label={form.extra.label}>
            <input
              dir="ltr"
              inputMode="url"
              value={url}
              placeholder="https://"
              onChange={(event) => setUrl(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-line bg-card px-3 text-left text-sm outline-none"
            />
          </Field>
        </div>
      ) : null}
      {form.extra?.kind === "phone" ? (
        <div className="mt-3">
          <Field label={form.extra.label}>
            <TextInput dir="ltr" className="text-left" inputMode="tel" value={body} maxLength={20} onChange={(event) => setBody(event.target.value)} />
          </Field>
        </div>
      ) : null}
      {form.extra?.kind === "text" ? (
        <div className="mt-3">
          <Field label={form.extra.label}>
            <Area value={body} maxLength={500} onChange={(event) => setBody(event.target.value)} />
          </Field>
        </div>
      ) : null}
        </>
      )}
      {block.type === "booking" ? null : (
      <div className="mt-8 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-paper px-5 text-sm font-semibold text-ink">انصراف</button>
        <button type="submit" className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-on-ink">{mode === "edit" ? "ذخیره" : "اضافه کردن"}</button>
      </div>
      )}
      {iconsOpen ? <IconPicker selected={icon} onPick={(next) => { setIcon(next); setIconsOpen(false); }} onBack={() => setIconsOpen(false)} onClose={() => setIconsOpen(false)} /> : null}
    </form>
  );
  if (desktop) {
    return (
      <CenterWindow title={kind.label} onBack={onBack} onClose={onClose} closeOnEscape={!iconsOpen && !menuDialog}>
        {bodyFields}
      </CenterWindow>
    );
  }
  return (
    <HalfSheet title={kind.label} onBack={onBack} onClose={onClose} closeOnEscape={!iconsOpen && !menuDialog}>
      {bodyFields}
    </HalfSheet>
  );
}

function TextFields({
  icon,
  title,
  body,
  align,
  image,
  imagePos,
  onIcon,
  onTitle,
  onBody,
  onAlign,
  onImage,
  onImagePos,
}: {
  icon: string;
  title: string;
  body: string;
  align: string;
  image: string;
  imagePos: string;
  onIcon: () => void;
  onTitle: (value: string) => void;
  onBody: (value: string) => void;
  onAlign: (value: string) => void;
  onImage: (value: string) => void;
  onImagePos: (value: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const Icon = pageIcon(icon) ?? Type;
  const aligns = ["right", "center", "left"];
  const places = ["before", "after"];
  return (
    <div>
      <Field label="آیکون">
        <button type="button" onClick={onIcon} className="flex min-h-11 w-full items-center gap-3 rounded-xl border border-line bg-card px-3 text-start">
          <Icon className="size-5 shrink-0" aria-hidden="true" />
          <span className="text-sm">انتخاب آیکون</span>
        </button>
      </Field>
      <div className="mt-3">
        <Field label="عنوان">
          <TextInput value={title} maxLength={80} onChange={(event) => onTitle(event.target.value)} required />
        </Field>
      </div>
      <div className="mt-3">
        <Field label="متن">
          <Area value={body} maxLength={500} onChange={(event) => onBody(event.target.value.slice(0, 500))} />
        </Field>
        <p className="mt-1 text-xs tabular-nums text-muted">{faNum(body.length)} از {faNum(500)}</p>
      </div>
      <div className="mt-3">
        <Field label="تراز متن">
          <AnimatedTabs
            className="bg-card"
            items={[{ label: "راست‌چین" }, { label: "وسط‌چین" }, { label: "چپ‌چین" }]}
            value={Math.max(0, aligns.indexOf(align))}
            onChange={(next) => onAlign(aligns[next] ?? "right")}
          />
        </Field>
      </div>
      <div className="mt-3">
        <Field label="عکس" hint="دلخواه">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              void readTextImage(file).then(onImage).catch(() => toast.error("این تصویر باز نشد"));
            }}
          />
          {image ? (
            <div className="relative overflow-hidden rounded-xl">
              <img src={image} alt="" className="h-48 w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/70 px-3 py-2 text-sm font-semibold text-white">
                <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5">
                  <ImagePlus className="size-4" aria-hidden="true" />
                  ویرایش
                </button>
                <button type="button" onClick={() => onImage("")} className="inline-flex items-center gap-1.5">
                  <Trash2 className="size-4" aria-hidden="true" />
                  حذف
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-semibold">
              <ImagePlus className="size-4" aria-hidden="true" />
              آپلود عکس
            </button>
          )}
        </Field>
      </div>
      {image ? (
        <div className="mt-3">
          <Field label="جای عکس">
            <AnimatedTabs
              className="bg-card"
              items={[{ label: "قبل از متن" }, { label: "بعد از متن" }]}
              value={places.indexOf(imagePos) < 0 ? 0 : places.indexOf(imagePos)}
              onChange={(next) => onImagePos(places[next] ?? "before")}
            />
          </Field>
        </div>
      ) : null}
    </div>
  );
}

const fileAccept = ".pdf,.png,.jpg,.jpeg,.webp,.gif,.txt,.csv,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.mp3,.wav,.ogg,.m4a";
const fileMax = 40 * 1024 * 1024;
const fileLimit = 8;

function fileAllowed(name: string) {
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")).toLowerCase() : "";
  return fileAccept.split(",").includes(ext);
}

function isUploadedFile(item: ContactItem) {
  return item.kind === "file" && item.value.startsWith("/api/v1/media/");
}

function FileFields({
  businessId,
  title,
  body,
  url,
  items,
  onTitle,
  onBody,
  onUrl,
  onItems,
}: {
  businessId: string;
  title: string;
  body: string;
  url: string;
  items: ContactItem[];
  onTitle: (value: string) => void;
  onBody: (value: string) => void;
  onUrl: (value: string) => void;
  onItems: (next: ContactItem[] | ((current: ContactItem[]) => ContactItem[])) => void;
}) {
  const [queue, setQueue] = useState<{ key: string; name: string; size: number; progress: number }[]>([]);
  const inflight = useRef(0);
  const dropped = useRef(new Set<string>());
  const itemsRef = useRef(items);
  const bodyRef = useRef(body);
  const urlRef = useRef(url);
  itemsRef.current = items;
  bodyRef.current = body;
  urlRef.current = url;
  const saved = items.filter(isUploadedFile);
  const many = saved.length + (url.trim() ? 1 : 0) > 1;

  function publish(next: ContactItem[]) {
    let copy = next;
    const several = copy.filter(isUploadedFile).length + (urlRef.current.trim() ? 1 : 0) > 1;
    const note = bodyRef.current.trim();
    if (several && note) {
      const index = copy.findIndex((item) => isUploadedFile(item) && !item.note?.trim());
      if (index >= 0) {
        copy = copy.map((item, itemIndex) => (itemIndex === index ? { ...item, note: note.slice(0, 200) } : item));
        bodyRef.current = "";
        onBody("");
      }
    }
    onItems(copy);
  }

  async function upload(next: File) {
    if (!fileAllowed(next.name)) {
      toast.error("این نوع فایل مجاز نیست");
      return;
    }
    if (next.size > fileMax) {
      toast.error("حجم فایل بیشتر از ۴۰ مگابایت است. جای دیگری آپلود کنید و نشانی را بگذارید");
      return;
    }
    if (saved.length + inflight.current >= fileLimit) {
      toast.error("بیشتر از ۸ فایل نمی‌شود");
      return;
    }
    const key = crypto.randomUUID();
    inflight.current += 1;
    setQueue((current) => [...current, { key, name: next.name, size: next.size, progress: 0 }]);
    const res = await uploadPageFile(businessId, next, (percent) => {
      if (dropped.current.has(key)) return;
      setQueue((current) => current.map((item) => (item.key === key ? { ...item, progress: percent } : item)));
    });
    const removed = dropped.current.has(key);
    dropped.current.delete(key);
    if (!removed) inflight.current = Math.max(0, inflight.current - 1);
    setQueue((current) => current.filter((item) => item.key !== key));
    if (removed) return;
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    const created: ContactItem = { id: crypto.randomUUID(), kind: "file", title: next.name.slice(0, 120), value: res.data.url, size: next.size };
    onItems((current) => {
      if (current.some((item) => item.value === created.value)) return current;
      const appended = [...current, created];
      const several = appended.filter(isUploadedFile).length + (urlRef.current.trim() ? 1 : 0) > 1;
      const note = bodyRef.current.trim();
      if (!several || !note) return appended;
      const index = appended.findIndex((item) => isUploadedFile(item) && !item.note?.trim());
      if (index < 0) return appended;
      bodyRef.current = "";
      queueMicrotask(() => onBody(""));
      return appended.map((item, itemIndex) => (itemIndex === index ? { ...item, note: note.slice(0, 200) } : item));
    });
  }

  function patch(id: string, patch: Partial<ContactItem>) {
    onItems(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  return (
    <div>
      <Field label="عنوان" hint={many ? "دلخواه. عنوان کارت فایل‌ها" : "دلخواه. اگر خالی بماند، اسم فایل نشان داده می‌شود"}>
        <TextInput value={title} maxLength={80} onChange={(event) => onTitle(event.target.value)} />
      </Field>
      {many ? null : (
        <div className="mt-3">
          <Field label="توضیحات" hint="دلخواه">
            <Area value={body} maxLength={200} onChange={(event) => onBody(event.target.value)} />
          </Field>
        </div>
      )}
      <div className="mt-3">
        <Field label="فایل">
          <FileUpload
            multiple
            showList={false}
            accept={fileAccept}
            maxSize={fileMax}
            hint="PDF، تصویر، زیپ یا آفیس، تا ۴۰ مگابایت"
            onAdd={(files) => {
              let warned = false;
              for (const file of files) {
                if (saved.length + inflight.current >= fileLimit) {
                  if (!warned) toast.error("بیشتر از ۸ فایل نمی‌شود");
                  warned = true;
                  break;
                }
                void upload(file);
              }
            }}
          />
          {queue.length > 0 || saved.length > 0 ? (
            <div dir="rtl" className="mt-2 flex flex-col gap-2">
              {saved.map((item) => {
                const name = item.title?.trim() || "فایل";
                const size = item.size ? faFileSize(item.size) : "";
                return (
                  <div key={item.id} className="grid w-full justify-items-start gap-2">
                    <Attachment dir="rtl" state="done">
                      <AttachmentMedia>
                        <FileText aria-hidden="true" />
                      </AttachmentMedia>
                      <AttachmentContent>
                        <AttachmentTitle><bdi>{item.label?.trim() || name}</bdi></AttachmentTitle>
                        <AttachmentDescription>{size ? `بارگذاری شد · ${size}` : "بارگذاری شد"}</AttachmentDescription>
                      </AttachmentContent>
                      <AttachmentActions>
                        <AttachmentAction aria-label="حذف" onClick={() => onItems(items.filter((entry) => entry.id !== item.id))}>
                          <X />
                        </AttachmentAction>
                      </AttachmentActions>
                    </Attachment>
                    {many ? (
                      <div className="grid w-full gap-2">
                        <TextInput value={item.label ?? ""} maxLength={80} placeholder="عنوان، دلخواه" onChange={(event) => patch(item.id, { label: event.target.value })} />
                        <Area value={item.note ?? ""} maxLength={200} placeholder="توضیحات، دلخواه" onChange={(event) => patch(item.id, { note: event.target.value })} />
                      </div>
                    ) : null}
                  </div>
                );
              })}
              {queue.map((item) => (
                <Attachment key={item.key} dir="rtl" state="uploading">
                  <AttachmentMedia>
                    <FileText aria-hidden="true" />
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle><bdi>{item.name}</bdi></AttachmentTitle>
                    <AttachmentDescription>در حال بارگذاری · {faNum(item.progress)}٪</AttachmentDescription>
                  </AttachmentContent>
                  <AttachmentActions>
                    <AttachmentAction
                      aria-label="حذف"
                      onClick={() => {
                        dropped.current.add(item.key);
                        inflight.current = Math.max(0, inflight.current - 1);
                        setQueue((current) => current.filter((entry) => entry.key !== item.key));
                      }}
                    >
                      <X />
                    </AttachmentAction>
                  </AttachmentActions>
                </Attachment>
              ))}
            </div>
          ) : null}
        </Field>
      </div>
      <div className="mt-3">
        <Field label="نشانی فایل" hint="دلخواه">
          <input
            dir="ltr"
            inputMode="url"
            value={url}
            placeholder="https://"
            onChange={(event) => {
              const value = event.target.value;
              urlRef.current = value;
              onUrl(value);
              if (itemsRef.current.filter(isUploadedFile).length + (value.trim() ? 1 : 0) > 1) publish(itemsRef.current);
            }}
            className="min-h-11 w-full rounded-xl border border-line bg-card px-3 text-left text-sm outline-none"
          />
        </Field>
      </div>
    </div>
  );
}

function DividerFields({
  text,
  align,
  onText,
  onAlign,
}: {
  text: string;
  align: string;
  onText: (value: string) => void;
  onAlign: (value: string) => void;
}) {
  const places = ["center", "right", "left"];
  const place = places.includes(align) ? align : "center";
  return (
    <div>
      <Field label="متن" hint="دلخواه. یک عبارت کوتاه روی خط">
        <TextInput value={text} maxLength={40} onChange={(event) => onText(event.target.value.slice(0, 40))} />
      </Field>
      <div className="mt-3">
        <Field label="موقعیت متن">
          <AnimatedTabs
            className="bg-card"
            items={[{ label: "وسط" }, { label: "راست" }, { label: "چپ" }]}
            value={Math.max(0, places.indexOf(place))}
            onChange={(next) => onAlign(places[next] ?? "center")}
          />
        </Field>
      </div>
      <div className="mt-3">
        <Field label="پیش‌نمایش">
          <div className="rounded-2xl bg-[#1c1c1c] px-4 py-6">
            <DividerLine text={text} align={place} />
          </div>
        </Field>
      </div>
    </div>
  );
}

function VideoFields({
  businessId,
  title,
  body,
  items,
  onTitle,
  onBody,
  onItems,
}: {
  businessId: string;
  title: string;
  body: string;
  items: ContactItem[];
  onTitle: (value: string) => void;
  onBody: (value: string) => void;
  onItems: (next: ContactItem[] | ((current: ContactItem[]) => ContactItem[])) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const file = items.find((item) => item.kind === "file" && item.value.startsWith("/api/v1/media/"));
  const links = items.filter((item) => item.kind === "youtube" || item.kind === "aparat");
  async function upload(next: File) {
    if (next.size > 40 * 1024 * 1024) {
      toast.error("حجم فیلم بیشتر از ۴۰ مگابایت است");
      return;
    }
    setPending(true);
    const res = await uploadPageVideo(businessId, next);
    setPending(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    const url = res.data.url;
    onItems((current) => {
      const rest = current.filter((item) => item.kind !== "file");
      const id = current.find((item) => item.kind === "file")?.id ?? crypto.randomUUID();
      return [...rest, { id, kind: "file", title: "", value: url }];
    });
  }
  function add(kind: "youtube" | "aparat") {
    if (links.length >= 6) {
      toast.error("بیشتر از ۶ لینک نمی‌شود");
      return;
    }
    onItems((current) => [...current, { id: crypto.randomUUID(), kind, title: "", value: "" }]);
  }
  return (
    <div>
      <Field label="عنوان">
        <TextInput value={title} maxLength={80} onChange={(event) => onTitle(event.target.value)} required />
      </Field>
      <div className="mt-3">
        <Field label="زیرعنوان" hint="دلخواه">
          <TextInput value={body} maxLength={120} onChange={(event) => onBody(event.target.value)} />
        </Field>
      </div>
      <div className="mt-3">
        <Field label="آپلود فیلم">
          <input
            ref={fileRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
            className="sr-only"
            onChange={(event) => {
              const next = event.target.files?.[0];
              event.target.value = "";
              if (next) void upload(next);
            }}
          />
          {file ? (
            <div className="overflow-hidden rounded-xl">
              <video src={file.value} controls playsInline className="h-48 w-full bg-black object-cover" />
              <div className="flex items-center justify-between bg-black/70 px-3 py-2 text-sm font-semibold text-white">
                <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5">
                  <ImagePlus className="size-4" aria-hidden="true" />
                  ویرایش
                </button>
                <button type="button" onClick={() => onItems((current) => current.filter((item) => item.kind !== "file"))} className="inline-flex items-center gap-1.5">
                  <Trash2 className="size-4" aria-hidden="true" />
                  حذف
                </button>
              </div>
            </div>
          ) : (
            <button type="button" disabled={pending} onClick={() => fileRef.current?.click()} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-semibold disabled:opacity-60">
              <ImagePlus className="size-4" aria-hidden="true" />
              {pending ? "در حال آپلود" : "آپلود فیلم"}
            </button>
          )}
        </Field>
      </div>
      <div className="mt-6">
        <Field label="یوتیوب و آپارات">
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => add("youtube")} className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-card px-3 text-sm font-semibold">یوتیوب</button>
            <button type="button" onClick={() => add("aparat")} className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-card px-3 text-sm font-semibold">آپارات</button>
          </div>
        </Field>
        <div className="mt-3 grid gap-2">
          {links.map((item) => (
            <div key={item.id} className="min-w-0 rounded-xl border border-line bg-paper p-3">
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1 text-sm font-semibold">{item.kind === "aparat" ? "آپارات" : "یوتیوب"}</span>
                <button type="button" aria-label="حذف" className="grid size-8 shrink-0 place-items-center rounded-full text-danger hover:bg-danger-soft" onClick={() => onItems((current) => current.filter((row) => row.id !== item.id))}>
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
              <input
                dir="ltr"
                inputMode="url"
                value={item.value}
                placeholder="https://"
                onChange={(event) => onItems((current) => current.map((row) => (row.id === item.id ? { ...row, value: event.target.value } : row)))}
                className="mt-2 min-h-11 w-full min-w-0 rounded-xl border border-line bg-card px-3 text-left text-sm outline-none"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GalleryFields({
  title,
  body,
  items,
  onTitle,
  onBody,
  onItems,
}: {
  title: string;
  body: string;
  items: ContactItem[];
  onTitle: (value: string) => void;
  onBody: (value: string) => void;
  onItems: (next: ContactItem[] | ((current: ContactItem[]) => ContactItem[])) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const target = useRef("");
  const photos = items.filter((item) => item.value.startsWith("data:image/"));
  function openPicker(id: string) {
    target.current = id;
    fileRef.current?.click();
  }
  return (
    <div>
      <Field label="عنوان">
        <TextInput value={title} maxLength={80} onChange={(event) => onTitle(event.target.value)} required />
      </Field>
      <div className="mt-3">
        <Field label="زیرعنوان" hint="دلخواه">
          <TextInput value={body} maxLength={120} onChange={(event) => onBody(event.target.value)} />
        </Field>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          const id = target.current;
          if (!file) return;
          void readTextImage(file).then((next) => {
            if (id) onItems((current) => current.map((item) => (item.id === id ? { ...item, value: next } : item)));
            else onItems((current) => [...current, { id: crypto.randomUUID(), kind: "photo", title: "", value: next }]);
          }).catch(() => toast.error("این تصویر باز نشد"));
        }}
      />
      <div className="mt-3 grid grid-cols-2 gap-2">
        {photos.map((item) => (
          <div key={item.id} className="relative overflow-hidden rounded-xl">
            <img src={item.value} alt="" className="h-40 w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/70 px-2 py-1.5 text-xs font-semibold text-white">
              <button type="button" onClick={() => openPicker(item.id)} className="inline-flex items-center gap-1">
                <ImagePlus className="size-3.5" aria-hidden="true" />
                ویرایش
              </button>
              <button type="button" aria-label="حذف" onClick={() => onItems((current) => current.filter((row) => row.id !== item.id))} className="inline-flex items-center gap-1">
                <Trash2 className="size-3.5" aria-hidden="true" />
                حذف
              </button>
            </div>
          </div>
        ))}
        {photos.length < 6 ? (
          <button type="button" onClick={() => openPicker("")} className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-paper text-sm font-semibold">
            <ImagePlus className="size-5" aria-hidden="true" />
            افزودن از گالری
          </button>
        ) : null}
      </div>
    </div>
  );
}

function FaqFields({
  icon,
  title,
  body,
  items,
  draft,
  onIcon,
  onTitle,
  onBody,
  onItems,
  onDraft,
}: {
  icon: string;
  title: string;
  body: string;
  items: ContactItem[];
  draft: { id: string; question: string; answer: string; fresh: boolean } | null;
  onIcon: () => void;
  onTitle: (value: string) => void;
  onBody: (value: string) => void;
  onItems: (next: ContactItem[] | ((current: ContactItem[]) => ContactItem[])) => void;
  onDraft: (next: { id: string; question: string; answer: string; fresh: boolean } | null) => void;
}) {
  const Icon = pageIcon(icon) ?? HelpCircle;
  function add() {
    if (draft) {
      toast.error("اول این سوال را ذخیره یا لغو کنید");
      return;
    }
    if (items.length >= 30) {
      toast.error("بیشتر از ۳۰ سوال نمی‌شود");
      return;
    }
    onDraft({ id: crypto.randomUUID(), question: "", answer: "", fresh: true });
  }
  function edit(item: ContactItem) {
    if (draft) {
      toast.error("اول این سوال را ذخیره یا لغو کنید");
      return;
    }
    onDraft({ id: item.id, question: item.title ?? "", answer: item.value, fresh: false });
  }
  function saveDraft() {
    if (!draft) return;
    const question = draft.question.trim();
    const answer = draft.answer.trim();
    if (question.length < 2) {
      toast.error("سوال را وارد کنید");
      return;
    }
    if (answer.length < 1) {
      toast.error("جواب را وارد کنید");
      return;
    }
    const next = { id: draft.id, kind: "qa", title: question, value: answer };
    if (draft.fresh) onItems([...items, next]);
    else onItems((current) => current.map((row) => (row.id === draft.id ? next : row)));
    onDraft(null);
  }
  function startDrag(event: ReactPointerEvent<HTMLButtonElement>, id: string) {
    event.preventDefault();
    const pointerId = event.pointerId;
    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      const rows = [...document.querySelectorAll<HTMLElement>("[data-faq]")];
      const over = rows.findIndex((row) => {
        const box = row.getBoundingClientRect();
        return ev.clientY >= box.top && ev.clientY <= box.bottom;
      });
      if (over < 0) return;
      onItems((current) => {
        const from = current.findIndex((item) => item.id === id);
        if (from < 0 || from === over) return current;
        const next = [...current];
        const [row] = next.splice(from, 1);
        next.splice(over, 0, row);
        return next;
      });
    };
    const end = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  }
  const form = draft ? (
    <div className="rounded-xl border border-line bg-paper p-3">
      <Field label="سوال">
        <TextInput value={draft.question} maxLength={160} onChange={(event) => onDraft({ ...draft, question: event.target.value })} />
      </Field>
      <div className="mt-2">
        <Field label="جواب">
          <Area value={draft.answer} maxLength={500} onChange={(event) => onDraft({ ...draft, answer: event.target.value.slice(0, 500) })} />
        </Field>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" onClick={() => onDraft(null)} className="inline-flex h-10 items-center justify-center rounded-full border border-line bg-card px-4 text-sm font-semibold">انصراف</button>
        <button type="button" onClick={saveDraft} className="inline-flex h-10 items-center justify-center rounded-full bg-ink px-4 text-sm font-semibold text-on-ink">ذخیره</button>
      </div>
    </div>
  ) : null;
  return (
    <div>
      <Field label="آیکون">
        <button type="button" onClick={onIcon} className="flex min-h-11 w-full items-center gap-3 rounded-xl border border-line bg-card px-3 text-start">
          <Icon className="size-5 shrink-0" aria-hidden="true" />
          <span className="text-sm">انتخاب آیکون</span>
        </button>
      </Field>
      <div className="mt-3">
        <Field label="عنوان" hint="دلخواه">
          <TextInput value={title} maxLength={80} onChange={(event) => onTitle(event.target.value)} />
        </Field>
      </div>
      <div className="mt-3">
        <Field label="توضیحات کوتاه" hint="دلخواه">
          <Area value={body} maxLength={160} onChange={(event) => onBody(event.target.value.slice(0, 160))} />
        </Field>
      </div>
      <div className="mt-3 grid gap-2">
        {items.map((item) => draft && !draft.fresh && draft.id === item.id ? (
          <div key={item.id}>{form}</div>
        ) : (
          <div key={item.id} data-faq={item.id} className="flex min-w-0 items-center gap-2 rounded-xl border border-line bg-paper px-2 py-2">
            <button type="button" aria-label="جابه‌جایی" disabled={Boolean(draft)} className="grid size-8 shrink-0 cursor-grab touch-none place-items-center rounded-full text-muted active:cursor-grabbing disabled:cursor-default" onPointerDown={(event) => { if (!draft) startDrag(event, item.id); }}>
              <GripVertical className="size-4" aria-hidden="true" />
            </button>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{item.title}</span>
            <button type="button" aria-label="ویرایش" className="grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-card hover:text-ink" onClick={() => edit(item)}>
              <Pencil className="size-4" aria-hidden="true" />
            </button>
            <button type="button" aria-label="حذف" className="grid size-8 shrink-0 place-items-center rounded-full text-danger hover:bg-danger-soft" onClick={() => onItems((current) => current.filter((row) => row.id !== item.id))}>
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        ))}
        {draft?.fresh ? form : null}
      </div>
      <button type="button" onClick={add} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-semibold">
        <Plus className="size-4" aria-hidden="true" />
        افزودن سوال
      </button>
    </div>
  );
}

function readTextImage(file: File) {
  return fitImage(file, 960);
}

function ContactFields({
  title,
  items,
  onTitle,
  onItems,
  specs,
  empty,
  textKinds,
  max = 12,
  afterTitle,
}: {
  title: string;
  items: ContactItem[];
  onTitle: (value: string) => void;
  onItems: (next: ContactItem[] | ((current: ContactItem[]) => ContactItem[])) => void;
  specs: { kind: string; label: string; field: string; placeholder: string; input?: string; limit?: number }[];
  empty: string;
  textKinds: string[];
  max?: number;
  afterTitle?: ReactNode;
}) {
  function add(kind: string) {
    if (items.length >= max) {
      toast.error(`بیشتر از ${faNum(max)} مورد نمی‌شود`);
      return;
    }
    onItems([...items, { id: crypto.randomUUID(), kind, title: "", value: "" }]);
  }
  function startDrag(event: ReactPointerEvent<HTMLButtonElement>, id: string) {
    event.preventDefault();
    const pointerId = event.pointerId;
    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      const rows = [...document.querySelectorAll<HTMLElement>("[data-contact]")];
      const over = rows.findIndex((row) => {
        const box = row.getBoundingClientRect();
        return ev.clientY >= box.top && ev.clientY <= box.bottom;
      });
      if (over < 0) return;
      onItems((current) => {
        const from = current.findIndex((item) => item.id === id);
        if (from < 0 || from === over) return current;
        const next = [...current];
        const [row] = next.splice(from, 1);
        next.splice(over, 0, row);
        return next;
      });
    };
    const end = (ev: PointerEvent) => {
      if (ev.pointerId !== pointerId) return;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  }
  return (
    <div>
      <Field label="عنوان بلوک">
        <TextInput value={title} maxLength={80} onChange={(event) => onTitle(event.target.value)} required />
      </Field>
      {afterTitle}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {specs.map((kind, index) => (
          <button
            key={kind.kind}
            type="button"
            className={`inline-flex min-h-11 w-full items-center justify-center rounded-full border border-line bg-card px-3 text-sm font-semibold ${index === specs.length - 1 && specs.length % 2 === 1 ? "col-span-2" : ""}`}
            onClick={() => add(kind.kind)}
          >
            {kind.label}
          </button>
        ))}
      </div>
      {items.length === 0 ? <p className="mt-4 text-sm text-muted">{empty}</p> : null}
      <div className="mt-3 grid gap-2">
        {items.map((item) => {
          const found = specs.find((spec) => spec.kind === item.kind);
          const kind = found ?? { ...contactKind(item.kind), input: undefined, limit: undefined };
          const text = textKinds.includes(item.kind);
          return (
            <div key={item.id} data-contact={item.id} className="min-w-0 rounded-xl border border-line bg-paper p-3">
              <div className="flex items-center gap-2">
                <button type="button" aria-label="جابه‌جایی" className="grid size-8 shrink-0 cursor-grab touch-none place-items-center rounded-full text-muted active:cursor-grabbing" onPointerDown={(event) => startDrag(event, item.id)}>
                  <GripVertical className="size-4" aria-hidden="true" />
                </button>
                <span className="min-w-0 flex-1 text-sm font-semibold">{kind.label}</span>
                <button
                  type="button"
                  aria-label="حذف"
                  className="grid size-8 shrink-0 place-items-center rounded-full text-danger hover:bg-danger-soft"
                  onClick={() => onItems((current) => current.filter((row) => row.id !== item.id))}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
              {text ? (
                <div className="mt-2">
                  <Field label={kind.field}>
                    <Area value={item.value} maxLength={400} onChange={(event) => onItems((current) => current.map((row) => (row.id === item.id ? { ...row, value: event.target.value } : row)))} />
                  </Field>
                </div>
              ) : (
                <>
                  <div className="mt-2">
                    <Field label="برچسب">
                      <TextInput value={item.title ?? ""} maxLength={40} placeholder={kind.label} onChange={(event) => onItems((current) => current.map((row) => (row.id === item.id ? { ...row, title: event.target.value } : row)))} />
                    </Field>
                  </div>
                  <div className="mt-2">
                    <Field label={kind.field}>
                      <input
                        dir="ltr"
                        inputMode={kind.input === "tel" || item.kind === "phone" || item.kind === "whatsapp" ? "tel" : kind.input === "email" || item.kind === "email" ? "email" : kind.input === "text" ? "text" : "url"}
                        value={item.value}
                        maxLength={kind.limit ?? (item.kind === "google" || item.kind === "neshan" || item.kind === "waze" || item.kind === "balad" ? 500 : 80)}
                        placeholder={kind.placeholder}
                        onChange={(event) => onItems((current) => current.map((row) => (row.id === item.id ? { ...row, value: event.target.value } : row)))}
                        className="min-h-11 w-full min-w-0 rounded-xl border border-line bg-card px-3 text-left text-sm outline-none"
                      />
                    </Field>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const iconCategoryNames: Record<string, string> = {
  beauty: "زیبایی و آرایش",
  health: "سلامت",
  consult: "مشاوره",
  education: "آموزش",
  sport: "ورزش",
  auto: "خودرو",
  pets: "حیوانات خانگی",
  other: "سایر",
};

function IconPicker({ selected, onPick, onBack, onClose }: { selected: string; onPick: (id: string) => void; onBack: () => void; onClose: () => void }) {
  const desktop = useIsDesktop();
  const [groups, setGroups] = useState<{ slug: string; name: string }[]>([]);
  const [tab, setTab] = useState("");
  useEffect(() => {
    categoriesFn().then((res) => {
      const next = !res.ok || !Array.isArray(res.data) || res.data.length === 0
        ? Object.entries(iconCategoryNames).map(([slug, name]) => ({ slug, name }))
        : res.data.map((item: { slug: string; name: string }) => ({ slug: item.slug, name: item.name }));
      setGroups(next);
      const home = activitySlug(selected);
      setTab(next.some((item) => item.slug === home) ? home : next[0]?.slug ?? "");
    });
  }, [selected]);
  const body = (
    <div className="min-w-0">
      <CategoryTabs groups={groups} value={tab} onChange={setTab} />
      <div className="mt-3 grid grid-cols-[repeat(auto-fill,3rem)] justify-start gap-1.5">
        {iconsForSlug(tab).map((item) => {
          const Icon = item.icon;
          const on = item.id === selected;
          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.id}
              aria-pressed={on}
              className={`grid size-12 place-items-center rounded-xl border ${on ? "border-jade bg-jade-soft text-jade" : "border-line bg-paper text-ink"}`}
              onClick={() => onPick(item.id)}
            >
              <Icon className="size-5" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
  if (desktop) return <CenterWindow title="انتخاب آیکون" onBack={onBack} onClose={onClose} z="z-[80]">{body}</CenterWindow>;
  return <HalfSheet title="انتخاب آیکون" onBack={onBack} onClose={onClose} z="z-[80]">{body}</HalfSheet>;
}

function CategoryTabs({ groups, value, onChange }: { groups: { slug: string; name: string }[]; value: string; onChange: (value: string) => void }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);
  const index = Math.max(0, groups.findIndex((item) => item.slug === value));

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    const update = () => {
      const max = node.scrollWidth - node.clientWidth;
      setMore(max - Math.abs(node.scrollLeft) > 8);
    };
    update();
    node.addEventListener("scroll", update, { passive: true });
    const watcher = new ResizeObserver(update);
    watcher.observe(node);
    return () => {
      node.removeEventListener("scroll", update);
      watcher.disconnect();
    };
  }, [groups.length]);

  return (
    <div className="relative min-w-0">
      <div ref={scroller} className="w-full min-w-0 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <AnimatedTabs
          className="bg-card"
          items={groups.map((item) => ({ label: item.name }))}
          value={index}
          onChange={(next) => {
            const group = groups[next];
            if (group) onChange(group.slug);
          }}
        />
      </div>
      {more ? <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-card to-transparent" /> : null}
    </div>
  );
}

function activitySlug(iconId: string) {
  const groups = ["beauty", "health", "consult", "education", "sport", "auto", "pets", "other"];
  return groups.find((slug) => iconsForSlug(slug).some((item) => item.id === iconId)) ?? "other";
}
