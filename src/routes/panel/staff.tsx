import { createFileRoute, Link } from "@tanstack/react-router";
import { ImagePlus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { usePanel } from "@/components/account";
import { Badge, Button, Card, Empty, Field, Skeleton, TextInput } from "@/components/ui";
import { PhoneInput } from "@/components/phone-input";
import { WEEKDAYS_FA, clockLabel, enDigits } from "@/lib/booking/fa";
import { fitImage } from "@/lib/fit-image";
import { deleteStaffFn, manageBusinessFn, saveScheduleFn, saveStaffFn } from "@/lib/api";

export const Route = createFileRoute("/panel/staff")({ component: StaffPage });

type Service = { id: string; name: string; active: boolean };
type Staff = {
  id: string;
  name: string;
  title: string;
  phone: string;
  pending?: boolean;
  inviteToken?: string;
  active: boolean;
  photo?: string;
  serviceIds: string[];
  weekly: { weekday: number; startMin: number; endMin: number }[];
  breaks: { weekday: number; startMin: number; endMin: number }[];
};
type Day = {
  weekday: number;
  enabled: boolean;
  ranges: { start: string; end: string }[];
  breakStart: string;
  breakEnd: string;
};

function pad(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function toMin(value: string) {
  const [h, m] = enDigits(value).split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
  return h * 60 + m;
}
function daysOf(person: Staff | null): Day[] {
  return WEEKDAYS_FA.map((_, weekday) => {
    const windows = person?.weekly.filter((item) => item.weekday === weekday) ?? [];
    const rest = person?.breaks.find((item) => item.weekday === weekday);
    const enabled = person ? windows.length > 0 : weekday !== 5;
    return {
      weekday,
      enabled,
      ranges: windows.length ? windows.map((item) => ({ start: pad(item.startMin), end: pad(item.endMin) })) : [{ start: "09:00", end: "18:00" }],
      breakStart: rest ? pad(rest.startMin) : "",
      breakEnd: rest ? pad(rest.endMin) : "",
    };
  });
}

function StaffPage() {
  const { businessId, role } = usePanel();
  const [invite, setInvite] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState("");
  const [active, setActive] = useState(true);
  const [id, setId] = useState("");
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [days, setDays] = useState<Day[]>(daysOf(null));
  const [saving, setSaving] = useState(false);
  const primed = useRef(false);

  function load(biz: string) {
    setLoading(true);
    manageBusinessFn({ data: { businessId: biz } }).then((res) => {
      if (!res.ok) {
        toast.error(res.error);
        setLoading(false);
        return;
      }
      setServices(res.data.services);
      setStaff(res.data.staff);
      setLoading(false);
    });
  }
  useEffect(() => {
    if (businessId) load(businessId);
  }, [businessId]);
  useEffect(() => {
    if (primed.current || id || services.length === 0) return;
    primed.current = true;
    setServiceIds(services.filter((item) => item.active).map((item) => item.id));
  }, [services, id]);

  const selected = useMemo(() => staff.find((item) => item.id === id) ?? null, [staff, id]);

  function edit(person: Staff) {
    setId(person.id);
    setName(person.name);
    setTitle(person.title);
    setPhone(person.phone || "");
    setPhoto(person.photo || "");
    setActive(person.active);
    setServiceIds(person.serviceIds);
    setDays(daysOf(person));
    setInvite(person.inviteToken || "");
  }
  function reset() {
    setId("");
    setName("");
    setPhone("");
    setPhoto("");
    setTitle("");
    setActive(true);
    setServiceIds(services.filter((item) => item.active).map((item) => item.id));
    setDays(daysOf(null));
  }

  if (role === "staff") return <Empty title="دسترسی ندارید" body="پرسنل نمی‌تواند پرسنل جدید اضافه کند." />;
  if (!businessId) return <Empty title="اول کسب‌وکار بسازید" body="پرسنل بعد از ساخت صفحه کسب‌وکار اضافه می‌شوند." />;
  if (loading) return <Skeleton className="h-48" />;
  if (services.length === 0) {
    return <Empty title="اول خدمت بسازید" body="هر پرسنل باید حداقل به یک خدمت وصل شود." action={<Link to="/panel/services" className="inline-flex min-h-11 items-center rounded-xl bg-jade px-4 font-semibold text-on-jade">رفتن به خدمات</Link>} />;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <div className="grid content-start gap-2">
        <Button type="button" variant="quiet" onClick={reset}>پرسنل تازه</Button>
        {staff.length === 0 ? <p className="text-sm text-muted">هنوز پرسنلی ثبت نشده.</p> : null}
        {staff.map((person) => (
          <button key={person.id} type="button" onClick={() => edit(person)} className={`rounded-xl border p-3 text-start ${person.id === id ? "border-jade bg-jade-soft" : "border-line bg-card"}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2 font-semibold">
                {person.photo ? <img src={person.photo} alt="" className="size-8 shrink-0 rounded-full object-cover" /> : null}
                <span className="truncate">{person.name}</span>
              </span>
              {!person.active ? <Badge tone="muted">غیرفعال</Badge> : null}
            </div>
            <p className="text-sm text-muted">{person.title || "بدون عنوان"}{person.pending ? " · در انتظار تأیید" : ""}</p>
          </button>
        ))}
      </div>
      <Card>
        <h2 className="text-lg font-bold">{id ? "ویرایش پرسنل" : "پرسنل تازه"}</h2>
        <p className="mt-1 text-sm text-muted">ساعت کاری جدید برای پرسنل تازه، شنبه تا پنجشنبه ۹ تا ۱۸ است. جمعه تعطیل است. استراحت را خالی بگذارید اگر ندارید.</p>
        <form
          className="mt-4 grid gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!serviceIds.length) {
              toast.error("حداقل یک خدمت را انتخاب کنید");
              return;
            }
            setSaving(true);
            const saved = await saveStaffFn({
              data: { businessId, ...(id ? { id } : {}), name, title, phone, photo, active, serviceIds },
            });
            if (!saved.ok) {
              setSaving(false);
              toast.error(saved.error);
              return;
            }
            const schedule = await saveScheduleFn({
              data: {
                businessId,
                staffId: saved.data.staffId,
                days: days.map((day) => ({
                  weekday: day.weekday,
                  enabled: day.enabled,
                  ranges: day.enabled ? day.ranges.map((range) => ({ startMin: toMin(range.start), endMin: toMin(range.end) })) : [],
                  breakStart: day.breakStart ? toMin(day.breakStart) : "",
                  breakEnd: day.breakEnd ? toMin(day.breakEnd) : "",
                })),
              },
            });
            setSaving(false);
            if (!schedule.ok) {
              toast.error(schedule.error);
              setId(saved.data.staffId);
              load(businessId);
              return;
            }
            toast.success("پرسنل و برنامه ذخیره شد");
            if (saved.data.inviteToken) setInvite(saved.data.inviteToken);
            setId(saved.data.staffId);
            load(businessId);
          }}
        >
          <PhotoField value={photo} onChange={setPhoto} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="نام"><TextInput value={name} onChange={(e) => setName(e.target.value)} required minLength={2} /></Field>
            <Field label="عنوان"><TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثلاً استایلیست" /></Field>
          </div>
          <Field label="شماره موبایل">
            <PhoneInput value={phone} onChange={setPhone} />
          </Field>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">خدمات</legend>
            <div className="flex flex-wrap gap-2">
              {services.map((service) => {
                const on = serviceIds.includes(service.id);
                return (
                  <button
                    key={service.id}
                    type="button"
                    className={`min-h-11 rounded-full px-4 text-sm ${on ? "bg-jade text-on-jade" : "border border-line"}`}
                    onClick={() => setServiceIds(on ? serviceIds.filter((item) => item !== service.id) : [...serviceIds, service.id])}
                  >
                    {service.name}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            برای رزرو در دسترس باشد
          </label>
          <div className="grid gap-2">
            {days.map((day, index) => (
              <div key={day.weekday} className="grid items-center gap-2 rounded-xl bg-paper px-3 py-2 sm:grid-cols-[7rem_4.5rem_1fr_1fr]">
                <span className="text-sm font-medium">{WEEKDAYS_FA[day.weekday]}</span>
                <label className="flex min-h-11 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={day.enabled}
                    onChange={(e) => setDays(days.map((item, i) => (i === index ? { ...item, enabled: e.target.checked } : item)))}
                  />
                  باز
                </label>
                <label className="grid gap-1 text-xs text-muted">
                  شروع تا پایان
                  <span className="grid gap-1">
                    {day.ranges.map((range, rangeIndex) => (
                      <span key={rangeIndex} className="flex gap-1">
                        <TextInput dir="ltr" className="px-2 text-left" disabled={!day.enabled} value={range.start} onChange={(e) => setDays(days.map((item, i) => (i === index ? { ...item, ranges: item.ranges.map((row, n) => (n === rangeIndex ? { ...row, start: e.target.value } : row)) } : item)))} />
                        <TextInput dir="ltr" className="px-2 text-left" disabled={!day.enabled} value={range.end} onChange={(e) => setDays(days.map((item, i) => (i === index ? { ...item, ranges: item.ranges.map((row, n) => (n === rangeIndex ? { ...row, end: e.target.value } : row)) } : item)))} />
                        {day.ranges.length > 1 ? (
                          <button type="button" className="text-xs text-muted" disabled={!day.enabled} onClick={() => setDays(days.map((item, i) => (i === index ? { ...item, ranges: item.ranges.filter((_, n) => n !== rangeIndex) } : item)))}>حذف</button>
                        ) : null}
                      </span>
                    ))}
                    <button type="button" className="text-start text-xs font-semibold text-jade" disabled={!day.enabled} onClick={() => setDays(days.map((item, i) => (i === index ? { ...item, ranges: [...item.ranges, { start: "09:00", end: "18:00" }] } : item)))}>بازه دیگر</button>
                  </span>
                </label>
                <label className="grid gap-1 text-xs text-muted">
                  استراحت
                  <span className="flex gap-1">
                    <TextInput dir="ltr" className="px-2 text-left" disabled={!day.enabled} value={day.breakStart} onChange={(e) => setDays(days.map((item, i) => (i === index ? { ...item, breakStart: e.target.value } : item)))} />
                    <TextInput dir="ltr" className="px-2 text-left" disabled={!day.enabled} value={day.breakEnd} onChange={(e) => setDays(days.map((item, i) => (i === index ? { ...item, breakEnd: e.target.value } : item)))} />
                  </span>
                </label>
              </div>
            ))}
          </div>
          {selected ? (
            <p className="text-sm text-muted">
              برنامه فعلی: {selected.weekly.map((item) => `${WEEKDAYS_FA[item.weekday]} ${clockLabel(item.startMin)}–${clockLabel(item.endMin)}`).join("، ") || "بدون ساعت"}
            </p>
          ) : null}
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>{saving ? "در حال ذخیره" : "ذخیره پرسنل"}</Button>
            {id ? (
              <Button
                type="button"
                variant="danger"
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  const res = await deleteStaffFn({ data: { businessId, id } });
                  setSaving(false);
                  if (!res.ok) {
                    toast.error(res.error);
                    return;
                  }
                  toast.success("پرسنل حذف شد");
                  reset();
                  setInvite("");
                  load(businessId);
                }}
              >
                حذف
              </Button>
            ) : null}
          </div>
          {invite ? (
            <p className="rounded-xl bg-paper px-3 py-2 text-sm leading-6">
              پیامک وصل نیست. این لینک برای پرسنل است تا نامش را تأیید کند و با کد وارد شود:
              <span className="mt-1 block break-all font-semibold" dir="ltr">{typeof window !== "undefined" ? `${window.location.origin}/join/${invite}` : invite}</span>
            </p>
          ) : null}
        </form>
      </Card>
    </div>
  );
}

function PhotoField({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <Field label="عکس" hint="دلخواه">
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          void fitImage(file, 480).then(onChange).catch(() => toast.error("این تصویر باز نشد"));
        }}
      />
      {value ? (
        <div className="relative h-24 w-24 overflow-hidden rounded-full">
          <img src={value} alt="" className="size-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/70 px-2 py-1 text-[10px] font-semibold text-white">
            <button type="button" onClick={() => input.current?.click()}>ویرایش</button>
            <button type="button" onClick={() => onChange("")}>حذف</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => input.current?.click()} className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-full border border-dashed border-line bg-card text-xs font-semibold">
          <ImagePlus className="size-4" />
          عکس
        </button>
      )}
    </Field>
  );
}
