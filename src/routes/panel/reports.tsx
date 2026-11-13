import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Ban,
  Building2,
  Calendar,
  CalendarCheck,
  CalendarX2,
  ChevronDown,
  Clock,
  Eye,
  Flag,
  Globe,
  MonitorSmartphone,
  MousePointerClick,
  Percent,
  Timer,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { usePanel } from "@/components/account";
import { JalaliCalendar } from "@/components/jalali-calendar";
import { DualSpark } from "@/components/sparkline";
import { Card, Empty, Skeleton } from "@/components/ui";
import { reportsFn } from "@/lib/api";
import { faNum, toman } from "@/lib/booking/fa";
import { formatJalaliYmd } from "@/lib/booking/jalali";
import { addDaysYmd, todayYmd } from "@/lib/booking/time";

export const Route = createFileRoute("/panel/reports")({ component: ReportsPage });

const presets = [
  { id: "1", label: "یک روزه", days: 1 },
  { id: "7", label: "یک هفته", days: 7 },
  { id: "30", label: "یک ماهه", days: 30 },
  { id: "90", label: "سه ماهه", days: 90 },
  { id: "180", label: "شش ماهه", days: 180 },
  { id: "365", label: "یکساله", days: 365 },
  { id: "custom", label: "بازه دلخواه", days: 0 },
] as const;

const dayNames = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];
const weekOrder = [6, 0, 1, 2, 3, 4, 5];

type Pair = { label: string; value: number };
type Slot = { label: number; value: number };
type Biz = {
  total: number;
  cancelled: number;
  completed: number;
  missed: number;
  revenue: number;
  series: number[];
  done: number[];
  prev?: { total: number; cancelled: number; completed: number; missed: number; revenue: number };
};
type Orders = {
  total: number;
  revenue: number;
  series: number[];
  cancelled?: number;
  average?: number;
  peakHour?: number;
  repeat?: number;
  exact?: boolean;
  prev?: { total: number; revenue: number; cancelled?: number; average?: number; repeat?: number };
};
type ServiceStat = { label: string; revenue: number; cancelled: number; total: number };
type StaffStat = { label: string; revenue: number; missed: number; total: number; hours?: Slot[] };
type GroupStat = { label: string; total: number; revenue: number };
type Visits = {
  views: number;
  visitors: number;
  clicks: number;
  converted?: number;
  prevConverted?: number;
  unique?: number;
  prevUnique?: number;
  dwellSeconds: number;
  dwellSamples: number;
  series: number[];
  visitorsSeries: number[];
  hours: number[];
  weekdays: number[];
  sources: Pair[];
  countries: Pair[];
  cities: Pair[];
  devices: Pair[];
  blocks: Pair[];
  prev?: { views: number; visitors: number; clicks: number };
};
type Slice = {
  business: Biz;
  orders?: Orders;
  salesHours: Slot[];
  salesDays: Slot[];
  scheduled?: boolean;
  topServices?: Pair[];
  topStaff?: Pair[];
  topItems?: Pair[];
  services?: ServiceStat[];
  staffStats?: StaffStat[];
  groups?: GroupStat[];
  customers?: { fresh: number; returning: number };
  visits: Visits | null;
};

function pct(part: number, whole: number) {
  if (!whole) return `${faNum(0)}٪`;
  return `${faNum(Math.round((part / whole) * 100))}٪`;
}

function stayLabel(seconds: number, samples: number) {
  if (!samples) return `${faNum(0)} ثانیه`;
  const avg = Math.round(seconds / samples);
  if (avg < 60) return `${faNum(avg)} ثانیه`;
  const minutes = Math.floor(avg / 60);
  const rest = avg % 60;
  if (!rest) return `${faNum(minutes)} دقیقه`;
  return `${faNum(minutes)} دقیقه و ${faNum(rest)} ثانیه`;
}

