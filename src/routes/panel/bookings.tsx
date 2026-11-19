import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { usePanel } from "@/components/account";
import { VisitDialog } from "@/components/week-board";
import { Badge, Empty, Skeleton } from "@/components/ui";
import { businessBookingsFn, manageBusinessFn } from "@/lib/api";
import { STATUS_FA, faNum } from "@/lib/booking/fa";
import { formatWhen } from "@/lib/booking/format";
import { gregorianToJalali, jalaliMonthName } from "@/lib/booking/jalali";
import { civilInZone } from "@/lib/booking/time";

export const Route = createFileRoute("/panel/bookings")({ component: AllBookingsPage });

type Row = {
  id: string;
  serviceName: string;
  serviceId: string;
  staffId: string;
  staffName: string;
  customerName: string;
  customerPhone: string;
  startsAt: string;
  status: string;
  timezone: string;
};

function AllBookingsPage() {
  const { businessId } = usePanel();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [zone, setZone] = useState("Asia/Tehran");
  const [picked, setPicked] = useState<Row | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!businessId) return;
    let live = true;
    manageBusinessFn({ data: { businessId } }).then((res) => {
      if (live && res.ok) setZone(res.data.timezone || "Asia/Tehran");
    });
    businessBookingsFn({ data: { businessId } }).then((res) => {
      if (!live) return;
      setRows(res.ok ? res.data : []);
      if (!res.ok) toast.error(res.error);
    });
    return () => {
      live = false;
    };
  }, [businessId, tick]);

  if (!businessId) return <Empty title="اول کسب‌وکار بسازید" body="نوبت‌ها بعد از ساخت صفحه این‌جا دیده می‌شوند." />;

  const groups = new Map<string, Row[]>();
  for (const row of rows ?? []) {
    const key = dayKey(row.startsAt, row.timezone || zone);
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }
  const days = [...groups.keys()].sort((a, b) => b.localeCompare(a));

  return (
    <div className="panel-page grid min-w-0 gap-6">
      <div>
        <h1 className="text-xl font-bold">همه نوبت‌ها</h1>
        <p className="text-sm text-muted">نوبت‌های همه تاریخ‌ها. برای تغییر وضعیت روی ردیف بزنید.</p>
      </div>
      {rows === null ? <Skeleton className="h-24" /> : null}
      {rows && rows.length === 0 ? <Empty title="نوبتی نیست" body="نوبت‌های همه تاریخ‌ها این‌جا دیده می‌شود." /> : null}
      {days.map((day) => (
        <section key={day} className="grid gap-2">
          <h2 className="text-sm font-bold text-muted">{dayTitle(day)}</h2>
          {(groups.get(day) ?? []).map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => setPicked(row)}
              className="min-w-0 rounded-card border border-line bg-card p-5 text-start"
            >
              <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="break-words font-bold">{formatWhen(row.startsAt, row.timezone || zone)} · {row.serviceName}</div>
                  <p className="break-words text-sm text-muted">{row.staffName} · {row.customerName} {row.customerPhone ? faNum(row.customerPhone) : ""}</p>
                </div>
                <Badge tone={row.status === "cancelled" ? "danger" : "jade"}>{STATUS_FA[row.status] ?? row.status}</Badge>
              </div>
            </button>
          ))}
        </section>
      ))}
      {picked && businessId ? (
        <VisitDialog
          booking={picked}
          businessId={businessId}
          zone={picked.timezone || zone}
          onClose={() => setPicked(null)}
          onDone={() => {
            setPicked(null);
            setTick((value) => value + 1);
          }}
        />
      ) : null}
    </div>
  );
}

function dayKey(iso: string, zone: string) {
  const civil = civilInZone(new Date(iso), zone || "Asia/Tehran");
  return `${civil.year}-${String(civil.month).padStart(2, "0")}-${String(civil.day).padStart(2, "0")}`;
}

function dayTitle(ymd: string) {
  const [year, month, day] = ymd.split("-").map(Number);
  const jalali = gregorianToJalali(year, month, day);
  return `${faNum(jalali.jd)} ${jalaliMonthName(jalali.jm)} ${faNum(jalali.jy)}`;
}
