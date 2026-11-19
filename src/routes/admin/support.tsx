import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Empty, Skeleton, Area } from "@/components/ui";
import { adminSupportCloseFn, adminSupportFn, adminSupportReopenFn, adminSupportReplyFn } from "@/lib/api";
import { faNum } from "@/lib/booking/fa";
import { formatClock, formatWhen } from "@/lib/booking/format";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/admin/support")({ component: AdminSupportPage });

type Status = "open" | "waiting" | "done";
type Message = { id: string; author: string; body: string; at: string };
type Ticket = {
  id: string;
  code: string;
  subject: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
  userName: string;
  userPhone: string;
  messages: Message[];
};

const filters = [
  { id: "all", label: "همه" },
  { id: "waiting", label: "منتظر جواب" },
  { id: "open", label: "باز" },
  { id: "done", label: "بسته" },
] as const;

const statusLabel: Record<Status, string> = {
  open: "باز",
  waiting: "منتظر جواب",
  done: "بسته",
};

function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("waiting");
  const [active, setActive] = useState("");
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);

  async function load(prefer = "") {
    const res = await adminSupportFn();
    if (!res.ok) {
      toast.error(res.error);
      setTickets([]);
      return;
    }
    const rows = (res.data ?? []) as Ticket[];
    setTickets(rows);
    setActive((current) => {
      const next = prefer || current;
      return rows.some((item) => item.id === next) ? next : "";
    });
  }

  useEffect(() => {
    void load();
  }, []);

  const visible = useMemo(
    () => (tickets ?? []).filter((item) => filter === "all" || item.status === filter),
    [tickets, filter],
  );
  const ticket = visible.find((item) => item.id === active) ?? visible[0] ?? null;

  async function act(run: () => Promise<{ ok: boolean; error?: string }>, done: string) {
    if (!ticket) return;
    setPending(true);
    const res = await run();
    setPending(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(done);
    await load(ticket.id);
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted">جواب شما برای کاربر حباب پشتیبانی می‌شود و وضعیت به «باز» می‌رود.</p>
      <div className="flex flex-wrap gap-2">
        {filters.map((item) => {
          const count = item.id === "all" ? (tickets ?? []).length : (tickets ?? []).filter((row) => row.status === item.id).length;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn("h-9 rounded-full border px-3 text-sm", filter === item.id ? "border-ink bg-ink text-on-ink" : "border-line bg-card")}
            >
              {item.label} {faNum(count)}
            </button>
          );
        })}
      </div>
      {tickets === null ? <Skeleton className="h-64" /> : null}
      {tickets && visible.length === 0 ? <Empty title="تیکتی در این وضعیت نیست" body="وقتی کاربر بنویسد، اینجا در «منتظر جواب» می‌آید." /> : null}
      {ticket ? (
        <section className="grid min-h-[28rem] overflow-hidden rounded-card border border-line bg-card lg:grid-cols-[18rem_minmax(0,1fr)]">
          <ul className="max-h-80 overflow-y-auto border-b border-line lg:max-h-none lg:border-b-0 lg:border-e">
            {visible.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setActive(item.id)}
                  className={cn("flex w-full flex-col gap-1 border-b border-line px-4 py-3 text-start hover:bg-paper", ticket.id === item.id && "bg-paper")}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted" dir="ltr">{faNum(`TK-${item.code}`)}</span>
                    <Badge tone={item.status === "done" ? "muted" : item.status === "waiting" ? "copper" : "jade"}>{statusLabel[item.status]}</Badge>
                  </span>
                  <span className="line-clamp-1 text-sm font-medium">{item.subject}</span>
                  <span className="truncate text-xs text-muted">{item.userName || "بدون نام"} · {formatWhen(item.updatedAt, "Asia/Tehran")}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="flex min-h-80 min-w-0 flex-col">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
              <div>
                <h2 className="text-base font-bold">{ticket.subject}</h2>
                <p className="mt-1 text-xs text-muted">
                  <span dir="ltr">{faNum(`TK-${ticket.code}`)}</span>
                  {" · "}
                  {ticket.userName || "بدون نام"}
                  {ticket.userPhone ? <span dir="ltr"> · {faNum(ticket.userPhone)}</span> : null}
                </p>
              </div>
              {ticket.status === "done" ? (
                <Button type="button" variant="quiet" disabled={pending} onClick={() => void act(() => adminSupportReopenFn({ data: { id: ticket.id } }), "پرونده دوباره باز شد")}>
                  باز کردن دوباره
                </Button>
              ) : (
                <Button type="button" variant="quiet" disabled={pending} onClick={() => void act(() => adminSupportCloseFn({ data: { id: ticket.id } }), "پرونده بسته شد")}>
                  بستن پرونده
                </Button>
              )}
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
              {ticket.messages.map((message) => {
                const mine = message.author === "agent";
                return (
                  <div key={message.id} className={cn("flex gap-3", mine && "flex-row-reverse")}>
                    <span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold", mine ? "bg-jade text-on-jade" : "bg-paper-deep text-ink")}>
                      {mine ? "پ" : "ک"}
                    </span>
                    <div className={cn("max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-7", mine ? "bg-jade text-on-jade" : "bg-paper-deep")}>
                      <p>{faNum(message.body)}</p>
                      <p className={cn("mt-1 text-[11px]", mine ? "text-on-jade/80" : "text-muted")}>
                        {formatWhen(message.at, "Asia/Tehran").split("،")[0]} · <span dir="ltr">{formatClock(message.at, "Asia/Tehran")}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <form
              className="border-t border-line p-4"
              onSubmit={(event) => {
                event.preventDefault();
                const text = draft.trim();
                if (text.length < 2 || ticket.status === "done") return;
                void act(async () => {
                  const res = await adminSupportReplyFn({ data: { id: ticket.id, body: text } });
                  if (res.ok) setDraft("");
                  return res;
                }, "جواب ثبت شد");
              }}
            >
              <Area
                value={draft}
                onChange={(event) => setDraft(event.target.value.slice(0, 1000))}
                placeholder={ticket.status === "done" ? "برای جواب، پرونده را باز کنید" : "جواب پشتیبانی را بنویسید…"}
                rows={3}
                disabled={ticket.status === "done" || pending}
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-xs text-muted">{faNum([...draft].length)} / {faNum(1000)}</span>
                <Button type="submit" disabled={pending || ticket.status === "done" || draft.trim().length < 2}>ارسال جواب</Button>
              </div>
            </form>
          </div>
        </section>
      ) : null}
    </div>
  );
}