function growth(current: number, previous: number | undefined, invert = false) {
  if (previous == null) return null;
  if (previous === 0) {
    return { text: current ? "بازه قبل صفر بوده" : "بدون تغییر نسبت به بازه قبل", tone: "text-muted" };
  }
  const delta = Math.round(((current - previous) / previous) * 100);
  if (delta === 0) return { text: "بدون تغییر نسبت به بازه قبل", tone: "text-muted" };
  const good = invert ? delta < 0 : delta > 0;
  return {
    text: `${faNum(`${delta > 0 ? "+" : ""}${delta}`)}٪ نسبت به بازه قبل`,
    tone: good ? "text-jade" : "text-[#e11d2e]",
  };
}

function Columns({ items }: { items: Pair[] }) {
  const max = Math.max(1, ...items.map((item) => item.value));
  if (items.length === 0) return <p className="mt-3 text-xs text-muted">برای این بازه هنوز داده‌ای نیست.</p>;
  return (
    <div className="mt-3 flex h-40 items-end gap-1">
      {items.map((item) => (
        <div key={item.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
          <span className="text-[10px] font-semibold tabular-nums text-muted">{item.value ? faNum(item.value) : ""}</span>
          <div className="w-full rounded-t-md bg-[#ffa640]" style={{ height: `${Math.max(item.value ? 8 : 2, (item.value / max) * 100)}%` }} />
          <span className="w-full truncate text-center text-[10px] text-muted">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function Stat({ icon, label, value, hint, change }: { icon: ReactNode; label: string; value: string; hint?: string; change?: { text: string; tone: string } | null }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm text-muted">{label}</div>
          <div className="mt-1 text-2xl font-extrabold tabular-nums">{value}</div>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-paper text-[#ffa640]">{icon}</span>
      </div>
      {hint ? <p className="mt-2 text-xs leading-5 text-muted">{hint}</p> : null}
      {change ? <p className={`mt-2 text-xs font-semibold ${change.tone}`}>{change.text}</p> : null}
    </Card>
  );
}

function ReportsPage() {
  const { businessId } = usePanel();
  const [preset, setPreset] = useState<(typeof presets)[number]["id"]>("30");
  const [zone, setZone] = useState("Asia/Tehran");
  const [today, setToday] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [open, setOpen] = useState<"" | "menu" | "from" | "to">("");
  const [range, setRange] = useState<Slice | null>(null);
  const [kind, setKind] = useState("booking");

  useEffect(() => {
    if (!businessId) return;
    let live = true;
    reportsFn({ data: { businessId, from, to, compare: true } }).then((res) => {
      if (!live) return;
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      const nextZone = res.data.timezone || "Asia/Tehran";
      const nextToday = res.data.today || todayYmd(nextZone);
      setZone(nextZone);
      setToday(nextToday);
      setKind(res.data.kind || "booking");
      setRange(res.data.range);
      if (preset !== "custom") {
        const days = presets.find((item) => item.id === preset)?.days ?? 30;
        const nextTo = nextToday;
        const nextFrom = addDaysYmd(nextToday, -(days - 1), nextZone);
        if (from !== nextFrom || to !== nextTo) {
          setFrom(nextFrom);
          setTo(nextTo);
        }
      }
    });
    return () => {
      live = false;
    };
  }, [businessId, from, to, preset]);

  function pickPreset(id: (typeof presets)[number]["id"], days: number) {
    setPreset(id);
    setOpen("");
    if (!days) return;
    const day = today || todayYmd(zone);
    setTo(day);
    setFrom(addDaysYmd(day, -(days - 1), zone));
  }

  if (!businessId) return <Empty title="اول صفحه بسازید" body="گزارش‌ها بعد از ساخت صفحه اینجا دیده می‌شوند." />;
  const current = presets.find((item) => item.id === preset);
  const biz = range?.business ?? { total: 0, cancelled: 0, completed: 0, missed: 0, revenue: 0, series: [], done: [] };
  const visits = range?.visits;

  return (
        <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">گزارشات</h1>
        <div className="relative">
          <button type="button" className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-semibold" onClick={() => setOpen(open === "menu" ? "" : "menu")}>
            <Calendar className="size-4 shrink-0" aria-hidden="true" />
            {preset === "custom" ? `${formatJalaliYmd(from)} تا ${formatJalaliYmd(to)}` : current?.label}
            <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
          </button>
          {open === "menu" ? (
            <div className="absolute end-0 z-20 mt-2 grid w-44 overflow-hidden rounded-2xl border border-line bg-card p-1 shadow-xl">
              {presets.map((item) => (
                <button key={item.id} type="button" className={`rounded-xl px-3 py-2 text-start text-sm ${preset === item.id ? "bg-ink font-semibold text-on-ink" : "hover:bg-paper"}`} onClick={() => pickPreset(item.id, item.days)}>
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      {preset === "custom" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {(["from", "to"] as const).map((key) => (
            <div key={key} className="grid gap-2">
              <button type="button" className="inline-flex h-11 items-center justify-between rounded-xl border border-line bg-card px-3 text-sm" onClick={() => setOpen(open === key ? "" : key)}>
                <span className="text-muted">{key === "from" ? "از تاریخ" : "تا تاریخ"}</span>
                <span className="font-semibold">{formatJalaliYmd(key === "from" ? from : to)}</span>
              </button>
              {open === key ? (
                <JalaliCalendar
                  value={key === "from" ? from : to}
                  max={today}
                  onChange={(day) => {
                    if (key === "from") setFrom(day > to ? to : day);
                    else setTo(day < from ? from : day);
                    setOpen("");
                  }}
                />
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {!range ? <Skeleton className="h-40" /> : (
        <>
          {kind === "booking" ? (
          <Card>
            <h2 className="text-lg font-extrabold">گزارشات کسب‌وکار</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Stat icon={<CalendarCheck className="size-4" />} label="کل نوبت‌ها" value={faNum(biz.total)} change={growth(biz.total, biz.prev?.total)} />
              <Stat icon={<CalendarX2 className="size-4" />} label="نوبت لغوشده" value={faNum(biz.cancelled)} change={growth(biz.cancelled, biz.prev?.cancelled, true)} />
              <Stat icon={<TrendingUp className="size-4" />} label="نوبت تکمیل‌شده" value={faNum(biz.completed)} change={growth(biz.completed, biz.prev?.completed)} />
              <Stat icon={<Ban className="size-4" />} label="نوبت ازدست‌رفته" value={faNum(biz.missed)} hint="مشتری نیامده و عدم مراجعه ثبت شده." change={growth(biz.missed, biz.prev?.missed, true)} />
              <Stat icon={<Wallet className="size-4" />} label="درآمد" value={toman(biz.revenue)} hint="جمع قیمت خدمت نوبت‌های تکمیل‌شده." change={growth(biz.revenue, biz.prev?.revenue)} />
              <Stat icon={<Percent className="size-4" />} label="درصد تکمیل" value={pct(biz.completed, biz.total)} change={growth(rateNum(biz.completed, biz.total), biz.prev ? rateNum(biz.prev.completed, biz.prev.total) : undefined)} />
              <Stat icon={<Percent className="size-4" />} label="درصد لغو" value={pct(biz.cancelled, biz.total)} change={growth(rateNum(biz.cancelled, biz.total), biz.prev ? rateNum(biz.prev.cancelled, biz.prev.total) : undefined, true)} />
              <Stat icon={<Percent className="size-4" />} label="درصد ازدست‌رفته" value={pct(biz.missed, biz.total)} change={growth(rateNum(biz.missed, biz.total), biz.prev ? rateNum(biz.prev.missed, biz.prev.total) : undefined, true)} />
            </div>
            <Card className="mt-3">
              <div className="text-sm font-semibold">روند نوبت‌ها</div>
              <p className="mt-1 text-xs text-muted">خط نارنجی نوبت تکمیل‌شده است و خط روشن کل نوبت‌ها.</p>
              <DualSpark primary={biz.done} secondary={biz.series} primaryColor="#ffa640" secondaryColor="#f7f7f7" />
            </Card>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Card>
                <div className="text-sm font-semibold">پرطرفدارترین خدمت</div>
                <Columns items={range.topServices ?? []} />
              </Card>
              <Card>
                <div className="text-sm font-semibold">شلوغ‌ترین پرسنل</div>
                <Columns items={range.topStaff ?? []} />
              </Card>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Stat icon={<UserRound className="size-4" />} label="مشتری جدید" value={faNum(range.customers?.fresh ?? 0)} hint="اولین نوبتشان در همین بازه بوده." />
              <Stat icon={<Users className="size-4" />} label="مشتری قبلی" value={faNum(range.customers?.returning ?? 0)} hint="قبل از این بازه هم نوبت داشته‌اند." />
            </div>
            <Card className="mt-3">
              <div className="text-sm font-semibold">درآمد و لغو هر خدمت</div>
              <div className="mt-3 grid gap-2">
                {(range.services ?? []).length === 0 ? <p className="text-sm text-muted">هنوز خدمتی در این بازه نیست.</p> : null}
                {(range.services ?? []).map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl bg-paper px-3 py-2 text-sm">
                    <span className="min-w-0 truncate font-semibold">{item.label}</span>
                    <span className="shrink-0 text-muted">{toman(item.revenue)} · لغو {pct(item.cancelled, item.total)}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="mt-3">
              <div className="text-sm font-semibold">پرسنل</div>
              <div className="mt-3 grid gap-3">
                {(range.staffStats ?? []).length === 0 ? <p className="text-sm text-muted">هنوز نوبتی برای پرسنل نیست.</p> : null}
                {(range.staffStats ?? []).map((item) => (
                  <div key={item.label} className="rounded-xl bg-paper px-3 py-3">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-semibold">{item.label}</span>
                      <span className="text-muted">{toman(item.revenue)} · غیبت {pct(item.missed, item.total)}</span>
                    </div>
                    <Columns items={(item.hours ?? []).map((hour) => ({ label: faNum(hour.label), value: hour.value }))} />
                  </div>
                ))}
              </div>
            </Card>
            <Card className="mt-3">
              <div className="text-sm font-semibold">گروه مشتری</div>
              <div className="mt-3 grid gap-2">
                {(range.groups ?? []).length === 0 ? <p className="text-sm text-muted">هنوز نوبتی در گروه مشتری نیست.</p> : null}
                {(range.groups ?? []).map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl bg-paper px-3 py-2 text-sm">
                    <span className="font-semibold">{item.label}</span>
                    <span className="text-muted">{faNum(item.total)} نوبت · {toman(item.revenue)}</span>
                  </div>
                ))}
              </div>
            </Card>
          </Card>
          ) : (
          <Card>
            <h2 className="text-lg font-extrabold">{kind === "products" ? "فروش محصول" : kind === "services" ? "سفارش خدمات" : "سفارش منو"}</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Stat icon={<CalendarCheck className="size-4" />} label="کل سفارش‌ها" value={faNum(range.orders?.total ?? 0)} change={growth(range.orders?.total ?? 0, range.orders?.prev?.total)} />
              <Stat icon={<CalendarX2 className="size-4" />} label="سفارش لغوشده" value={faNum(range.orders?.cancelled ?? 0)} change={growth(range.orders?.cancelled ?? 0, range.orders?.prev?.cancelled, true)} />
              <Stat icon={<Wallet className="size-4" />} label="درآمد" value={toman(range.orders?.revenue ?? 0)} change={growth(range.orders?.revenue ?? 0, range.orders?.prev?.revenue)} />
              <Stat icon={<Wallet className="size-4" />} label="میانگین مبلغ سفارش" value={toman(range.orders?.average ?? 0)} change={growth(range.orders?.average ?? 0, range.orders?.prev?.average)} />
              <Stat icon={<Clock className="size-4" />} label="ساعت شلوغ سفارش" value={peakHour(range.salesHours)} hint="اگر مشتری زمان تحویل داده باشد، همان ساعت است نه ساعت ثبت." />
              <Stat icon={<Users className="size-4" />} label="تکرار خرید" value={faNum(range.orders?.repeat ?? 0)} hint="سفارش لغوشدهٔ قبلی کسی را تکراری نمی‌کند." change={growth(range.orders?.repeat ?? 0, range.orders?.prev?.repeat)} />
            </div>
            <Card className="mt-3">
              <div className="text-sm font-semibold">روند سفارش‌ها</div>
              <DualSpark primary={range.orders?.series ?? []} secondary={[]} primaryColor="#ffa640" secondaryColor="#f7f7f7" />
            </Card>
            <Card className="mt-3">
              <div className="text-sm font-semibold">{kind === "products" ? "پرفروش‌ترین محصول" : kind === "services" ? "پرطرفدارترین خدمت" : "پرفروش‌ترین مورد منو"}</div>
              <Columns items={range.topItems ?? []} />
            </Card>
          </Card>
          )}

          {visits ? (
            <Card>
              <h2 className="text-lg font-extrabold">آمار بازدید</h2>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Stat icon={<Eye className="size-4" />} label="کل بازدیدها" value={faNum(visits.views)} hint="هر بار باز شدن صفحه یک بازدید است." change={growth(visits.views, visits.prev?.views)} />
                <Stat icon={<Users className="size-4" />} label="کل بازدیدکننده‌ها" value={faNum(visits.visitors)} hint="بازدیدکننده یکتا در هر روز." change={growth(visits.visitors, visits.prev?.visitors)} />
                <Stat icon={<MousePointerClick className="size-4" />} label="کلیک روی بلوک‌ها" value={faNum(visits.clicks)} hint="کلیک مشتری روی بلوک‌های صفحه." change={growth(visits.clicks, visits.prev?.clicks)} />
                <Stat icon={<Percent className="size-4" />} label="درصد تبدیل" value={pct(visits.converted ?? 0, visits.unique ?? 0)} hint={kind === "booking" ? "نوبت آنلاین که لغو نشده، تقسیم بر بازدیدکنندهٔ یکتا در کل بازه. یک نفر در چند روز یک بار است." : "سفارش لغونشده، تقسیم بر بازدیدکنندهٔ یکتا در کل بازه. یک نفر در چند روز یک بار است."} change={growth(rateNum(visits.converted ?? 0, visits.unique ?? 0), visits.prevUnique == null ? undefined : rateNum(visits.prevConverted ?? 0, visits.prevUnique))} />
                <Stat icon={<Timer className="size-4" />} label="ماندن در صفحه" value={stayLabel(visits.dwellSeconds, visits.dwellSamples)} hint="میانگین زمانی که بازدیدکننده در صفحه مانده." />
              </div>
              <Card className="mt-3">
                <div className="text-sm font-semibold">روند بازدید</div>
                <p className="mt-1 text-xs text-muted">خط نارنجی بازدید است و خط روشن بازدیدکننده.</p>
                <DualSpark primary={visits.series} secondary={visits.visitorsSeries} primaryColor="#ffa640" secondaryColor="#f7f7f7" />
              </Card>
            </Card>
          ) : null}

          <Card>
            <h2 className="text-lg font-extrabold">{kind === "booking" ? "پرفروش‌ترین زمان‌های نوبت" : "پرفروش‌ترین زمان‌های سفارش"}</h2>
            {(range.salesHours.length || range.salesDays.length) ? (
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <Card>
                <div className="flex items-center gap-2 text-sm font-semibold"><Clock className="size-4 text-[#ffa640]" />ساعت‌های کاری</div>
                <Columns items={range.salesHours.map((item) => ({ label: faNum(item.label), value: item.value }))} />
              </Card>
              <Card>
                <div className="flex items-center gap-2 text-sm font-semibold"><CalendarCheck className="size-4 text-[#ffa640]" />روزهای کاری</div>
                <Columns items={range.salesDays.map((item) => ({ label: dayNames[item.label] ?? "", value: item.value }))} />
              </Card>
            </div>
            ) : <p className="mt-3 text-sm text-muted">در این بازه نوبت یا سفارشی نیست و ساعت کاری هم تنظیم نشده.</p>}
          </Card>

          {visits ? (
            <>
              <Card>
                <h2 className="text-lg font-extrabold">پربازدیدترین زمان‌ها</h2>
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <Card>
                    <div className="flex items-center gap-2 text-sm font-semibold"><Clock className="size-4 text-[#ffa640]" />پربازدیدترین ساعت‌ها</div>
                    <p className="mt-1 text-xs text-muted">بازدید صفحه در هر ساعت. از بازدیدهای بعدی به بعد پر می‌شود.</p>
                    <Columns items={visits.hours.map((value, hour) => ({ label: faNum(hour), value }))} />
                  </Card>
                  <Card>
                    <div className="flex items-center gap-2 text-sm font-semibold"><Eye className="size-4 text-[#ffa640]" />پربازدیدترین روزها</div>
                    <p className="mt-1 text-xs text-muted">جمع بازدیدها در هر روز هفته.</p>
                    <Columns items={weekOrder.map((index) => ({ label: dayNames[index], value: visits.weekdays[index] ?? 0 }))} />
                  </Card>
                </div>
              </Card>

              <Card>
                <h2 className="text-lg font-extrabold">تحلیل بازدیدکننده‌ها</h2>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Card>
                    <div className="flex items-center gap-2 text-sm font-semibold"><Globe className="size-4 text-[#ffa640]" />بازدیدها از کجا آمده‌اند</div>
                    <Columns items={visits.sources} />
                  </Card>
                  <Card>
                    <div className="flex items-center gap-2 text-sm font-semibold"><Flag className="size-4 text-[#ffa640]" />کشور بازدیدکننده‌ها</div>
                    <p className="mt-1 text-xs text-muted">از روی اینترنت بازدیدکننده، نه منطقهٔ زمانی گوشی.</p>
                    <Columns items={visits.countries} />
                  </Card>
                  <Card>
                    <div className="flex items-center gap-2 text-sm font-semibold"><Building2 className="size-4 text-[#ffa640]" />شهر بازدیدکننده‌ها</div>
                    <p className="mt-1 text-xs text-muted">همان منبع کشور. بعضی اینترنت‌ها شهر را دقیق نمی‌دهند.</p>
                    <Columns items={visits.cities} />
                  </Card>
                  <Card>
                    <div className="flex items-center gap-2 text-sm font-semibold"><MonitorSmartphone className="size-4 text-[#ffa640]" />دستگاه بازدیدکننده‌ها</div>
                    <Columns items={visits.devices} />
                  </Card>
                  <Card className="col-span-2">
                    <div className="text-sm font-semibold">بازدید بلوک‌ها</div>
                    <p className="mt-1 text-xs text-muted">هر بلوک وقتی در صفحه دیده شود یک بازدید می‌گیرد.</p>
                    <Columns items={visits.blocks ?? []} />
                  </Card>
                </div>
              </Card>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}

function peakHour(slots: { label: number; value: number }[]) {
  let best = -1;
  let value = 0;
  for (const slot of slots) {
    if (slot.value > value) {
      best = slot.label;
      value = slot.value;
    }
  }
  return best >= 0 ? faNum(best) : "—";
}

function rateNum(part: number, whole: number) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}
