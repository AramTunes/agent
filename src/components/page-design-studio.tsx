import { X } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { uploadPageFile, uploadPageVideo } from "@/lib/api";
import { faNum } from "@/lib/booking/fa";
import {
  blockRadius,
  buttonChrome,
  cleanHex,
  defaultPageDesign,
  gradientCss,
  pageBackground,
  resolveTheme,
  themeColors,
  type PageDesign,
} from "@/lib/page-design";

const tabs = [
  { id: "theme", label: "تم" },
  { id: "background", label: "پس‌زمینه" },
  { id: "layout", label: "چینش" },
  { id: "radius", label: "دکمه‌ها" },
] as const;

export function DesignStudio({
  design,
  businessId,
  onChange,
  onClose,
  onSave,
}: {
  design: PageDesign;
  businessId: string;
  onChange: (next: PageDesign) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const editor = useDesignEditor(design, businessId, onChange);
  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-[60] flex h-[min(58dvh,34rem)] w-full max-w-full flex-col overflow-hidden rounded-t-[1.6rem] border border-line bg-card text-ink shadow-[0_-16px_40px_rgb(0_0_0/0.18)]">
        <div className="mx-auto mt-2 h-1.5 w-12 shrink-0 rounded-full bg-line" />
        <div className="grid shrink-0 grid-cols-4 gap-1.5 px-3 pb-2 pt-3">
          {tabs.map((item) => (
            <button key={item.id} type="button" onClick={() => editor.setTab(item.id)} className={`min-h-11 min-w-0 rounded-full px-1 text-center text-xs font-semibold ${editor.tab === item.id ? "bg-ink text-on-ink" : "border border-line bg-paper text-ink"}`}>
              <span className="block truncate">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pb-3">
          <DesignPanes editor={editor} design={design} />
        </div>
        <div className="flex shrink-0 justify-end gap-2 border-t border-line px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button type="button" onClick={onClose} className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-paper px-5 text-sm font-semibold">انصراف</button>
          <button type="button" onClick={onSave} className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-on-ink">ذخیره</button>
        </div>
      </div>
      {editor.crop ? <CropSheet src={editor.crop} onCancel={() => editor.setCrop(null)} onSave={(file) => void editor.uploadImage(file)} /> : null}
    </>
  );
}

export function DesktopDesign({
  design,
  businessId,
  onChange,
  onClose,
  onSave,
  preview,
}: {
  design: PageDesign;
  businessId: string;
  onChange: (next: PageDesign) => void;
  onClose: () => void;
  onSave: () => void;
  preview: ReactNode;
}) {
  const editor = useDesignEditor(design, businessId, onChange);
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-label="بستن" onClick={onClose} />
        <div role="dialog" aria-modal="true" aria-label="طراحی صفحه" className="relative z-10 flex h-[min(92dvh,52rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[1.375rem] border border-line bg-card text-ink shadow-[0_20px_50px_-20px_rgb(0_0_0/0.8)]">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3">
            <h2 className="text-base font-semibold">طراحی صفحه</h2>
            <button type="button" aria-label="بستن" onClick={onClose} className="grid size-9 place-items-center rounded-full text-ink hover:bg-paper">
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-[12.5rem_minmax(0,1.6fr)_minmax(16rem,0.85fr)]">
            <nav className="flex min-h-0 flex-col gap-2 overflow-y-auto border-e border-line p-3">
              {tabs.map((item) => (
                <button key={item.id} type="button" onClick={() => editor.setTab(item.id)} className={`h-11 rounded-full px-3 text-sm font-semibold ${editor.tab === item.id ? "bg-ink text-on-ink" : "border border-line bg-paper text-ink"}`}>
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="flex min-h-0 min-w-0 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <DesignPanes editor={editor} design={design} />
              </div>
              <div className="flex shrink-0 justify-end gap-2 border-t border-line px-4 py-3">
                <button type="button" onClick={onClose} className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-paper px-5 text-sm font-semibold">انصراف</button>
                <button type="button" onClick={onSave} className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-on-ink">ذخیره</button>
              </div>
            </div>
            <div className="min-h-0 border-s border-line bg-paper p-3">
              <div className="mx-auto h-full max-w-[22rem] overflow-hidden rounded-[1.4rem] border-2 border-ink bg-ink p-px">
                <div className="h-full overflow-hidden rounded-[1.3rem] bg-black">{preview}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {editor.crop ? <CropSheet src={editor.crop} onCancel={() => editor.setCrop(null)} onSave={(file) => void editor.uploadImage(file)} /> : null}
    </>
  );
}

function useDesignEditor(design: PageDesign, businessId: string, onChange: (next: PageDesign) => void) {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("theme");
  const [crop, setCrop] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const designRef = useRef(design);
  designRef.current = design;
  const patch = (next: Partial<PageDesign>) => onChange({ ...designRef.current, ...next });
  return { tab, setTab, crop, setCrop, busy, note, patch, uploadImage, uploadVideo, openCrop };

  async function uploadImage(file: File) {
    if (!businessId) {
      setNote("صفحه هنوز آماده نیست");
      return;
    }
    setBusy(true);
    setNote("");
    const res = await uploadPageFile(businessId, file);
    setBusy(false);
    if (!res.ok) {
      setNote(res.error);
      toast.error(res.error);
      return;
    }
    setCrop(null);
    patch({ bgKind: "image", image: res.data.url });
  }

  async function uploadVideo(file: File) {
    if (!businessId) {
      setNote("صفحه هنوز آماده نیست");
      return;
    }
    if (!videoFile(file)) {
      setNote("فقط فیلم mp4، webm یا mov");
      return;
    }
    setBusy(true);
    setNote("");
    const res = await uploadPageVideo(businessId, file);
    setBusy(false);
    if (!res.ok) {
      setNote(res.error);
      toast.error(res.error);
      return;
    }
    patch({ bgKind: "video", video: res.data.url });
  }

  function openCrop(file: File) {
    if (!file.type.startsWith("image/") && !/\.(png|jpe?g|webp|gif)$/i.test(file.name)) {
      setNote("فقط تصویر jpg، png، webp یا gif");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setNote("حجم تصویر بیشتر از ۱۲ مگابایت است");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result || "");
      const probe = new Image();
      probe.onload = () => setCrop(src);
      probe.onerror = () => setNote("این تصویر باز نشد. jpg یا png بفرست");
      probe.src = src;
    };
    reader.onerror = () => setNote("خواندن تصویر ممکن نشد");
    reader.readAsDataURL(file);
  }
}

function DesignPanes({ editor, design }: { editor: ReturnType<typeof useDesignEditor>; design: PageDesign }) {
  return (
    <>
      {editor.tab === "theme" ? <ThemePane design={design} onChange={editor.patch} /> : null}
      {editor.tab === "background" ? <BackgroundPane design={design} busy={editor.busy} note={editor.note} onChange={editor.patch} onImage={editor.openCrop} onVideo={(file) => void editor.uploadVideo(file)} /> : null}
      {editor.tab === "layout" ? <LayoutPane design={design} onChange={editor.patch} /> : null}
      {editor.tab === "radius" ? <ButtonsPane design={design} onChange={editor.patch} /> : null}
    </>
  );
}

function videoFile(file: File) {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return name.endsWith(".mp4") || name.endsWith(".webm") || name.endsWith(".mov") || name.endsWith(".m4v") || type.includes("mp4") || type.includes("webm") || type.includes("quicktime");
}

function ThemePane({ design, onChange }: { design: PageDesign; onChange: (next: Partial<PageDesign>) => void }) {
  return (
    <div className="grid gap-4">
      <Group title="پایه">
        <div className="grid grid-cols-3 gap-2">
          <ThemeCard label="روشن" theme="light" selected={design.theme === "light"} onPick={(theme) => onChange({ theme })} sample={{ ...defaultPageDesign, theme: "light" }} />
          <ThemeCard label="تاریک" theme="dark" selected={design.theme === "dark"} onPick={(theme) => onChange({ theme })} sample={{ ...defaultPageDesign, theme: "dark" }} />
          <ThemeCard label="اختصاصی" theme="custom" selected={design.theme === "custom"} onPick={(theme) => onChange({ theme })} sample={{ ...defaultPageDesign, theme: "custom", accent: design.accent || "#00A693" }} />
        </div>
        {design.theme === "custom" ? (
          <div className="grid gap-2">
            <ColorField label="رنگ اختصاصی" value={design.accent || "#00A693"} onChange={(accent) => onChange({ accent })} />
            <NamedColors title="رنگ‌های پیشنهادی" value={design.accent} onPick={(accent) => onChange({ accent })} />
          </div>
        ) : null}
      </Group>
      <Group title="رنگ‌های روشن">
        <div className="grid grid-cols-2 gap-2">
          {themeColors.map((color) => {
            const id = `light-${color.hex.slice(1)}`;
            return <ThemeCard key={id} label={color.name} theme={id} selected={design.theme === id} onPick={(theme) => onChange({ theme })} sample={{ ...defaultPageDesign, theme: id }} swatch={color.hex} />;
          })}
        </div>
      </Group>
      <Group title="رنگ‌های تیره">
        <div className="grid grid-cols-2 gap-2">
          {themeColors.map((color) => {
            const id = `dark-${color.hex.slice(1)}`;
            return <ThemeCard key={id} label={color.name} theme={id} selected={design.theme === id} onPick={(theme) => onChange({ theme })} sample={{ ...defaultPageDesign, theme: id }} swatch={color.hex} />;
          })}
        </div>
      </Group>
    </div>
  );
}

function ThemeCard({ label, theme, selected, onPick, sample, swatch }: { label: string; theme: string; selected: boolean; onPick: (theme: string) => void; sample: PageDesign; swatch?: string }) {
  const tokens = resolveTheme(sample);
  return (
    <button type="button" onClick={() => onPick(theme)} className={`w-full rounded-2xl border p-2 text-start ${selected ? "border-ink ring-2 ring-ink" : "border-line"}`}>
      <span className="mb-2 flex min-w-0 items-center gap-2 text-sm font-semibold">
        {swatch ? <Swatch value={swatch} /> : null}
        <span className="truncate">{label}</span>
      </span>
      <span className="grid gap-1 rounded-xl p-2" style={{ background: tokens.bg }}>
        <span className="h-4 rounded-md border border-black/15" style={{ background: tokens.card }} />
        <span className="h-4 w-12 rounded-full border border-black/15" style={{ background: tokens.button }} />
      </span>
    </button>
  );
}

function BackgroundPane({ design, busy, note, onChange, onImage, onVideo }: {
  design: PageDesign;
  busy: boolean;
  note: string;
  onChange: (next: Partial<PageDesign>) => void;
  onImage: (file: File) => void;
  onVideo: (file: File) => void;
}) {
  const kinds = [
    ["solid", "تک‌رنگ"],
    ["gradient", "گرادیانت"],
    ["image", "تصویر"],
    ["video", "ویدیو"],
  ] as const;
  return (
    <div className="grid min-w-0 gap-3">
      <p className="text-sm font-semibold">رنگ پس‌زمینه</p>
      <div className="grid grid-cols-4 gap-1.5">
        {kinds.map(([id, label]) => (
          <button key={id} type="button" onClick={() => onChange({ bgKind: id })} className={`min-h-11 min-w-0 rounded-full px-1 text-center text-xs font-semibold ${design.bgKind === id ? "bg-ink text-on-ink" : "border border-line bg-paper"}`}>
            <span className="block truncate">{label}</span>
          </button>
        ))}
      </div>
      {design.bgKind === "solid" ? (
        <>
          <ColorField label="رنگ" value={design.bgColor || "#111111"} onChange={(bgColor) => onChange({ bgColor })} />
          <NamedColors title="رنگ‌های پیشنهادی" value={design.bgColor} onPick={(bgColor) => onChange({ bgColor })} />
        </>
      ) : null}
      {design.bgKind === "gradient" ? <GradientField design={design} onChange={onChange} /> : null}
      {design.bgKind === "image" ? (
        <>
          {design.image ? <img src={design.image} alt="" className="h-28 w-full rounded-2xl object-cover" /> : null}
          <FilePick accept="image/*" label={busy ? "در حال آپلود" : design.image ? "عوض کردن تصویر" : "آپلود تصویر"} disabled={busy} onFile={onImage} />
          <EffectField design={design} onChange={onChange} />
        </>
      ) : null}
      {design.bgKind === "video" ? (
        <>
          {design.video ? <video src={design.video} className="h-28 w-full rounded-2xl bg-black object-cover" muted playsInline /> : null}
          <FilePick accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov" label={busy ? "در حال آپلود" : design.video ? "عوض کردن ویدیو" : "آپلود ویدیو"} disabled={busy} onFile={onVideo} />
          <p className="text-xs leading-5 text-muted">ویدیو خودش اندازهٔ صفحه می‌شود. mp4، webm یا mov.</p>
          <EffectField design={design} onChange={onChange} />
        </>
      ) : null}
      {note ? <p className="text-sm text-danger">{note}</p> : null}
    </div>
  );
}

function FilePick({ accept, label, disabled, onFile }: { accept: string; label: string; disabled?: boolean; onFile: (file: File) => void }) {
  return (
    <label className={`relative flex min-h-20 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-line bg-paper text-sm font-semibold ${disabled ? "opacity-60" : ""}`}>
      {label}
      <input
        type="file"
        accept={accept}
        disabled={disabled}
        className="absolute inset-0 cursor-pointer opacity-0"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) onFile(file);
        }}
      />
    </label>
  );
}

function GradientField({ design, onChange }: { design: PageDesign; onChange: (next: Partial<PageDesign>) => void }) {
  const dirs = [
    ["tb", "بالا و پایین"],
    ["lr", "چپ و راست"],
    ["radial", "شعاعی"],
  ] as const;
  return (
    <div className="grid gap-3">
      <div className="h-14 rounded-2xl border border-line" style={{ background: gradientCss(design) }} />
      {design.gradientColors.map((color, index) => (
        <div key={`${color}-${index}`} className="grid gap-2 rounded-2xl border border-line p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold"><Swatch value={color} />رنگ {faNum(index + 1)}</span>
            {design.gradientColors.length > 2 ? <button type="button" className="text-xs font-semibold text-danger" onClick={() => {
              onChange({ gradientColors: design.gradientColors.filter((_, at) => at !== index), gradientStops: design.gradientStops.filter((_, at) => at !== index) });
            }}>حذف</button> : null}
          </div>
          <ColorField label="کد رنگ" value={color} onChange={(next) => onChange({ gradientColors: design.gradientColors.map((item, at) => (at === index ? next : item)) })} />
          <label className="grid gap-1 text-xs text-muted">
            جای رنگ
            <input type="range" min={0} max={100} value={design.gradientStops[index] ?? 0} onChange={(event) => onChange({ gradientStops: design.gradientStops.map((item, at) => (at === index ? Number(event.target.value) : item)) })} />
          </label>
        </div>
      ))}
      {design.gradientColors.length < 4 ? <button type="button" className="h-11 rounded-full border border-line text-sm font-semibold" onClick={() => onChange({ gradientColors: [...design.gradientColors, "#F77FBE"], gradientStops: [...design.gradientStops, 100] })}>افزودن رنگ</button> : null}
      <div className="grid grid-cols-3 gap-1.5">
        {dirs.map(([id, label]) => (
          <button key={id} type="button" onClick={() => onChange({ gradientDir: id })} className={`min-w-0 rounded-2xl border p-2 text-xs font-semibold ${design.gradientDir === id ? "border-ink ring-2 ring-ink" : "border-line"}`}>
            <span className="mb-2 block h-8 w-full rounded-lg" style={{ background: gradientCss({ ...design, gradientDir: id }) }} />
            <span className="block truncate">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function EffectField({ design, onChange }: { design: PageDesign; onChange: (next: Partial<PageDesign>) => void }) {
  const tokens = resolveTheme(design);
  const tint = tokens.light ? "#000000" : "#FFFFFF";
  return (
    <div className="grid gap-2">
      <p className="text-sm font-semibold">افکت</p>
      <div className="grid grid-cols-3 gap-1.5">
        {([["none", "هیچ"], ["tint", "تک‌رنگ"], ["blur", "محو"]] as const).map(([id, label]) => (
          <button key={id} type="button" onClick={() => onChange({ effect: id })} className={`min-h-11 min-w-0 rounded-full px-1 text-xs font-semibold ${design.effect === id ? "bg-ink text-on-ink" : "border border-line"}`}>
            <span className="block truncate">{label}</span>
          </button>
        ))}
      </div>
      {design.effect === "tint" ? (
        <label className="grid gap-1 text-xs text-muted">
          <span className="inline-flex items-center gap-2">شدت پوشش <Swatch value={tint} /></span>
          <input type="range" min={0} max={80} value={design.effectAmount} onChange={(event) => onChange({ effectAmount: Number(event.target.value) })} />
        </label>
      ) : null}
      {design.effect === "blur" ? (
        <label className="grid gap-1 text-xs text-muted">
          شدت محو
          <input type="range" min={0} max={100} value={design.effectAmount} onChange={(event) => onChange({ effectAmount: Number(event.target.value) })} />
        </label>
      ) : null}
    </div>
  );
}

function LayoutPane({ design, onChange }: { design: PageDesign; onChange: (next: Partial<PageDesign>) => void }) {
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-2">
        <PickCard label="لیستی" selected={design.layout === "list"} onClick={() => onChange({ layout: "list" })}>
          <span className="grid gap-1">
            <span className="h-3 rounded-full" style={{ background: "currentColor", opacity: 0.85 }} />
            <span className="h-3 rounded-full" style={{ background: "currentColor", opacity: 0.55 }} />
            <span className="h-3 rounded-full" style={{ background: "currentColor", opacity: 0.3 }} />
          </span>
        </PickCard>
        <PickCard label="کارتی" selected={design.layout === "card"} onClick={() => onChange({ layout: "card" })}>
          <span className="grid grid-cols-2 gap-1">
            <span className="aspect-square rounded-lg" style={{ background: "currentColor", opacity: 0.85 }} />
            <span className="aspect-square rounded-lg" style={{ background: "currentColor", opacity: 0.45 }} />
          </span>
        </PickCard>
      </div>
      {design.layout === "card" ? (
        <div className="flex gap-2">
          <button type="button" onClick={() => onChange({ columns: 1 })} className={`h-11 flex-1 rounded-full text-sm font-semibold ${design.columns === 1 ? "bg-ink text-on-ink" : "border border-line"}`}>یک ستونه</button>
          <button type="button" onClick={() => onChange({ columns: 2 })} className={`h-11 flex-1 rounded-full text-sm font-semibold ${design.columns === 2 ? "bg-ink text-on-ink" : "border border-line"}`}>دو ستونه</button>
        </div>
      ) : null}
    </div>
  );
}

function ButtonsPane({ design, onChange }: { design: PageDesign; onChange: (next: Partial<PageDesign>) => void }) {
  const tokens = resolveTheme(design);
  const styles = [
    ["default", "پیشفرض"],
    ["solid", "توپر"],
    ["outline", "خطی"],
    ["glass", "شیشه‌ای"],
  ] as const;
  const corners = [
    ["sharp", "تیز"],
    ["soft", "کمی گرد"],
    ["round", "گرد"],
    ["pill", "کپسولی"],
  ] as const;
  const shadows = [
    ["none", "بدون سایه"],
    ["soft", "نرم"],
    ["hard", "سخت"],
  ] as const;
  const sample = (patch: Partial<PageDesign>) => buttonChrome({
    ...design,
    radius: "round",
    buttonStyle: "solid",
    buttonShadow: "none",
    ...patch,
  }, tokens);
  const stage = (patch: Partial<PageDesign>, roomy = false) => (
    <span className={`block rounded-lg ${roomy ? "px-2 py-3" : "p-1.5"}`} style={{ background: tokens.bg }}>
      <span className="block h-7 w-full" style={sample(patch)} />
    </span>
  );
  return (
    <div className="grid gap-5">
      <Group title="سبک">
        <div className="grid grid-cols-2 gap-2">
          {styles.map(([id, label]) => (
            <PickCard key={id} label={label} selected={design.buttonStyle === id} onClick={() => onChange({ buttonStyle: id })}>
              {stage({ buttonStyle: id })}
            </PickCard>
          ))}
        </div>
      </Group>
      <Group title="گوشه‌ها">
        <div className="grid grid-cols-2 gap-2">
          {corners.map(([id, label]) => (
            <PickCard key={id} label={label} selected={design.radius === id} onClick={() => onChange({ radius: id })}>
              {stage({ radius: id })}
            </PickCard>
          ))}
        </div>
      </Group>
      <Group title="سایه">
        <div className="grid grid-cols-3 gap-2">
          {shadows.map(([id, label]) => (
            <PickCard key={id} label={label} selected={design.buttonShadow === id} onClick={() => onChange({ buttonShadow: id })}>
              {stage({ buttonShadow: id }, true)}
            </PickCard>
          ))}
        </div>
      </Group>
    </div>
  );
}

function CropSheet({ src, onCancel, onSave }: { src: string; onCancel: () => void; onSave: (file: File) => void }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [frame, setFrame] = useState({ w: 0, h: 0 });
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  useEffect(() => {
    const box = frameRef.current;
    if (!box) return;
    const measure = () => setFrame({ w: box.clientWidth, h: box.clientHeight });
    measure();
    const watch = new ResizeObserver(measure);
    watch.observe(box);
    return () => watch.disconnect();
  }, []);
  useEffect(() => {
    const img = new Image();
    img.onload = () => setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = src;
  }, [src]);
  const placed = placeCover(frame, natural, zoom, offset);
  function nudge(dx: number, dy: number) {
    setOffset((current) => {
      const next = placeCover(frame, natural, zoom, { x: current.x + dx, y: current.y + dy });
      return { x: next.x, y: next.y };
    });
  }
  function move(event: ReactPointerEvent) {
    if (!drag.current) return;
    const next = placeCover(frame, natural, zoom, { x: drag.current.ox + event.clientX - drag.current.x, y: drag.current.oy + event.clientY - drag.current.y });
    setOffset({ x: next.x, y: next.y });
  }
  return (
    <div className="fixed inset-0 z-[80] grid place-items-end bg-black/60 p-3">
      <div className="max-h-[92dvh] w-full overflow-y-auto rounded-[1.4rem] bg-card p-4 text-ink">
        <p className="font-semibold">برش تصویر</p>
        <p className="mt-1 text-xs leading-5 text-muted">عکس را بکش یا با دکمه‌ها جابه‌جا کن. قاب همیشه پر می‌ماند.</p>
        <div
          ref={frameRef}
          className="relative mx-auto mt-3 aspect-[9/16] h-[34dvh] overflow-hidden rounded-2xl bg-black"
          style={{ touchAction: "none" }}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            drag.current = { x: event.clientX, y: event.clientY, ox: placed.x, oy: placed.y };
          }}
          onPointerMove={move}
          onPointerUp={() => { drag.current = null; }}
          onPointerCancel={() => { drag.current = null; }}
        >
          {placed.dw ? <img src={src} alt="" draggable={false} className="absolute max-w-none select-none" style={{ width: placed.dw, height: placed.dh, left: placed.left, top: placed.top }} /> : null}
        </div>
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          <button type="button" onClick={() => nudge(0, -36)} className="h-10 rounded-full border border-line text-xs font-semibold">بالا</button>
          <button type="button" onClick={() => nudge(0, 36)} className="h-10 rounded-full border border-line text-xs font-semibold">پایین</button>
          <button type="button" onClick={() => nudge(-36, 0)} className="h-10 rounded-full border border-line text-xs font-semibold">چپ</button>
          <button type="button" onClick={() => nudge(36, 0)} className="h-10 rounded-full border border-line text-xs font-semibold">راست</button>
        </div>
        <label className="mt-3 grid gap-1 text-xs text-muted">
          بزرگ‌نمایی
          <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(event) => {
            const nextZoom = Number(event.target.value);
            setZoom(nextZoom);
            setOffset((current) => {
              const next = placeCover(frame, natural, nextZoom, current);
              return { x: next.x, y: next.y };
            });
          }} />
        </label>
        <div className="mt-3 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="inline-flex h-11 items-center justify-center rounded-full border border-line px-5 text-sm font-semibold">انصراف</button>
          <button type="button" onClick={() => void exportCrop(src, zoom, offset, frame).then(onSave).catch(() => toast.error("برش تصویر ممکن نشد"))} className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-on-ink">ثبت و آپلود</button>
        </div>
      </div>
    </div>
  );
}

function placeCover(frame: { w: number; h: number }, natural: { w: number; h: number }, zoom: number, offset: { x: number; y: number }) {
  if (!frame.w || !frame.h || !natural.w || !natural.h) return { x: 0, y: 0, dw: 0, dh: 0, left: 0, top: 0 };
  const cover = Math.max(frame.w / natural.w, frame.h / natural.h);
  const dw = natural.w * cover * zoom;
  const dh = natural.h * cover * zoom;
  const maxX = Math.max(0, (dw - frame.w) / 2);
  const maxY = Math.max(0, (dh - frame.h) / 2);
  const x = Math.min(maxX, Math.max(-maxX, offset.x));
  const y = Math.min(maxY, Math.max(-maxY, offset.y));
  return { x, y, dw, dh, left: (frame.w - dw) / 2 + x, top: (frame.h - dh) / 2 + y };
}

function exportCrop(src: string, zoom: number, offset: { x: number; y: number }, frame: { w: number; h: number }) {
  return new Promise<File>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const outW = 1080;
      const outH = 1920;
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      const placed = placeCover(frame, { w: img.naturalWidth, h: img.naturalHeight }, zoom, offset);
      if (!ctx || !placed.dw || !frame.w || !frame.h) {
        reject(new Error("canvas"));
        return;
      }
      const sx = outW / frame.w;
      const sy = outH / frame.h;
      ctx.drawImage(img, placed.left * sx, placed.top * sy, placed.dw * sx, placed.dh * sy);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("blob"));
          return;
        }
        resolve(new File([blob], "background.jpg", { type: "image/jpeg" }));
      }, "image/jpeg", 0.86);
    };
    img.onerror = () => reject(new Error("image"));
    img.src = src;
  });
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [text, setText] = useState(value);
  useEffect(() => {
    setText(value);
  }, [value]);
  return (
    <label className="grid gap-1 text-sm">
      <span className="inline-flex items-center gap-2 font-semibold"><Swatch value={cleanHex(value) || "#111111"} />{label}</span>
      <span className="flex items-center gap-2">
        <input type="color" value={cleanHex(value) || "#111111"} onChange={(event) => { setText(event.target.value.toUpperCase()); onChange(event.target.value.toUpperCase()); }} className="size-11 shrink-0 rounded-xl border border-line bg-card" />
        <input dir="ltr" value={text} onChange={(event) => {
          setText(event.target.value);
          const next = cleanHex(event.target.value);
          if (next) onChange(next);
        }} className="min-h-11 w-full rounded-xl border border-line bg-card px-3 text-left text-sm outline-none" />
      </span>
    </label>
  );
}

