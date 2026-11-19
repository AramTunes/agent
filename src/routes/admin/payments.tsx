import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Card, Skeleton } from "@/components/ui";
import { faNum, toman } from "@/lib/booking/fa";
import { formatWhen } from "@/lib/booking/format";
import { adminPaymentsFn } from "@/lib/api";

export const Route = createFileRoute("/admin/payments")({ component: PaymentsPage });

type Pay = {
  id: string;
  gateway: string;
  kind: string;
  amount: number;
  status: string;
  createdAt: string;
  paidAt: string;
  businessName: string;
  slug: string;
};

const STATUS: Record<string, string> = { pending: "مانده", paid: "پرداخت‌شده", failed: "ناموفق" };
const KIND: Record<string, string> = { plan: "اشتراک", appearance: "ظاهر صفحه", sms: "پیامک" };
const GATE: Record<string, string> = { zarinpal: "زرین‌پال", zibal: "زیبال" };
const filters = [
  { id: "", label: "همه" },
  { id: "pending", label: "مانده" },
  { id: "paid", label: "پرداخت‌شده" },
  { id: "failed", label: "ناموفق" },
];

function PaymentsPage() {
  const initial = typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("status") || "";
  const [status, setStatus] = useState(filters.some((item) => item.id === initial) ? initial : "");
  const [rows, setRows] = useState<Pay[]>([]);
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(true);

  function load(next: string, cursor?: Pay) {
    setLoading(!cursor);
    adminPaymentsFn({ data: { status: next, before: cursor?.createdAt ?? "", beforeId: cursor?.id ?? "" } }).then((res) => {
      setLoading(false);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      const list = (res.data.rows ?? []) as Pay[];
      setRows((current) => (cursor ? [...current, ...list] : list));
      setMore(Boolean(res.data.more));
    });
  }
  useEffect(() => {
    load(status);
  }, [status]);

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button key={item.id || "all"} type="button" onClick={() => setStatus(item.id)} className={`min-h-10 rounded-full px-3 text-sm ${status === item.id ? "bg-ink text-on-ink" : "border border-line"}`}>{item.label}</button>
        ))}
      </div>
      {loading ? <Skeleton className="h-24" /> : null}
      {!loading && rows.length === 0 ? <Card><p className="text-sm text-muted">پرداختی در این وضعیت نیست.</p></Card> : null}
      {rows.map((row) => (
        <Card key={row.id}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <Link to="/b/$slug" params={{ slug: row.slug }} className="font-bold text-jade">{row.businessName}</Link>
              <p className="text-sm text-muted">{KIND[row.kind] ?? row.kind} · {GATE[row.gateway] ?? row.gateway} · {toman(row.amount)}</p>
            </div>
            <Badge tone={row.status === "paid" ? "jade" : row.status === "failed" ? "danger" : "copper"}>{STATUS[row.status] ?? row.status}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted">ساخته‌شده {formatWhen(row.createdAt, "Asia/Tehran")}{row.paidAt ? ` · پرداخت ${formatWhen(row.paidAt, "Asia/Tehran")}` : ""}</p>
        </Card>
      ))}
      {more ? <Button type="button" variant="quiet" onClick={() => load(status, rows[rows.length - 1])}>بیشتر</Button> : null}
      <p className="text-xs text-muted">{faNum(rows.length)} ردیف در این صفحه</p>
    </div>
  );
}
