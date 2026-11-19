import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { usePanel } from "@/components/account";
import { JalaliCalendar } from "@/components/jalali-calendar";
import { Badge, Button, Empty, Field, Skeleton, TextInput } from "@/components/ui";
import { Select } from "@/components/ui/select";
import { faNum, toman } from "@/lib/booking/fa";
import { formatSlot, formatWhen } from "@/lib/booking/format";
import { todayYmd } from "@/lib/booking/time";
import { ordersFn, setOrderStatusFn, setOrderWhenFn, shopHoursFn, tablesFn, saveTableFn, deleteTableFn, tableReservationsFn, releaseTableFn, cancelTableFn } from "@/lib/api";
import { CancelReasonPick, orderCancelReasons, tableCancelReasons } from "@/components/cancel-reasons";
import { focusKind } from "@/lib/business-focus";
import { deliverySlots, type ShopSpan } from "@/lib/shop-hours";

export const Route = createFileRoute("/panel/orders")({ component: OrdersPage });

type Line = { title?: string; variant?: string; qty?: number; price?: number; priceTo?: number; priceType?: string; currency?: string };
type Order = {
  id: string;
  name: string;
  phone: string;
  address: string;
  note: string;
  status: string;
  whenKind: string;
  fulfillAt: string;
  createdAt: string;
  price: number;
  currency: string;
  priced: boolean;
  lines: Line[];
  cancelReason?: string;
};

type Reservation = {
  id: string;
  number: string;
  customer: string;
  phone: string;
  startsAt: string;
  note?: string;
  status: string;
  cancelReason?: string;
  createdAt: string;
};

const tableStatus: Record<string, string> = { held: "آزاد نشده", released: "آزاد شده", cancelled: "لغو" };

const statuses = [
  { value: "new", label: "جدید" },
  { value: "preparing", label: "در حال آماده‌سازی" },
  { value: "ready", label: "آماده" },
  { value: "delivered", label: "تحویل" },
  { value: "cancelled", label: "لغو" },
];

function statusLabel(status: string) {
  return statuses.find((item) => item.value === status)?.label ?? status;
}

function money(order: Order) {
  if ((order.currency || "toman") !== "toman") return "";
  if (!order.priced && order.price <= 0) return "";
  return toman(order.price);
}

function whenText(order: Order) {
  if (order.whenKind === "later" && order.fulfillAt) return `برای ${formatSlot(order.fulfillAt)}`;
  return "هرچه زودتر";
}

function lineText(line: Line) {
  const name = line.variant ? `${line.title}، ${line.variant}` : line.title || "مورد";
  const qty = line.qty && line.qty > 1 ? ` × ${faNum(line.qty)}` : "";
  if (line.priceType === "free") return `${name}${qty} · رایگان`;
  if (line.priceType === "contact") return `${name}${qty} · تماس بگیرید`;
  if (line.priceType === "from") return `${name}${qty} · از ${toman(line.price ?? 0)}`;
  if (line.priceType === "range") {
    const from = toman(line.price ?? 0);
    return line.priceTo ? `${name}${qty} · ${from} تا ${toman(line.priceTo)}` : `${name}${qty} · از ${from}`;
  }
  const each = (line.price ?? 0) * (line.qty && line.qty > 0 ? line.qty : 1);
  const priced = line.currency && line.currency !== "toman" ? `${faNum(each)} ${line.currency}` : toman(each);
  return `${name}${qty} · ${priced}`;
}

