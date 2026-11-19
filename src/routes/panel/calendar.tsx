import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, Calendar, CalendarPlus, Clock, Plus, UserPlus, UserRound, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { toast } from "sonner";
import { usePanel } from "@/components/account";
import { CustomerFields, emptyCustomer, type CustomerDraft } from "@/components/customer-form";
import { CustomerGroupField, defaultCustomerGroups, type CustomGroup } from "@/components/customer-group";
import { JalaliCalendar } from "@/components/jalali-calendar";
import { AppWindow, useIsDesktop } from "@/components/panel-window";
import { TimeWheel } from "@/components/time-wheel";
import { WeekBoard } from "@/components/week-board";
import { Button, DialogActions, Empty, Field, TextInput, Area } from "@/components/ui";
import { PhoneInput } from "@/components/phone-input";
import { Combobox } from "@/components/ui/combobox";
import { availabilityFn, createBookingFn, customersFn, manageBusinessFn, saveCustomerFn } from "@/lib/api";
import { pickDefault, readBookingDefaults, rememberBookingDefaults } from "@/lib/booking-defaults";
import { faNum } from "@/lib/booking/fa";
import { formatClock } from "@/lib/booking/format";
import { gregorianToJalali, jalaliToGregorian, monthLength } from "@/lib/booking/jalali";
import { civilInZone, todayYmd, ymd } from "@/lib/booking/time";
import { FloatPortal, useFloat } from "@/lib/float";
import { isIranMobile, normalizeIranMobile } from "@/lib/iran-phone";

export const Route = createFileRoute("/panel/calendar")({ component: CalendarPage });

const cardClass = "flex min-h-24 flex-col justify-between rounded-card border border-line bg-card p-4 text-start";

function CalendarPage() {
  const { businessId, role } = usePanel();
  const [zone, setZone] = useState("Asia/Tehran");
  const [weekly, setWeekly] = useState<{ weekday: number; startMin: number; endMin: number }[]>([]);
  const [ready, setReady] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [boardTick, setBoardTick] = useState(0);

  useEffect(() => {
    if (!businessId) return;
    let live = true;
    manageBusinessFn({ data: { businessId } }).then((res) => {
      if (!live || !res.ok) return;
      const hours = (res.data.staff ?? [])
        .filter((person: { active?: boolean }) => person.active !== false)
        .flatMap((person: { weekly?: { weekday: number; startMin: number; endMin: number }[] }) => person.weekly ?? []);
      setZone(res.data.timezone || "Asia/Tehran");
      setWeekly(hours);
      setReady(true);
    });
    return () => {
      live = false;
    };
  }, [businessId]);

  if (!businessId) return <Empty title="اول کسب‌وکار بسازید" body="از خانه پنل یک صفحه بسازید." />;

  return (
    <div className="panel-page grid min-w-0 gap-6">
      <div>
        <h1 className="text-xl font-bold">نوبت‌ها</h1>
        <p className="text-sm text-muted">ثبت نوبت، تخته هفته و وضعیت همان مراجعه</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" className={cardClass} onClick={() => setBookingOpen(true)}>
          <CalendarPlus className="size-5 text-[#ffa640]" aria-hidden="true" />
          <span className="font-bold">ثبت نوبت</span>
        </button>
        <Link to="/panel/bookings" className={cardClass}>
          <Calendar className="size-5 text-[#ffa640]" aria-hidden="true" />
          <span className="font-bold">نوبت‌ها</span>
        </Link>
        <button type="button" className={cardClass} onClick={() => setCustomerOpen(true)}>
          <UserPlus className="size-5 text-[#ffa640]" aria-hidden="true" />
          <span className="font-bold">مشتری جدید</span>
        </button>
        <Link to="/panel/customers" className={cardClass}>
          <Users className="size-5 text-[#ffa640]" aria-hidden="true" />
          <span className="font-bold">مشتریان</span>
        </Link>
        <Link to="/panel/services" className={cardClass}>
          <Briefcase className="size-5 text-[#ffa640]" aria-hidden="true" />
          <span className="font-bold">خدمات</span>
        </Link>
        {role === "staff" ? null : (
        <Link to="/panel/staff" className={cardClass}>
          <UserRound className="size-5 text-[#ffa640]" aria-hidden="true" />
          <span className="font-bold">پرسنل</span>
        </Link>
        )}
      </div>
      {ready ? (
        <WeekBoard
          businessId={businessId}
          timezone={zone}
          weekly={weekly}
          reloadToken={boardTick}
          more={<Link to="/panel/bookings" className="shrink-0 text-sm font-semibold text-[#ffa640]">مشاهده بیشتر</Link>}
          showStaff={role !== "staff"}
        />
      ) : null}
      {bookingOpen ? <BookingDialog businessId={businessId} zone={zone} onClose={() => setBookingOpen(false)} onSaved={() => setBoardTick((value) => value + 1)} /> : null}
      {customerOpen ? <CustomerDialog businessId={businessId} onClose={() => setCustomerOpen(false)} /> : null}
    </div>
  );
}

