import { ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type RefObject } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/switch";
import { Area, Field, Stepper, TextInput } from "@/components/ui";
import { deleteServiceFn, deleteStaffFn, manageBusinessFn, saveScheduleFn, saveServiceFn, saveStaffFn } from "@/lib/api";
import { fitImage } from "@/lib/fit-image";
import { WEEKDAYS_FA, enDigits, faNum, minutesLabel, toman } from "@/lib/booking/fa";

type ServiceRow = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  bufferMinutes: number;
  priceToman: number;
  active: boolean;
};

type Range = { start: string; end: string };
type DayPlan = { weekday: number; enabled: boolean; ranges: Range[] };
type Person = {
  id: string;
  name: string;
  title: string;
  active: boolean;
  photo?: string;
  serviceIds: string[];
  weekly: { weekday: number; startMin: number; endMin: number }[];
};

const dayOrder = [6, 0, 1, 2, 3, 4, 5];
const blankService = { id: "", name: "", description: "", durationMinutes: 45, bufferMinutes: 10, priceToman: 0, active: true };

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

function plansOf(weekly: Person["weekly"] | null): DayPlan[] {
  return dayOrder.map((weekday) => {
    const ranges = (weekly ?? []).filter((item) => item.weekday === weekday).map((item) => ({ start: pad(item.startMin), end: pad(item.endMin) }));
    const enabled = weekly ? ranges.length > 0 : weekday !== 5;
    return { weekday, enabled, ranges: ranges.length ? ranges : [{ start: "09:00", end: "18:00" }] };
  });
}

export function bookingPath(url: string) {
  const value = url.trim().replace(/^\/+|\/+$/g, "");
  if (!value || value.includes("://") || value.includes("/") || value.length > 40) return "";
  return value;
}

type StepFlush = { flush: () => Promise<boolean> };

export function BookingFields({
  businessId,
  slug,
  title,
  body,
  url,
  image,
  onTitle,
  onBody,
  onUrl,
  onImage,
  onBack,
  onSaveBlock,
}: {
  businessId: string;
  slug: string;
  title: string;
  body: string;
  url: string;
  image: string;
  onTitle: (value: string) => void;
  onBody: (value: string) => void;
  onUrl: (value: string) => void;
  onImage: (value: string) => void;
  onBack: () => void;
  onSaveBlock: () => void;
}) {
  const [step, setStep] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const servicesRef = useRef<StepFlush>(null);
  const staffRef = useRef<StepFlush>(null);
  const prefix = slug ? `/b/${slug}/` : "/b/نام‌کاربری/";
  async function next() {
    if (step === 1) {
      const ok = await servicesRef.current?.flush();
      if (!ok) return;
    }
    setStep((value) => value + 1);
  }
  async function finish() {
    const ok = await staffRef.current?.flush();
    if (ok === false) return;
    onSaveBlock();
  }
  return (
    <div>
      <Stepper current={step} steps={[{ label: "معرفی" }, { label: "خدمات" }, { label: "پرسنل" }]} />
      <div className="mt-8">
        {step === 0 ? (
          <IntroStep
            fileRef={fileRef}
            title={title}
            body={body}
            path={bookingPath(url)}
            image={image}
            prefix={prefix}
            onTitle={onTitle}
            onBody={onBody}
            onUrl={onUrl}
            onImage={onImage}
          />
        ) : null}
        {step === 1 ? <ServicesStep ref={servicesRef} businessId={businessId} /> : null}
        {step === 2 ? <StaffStep ref={staffRef} businessId={businessId} /> : null}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        {step < 2 ? (
          <>
            <button type="button" onClick={() => (step === 0 ? onBack() : setStep((value) => value - 1))} className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-paper px-5 text-sm font-semibold">بازگشت</button>
            <button type="button" onClick={() => void next()} className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-on-ink">بعدی</button>
          </>
        ) : (
          <button type="button" onClick={() => void finish()} className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-on-ink">ذخیره</button>
        )}
      </div>
    </div>
  );
}