function OrdersPage() {
  const { businessId, memberships, role } = usePanel();
  const hospitality = focusKind(memberships.find((item) => item.businessId === businessId)?.categoryId) === "hospitality";
  const [rows, setRows] = useState<Order[] | null>(null);
  const [hours, setHours] = useState<ShopSpan[]>([]);
  const [zone, setZone] = useState("Asia/Tehran");
  const [busy, setBusy] = useState("");
  const [editing, setEditing] = useState("");
  const [askCancel, setAskCancel] = useState("");
  const [tables, setTables] = useState<{ id: string; number: string; held?: boolean }[]>([]);
  const [reservations, setReservations] = useState<Reservation[] | null>(null);
  const [number, setNumber] = useState("");
  const [askTable, setAskTable] = useState("");

  function load(id: string) {
    shopHoursFn({ data: { businessId: id } }).then((res) => {
      if (res.ok) {
        setHours(res.data.hours ?? []);
        if (res.data.timezone) setZone(res.data.timezone);
      }
    });
    ordersFn({ data: { businessId: id } }).then((res) => {
      setRows(res.ok ? res.data : []);
      if (!res.ok) toast.error(res.error);
    });
    if (focusKind(memberships.find((item) => item.businessId === id)?.categoryId) === "hospitality") {
      tablesFn({ data: { businessId: id } }).then((res) => {
        if (res.ok) setTables(res.data ?? []);
      });
      tableReservationsFn({ data: { businessId: id } }).then((res) => {
        setReservations(res.ok ? res.data ?? [] : []);
        if (!res.ok) toast.error(res.error);
      });
    }
  }
  useEffect(() => {
    if (businessId) load(businessId);
  }, [businessId, hospitality]);

  if (!businessId) return <Empty title="اول کسب‌وکار بسازید" body="سفارش‌ها بعد از ساخت صفحه اینجا می‌آیند." />;
  if (rows === null) return <Skeleton className="h-48" />;

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-xl font-bold">سفارش‌ها</h1>
        <p className="text-sm text-muted">نام، تماس، آدرس، اقلام و وضعیت هر سفارش</p>
      </div>
      {rows.length === 0 ? <Empty title="هنوز سفارشی نیست" body="وقتی مشتری از صفحه سفارش بدهد، اینجا دیده می‌شود." /> : null}
      <div className="grid gap-3">
        {rows.map((order) => (
          <article key={order.id} className="grid gap-3 rounded-card border border-line bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-bold">{order.name}</h2>
                <p className="mt-1 text-sm text-muted" dir="ltr">{faNum(order.phone)}</p>
              </div>
              <Badge tone={order.status === "cancelled" ? "muted" : order.status === "delivered" ? "jade" : "copper"}>{statusLabel(order.status)}</Badge>
            </div>
            <p className="text-sm leading-6">{order.address}</p>
            <ul className="grid gap-1 text-sm">
              {(order.lines ?? []).map((line, index) => (
                <li key={`${order.id}-${index}`}>{lineText(line)}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
              {money(order) ? <span>مبلغ: {money(order)}</span> : null}
              <span>{whenText(order)}</span>
              <span>ثبت: {formatWhen(order.createdAt, zone)}</span>
            </div>
            {order.note ? <p className="text-sm leading-6">یادداشت: {order.note}</p> : null}
            {order.status === "cancelled" && order.cancelReason ? <p className="text-sm text-muted">دلیل لغو: {order.cancelReason}</p> : null}
            {editing === order.id ? (
              <WhenEditor
                order={order}
                hours={hours}
                zone={zone}
                busy={busy === order.id}
                onClose={() => setEditing("")}
                onSave={async (when, date, time) => {
                  setBusy(order.id);
                  const res = await setOrderWhenFn({ data: { businessId, id: order.id, when, date, time } });
                  setBusy("");
                  if (!res.ok) {
                    toast.error(res.error);
                    return;
                  }
                  setRows((current) => current?.map((item) => item.id === order.id ? { ...item, whenKind: when, fulfillAt: when === "later" ? `${date} ${time}` : "" } : item) ?? []);
                  setEditing("");
                }}
              />
            ) : (
              <Button type="button" variant="quiet" onClick={() => setEditing(order.id)}>تغییر زمان تحویل</Button>
            )}
            <div className="max-w-xs">
              <Select
                aria-label="وضعیت سفارش"
                value={order.status}
                disabled={busy === order.id}
                options={statuses}
                onChange={async (event) => {
                  const status = event.target.value;
                  if (status === "cancelled" && order.status !== "cancelled") {
                    setAskCancel(order.id);
                    return;
                  }
                  setAskCancel("");
                  setBusy(order.id);
                  const res = await setOrderStatusFn({ data: { businessId, id: order.id, status } });
                  setBusy("");
                  if (!res.ok) {
                    toast.error(res.error);
                    return;
                  }
                  setRows((current) => current?.map((item) => (item.id === order.id ? { ...item, status, cancelReason: status === "cancelled" ? item.cancelReason : "" } : item)) ?? []);
                }}
              />
            </div>
            {askCancel === order.id ? (
              <div className="grid gap-2">
                <p className="text-sm font-semibold">یک دلیل را بزنید تا سفارش لغو شود</p>
                <CancelReasonPick
                  reasons={orderCancelReasons}
                  pending={busy === order.id}
                  onPick={async (reason) => {
                    setBusy(order.id);
                    const res = await setOrderStatusFn({ data: { businessId, id: order.id, status: "cancelled", reason } });
                    setBusy("");
                    if (!res.ok) {
                      toast.error(res.error);
                      return;
                    }
                    setAskCancel("");
                    setRows((current) => current?.map((item) => (item.id === order.id ? { ...item, status: "cancelled", cancelReason: reason } : item)) ?? []);
                  }}
                />
              </div>
            ) : null}
          </article>
        ))}
      </div>
      {hospitality ? (
        <section className="grid gap-3">
          <div>
            <h2 className="text-xl font-bold">رزرو میز</h2>
            <p className="text-sm text-muted">میز تا آزادسازی دوباره برای مشتری باز نمی‌شود</p>
          </div>
          {role === "owner" ? (
            <form
              className="flex flex-wrap items-end gap-2"
              onSubmit={async (event) => {
                event.preventDefault();
                if (!number.trim()) return;
                setBusy("add-table");
                const res = await saveTableFn({ data: { businessId, number } });
                setBusy("");
                if (!res.ok) {
                  toast.error(res.error);
                  return;
                }
                setNumber("");
                setTables((current) => [...current, { id: res.data.id, number: res.data.number, held: false }].sort((a, b) => Number(a.number) - Number(b.number)));
              }}
            >
              <Field label="شماره میز">
                <TextInput value={number} inputMode="numeric" maxLength={4} onChange={(event) => setNumber(event.target.value)} />
              </Field>
              <Button type="submit" disabled={busy === "add-table"}>{busy === "add-table" ? "در حال افزودن" : "افزودن میز"}</Button>
            </form>
          ) : null}
          {tables.length === 0 ? <Empty title="میزی تعریف نشده" body="صاحب کسب‌وکار شماره میزها را اضافه می‌کند." /> : (
            <div className="flex flex-wrap gap-2">
              {tables.map((table) => (
                <div key={table.id} className="flex items-center gap-2 rounded-full border border-line bg-card px-3 py-2 text-sm">
                  <span>میز {faNum(table.number)}</span>
                  <span className="text-muted">{table.held ? "اشغال" : "آزاد"}</span>
                  {role === "owner" && !table.held ? (
                    <button
                      type="button"
                      className="text-xs font-semibold text-danger"
                      onClick={async () => {
                        setBusy(table.id);
                        const res = await deleteTableFn({ data: { businessId, id: table.id } });
                        setBusy("");
                        if (!res.ok) {
                          toast.error(res.error);
                          return;
                        }
                        setTables((current) => current.filter((item) => item.id !== table.id));
                      }}
                    >
                      حذف
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
          {reservations === null ? <Skeleton className="h-24" /> : null}
          {reservations && reservations.length === 0 ? <Empty title="هنوز رزروی نیست" body="وقتی مشتری از صفحه میز رزرو کند، اینجا دیده می‌شود." /> : null}
          <div className="grid gap-3">
            {(reservations ?? []).map((item) => (
              <article key={item.id} className="grid gap-3 rounded-card border border-line bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold">میز {faNum(item.number)} · {item.customer}</h3>
                    <p className="mt-1 text-sm text-muted" dir="ltr">{faNum(item.phone)}</p>
                  </div>
                  <Badge tone={item.status === "cancelled" ? "muted" : item.status === "released" ? "jade" : "copper"}>{tableStatus[item.status] ?? item.status}</Badge>
                </div>
                <p className="text-sm">{formatSlot(item.startsAt)}</p>
                {item.note ? <p className="text-sm leading-6">یادداشت: {item.note}</p> : null}
                {item.status === "cancelled" && item.cancelReason ? <p className="text-sm text-muted">دلیل لغو: {item.cancelReason}</p> : null}
                {item.status === "held" ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      disabled={busy === item.id}
                      onClick={async () => {
                        setBusy(item.id);
                        const res = await releaseTableFn({ data: { businessId, id: item.id } });
                        setBusy("");
                        if (!res.ok) {
                          toast.error(res.error);
                          return;
                        }
                        setReservations((current) => current?.map((row) => row.id === item.id ? { ...row, status: "released" } : row) ?? []);
                        setTables((current) => current.map((table) => table.number === item.number ? { ...table, held: false } : table));
                      }}
                    >
                      {busy === item.id ? "در حال آزادسازی" : "آزادسازی"}
                    </Button>
                    <Button type="button" variant="quiet" onClick={() => setAskTable(askTable === item.id ? "" : item.id)}>لغو رزرو</Button>
                  </div>
                ) : null}
                {askTable === item.id ? (
                  <div className="grid gap-2">
                    <p className="text-sm font-semibold">یک دلیل را بزنید تا رزرو لغو و میز آزاد شود</p>
                    <CancelReasonPick
                      reasons={tableCancelReasons}
                      pending={busy === item.id}
                      onPick={async (reason) => {
                        setBusy(item.id);
                        const res = await cancelTableFn({ data: { businessId, id: item.id, reason } });
                        setBusy("");
                        if (!res.ok) {
                          toast.error(res.error);
                          return;
                        }
                        setAskTable("");
                        setReservations((current) => current?.map((row) => row.id === item.id ? { ...row, status: "cancelled", cancelReason: reason } : row) ?? []);
                        setTables((current) => current.map((table) => table.number === item.number ? { ...table, held: false } : table));
                      }}
                    />
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function WhenEditor({ order, hours, zone, busy, onClose, onSave }: {
  order: Order;
  hours: ShopSpan[];
  zone: string;
  busy: boolean;
  onClose: () => void;
  onSave: (when: "now" | "later", date: string, time: string) => void;
}) {
  const [when, setWhen] = useState<"now" | "later">(order.whenKind === "later" ? "later" : "now");
  const [day, setDay] = useState(order.fulfillAt.slice(0, 10) || todayYmd(zone));
  const [time, setTime] = useState(order.fulfillAt.slice(11, 16));
  const slots = deliverySlots(day, hours, zone);
  return (
    <div className="grid gap-3 rounded-xl border border-line p-3">
      <div className="flex gap-2">
        <Button type="button" variant={when === "now" ? "ink" : "quiet"} onClick={() => setWhen("now")}>هرچه زودتر</Button>
        <Button type="button" variant={when === "later" ? "ink" : "quiet"} disabled={hours.length === 0} onClick={() => setWhen("later")}>زمان مشخص</Button>
      </div>
      {hours.length === 0 ? <p className="text-xs text-muted">اول صاحب کسب‌وکار ساعت کاری را در تنظیمات ذخیره کند.</p> : null}
      {when === "later" ? (
        <>
          <JalaliCalendar value={day} min={todayYmd(zone)} onChange={(next) => { setDay(next); setTime(""); }} />
          {slots.length === 0 ? <p className="text-sm text-muted">در این روز ساعت تحویل باز نیست.</p> : (
            <div className="flex flex-wrap gap-2">
              {slots.map((slot) => (
                <button key={slot} type="button" onClick={() => setTime(slot)} className={`min-h-10 rounded-full px-3 text-sm tabular-nums ${time === slot ? "bg-ink text-on-ink" : "border border-line bg-card"}`}>{faNum(slot)}</button>
              ))}
            </div>
          )}
        </>
      ) : null}
      <div className="flex gap-2">
        <Button type="button" variant="quiet" onClick={onClose}>انصراف</Button>
        <Button type="button" disabled={busy || (when === "later" && !slots.includes(time))} onClick={() => onSave(when, day, time)}>
          {busy ? "در حال ذخیره" : "ذخیره زمان"}
        </Button>
      </div>
    </div>
  );
}