type Named = { id: string; name: string };
type Person = Named & { title?: string; label: string; serviceIds: string[]; weekly: { weekday: number; startMin: number; endMin: number }[] };
type Holiday = { staffId?: string | null; date: string };
type Customer = { id: string; name: string; phone: string; notes: string; group?: string; label: string };
type Slot = { start: string; taken?: boolean };

function labeledCustomers(rows: { id: string; name: string; phone: string; notes: string }[]): Customer[] {
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(row.name, (counts.get(row.name) ?? 0) + 1);
  return rows.map((row) => ({
    ...row,
    label: (counts.get(row.name) ?? 0) > 1 && row.phone ? `${row.name} · ${row.phone}` : row.name,
  }));
}

function labelStaff(people: Omit<Person, "label">[]): Person[] {
  const nameCount = new Map<string, number>();
  for (const person of people) nameCount.set(person.name, (nameCount.get(person.name) ?? 0) + 1);
  const titled = people.map((person) => {
    const title = person.title?.trim() ?? "";
    const label = (nameCount.get(person.name) ?? 0) > 1 && title ? `${person.name} · ${title}` : person.name;
    return { ...person, label };
  });
  const labelCount = new Map<string, number>();
  for (const person of titled) labelCount.set(person.label, (labelCount.get(person.label) ?? 0) + 1);
  const seen = new Map<string, number>();
  return titled.map((person) => {
    if ((labelCount.get(person.label) ?? 0) < 2) return person;
    const n = (seen.get(person.label) ?? 0) + 1;
    seen.set(person.label, n);
    return { ...person, label: `${person.label} ${faNum(n)}` };
  });
}

function weekdayOf(day: string) {
  return new Date(`${day}T12:00:00Z`).getUTCDay();
}

function monthDays(jy: number, jm: number) {
  return Array.from({ length: monthLength(jy, jm) }, (_, index) => {
    const date = jalaliToGregorian(jy, jm, index + 1);
    return ymd(date.gy, date.gm, date.gd);
  });
}

function dayClosed(day: string, people: Person[], holidays: Holiday[], serviceId: string, staffId: string) {
  const weekday = weekdayOf(day);
  const roster = people.filter((person) => (!serviceId || person.serviceIds.includes(serviceId)) && (!staffId || person.id === staffId));
  if (roster.length === 0) return true;
  if (holidays.some((item) => item.date === day && !item.staffId)) return true;
  return !roster.some((person) => {
    if (holidays.some((item) => item.date === day && item.staffId === person.id)) return false;
    return person.weekly.some((span) => span.weekday === weekday && span.endMin > span.startMin);
  });
}

function savedPhone(value: string) {
  const digits = normalizeIranMobile(value);
  if (!digits) return "";
  if (!isIranMobile(digits)) return null;
  return `0${digits}`;
}

function jalaliStamp(day: string) {
  const [year, month, date] = day.split("-").map(Number);
  const jalali = gregorianToJalali(year, month, date);
  return faNum(`${jalali.jy}/${String(jalali.jm).padStart(2, "0")}/${String(jalali.jd).padStart(2, "0")}`);
}