function IntroStep({
  fileRef,
  title,
  body,
  path,
  image,
  prefix,
  onTitle,
  onBody,
  onUrl,
  onImage,
}: {
  fileRef: RefObject<HTMLInputElement | null>;
  title: string;
  body: string;
  path: string;
  image: string;
  prefix: string;
  onTitle: (value: string) => void;
  onBody: (value: string) => void;
  onUrl: (value: string) => void;
  onImage: (value: string) => void;
}) {
  return (
    <div>
      <Field label="عکس" hint="دلخواه">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            void fitImage(file).then(onImage).catch(() => toast.error("این تصویر باز نشد"));
          }}
        />
        {image ? (
          <div className="relative overflow-hidden rounded-xl">
            <img src={image} alt="" className="h-44 w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/70 px-3 py-2 text-sm font-semibold text-white">
              <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5">
                <ImagePlus className="size-4" aria-hidden="true" />
                ویرایش
              </button>
              <button type="button" onClick={() => onImage("")} className="inline-flex items-center gap-1.5">
                <Trash2 className="size-4" aria-hidden="true" />
                حذف
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} className="flex h-44 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-paper text-sm font-semibold">
            <ImagePlus className="size-5" aria-hidden="true" />
            افزودن از گالری
          </button>
        )}
      </Field>
      <div className="mt-3">
        <Field label="عنوان" hint="دلخواه. اگر خالی بماند، «رزرو نوبت» نوشته می‌شود">
          <TextInput value={title} maxLength={80} onChange={(event) => onTitle(event.target.value)} />
        </Field>
      </div>
      <div className="mt-3">
        <Field label="توضیحات" hint="دلخواه">
          <Area value={body} maxLength={100} className="min-h-16" onChange={(event) => onBody(event.target.value.slice(0, 100))} />
        </Field>
        <p className="mt-1 text-xs tabular-nums text-muted">{faNum(body.length)} از {faNum(100)}</p>
      </div>
      <div className="mt-3">
        <Field label="نشانی صفحه رزرو">
          <div dir="ltr" className="flex min-h-11 overflow-hidden rounded-xl border border-line bg-card">
            <span className="flex items-center bg-paper px-3 text-xs text-muted">{prefix}</span>
            <input
              value={path}
              maxLength={40}
              placeholder="book"
              onChange={(event) => onUrl(event.target.value.replace(/\s/g, "").slice(0, 40))}
              className="min-w-0 flex-1 bg-transparent px-3 text-left text-sm outline-none"
            />
          </div>
        </Field>
      </div>
    </div>
  );
}

const ServicesStep = forwardRef<StepFlush, { businessId: string }>(function ServicesStep({ businessId }, ref) {
  const [items, setItems] = useState<ServiceRow[]>([]);
  const [draft, setDraft] = useState<ServiceRow | null>(null);
  const [saving, setSaving] = useState(false);

  function load() {
    manageBusinessFn({ data: { businessId } }).then((res) => {
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setItems(res.data.services ?? []);
    });
  }
  useEffect(() => {
    if (businessId) load();
  }, [businessId]);

  async function save() {
    if (!draft) return true;
    if (draft.name.trim().length < 2) {
      if (!draft.id && !draft.name.trim() && !draft.description.trim()) {
        setDraft(null);
        return true;
      }
      toast.error("عنوان خدمت را وارد کنید");
      return false;
    }
    setSaving(true);
    const res = await saveServiceFn({
      data: {
        businessId,
        ...(draft.id ? { id: draft.id } : {}),
        name: draft.name.trim(),
        description: draft.description.trim().slice(0, 100),
        durationMinutes: Number(draft.durationMinutes) || 30,
        bufferMinutes: Number(draft.bufferMinutes) || 0,
        priceToman: Number(draft.priceToman) || 0,
        active: draft.active,
      },
    });
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error);
      return false;
    }
    setDraft(null);
    load();
    return true;
  }

  useImperativeHandle(ref, () => ({ flush: save }));

  async function remove(id: string) {
    const res = await deleteServiceFn({ data: { businessId, id } });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    if (draft?.id === id) setDraft(null);
    load();
  }

  return (
    <div className="grid gap-2">
      {items.map((item) => draft?.id === item.id ? (
        <ServiceForm key={item.id} draft={draft} saving={saving} onChange={setDraft} onSave={() => void save()} />
      ) : (
        <ServiceCard key={item.id} item={item} onEdit={() => setDraft(item)} onDelete={() => void remove(item.id)} />
      ))}
      {draft && !draft.id ? (
        <ServiceForm draft={draft} saving={saving} onChange={setDraft} onSave={() => void save()} />
      ) : null}
      {!draft ? (
        <button type="button" onClick={() => setDraft(blankService)} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-semibold">
          <Plus className="size-4" aria-hidden="true" />
          افزودن خدمت جدید
        </button>
      ) : null}
    </div>
  );
});

