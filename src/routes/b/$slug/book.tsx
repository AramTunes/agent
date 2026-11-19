import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { JalaliCalendar } from "@/components/jalali-calendar";
import { Shell } from "@/components/shell";
import { Badge, Button, Card, Empty, ErrorNote, Field, Skeleton, Stepper, TextInput } from "@/components/ui";
import { PhoneInput } from "@/components/phone-input";
import { useCurrentUserState } from "@/lib/session";
import { minutesLabel, toman } from "@/lib/booking/fa";
import { isIranMobile, normalizeIranMobile } from "@/lib/iran-phone";
import { formatClock, formatDay } from "@/lib/booking/format";
import { addDaysYmd, civilInZone, todayYmd } from "@/lib/booking/time";
import { availabilityFn, createBookingFn, publicBusinessFn, setBookingStatusFn } from "@/lib/api";
import { PageMark } from "@/lib/page-avatar";
import { fitsTopic } from "@/lib/business-focus";
import { CancelReasonPick, customerCancelReasons } from "@/components/cancel-reasons";

export const Route = createFileRoute("/b/$slug/book")({ component: BookPage });

type Service = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  bufferMinutes: number;
  priceToman: number;
};
type Biz = {
  id: string;
  name: string;
  timezone: string;
  allowAnyStaff: boolean;
  isDemo: boolean;
  avatar?: string;
  cancelBeforeMinutes?: number;
  minLeadMinutes: number;
  maxHorizonDays: number;
  address?: string;
  phone?: string;
  categoryId?: string;
  pageBlocks?: { type?: string; title?: string; active?: boolean }[];
  services: Service[];
  staff: { id: string; name: string; title: string; serviceIds: string[]; weekly?: { weekday: number; startMin: number; endMin: number }[] }[];
  holidays?: { date: string; staffId?: string | null }[];
};

function closedFor(
  day: string,
  people: { id: string; weekly?: { weekday: number; startMin: number; endMin: number }[] }[],
  holidays: { date: string; staffId?: string | null }[],
) {
  if (people.length === 0) return false;
  const weekday = new Date(`${day}T12:00:00Z`).getUTCDay();
  if (holidays.some((item) => item.date === day && !item.staffId)) return true;
  return !people.some((person) => {
    if (holidays.some((item) => item.date === day && item.staffId === person.id)) return false;
    return (person.weekly ?? []).some((span) => span.weekday === weekday && span.endMin > span.startMin);
  });
}

function bookingRules(biz: Biz) {
  const cancel = (biz.cancelBeforeMinutes ?? 0) > 0
    ? `لغو یا جابه‌جایی تا ${minutesLabel(biz.cancelBeforeMinutes ?? 0)} مانده به نوبت ممکن است`
    : "لغو یا جابه‌جایی تا شروع نوبت ممکن است";
  const lead = biz.minLeadMinutes > 0
    ? `رزرو حداقل ${minutesLabel(biz.minLeadMinutes)} زودتر انجام می‌شود`
    : "رزرو تا نزدیک همان ساعت ممکن است";
  return `${cancel}. ${lead}.`;
}

function localDay(iso: string, zone: string) {
  const c = civilInZone(new Date(iso), zone || "Asia/Tehran");
  return `${c.year}-${String(c.month).padStart(2, "0")}-${String(c.day).padStart(2, "0")}`;
}

function idempotency() {
  const key = `web-${crypto.randomUUID()}`;
  return key;
}

type Receipt = {
  id: string;
  customerName?: string;
  customerPhone?: string;
  note?: string;
  startsAt?: string;
  serviceName?: string;
  staffName?: string;
  status?: string;
  customerNote?: string;
  receiptToken?: string;
};

function BookPage() {
  const { slug } = Route.useParams();
  return <BookingScreen slug={slug} />;
}

