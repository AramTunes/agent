import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button, Card, Field, Skeleton, TextInput } from "@/components/ui";
import { faNum } from "@/lib/booking/fa";
import { formatWhen } from "@/lib/booking/format";
import { adminOverviewFn, adminSearchFn, saveSettingsFn, setGatewayFn } from "@/lib/api";

export const Route = createFileRoute("/admin/")({ component: AdminHome });

type Queue = {
  waitingTickets: number;
  pendingPayments: number;
  suspended: number;
  failedSms: number;
  orders: number;
  failedSmsRows?: { phone: string; kind: string; error: string; at: string }[];
};

type Overview = {
  users: number;
  orders?: number;
  businesses: Record<string, number>;
  bookings: Record<string, number>;
  settings: { key: string; value: string }[];
  gateways?: { id: string; title: string; ready: boolean; enabled: boolean }[];
  queue?: Queue;
  note: string;
};

const SMS: Record<string, string> = { code: "کد ورود", book: "رسید نوبت", remind: "یادآوری", order: "سفارش", table: "میز" };

const STATUS: Record<string, string> = {
  active: "فعال",
  inactive: "غیرفعال",
  suspended: "تعلیق",
  pending: "در انتظار",
  confirmed: "تأییدشده",
  completed: "انجام‌شده",
  cancelled: "لغوشده",
  no_show: "عدم مراجعه",
};

