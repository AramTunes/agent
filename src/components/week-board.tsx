import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { AnimatedTabs } from "@/components/animated-tabs";
import { AppWindow } from "@/components/panel-window";
import { ScrollArea } from "@/components/scroll-area";
import { Button, Card, DialogActions, Field, Skeleton, TextInput } from "@/components/ui";
import { availabilityFn, businessBookingsFn, rescheduleBookingFn, setBookingStatusFn } from "@/lib/api";
import { clockLabel, faNum, STATUS_FA, WEEKDAYS_FA } from "@/lib/booking/fa";
import { formatDay, formatWhen } from "@/lib/booking/format";
import { gregorianToJalali, jalaliMonthName } from "@/lib/booking/jalali";
import { addDaysYmd, civilInZone, todayYmd, ymd, zonedCivilToUtc } from "@/lib/booking/time";

type Span = { weekday: number; startMin: number; endMin: number };
type Booking = {
  id: string;
  customerName: string;
  serviceName: string;
  serviceId: string;
  staffId: string;
  staffName?: string;
  startsAt: string;
  endsAt?: string;
  durationMinutes?: number;
  status: string;
};
type Placed = Booking & { start: number; end: number; col: number; cols: number };

const HOUR = 48;

export function WeekBoard({
  businessId,
  timezone,
  weekly,
  more,
  showStaff = false,
}: {
  businessId: string;
  timezone: string;
  weekly: Span[];
  more?: ReactNode;
  showStaff?: boolean;
}) {
  const zone = timezone || "Asia/Tehran";
  const today = todayYmd(zone);
  const days = weekDays(zone);
  const [day, setDay] = useState(today);
  const [rows, setRows] = useState<Booking[] | null>(null);
  const [picked, setPicked] = useState<Booking | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const body = useRef<HTMLDivElement>(null);
  const selected = days.find((item) => item.ymd === day) ?? days[0];
  const index = Math.max(0, days.findIndex((item) => item.ymd === selected.ymd));

  useEffect(() => {
    let live = true;
    setRows(null);
    businessBookingsFn({ data: { businessId, day } }).then((res) => {
      if (!live) return;
      setRows(res.ok ? (res.data as Booking[]) : []);
    });
    return () => {
      live = false;
    };
  }, [businessId, day, reloadKey]);

  const visible = (rows ?? []).filter((row) => row.status !== "cancelled");
  const range = rangeFor(weekly, selected.weekday, visible, zone);
  const off = !weekly.some((span) => span.weekday === selected.weekday && span.endMin > span.startMin);
  const now = new Date();
  const nowCivil = civilInZone(now, zone);
  const nowMin = nowCivil.hour * 60 + nowCivil.minute;

  useEffect(() => {
    const node = body.current;
    if (!node || !range || day !== today) return;
    node.scrollTop = Math.max(0, (nowMin / 60 - range.startHour - 1) * HOUR);
  }, [day, today, range?.startHour, nowMin, rows]);

  return (
    <Card className="min-w-0">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-extrabold">امروز و هفته پیش رو</h2>
        {more}
      </div>
      <DayTabs days={days} index={index} onPick={(next) => setDay(days[next]?.ymd ?? day)} />
      <div className="mt-3 overflow-hidden rounded-lg border border-line">
        <div className="flex border-b border-line">
          <div className="w-14 shrink-0" />
          <div className={`flex min-w-0 flex-1 flex-col items-center border-s border-line px-2 py-1.5 ${off ? "bg-danger-soft" : ""}`}>
            <span className="text-xs text-muted">{selected.name}</span>
            <span className="text-sm font-semibold">{selected.date}</span>
          </div>
        </div>
        {rows === null ? <Skeleton className="m-3 h-40" /> : null}
        {rows && !range ? <p className="px-3 py-6 text-sm text-muted">ساعت کاری این روز تنظیم نشده.</p> : null}
        {rows && range ? (
          <ScrollArea ref={body} className="max-h-96">
            <DayGrid
              startHour={range.startHour}
              endHour={range.endHour}
              events={place(visible, zone)}
              showStaff={showStaff}
              friday={off}
              nowTop={day === today && nowMin >= range.startHour * 60 && nowMin <= range.endHour * 60 ? ((nowMin - range.startHour * 60) / 60) * HOUR : null}
              onPick={setPicked}
            />
          </ScrollArea>
        ) : null}
      </div>
      {picked ? (
        <VisitDialog
          booking={picked}
          businessId={businessId}
          zone={zone}
          onClose={() => setPicked(null)}
          onDone={() => {
            setPicked(null);
            setReloadKey((value) => value + 1);
          }}
        />
      ) : null}
    </Card>
  );
}