function ServiceCard({ item, onEdit, onDelete }: { item: ServiceRow; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="rounded-xl border border-line bg-card p-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{item.name}</p>
          <p className="mt-1 text-xs text-muted">
            {minutesLabel(item.durationMinutes)}
            {item.bufferMinutes ? ` · ${minutesLabel(item.bufferMinutes)} آماده‌سازی` : ""}
            {" · "}
            {toman(item.priceToman)}
            {item.active ? "" : " · مخفی در صفحه"}
          </p>
          {item.description ? <p className="mt-1 line-clamp-2 text-sm text-muted">{item.description}</p> : null}
        </div>
        <button type="button" aria-label="ویرایش" onClick={onEdit} className="grid size-8 place-items-center rounded-full text-muted hover:bg-paper"><Pencil className="size-4" /></button>
        <button type="button" aria-label="حذف" onClick={onDelete} className="grid size-8 place-items-center rounded-full text-muted hover:bg-paper"><Trash2 className="size-4" /></button>
      </div>
    </div>
  );
}

function ServiceForm({
  draft,
  saving,
  onChange,
  onSave,
}: {
  draft: ServiceRow;
  saving: boolean;
  onChange: (next: ServiceRow) => void;
  onSave: () => void;
}) {
  return (
    <div className="grid gap-3 rounded-xl border border-line bg-paper p-3">
      <Field label="عنوان خدمت">
        <TextInput value={draft.name} maxLength={80} onChange={(event) => onChange({ ...draft, name: event.target.value })} />
      </Field>
      <Field label="توضیح خدمت">
        <Area value={draft.description} maxLength={100} className="min-h-16" onChange={(event) => onChange({ ...draft, description: event.target.value.slice(0, 100) })} />
      </Field>
      <p className="-mt-1 text-xs tabular-nums text-muted">{faNum(draft.description.length)} از {faNum(100)}</p>
      <div className="grid grid-cols-2 gap-2">
        <Field label="مدت زمان (دقیقه)">
          <TextInput type="number" min={5} max={480} value={draft.durationMinutes} onChange={(event) => onChange({ ...draft, durationMinutes: Number(enDigits(event.target.value)) || 0 })} />
        </Field>
        <Field label="آماده‌سازی (دقیقه)">
          <TextInput type="number" min={0} max={180} value={draft.bufferMinutes} onChange={(event) => onChange({ ...draft, bufferMinutes: Number(enDigits(event.target.value)) || 0 })} />
        </Field>
      </div>
      <Field label="قیمت (تومان)">
        <TextInput type="number" min={0} value={draft.priceToman} onChange={(event) => onChange({ ...draft, priceToman: Number(enDigits(event.target.value)) || 0 })} />
      </Field>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm">این خدمت در صفحه اصلی نمایش داده شود</span>
        <Switch checked={draft.active} onCheckedChange={(active) => onChange({ ...draft, active })} />
      </div>
      <div className="flex justify-end">
        <button type="button" disabled={saving} onClick={onSave} className="inline-flex h-11 items-center rounded-full border border-line bg-card px-4 text-sm font-semibold">{saving ? "در حال ثبت" : "افزودن"}</button>
      </div>
    </div>
  );
}