function AdminHome() {
  const [data, setData] = useState<Overview | null>(null);
  const [name, setName] = useState("ایجنت");
  const [email, setEmail] = useState("");
  const [q, setQ] = useState("");
  const [found, setFound] = useState<{ users: { id: string; name: string; phone: string; pages?: { name: string; slug: string; role: string }[] }[]; businesses: { id: string; name: string; slug: string; via: string }[] } | null>(null);

  function load() {
    adminOverviewFn().then((res) => {
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setData(res.data);
      const map = Object.fromEntries(res.data.settings.map((item: { key: string; value: string }) => [item.key, item.value]));
      setName(map.platform_name || "ایجنت");
      setEmail(map.support_email || "");
    });
  }
  useEffect(() => {
    load();
  }, []);
  if (!data) return <Skeleton className="h-40" />;
  const bizTotal = Object.values(data.businesses).reduce((sum, n) => sum + n, 0);
  const bookTotal = Object.values(data.bookings).reduce((sum, n) => sum + n, 0);
  const queue = data.queue;
  return (
    <div className="grid gap-4">
      <Card>
        <p className="text-sm leading-6 text-muted">{data.note}</p>
      </Card>
      {queue ? (
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            [queue.waitingTickets, "تیکت منتظر", "/admin/support"],
            [queue.pendingPayments, "پرداخت مانده", "/admin/payments?status=pending"],
            [queue.suspended, "صفحه تعلیق", "/admin/businesses?status=suspended"],
            [queue.failedSms, "پیامک ردشده", "/admin/audit"],
          ].map(([count, label, href]) => (
            <a key={String(label)} href={String(href)} className="rounded-card border border-line bg-card p-4">
              <div className="text-sm text-muted">{label}</div>
              <div className="mt-1 text-3xl font-extrabold tabular-nums">{faNum(Number(count))}</div>
            </a>
          ))}
        </div>
      ) : null}
      {(queue?.failedSmsRows ?? []).length > 0 ? (
        <Card>
          <h2 className="font-bold">آخرین پیامک‌های ردشده</h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {queue!.failedSmsRows!.map((item, index) => (
              <li key={`${item.at}-${index}`}>
                <span dir="ltr">{item.phone ? faNum(item.phone) : "—"}</span>
                <span className="text-muted"> · {SMS[item.kind] ?? item.kind} · {item.error || "رد شد"} · {item.at ? formatWhen(item.at, "Asia/Tehran") : ""}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
      <Card>
        <h2 className="font-bold">جست‌وجو با شماره</h2>
        <form
          className="mt-3 flex gap-2"
          onSubmit={async (event) => {
            event.preventDefault();
            const res = await adminSearchFn({ data: { q } });
            if (!res.ok) {
              toast.error(res.error);
              return;
            }
            setFound(res.data);
          }}
        >
          <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="شماره، نام یا نشانی" aria-label="جست‌وجو" />
          <Button type="submit" variant="quiet">جست‌وجو</Button>
        </form>
        {found ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-bold">کاربران</h3>
              {found.users.length === 0 ? <p className="mt-1 text-sm text-muted">نیست.</p> : null}
              <ul className="mt-1 grid gap-2 text-sm">
                {found.users.map((user) => (
                  <li key={user.id}>
                    <span className="font-semibold">{user.name || "بدون نام"}</span>
                    <span className="text-muted" dir="ltr"> · {user.phone ? faNum(user.phone) : "بدون شماره"}</span>
                    {(user.pages ?? []).map((page) => (
                      <span key={page.slug}> · <Link to="/b/$slug" params={{ slug: page.slug }} className="text-jade">{page.name}</Link></span>
                    ))}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold">صفحه‌ها</h3>
              {found.businesses.length === 0 ? <p className="mt-1 text-sm text-muted">نیست.</p> : null}
              <ul className="mt-1 grid gap-2 text-sm">
                {found.businesses.map((biz) => (
                  <li key={biz.id}>
                    <Link to="/b/$slug" params={{ slug: biz.slug }} className="font-semibold text-jade">{biz.name}</Link>
                    <span className="text-muted"> · {biz.via}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </Card>
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["کاربران", data.users],
          ["کسب‌وکارها", bizTotal],
          ["نوبت‌ها", bookTotal],
          ["سفارش‌ها", data.orders ?? queue?.orders ?? 0],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <div className="text-sm text-muted">{label}</div>
            <div className="mt-1 text-3xl font-extrabold tabular-nums">{faNum(Number(value))}</div>
          </Card>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <h2 className="font-bold">وضعیت کسب‌وکارها</h2>
          <ul className="mt-3 grid gap-1 text-sm">
            {Object.entries(data.businesses).map(([key, n]) => (
              <li key={key} className="flex justify-between"><span>{STATUS[key] ?? key}</span><span className="tabular-nums">{faNum(n)}</span></li>
            ))}
            {Object.keys(data.businesses).length === 0 ? <li className="text-muted">هنوز کسب‌وکاری نیست.</li> : null}
          </ul>
        </Card>
        <Card>
          <h2 className="font-bold">وضعیت نوبت‌ها</h2>
          <ul className="mt-3 grid gap-1 text-sm">
            {Object.entries(data.bookings).map(([key, n]) => (
              <li key={key} className="flex justify-between"><span>{STATUS[key] ?? key}</span><span className="tabular-nums">{faNum(n)}</span></li>
            ))}
            {Object.keys(data.bookings).length === 0 ? <li className="text-muted">نوبتی ثبت نشده.</li> : null}
          </ul>
        </Card>
      </div>
      <Card>
        <h2 className="font-bold">تنظیمات عمومی</h2>
        <p className="mt-1 text-sm text-muted">{data.note}</p>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            const res = await saveSettingsFn({ data: { platform_name: name, support_email: email } });
            if (!res.ok) toast.error(res.error);
            else {
              toast.success("ذخیره شد");
              setData(res.data);
            }
          }}
        >
          <Field label="نام پلتفرم"><TextInput value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="ایمیل پشتیبانی"><TextInput dir="ltr" className="text-left" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Button type="submit" className="sm:col-span-2 sm:w-fit">ذخیره</Button>
        </form>
      </Card>
      <Card>
        <h2 className="font-bold">درگاه پرداخت</h2>
        <p className="mt-1 text-sm leading-6 text-muted">روشن کردن فقط وقتی کار می‌کند که مرچنت همان درگاه در محیط برنامه باشد. خاموش یعنی خرید جدید بسته است. قفل اشتراک هم فقط وقتی حداقل یک درگاه روشن باشد اجرا می‌شود.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(data.gateways ?? []).map((item) => (
            <Button
              key={item.id}
              type="button"
              variant={item.enabled ? "ink" : "quiet"}
              disabled={!item.ready && !item.enabled}
              onClick={async () => {
                const res = await setGatewayFn({ data: { [item.id]: !item.enabled } });
                if (!res.ok) {
                  toast.error(res.error);
                  return;
                }
                setData(res.data);
              }}
            >
              {item.title} · {item.ready ? (item.enabled ? "روشن" : "خاموش") : "مرچنت نیست"}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