function NamedColors({ title, value, onPick }: { title: string; value: string; onPick: (value: string) => void }) {
  return (
    <div className="grid gap-2">
      <p className="text-xs font-semibold text-muted">{title}</p>
      <div className="grid grid-cols-2 gap-2">
        {themeColors.map((color) => (
          <button key={color.hex} type="button" onClick={() => onPick(color.hex)} className={`flex items-center gap-2 rounded-xl border px-2 py-2 text-start text-sm font-semibold ${value.toUpperCase() === color.hex ? "border-ink" : "border-line"}`}>
            <Swatch value={color.hex} />
            {color.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function Swatch({ value }: { value: string }) {
  return <span className="inline-block size-4 shrink-0 rounded-full border border-black/10" style={{ background: value }} />;
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return <section className="grid gap-2"><h3 className="text-sm font-bold">{title}</h3>{children}</section>;
}

function PickCard({ label, selected, onClick, children }: { label: string; selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`w-full rounded-2xl border p-3 text-start text-sm font-semibold ${selected ? "border-ink ring-2 ring-ink" : "border-line"}`}>
      <span className="grid gap-2">
        {children}
        <span className="block truncate">{label}</span>
      </span>
    </button>
  );
}

export function designBackdrop(design: PageDesign) {
  const tokens = resolveTheme(design);
  return { tokens, background: pageBackground(design, tokens), radius: blockRadius(design) };
}