const StaffStep = forwardRef<StepFlush, { businessId: string }>(function StaffStep({ businessId }, ref) {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [draft, setDraft] = useState<Person | null>(null);
  const [days, setDays] = useState<DayPlan[]>(plansOf(null));
  const [day, setDay] = useState(6);
  const [saving, setSaving] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  function load() {
    manageBusinessFn({ data: { businessId } }).then((res) => {
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setServices(res.data.services ?? []);
      setPeople(res.data.staff ?? []);
    });
  }
  useEffect(() => {
    if (businessId) load();
  }, [businessId]);

  function openNew() {
    setDraft({ id: "", name: "", title: "", active: true, photo: "", serviceIds: services.filter((item) => item.active).map((item) => item.id), weekly: [] });
    setDays(plansOf(null));
    setDay(6);
  }
  function openEdit(person: Person) {
    setDraft(person);
    setDays(plansOf(person.weekly));
    setDay(6);
  }

  async function save() {
    if (!draft) return true;
    if (!draft.id && draft.name.trim().length < 2 && !draft.title.trim()) {
      setDraft(null);
      return true;
    }
    if (draft.name.trim().length < 2) {
      toast.error("نام پرسنل را وارد کنید");
      return false;
    }
    if (draft.serviceIds.length === 0) {
      toast.error("حداقل یک خدمت را انتخاب کنید");
      return false;
    }
    const enabled = days.filter((item) => item.enabled);
    if (enabled.some((item) => item.ranges.length === 0 || item.ranges.some((range) => toMin(range.end) <= toMin(range.start)))) {
      toast.error("ساعت پایان هر بازه باید بعد از شروع باشد");
      return false;
    }
    setSaving(true);
    const saved = await saveStaffFn({
      data: {
        businessId,
        ...(draft.id ? { id: draft.id } : {}),
        name: draft.name.trim(),
        title: draft.title.trim(),
        active: true,
        photo: draft.photo ?? "",
        serviceIds: draft.serviceIds,
      },
    });
    if (!saved.ok) {
      setSaving(false);
      toast.error(saved.error);
      return false;
    }
    const schedule = await saveScheduleFn({
      data: {
        businessId,
        staffId: saved.data.staffId,
        days: days.map((item) => ({
          weekday: item.weekday,
          enabled: item.enabled,
          ranges: item.enabled ? item.ranges.map((range) => ({ startMin: toMin(range.start), endMin: toMin(range.end) })) : [],
        })),
      },
    });
    setSaving(false);
    if (!schedule.ok) {
      toast.error(schedule.error);
      return false;
    }
    setDraft(null);
    load();
    return true;
  }

  useImperativeHandle(ref, () => ({ flush: save }));

  async function remove(id: string) {
    const res = await deleteStaffFn({ data: { businessId, id } });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    if (draft?.id === id) setDraft(null);
    load();
  }

  const selected = days.find((item) => item.weekday === day) ?? days[0];

  return (
    <div className="grid gap-2">
      {services.length === 0 ? <p className="text-sm text-muted">اول در مرحله خدمات، حداقل یک خدمت ذخیره کنید.</p> : null}
      {people.map((person) => draft?.id === person.id ? null : (
        <div key={person.id} className="flex items-center gap-3 rounded-xl border border-line bg-card p-3">
          {person.photo ? <img src={person.photo} alt="" className="size-12 shrink-0 rounded-full object-cover" /> : <span className="grid size-12 shrink-0 place-items-center rounded-full bg-paper text-sm font-semibold">{person.name.slice(0, 1)}</span>}
          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold">{person.name}</span>
            <span className="block truncate text-xs text-muted">{person.title || "بدون عنوان شغلی"}</span>
          </span>
          <button type="button" aria-label="ویرایش" onClick={() => openEdit(person)} className="grid size-8 place-items-center rounded-full text-muted hover:bg-paper"><Pencil className="size-4" /></button>
          <button type="button" aria-label="حذف" onClick={() => void remove(person.id)} className="grid size-8 place-items-center rounded-full text-muted hover:bg-paper"><Trash2 className="size-4" /></button>
        </div>
      ))}
      {draft ? (
        <div className="grid gap-3 rounded-xl border border-line bg-paper p-3">
          <Field label="عکس" hint="دلخواه">
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                void fitImage(file, 480).then((photo) => setDraft({ ...draft, photo })).catch(() => toast.error("این تصویر باز نشد"));
              }}
            />
            {draft.photo ? (
              <div className="relative h-28 w-28 overflow-hidden rounded-full">
                <img src={draft.photo} alt="" className="size-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/70 px-2 py-1 text-[10px] font-semibold text-white">
                  <button type="button" onClick={() => photoRef.current?.click()}>ویرایش</button>
                  <button type="button" onClick={() => setDraft({ ...draft, photo: "" })}>حذف</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => photoRef.current?.click()} className="flex h-28 w-28 flex-col items-center justify-center gap-1 rounded-full border border-dashed border-line bg-card text-xs font-semibold">
                <ImagePlus className="size-4" />
                عکس
              </button>
            )}
          </Field>
          <Field label="نام پرسنل">
            <TextInput value={draft.name} maxLength={80} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          </Field>
          <Field label="عنوان شغلی">
            <TextInput value={draft.title} maxLength={80} placeholder="مثلاً استایلیست" onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
          </Field>
          <Field label="خدمات پرسنل">
            <div className="flex flex-wrap gap-2">
              {services.map((service) => {
                const on = draft.serviceIds.includes(service.id);
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setDraft({ ...draft, serviceIds: on ? draft.serviceIds.filter((id) => id !== service.id) : [...draft.serviceIds, service.id] })}
                    className={`min-h-10 rounded-full px-3 text-sm ${on ? "bg-ink text-on-ink" : "border border-line bg-card"}`}
                  >
                    {service.name}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="روزهای کاری">
            <div className="flex gap-1 overflow-x-auto pb-1">
              {dayOrder.map((weekday) => {
                const plan = days.find((item) => item.weekday === weekday);
                const on = day === weekday;
                return (
                  <button key={weekday} type="button" onClick={() => setDay(weekday)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${on ? "bg-ink text-on-ink" : "border border-line bg-card"} ${plan?.enabled ? "" : "opacity-50"}`}>
                    {WEEKDAYS_FA[weekday]}
                  </button>
                );
              })}
            </div>
            {selected ? (
              <div className="mt-3 grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{WEEKDAYS_FA[selected.weekday]} باز است</span>
                  <Switch checked={selected.enabled} onCheckedChange={(enabled) => setDays(days.map((item) => item.weekday === selected.weekday ? { ...item, enabled } : item))} />
                </div>
                {selected.enabled ? selected.ranges.map((range, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <label className="grid flex-1 gap-1 text-xs text-muted">
                      از ساعت
                      <input type="time" dir="ltr" value={range.start} onChange={(event) => setDays(days.map((item) => item.weekday === selected.weekday ? { ...item, ranges: item.ranges.map((row, i) => i === index ? { ...row, start: event.target.value } : row) } : item))} className="min-h-11 rounded-xl border border-line bg-card px-3 text-left text-sm" />
                    </label>
                    <label className="grid flex-1 gap-1 text-xs text-muted">
                      تا ساعت
                      <input type="time" dir="ltr" value={range.end} onChange={(event) => setDays(days.map((item) => item.weekday === selected.weekday ? { ...item, ranges: item.ranges.map((row, i) => i === index ? { ...row, end: event.target.value } : row) } : item))} className="min-h-11 rounded-xl border border-line bg-card px-3 text-left text-sm" />
                    </label>
                    {selected.ranges.length > 1 ? (
                      <button type="button" aria-label="حذف بازه" onClick={() => setDays(days.map((item) => item.weekday === selected.weekday ? { ...item, ranges: item.ranges.filter((_, i) => i !== index) } : item))} className="mt-5 grid size-9 place-items-center text-muted"><Trash2 className="size-4" /></button>
                    ) : null}
                  </div>
                )) : null}
                {selected.enabled ? (
                  <button type="button" onClick={() => setDays(days.map((item) => item.weekday === selected.weekday ? { ...item, ranges: [...item.ranges, { start: "09:00", end: "18:00" }] } : item))} className="inline-flex h-10 items-center justify-center gap-1 rounded-full border border-line bg-card px-3 text-sm font-semibold">
                    <Plus className="size-4" />
                    بازه جدید
                  </button>
                ) : null}
              </div>
            ) : null}
          </Field>
          <div className="flex justify-end">
            <button type="button" disabled={saving} onClick={() => void save()} className="inline-flex h-11 items-center rounded-full border border-line bg-card px-4 text-sm font-semibold">{saving ? "در حال ثبت" : "افزودن"}</button>
          </div>
        </div>
      ) : null}
      {!draft && services.length > 0 ? (
        <button type="button" onClick={openNew} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-semibold">
          <Plus className="size-4" aria-hidden="true" />
          افزودن پرسنل
        </button>
      ) : null}
    </div>
  );
});
