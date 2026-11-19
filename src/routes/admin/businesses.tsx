import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Card, Field, Area, Skeleton, TextInput } from "@/components/ui";
import { Select } from "@/components/ui/select";
import { adminBusinessFileFn, adminBusinessesFn, adminDeleteMediaFn, adminGrantSmsFn, moderateBusinessFn } from "@/lib/api";
import { faFileSize, faNum, toman } from "@/lib/booking/fa";
import { formatWhen } from "@/lib/booking/format";
import { PageMark } from "@/lib/page-avatar";

export const Route = createFileRoute("/admin/businesses")({ component: BusinessesPage });

type Biz = {
  id: string;
  name: string;
  slug: string;
  status: string;
  status_reason: string;
  city: string;
  is_demo: boolean;
  avatar?: string;
  createdAt: string;
  categoryName: string;
  ownerName: string;
  ownerPhone: string;
  trialEndsAt: string;
  planEndsAt: string;
  appearanceEndsAt: string;
  smsBalance: number;
};

type Order = { id: string; title: string; name: string; phone: string; status: string; price: number; createdAt: string };
type Media = { name: string; url: string; size: number };

const LABEL: Record<string, string> = { active: "فعال", inactive: "غیرفعال", suspended: "تعلیق" };
const ORDER: Record<string, string> = { new: "جدید", preparing: "در حال آماده‌سازی", ready: "آماده", delivered: "تحویل", cancelled: "لغو" };
const reasons = ["اسپم", "محتوای نامناسب", "کلاهبرداری", "درخواست صاحب صفحه"];

function when(value: string) {
  return value ? formatWhen(value, "Asia/Tehran") : "ندارد";
}

