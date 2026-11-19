import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button, Card, Skeleton } from "@/components/ui";
import { Select } from "@/components/ui/select";
import { faNum } from "@/lib/booking/fa";
import { formatWhen } from "@/lib/booking/format";
import { adminAuditFn } from "@/lib/api";

export const Route = createFileRoute("/admin/audit")({ component: AuditPage });

type Log = {
  id: string;
  actorName: string;
  actorPhone: string;
  action: string;
  entity: string;
  detail: string;
  createdAt: string;
  businessName: string;
  businessSlug: string;
};

const ACTION: Record<string, string> = {
  create_business: "ساخت کسب‌وکار",
  update_business: "ویرایش کسب‌وکار",
  delete_business: "حذف کسب‌وکار",
  create_booking: "ثبت نوبت",
  booking_status: "تغییر وضعیت نوبت",
  reschedule: "جابه‌جایی نوبت",
  moderate_business: "نظارت کسب‌وکار",
  save_category: "ویرایش دسته",
  delete_category: "حذف دسته",
  save_settings: "تنظیمات سامانه",
  claim_admin: "تعیین مدیر",
  user_admin: "تغییر مدیریت",
  user_access: "بستن یا باز کردن ورود",
  payment_paid: "پرداخت موفق",
  sms_grant: "شارژ پیامک",
  media_delete: "حذف رسانه",
  support_open: "تیکت جدید",
  support_reply: "پاسخ پشتیبانی",
  support_close: "بستن تیکت",
  support_reopen: "باز کردن تیکت",
  table_save: "تعریف میز",
  table_delete: "حذف میز",
  table_reserve: "رزرو میز",
  table_release: "آزادسازی میز",
  table_cancel: "لغو رزرو میز",
};

const JOB: Record<string, string> = { sent: "ارسال شد", failed: "رد شد", skipped: "قدیمی، ارسال نشد", recorded: "داخل برنامه" };
const KIND: Record<string, string> = { sms: "پیامک", in_app: "داخل برنامه", email: "ایمیل" };

function AuditPage() {
  const [action, setAction] = useState("");
  const [logs, setLogs] = useState<Log[]>([]);
  const [more, setMore] = useState(false);
  const [jobs, setJobs] = useState<{ channel: string; status: string; n: number }[]>([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);

  function load(next: string, cursor?: Log) {
    setLoading(!cursor);
    adminAuditFn({ data: { action: next, before: cursor?.createdAt ?? "", beforeId: cursor?.id ?? "" } }).then((res) => {
      setLoading(false);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      const list = (res.data.logs ?? []) as Log[];
      setLogs((current) => (cursor ? [...current, ...list] : list));
      setMore(Boolean(res.data.more));
      if (!cursor) {
        setJobs(res.data.jobs ?? []);
        setNote(res.data.errorLog ?? "");
      }
    });
  }
  useEffect(() => {
    load(action);
  }, [action]);

  return (
    <div className="grid gap-4">
      <Card>
        <h2 className="font-bold">پیامک و اعلان</h2>
        <p className="mt-1 text-sm leading-6 text-muted">{note}</p>
        <ul className="mt-3 grid gap-1 text-sm">
          {jobs.length === 0 ? <li className="text-muted">ارسالی ثبت نشده.</li> : null}
          {jobs.map((job) => (
            <li key={job.channel + job.status} className="flex justify-between">
              <span>{KIND[job.channel] ?? job.channel} · {JOB[job.status] ?? job.status}</span>
              <span className="tabular-nums">{faNum(job.n)}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Select
        aria-label="نوع رخداد"
        value={action}
        onChange={(event) => setAction(event.target.value)}
        options={[{ value: "", label: "همهٔ رخدادها" }, ...Object.entries(ACTION).map(([value, label]) => ({ value, label }))]}
      />
      {loading ? <Skeleton className="h-40" /> : null}
      <div className="grid gap-2">
        {!loading && logs.length === 0 ? <Card><p className="text-sm text-muted">رخدادی نیست.</p></Card> : null}
        {logs.map((log) => (
          <Card key={log.id}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="font-semibold">{ACTION[log.action] ?? log.action}</div>
                <p className="text-sm text-muted">
                  {log.actorName}
                  {log.actorPhone ? <span dir="ltr"> · {faNum(log.actorPhone)}</span> : null}
                  {log.businessSlug ? (
                    <>
                      {" · "}
                      <Link to="/b/$slug" params={{ slug: log.businessSlug }} className="font-semibold text-jade">{log.businessName || log.businessSlug}</Link>
                    </>
                  ) : null}
                  {log.detail ? ` · ${log.detail}` : ""}
                </p>
              </div>
              <time className="text-sm text-muted">{formatWhen(log.createdAt, "Asia/Tehran")}</time>
            </div>
          </Card>
        ))}
      </div>
      {more ? <Button type="button" variant="quiet" onClick={() => load(action, logs[logs.length - 1])}>بیشتر</Button> : null}
    </div>
  );
}