function DayTabs({
  days,
  index,
  onPick,
}: {
  days: { name: string; date: string }[];
  index: number;
  onPick: (index: number) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);

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
  }, [days.length]);

  return (
    <div className="relative mt-3 min-w-0">
      <div
        ref={scroller}
        className="w-full min-w-0 max-lg:overflow-x-auto max-lg:overscroll-x-contain max-lg:[scrollbar-width:none] max-lg:[&::-webkit-scrollbar]:hidden"
      >
        <AnimatedTabs
          className="bg-card"
          items={days.map((item) => ({ label: item.name, hint: item.date }))}
          value={index}
          onChange={onPick}
        />
      </div>
      {more ? <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-card to-transparent lg:hidden" /> : null}
    </div>
  );
}

function DayGrid({
  startHour,
  endHour,
  events,
  friday,
  nowTop,
  showStaff,
  onPick,
}: {
  startHour: number;
  endHour: number;
  events: Placed[];
  friday: boolean;
  nowTop: number | null;
  showStaff: boolean;
  onPick: (booking: Booking) => void;
}) {
  const hours = Array.from({ length: endHour - startHour }, (_, index) => startHour + index);
  const height = hours.length * HOUR;
  return (
    <div className="flex" style={{ height }}>
      <div className="relative w-14 shrink-0" aria-hidden="true">
        {hours.map((hour, index) => (
          <span
            key={hour}
            className="absolute inset-x-0 -translate-y-1/2 text-center text-xs text-muted tabular-nums"
            style={{ top: index * HOUR }}
          >
            {index === 0 ? "" : clockLabel(hour * 60)}
          </span>
        ))}
      </div>
      <div
        className={`relative flex-1 border-s border-line ${friday ? "bg-danger-soft/60" : ""}`}
        style={{ backgroundImage: `repeating-linear-gradient(to bottom, var(--line) 0 1px, transparent 1px ${HOUR}px)` }}
      >
        {events.map((event) => {
          const top = ((event.start - startHour * 60) / 60) * HOUR;
          const block = Math.max(22, ((event.end - event.start) / 60) * HOUR - 2);
          return (
            <div
              key={event.id}
              className="absolute px-0.5"
              style={{ top, height: block, insetInlineStart: `${(event.col / event.cols) * 100}%`, width: `${100 / event.cols}%` }}
            >
              <button
                type="button"
                onClick={() => onPick(event)}
                className={`flex h-full w-full flex-col overflow-hidden rounded-md border-s-2 px-1.5 py-0.5 text-start text-xs ${event.status === "no_show" ? "border-danger bg-danger-soft" : event.status === "completed" ? "border-line bg-paper" : "border-jade bg-jade-soft"}`}
              >
                <span className="truncate font-semibold">{event.customerName}</span>
                {block > 36 ? (
                  <span className="truncate text-muted">
                    {event.serviceName}{showStaff && event.staffName ? ` · ${event.staffName}` : ""} · {clockLabel(event.start)} · {STATUS_FA[event.status] ?? event.status}
                  </span>
                ) : null}
              </button>
            </div>
          );
        })}
        {nowTop != null ? (
          <div className="pointer-events-none absolute inset-x-0 z-10 flex items-center" style={{ top: nowTop }}>
            <span className="rounded-full bg-danger px-1 text-xs font-medium text-on-ink">الان</span>
            <span className="h-px flex-1 bg-danger" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function VisitDialog({
  booking,
  businessId,
  zone,
  onClose,
  onDone,
}: {
  booking: Booking;
  businessId: string;
  zone: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const open = booking.status === "confirmed" || booking.status === "pending";
  const [mode, setMode] = useState<"main" | "cancel" | "move">("main");
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [moveDay, setMoveDay] = useState(() => {
    const civil = civilInZone(new Date(booking.startsAt), zone);
    return ymd(civil.year, civil.month, civil.day);
  });
  const [slots, setSlots] = useState<{ start: string; taken?: boolean }[] | null>(null);
  const days = Array.from({ length: 14 }, (_, index) => addDaysYmd(todayYmd(zone), index, zone));

  useEffect(() => {
    if (mode !== "move") return;
    let live = true;
    setSlots(null);
    availabilityFn({
      data: { businessId, serviceId: booking.serviceId, staffId: booking.staffId, day: moveDay, exceptBookingId: booking.id },
    }).then((res) => {
      if (!live) return;
      setSlots(res.ok ? (res.data.slots ?? []) : []);
    });
    return () => {
      live = false;
    };
  }, [mode, moveDay, businessId, booking.serviceId, booking.staffId, booking.id]);

  async function setStatus(status: string, note = "") {
    setPending(true);
    const res = await setBookingStatusFn({ data: { bookingId: booking.id, status, reason: note } });
    setPending(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(status === "completed" ? "نوبت انجام شد" : status === "no_show" ? "عدم مراجعه ثبت شد" : status === "confirmed" ? "نوبت تأیید شد" : "نوبت لغو شد");
    onDone();
  }

  async function move(start: string) {
    setPending(true);
    const res = await rescheduleBookingFn({ data: { bookingId: booking.id, start, staffId: booking.staffId } });
    setPending(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("نوبت جابه‌جا شد");
    onDone();
  }

  const free = (slots ?? []).filter((slot) => !slot.taken && slot.start !== booking.startsAt);

  return (
    <AppWindow title={booking.customerName || "نوبت"} onClose={onClose} onBack={mode === "main" ? undefined : () => setMode("main")}>
      <p className="text-sm leading-6 text-muted">
        {booking.serviceName}{booking.staffName ? ` · ${booking.staffName}` : ""}
      </p>
      <p className="mt-1 text-sm">{formatWhen(booking.startsAt, zone)}</p>
      <p className="mt-1 text-sm font-semibold">{STATUS_FA[booking.status] ?? booking.status}</p>
      {mode === "main" && open ? (
        <div className="mt-4 grid gap-2">
          {booking.status === "pending" ? <Button disabled={pending} onClick={() => void setStatus("confirmed")}>تأیید</Button> : null}
          {booking.status === "confirmed" ? <Button disabled={pending} onClick={() => void setStatus("completed")}>انجام شد</Button> : null}
          {booking.status === "confirmed" ? <Button variant="quiet" disabled={pending} onClick={() => void setStatus("no_show")}>نیامد</Button> : null}
          <Button variant="quiet" disabled={pending} onClick={() => setMode("move")}>جابه‌جایی</Button>
          <Button variant="danger" disabled={pending} onClick={() => setMode("cancel")}>لغو</Button>
        </div>
      ) : null}
      {mode === "cancel" ? (
        <form
          className="mt-4 grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void setStatus("cancelled", reason.trim() || "لغو توسط کسب‌وکار");
          }}
        >
          <Field label="دلیل لغو">
            <TextInput value={reason} onChange={(event) => setReason(event.target.value)} placeholder="اختیاری" />
          </Field>
          <DialogActions>
            <Button type="button" variant="quiet" onClick={() => setMode("main")}>انصراف</Button>
            <Button type="submit" variant="danger" disabled={pending}>{pending ? "در حال لغو" : "لغو نوبت"}</Button>
          </DialogActions>
        </form>
      ) : null}
      {mode === "move" ? (
        <div className="mt-4 grid gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {days.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMoveDay(item)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${item === moveDay ? "bg-ink text-on-ink" : "border border-line"}`}
              >
                {formatDay(item)}
              </button>
            ))}
          </div>
          {slots === null ? <Skeleton className="h-20" /> : null}
          {slots && free.length === 0 ? <p className="text-sm text-muted">در این روز وقت آزادی نیست.</p> : null}
          <div className="grid grid-cols-3 gap-2">
            {free.map((slot) => (
              <button
                key={slot.start}
                type="button"
                disabled={pending}
                onClick={() => void move(slot.start)}
                className="min-h-11 rounded-xl border border-line text-sm"
              >
                {formatWhen(slot.start, zone).split("،")[1]?.trim() || formatWhen(slot.start, zone)}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </AppWindow>
  );
}

function weekDays(zone: string) {
  const today = todayYmd(zone);
  const weekday = civilInZone(zonedCivilToUtc({ ...parts(today), hour: 12, minute: 0 }, zone), zone).weekday;
  const start = addDaysYmd(today, -((weekday + 1) % 7), zone);
  return Array.from({ length: 7 }, (_, index) => {
    const ymd = addDaysYmd(start, index, zone);
    const civil = civilInZone(zonedCivilToUtc({ ...parts(ymd), hour: 12, minute: 0 }, zone), zone);
    const jalali = gregorianToJalali(civil.year, civil.month, civil.day);
    return {
      ymd,
      weekday: civil.weekday,
      name: WEEKDAYS_FA[civil.weekday],
      date: `${faNum(jalali.jd)} ${jalaliMonthName(jalali.jm)}`,
    };
  });
}

function parts(ymd: string) {
  const [year, month, day] = ymd.split("-").map(Number);
  return { year, month, day };
}

function minutesOf(iso: string, zone: string) {
  const civil = civilInZone(new Date(iso), zone);
  return civil.hour * 60 + civil.minute;
}

function rangeFor(weekly: Span[], weekday: number, rows: Booking[], zone: string) {
  const spans = weekly.filter((item) => item.weekday === weekday);
  let startHour = spans.length ? Math.floor(Math.min(...spans.map((item) => item.startMin)) / 60) : null;
  let endHour = spans.length ? Math.ceil(Math.max(...spans.map((item) => item.endMin)) / 60) : null;
  for (const row of rows) {
    const start = minutesOf(row.startsAt, zone);
    let end = row.endsAt ? minutesOf(row.endsAt, zone) : start + (row.durationMinutes || 30);
    if (end <= start) end = start + (row.durationMinutes || 30);
    startHour = startHour == null ? Math.floor(start / 60) : Math.min(startHour, Math.floor(start / 60));
    endHour = endHour == null ? Math.ceil(end / 60) : Math.max(endHour, Math.ceil(end / 60));
  }
  if (startHour == null || endHour == null || endHour <= startHour) return null;
  return { startHour, endHour };
}

function place(rows: Booking[], zone: string): Placed[] {
  const sorted: Placed[] = rows
    .map((row) => {
      const start = minutesOf(row.startsAt, zone);
      let end = row.endsAt ? minutesOf(row.endsAt, zone) : start + (row.durationMinutes || 30);
      if (end <= start) end = start + (row.durationMinutes || 30);
      return { ...row, start, end, col: 0, cols: 1 };
    })
    .sort((a, b) => a.start - b.start || a.end - b.end);
  let cluster: Placed[] = [];
  let clusterEnd = -1;
  function flush() {
    const columns: Placed[][] = [];
    for (const event of cluster) {
      let col = 0;
      while (columns[col]?.some((other) => other.start < event.end && event.start < other.end)) col += 1;
      (columns[col] ??= []).push(event);
      event.col = col;
    }
    const count = Math.max(columns.length, 1);
    for (const event of cluster) event.cols = count;
    cluster = [];
  }
  for (const event of sorted) {
    if (cluster.length && event.start >= clusterEnd) flush();
    cluster.push(event);
    clusterEnd = Math.max(clusterEnd, event.end);
  }
  if (cluster.length) flush();
  return sorted;
}
