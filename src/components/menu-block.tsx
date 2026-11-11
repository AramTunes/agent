import { Briefcase, ChevronDown, ImagePlus, Minus, Pencil, Plus, Search, ShoppingBag, Trash2, UtensilsCrossed, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { AnimatedTabs } from "@/components/animated-tabs";
import { Shell } from "@/components/shell";
import { Switch } from "@/components/switch";
import { Area, Empty, Field, Skeleton, TextInput } from "@/components/ui";
import { Combobox } from "@/components/ui/combobox";
import { Select } from "@/components/ui/select";
import type { ContactItem } from "@/components/link-page";
import { publicBusinessFn, placeMenuOrderFn } from "@/lib/api";
import { JalaliCalendar } from "@/components/jalali-calendar";
import { enDigits, faNum } from "@/lib/booking/fa";
import { fitImage } from "@/lib/fit-image";
import { pageIcon } from "@/lib/page-icons";

const statuses = [
  { id: "available", label: "موجود" },
  { id: "unavailable", label: "ناموجود" },
  { id: "hidden", label: "مخفی" },
];
const priceTypes = [
  { id: "fixed", label: "ثابت" },
  { id: "from", label: "از" },
  { id: "range", label: "بازه" },
  { id: "contact", label: "تماس بگیرید" },
  { id: "free", label: "رایگان" },
];
const presetLabels = ["ویژه", "جدید", "پرفروش", "پیشنهاد ما"];
const presetUnits = ["عدد", "کیلوگرم", "گرم", "میلی‌گرم", "لیتر", "میلی‌لیتر", "متر", "سانتی‌متر", "بسته", "جفت"];
const currencies = [
  { id: "toman", label: "تومان" },
  { id: "rial", label: "ریال" },
  { id: "dollar", label: "دلار" },
  { id: "euro", label: "یورو" },
  { id: "dinar", label: "دینار عراق" },
];
const views = [
  { id: "list", label: "لیست" },
  { id: "grid", label: "گرید" },
  { id: "card", label: "کارت" },
];

type Variant = { id: string; title: string; price: number; status: string };
type Dish = {
  id: string;
  image: string;
  title: string;
  description: string;
  price: string;
  priceTo: string;
  priceType: string;
  variants: Variant[];
  categoryId: string;
  status: string;
  labels: string[];
  unit: string;
  link: string;
  sku: string;
  featured: boolean;
};
type Category = { id: string; image: string; title: string; description: string };

function money(value: string) {
  const n = Number(enDigits(value).replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function webLink(value: string) {
  const next = value.trim();
  if (!next) return "";
  if (/^https?:\/\//i.test(next)) return next;
  if (/^[\w.-]+\.[a-z]{2,}([/?#].*)?$/i.test(next)) return `https://${next}`;
  return next;
}

function unitName(currency?: string) {
  return currencies.find((item) => item.id === currency)?.label ?? "تومان";
}

export function formatMenuMoney(amount: number, currency?: string) {
  const grouped = Math.max(0, Math.round(amount)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
  return `${faNum(grouped)} ${unitName(currency)}`;
}

function priceText(item: { price?: number; priceTo?: number; priceType?: string }, currency?: string) {
  if (item.priceType === "free") return "رایگان";
  if (item.priceType === "contact") return "تماس بگیرید";
  if (item.priceType === "from") return `از ${formatMenuMoney(item.price ?? 0, currency)}`;
  if (item.priceType === "range") return `${formatMenuMoney(item.price ?? 0, currency)} تا ${formatMenuMoney(item.priceTo ?? 0, currency)}`;
  return formatMenuMoney(item.price ?? 0, currency);
}

function priceWithUnit(item: { price?: number; priceTo?: number; priceType?: string; unit?: string }, currency?: string) {
  const text = priceText(item, currency);
  if (!item.unit || item.priceType === "free" || item.priceType === "contact") return text;
  return `${text} / ${item.unit}`;
}

function blankDish(): Dish {
  return { id: crypto.randomUUID(), image: "", title: "", description: "", price: "", priceTo: "", priceType: "fixed", variants: [], categoryId: "", status: "available", labels: [], unit: "", link: "", sku: "", featured: false };
}

function dishFrom(item: ContactItem): Dish {
  return {
    id: item.id,
    image: item.image ?? "",
    title: item.title ?? "",
    description: item.value ?? "",
    price: item.price ? String(item.price) : "",
    priceTo: item.priceTo ? String(item.priceTo) : "",
    priceType: priceTypes.some((type) => type.id === item.priceType) ? item.priceType! : "fixed",
    variants: (item.variants ?? []).map((variant) => ({ ...variant })),
    categoryId: item.categoryId ?? "",
    status: statuses.some((status) => status.id === item.status) ? item.status! : "available",
    labels: item.labels ?? [],
    unit: item.unit ?? "",
    link: item.link ?? "",
    sku: item.sku ?? "",
    featured: Boolean(item.featured),
  };
}

function toItem(dish: Dish): ContactItem {
  return {
    id: dish.id,
    kind: "item",
    title: dish.title.trim(),
    value: dish.description.trim().slice(0, 100),
    image: dish.image,
    price: money(dish.price),
    priceTo: dish.priceType === "range" ? money(dish.priceTo) : 0,
    priceType: dish.priceType,
    status: dish.status,
    categoryId: dish.categoryId,
    labels: dish.labels,
    unit: dish.unit.trim().slice(0, 24),
    link: webLink(dish.link),
    sku: dish.sku.trim().slice(0, 40),
    featured: dish.featured,
    variants: dish.variants,
  };
}

function toCategory(category: Category): ContactItem {
  return { id: category.id, kind: "category", title: category.title.trim(), value: category.description.trim().slice(0, 100), image: category.image };
}

const words = {
  menu: {
    tab: "آیتم‌ها",
    search: "جست‌وجو در عنوان آیتم‌ها",
    empty: "هنوز آیتمی اضافه نشده.",
    none: "آیتمی با این عنوان نیست.",
    needTitle: "عنوان آیتم را وارد کنید",
    window: "آیتم منو",
    photo: "عکس آیتم",
    details: "جزئیات آیتم",
    path: "menu",
    pathHint: "اگر خالی بماند، نشانی صفحه menu می‌شود.",
    view: "نمای منو",
    screen: "منوی دیجیتال",
    missing: "این منو نیست",
    missingBody: "این نشانی به منو وصل نیست.",
    featured: "این مورد در منو برجسته‌تر از بقیه دیده می‌شود. اگر لیبل هم برایش بگذاری، دلیل برجسته بودنش برای مشتری روشن‌تر است.",
  },
  products: {
    tab: "محصولات",
    search: "جست‌وجو در عنوان محصولات",
    empty: "هنوز محصولی اضافه نشده.",
    none: "محصولی با این عنوان نیست.",
    needTitle: "عنوان محصول را وارد کنید",
    window: "محصول",
    photo: "عکس محصول",
    details: "جزئیات محصول",
    path: "products",
    pathHint: "اگر خالی بماند، نشانی صفحه products می‌شود.",
    view: "نمای محصولات",
    screen: "محصولات",
    missing: "این فروشگاه نیست",
    missingBody: "این نشانی به محصولات وصل نیست.",
    featured: "این محصول در فهرست برجسته‌تر از بقیه دیده می‌شود. اگر لیبل هم برایش بگذاری، دلیل برجسته بودنش برای مشتری روشن‌تر است.",
  },
  services: {
    tab: "خدمات",
    search: "جست‌وجو در عنوان خدمات",
    empty: "هنوز خدمتی اضافه نشده.",
    none: "خدمتی با این عنوان نیست.",
    needTitle: "عنوان خدمت را وارد کنید",
    window: "خدمت",
    photo: "عکس خدمت",
    details: "جزئیات خدمت",
    path: "services",
    pathHint: "اگر خالی بماند، نشانی صفحه services می‌شود.",
    view: "نمای خدمات",
    screen: "خدمات",
    missing: "این خدمات نیست",
    missingBody: "این نشانی به خدمات وصل نیست.",
    featured: "این خدمت در فهرست برجسته‌تر از بقیه دیده می‌شود. اگر لیبل هم برایش بگذاری، دلیل برجسته بودنش برای مشتری روشن‌تر است.",
  },
} as const;

type CatalogMode = keyof typeof words;

function catalogMark(mode: CatalogMode) {
  if (mode === "products") return ShoppingBag;
  if (mode === "services") return Briefcase;
  return UtensilsCrossed;
}

function catalogFallback(type?: string) {
  if (type === "products") return "products";
  if (type === "services") return "services";
  return "menu";
}

export function MenuFields({
  items, icon, title, body, path, layout, currency, prefix, mode = "menu",
  onItems, onIcon, onTitle, onBody, onPath, onLayout, onCurrency, onDialog,
}: {
  items: ContactItem[];
  icon: string;
  title: string;
  body: string;
  path: string;
  layout: string;
  currency: string;
  prefix: string;
  mode?: CatalogMode;
  onItems: (items: ContactItem[]) => void;
  onIcon: () => void;
  onTitle: (value: string) => void;
  onBody: (value: string) => void;
  onPath: (value: string) => void;
  onLayout: (value: string) => void;
  onCurrency: (value: string) => void;
  onDialog: (open: boolean) => void;
}) {
  const [tab, setTab] = useState(0);
  const [query, setQuery] = useState("");
  const [catQuery, setCatQuery] = useState("");
  const [editing, setEditing] = useState<Dish | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const dishes = items.filter((item) => item.kind === "item");
  const categories = items.filter((item) => item.kind === "category");
  const shown = dishes.filter((item) => !query.trim() || (item.title ?? "").includes(query.trim()));
  const shownCats = categories.filter((item) => !catQuery.trim() || (item.title ?? "").includes(catQuery.trim()));
  const copy = words[mode];
  const storedUnits = items.map((item) => (item.kind === "unit" ? item.title?.trim() || "" : "")).filter(Boolean);
  const units = storedUnits.length > 0 ? storedUnits : [...presetUnits];
  const Mark = pageIcon(icon) ?? catalogMark(mode);

  useEffect(() => {
    onDialog(Boolean(editing));
    return () => onDialog(false);
  }, [editing, onDialog]);

  function saveDish(dish: Dish) {
    if (!dish.title.trim()) {
      toast.error(copy.needTitle);
      return;
    }
    const link = webLink(dish.link);
    if (link && !/^https?:\/\//i.test(link)) {
      toast.error("لینک محصول معتبر نیست");
      return;
    }
    const next = toItem(dish);
    onItems(items.some((item) => item.id === dish.id) ? items.map((item) => (item.id === dish.id ? next : item)) : [...items, next]);
    setEditing(null);
  }

  function saveCategory(next: Category) {
    if (!next.title.trim()) {
      toast.error("عنوان دسته‌بندی را وارد کنید");
      return;
    }
    const row = toCategory(next);
    onItems(items.some((item) => item.id === next.id) ? items.map((item) => (item.id === next.id ? row : item)) : [...items, row]);
    setCategory(null);
  }

  function persistUnits(next: string[], rename?: { from: string; to: string }) {
    const unique = [...new Set(next.map((item) => item.trim()).filter(Boolean))].slice(0, 40);
    const rest = items.filter((item) => item.kind !== "unit").map((row) => {
      if (row.kind !== "item" || !row.unit) return row;
      if (rename && row.unit === rename.from) return { ...row, unit: rename.to };
      if (!unique.includes(row.unit)) return { ...row, unit: "" };
      return row;
    });
    const rows: ContactItem[] = unique.map((title) => {
      const prev = items.find((item) => item.kind === "unit" && item.title === title);
      return { id: prev?.id ?? crypto.randomUUID(), kind: "unit", title, value: "" };
    });
    onItems([...rest, ...rows]);
    setEditing((dish) => {
      if (!dish?.unit) return dish;
      if (rename && dish.unit === rename.from) return { ...dish, unit: rename.to };
      if (!unique.includes(dish.unit)) return { ...dish, unit: "" };
      return dish;
    });
  }

  return (
    <div>
      <AnimatedTabs className="bg-card" items={[{ label: copy.tab }, { label: "دسته‌بندی‌ها" }, { label: "تنظیمات" }]} value={tab} onChange={setTab} />
      {tab === 0 ? (
        <div className="mt-4 grid gap-3">
          <SearchRow value={query} onChange={setQuery} placeholder={copy.search} onAdd={() => setEditing(blankDish())} />
          {dishes.length === 0 ? <p className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-sm text-muted">{copy.empty}</p> : null}
          {dishes.length > 0 && shown.length === 0 ? <p className="text-sm text-muted">{copy.none}</p> : null}
          {shown.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl border border-line bg-card p-3">
              <Thumb image={item.image} mark={catalogMark(mode)} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{item.title}</p>
                <p className="truncate text-xs text-muted">{priceWithUnit(item, currency)} · {statuses.find((status) => status.id === item.status)?.label ?? "موجود"}</p>
              </div>
              <IconButton label="ویرایش" onClick={() => setEditing(dishFrom(item))}><Pencil className="size-4" /></IconButton>
              <IconButton label="حذف" onClick={() => onItems(items.filter((row) => row.id !== item.id))}><Trash2 className="size-4" /></IconButton>
            </div>
          ))}
        </div>
      ) : null}
      {tab === 1 ? (
        <div className="mt-4 grid gap-3">
          <SearchRow value={catQuery} onChange={setCatQuery} placeholder="جست‌وجو در دسته‌بندی‌ها" onAdd={() => setCategory({ id: crypto.randomUUID(), image: "", title: "", description: "" })} />
          {category && !categories.some((item) => item.id === category.id) ? <CategoryForm category={category} fresh onChange={setCategory} onSave={() => saveCategory(category)} onCancel={() => setCategory(null)} /> : null}
          {categories.length === 0 && !category ? <p className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-sm text-muted">هنوز دسته‌بندی اضافه نشده.</p> : null}
          {categories.length > 0 && shownCats.length === 0 ? <p className="text-sm text-muted">دسته‌بندی با این عنوان نیست.</p> : null}
          {shownCats.map((item) => category?.id === item.id && category ? (
            <CategoryForm key={item.id} category={category} onChange={setCategory} onSave={() => saveCategory(category)} onCancel={() => setCategory(null)} />
          ) : (
            <div key={item.id} className="flex items-center gap-3 rounded-xl border border-line bg-card p-3">
              <Thumb image={item.image} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{item.title}</p>
                {item.value ? <p className="truncate text-xs text-muted">{item.value}</p> : null}
              </div>
              <IconButton label="ویرایش" onClick={() => setCategory({ id: item.id, image: item.image ?? "", title: item.title ?? "", description: item.value ?? "" })}><Pencil className="size-4" /></IconButton>
              <IconButton label="حذف" onClick={() => onItems(items.filter((row) => row.id !== item.id).map((row) => (row.categoryId === item.id ? { ...row, categoryId: "" } : row)))}><Trash2 className="size-4" /></IconButton>
            </div>
          ))}
        </div>
      ) : null}
      {tab === 2 ? (
        <div className="mt-4 grid gap-3">
          <Field label="آیکون">
            <button type="button" onClick={onIcon} className="flex min-h-11 w-full items-center gap-3 rounded-xl border border-line bg-card px-3 text-start">
              <Mark className="size-5 shrink-0" aria-hidden="true" />
              <span className="text-sm">انتخاب آیکون</span>
            </button>
          </Field>
          <Field label="عنوان بلوک">
            <TextInput value={title} maxLength={80} onChange={(event) => onTitle(event.target.value)} />
          </Field>
          <Field label="توضیح کوتاه">
            <Area value={body} maxLength={100} className="min-h-16" onChange={(event) => onBody(event.target.value.slice(0, 100))} />
          </Field>
          <p className="-mt-1 text-xs tabular-nums text-muted">{faNum(body.length)} از {faNum(100)}</p>
          <Field label="واحد پول">
            <div className="flex flex-wrap gap-2">
              {currencies.map((item) => (
                <button key={item.id} type="button" onClick={() => onCurrency(item.id)} className={`min-h-10 rounded-full px-3 text-sm ${currency === item.id ? "bg-ink text-on-ink" : "border border-line bg-card"}`}>{item.label}</button>
              ))}
            </div>
          </Field>
          <Field label="نشانی صفحه">
            <div dir="ltr" className="flex min-h-11 overflow-hidden rounded-xl border border-line bg-card">
              <span className="flex items-center bg-paper px-3 text-xs text-muted">{prefix}</span>
              <input value={path} maxLength={40} placeholder={copy.path} onChange={(event) => onPath(event.target.value.replace(/\s/g, "").slice(0, 40))} className="min-w-0 flex-1 bg-transparent px-3 text-left text-sm outline-none" />
            </div>
          </Field>
          <p className="-mt-1 text-xs leading-5 text-muted">{copy.pathHint}</p>
          <Field label={copy.view}>
            <AnimatedTabs className="bg-card" items={views.map((item) => ({ label: item.label }))} value={Math.max(0, views.findIndex((item) => item.id === layout))} onChange={(next) => onLayout(views[next]?.id ?? "list")} />
          </Field>
          <p className="-mt-1 text-xs leading-5 text-muted">
            {layout === "grid" ? "در هر ردیف دو کارت است. اول عکس، بعد عنوان، قیمت و دکمه ثبت سفارش." : layout === "card" ? "مثل لیست است، با پس‌زمینه برای هر مورد." : "عکس، عنوان، قیمت و دکمه ثبت سفارش در یک ردیف و بدون پس‌زمینه."}
          </p>
        </div>
      ) : null}
      {editing ? (
        <ItemWindow
          dish={editing}
          categories={categories}
          currency={currency}
          mode={mode}
          units={units}
          copy={copy}
          onChange={setEditing}
          onUnits={persistUnits}
          onClose={() => setEditing(null)}
          onSave={() => saveDish(editing)}
          onOpenCategories={() => {
            setEditing(null);
            setTab(1);
            setCategory({ id: crypto.randomUUID(), image: "", title: "", description: "" });
          }}
        />
      ) : null}
    </div>
  );
}

function SearchRow({ value, onChange, placeholder, onAdd }: { value: string; onChange: (value: string) => void; placeholder: string; onAdd: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <TextInput value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="ps-9" />
      </div>
      <button type="button" onClick={onAdd} className="inline-flex h-11 shrink-0 items-center gap-1 rounded-full bg-ink px-4 text-sm font-semibold text-on-ink">
        <Plus className="size-4" aria-hidden="true" />
        افزودن
      </button>
    </div>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return <button type="button" aria-label={label} onClick={onClick} className="grid size-8 place-items-center rounded-full text-muted hover:bg-paper">{children}</button>;
}

function Thumb({ image, mark: Mark = UtensilsCrossed }: { image?: string; mark?: typeof UtensilsCrossed }) {
  return image ? <img src={image} alt="" className="size-12 shrink-0 rounded-lg object-cover" /> : <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-paper text-muted"><Mark className="size-5" /></span>;
}

function CategoryForm({ category, onChange, onSave, onCancel, fresh }: { category: Category; onChange: (next: Category) => void; onSave: () => void; onCancel: () => void; fresh?: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="grid gap-3 rounded-xl border border-line bg-paper p-3">
      <Field label="آیکون یا عکس">
        <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          void fitImage(file, 480, 80000).then((image) => onChange({ ...category, image })).catch(() => toast.error("این تصویر باز نشد"));
        }} />
        {category.image ? (
          <div className="relative overflow-hidden rounded-xl">
            <img src={category.image} alt="" className="h-28 w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/70 px-3 py-2 text-sm font-semibold text-white">
              <button type="button" onClick={() => fileRef.current?.click()}>ویرایش</button>
              <button type="button" onClick={() => onChange({ ...category, image: "" })}>حذف</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-semibold"><ImagePlus className="size-4" />آپلود آیکون یا عکس</button>
        )}
      </Field>
      <Field label="عنوان">
        <TextInput value={category.title} maxLength={80} onChange={(event) => onChange({ ...category, title: event.target.value })} />
      </Field>
      <Field label="توضیحات">
        <Area value={category.description} maxLength={100} className="min-h-16" onChange={(event) => onChange({ ...category, description: event.target.value.slice(0, 100) })} />
      </Field>
      <p className="-mt-1 text-xs tabular-nums text-muted">{faNum(category.description.length)} از {faNum(100)}</p>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="inline-flex h-11 items-center rounded-full border border-line bg-card px-4 text-sm font-semibold">انصراف</button>
        <button type="button" onClick={onSave} className="inline-flex h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-on-ink">{fresh ? "اضافه کردن" : "ذخیره"}</button>
      </div>
    </div>
  );
}

function ItemWindow({ dish, categories, currency, mode, units, copy, onChange, onUnits, onClose, onSave, onOpenCategories }: {
  dish: Dish;
  categories: ContactItem[];
  currency: string;
  mode: CatalogMode;
  units: string[];
  copy: (typeof words)[keyof typeof words];
  onChange: (dish: Dish) => void;
  onUnits: (next: string[], rename?: { from: string; to: string }) => void;
  onClose: () => void;
  onSave: () => void;
  onOpenCategories: () => void;
}) {
  const desktop = useDesktop();
  const fileRef = useRef<HTMLInputElement>(null);
  const [variantDraft, setVariantDraft] = useState<Variant | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const unit = unitName(currency);
  const showPrice = dish.priceType === "fixed" || dish.priceType === "from" || dish.priceType === "range";
  const body = (
    <div className="grid gap-3">
      <PhotoField fileRef={fileRef} image={dish.image} label={copy.photo} onImage={(image) => onChange({ ...dish, image })} />
      <Field label="عنوان"><TextInput value={dish.title} maxLength={80} onChange={(event) => onChange({ ...dish, title: event.target.value })} /></Field>
      <Field label="توضیح کوتاه"><Area value={dish.description} maxLength={100} className="min-h-16" onChange={(event) => onChange({ ...dish, description: event.target.value.slice(0, 100) })} /></Field>
      <p className="-mt-1 text-xs tabular-nums text-muted">{faNum(dish.description.length)} از {faNum(100)}</p>
      {showPrice ? <Field label={dish.priceType === "fixed" ? `قیمت (${unit})` : `قیمت از (${unit})`}><TextInput type="number" min={0} value={dish.price} onChange={(event) => onChange({ ...dish, price: event.target.value })} /></Field> : null}
      {dish.priceType === "range" ? <Field label={`قیمت تا (${unit})`}><TextInput type="number" min={0} value={dish.priceTo} onChange={(event) => onChange({ ...dish, priceTo: event.target.value })} /></Field> : null}
      <div className="grid gap-2 rounded-xl border border-line bg-paper p-3">
        <p className="font-semibold">تنوع قیمت</p>
        <p className="text-xs leading-5 text-muted">اگر این مورد در چند نوع یا اندازه با قیمت‌های متفاوت ارائه می‌شود، گزینه‌ها را اینجا اضافه کنید.</p>
        {dish.variants.map((variant) => variantDraft?.id === variant.id ? (
          <VariantForm key={variant.id} draft={variantDraft} unit={unit} onChange={setVariantDraft} onSave={() => commitVariant(variantDraft, dish, onChange, setVariantDraft, true)} />
        ) : (
          <div key={variant.id} className="flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{variant.title}</p>
              <p className="text-xs text-muted">{formatMenuMoney(variant.price, currency)} · {statuses.find((status) => status.id === variant.status)?.label}</p>
            </div>
            <IconButton label="ویرایش" onClick={() => setVariantDraft(variant)}><Pencil className="size-4" /></IconButton>
            <IconButton label="حذف" onClick={() => onChange({ ...dish, variants: dish.variants.filter((item) => item.id !== variant.id) })}><Trash2 className="size-4" /></IconButton>
          </div>
        ))}
        {variantDraft && !dish.variants.some((item) => item.id === variantDraft.id) ? <VariantForm draft={variantDraft} unit={unit} onChange={setVariantDraft} onSave={() => commitVariant(variantDraft, dish, onChange, setVariantDraft, false)} /> : null}
        {!variantDraft ? <button type="button" onClick={() => setVariantDraft({ id: crypto.randomUUID(), title: "", price: 0, status: "available" })} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-semibold"><Plus className="size-4" />افزودن گزینه / تنوع قیمت</button> : null}
      </div>
      <CategoryField categories={categories} selected={dish.categoryId} onSelect={(categoryId) => onChange({ ...dish, categoryId })} onAdd={onOpenCategories} />
      <div className={mode !== "menu" ? "grid gap-3 sm:grid-cols-2" : ""}>
        <Field label="وضعیت">
          <Select value={dish.status} options={statuses.map((status) => ({ value: status.id, label: status.label }))} onChange={(event) => onChange({ ...dish, status: event.target.value })} />
        </Field>
        {mode !== "menu" ? <UnitField units={units} value={dish.unit} onChange={(unit) => onChange({ ...dish, unit })} onUnits={onUnits} /> : null}
      </div>
      <LabelField labels={dish.labels} onChange={(labels) => onChange({ ...dish, labels })} />
      <div className="rounded-xl border border-line bg-paper">
        <button type="button" aria-expanded={detailsOpen} onClick={() => setDetailsOpen((open) => !open)} className="flex w-full items-center justify-between px-3 py-3 text-start">
          <span className="font-semibold">{copy.details}</span>
          <ChevronDown className={`size-4 transition ${detailsOpen ? "rotate-180" : ""}`} />
        </button>
        {detailsOpen ? (
          <div className="grid gap-3 border-t border-line px-3 py-3">
            <Field label="لینک محصول"><TextInput dir="ltr" className="text-left" inputMode="url" value={dish.link} placeholder="https://" onChange={(event) => onChange({ ...dish, link: event.target.value })} /></Field>
            <p className="-mt-1 text-xs leading-5 text-muted">در صورت وارد کردن لینک، کاربر با کلیک روی کارت محصول وارد لینک فروشگاه شما می‌شود.</p>
            <Field label="نوع قیمت">
              <div className="flex flex-wrap gap-2">
                {priceTypes.map((type) => <button key={type.id} type="button" onClick={() => onChange({ ...dish, priceType: type.id })} className={`min-h-10 rounded-full px-3 text-sm ${dish.priceType === type.id ? "bg-ink text-on-ink" : "border border-line bg-card"}`}>{type.label}</button>)}
              </div>
            </Field>
            <Field label="کد کالا"><TextInput dir="ltr" className="text-left" value={dish.sku} maxLength={40} onChange={(event) => onChange({ ...dish, sku: event.target.value })} /></Field>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">پیشنهاد ویژه</p>
                <p className="mt-1 text-xs leading-5 text-muted">{copy.featured}</p>
              </div>
              <Switch checked={dish.featured} label="پیشنهاد ویژه" onCheckedChange={(featured) => onChange({ ...dish, featured })} />
            </div>
          </div>
        ) : null}
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="inline-flex h-11 items-center rounded-full border border-line bg-card px-4 text-sm font-semibold">انصراف</button>
        <button type="button" onClick={onSave} className="inline-flex h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-on-ink">ذخیره</button>
      </div>
    </div>
  );
  return desktop ? <PlainWindow title={copy.window} onClose={onClose}>{body}</PlainWindow> : <PlainSheet title={copy.window} onClose={onClose}>{body}</PlainSheet>;
}

function commitVariant(draft: Variant, dish: Dish, onChange: (dish: Dish) => void, setDraft: (value: Variant | null) => void, replace: boolean) {
  if (!draft.title.trim()) {
    toast.error("عنوان گزینه را وارد کنید");
    return;
  }
  onChange({ ...dish, variants: replace ? dish.variants.map((item) => (item.id === draft.id ? draft : item)) : [...dish.variants, draft] });
  setDraft(null);
}

function PhotoField({ fileRef, image, label, onImage }: { fileRef: RefObject<HTMLInputElement | null>; image: string; label: string; onImage: (value: string) => void }) {
  return (
    <Field label={label} hint="دلخواه">
      <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        void fitImage(file, 640, 90000).then(onImage).catch(() => toast.error("این تصویر باز نشد"));
      }} />
      {image ? (
        <div className="relative overflow-hidden rounded-xl">
          <img src={image} alt="" className="h-40 w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/70 px-3 py-2 text-sm font-semibold text-white">
            <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5"><ImagePlus className="size-4" />ویرایش</button>
            <button type="button" onClick={() => onImage("")} className="inline-flex items-center gap-1.5"><Trash2 className="size-4" />حذف</button>
          </div>
        </div>
      ) : <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-semibold"><ImagePlus className="size-4" />انتخاب عکس</button>}
    </Field>
  );
}

function VariantForm({ draft, unit, onChange, onSave }: { draft: Variant; unit: string; onChange: (next: Variant) => void; onSave: () => void }) {
  return (
    <div className="grid gap-2 rounded-xl border border-line bg-card p-3">
      <Field label="عنوان گزینه"><TextInput value={draft.title} maxLength={40} placeholder="مثلاً تک‌نفره" onChange={(event) => onChange({ ...draft, title: event.target.value })} /></Field>
      <Field label={`قیمت (${unit})`}><TextInput type="number" min={0} value={draft.price ? String(draft.price) : ""} onChange={(event) => onChange({ ...draft, price: money(event.target.value) })} /></Field>
      <Field label="وضعیت گزینه">
        <Select value={draft.status} options={statuses.map((status) => ({ value: status.id, label: status.label }))} onChange={(event) => onChange({ ...draft, status: event.target.value })} />
      </Field>
      <div className="flex justify-end"><button type="button" onClick={onSave} className="inline-flex h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-on-ink">ذخیره</button></div>
    </div>
  );
}

function UnitField({ units, value, onChange, onUnits }: {
  units: string[];
  value: string;
  onChange: (unit: string) => void;
  onUnits: (next: string[], rename?: { from: string; to: string }) => void;
}) {
  const [fresh, setFresh] = useState("");
  const [editing, setEditing] = useState("");
  const [draft, setDraft] = useState("");
  return (
    <Field label="واحد اندازه‌گیری">
      <Select value={value} placeholder="انتخاب واحد" options={units.map((unit) => ({ value: unit, label: unit }))} onChange={(event) => onChange(event.target.value)} />
      <ul className="mt-2 grid max-h-40 gap-1 overflow-y-auto">
        {units.map((unit) => editing === unit ? (
          <li key={unit} className="flex items-center gap-2">
            <TextInput value={draft} maxLength={24} onChange={(event) => setDraft(event.target.value)} />
            <button type="button" onClick={() => {
              const next = draft.trim();
              if (!next || next === unit || units.includes(next)) return;
              onUnits(units.map((item) => (item === unit ? next : item)), { from: unit, to: next });
              setEditing("");
            }} className="inline-flex h-11 shrink-0 items-center rounded-full bg-ink px-4 text-sm font-semibold text-on-ink">ذخیره</button>
          </li>
        ) : (
          <li key={unit} className="flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2">
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{unit}</span>
            <IconButton label="ویرایش" onClick={() => { setEditing(unit); setDraft(unit); }}><Pencil className="size-4" /></IconButton>
            <IconButton label="حذف" onClick={() => onUnits(units.filter((item) => item !== unit))}><Trash2 className="size-4" /></IconButton>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-2">
        <TextInput value={fresh} maxLength={24} placeholder="واحد جدید" onChange={(event) => setFresh(event.target.value)} />
        <button type="button" onClick={() => {
          const next = fresh.trim();
          if (!next || units.includes(next)) return;
          onUnits([...units, next]);
          if (!value) onChange(next);
          setFresh("");
        }} className="inline-flex h-11 shrink-0 items-center rounded-full border border-line bg-card px-4 text-sm font-semibold">افزودن</button>
      </div>
    </Field>
  );
}

function LabelField({ labels, onChange }: { labels: string[]; onChange: (labels: string[]) => void }) {
  const [fresh, setFresh] = useState("");
  const [editing, setEditing] = useState("");
  const [draft, setDraft] = useState("");
  const options = presetLabels.map((label) => ({ value: label, label }));

  function pick(value: string) {
    if (!value) return;
    if (labels.includes(value)) {
      if (!presetLabels.includes(value)) return;
      onChange(labels.filter((item) => item !== value));
      return;
    }
    onChange([...labels, value].slice(0, 6));
  }

  function addCustom() {
    const next = fresh.trim();
    if (!next || labels.includes(next) || presetLabels.includes(next)) return;
    onChange([...labels, next].slice(0, 6));
    setFresh("");
  }

  return (
    <Field label="لیبل">
      <Select value="" options={options} placeholder="انتخاب لیبل" onChange={(event) => pick(event.target.value)} />
      {labels.length > 0 ? (
        <ul className="mt-2 grid gap-1">
          {labels.map((label) => {
            const preset = presetLabels.includes(label);
            if (!preset && editing === label) {
              return (
                <li key={label} className="flex items-center gap-2">
                  <TextInput value={draft} maxLength={24} onChange={(event) => setDraft(event.target.value)} />
                  <button type="button" onClick={() => {
                    const next = draft.trim();
                    if (!next || next === label || labels.includes(next) || presetLabels.includes(next)) return;
                    onChange(labels.map((item) => (item === label ? next : item)));
                    setEditing("");
                  }} className="inline-flex h-11 shrink-0 items-center rounded-full bg-ink px-4 text-sm font-semibold text-on-ink">ذخیره</button>
                </li>
              );
            }
            return (
              <li key={label} className="flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2">
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{label}</span>
                {preset ? null : (
                  <>
                    <IconButton label="ویرایش" onClick={() => { setEditing(label); setDraft(label); }}><Pencil className="size-4" /></IconButton>
                    <IconButton label="حذف" onClick={() => onChange(labels.filter((item) => item !== label))}><Trash2 className="size-4" /></IconButton>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
      <div className="mt-2 flex gap-2">
        <TextInput value={fresh} maxLength={24} placeholder="لیبل جدید" onChange={(event) => setFresh(event.target.value)} />
        <button type="button" onClick={addCustom} className="inline-flex h-11 shrink-0 items-center rounded-full border border-line bg-card px-4 text-sm font-semibold">افزودن</button>
      </div>
    </Field>
  );
}

function CategoryField({ categories, selected, onSelect, onAdd }: { categories: ContactItem[]; selected: string; onSelect: (id: string) => void; onAdd: () => void }) {
  const titles = categories.map((item) => item.title).filter((title): title is string => Boolean(title));
  const current = categories.find((item) => item.id === selected)?.title ?? "";
  if (categories.length === 0) {
    return <Field label="دسته‌بندی"><button type="button" onClick={onAdd} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-line bg-card px-3 text-sm font-semibold"><Plus className="size-4" />افزودن دسته‌بندی</button></Field>;
  }
  return (
    <Field label="دسته‌بندی">
      <Combobox
        strict
        options={titles}
        value={current}
        placeholder="انتخاب دسته‌بندی"
        emptyText="دسته‌بندی با این نام نیست"
        onChange={(title) => onSelect(categories.find((item) => item.title === title)?.id ?? "")}
      />
      <button type="button" onClick={onAdd} className="mt-2 text-start text-sm font-semibold text-jade">افزودن دسته‌بندی</button>
    </Field>
  );
}

function useDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktop(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return desktop;
}

function PlainWindow({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const titleId = useId();
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/60" aria-label="بستن" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="relative z-10 grid max-h-[85dvh] w-full max-w-md gap-4 overflow-y-auto rounded-[1.375rem] border border-line bg-card p-5 text-ink shadow-xl">
        <div className="flex items-center justify-between"><h2 id={titleId} className="font-semibold">{title}</h2><button type="button" aria-label="بستن" onClick={onClose} className="grid size-9 place-items-center rounded-full hover:bg-paper"><X className="size-5" /></button></div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

function PlainSheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const titleId = useId();
  return createPortal(
    <div className="fixed inset-0 z-[70]">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="بستن" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-2xl border border-line bg-card">
        <div className="flex items-center justify-between px-4 py-3"><h2 id={titleId} className="font-bold">{title}</h2><button type="button" aria-label="بستن" onClick={onClose} className="grid size-9 place-items-center"><X className="size-5" /></button></div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

type MenuBlock = { type?: string; title?: string; body?: string; url?: string; icon?: string; layout?: string; currency?: string; active?: boolean; items?: ContactItem[] };

export function MenuScreen({ slug, page }: { slug: string; page: string }) {
  const [block, setBlock] = useState<MenuBlock | null>(null);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [ordering, setOrdering] = useState(false);
  const [picking, setPicking] = useState<ContactItem | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  useEffect(() => {
    let live = true;
    publicBusinessFn({ data: { slug } }).then((res) => {
      if (!live) return;
      if (!res.ok) {
        setError(res.error);
        setReady(true);
        return;
      }
      setName(res.data?.name ?? "");
      const blocks = Array.isArray(res.data?.pageBlocks) ? (res.data.pageBlocks as MenuBlock[]) : [];
      const path = decodeURIComponent(page);
      setBlock(blocks.find((item) => (item.type === "menu" || item.type === "products" || item.type === "services") && item.active !== false && (item.url?.trim() || catalogFallback(item.type)) === path) ?? null);
      setReady(true);
    });
    return () => { live = false; };
  }, [slug, page]);
  if (!ready) return <Shell><Skeleton className="h-64" /></Shell>;
  if (error || !block) return <Shell><Empty title={words.menu.missing} body={error || words.menu.missingBody} /></Shell>;
  const copy = words[(block.type === "products" || block.type === "services" ? block.type : "menu") as CatalogMode];
  const currency = block.currency || "toman";
  const layout = block.layout === "grid" || block.layout === "card" ? block.layout : "list";
  const categories = (block.items ?? []).filter((item) => item.kind === "category");
  const dishes = (block.items ?? []).filter((item) => item.kind === "item" && item.status !== "hidden");
  const groups = categories.map((category) => ({ category, items: dishes.filter((item) => item.categoryId === category.id) })).filter((group) => group.items.length > 0);
  const loose = dishes.filter((item) => !item.categoryId || !categories.some((category) => category.id === item.categoryId));
  const Mark = pageIcon(block.icon) ?? catalogMark((block.type === "products" || block.type === "services" ? block.type : "menu") as CatalogMode);
  const count = cart.reduce((sum, line) => sum + line.qty, 0);
  const total = cart.reduce((sum, line) => sum + linePrice(line.item, line.variantId) * line.qty, 0);
  function changeLine(item: ContactItem, variantId: string, delta: number) {
    const key = `${item.id}:${variantId}`;
    if (delta > 0 && !cart.some((line) => line.key === key)) toast.success("به سبد اضافه شد");
    setCart((prev) => {
      const found = prev.find((line) => line.key === key);
      if (!found) {
        if (delta < 1) return prev;
        return [...prev, { key, item, variantId, qty: 1 }];
      }
      const qty = found.qty + delta;
      if (qty < 1) return prev.filter((line) => line.key !== key);
      return prev.map((line) => (line.key === key ? { ...line, qty: Math.min(20, qty) } : line));
    });
  }
  return (
    <Shell>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Mark className="size-8 shrink-0" />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold">{block.title?.trim() || copy.screen}</h1>
            {block.body?.trim() ? <p className="text-sm text-muted">{block.body}</p> : null}
          </div>
        </div>
        <Link to="/b/$slug" params={{ slug }} className="text-sm font-semibold text-jade">بازگشت</Link>
      </div>
      {loose.length ? <MenuItems items={loose} layout={layout} currency={currency} cart={cart} onOpen={(item) => setPicking(item)} onChange={changeLine} /> : null}
      {groups.map((group) => (
        <section key={group.category.id} className="mt-6">
          <h2 className="mb-2 font-bold">{group.category.title}</h2>
          <MenuItems items={group.items} layout={layout} currency={currency} cart={cart} onOpen={(item) => setPicking(item)} onChange={changeLine} />
        </section>
      ))}
      {dishes.length === 0 ? <p className="text-sm text-muted">هنوز موردی در منو نیست.</p> : null}
      {name ? <p className="mt-8 text-center text-xs text-muted">{name}</p> : null}
      {count > 0 ? (
        <button type="button" onClick={() => setOrdering(true)} className="sticky bottom-4 mt-6 flex w-full items-center justify-between rounded-full bg-ink px-5 py-3 text-sm font-semibold text-on-ink">
          <span className="inline-flex items-center gap-2"><ShoppingBag className="size-4" />سبد خرید · {faNum(count)}</span>
          <span>{formatMenuMoney(total, currency)}</span>
        </button>
      ) : null}
      {picking ? <PickSheet item={picking} currency={currency} cart={cart} onClose={() => setPicking(null)} onChange={changeLine} /> : null}
      {ordering ? (
        <CartSheet
          slug={slug}
          cart={cart}
          currency={currency}
          onClose={() => setOrdering(false)}
          onChange={setCart}
          onDone={() => {
            setCart([]);
            setOrdering(false);
          }}
        />
      ) : null}
    </Shell>
  );
}

function MenuItems({ items, layout, currency, cart, onOpen, onChange }: {
  items: ContactItem[];
  layout: string;
  currency: string;
  cart: CartLine[];
  onOpen: (item: ContactItem) => void;
  onChange: (item: ContactItem, variantId: string, delta: number) => void;
}) {
  if (layout === "grid") {
    return (
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-xl border border-line bg-card">
            {item.link && item.status !== "unavailable" ? <a href={item.link} target="_blank" rel="noreferrer">{item.image ? <img src={item.image} alt="" className="aspect-square w-full object-cover" /> : <span className="grid aspect-square w-full place-items-center bg-paper text-muted"><UtensilsCrossed className="size-8" /></span>}</a> : item.image ? <img src={item.image} alt="" className="aspect-square w-full object-cover" /> : <span className="grid aspect-square w-full place-items-center bg-paper text-muted"><UtensilsCrossed className="size-8" /></span>}
            <div className="grid gap-2 p-3">
              <p className="truncate font-semibold">{item.title}</p>
              <p className="text-sm text-muted">{priceWithUnit(item, currency)}</p>
              <ItemQty item={item} cart={cart} onOpen={onOpen} onChange={onChange} />
            </div>
          </article>
        ))}
      </div>
    );
  }
  return (
    <div className="grid gap-2">
      {items.map((item) => (
        <article key={item.id} className={`flex items-center gap-3 ${layout === "card" ? "rounded-xl border border-line bg-card px-3 py-3" : "py-2"}`}>
          {item.image ? <img src={item.image} alt="" className="size-14 shrink-0 rounded-lg object-cover" /> : <span className="grid size-14 shrink-0 place-items-center rounded-lg bg-paper text-muted"><UtensilsCrossed className="size-5" /></span>}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{item.title}</p>
            <p className="text-sm text-muted">{priceWithUnit(item, currency)}</p>
            {orderVariants(item).length > 0 ? <div className="mt-2"><ItemQty item={item} cart={cart} onOpen={onOpen} onChange={onChange} /></div> : null}
          </div>
          {orderVariants(item).length > 0 ? null : <ItemQty item={item} cart={cart} onOpen={onOpen} onChange={onChange} />}
        </article>
      ))}
    </div>
  );
}

function ItemQty({ item, cart, onOpen, onChange }: {
  item: ContactItem;
  cart: CartLine[];
  onOpen: (item: ContactItem) => void;
  onChange: (item: ContactItem, variantId: string, delta: number) => void;
}) {
  const variants = orderVariants(item);
  if (!canOrder(item)) return <span className="inline-flex h-10 items-center rounded-full bg-paper px-3 text-xs font-semibold text-muted">ناموجود</span>;
  if (variants.length === 0) {
    const qty = cart.find((line) => line.item.id === item.id && !line.variantId)?.qty ?? 0;
    return <QtyControl qty={qty} enabled={canOrder(item)} onAdd={() => onChange(item, "", 1)} onMore={() => onChange(item, "", 1)} onLess={() => onChange(item, "", -1)} />;
  }
  const lines = cart.filter((line) => line.item.id === item.id && line.variantId);
  return (
    <div className="grid gap-1.5">
      {lines.map((line) => (
        <div key={line.key} className="flex items-center justify-between gap-2">
          <span className="min-w-0 truncate text-xs font-semibold">{line.item.variants?.find((variant) => variant.id === line.variantId)?.title}</span>
          <QtyControl qty={line.qty} enabled onAdd={() => onChange(item, line.variantId, 1)} onMore={() => onChange(item, line.variantId, 1)} onLess={() => onChange(item, line.variantId, -1)} />
        </div>
      ))}
      <button type="button" onClick={() => onOpen(item)} className="inline-flex h-10 items-center justify-center gap-1 rounded-full border border-line bg-card px-3 text-xs font-semibold">
        <Plus className="size-3.5" />
        {lines.length ? "گزینه دیگر" : "انتخاب گزینه"}
      </button>
    </div>
  );
}

function QtyControl({ qty, enabled, onAdd, onMore, onLess }: { qty: number; enabled: boolean; onAdd: () => void; onMore: () => void; onLess: () => void }) {
  if (!enabled) return <span className="inline-flex h-10 items-center rounded-full bg-paper px-3 text-xs font-semibold text-muted">ناموجود</span>;
  if (qty < 1) {
    return (
      <button type="button" aria-label="افزودن" onClick={onAdd} className="grid size-10 place-items-center rounded-full bg-ink text-on-ink">
        <Plus className="size-4" />
      </button>
    );
  }
  return (
    <div className="inline-flex items-center gap-1">
      <button type="button" aria-label={qty === 1 ? "حذف" : "کم کردن"} onClick={onLess} className="grid size-10 place-items-center rounded-full border border-line bg-card">
        {qty === 1 ? <Trash2 className="size-4" /> : <Minus className="size-4" />}
      </button>
      <span className="w-6 text-center text-sm font-semibold tabular-nums">{faNum(qty)}</span>
      <button type="button" aria-label="بیشتر" onClick={onMore} className="grid size-10 place-items-center rounded-full bg-ink text-on-ink">
        <Plus className="size-4" />
      </button>
    </div>
  );
}

function canOrder(item: ContactItem) {
  if (item.status === "unavailable" || item.status === "hidden") return false;
  const variants = (item.variants ?? []).filter((variant) => variant.status !== "hidden");
  if (variants.length === 0) return true;
  return variants.some((variant) => variant.status !== "unavailable");
}

function orderVariants(item: ContactItem) {
  return (item.variants ?? []).filter((variant) => variant.status !== "hidden" && variant.status !== "unavailable");
}

function linePrice(item: ContactItem, variantId: string) {
  const variant = item.variants?.find((row) => row.id === variantId);
  if (variant) return variant.price;
  if (item.priceType === "free") return 0;
  return item.price ?? 0;
}

function lineLabel(line: CartLine) {
  const variant = line.item.variants?.find((row) => row.id === line.variantId);
  return variant ? `${line.item.title}، ${variant.title}` : line.item.title || "آیتم";
}

type CartLine = { key: string; item: ContactItem; variantId: string; qty: number };

function todayYmd() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const orderTimes = Array.from({ length: 29 }, (_, index) => {
  const total = 8 * 60 + index * 30;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
});

function PickSheet({ item, currency, cart, onClose, onChange }: {
  item: ContactItem;
  currency: string;
  cart: CartLine[];
  onClose: () => void;
  onChange: (item: ContactItem, variantId: string, delta: number) => void;
}) {
  const desktop = useDesktop();
  const variants = orderVariants(item);
  const body = (
    <div className="grid gap-2">
      {variants.map((variant) => {
        const qty = cart.find((line) => line.key === `${item.id}:${variant.id}`)?.qty ?? 0;
        return (
          <div key={variant.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{variant.title}</p>
              <p className="text-xs text-muted">{formatMenuMoney(variant.price, currency)}</p>
            </div>
            <QtyControl qty={qty} enabled onAdd={() => onChange(item, variant.id, 1)} onMore={() => onChange(item, variant.id, 1)} onLess={() => onChange(item, variant.id, -1)} />
          </div>
        );
      })}
    </div>
  );
  return desktop ? <PlainWindow title={item.title || "گزینه"} onClose={onClose}>{body}</PlainWindow> : <PlainSheet title={item.title || "گزینه"} onClose={onClose}>{body}</PlainSheet>;
}

function CartSheet({ slug, cart, currency, onClose, onChange, onDone }: { slug: string; cart: CartLine[]; currency: string; onClose: () => void; onChange: (lines: CartLine[]) => void; onDone: () => void }) {
  const desktop = useDesktop();
  const [step, setStep] = useState<"cart" | "form" | "done">("cart");
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [when, setWhen] = useState<"now" | "later">("now");
  const [day, setDay] = useState(todayYmd);
  const [time, setTime] = useState("12:00");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const total = cart.reduce((sum, line) => sum + linePrice(line.item, line.variantId) * line.qty, 0);
  function setQty(key: string, qty: number) {
    if (qty < 1) onChange(cart.filter((line) => line.key !== key));
    else onChange(cart.map((line) => (line.key === key ? { ...line, qty: Math.min(20, qty) } : line)));
  }
  async function submit() {
    if (cart.length === 0) {
      toast.error("سبد خالی است");
      return;
    }
    if (customer.trim().length < 2) {
      toast.error("نام و نام خانوادگی را وارد کنید");
      return;
    }
    if (address.trim().length < 5) {
      toast.error("آدرس را کامل‌تر بنویسید");
      return;
    }
    setBusy(true);
    const res = await placeMenuOrderFn({
      data: {
        slug,
        name: customer,
        phone,
        email,
        address,
        when,
        date: day,
        time,
        note,
        lines: cart.map((line) => ({ itemId: line.item.id, variantId: line.variantId, qty: line.qty })),
      },
    });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setStep("done");
  }
  const body = step === "done" ? (
    <div className="grid gap-3 text-center">
      <p className="text-lg font-extrabold">سفارش ثبت شد</p>
      <p className="text-sm leading-7 text-muted">سفارش را گرفتیم و به آدرسی که نوشتی می‌فرستیم. برای هماهنگی با همین شماره تماس می‌گیریم.</p>
      <button type="button" onClick={onDone} className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-4 text-sm font-semibold text-on-ink">باشه</button>
    </div>
  ) : step === "cart" ? (
    <div className="grid gap-3">
      {cart.length === 0 ? <p className="text-sm text-muted">سبد خالی است.</p> : null}
      {cart.map((line) => (
        <div key={line.key} className="flex items-center gap-3 rounded-xl border border-line bg-card p-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{lineLabel(line)}</p>
            <p className="text-xs text-muted">{formatMenuMoney(linePrice(line.item, line.variantId) * line.qty, currency)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" aria-label={line.qty === 1 ? "حذف" : "کم کردن"} onClick={() => setQty(line.key, line.qty - 1)} className="grid size-8 place-items-center rounded-full border border-line">{line.qty === 1 ? <Trash2 className="size-4" /> : "−"}</button>
            <span className="w-6 text-center text-sm tabular-nums">{faNum(line.qty)}</span>
            <button type="button" aria-label="زیاد کردن" onClick={() => setQty(line.key, line.qty + 1)} className="grid size-8 place-items-center rounded-full border border-line">+</button>
          </div>
          <button type="button" aria-label="حذف" onClick={() => setQty(line.key, 0)} className="grid size-8 place-items-center text-muted"><Trash2 className="size-4" /></button>
        </div>
      ))}
      <p className="text-sm font-semibold">جمع: {formatMenuMoney(total, currency)}</p>
      <button type="button" disabled={cart.length === 0} onClick={() => setStep("form")} className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-4 text-sm font-semibold text-on-ink disabled:opacity-50">ادامه و ثبت سفارش</button>
    </div>
  ) : (
    <div className="grid gap-3">
      <p className="text-sm text-muted">{faNum(cart.reduce((sum, line) => sum + line.qty, 0))} کالا · {formatMenuMoney(total, currency)}</p>
      <Field label="نام و نام خانوادگی">
        <TextInput value={customer} maxLength={80} onChange={(event) => setCustomer(event.target.value)} />
      </Field>
      <Field label="شماره موبایل">
        <TextInput dir="ltr" className="text-left" inputMode="tel" value={phone} maxLength={14} placeholder="09123456789" onChange={(event) => setPhone(event.target.value)} />
      </Field>
      <Field label="ایمیل" hint="اختیاری">
        <TextInput dir="ltr" className="text-left" inputMode="email" value={email} maxLength={80} onChange={(event) => setEmail(event.target.value)} />
      </Field>
      <Field label="آدرس">
        <Area value={address} maxLength={200} className="min-h-16" placeholder="خیابان، کوچه، پلاک" onChange={(event) => setAddress(event.target.value.slice(0, 200))} />
      </Field>
      <p className="-mt-1 text-xs leading-5 text-muted">سفارش به این نشانی ارسال می‌شود.</p>
      <Field label="زمان تحویل">
        <div className="grid gap-2">
          <button type="button" onClick={() => setWhen("now")} className={`rounded-xl border px-3 py-3 text-start ${when === "now" ? "border-ink bg-ink text-on-ink" : "border-line bg-card"}`}>
            <span className="block text-sm font-semibold">هرچه زودتر</span>
            <span className={`mt-0.5 block text-xs ${when === "now" ? "text-on-ink/80" : "text-muted"}`}>همین حالا آماده و ارسال شود</span>
          </button>
          <button type="button" onClick={() => setWhen("later")} className={`rounded-xl border px-3 py-3 text-start ${when === "later" ? "border-ink bg-ink text-on-ink" : "border-line bg-card"}`}>
            <span className="block text-sm font-semibold">زمان دلخواه</span>
            <span className={`mt-0.5 block text-xs ${when === "later" ? "text-on-ink/80" : "text-muted"}`}>تاریخ و ساعت را خودت مشخص کن</span>
          </button>
        </div>
      </Field>
      {when === "later" ? (
        <>
          <JalaliCalendar value={day} min={todayYmd()} onChange={setDay} />
          <Field label="ساعت">
            <div className="flex flex-wrap gap-2">
              {orderTimes.map((slot) => (
                <button key={slot} type="button" onClick={() => setTime(slot)} className={`min-h-10 rounded-full px-3 text-sm tabular-nums ${time === slot ? "bg-ink text-on-ink" : "border border-line bg-card"}`}>{faNum(slot)}</button>
              ))}
            </div>
          </Field>
        </>
      ) : null}
      <Field label="یادداشت" hint="اختیاری">
        <Area value={note} maxLength={300} className="min-h-16" onChange={(event) => setNote(event.target.value.slice(0, 300))} />
      </Field>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => setStep("cart")} className="inline-flex h-11 items-center rounded-full border border-line bg-card px-4 text-sm font-semibold">سبد</button>
        <button type="button" disabled={busy} onClick={() => void submit()} className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-4 text-sm font-semibold text-on-ink disabled:opacity-50">{busy ? "در حال ثبت" : "ثبت سفارش"}</button>
      </div>
    </div>
  );
  return desktop ? <PlainWindow title={step === "form" ? "ثبت سفارش" : "سبد خرید"} onClose={step === "done" ? onDone : onClose}>{body}</PlainWindow> : <PlainSheet title={step === "form" ? "ثبت سفارش" : "سبد خرید"} onClose={step === "done" ? onDone : onClose}>{body}</PlainSheet>;
}
