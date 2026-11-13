import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, ChevronsUpDown, Eye, MoreHorizontal, Pencil, Phone, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { usePanel } from "@/components/account";
import { CustomerFields, emptyCustomer, splitStoredName, type CustomerDraft } from "@/components/customer-form";
import type { CustomGroup } from "@/components/customer-group";
import { defaultCustomerGroups } from "@/components/customer-group";
import { Badge, Button, DialogActions, Empty, Skeleton, TextInput } from "@/components/ui";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { faNum, STATUS_FA } from "@/lib/booking/fa";
import { formatWhen } from "@/lib/booking/format";
import { gregorianToJalali } from "@/lib/booking/jalali";
import { customerFileFn, customersFn, deleteCustomerFn, manageBusinessFn, saveCustomerFn } from "@/lib/api";
import { readBookingDefaults } from "@/lib/booking-defaults";
import { enDigits, isIranMobile, normalizeIranMobile } from "@/lib/iran-phone";

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

type SortKey = "name" | "group" | "visits" | "last";

const pageSize = 8;

function groupOf(row: Customer) {
  return row.group?.trim() || "بدون گروه";
}

function CustomersPage() {
  const { businessId } = usePanel();
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<Customer[] | null>(null);
  const [zone, setZone] = useState("Asia/Tehran");
  const [groups, setGroups] = useState<CustomGroup[]>([]);
  const [form, setForm] = useState<CustomerDraft | null>(null);
  const [viewing, setViewing] = useState<Customer | null>(null);
  const [pending, setPending] = useState(false);
  const [removing, setRemoving] = useState<Customer | null>(null);

  function blank() {
    const saved = businessId ? readBookingDefaults(businessId) : {};
    return emptyCustomer(saved.group || "بدون گروه", saved.address || "");
  }

  async function reload(id: string) {
    const res = await customersFn({ data: { businessId: id, q: "" } });
    setRows(res.ok ? res.data : []);
    if (!res.ok) toast.error(res.error);
  }

  useEffect(() => {
    const preset = sessionStorage.getItem("agent.customers.q");
    if (!preset) return;
    sessionStorage.removeItem("agent.customers.q");
    setQ(preset);
  }, []);

  useEffect(() => {
    if (!businessId) return;
    let live = true;
    customersFn({ data: { businessId, q: "" } }).then((res) => {
      if (!live) return;
      setRows(res.ok ? res.data : []);
      if (!res.ok) toast.error(res.error);
    });
    manageBusinessFn({ data: { businessId } }).then((res) => {
      if (!live || !res.ok) return;
      setGroups(res.data.customerGroups ?? []);
      setZone(res.data.timezone || "Asia/Tehran");
    });
    return () => {
      live = false;
    };
  }, [businessId]);

  const addresses = useMemo(
    () => [...new Set((rows ?? []).map((row) => row.address?.trim() || "").filter(Boolean))],
    [rows],
  );
  const groupOptions = useMemo(() => {
    const names = [...defaultCustomerGroups];
    for (const item of groups) {
      if (!names.includes(item.name)) names.push(item.name);
    }
    for (const row of rows ?? []) {
      const name = groupOf(row);
      if (!names.includes(name)) names.push(name);
    }
    return names;
  }, [rows, groups]);
  const visible = useMemo(() => {
    const needle = enDigits(q).trim().toLowerCase();
    const list = (rows ?? []).filter((row) => {
      if (group !== "all" && groupOf(row) !== group) return false;
      if (!needle) return true;
      const hay = `${row.name} ${row.phone} ${enDigits(row.phone)} ${row.address || ""} ${row.notes} ${row.customerNote || ""} ${row.birthDate || ""}`.toLowerCase();
      return hay.includes(needle);
    });
    if (!sort) return list;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      if (sort.key === "visits") return (a.visits - b.visits) * dir;
      if (sort.key === "last") {
        const left = a.lastVisit ? Date.parse(a.lastVisit) : 0;
        const right = b.lastVisit ? Date.parse(b.lastVisit) : 0;
        return (left - right) * dir;
      }
      const left = sort.key === "name" ? a.name : groupOf(a);
      const right = sort.key === "name" ? b.name : groupOf(b);
      return left.localeCompare(right, "fa") * dir;
    });
  }, [rows, group, sort, q]);

  useEffect(() => {
    setPage(1);
  }, [q, group, sort]);

  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = visible.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const withVisits = (rows ?? []).filter((row) => row.visits > 0).length;
  const visitTotal = (rows ?? []).reduce((sum, row) => sum + row.visits, 0);
  const withoutPhone = (rows ?? []).filter((row) => !row.phone.trim()).length;

  function openEdit(row: Customer) {
    const parts = row.firstName ? { firstName: row.firstName, lastName: row.lastName || "" } : splitStoredName(row.name);
    setForm({
      id: row.id,
      firstName: parts.firstName,
      lastName: parts.lastName,
      phone: normalizeIranMobile(row.phone),
      birthDate: row.birthDate || "",
      address: row.address || "",
      group: row.group || "بدون گروه",
      customerNote: row.customerNote || "",
      notes: row.notes,
    });
  }

  function toggleSort(key: SortKey) {
    setSort((current) => {
      if (!current || current.key !== key) return { key, dir: "asc" };
      if (current.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  }

  if (!businessId) return <Empty title="اول کسب‌وکار بسازید" body="مشتریان بعد از ساخت صفحه یا اولین رزرو این‌جا می‌آیند." />;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">مشتریان</h1>
          <p className="text-sm text-muted">نام، شماره، گروه و نوبت‌های مشتری‌های شما</p>
        </div>
        <Button type="button" onClick={() => setForm(blank())}>
          <Plus className="size-4" />
          مشتری جدید
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="کل مشتریان" value={faNum(rows?.length ?? 0)} />
        <Stat label="با نوبت" value={faNum(withVisits)} />
        <Stat label="مجموع مراجعات" value={faNum(visitTotal)} />
        <Stat label="بدون شماره" value={faNum(withoutPhone)} />
      </div>

      <section className="min-w-0 overflow-hidden rounded-card border border-line bg-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
          <TextInput
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="نام، شماره، آدرس یا یادداشت"
            aria-label="جست‌وجو"
            className="max-w-xs"
          />
          <div className="w-44">
            <Select
              value={group}
              onChange={(event) => setGroup(event.target.value)}
              aria-label="گروه"
              options={[{ value: "all", label: "همه گروه‌ها" }, ...groupOptions.map((name) => ({ value: name, label: name }))]}
            />
          </div>
        </div>
        {rows === null ? <Skeleton className="m-3 h-40" /> : null}
        {rows && visible.length === 0 ? (
          <Empty title="مشتری‌ای نیست" body={q || group !== "all" ? "با این جست‌وجو یا گروه کسی پیدا نشد." : "با رزرو آنلاین یا ثبت دستی، نام این‌جا دیده می‌شود."} />
        ) : null}
        {rows && visible.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line text-muted">
                    <th className="px-3 py-2 text-start font-medium"><SortButton label="مشتری" active={sort?.key === "name" ? sort.dir : null} onClick={() => toggleSort("name")} /></th>
                    <th className="px-3 py-2 text-start font-medium">تماس</th>
                    <th className="px-3 py-2 text-start font-medium"><SortButton label="گروه" active={sort?.key === "group" ? sort.dir : null} onClick={() => toggleSort("group")} /></th>
                    <th className="px-3 py-2 text-start font-medium"><SortButton label="مراجعات" active={sort?.key === "visits" ? sort.dir : null} onClick={() => toggleSort("visits")} /></th>
                    <th className="px-3 py-2 text-start font-medium"><SortButton label="آخرین مراجعه" active={sort?.key === "last" ? sort.dir : null} onClick={() => toggleSort("last")} /></th>
                    <th className="hidden w-28 px-2 py-2 lg:table-cell"><span className="sr-only">عملیات</span></th>
                    <th className="w-10 px-2 py-2 lg:hidden"><span className="sr-only">عملیات</span></th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((row) => (
                    <tr key={row.id} className="border-b border-line last:border-b-0 hover:bg-paper">
                      <td className="px-3 py-2.5">
                        <span className="flex items-center gap-2">
                          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-jade-soft text-xs font-bold text-jade-deep">
                            {row.name.trim().slice(0, 1) || "؟"}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-medium">{row.name}</span>
                            {row.address ? <span className="block truncate text-xs text-muted">{row.address}</span> : null}
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        {row.phone ? (
                          <span className="inline-flex items-center gap-1 tabular-nums" dir="ltr">
                            <Phone className="size-3.5 text-muted" />
                            {faNum(row.phone)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted">بدون شماره</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge tone={groupOf(row) === "مشتریان ویژه" ? "jade" : groupOf(row) === "بدون گروه" ? "muted" : "copper"}>{groupOf(row)}</Badge>
                      </td>
                      <td className="px-3 py-2.5 tabular-nums">{faNum(row.visits)}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">{row.lastVisit ? formatWhen(row.lastVisit, zone) : "—"}</td>
                      <td className="hidden px-2 py-2.5 lg:table-cell">
                        <RowActions onView={() => setViewing(row)} onEdit={() => openEdit(row)} onDelete={() => setRemoving(row)} />
                      </td>
                      <td className="px-2 py-2.5 lg:hidden">
                        <RowMenu onView={() => setViewing(row)} onEdit={() => openEdit(row)} onDelete={() => setRemoving(row)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center border-t border-line px-3 py-3">
              <Pagination page={currentPage} total={totalPages} onChange={setPage} />
            </div>
          </>
        ) : null}
      </section>

      {viewing ? <CustomerView customer={viewing} zone={zone} businessId={businessId} onClose={() => setViewing(null)} /> : null}
      {form ? (
        <CustomerDialog
          draft={form}
          groups={groups}
          addresses={addresses}
          businessId={businessId}
          pending={pending}
          onChange={setForm}
          onGroups={setGroups}
          onClose={() => setForm(null)}
          onSubmit={async () => {
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
            setPending(true);
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
            setPending(false);
            if (!res.ok) {
              toast.error(res.error);
              return;
            }
            toast.success("ذخیره شد");
            setForm(null);
            await reload(businessId);
          }}
        />
      ) : null}

      {removing ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => { if (!pending) setRemoving(null); }}>
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-customer-title"
            className="grid w-full max-w-sm gap-4 rounded-[1.375rem] border border-line bg-card p-5 text-ink shadow-[0_20px_50px_-20px_rgb(0_0_0/0.8)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div>
              <h2 id="delete-customer-title" className="text-lg font-bold">حذف مشتری</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{removing.name} از فهرست حذف شود؟ نوبت‌های ثبت‌شده پاک نمی‌شوند.</p>
            </div>
            <DialogActions>
              <Button type="button" variant="quiet" disabled={pending} onClick={() => setRemoving(null)}>انصراف</Button>
              <Button
                type="button"
                variant="danger"
                disabled={pending}
                onClick={async () => {
                  setPending(true);
                  const res = await deleteCustomerFn({ data: { businessId, id: removing.id } });
                  setPending(false);
                  if (!res.ok) {
                    toast.error(res.error);
                    return;
                  }
                  toast.success("حذف شد");
                  setRemoving(null);
                  if (form?.id === removing.id) setForm(null);
                  await reload(businessId);
                }}
              >
                {pending ? "در حال حذف" : "حذف"}
              </Button>
            </DialogActions>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-line bg-card px-4 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function SortButton({ label, active, onClick }: { label: string; active: "asc" | "desc" | null; onClick: () => void }) {
  const Icon = active === "asc" ? ChevronUp : active === "desc" ? ChevronDown : ChevronsUpDown;
  return (
    <button type="button" className="inline-flex items-center gap-1" aria-sort={active === "asc" ? "ascending" : active === "desc" ? "descending" : "none"} onClick={onClick}>
      {label}
      <Icon className="size-3.5 text-muted" aria-hidden="true" />
    </button>
  );
}

function RowActions({ onView, onEdit, onDelete }: { onView: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button type="button" aria-label="مشاهده" onClick={onView} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-paper-deep">
        <Eye className="size-4" />
      </button>
      <button type="button" aria-label="ویرایش" onClick={onEdit} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-paper-deep">
        <Pencil className="size-4" />
      </button>
      <button type="button" aria-label="حذف" onClick={onDelete} className="grid size-8 place-items-center rounded-lg text-danger hover:bg-danger-soft">
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

function RowMenu({ onView, onEdit, onDelete }: { onView: () => void; onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="grid size-8 place-items-center rounded-lg text-muted hover:bg-paper-deep"
        aria-label="بیشتر"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal className="size-4" />
      </button>
      {open ? (
        <div role="menu" className="absolute end-0 z-20 mt-1 min-w-32 overflow-hidden rounded-xl border border-line bg-card py-1 shadow-lg">
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm hover:bg-paper"
            onClick={() => {
              setOpen(false);
              onView();
            }}
          >
            <Eye className="size-4" />
            مشاهده
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm hover:bg-paper"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
          >
            <Pencil className="size-4" />
            ویرایش
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm text-danger hover:bg-danger-soft"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            <Trash2 className="size-4" />
            حذف
          </button>
        </div>
      ) : null}
    </div>
  );
}

function birthLabel(day: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return day || "ثبت نشده";
  const [year, month, date] = day.split("-").map(Number);
  const jalali = gregorianToJalali(year, month, date);
  return faNum(`${jalali.jy}/${String(jalali.jm).padStart(2, "0")}/${String(jalali.jd).padStart(2, "0")}`);
}

function CustomerView({ customer, zone, businessId, onClose }: { customer: Customer; zone: string; businessId: string; onClose: () => void }) {
  const [more, setMore] = useState(false);
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const rows = [
    ["نام", customer.name || "ثبت نشده"],
    ["شماره", customer.phone ? faNum(customer.phone) : "ثبت نشده"],
    ["تاریخ تولد", birthLabel(customer.birthDate || "")],
    ["آدرس", customer.address?.trim() || "ثبت نشده"],
    ["گروه", groupOf(customer)],
    ["مراجعات", faNum(customer.visits)],
    ["آخرین مراجعه", customer.lastVisit ? formatWhen(customer.lastVisit, zone) : "ندارد"],
    ["توضیح برای مشتری", customer.customerNote?.trim() || "ندارد"],
    ["توضیح داخلی", customer.notes?.trim() || "ندارد"],
  ];
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-view-title"
        className="grid max-h-[min(92dvh,44rem)] w-full max-w-md gap-4 overflow-y-auto rounded-[1.375rem] border border-line bg-card p-5 text-ink shadow-[0_20px_50px_-20px_rgb(0_0_0/0.8)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div>
          <h2 id="customer-view-title" className="text-lg font-bold">مشاهده مشتری</h2>
          <p className="mt-1 text-sm text-muted">این اطلاعات فقط نمایشی است.</p>
        </div>
        <dl className="grid gap-2 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3 border-b border-line pb-2 last:border-b-0">
              <dt className="text-muted">{label}</dt>
              <dd className="text-end leading-6" dir={label === "شماره" ? "ltr" : undefined}>{value}</dd>
            </div>
          ))}
        </dl>
        <Button type="button" variant="quiet" onClick={() => setMore((value) => !value)}>{more ? "بستن اطلاعات بیشتر" : "نمایش اطلاعات بیشتر"}</Button>
        {more ? <CustomerFile businessId={businessId} customerId={customer.id} /> : null}
        <DialogActions>
          <Button type="button" onClick={onClose}>بستن</Button>
        </DialogActions>
      </div>
    </div>
  );
}

function CustomerDialog({
  draft,
  groups,
  addresses,
  businessId,
  pending,
  onChange,
  onGroups,
  onClose,
  onSubmit,
}: {
  draft: CustomerDraft;
  groups: CustomGroup[];
  addresses: string[];
  businessId: string;
  pending: boolean;
  onChange: (next: CustomerDraft) => void;
  onGroups: (groups: CustomGroup[]) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-dialog-title"
        className="grid max-h-[min(92dvh,44rem)] w-full max-w-md gap-4 overflow-y-auto rounded-[1.375rem] border border-line bg-card p-5 text-ink shadow-[0_20px_50px_-20px_rgb(0_0_0/0.8)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div>
          <h2 id="customer-dialog-title" className="text-lg font-bold">{draft.id ? "ویرایش مشتری" : "مشتری جدید"}</h2>
          <p className="mt-1 text-sm text-muted">نام، شماره، گروه و توضیحی که برای خودتان لازم است.</p>
        </div>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <CustomerFields businessId={businessId} draft={draft} groups={groups} addresses={addresses} onChange={onChange} onGroups={onGroups} />
          <DialogActions>
            <Button type="button" variant="quiet" onClick={onClose}>انصراف</Button>
            <Button type="submit" disabled={pending}>{pending ? "در حال ذخیره" : "ذخیره"}</Button>
          </DialogActions>
        </form>
      </div>
    </div>
  );
}

function CustomerFile({ businessId, customerId }: { businessId: string; customerId: string }) {
  const [file, setFile] = useState<{ bookings: { id: string; service: string; staff: string; startsAt: string; status: string }[]; orders: { id: string; title: string; status: string; createdAt: string; price: number }[]; notes: { id: string; body: string; createdAt: string }[] } | null>(null);
  useEffect(() => {
    let live = true;
    customerFileFn({ data: { businessId, id: customerId } }).then((res) => {
      if (live && res.ok) setFile(res.data);
    });
    return () => {
      live = false;
    };
  }, [businessId, customerId]);
  if (!file) return <p className="text-sm text-muted">پرونده در حال خواندن است.</p>;
  return (
    <div className="grid gap-3 border-t border-line pt-3 text-sm">
      <div>
        <h3 className="font-bold">نوبت‌ها</h3>
        {file.bookings.length === 0 ? <p className="mt-1 text-muted">نوبتی نیست.</p> : null}
        <ul className="mt-1 grid gap-1">
          {file.bookings.map((item) => (
            <li key={item.id} className="flex justify-between gap-2">
              <span className="min-w-0 truncate">{item.service} · {item.staff}</span>
              <span className="shrink-0 text-muted">{STATUS_FA[item.status] ?? item.status}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-bold">سفارش‌ها</h3>
        {file.orders.length === 0 ? <p className="mt-1 text-muted">سفارشی با این شماره نیست.</p> : null}
        <ul className="mt-1 grid gap-1">
          {file.orders.map((item) => (
            <li key={item.id} className="truncate">{item.title}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-bold">یادداشت‌های قبلی</h3>
        {file.notes.length === 0 ? <p className="mt-1 text-muted">اگر توضیح داخلی را عوض کنید، متن قبلی این‌جا می‌ماند.</p> : null}
        <ul className="mt-1 grid gap-2">
          {file.notes.map((item) => (
            <li key={item.id} className="leading-6">{item.body}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
