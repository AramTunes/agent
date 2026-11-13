import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, CalendarPlus, ChevronLeft, ClipboardList, LifeBuoy, Link2, PenLine, QrCode, Settings, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { usePanel } from "@/components/account";
import { ProgressRing } from "@/components/progress-ring";
import { Button, Card, Field, Skeleton, TextInput } from "@/components/ui";
import { Select } from "@/components/ui/select";
import { DualSpark } from "@/components/sparkline";
import { WeekBoard } from "@/components/week-board";
import { categoriesFn, createBusinessFn, createDemoFn, dashboardFn, manageBusinessFn, resolveFollowupFn } from "@/lib/api";
import { assignRandomPageAvatar, PageMark } from "@/lib/page-avatar";
import { QrDialog } from "@/components/qr-share";
import { faNum, toman } from "@/lib/booking/fa";
import { formatWhen } from "@/lib/booking/format";
import { focusKind } from "@/lib/business-focus";
import { followups, type Followup, type OverdueBooking } from "@/lib/followups";

export const Route = createFileRoute("/panel/")({ component: PanelHome });

function greeting(zone: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hourCycle: "h23",
    timeZone: zone || "Asia/Tehran",
  }).formatToParts(now);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  if (hour >= 5 && hour < 12) return "صبح بخیر";
  if (hour >= 12 && hour < 15) return "ظهر بخیر";
  if (hour >= 15 && hour < 19) return "عصر بخیر";
  return "شب بخیر";
}

function firstName(full: string) {
  const name = full.trim().split(/\s+/)[0];
  return name || "کاربر";
}

const emptySeries = { views: [] as number[], visitors: [] as number[], done: [] as number[], revenue: [] as number[], orders: [] as number[], orderRevenue: [] as number[] };
const emptyStats = {
  views: 0, visitors: 0, clicks: 0,
  booked: 0, cancelled: 0, missed: 0, completed: 0, revenueToman: 0,
  converted: 0, orders: 0, orderCancelled: 0, orderRevenue: 0, orderMoney: true,
  prevViews: 0, prevRevenueToman: 0, prevCompleted: 0, prevOrders: 0, prevOrderRevenue: 0,
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

type Overdue = OverdueBooking;

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
  const [cancelReason, setCancelReason] = useState("");
  const [draft, setDraft] = useState({ serviceId: "", staffId: "" });
  const [schedule, setSchedule] = useState<{ timezone: string; weekly: { weekday: number; startMin: number; endMin: number }[] } | null>(null);
  const [zone, setZone] = useState("Asia/Tehran");
  const [focus, setFocus] = useState(focusKind(current?.categoryId));
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
      if (res.data.timezone) setZone(res.data.timezone);
      if (res.data.focus === "orders" || res.data.focus === "booking") setFocus(res.data.focus);
    });
    return () => {
      live = false;
    };
  }, [businessId]);

  async function settle(status: "completed" | "cancelled") {
    if (!pick) return;
    const reason = status === "cancelled" ? cancelReason.trim() : "";
    if (status === "cancelled" && reason.length < 2) {
      toast.error("دلیل لغو را بنویسید");
      return;
    }
    const res = await resolveFollowupFn({ data: { bookingId: pick.id, serviceId: draft.serviceId, staffId: draft.staffId, status, reason } });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setOverdue((items) => items.filter((item) => item.id !== pick.id));
    setPick(null);
    setCancelReason("");
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
              <Select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
              />
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
  const ordersMode = focus !== "booking";
  const shortcuts = [
    { label: ordersMode ? "سفارشات" : "ثبت نوبت", icon: ordersMode ? ClipboardList : CalendarPlus, to: ordersMode ? "/panel/orders" as const : "/panel/calendar" as const },
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
            <h1 className="text-2xl font-extrabold">{greeting(zone)} {firstName(displayName)}</h1>
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
      {businessId && schedule && !ordersMode ? (
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
          <h2 className="font-extrabold">عملکرد این ماه</h2>
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
                ["درصد تبدیل", rate(stats?.converted ?? 0, stats?.visitors ?? 0)],
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
            <DualSpark primary={stats?.series.views ?? []} secondary={stats?.series.visitors ?? []} primaryColor="#ffa640" secondaryColor="#f7f7f7" />
            <p className={`mt-2 text-xs font-semibold ${monthChange(stats?.views ?? 0, stats?.prevViews ?? 0).tone}`}>{monthChange(stats?.views ?? 0, stats?.prevViews ?? 0).text}</p>
          </Card>
          )}
          <Card>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2">
              {(ordersMode
                ? [
                    ["سفارش ثبت‌شده", faNum(stats?.orders ?? 0)],
                    ["سفارش لغوشده", faNum(stats?.orderCancelled ?? 0)],
                    ["درآمد", stats?.orderMoney === false ? "قطعی نیست" : toman(stats?.orderRevenue ?? 0)],
                    ["درصد لغو", rate(stats?.orderCancelled ?? 0, (stats?.orders ?? 0) + (stats?.orderCancelled ?? 0))],
                  ]
                : [
                    ["نوبت ثبت‌شده", faNum(stats?.booked ?? 0)],
                    ["انجام‌شده", faNum(stats?.completed ?? 0)],
                    ["لغوشده", faNum(stats?.cancelled ?? 0)],
                    ["نیامده", faNum(stats?.missed ?? 0)],
                    ["درآمد", toman(stats?.revenueToman ?? 0)],
                    ["درصد لغو", rate(stats?.cancelled ?? 0, stats?.booked ?? 0)],
                  ]
              ).map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted">{label}</dt>
                  <dd className="text-lg font-extrabold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-3 flex items-center justify-between text-xs text-muted">
              <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-[#ffa640]" />{ordersMode ? "درآمد" : "انجام‌شده"}</span>
            </div>
            <DualSpark primary={ordersMode ? (stats?.series.orderRevenue ?? []) : (stats?.series.done ?? [])} secondary={[]} primaryColor="#ffa640" secondaryColor="#f7f7f7" />
            <p className={`mt-2 text-xs font-semibold ${monthChange(ordersMode ? (stats?.orderRevenue ?? 0) : (stats?.completed ?? 0), ordersMode ? (stats?.prevOrderRevenue ?? 0) : (stats?.prevCompleted ?? 0)).tone}`}>{monthChange(ordersMode ? (stats?.orderRevenue ?? 0) : (stats?.completed ?? 0), ordersMode ? (stats?.prevOrderRevenue ?? 0) : (stats?.prevCompleted ?? 0)).text}</p>
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
              <Select
                value={draft.serviceId}
                onChange={(event) => setDraft({ ...draft, serviceId: event.target.value })}
                options={services.map((item) => ({ value: item.id, label: item.name }))}
              />
            </label>
            <label className="grid gap-1 text-sm">
              پرسنل
              <Select
                value={draft.staffId}
                disabled={role === "staff"}
                onChange={(event) => setDraft({ ...draft, staffId: event.target.value })}
                options={people.map((item) => ({ value: item.id, label: item.name }))}
              />
            </label>
            <label className="grid gap-1 text-sm">
              دلیل لغو
              <TextInput value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} placeholder="اگر لغو می‌کنید بنویسید" />
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