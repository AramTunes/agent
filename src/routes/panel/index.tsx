import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, CalendarPlus, ChevronLeft, LifeBuoy, Link2, PenLine, QrCode, Settings, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { usePanel } from "@/components/account";
import { ProgressRing } from "@/components/progress-ring";
import { Button, Card, Field, Skeleton, TextInput } from "@/components/ui";
import { DualSpark } from "@/components/sparkline";
import { WeekBoard } from "@/components/week-board";
import { categoriesFn, createBusinessFn, createDemoFn, dashboardFn, manageBusinessFn, resolveFollowupFn } from "@/lib/api";
import { assignRandomPageAvatar, PageMark } from "@/lib/page-avatar";
import { QrDialog } from "@/components/qr-share";
import { faNum, toman } from "@/lib/booking/fa";
import { formatWhen } from "@/lib/booking/format";

export const Route = createFileRoute("/panel/")({ component: PanelHome });

function tehranMinutes(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
    timeZone: "Asia/Tehran",
  }).formatToParts(now);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

function greeting(now = new Date()) {
  const hour = Math.floor(tehranMinutes(now) / 60);
  if (hour >= 5 && hour < 12) return "صبح بخیر";
  if (hour >= 12 && hour < 15) return "ظهر بخیر";
  if (hour >= 15 && hour < 19) return "عصر بخیر";
  return "شب بخیر";
}

function firstName(full: string) {
  const name = full.trim().split(/\s+/)[0];
  return name || "کاربر";
}

const zeros = Array.from({ length: 30 }, () => 0);
const emptySeries = { views: zeros, visitors: zeros, sales: zeros, revenue: zeros };
const emptyStats = {
  views: 0, visitors: 0, clicks: 0,
  booked: 0, cancelled: 0, completed: 0, sales: 0, revenueToman: 0,
  prevViews: 0, prevRevenueToman: 0,
};

type MonthStats = typeof emptyStats & { series: typeof emptySeries };

function rate(part: number, whole: number) {
  if (whole <= 0) return "۰٪";
  return `${faNum(Math.round((part / whole) * 100))}٪`;
}

function monthChange(current: number, previous: number) {
  if (current === previous) return { text: "بدون تغییر نسبت به ماه قبل", tone: "text-muted" };
  if (previous <= 0) return { text: "۱۰۰٪ پیشرفت نسبت به ماه قبل", tone: "text-jade" };
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return { text: "بدون تغییر نسبت به ماه قبل", tone: "text-muted" };
  if (pct > 0) return { text: `${faNum(pct)}٪ پیشرفت نسبت به ماه قبل`, tone: "text-[#2acc8a]" };
  return { text: `${faNum(Math.abs(pct))}٪ پسرفت نسبت به ماه قبل`, tone: "text-danger" };
}

type Followup = { id: string; text: string; to: "/panel/services" | "/panel/staff" | "/panel/settings"; progress?: number; done?: number; total?: number };

function followups(data: {
  services?: { active?: boolean }[];
  staff?: { active?: boolean; weekly?: unknown[] }[];
  phone?: string;
  subscription?: { endsAt?: string; status?: string };
  smsCredit?: number;
}, personal: boolean): Followup[] {
  const items: Followup[] = [];
  const services = (data.services ?? []).filter((item) => item.active !== false);
  const ready = (data.staff ?? []).filter((item) => item.active !== false && (item.weekly?.length ?? 0) > 0);
  const hasService = services.length > 0;
  const hasStaff = ready.length > 0;
  const hasPhone = Boolean(String(data.phone ?? "").trim());
  if (!hasService || !hasStaff || !hasPhone) {
    const done = Number(hasService) + Number(hasStaff) + Number(hasPhone);
    const to = !hasService ? "/panel/services" : !hasStaff ? "/panel/staff" : "/panel/settings";
    const kind = personal ? "صفحه" : "کسب‌وکار";
    items.push({
      id: "setup",
      text: `راه‌اندازی ${kind} هنوز تمام نشده. بیا تمامش کن.`,
      to,
      progress: Math.round((done / 3) * 100),
      done,
      total: 3,
    });
  }
  if (data.subscription?.endsAt) {
    const left = new Date(data.subscription.endsAt).getTime() - Date.now();
    if (Number.isFinite(left) && left < 7 * 24 * 60 * 60 * 1000) {
      items.push({ id: "plan", text: "اشتراکت دارد تمام می‌شود. بیا از صفحهٔ تنظیمات تمدیدش کن.", to: "/panel/settings" });
    }
  }
  if (typeof data.smsCredit === "number" && data.smsCredit < 20) {
    items.push({ id: "sms", text: "اعتبار پیامک‌ها دارد تمام می‌شود. بیا اعتبارش را افزایش بده.", to: "/panel/settings" });
  }
  return items;
}