function BusinessesPage() {
  const initialStatus = typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("status") || "";
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(LABEL[initialStatus] ? initialStatus : "");
  const [demo, setDemo] = useState("");
  const [rows, setRows] = useState<Biz[]>([]);
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Record<string, { status: string; reason: string }>>({});
  const [open, setOpen] = useState("");
  const [file, setFile] = useState<{ orders: Order[]; media: Media[] } | null>(null);
  const [count, setCount] = useState("10");
  const [why, setWhy] = useState("");

  function load(query: string, nextStatus: string, nextDemo: string, cursor?: Biz) {
    setLoading(!cursor);
    adminBusinessesFn({
      data: { q: query, status: nextStatus, demo: nextDemo, before: cursor?.createdAt ?? "", beforeId: cursor?.id ?? "" },
    }).then((res) => {
      setLoading(false);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      const list = (res.data.rows ?? []) as Biz[];
      setRows((current) => (cursor ? [...current, ...list] : list));
      setDraft((current) => {
        const base = cursor ? current : {};
        for (const row of list) base[row.id] = { status: row.status, reason: row.status_reason };
        return { ...base };
      });
      setMore(Boolean(res.data.more));
    });
  }
  useEffect(() => {
    load("", status, "");
  }, []);

  async function details(id: string) {
    if (open === id) {
      setOpen("");
      return;
    }
    setOpen(id);
    setFile(null);
    const res = await adminBusinessFileFn({ data: { businessId: id } });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setFile({ orders: res.data.orders ?? [], media: res.data.media ?? [] });
  }

  return (
    <div className="grid gap-3">
      <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); load(q, status, demo); }}>
        <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="نام، شهر، نشانی یا شماره" aria-label="جست‌وجو" />
        <Button type="submit" variant="quiet">جست‌وجو</Button>
      </form>
      <div className="flex flex-wrap gap-2">
        {[
          ["", "همه"],
          ["active", "فعال"],
          ["suspended", "تعلیق"],
          ["inactive", "غیرفعال"],
        ].map(([id, label]) => (
          <button key={id || "all"} type="button" onClick={() => { setStatus(id); load(q, id, demo); }} className={`min-h-10 rounded-full px-3 text-sm ${status === id ? "bg-ink text-on-ink" : "border border-line"}`}>{label}</button>
        ))}
        {[
          ["", "واقعی و نمونه"],
          ["real", "فقط واقعی"],
          ["demo", "فقط نمونه"],
        ].map(([id, label]) => (
          <button key={`demo-${id || "all"}`} type="button" onClick={() => { setDemo(id); load(q, status, id); }} className={`min-h-10 rounded-full px-3 text-sm ${demo === id ? "bg-ink text-on-ink" : "border border-line"}`}>{label}</button>
        ))}
      </div>
      {loading ? <Skeleton className="h-24" /> : null}
      {!loading && rows.length === 0 ? <Card><p className="text-sm text-muted">کسب‌وکاری نیست.</p></Card> : null}
      {rows.map((row) => {
        const item = draft[row.id] ?? { status: row.status, reason: row.status_reason };
        return (
          <Card key={row.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-3">
                <PageMark slug={row.slug} name={row.name} avatar={row.avatar} size={40} />
                <div className="min-w-0">
                  <h2 className="font-bold">{row.name}</h2>
                  <p className="text-sm text-muted">{row.city || "بدون شهر"} · {row.categoryName || "بدون دسته"} · {row.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {row.is_demo ? <Badge tone="copper">نمونه</Badge> : null}
                <Badge tone={row.status === "active" ? "jade" : "danger"}>{LABEL[row.status] ?? row.status}</Badge>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted">
              {row.ownerName || "بدون صاحب"}
              {row.ownerPhone ? <span dir="ltr"> · {faNum(row.ownerPhone)}</span> : null}
              {" · "}عضویت {when(row.createdAt)}
            </p>
            <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-3"><dt className="text-muted">آزمایش</dt><dd>{when(row.trialEndsAt)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">اشتراک</dt><dd>{when(row.planEndsAt)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">ظاهر صفحه</dt><dd>{when(row.appearanceEndsAt)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">پیامک</dt><dd>{faNum(row.smsBalance)}</dd></div>
            </dl>
            <div className="mt-3 grid gap-2 sm:grid-cols-[12rem_1fr_auto]">
              <Field label="وضعیت">
                <Select
                  value={item.status}
                  onChange={(e) => setDraft({ ...draft, [row.id]: { ...item, status: e.target.value } })}
                  options={[
                    { value: "active", label: "فعال" },
                    { value: "inactive", label: "غیرفعال" },
                    { value: "suspended", label: "تعلیق" },
                  ]}
                />
              </Field>
              <Field label="دلیل، اگر فعال نیست">
                <Area value={item.reason} onChange={(e) => setDraft({ ...draft, [row.id]: { ...item, reason: e.target.value } })} />
              </Field>
              <div className="flex items-end gap-2">
                <Button
                  type="button"
                  onClick={async () => {
                    const res = await moderateBusinessFn({ data: { businessId: row.id, status: item.status, reason: item.reason } });
                    if (!res.ok) toast.error(res.error);
                    else {
                      toast.success("وضعیت عوض شد");
                      load(q, status, demo);
                    }
                  }}
                >
                  اعمال
                </Button>
                <Link to="/b/$slug" params={{ slug: row.slug }} className="inline-flex min-h-11 items-center text-sm font-semibold text-jade">صفحه</Link>
                <button type="button" className="min-h-11 text-sm font-semibold" onClick={() => void details(row.id)}>{open === row.id ? "بستن" : "جزئیات"}</button>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {reasons.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  className="min-h-10 rounded-full border border-line px-3 text-sm"
                  onClick={() => setDraft({ ...draft, [row.id]: { status: item.status === "active" ? "suspended" : item.status, reason } })}
                >
                  {reason}
                </button>
              ))}
            </div>
            {open === row.id ? (
              <div className="mt-4 grid gap-4 border-t border-line pt-4">
                <div>
                  <h3 className="font-bold">آخرین سفارش‌ها</h3>
                  {!file ? <Skeleton className="mt-2 h-16" /> : null}
                  {file && file.orders.length === 0 ? <p className="mt-2 text-sm text-muted">سفارشی نیست.</p> : null}
                  <ul className="mt-2 grid gap-2">
                    {(file?.orders ?? []).map((order) => (
                      <li key={order.id} className="text-sm">
                        <span className="font-semibold">{order.title}</span>
                        <span className="text-muted"> · {order.name} · <span dir="ltr">{faNum(order.phone)}</span> · {ORDER[order.status] ?? order.status}{order.price > 0 ? ` · ${toman(order.price)}` : ""}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold">رسانه‌ها</h3>
                  {file && file.media.length === 0 ? <p className="mt-2 text-sm text-muted">فایلی روی سرور نیست.</p> : null}
                  <ul className="mt-2 grid gap-2">
                    {(file?.media ?? []).map((media) => (
                      <li key={media.name} className="flex items-center justify-between gap-2 text-sm">
                        <a href={media.url} className="truncate text-jade" dir="ltr">{media.name}</a>
                        <span className="text-muted">{faFileSize(media.size)}</span>
                        <Button
                          type="button"
                          variant="quiet"
                          onClick={async () => {
                            if (!window.confirm("این فایل از صفحه و سرور حذف شود؟")) return;
                            const res = await adminDeleteMediaFn({ data: { businessId: row.id, name: media.name } });
                            if (!res.ok) {
                              toast.error(res.error);
                              return;
                            }
                            toast.success("حذف شد");
                            setFile((current) => (current ? { ...current, media: res.data.media ?? [] } : current));
                          }}
                        >
                          حذف
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
                <form
                  className="grid gap-2 sm:grid-cols-[8rem_1fr_auto]"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    const res = await adminGrantSmsFn({ data: { businessId: row.id, count: Number(count), reason: why } });
                    if (!res.ok) {
                      toast.error(res.error);
                      return;
                    }
                    toast.success("پیامک شارژ شد");
                    setWhy("");
                    setRows((current) => current.map((item) => (item.id === row.id ? { ...item, smsBalance: res.data.smsBalance } : item)));
                  }}
                >
                  <Field label="تعداد"><TextInput dir="ltr" className="text-left" value={count} onChange={(e) => setCount(e.target.value)} /></Field>
                  <Field label="دلیل شارژ"><TextInput value={why} onChange={(e) => setWhy(e.target.value)} /></Field>
                  <div className="flex items-end"><Button type="submit">شارژ پیامک</Button></div>
                </form>
              </div>
            ) : null}
          </Card>
        );
      })}
      {more ? <Button type="button" variant="quiet" onClick={() => load(q, status, demo, rows[rows.length - 1])}>بیشتر</Button> : null}
    </div>
  );
}
