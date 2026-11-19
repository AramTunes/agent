import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { JalaliCalendar } from "@/components/jalali-calendar";
import { PhoneInput } from "@/components/phone-input";
import { Shell } from "@/components/shell";
import { Empty, Field, Skeleton, TextInput } from "@/components/ui";
import { faNum } from "@/lib/booking/fa";
import { formatSlot } from "@/lib/booking/format";
import { todayYmd } from "@/lib/booking/time";
import { publicTablesFn, reserveTableFn } from "@/lib/api";
import { deliverySlots, type ShopSpan } from "@/lib/shop-hours";

type Table = { id: string; number: string };

export function TableReserve({ slug }: { slug: string }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [zone, setZone] = useState("Asia/Tehran");
  const [hours, setHours] = useState<ShopSpan[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [tableId, setTableId] = useState("");
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState("");

  useEffect(() => {
    let live = true;
    publicTablesFn(slug).then((res) => {
      if (!live) return;
      if (!res.ok) {
        setError(res.error);
        setReady(true);
        return;
      }
      const nextZone = res.data.timezone || "Asia/Tehran";
      setName(res.data.name ?? "");
      setZone(nextZone);
      setHours(Array.isArray(res.data.hours) ? res.data.hours : []);
      setTables(Array.isArray(res.data.tables) ? res.data.tables : []);
      setDay(todayYmd(nextZone));
      setReady(true);
    });
    return () => {
      live = false;
    };
  }, [slug]);

  if (!ready) return <Shell><Skeleton className="h-64" /></Shell>;
  if (error) return <Shell><Empty title="رزرو میز ممکن نیست" body={error} /></Shell>;

  const slots = deliverySlots(day, hours, zone);
  const picked = tables.find((item) => item.id === tableId);

  async function submit() {
    if (!tableId) {
      toast.error("میز را انتخاب کنید");
      return;
    }
    if (customer.trim().length < 2) {
      toast.error("نام و نام خانوادگی را وارد کنید");
      return;
    }
    if (!slots.includes(time)) {
      toast.error("یک ساعت داخل ساعت کاری انتخاب کنید");
      return;
    }
    setBusy(true);
    const res = await reserveTableFn({ data: { slug, tableId, name: customer, phone, date: day, time, note } });
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setDone(res.data.number || picked?.number || "");
    setTables((current) => current.filter((item) => item.id !== tableId));
  }

  return (
    <Shell>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">رزرو میز</h1>
          {name ? <p className="text-sm text-muted">{name}</p> : null}
        </div>
        <Link to="/b/$slug" params={{ slug }} className="text-sm font-semibold text-jade">بازگشت</Link>
      </div>
      {done ? (
        <div className="grid gap-3 rounded-card border border-line bg-card p-4">
          <p className="text-lg font-extrabold">میز {faNum(done)} رزرو شد</p>
          <p className="text-sm leading-6 text-muted">تا وقتی {name || "کسب‌وکار"} میز را آزاد کند، این میز برای نفر بعدی باز نمی‌شود.</p>
          <p className="text-sm">{formatSlot(`${day} ${time}`)}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tables.length === 0 ? <Empty title="میز آزادی نیست" body="یا همه‌ی میزها رزرو شده‌اند، یا هنوز میزی تعریف نشده." /> : null}
          {hours.length === 0 ? <p className="text-sm text-muted">ساعت کاری هنوز تنظیم نشده و انتخاب زمان ممکن نیست.</p> : null}
          <div className="flex flex-wrap gap-2">
            {tables.map((table) => (
              <button
                key={table.id}
                type="button"
                onClick={() => setTableId(table.id)}
                className={`min-h-11 rounded-full px-4 text-sm font-semibold ${tableId === table.id ? "bg-ink text-on-ink" : "border border-line bg-card"}`}
              >
                میز {faNum(table.number)}
              </button>
            ))}
          </div>
          <JalaliCalendar value={day} min={todayYmd(zone)} onChange={(next) => { setDay(next); setTime(""); }} />
          {hours.length > 0 && slots.length === 0 ? <p className="text-sm text-muted">در این روز ساعت باز نیست.</p> : null}
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => (
              <button key={slot} type="button" onClick={() => setTime(slot)} className={`min-h-10 rounded-full px-3 text-sm tabular-nums ${time === slot ? "bg-ink text-on-ink" : "border border-line bg-card"}`}>{faNum(slot)}</button>
            ))}
          </div>
          <Field label="نام و نام خانوادگی">
            <TextInput value={customer} maxLength={80} onChange={(event) => setCustomer(event.target.value)} />
          </Field>
          <Field label="شماره موبایل">
            <PhoneInput value={phone} onChange={setPhone} />
          </Field>
          <Field label="یادداشت">
            <TextInput value={note} maxLength={200} onChange={(event) => setNote(event.target.value)} />
          </Field>
          <button type="button" disabled={busy || tables.length === 0 || hours.length === 0} onClick={() => void submit()} className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-4 text-sm font-semibold text-on-ink disabled:opacity-50">
            {busy ? "در حال ثبت" : "رزرو میز"}
          </button>
        </div>
      )}
    </Shell>
  );
}