type Overdue = { id: string; startsAt: string; serviceId: string; staffId: string; customer: string; phone: string; service: string; staff: string };

function PanelHome() {
  const { businessId, memberships, displayName, pageFor, pageName, role } = usePanel();
  const current = memberships.find((item) => item.businessId === businessId);
  const personalPage = pageFor === "self" && current?.name === pageName;
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({ name: "", city: "", phone: "", categoryId: "cat-beauty" });
  const [qrOpen, setQrOpen] = useState(false);
  const [follow, setFollow] = useState<Followup[] | null>(null);
  const [overdue, setOverdue] = useState<Overdue[]>([]);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [people, setPeople] = useState<{ id: string; name: string }[]>([]);
  const [pick, setPick] = useState<Overdue | null>(null);
  const [draft, setDraft] = useState({ serviceId: "", staffId: "" });
  const [schedule, setSchedule] = useState<{ timezone: string; weekly: { weekday: number; startMin: number; endMin: number }[] } | null>(null);
  const [stats, setStats] = useState<MonthStats | null>(null);

  useEffect(() => {
    categoriesFn().then((res) => {
      if (res.ok) setCategories(res.data);
    });
  }, []);
  useEffect(() => {
    if (!businessId) return;
    let live = true;
    setFollow(null);
    manageBusinessFn({ data: { businessId } }).then((res) => {
      if (!live) return;
      setFollow(res.ok ? followups(res.data, personalPage).filter((item) => role !== "staff" || item.id !== "setup") : []);
      if (!res.ok) return;
      setServices((res.data.services ?? []).filter((item: { active?: boolean }) => item.active !== false).map((item: { id: string; name: string }) => ({ id: item.id, name: item.name })));
      setPeople((res.data.staff ?? []).filter((item: { active?: boolean }) => item.active !== false).map((item: { id: string; name: string }) => ({ id: item.id, name: item.name })));
      const weekly = (res.data.staff ?? []).flatMap((person: { weekly?: { weekday: number; startMin: number; endMin: number }[] }) => person.weekly ?? []);
      setSchedule({ timezone: res.data.timezone || "Asia/Tehran", weekly });
    });
    return () => {
      live = false;
    };
  }, [businessId, personalPage, role]);
  useEffect(() => {
    if (!businessId) return;
    let live = true;
    dashboardFn({ data: { businessId } }).then((res) => {
      if (!live || !res.ok) return;
      const next = res.data.stats ?? emptyStats;
      setStats({ ...next, series: res.data.series ?? emptySeries });
      setOverdue(Array.isArray(res.data.overdue) ? res.data.overdue : []);
    });
    return () => {
      live = false;
    };
  }, [businessId]);

  async function settle(status: "completed" | "cancelled") {
    if (!pick) return;
    const res = await resolveFollowupFn({ data: { bookingId: pick.id, serviceId: draft.serviceId, staffId: draft.staffId, status } });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setOverdue((items) => items.filter((item) => item.id !== pick.id));
    setPick(null);
    if (businessId) {
      const again = await dashboardFn({ data: { businessId } });
      if (again.ok) {
        const next = again.data.stats ?? emptyStats;
        setStats({ ...next, series: again.data.series ?? emptySeries });
      }
    }
  }

  if (!businessId) {
    return (
      <div className="graphite grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-bold">کسب‌وکار تازه</h2>
          <form className="mt-4 grid gap-3" onSubmit={async (event) => {
            event.preventDefault();
            const res = await createBusinessFn({ data: { ...form, timezone: "Asia/Tehran" } });
            if (!res.ok) { toast.error(res.error); return; }
            assignRandomPageAvatar(res.data.businessId);
            localStorage.setItem("agent.business", res.data.businessId);
            toast.success("ساخته شد");
            window.location.assign("/panel/services");
          }}>
            <Field label="نام"><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
            <Field label="شهر"><TextInput value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
            <Field label="تلفن"><TextInput dir="ltr" className="text-left" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="دسته">
              <select className="min-h-11 rounded-lg border border-line bg-[#101011] px-3 text-ink" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </Field>
            <Button type="submit">ساخت کسب‌وکار</Button>
          </form>
        </Card>
        <Card>
          <h2 className="text-xl font-bold">نمونه قابل حذف</h2>
          <p className="mt-2 text-sm leading-6 text-muted">یک آرایشگاه با خدمت، پرسنل و ساعت کاری می‌سازد تا رزرو را امتحان کنید. برچسب نمونه روی صفحه عمومی می‌ماند.</p>
          <Button className="mt-4" variant="quiet" onClick={async () => {
            const res = await createDemoFn();
            if (!res.ok) { toast.error(res.error); return; }
            assignRandomPageAvatar(res.data.businessId);
            localStorage.setItem("agent.business", res.data.businessId);
            window.location.assign("/panel");
          }}>ساخت نمونه</Button>
        </Card>
      </div>
    );
  }
  const personal = personalPage;
  const summary = personal ? "صفحه شما" : current?.name;
  const pageUrl = typeof window !== "undefined" && current?.slug ? `${window.location.origin}/b/${current.slug}` : "";
  const shortcuts = [
    { label: "ثبت نوبت", icon: CalendarPlus, to: "/panel/calendar" as const },
    { label: "مشتریان", icon: Users, to: "/panel/customers" as const },
    { label: "گزارشات", icon: BarChart3, to: "/panel/reports" as const },
    ...(role === "staff" ? [] : [{ label: "ویرایش صفحه", icon: PenLine, to: "/panel/settings" as const }]),
  ];
  return (
    <div className="graphite grid min-w-0 gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <PageMark businessId={businessId} slug={current?.slug} name={current?.name || displayName} avatar={current?.avatar} size={48} />
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold">{greeting()} {firstName(displayName)}</h1>
            <p className="mt-1 text-sm text-muted">خلاصه امروز {summary}</p>
          </div>
        </div>
        <button
          type="button"
          className="grid size-11 shrink-0 place-items-center rounded-lg border border-line bg-card text-ink"
          aria-label="کد صفحه کسب‌وکار"
          onClick={() => setQrOpen(true)}
        >
          <QrCode className="size-5" />
        </button>
      </div>
      <Card>
        <h2 className="font-extrabold">نیاز به پیگیری</h2>
        {follow === null ? <Skeleton className="mt-3 h-12" /> : null}
        {follow && follow.length === 0 && overdue.length === 0 ? <p className="mt-2 text-sm text-muted">موردی برای پیگیری نیست.</p> : null}
        {follow && follow.length > 0 ? (
          <ul className="mt-3 grid gap-2">
            {follow.map((item) => (
              <li key={item.id}>
                <Link to={item.to} className="flex items-center gap-3 rounded-lg bg-[#101011] px-3 py-3 text-sm leading-6">
                  {item.progress != null ? <ProgressRing value={item.progress} /> : null}
                  <span className="min-w-0 flex-1">
                    <span className="block">{item.text}</span>
                    {item.done != null && item.total != null ? (
                      <span className="mt-0.5 block text-xs text-muted">
                        {faNum(item.done)} مرحله از {faNum(item.total)} مرحله برای راه‌اندازی صفحه شما انجام شده
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        {overdue.length > 0 ? (
          <ul className="mt-3 grid gap-2">
            {overdue.map((item) => (
              <li key={item.id} className="rounded-lg bg-[#101011] px-3 py-3 text-sm leading-6">
                <p className="font-semibold">{item.customer} · {item.phone}</p>
                <p className="text-muted">{formatWhen(item.startsAt, schedule?.timezone || "Asia/Tehran")}</p>
                <p>{item.service} · {item.staff}</p>
                <button
                  type="button"
                  className="mt-2 inline-flex h-9 items-center rounded-full bg-ink px-3 text-xs font-semibold text-on-ink"
                  onClick={() => {
                    setPick(item);
                    setDraft({ serviceId: item.serviceId, staffId: item.staffId });
                  }}
                >
                  تعیین وضعیت
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </Card>
      <div className="grid grid-cols-2 gap-3">
        {shortcuts.map((item) => (
          <Link key={item.label} to={item.to} className="flex min-h-24 flex-col justify-between rounded-card border border-line bg-card p-4">
            <item.icon className="size-5 text-[#ffa640]" aria-hidden="true" />
            <span className="font-bold">{item.label}</span>
          </Link>
        ))}
        {role === "staff" ? null : (
        <Link to="/panel/links" className="flex min-h-24 flex-col justify-between rounded-card border border-line bg-card p-4">
          <Link2 className="size-5 text-[#ffa640]" aria-hidden="true" />
          <span className="font-bold">لینک من</span>
        </Link>
        )}
        <Link to="/panel/settings" className="flex min-h-24 flex-col justify-between rounded-card border border-line bg-card p-4">
          <Settings className="size-5 text-[#ffa640]" aria-hidden="true" />
          <span className="font-bold">تنظیمات</span>
        </Link>
      </div>
      {businessId && schedule ? (
        <WeekBoard
          businessId={businessId}
          timezone={schedule.timezone}
          weekly={schedule.weekly}
          more={<Link to="/panel/bookings" className="shrink-0 text-sm font-semibold text-[#ffa640]">مشاهده بیشتر</Link>}
          showStaff={role !== "staff"}
        />
      ) : null}
      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-extrabold">عملکرد یکماه اخیر</h2>
          <Link to="/panel/reports" className="text-sm font-semibold text-[#ffa640]">مشاهده بیشتر</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {role === "staff" ? null : (
          <Card>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
              {[
                ["بازدید", faNum(stats?.views ?? 0)],
                ["بازدیدکننده", faNum(stats?.visitors ?? 0)],
                ["کلیک", faNum(stats?.clicks ?? 0)],
                ["درصد تبدیل", rate(stats?.booked ?? 0, stats?.visitors ?? 0)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted">{label}</dt>
                  <dd className="text-lg font-extrabold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-3 flex items-center justify-between text-xs text-muted">
              <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-[#ffa640]" />بازدید</span>
              <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-[#f7f7f7]" />بازدیدکننده</span>
            </div>
            <DualSpark primary={stats?.series.views ?? zeros} secondary={stats?.series.visitors ?? zeros} primaryColor="#ffa640" secondaryColor="#f7f7f7" />
            <p className={`mt-2 text-xs font-semibold ${monthChange(stats?.views ?? 0, stats?.prevViews ?? 0).tone}`}>{monthChange(stats?.views ?? 0, stats?.prevViews ?? 0).text}</p>
          </Card>
          )}
          <Card>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
              {[
                ["نوبت ثبت‌شده", faNum(stats?.booked ?? 0)],
                ["نوبت لغوشده", faNum(stats?.cancelled ?? 0)],
                ["نوبت تکمیل‌شده", faNum(stats?.completed ?? 0)],
                ["فروش", faNum(stats?.sales ?? 0)],
                ["درآمد", toman(stats?.revenueToman ?? 0)],
                ["درصد لغو", rate(stats?.cancelled ?? 0, (stats?.booked ?? 0) + (stats?.cancelled ?? 0))],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted">{label}</dt>
                  <dd className="text-lg font-extrabold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-3 flex items-center justify-between text-xs text-muted">
              <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-[#ffa640]" />فروش</span>
              <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-[#f7f7f7]" />درآمد</span>
            </div>
            <DualSpark primary={stats?.series.sales ?? zeros} secondary={stats?.series.revenue ?? zeros} primaryColor="#ffa640" secondaryColor="#f7f7f7" />
            <p className={`mt-2 text-xs font-semibold ${monthChange(stats?.revenueToman ?? 0, stats?.prevRevenueToman ?? 0).tone}`}>{monthChange(stats?.revenueToman ?? 0, stats?.prevRevenueToman ?? 0).text}</p>
          </Card>
        </div>
      </section>
      <Link to="/support" className="flex items-center justify-between gap-3 rounded-card border border-line bg-card p-4 lg:hidden">
        <span className="flex min-w-0 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-[rgba(255,166,64,0.14)] text-[#ffa640]">
            <LifeBuoy className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block font-extrabold">راهنما و پشتیبانی</span>
            <span className="mt-0.5 block text-sm text-muted">سوالی داری؟ با ما در ارتباط باش</span>
          </span>
        </span>
        <ChevronLeft className="size-5 shrink-0 text-muted" aria-hidden="true" />
      </Link>
      {pick ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setPick(null)}>
          <div className="grid w-full max-w-md gap-3 rounded-2xl border border-line bg-card p-4" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-lg font-extrabold">تعیین وضعیت</h3>
            <p className="text-sm text-muted">{pick.customer} · {formatWhen(pick.startsAt, schedule?.timezone || "Asia/Tehran")}</p>
            <label className="grid gap-1 text-sm">
              خدمت
              <select className="min-h-11 rounded-xl border border-line bg-paper px-3" value={draft.serviceId} onChange={(event) => setDraft({ ...draft, serviceId: event.target.value })}>
                {services.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              پرسنل
              <select className="min-h-11 rounded-xl border border-line bg-paper px-3" value={draft.staffId} disabled={role === "staff"} onChange={(event) => setDraft({ ...draft, staffId: event.target.value })}>
                {people.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <div className="flex gap-2">
              <button type="button" className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-ink text-sm font-semibold text-on-ink" onClick={() => void settle("completed")}>انجام شد</button>
              <button type="button" className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-line text-sm font-semibold text-[#e11d2e]" onClick={() => void settle("cancelled")}>لغو شد</button>
            </div>
          </div>
        </div>
      ) : null}
      {qrOpen && current ? <QrDialog name={current.name} slug={current.slug} url={pageUrl} avatar={current.avatar} businessId={businessId} onClose={() => setQrOpen(false)} /> : null}
    </div>
  );
}