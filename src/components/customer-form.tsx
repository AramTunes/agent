import { useState } from "react";
import { Calendar } from "lucide-react";
import { CustomerGroupField, type CustomGroup } from "@/components/customer-group";
import { JalaliCalendar } from "@/components/jalali-calendar";
import { Area, Field, MobileInput, TextInput } from "@/components/ui";
import { Combobox } from "@/components/ui/combobox";
import { faNum } from "@/lib/booking/fa";
import { gregorianToJalali } from "@/lib/booking/jalali";
import { rememberBookingDefaults } from "@/lib/booking-defaults";

export type CustomerDraft = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  address: string;
  group: string;
  customerNote: string;
  notes: string;
};

export function emptyCustomer(group = "بدون گروه", address = ""): CustomerDraft {
  return { id: "", firstName: "", lastName: "", phone: "", birthDate: "", address, group, customerNote: "", notes: "" };
}

export function splitStoredName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

function stamp(day: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return "";
  const [year, month, date] = day.split("-").map(Number);
  const jalali = gregorianToJalali(year, month, date);
  return faNum(`${jalali.jy}/${String(jalali.jm).padStart(2, "0")}/${String(jalali.jd).padStart(2, "0")}`);
}

function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function CustomerFields({
  businessId,
  draft,
  groups,
  addresses,
  onChange,
  onGroups,
}: {
  businessId: string;
  draft: CustomerDraft;
  groups: CustomGroup[];
  addresses: string[];
  onChange: (next: CustomerDraft) => void;
  onGroups: (groups: CustomGroup[]) => void;
}) {
  const [birthOpen, setBirthOpen] = useState(false);
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field label="نام"><TextInput value={draft.firstName} onChange={(event) => onChange({ ...draft, firstName: event.target.value })} required minLength={2} /></Field>
        <Field label="نام خانوادگی"><TextInput value={draft.lastName} onChange={(event) => onChange({ ...draft, lastName: event.target.value })} /></Field>
      </div>
      <Field label="شماره موبایل"><MobileInput value={draft.phone} onChange={(value) => onChange({ ...draft, phone: value })} /></Field>
      <Field label="تاریخ تولد" hint="اختیاری">
        <button type="button" className="inline-flex h-11 w-full items-center gap-2 rounded-xl border border-line bg-card px-3 text-sm" onClick={() => setBirthOpen((open) => !open)}>
          <Calendar className="size-4 shrink-0 text-muted" />
          <span className={draft.birthDate ? "" : "text-muted"}>{draft.birthDate ? stamp(draft.birthDate) : "انتخاب تاریخ"}</span>
        </button>
        {birthOpen ? (
          <div className="mt-2 rounded-xl border border-line bg-card p-2">
            <JalaliCalendar value={draft.birthDate || today()} max={today()} onChange={(day) => { onChange({ ...draft, birthDate: day }); setBirthOpen(false); }} />
            {draft.birthDate ? <button type="button" className="mt-2 text-sm text-muted" onClick={() => onChange({ ...draft, birthDate: "" })}>حذف تاریخ</button> : null}
          </div>
        ) : null}
      </Field>
      <Field label="آدرس مراجعه">
        <Combobox
          options={addresses}
          value={draft.address}
          onChange={(value) => {
            onChange({ ...draft, address: value });
            if (!draft.id) rememberBookingDefaults(businessId, { address: value });
          }}
          placeholder="آدرس را بنویسید یا انتخاب کنید"
          emptyText="آدرس تازه‌ای است"
        />
      </Field>
      <CustomerGroupField businessId={businessId} groups={groups} value={draft.group} onChange={(value) => { onChange({ ...draft, group: value }); if (!draft.id) rememberBookingDefaults(businessId, { group: value }); }} onGroups={onGroups} manage />
      <Field label="توضیح برای مشتری" hint="این متن برای مشتری است"><Area value={draft.customerNote} onChange={(event) => onChange({ ...draft, customerNote: event.target.value })} /></Field>
      <Field label="توضیح داخلی" hint="فقط برای شما و پرسنل"><Area value={draft.notes} onChange={(event) => onChange({ ...draft, notes: event.target.value })} /></Field>
    </>
  );
}
