import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { usePanel } from "@/components/account";
import { CustomerFields, emptyCustomer, splitStoredName, type CustomerDraft } from "@/components/customer-form";
import type { CustomGroup } from "@/components/customer-group";
import { Button, Card, Empty, Skeleton, TextInput } from "@/components/ui";
import { faNum } from "@/lib/booking/fa";
import { formatWhen } from "@/lib/booking/format";
import { customersFn, manageBusinessFn, saveCustomerFn } from "@/lib/api";
import { readBookingDefaults } from "@/lib/booking-defaults";
import { isIranMobile, normalizeIranMobile } from "@/lib/iran-phone";

export const Route = createFileRoute("/panel/customers")({ component: CustomersPage });

type Customer = {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  notes: string;
  customerNote?: string;
  birthDate?: string;
  address?: string;
  group?: string;
  visits: number;
  lastVisit: string | null;
};

function CustomersPage() {
  const { businessId } = usePanel();
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const preset = businessId ? readBookingDefaults(businessId) : {};
  const [form, setForm] = useState<CustomerDraft>(emptyCustomer(preset.group || "بدون گروه", preset.address || ""));
  const [groups, setGroups] = useState<CustomGroup[]>([]);
  const addresses = [...new Set(rows.map((row) => row.address?.trim() || "").filter(Boolean))];

  function blank() {
    const saved = businessId ? readBookingDefaults(businessId) : {};
    return emptyCustomer(saved.group || "بدون گروه", saved.address || "");
  }

  function load(id: string, query: string) {
    setLoading(true);
    customersFn({ data: { businessId: id, q: query } }).then((res) => {
      setRows(res.ok ? res.data : []);
      setLoading(false);
      if (!res.ok) toast.error(res.error);
    });
  }
  useEffect(() => {
    if (!businessId) return;
    const presetQuery = sessionStorage.getItem("agent.customers.q");
    if (presetQuery) {
      sessionStorage.removeItem("agent.customers.q");
      setQ(presetQuery);
      load(businessId, presetQuery);
      return;
    }
    load(businessId, "");
  }, [businessId]);
  useEffect(() => {
    if (!businessId) return;
    manageBusinessFn({ data: { businessId } }).then((res) => {
      if (res.ok) setGroups(res.data.customerGroups ?? []);
    });
  }, [businessId]);

  if (!businessId) return <Empty title="اول کسب‌وکار بسازید" body="مشتریان بعد از ساخت صفحه یا اولین رزرو این‌جا می‌آیند." />;

  return (
    <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
      <Card>
        <h2 className="text-lg font-bold">{form.id ? "ویرایش مشتری" : "مشتری حضوری"}</h2>
        <form
          className="mt-4 grid gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            const digits = normalizeIranMobile(form.phone);
            const phone = !digits ? "" : isIranMobile(digits) ? `0${digits}` : null;
            if (phone == null) {
              toast.error("شماره موبایل معتبر نیست");
              return;
            }
            if (form.firstName.trim().length < 2) {
              toast.error("نام را وارد کنید");
              return;
            }
            const res = await saveCustomerFn({
              data: {
                businessId,
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                phone,
                birthDate: form.birthDate,
                address: form.address.trim(),
                customerNote: form.customerNote,
                notes: form.notes,
                group: form.group,
                ...(form.id ? { id: form.id } : {}),
              },
            });
            if (!res.ok) {
              toast.error(res.error);
              return;
            }
            toast.success("ذخیره شد");
            setForm(blank());
            load(businessId, q);
          }}
        >
          <CustomerFields businessId={businessId} draft={form} groups={groups} addresses={addresses} onChange={setForm} onGroups={setGroups} />
          <div className="flex gap-2">
            <Button type="submit">ذخیره</Button>
            {form.id ? <Button type="button" variant="quiet" onClick={() => setForm(blank())}>انصراف</Button> : null}
          </div>
        </form>
      </Card>
      <div className="grid content-start gap-3">
        <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); load(businessId, q); }}>
          <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="جست‌وجوی نام یا تلفن" aria-label="جست‌وجو" />
          <Button type="submit" variant="quiet">جست‌وجو</Button>
        </form>
        {loading ? <Skeleton className="h-24" /> : null}
        {!loading && rows.length === 0 ? <Empty title="مشتری‌ای نیست" body="با رزرو آنلاین یا ثبت دستی، نام این‌جا دیده می‌شود." /> : null}
        {rows.map((row) => {
          const parts = row.firstName ? { firstName: row.firstName, lastName: row.lastName || "" } : splitStoredName(row.name);
          return (
            <button
              key={row.id}
              type="button"
              className="rounded-card border border-line bg-card p-4 text-start hover:border-jade"
              onClick={() => setForm({
                id: row.id,
                firstName: parts.firstName,
                lastName: parts.lastName,
                phone: normalizeIranMobile(row.phone),
                birthDate: row.birthDate || "",
                address: row.address || "",
                group: row.group || "بدون گروه",
                customerNote: row.customerNote || "",
                notes: row.notes,
              })}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold">{row.name}</h3>
                <span className="text-sm text-muted">{faNum(row.visits)} مراجعه</span>
              </div>
              <p className="mt-1 text-sm text-muted" dir="ltr">{row.phone ? faNum(row.phone) : "بدون تلفن"}</p>
              {row.address ? <p className="mt-1 text-sm text-muted">{row.address}</p> : null}
              {row.lastVisit ? <p className="mt-1 text-sm">آخرین نوبت: {formatWhen(row.lastVisit, "Asia/Tehran")}</p> : null}
              {row.customerNote ? <p className="mt-2 text-sm leading-6">برای مشتری: {row.customerNote}</p> : null}
              {row.notes ? <p className="mt-1 text-sm leading-6 text-muted">داخلی: {row.notes}</p> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