export function BookingScreen({ slug }: { slug: string }) {
  const { user, isPending } = useCurrentUserState();
  const [biz, setBiz] = useState<Biz | null>(null);
  const [error, setError] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [staffId, setStaffId] = useState<string | null>(null);
  const [day, setDay] = useState("");
  const [slots, setSlots] = useState<{ start: string; taken?: boolean; staff: { id: string; name: string }[] }[]>([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [start, setStart] = useState("");
  const [note, setNote] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [pending, setPending] = useState(false);
  const [step, setStep] = useState(0);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [askCancel, setAskCancel] = useState(false);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    let live = true;
    publicBusinessFn({ data: { slug } }).then((res) => {
      if (!live) return;
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setBiz(res.data);
      setServiceId(res.data.services?.[0]?.id ?? "");
      setDay(todayYmd(res.data.timezone || "Asia/Tehran"));
    });
    return () => {
      live = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!user || firstName || lastName) return;
    const parts = (user.displayName ?? "").trim().split(/\s+/).filter(Boolean);
    if (parts.length) setFirstName(parts[0] ?? "");
    if (parts.length > 1) setLastName(parts.slice(1).join(" "));
  }, [user, firstName, lastName]);

  const services = biz?.services ?? [];
  const service = services.find((item) => item.id === serviceId);
  const staffChoices = useMemo(
    () => (biz?.staff ?? []).filter((person) => person.serviceIds?.includes(serviceId)) ?? [],
    [biz, serviceId],
  );

  useEffect(() => {
    if (!biz || !serviceId || !day || !fitsTopic("booking", biz.categoryId)) return;
    let live = true;
    setSlotLoading(true);
    setStart("");
    availabilityFn({ data: { businessId: biz.id, serviceId, staffId: staffId ?? "", day } }).then((res) => {
      if (!live) return;
      setSlots(res.ok ? res.data.slots : []);
      if (!res.ok) setError(res.error);
      setSlotLoading(false);
    });
    return () => {
      live = false;
    };
  }, [biz, serviceId, staffId, day]);

  async function confirm() {
    if (!biz || !start) return;
    const given = firstName.trim();
    const family = lastName.trim();
    if (given.length < 2 || family.length < 2) {
      toast.error("نام و نام خانوادگی را کامل بنویسید");
      return;
    }
    if (!isIranMobile(phone)) {
      toast.error("شماره موبایل معتبر نیست");
      return;
    }
    setPending(true);
    const res = await createBookingFn({
      data: {
        businessId: biz.id,
        serviceId,
        staffId,
        start,
        note,
        firstName: given,
        lastName: family,
        customerPhone: `0${normalizeIranMobile(phone)}`,
        idempotencyKey: idempotency(),
      },
    });
    setPending(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setReceipt(res.data);
    toast.success("نوبت ثبت شد");
  }

  async function cancelBooking(reason: string) {
    if (!receipt) return;
    setCanceling(true);
    const res = await setBookingStatusFn({ data: { bookingId: receipt.id, status: "cancelled", reason } });
    setCanceling(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setReceipt(res.data);
    setAskCancel(false);
    toast.success("نوبت لغو شد");
  }

  if (error && !biz) {
    return (
      <Shell>
        <Empty title="رزرو ممکن نیست" body={error} />
      </Shell>
    );
  }
  if (!biz) {
    return (
      <Shell>
        <Skeleton className="h-64" />
      </Shell>
    );
  }
  if (!fitsTopic("booking", biz.categoryId)) {
    return (
      <Shell>
        <Empty title="این صفحه نوبت ندارد" body="موضوع این کسب‌وکار رزرو نوبت نیست." />
      </Shell>
    );
  }
  const min = todayYmd(biz.timezone || "Asia/Tehran");
  const max = addDaysYmd(min, biz.maxHorizonDays, biz.timezone || "Asia/Tehran");
  const heading = biz.pageBlocks?.find((item) => item.type === "booking" && item.active !== false)?.title?.trim() || "رزرو نوبت";
  const openSlots = slots.filter((slot) => !slot.taken);

  return (
    <Shell>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <PageMark slug={slug} name={biz.name} avatar={biz.avatar} size={56} />
          <div className="min-w-0">
            <h1 className="text-3xl font-extrabold">{heading}</h1>
            {biz.isDemo ? <Badge tone="copper">تمرین با داده نمونه</Badge> : null}
          </div>
        </div>
        <Link to="/b/$slug" params={{ slug }} className="text-sm font-semibold text-jade">بازگشت به صفحه</Link>
      </div>
      <p className="mb-4 text-sm leading-6 text-muted">{bookingRules(biz)}</p>
      {receipt ? (
        <Card>
          <h2 className="text-xl font-bold">{receipt.status === "cancelled" ? "نوبت لغو شد" : "نوبت ثبت شد"}</h2>
          <dl className="mt-4 grid gap-2 text-sm leading-7">
            <div className="flex justify-between gap-3"><dt className="text-muted">اسمت</dt><dd>{receipt.customerName || "ثبت نشده"}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">شماره‌ت</dt><dd dir="ltr">{receipt.customerPhone || "ثبت نشده"}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">یادداشت برای کسب‌وکار</dt><dd className="text-end">{receipt.note?.trim() || "ندارد"}</dd></div>
            {receipt.customerNote ? <div className="flex justify-between gap-3"><dt className="text-muted">پیام کسب‌وکار</dt><dd className="text-end">{receipt.customerNote}</dd></div> : null}
            <div className="flex justify-between gap-3"><dt className="text-muted">روز</dt><dd>{receipt.startsAt ? formatDay(localDay(receipt.startsAt, biz.timezone)) : ""}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">ساعت</dt><dd>{receipt.startsAt ? formatClock(receipt.startsAt, biz.timezone) : ""}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">خدمت</dt><dd>{receipt.serviceName}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">پرسنل</dt><dd>{receipt.staffName}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">آدرس ما</dt><dd className="text-end">{biz.address?.trim() || "ثبت نشده"}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">شماره ما</dt><dd dir="ltr">{biz.phone?.trim() || "ثبت نشده"}</dd></div>
          </dl>
          {receipt.status !== "cancelled" ? (
            <div className="mt-5 border-t border-line pt-4">
              <p className="text-sm leading-7">اگر می‌خواهی نوبتت را لغو کنی، از فرم زیر استفاده کن.</p>
              {!askCancel ? (
                <button type="button" onClick={() => setAskCancel(true)} className="mt-3 inline-flex h-11 items-center rounded-full border border-line px-4 text-sm font-semibold">لغو نوبت</button>
              ) : (
                <div className="mt-3 grid gap-2">
                  <p className="text-sm font-semibold">یک دلیل را بزنید تا نوبت لغو شود</p>
                  <CancelReasonPick reasons={customerCancelReasons} pending={canceling} onPick={(item) => void cancelBooking(item)} />
                </div>
              )}
            </div>
          ) : <p className="mt-4 text-sm">این نوبت لغو شده است.</p>}
        </Card>
      ) : (
        <div className="grid gap-4">
          <Stepper current={step} steps={[{ label: "خدمت" }, { label: "پرسنل" }, { label: "زمان" }, { label: "مشخصات" }]} />
          {step === 0 ? (
            <Card>
              <h2 className="font-bold">خدمت</h2>
              {services.length === 0 ? <p className="mt-3 text-sm text-muted">هنوز خدمتی برای رزرو تعریف نشده.</p> : null}
              <div className="mt-3 grid gap-2">
                {services.map((item) => (
                  <button key={item.id} type="button" onClick={() => setServiceId(item.id)} className={`rounded-xl border px-3 py-3 text-start ${item.id === serviceId ? "border-jade bg-jade-soft" : "border-line"}`}>
                    <div className="flex justify-between gap-3">
                      <span className="font-semibold">{item.name}</span>
                      <span className="tabular-nums">{toman(item.priceToman)}</span>
                    </div>
                    <div className="text-sm text-muted">{minutesLabel(item.durationMinutes)}{item.bufferMinutes ? ` + ${minutesLabel(item.bufferMinutes)} آماده‌سازی` : ""}</div>
                  </button>
                ))}
              </div>
            </Card>
          ) : null}
          {step === 1 ? (
            <Card>
              <h2 className="font-bold">پرسنل</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {biz.allowAnyStaff ? (
                  <button type="button" className={`min-h-11 rounded-full px-4 text-sm ${staffId === null ? "bg-jade text-on-jade" : "border border-line"}`} onClick={() => setStaffId(null)}>اولین پرسنل آزاد</button>
                ) : null}
                {staffChoices.map((person) => (
                  <button key={person.id} type="button" className={`min-h-11 rounded-full px-4 text-sm ${staffId === person.id ? "bg-jade text-on-jade" : "border border-line"}`} onClick={() => setStaffId(person.id)}>{person.name}</button>
                ))}
              </div>
              {staffChoices.length === 0 && !biz.allowAnyStaff ? <p className="mt-3 text-sm text-muted">برای این خدمت پرسنلی تعریف نشده.</p> : null}
            </Card>
          ) : null}
          {step === 2 ? (
            <div className="grid gap-3">
              <JalaliCalendar value={day || min} onChange={setDay} min={min} max={max} disabledDay={(ymd) => closedFor(ymd, staffChoices, biz.holidays ?? [])} />
              <Card>
                <h2 className="font-bold">زمان {day ? formatDay(day) : ""}</h2>
                {slotLoading ? <Skeleton className="mt-3 h-16" /> : null}
                {!slotLoading && slots.length === 0 ? <p className="mt-3 text-sm text-muted">در این روز وقتی نیست.</p> : null}
                {!slotLoading && slots.length > 0 && openSlots.length === 0 ? <p className="mt-3 text-sm text-muted">همه وقت‌های این روز گرفته شده.</p> : null}
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((slot) => (
                    <button
                      key={slot.start}
                      type="button"
                      disabled={slot.taken}
                      onClick={() => setStart(slot.start)}
                      className={`min-h-11 rounded-xl px-1 text-sm tabular-nums ${slot.taken ? "border border-line bg-paper text-muted" : start === slot.start ? "bg-ink text-on-ink" : "border border-line"}`}
                    >
                      <span className={slot.taken ? "line-through" : ""}>{formatClock(slot.start, biz.timezone)}</span>
                      {slot.taken ? <span className="mt-0.5 block text-[10px] leading-4 no-underline">گرفته‌شده</span> : null}
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          ) : null}
          {step === 3 ? (
            <Card>
              <h2 className="font-bold">مشخصات</h2>
              {service && start ? <p className="mt-2 text-sm text-muted">{service.name}، {day ? formatDay(day) : ""}، {formatClock(start, biz.timezone)}</p> : null}
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="نام">
                  <TextInput value={firstName} maxLength={40} onChange={(event) => setFirstName(event.target.value)} />
                </Field>
                <Field label="نام خانوادگی">
                  <TextInput value={lastName} maxLength={40} onChange={(event) => setLastName(event.target.value)} />
                </Field>
              </div>
              <div className="mt-3">
                <Field label="شماره">
                  <PhoneInput value={phone} onChange={setPhone} />
                </Field>
              </div>
              <div className="mt-3">
                <Field label="یادداشت">
                  <TextInput value={note} maxLength={500} onChange={(event) => setNote(event.target.value)} />
                </Field>
              </div>
              {isPending ? <Skeleton className="mt-3 h-11" /> : null}
              {!isPending && !user ? (
                <div className="mt-3 grid gap-2">
                  <ErrorNote>برای ثبت نوبت وارد شوید.</ErrorNote>
                  <Link to="/auth" search={{ next: `/b/${slug}/book` }} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-ink font-semibold text-on-ink">ورود</Link>
                </div>
              ) : null}
            </Card>
          ) : null}
          <div className="flex justify-end gap-2">
            {step < 3 ? (
              <>
                {step === 0 ? (
                  <Link to="/b/$slug" params={{ slug }} className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-paper px-5 text-sm font-semibold">بازگشت</Link>
                ) : (
                  <button type="button" onClick={() => setStep((value) => value - 1)} className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-paper px-5 text-sm font-semibold">بازگشت</button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (step === 0 && !serviceId) {
                      toast.error("یک خدمت انتخاب کنید");
                      return;
                    }
                    if (step === 1 && staffId === null && !biz.allowAnyStaff) {
                      toast.error(staffChoices.length === 0 ? "پرسنلی برای این خدمت نیست" : "یک پرسنل انتخاب کنید");
                      return;
                    }
                    if (step === 2 && !start) {
                      toast.error("یک زمان آزاد انتخاب کنید");
                      return;
                    }
                    setStep((value) => value + 1);
                  }}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-on-ink"
                >
                  بعدی
                </button>
              </>
            ) : user ? (
              <Button disabled={!start || pending} onClick={confirm}>{pending ? "در حال ثبت" : "ذخیره"}</Button>
            ) : null}
          </div>
        </div>
      )}
    </Shell>
  );
}
