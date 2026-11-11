import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatedTabs } from "@/components/animated-tabs";
import { ScrollArea } from "@/components/scroll-area";
import { Card, Skeleton } from "@/components/ui";
import { businessBookingsFn } from "@/lib/api";
import { clockLabel, faNum, STATUS_FA, WEEKDAYS_FA } from "@/lib/booking/fa";
import { gregorianToJalali, jalaliMonthName } from "@/lib/booking/jalali";
import { addDaysYmd, civilInZone, todayYmd, zonedCivilToUtc } from "@/lib/booking/time";

type Span = { weekday: number; startMin: number; endMin: number };
type Booking = {
  id: string;
  customerName: string;
  serviceName: string;
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
  }, [businessId, day]);

  const visible = (rows ?? []).filter((row) => row.status !== "cancelled");
  const range = rangeFor(weekly, selected.weekday, visible, zone);
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
          <div className={`flex min-w-0 flex-1 flex-col items-center border-s border-line px-2 py-1.5 ${selected.weekday === 5 ? "bg-danger-soft" : ""}`}>
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
              friday={selected.weekday === 5}
              nowTop={day === today && nowMin >= range.startHour * 60 && nowMin <= range.endHour * 60 ? ((nowMin - range.startHour * 60) / 60) * HOUR : null}
            />
          </ScrollArea>
        ) : null}
      </div>
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
}: {
  startHour: number;
  endHour: number;
  events: Placed[];
  friday: boolean;
  nowTop: number | null;
  showStaff: boolean;
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
              <div className="flex h-full flex-col overflow-hidden rounded-md border-s-2 border-jade bg-jade-soft px-1.5 py-0.5 text-xs">
                <span className="truncate font-semibold">{event.customerName}</span>
                {block > 36 ? (
                  <span className="truncate text-muted">
                    {event.serviceName}{showStaff && event.staffName ? ` · ${event.staffName}` : ""} · {clockLabel(event.start)} · {STATUS_FA[event.status] ?? event.status}
                  </span>
                ) : null}
              </div>
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
