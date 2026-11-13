import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { Card, Empty, Skeleton } from "@/components/ui";
import { receiptFn } from "@/lib/api";
import { faNum, toman } from "@/lib/booking/fa";
import { formatWhen } from "@/lib/booking/format";

export const Route = createFileRoute("/r/$token")({ component: ReceiptPage });

type Line = { title?: string; variant?: string; qty?: number; price?: number; priceTo?: number; priceType?: string };
type Receipt = {
  kind: "order" | "booking";
  word: string;
  business: string;
  name: string;
  phone: string;
  address?: string;
  note?: string;
  status: string;
  when?: string;
  createdAt?: string;
  price?: number;
  currency?: string;
  priced?: boolean;
  lines?: Line[];
  businessAddress?: string;
  businessPhone?: string;
  timezone?: string;
  customerNote?: string;
  cancelReason?: string;
  startsAt?: string;
  service?: string;
  staff?: string;
  durationMinutes?: number;
};

const statusFa: Record<string, string> = {
  pending: "در انتظار",
  confirmed: "ثبت‌شده",
  completed: "انجام‌شده",
  cancelled: "لغوشده",
  no_show: "عدم مراجعه",
  new: "جدید",
  preparing: "در حال آماده‌سازی",
  ready: "آماده",
  delivered: "تحویل‌شده",
};

function lineText(line: Line) {
  const name = line.variant ? `${line.title}، ${line.variant}` : line.title || "مورد";
  const qty = line.qty && line.qty > 1 ? ` × ${faNum(line.qty)}` : "";
  if (line.priceType === "free") return `${name}${qty} · رایگان`;
  if (line.priceType === "contact") return `${name}${qty} · تماس بگیرید`;
  if (line.priceType === "from") return `${name}${qty} · از ${toman(line.price ?? 0)}`;
  if (line.priceType === "range") {
    const from = toman(line.price ?? 0);
    return line.priceTo ? `${name}${qty} · ${from} تا ${toman(line.priceTo)}` : `${name}${qty} · از ${from}`;
  }
  return `${name}${qty}`;
}

function money(item: Receipt) {
  if (item.kind === "order" && !item.priced) return "قطعی نیست";
  if ((item.currency || "toman") !== "toman") return `${faNum(item.price ?? 0)} ${item.currency ?? ""}`;
  return toman(item.price ?? 0);
}

function ReceiptPage() {
  const { token } = Route.useParams();
  const [item, setItem] = useState<Receipt | null>(null);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    receiptFn(token).then((res) => {
      if (!res.ok) setMissing(true);
      else setItem(res.data);
    });
  }, [token]);
  if (missing) {
    return (
      <Shell>
        <Empty title="این لینک پیدا نشد" body="جزئیات این سفارش یا نوبت در دسترس نیست." />
      </Shell>
    );
  }
  if (!item) return <Shell><Skeleton className="h-64" /></Shell>;
  const rows: [string, string][] = [
    ["کسب‌وکار", item.business],
    ["نام", item.name || "ثبت نشده"],
    ["موبایل", item.phone ? faNum(item.phone) : "ثبت نشده"],
    ["وضعیت", statusFa[item.status] ?? item.status],
  ];
  if (item.kind === "order") {
    rows.push(["زمان تحویل", item.when ? faNum(item.when) : "هرچه زودتر"]);
    rows.push(["آدرس", item.address || "ثبت نشده"]);
    rows.push(["مبلغ", money(item)]);
    if (item.createdAt) rows.push(["زمان ثبت", formatWhen(item.createdAt, "Asia/Tehran")]);
  } else {
    rows.push(["خدمت", item.service || ""]);
    rows.push(["پرسنل", item.staff || ""]);
    if (item.startsAt) rows.push(["زمان", formatWhen(item.startsAt, item.timezone || "Asia/Tehran")]);
    if (item.durationMinutes) rows.push(["مدت", `${faNum(item.durationMinutes)} دقیقه`]);
    rows.push(["مبلغ", money(item)]);
    rows.push(["آدرس کسب‌وکار", item.businessAddress || "ثبت نشده"]);
    rows.push(["تلفن کسب‌وکار", item.businessPhone ? faNum(item.businessPhone) : "ثبت نشده"]);
  }
  if (item.note) rows.push(["یادداشت", item.note]);
  if (item.customerNote) rows.push(["پیام کسب‌وکار", item.customerNote]);
  if (item.cancelReason) rows.push(["دلیل لغو", item.cancelReason]);
  return (
    <Shell>
      <Card>
        <h1 className="text-2xl font-extrabold">{item.word} شما ثبت شد</h1>
        <p className="mt-1 text-sm text-muted">جزئیات کامل {item.word}</p>
        {item.kind === "order" && item.lines?.length ? (
          <ul className="mt-4 grid gap-1 text-sm">
            {item.lines.map((line, index) => <li key={index}>{lineText(line)}</li>)}
          </ul>
        ) : null}
        <dl className="mt-4 grid gap-2 text-sm leading-7">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3">
              <dt className="text-muted">{label}</dt>
              <dd className="text-end">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </Shell>
  );
}