const triggerClass = "inline-flex h-11 w-full items-center justify-start gap-2 rounded-xl border border-line bg-card px-3 text-sm font-normal disabled:opacity-50";

function BookingDialog({ businessId, zone, onClose, onSaved }: { businessId: string; zone: string; onClose: () => void; onSaved?: () => void }) {
  const { role, staffId: mine } = usePanel();
  const today = todayYmd(zone);
  const [day, setDay] = useState("");
  const [services, setServices] = useState<Named[]>([]);
  const [staff, setStaff] = useState<Person[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [serviceName, setServiceName] = useState("");
  const [staffName, setStaffName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [phone, setPhone] = useState("");
  const [group, setGroup] = useState("بدون گروه");
  const [groups, setGroups] = useState<CustomGroup[]>([]);
  const [notes, setNotes] = useState("");
  const [start, setStart] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [pending, setPending] = useState(false);
  const [picker, setPicker] = useState<"" | "date" | "time">("");
  const [draftDay, setDraftDay] = useState("");
  const [draftTime, setDraftTime] = useState<{ hour: number; minute: number } | null>(null);
  const [month, setMonth] = useState<{ jy: number; jm: number } | null>(null);
  const [full, setFull] = useState<Record<string, boolean>>({});
  const [checking, setChecking] = useState(false);
  const dateAnchor = useRef<HTMLButtonElement>(null);
  const timeAnchor = useRef<HTMLButtonElement>(null);

  const serviceId = services.find((item) => item.name === serviceName)?.id ?? "";
  const staffId = staff.find((item) => item.label === staffName)?.id ?? "";
  const known = useMemo(() => customers.find((item) => item.id === customerId) ?? null, [customers, customerId]);
  const closed = useCallback((value: string) => dayClosed(value, staff, holidays, serviceId, staffId), [staff, holidays, serviceId, staffId]);
  const free = slots.filter((slot) => !slot.taken);
  const times = free.map((slot) => {
    const civil = civilInZone(new Date(slot.start), zone);
    return { start: slot.start, hour: civil.hour, minute: civil.minute };
  });
  const hours = [...new Set(times.map((item) => item.hour))].sort((a, b) => a - b);
  const current = times.find((item) => item.start === start) ?? times[0];
  const minutes = times.filter((item) => item.hour === (draftTime?.hour ?? current?.hour)).map((item) => item.minute);

  useEffect(() => {
    manageBusinessFn({ data: { businessId } }).then((res) => {
      if (!res.ok) return;
      const nextServices = res.data.services.filter((item: { active: boolean }) => item.active).map((item: Named) => ({ id: item.id, name: item.name }));
      const roster = (res.data.staff as { active?: boolean; id: string; name: string; title?: string; serviceIds?: string[]; weekly?: Person["weekly"] }[])
        .filter((item) => item.active !== false)
        .filter((item) => role !== "staff" || !mine || item.id === mine)
        .map((item) => ({
          id: item.id,
          name: item.name,
          title: item.title,
          serviceIds: item.serviceIds ?? [],
          weekly: item.weekly ?? [],
        }));
      const nextStaff = labelStaff(roster);
      const saved = readBookingDefaults(businessId);
      setServices(nextServices);
      setStaff(nextStaff);
      setServiceName(pickDefault(saved.service, nextServices.map((item: Named) => item.name), nextServices[0]?.name ?? ""));
      setStaffName(pickDefault(saved.staff, nextStaff.map((item) => item.label), nextStaff[0]?.label ?? ""));
      const nextGroups = (res.data.customerGroups ?? []) as CustomGroup[];
      const groupNames = [...defaultCustomerGroups, ...nextGroups.map((item) => item.name).filter((name) => !defaultCustomerGroups.includes(name))];
      setGroups(nextGroups);
      setGroup(pickDefault(saved.group, groupNames, "بدون گروه"));
      setHolidays((res.data.holidays ?? []).map((item: Holiday) => ({ staffId: item.staffId || "", date: String(item.date).slice(0, 10) })));
    });
    customersFn({ data: { businessId, q: "" } }).then((res) => {
      if (res.ok) setCustomers(labeledCustomers(res.data));
    });
  }, [businessId, role, mine]);

  useEffect(() => {
    if (!serviceId || !day) {
      setSlots([]);
      return;
    }
    let live = true;
    availabilityFn({ data: { businessId, serviceId, staffId, day } }).then((res) => {
      if (!live) return;
      setSlots(res.ok ? res.data.slots : []);
    });
    return () => {
      live = false;
    };
  }, [businessId, serviceId, staffId, day]);

  const onMonth = useCallback((jy: number, jm: number) => {
    setMonth((currentMonth) => (currentMonth?.jy === jy && currentMonth.jm === jm ? currentMonth : { jy, jm }));
  }, []);

  useEffect(() => {
    if (picker !== "date" || !serviceId || !month) return;
    let live = true;
    const days = monthDays(month.jy, month.jm).filter((value) => value >= today && !dayClosed(value, staff, holidays, serviceId, staffId));
    setChecking(true);
    Promise.all(days.map(async (value) => {
      const res = await availabilityFn({ data: { businessId, serviceId, staffId, day: value } });
      const open = res.ok && Array.isArray(res.data?.slots) && res.data.slots.some((slot: Slot) => !slot.taken);
      return [value, !open] as const;
    })).then((pairs) => {
      if (!live) return;
      setFull(Object.fromEntries(pairs));
      setChecking(false);
    });
    return () => {
      live = false;
    };
  }, [picker, month, serviceId, staffId, businessId, today, staff, holidays]);

  function pickCustomer(value: string) {
    setCustomerName(value);
    const hit = customers.find((item) => item.label === value);
    if (hit) {
      setCustomerId(hit.id);
      setPhone(normalizeIranMobile(hit.phone));
      setNotes(hit.notes);
      setGroup(hit.group || "بدون گروه");
      return;
    }
    if (customerId) {
      setPhone("");
      setNotes("");
      setGroup(readBookingDefaults(businessId).group || "بدون گروه");
    }
    setCustomerId("");
  }

  function chooseHour(hour: number) {
    const next = times.find((item) => item.hour === hour);
    if (next) setDraftTime({ hour, minute: next.minute });
  }

  function chooseMinute(minute: number) {
    if (times.some((item) => item.hour === draftTime?.hour && item.minute === minute)) setDraftTime((currentTime) => currentTime ? { ...currentTime, minute } : currentTime);
  }

  return (
    <>
      <AppWindow title="ثبت نوبت" onClose={onClose} closeOnEscape={!picker}>
        <form
          className="grid gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            const name = (known?.name || customerName).trim();
            const mobile = savedPhone(phone);
            if (name.length < 2 || !serviceId || !staffId || !start) return;
            if (mobile == null) {
              toast.error("شماره موبایل معتبر نیست");
              return;
            }
            setPending(true);
            const same = known && mobile === known.phone && group === (known.group || "بدون گروه");
            if (!same) {
              const saved = await saveCustomerFn({
                data: { businessId, name: known?.name || name, phone: mobile, group, ...(known ? { id: known.id } : {}) },
              });
              if (!saved.ok) {
                setPending(false);
                toast.error(saved.error);
                return;
              }
            }
            const res = await createBookingFn({
              data: {
                businessId,
                serviceId,
                staffId,
                start,
                note: notes,
                manual: true,
                customerName: name,
                customerPhone: mobile,
                idempotencyKey: `desk-${crypto.randomUUID()}`,
              },
            });
            setPending(false);
            if (!res.ok) {
              toast.error(res.error);
              return;
            }
            toast.success(known ? "نوبت دستی ثبت شد" : "مشتری و نوبت ثبت شد");
            onSaved?.();
            onClose();
          }}
        >
          <Field
            label="خدمت"
            action={<Link to="/panel/services" aria-label="افزودن خدمت" onClick={onClose} className="grid size-7 place-items-center rounded-full text-ink hover:bg-paper"><Plus className="size-4" /></Link>}
          >
            <Combobox strict options={services.map((item) => item.name)} value={serviceName} onChange={(value) => { setServiceName(value); rememberBookingDefaults(businessId, { service: value }); setStart(""); setDay(""); }} placeholder="انتخاب خدمت" emptyText="خدمتی با این نام نیست" />
          </Field>
          <Field
            label="پرسنل"
            action={role === "staff" ? null : <Link to="/panel/staff" aria-label="افزودن پرسنل" onClick={onClose} className="grid size-7 place-items-center rounded-full text-ink hover:bg-paper"><Plus className="size-4" /></Link>}
          >
            {role === "staff" ? (
              <div className="flex min-h-11 items-center rounded-xl border border-line bg-card px-3 text-sm">{staffName || "پرسنل شما"}</div>
            ) : (
            <Combobox strict options={staff.map((item) => item.label)} value={staffName} onChange={(value) => { setStaffName(value); rememberBookingDefaults(businessId, { staff: value }); setStart(""); setDay(""); }} placeholder="انتخاب پرسنل" emptyText="پرسنلی با این نام نیست" />
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="تاریخ">
              <button ref={dateAnchor} type="button" className={triggerClass} disabled={!serviceId} onClick={() => { setDraftDay(day); setPicker("date"); }}>
                <Calendar className="size-4 shrink-0 text-muted" />
                <span className={day ? "" : "text-muted"}>{day ? jalaliStamp(day) : serviceId ? "انتخاب تاریخ" : "اول خدمت"}</span>
              </button>
            </Field>
            <Field label="ساعت">
              <button
                ref={timeAnchor}
                type="button"
                className={triggerClass}
                disabled={!day || free.length === 0}
                onClick={() => {
                  const base = current ?? times[0];
                  if (!base) return;
                  setDraftTime({ hour: base.hour, minute: base.minute });
                  setPicker("time");
                }}
              >
                <Clock className="size-4 shrink-0 text-muted" />
                <span className={start ? "" : "text-muted"}>{start ? formatClock(start, zone) : day && free.length === 0 ? "پر است" : "انتخاب زمان"}</span>
              </button>
            </Field>
          </div>
          <Field label="نام مشتری">
            <Combobox options={customers.map((item) => item.label)} value={customerName} onChange={pickCustomer} placeholder="نام مشتری را بنویسید" emptyText="مشتری تازه‌ای است؛ بقیه اطلاعات را وارد کنید" />
          </Field>
          <Field label="شماره موبایل"><PhoneInput value={phone} onChange={setPhone} /></Field>
          <CustomerGroupField businessId={businessId} groups={groups} value={group} onChange={(value) => { setGroup(value); rememberBookingDefaults(businessId, { group: value }); }} onGroups={setGroups} />
          <Field label="یادداشت"><Area value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
          <DialogActions>
            <Button type="button" variant="quiet" onClick={onClose}>انصراف</Button>
            <Button type="submit" disabled={pending || !start || (known?.name || customerName).trim().length < 2 || !serviceId || !staffId}>{pending ? "در حال ثبت" : "ثبت نوبت"}</Button>
          </DialogActions>
        </form>
      </AppWindow>
      {picker === "date" ? (
        <PickerFrame open anchor={dateAnchor} onCancel={() => setPicker("")} confirmDisabled={!draftDay || closed(draftDay) || full[draftDay] === true} onConfirm={() => { setDay(draftDay); setStart(""); setPicker(""); }}>
          <JalaliCalendar
            plain
            value={draftDay}
            min={today}
            onMonth={onMonth}
            disabledDay={(value) => closed(value) || full[value] === true}
            dayTitle={(value) => (closed(value) ? "ساعت کاری ندارد" : full[value] ? "این روز پر است" : undefined)}
            onChange={setDraftDay}
          />
          {checking ? <p className="mt-2 text-center text-xs text-muted">در حال بررسی روزهای پر</p> : null}
        </PickerFrame>
      ) : null}
      {picker === "time" && draftTime ? (
        <PickerFrame
          open
          anchor={timeAnchor}
          onCancel={() => setPicker("")}
          onConfirm={() => {
            const match = times.find((item) => item.hour === draftTime.hour && item.minute === draftTime.minute);
            if (match) setStart(match.start);
            setPicker("");
          }}
        >
          <TimeWheel hours={hours} hour={draftTime.hour} minutes={minutes.length ? minutes : [draftTime.minute]} minute={draftTime.minute} onHour={chooseHour} onMinute={chooseMinute} />
        </PickerFrame>
      ) : null}
    </>
  );
}

function CustomerDialog({ businessId, onClose }: { businessId: string; onClose: () => void }) {
  const saved = readBookingDefaults(businessId);
  const [form, setForm] = useState<CustomerDraft>(emptyCustomer(saved.group || "بدون گروه", saved.address || ""));
  const [groups, setGroups] = useState<CustomGroup[]>([]);
  const [addresses, setAddresses] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  useEffect(() => {
    manageBusinessFn({ data: { businessId } }).then((res) => {
      if (res.ok) setGroups(res.data.customerGroups ?? []);
    });
    customersFn({ data: { businessId, q: "" } }).then((res) => {
      if (!res.ok) return;
      const found = (res.data as { address?: string }[]).map((row) => row.address?.trim() || "").filter(Boolean);
      setAddresses([...new Set(found)]);
    });
  }, [businessId]);
  return (
    <AppWindow title="اضافه کردن مشتری جدید" onClose={onClose}>
      <form
        className="grid gap-3"
        onSubmit={async (event) => {
          event.preventDefault();
          const mobile = savedPhone(form.phone);
          if (mobile == null) {
            toast.error("شماره موبایل معتبر نیست");
            return;
          }
          if (form.firstName.trim().length < 2) {
            toast.error("نام را وارد کنید");
            return;
          }
          setPending(true);
          const res = await saveCustomerFn({
            data: {
              businessId,
              firstName: form.firstName.trim(),
              lastName: form.lastName.trim(),
              phone: mobile,
              birthDate: form.birthDate,
              address: form.address.trim(),
              customerNote: form.customerNote,
              notes: form.notes,
              group: form.group,
            },
          });
          setPending(false);
          if (!res.ok) {
            toast.error(res.error);
            return;
          }
          toast.success("مشتری ثبت شد");
          onClose();
        }}
      >
        <CustomerFields businessId={businessId} draft={form} groups={groups} addresses={addresses} onChange={setForm} onGroups={setGroups} />
        <DialogActions>
          <Button type="button" variant="quiet" onClick={onClose}>انصراف</Button>
          <Button type="submit" disabled={pending}>{pending ? "در حال ثبت" : "اضافه کردن مشتری جدید"}</Button>
        </DialogActions>
      </form>
    </AppWindow>
  );
}

function PickerFrame({
  open,
  anchor,
  onCancel,
  onConfirm,
  confirmDisabled,
  children,
}: {
  open: boolean;
  anchor: RefObject<HTMLButtonElement | null>;
  onCancel: () => void;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  children: ReactNode;
}) {
  const desktop = useIsDesktop();
  const { mounted, style, theme, panel } = useFloat(open && desktop, anchor, { gap: 6, align: "center" });
  const actions = (
    <div className={`flex gap-2 border-t border-line p-3 ${desktop ? "justify-end" : ""}`}>
      <Button type="button" variant="quiet" className={desktop ? "" : "flex-1"} onClick={onCancel}>انصراف</Button>
      <Button type="button" className={desktop ? "" : "flex-1"} disabled={confirmDisabled} onClick={onConfirm}>تأیید</Button>
    </div>
  );
  if (!open) return null;
  if (!desktop) {
    return (
      <div className="fixed inset-0 z-[80]">
        <button type="button" className="absolute inset-0 bg-black/40" aria-label="بستن" onClick={onCancel} />
        <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border border-line bg-card shadow-xl">
          <div className="flex justify-center pt-2"><span className="block h-1.5 w-10 rounded-full bg-muted/50" /></div>
          <div className="px-3 pt-2">{children}</div>
          {actions}
        </div>
      </div>
    );
  }
  return (
    <FloatPortal open={open} mounted={mounted} style={style} theme={theme} panelRef={panel} className="fixed z-[80]">
      <div className="w-80 overflow-hidden rounded-xl border border-line bg-card p-0 shadow-lg">
        <div className="p-2">{children}</div>
        {actions}
      </div>
    </FloatPortal>
  );
}

