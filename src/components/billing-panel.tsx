import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button, Card } from "@/components/ui";
import { faNum, toman } from "@/lib/booking/fa";
import { formatWhen } from "@/lib/booking/format";
import { saveSmsPrefsFn, startPaymentFn } from "@/lib/api";

export type Billing = {
  live: boolean;
  trialEndsAt?: string;
  planEndsAt?: string;
  appearanceEndsAt?: string;
  commerce: boolean;
  appearance: boolean;
  smsBalance: number;
  remind: boolean;
  receipt: boolean;
  survey: boolean;
  smsReady: boolean;
  gateways: { id: string; title: string; ready: boolean; enabled: boolean }[];
  plans: { months: number; price: number }[];
  packages: { count: number; price: number }[];
};

const terms: Record<number, string> = { 1: "یک ماه", 3: "سه ماه", 6: "شش ماه", 12: "یک سال" };

function when(value?: string) {
  if (!value) return "ندارد";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "ندارد";
  return formatWhen(value, "Asia/Tehran");
}

export function BillingPanel({ businessId, billing, onChange }: { businessId: string; billing: Billing; onChange: (next: Billing) => void }) {
  const [gateway, setGateway] = useState("");
  const [busy, setBusy] = useState("");
  const open = billing.gateways.filter((item) => item.enabled);
  const openKey = open.map((item) => item.id).join(",");
  useEffect(() => {
    if (!gateway && open[0]) setGateway(open[0].id);
  }, [gateway, openKey]);
  useEffect(() => {
    const pay = new URLSearchParams(window.location.search).get("pay");
    if (pay === "paid") toast.success("پرداخت تأیید شد");
    if (pay === "failed") toast.error("پرداخت تأیید نشد");
  }, []);

  async function buy(kind: "plan" | "appearance" | "sms", months = 0, count = 0) {
    if (!open.length) return;
    const chosen = open.find((item) => item.id === gateway) ?? open[0];
    setBusy(kind + String(months || count));
    const res = await startPaymentFn({
      data: { businessId, gateway: chosen.id, kind, months, count, origin: window.location.origin },
    });
    setBusy("");
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    window.location.assign(res.data.url);
  }

  async function prefs(next: Partial<Pick<Billing, "remind" | "receipt" | "survey">>) {
    const body = { businessId, remind: billing.remind, receipt: billing.receipt, survey: billing.survey, ...next };
    const res = await saveSmsPrefsFn({ data: body });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    onChange(res.data);
  }

  return (
    <Card>
      <h2 className="text-lg font-bold">اشتراک و پیامک</h2>
      <p className="mt-1 text-sm leading-6 text-muted">
        {billing.live
          ? billing.commerce
            ? "نوبت، سفارش و رزرو میز باز است."
            : "اشتراک تمام شده. تا تمدید، ساخت نوبت و سفارش و رزرو میز بسته است."
          : "درگاه هنوز وصل نشده. تا آن روز همه‌چیز باز می‌ماند و آزمایش هفت‌روزه شروع نمی‌شود."}
      </p>
      <dl className="mt-3 grid gap-1 text-sm">
        <div className="flex justify-between gap-3"><dt className="text-muted">پایان آزمایش</dt><dd>{when(billing.trialEndsAt)}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-muted">پایان اشتراک</dt><dd>{when(billing.planEndsAt)}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-muted">پایان ظاهر صفحه</dt><dd>{when(billing.appearanceEndsAt)}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-muted">مانده پیامک</dt><dd>{faNum(billing.smsBalance)}</dd></div>
      </dl>
      {open.length > 1 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {open.map((item) => (
            <button key={item.id} type="button" onClick={() => setGateway(item.id)} className={`min-h-10 rounded-full px-3 text-sm ${gateway === item.id ? "bg-ink text-on-ink" : "border border-line"}`}>{item.title}</button>
          ))}
        </div>
      ) : null}
      {open.length === 0 ? <p className="mt-3 text-sm leading-6 text-muted">دکمهٔ خرید وقتی مرچنت زرین‌پال یا زیبال روشن شود فعال می‌شود. تا آن روز قفل اشتراک هم اجرا نمی‌شود.</p> : null}
      <h3 className="mt-4 font-bold">اشتراک برنامه</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {billing.plans.map((plan) => (
          <Button key={plan.months} type="button" variant="ink" disabled={open.length === 0 || busy !== ""} onClick={() => void buy("plan", plan.months)}>{terms[plan.months]} · {toman(plan.price)}</Button>
        ))}
      </div>
      <h3 className="mt-4 font-bold">ظاهر صفحه</h3>
      <p className="mt-1 text-xs leading-5 text-muted">رنگ اختصاصی، و بعداً انیمیشن و پس‌زمینهٔ متحرک. بدون این افزونه رنگ اختصاصی ذخیره می‌ماند ولی روی صفحهٔ عمومی دیده نمی‌شود.</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {billing.plans.map((plan) => (
          <Button key={`look-${plan.months}`} type="button" variant="quiet" disabled={open.length === 0 || busy !== ""} onClick={() => void buy("appearance", plan.months)}>{terms[plan.months]} · {toman(plan.price)}</Button>
        ))}
      </div>
      <h3 className="mt-4 font-bold">بسته پیامک</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {billing.packages.map((pack) => (
          <Button key={pack.count} type="button" variant="quiet" disabled={open.length === 0 || busy !== ""} onClick={() => void buy("sms", 0, pack.count)}>{faNum(pack.count)} پیامک · {toman(pack.price)}</Button>
        ))}
      </div>
      <h3 className="mt-4 font-bold">ارسال پیامک مشتری</h3>
      <p className="mt-1 text-xs leading-5 text-muted">این‌ها از بستهٔ همین کسب‌وکار کم می‌شوند. کد ورود از اعتبار خود برنامه می‌رود.{billing.smsReady ? "" : " کلید کاوه‌نگار هنوز وصل نشده."}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" onClick={() => void prefs({ remind: !billing.remind })} className={`min-h-10 rounded-full px-3 text-sm ${billing.remind ? "bg-ink text-on-ink" : "border border-line"}`}>یادآوری نوبت</button>
        <button type="button" onClick={() => void prefs({ receipt: !billing.receipt })} className={`min-h-10 rounded-full px-3 text-sm ${billing.receipt ? "bg-ink text-on-ink" : "border border-line"}`}>رسید نوبت، سفارش و میز</button>
        <button type="button" onClick={() => void prefs({ survey: !billing.survey })} className={`min-h-10 rounded-full px-3 text-sm ${billing.survey ? "bg-ink text-on-ink" : "border border-line"}`}>نظرسنجی</button>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted">نظرسنجی هنوز ساخته نشده. کلیدش ذخیره می‌شود و پیامکی نمی‌رود.</p>
    </Card>
  );
}
