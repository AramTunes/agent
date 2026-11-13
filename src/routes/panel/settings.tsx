import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { usePanel } from "@/components/account";
import { JalaliCalendar } from "@/components/jalali-calendar";
import { Button, Card, Empty, Field, Area, Skeleton, TextInput } from "@/components/ui";
import { Select } from "@/components/ui/select";
import { WEEKDAYS_FA, enDigits } from "@/lib/booking/fa";
import { formatDay } from "@/lib/booking/format";
import { todayYmd } from "@/lib/booking/time";
import { addHolidayFn, categoriesFn, deleteBusinessFn, manageBusinessFn, removeHolidayFn, saveShopHoursFn, shopHoursFn, updateBusinessFn } from "@/lib/api";

export const Route = createFileRoute("/panel/settings")({ component: SettingsPage });

type Form = {
  name: string;
  description: string;
  categoryId: string;
  city: string;
  address: string;
  phone: string;
  timezone: string;
  cancelBeforeMinutes: number;
  minLeadMinutes: number;
  maxHorizonDays: number;
  slotStepMinutes: number;
  remindHours: number;
  allowAnyStaff: boolean;
  isDemo: boolean;
  slug: string;
};

function SettingsPage() {
  const { businessId, memberships } = usePanel();
  const role = memberships.find((item) => item.businessId === businessId)?.role;
  const [form, setForm] = useState<Form | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [holidays, setHolidays] = useState<{ id: string; staffId: string | null; date: string; note: string }[]>([]);
  const [staff, setStaff] = useState<{ id: string; name: string }[]>([]);
  const [day, setDay] = useState(todayYmd("Asia/Tehran"));
  const [note, setNote] = useState("");
  const [staffId, setStaffId] = useState("");
  const [confirmName, setConfirmName] = useState("");

  function load(id: string) {
    manageBusinessFn({ data: { businessId: id } }).then((res) => {
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      const data = res.data;
      setForm({
        name: data.name,
        description: data.description,
        categoryId: data.categoryId ?? "",
        city: data.city,
        address: data.address,
        phone: data.phone,
        timezone: data.timezone,
        cancelBeforeMinutes: data.cancelBeforeMinutes,
        minLeadMinutes: data.minLeadMinutes,
        maxHorizonDays: data.maxHorizonDays,
        slotStepMinutes: data.slotStepMinutes,
        remindHours: data.remindHours ?? 1,
        allowAnyStaff: data.allowAnyStaff,
        isDemo: data.isDemo,
        slug: data.slug,
      });
      setHolidays(data.holidays);
      setStaff(data.staff);
      setDay(todayYmd(data.timezone));
    });
  }
  useEffect(() => {
    categoriesFn().then((res) => {
      if (res.ok) setCategories(res.data);
    });
  }, []);
  useEffect(() => {
    if (businessId) load(businessId);
  }, [businessId]);

  if (!businessId) return <Empty title="اول کسب‌وکار بسازید" body="تنظیمات بعد از ساخت صفحه در دسترس است." />;
  if (!form) return <Skeleton className="h-64" />;
  const owner = role === "owner";

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h2 className="text-lg font-bold">مشخصات و سیاست رزرو</h2>
        <p className="mt-1 text-sm text-muted">نشانی عمومی: /b/{form.slug}</p>
        <form
          className="mt-4 grid gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            const res = await updateBusinessFn({
              data: {
                businessId,
                ...form,
                categoryId: form.categoryId,
                cancelBeforeMinutes: Number(form.cancelBeforeMinutes),
                minLeadMinutes: Number(form.minLeadMinutes),
                maxHorizonDays: Number(form.maxHorizonDays),
                slotStepMinutes: Number(form.slotStepMinutes),
                remindHours: Number(form.remindHours),
              },
            });
            if (!res.ok) toast.error(res.error);
            else toast.success("تنظیمات ذخیره شد");
          }}
        >
          <Field label="نام"><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
          <Field label="توضیح"><Area value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <Field label="دسته">
            <Select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              options={[{ value: "", label: "بدون دسته" }, ...categories.map((cat) => ({ value: cat.id, label: cat.name }))]}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="شهر"><TextInput value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
            <Field label="تلفن"><TextInput value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          </div>
          <Field label="آدرس"><TextInput value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
          <Field label="منطقه زمانی"><TextInput value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="مهلت لغو (دقیقه)"><TextInput type="number" min={0} value={form.cancelBeforeMinutes} onChange={(e) => setForm({ ...form, cancelBeforeMinutes: Number(e.target.value) })} /></Field>
            <Field label="حداقل فاصله رزرو (دقیقه)"><TextInput type="number" min={0} value={form.minLeadMinutes} onChange={(e) => setForm({ ...form, minLeadMinutes: Number(e.target.value) })} /></Field>
            <Field label="افق رزرو (روز)"><TextInput type="number" min={1} value={form.maxHorizonDays} onChange={(e) => setForm({ ...form, maxHorizonDays: Number(e.target.value) })} /></Field>
            <Field label="گام نوبت (دقیقه)"><TextInput type="number" min={5} value={form.slotStepMinutes} onChange={(e) => setForm({ ...form, slotStepMinutes: Number(e.target.value) })} /></Field>
            <Field label="یادآوری (ساعت قبل)"><TextInput type="number" min={0} value={form.remindHours} onChange={(e) => setForm({ ...form, remindHours: Number(e.target.value) })} /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.allowAnyStaff} onChange={(e) => setForm({ ...form, allowAnyStaff: e.target.checked })} />
            مشتری بتواند هر پرسنلی را انتخاب کند
          </label>
          <Button type="submit">ذخیره</Button>
        </form>
      </Card>
      <Card>
        <h2 className="text-lg font-bold">تعطیلی</h2>
        <p className="mt-1 text-sm text-muted">روزی که نوبت داده نمی‌شود.</p>
        <div className="mt-4 grid gap-3">
          <JalaliCalendar value={day} onChange={setDay} />
          <Field label="یادداشت"><TextInput value={note} onChange={(e) => setNote(e.target.value)} /></Field>
          <Field label="پرسنل">
            <Select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              options={[{ value: "", label: "همه" }, ...staff.map((person) => ({ value: person.id, label: person.name }))]}
            />
          </Field>
          <Button
            type="button"
            onClick={async () => {
              const res = await addHolidayFn({ data: { businessId, date: day, note, staffId } });
              if (!res.ok) toast.error(res.error);
              else {
                setNote("");
                load(businessId);
              }
            }}
          >
            افزودن تعطیلی
          </Button>
        </div>
        <ul className="mt-4 grid gap-2">
          {holidays.length === 0 ? <li className="text-sm text-muted">تعطیلی ثبت نشده.</li> : null}
          {holidays.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2 text-sm">
              <span>{formatDay(item.date)} · {item.staffId ? staff.find((person) => person.id === item.staffId)?.name ?? "پرسنل" : "همه"} {item.note}</span>
              <Button
                type="button"
                variant="quiet"
                onClick={async () => {
                  const res = await removeHolidayFn({ data: { businessId, holidayId: item.id } });
                  if (!res.ok) toast.error(res.error);
                  else load(businessId);
                }}
              >
                حذف
              </Button>
            </li>
          ))}
        </ul>
      </Card>
      <HoursCard businessId={businessId} owner={owner} />
      {owner ? (
        <Card>
          <h2 className="text-lg font-bold">حذف کسب‌وکار</h2>
          <p className="mt-1 text-sm leading-6 text-muted">نوبت‌ها، خدمات و مشتریان این صفحه پاک می‌شوند. برای تأیید، نام را دقیق بنویسید.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <TextInput value={confirmName} onChange={(e) => setConfirmName(e.target.value)} aria-label="تأیید نام" />
            <Button
              type="button"
              variant="danger"
              disabled={confirmName.trim() !== form.name}
              onClick={async () => {
                const res = await deleteBusinessFn({ data: { businessId } });
                if (!res.ok) {
                  toast.error(res.error);
                  return;
                }
                localStorage.removeItem("agent.business");
                toast.success("حذف شد");
                window.location.assign("/panel");
              }}
            >
              حذف کسب‌وکار
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function pad(mins: number) {
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
}
function toMin(value: string) {
  const [hour, minute] = enDigits(value).split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return 0;
  return hour * 60 + minute;
}

function HoursCard({ businessId, owner }: { businessId: string; owner: boolean }) {
  const [days, setDays] = useState<{ weekday: number; enabled: boolean; start: string; end: string }[] | null>(null);
  useEffect(() => {
    shopHoursFn({ data: { businessId } }).then((res) => {
      const saved = res.ok ? (res.data.hours as { weekday: number; startMin: number; endMin: number }[]) : [];
      setDays(WEEKDAYS_FA.map((_, weekday) => {
        const span = saved.find((item) => item.weekday === weekday);
        const open = saved.length ? Boolean(span) : weekday !== 5;
        return { weekday, enabled: open, start: span ? pad(span.startMin) : "09:00", end: span ? pad(span.endMin) : "21:00" };
      }));
    });
  }, [businessId]);
  if (!days) return <Card><Skeleton className="h-40" /></Card>;
  return (
    <Card>
      <h2 className="text-lg font-bold">ساعت کاری</h2>
      <p className="mt-1 text-sm leading-6 text-muted">مشتری فقط در این ساعت‌ها می‌تواند زمان تحویل را انتخاب کند. تنظیم با صاحب کسب‌وکار است.</p>
      <div className="mt-4 grid gap-2">
        {days.map((day) => (
          <div key={day.weekday} className="flex flex-wrap items-center gap-2 text-sm">
            <label className="flex w-28 items-center gap-2">
              <input
                type="checkbox"
                checked={day.enabled}
                disabled={!owner}
                onChange={(event) => setDays(days.map((item) => item.weekday === day.weekday ? { ...item, enabled: event.target.checked } : item))}
              />
              {WEEKDAYS_FA[day.weekday]}
            </label>
            {day.enabled ? (
              <>
                <TextInput type="time" aria-label={`شروع ${WEEKDAYS_FA[day.weekday]}`} value={day.start} disabled={!owner} className="w-32" onChange={(event) => setDays(days.map((item) => item.weekday === day.weekday ? { ...item, start: event.target.value } : item))} />
                <TextInput type="time" aria-label={`پایان ${WEEKDAYS_FA[day.weekday]}`} value={day.end} disabled={!owner} className="w-32" onChange={(event) => setDays(days.map((item) => item.weekday === day.weekday ? { ...item, end: event.target.value } : item))} />
              </>
            ) : <span className="text-muted">تعطیل</span>}
          </div>
        ))}
      </div>
      {owner ? (
        <Button
          type="button"
          className="mt-4"
          onClick={async () => {
            const res = await saveShopHoursFn({
              data: {
                businessId,
                days: days.filter((day) => day.enabled).map((day) => ({ weekday: day.weekday, startMin: toMin(day.start), endMin: toMin(day.end) })),
              },
            });
            if (!res.ok) toast.error(res.error);
            else toast.success("ساعت کاری ذخیره شد");
          }}
        >
          ذخیره ساعت کاری
        </Button>
      ) : null}
    </Card>
  );
}
