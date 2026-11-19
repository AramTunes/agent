import { createFileRoute } from "@tanstack/react-router";
import { MessageSquarePlus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAccount } from "@/components/account";
import { Shell } from "@/components/shell";
import { Badge, Button, DialogActions, Empty, Field, Skeleton, TextInput, Area } from "@/components/ui";
import { closeSupportTicketFn, createSupportTicketFn, reopenSupportTicketFn, replySupportTicketFn, supportTicketsFn } from "@/lib/api";
import { faNum } from "@/lib/booking/fa";
import { formatClock, formatWhen } from "@/lib/booking/format";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/support")({ component: SupportPage });

type Status = "open" | "waiting" | "done";
type Message = { id: string; author: "user" | "agent"; body: string; at: string };
type Ticket = {
  id: string;
  code: string;
  subject: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
};

const statusLabel: Record<Status, string> = {
  open: "باز",
  waiting: "منتظر جواب",
  done: "بسته",
};

function SupportPage() {
  const account = useAccount();
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [q, setQ] = useState("");
  const [active, setActive] = useState("");
  const [draft, setDraft] = useState("");
  const [creating, setCreating] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);

  async function load(prefer = "") {
    const res = await supportTicketsFn();
    if (!res.ok) {
      toast.error(res.error);
      setTickets([]);
      return;
    }
    const rows = (res.data ?? []) as Ticket[];
    setTickets(rows);
    setActive((current) => {
      const next = prefer || current;
      return rows.some((item) => item.id === next) ? next : rows[0]?.id ?? "";
    });
  }

  useEffect(() => {
    if (!account.user) return;
    void load();
  }, [account.user?.id]);

  const filtered = useMemo(() => {
    const needle = q.trim();
    return (tickets ?? []).filter((ticket) => {
      if (!needle) return true;
      const code = `TK-${ticket.code}`;
      return ticket.subject.includes(needle) || code.includes(needle) || faNum(code).includes(needle);
    });
  }, [tickets, q]);
  const ticket = filtered.find((item) => item.id === active) ?? filtered[0] ?? null;
  const openCount = (tickets ?? []).filter((item) => item.status === "open").length;
  const closedCount = (tickets ?? []).filter((item) => item.status === "done").length;
  const waitingCount = (tickets ?? []).filter((item) => item.status === "waiting").length;

  if (account.isPending) {
    return <Shell><Skeleton className="h-40" /></Shell>;
  }
  if (!account.user) return <Shell><RedirectToSignIn /></Shell>;

  return (
    <Shell>
      <div className="grid gap-6 lg:h-[calc(100dvh-7rem)] lg:grid-rows-[auto_auto_minmax(0,1fr)]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">پشتیبانی</h1>
            <p className="text-sm text-muted">تیکت بسازید و جواب پشتیبانی را همین‌جا ببینید.</p>
          </div>
          <Button type="button" onClick={() => { setSubject(""); setBody(""); setCreating(true); }}>
            <MessageSquarePlus className="size-4" />
            تیکت جدید
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="تیکت‌های باز" value={faNum(openCount)} />
          <Stat label="تیکت‌های بسته" value={faNum(closedCount)} />
          <Stat label="منتظر جواب پشتیبانی" value={faNum(waitingCount)} />
          <Stat label="کل تیکت‌ها" value={faNum(tickets?.length ?? 0)} />
        </div>

        <section className="flex min-h-[32rem] min-w-0 flex-col overflow-hidden rounded-card border border-line bg-card lg:min-h-0">
          <div className="grid min-h-0 flex-1 lg:h-full lg:grid-cols-[20rem_minmax(0,1fr)_16rem]">
            <aside className="flex max-h-80 min-h-0 flex-col border-b border-line lg:max-h-none lg:border-b-0 lg:border-e">
              <div className="shrink-0 p-3">
                <TextInput value={q} onChange={(event) => setQ(event.target.value)} placeholder="جست‌وجوی تیکت…" aria-label="جست‌وجوی تیکت" />
              </div>
              {tickets === null ? <Skeleton className="m-3 h-24" /> : null}
              <ul className="min-h-0 flex-1 overflow-y-auto">
                {filtered.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setActive(item.id)}
                      className={cn(
                        "flex w-full flex-col gap-1 border-b border-line px-4 py-3 text-start hover:bg-paper",
                        ticket?.id === item.id && "bg-paper",
                      )}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-muted" dir="ltr">{faNum(`TK-${item.code}`)}</span>
                        <Badge tone={item.status === "done" ? "muted" : item.status === "waiting" ? "copper" : "jade"}>{statusLabel[item.status]}</Badge>
                      </span>
                      <span className="line-clamp-1 text-sm font-medium">{faNum(item.subject)}</span>
                      <span className="text-xs text-muted">{formatWhen(item.updatedAt, "Asia/Tehran")}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {tickets && filtered.length === 0 ? (
                <div className="grid justify-items-center gap-2 px-4 py-10 text-center">
                  <Search className="size-5 text-muted" />
                  <p className="text-sm font-semibold">{q ? "تیکتی پیدا نشد" : "هنوز تیکتی ندارید"}</p>
                  <p className="text-xs leading-5 text-muted">{q ? "عبارت دیگری را امتحان کنید." : "با تیکت جدید، درخواست‌تان را برای پشتیبانی بفرستید."}</p>
                </div>
              ) : null}
            </aside>

            {ticket ? (
              <>
                <section className="flex min-h-80 min-w-0 flex-col border-b border-line lg:h-full lg:min-h-0 lg:border-b-0 lg:border-e">
                  <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
                    <div>
                      <h2 className="text-base font-bold leading-6">{faNum(ticket.subject)}</h2>
                      <p className="mt-1 text-xs text-muted">
                        <span dir="ltr">{faNum(`TK-${ticket.code}`)}</span>
                        {" · "}
                        آخرین به‌روزرسانی {formatWhen(ticket.updatedAt, "Asia/Tehran")}
                      </p>
                    </div>
                    {ticket.status === "done" ? (
                      <Button
                        type="button"
                        variant="quiet"
                        disabled={pending}
                        onClick={async () => {
                          setPending(true);
                          const res = await reopenSupportTicketFn({ data: { id: ticket.id } });
                          setPending(false);
                          if (!res.ok) {
                            toast.error(res.error);
                            return;
                          }
                          toast.success("پرونده دوباره باز شد");
                          await load();
                        }}
                      >
                        باز کردن دوباره
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="quiet"
                        disabled={pending}
                        onClick={async () => {
                          setPending(true);
                          const res = await closeSupportTicketFn({ data: { id: ticket.id } });
                          setPending(false);
                          if (!res.ok) {
                            toast.error(res.error);
                            return;
                          }
                          toast.success("پرونده بسته شد");
                          await load();
                        }}
                      >
                        بستن پرونده
                      </Button>
                    )}
                  </div>
                  <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
                    {ticket.messages.map((message) => {
                      const mine = message.author !== "agent";
                      return (
                        <div key={message.id} className={cn("flex gap-3", !mine && "flex-row-reverse")}>
                          <span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold", mine ? "bg-paper-deep text-ink" : "bg-jade text-on-jade")}>
                            {mine ? "ش" : "پ"}
                          </span>
                          <div className={cn("max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-7", mine ? "bg-paper-deep" : "bg-jade text-on-jade")}>
                            <p>{faNum(message.body)}</p>
                            <p className={cn("mt-1 text-[11px]", mine ? "text-muted" : "text-on-jade/80")}>
                              {formatWhen(message.at, "Asia/Tehran").split("،")[0]} · <span dir="ltr">{formatClock(message.at, "Asia/Tehran")}</span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {ticket.status === "waiting" ? <p className="text-xs text-muted">منتظر جواب پشتیبانی هستید.</p> : null}
                    {ticket.status === "open" ? <p className="text-xs text-muted">پشتیبانی جواب داده. اگر حرفی مانده همین‌جا بنویسید.</p> : null}
                    {ticket.status === "done" ? <p className="text-xs text-muted">این پرونده بسته است. برای ادامه، دوباره بازش کنید.</p> : null}
                  </div>
                  <form
                    className="shrink-0 border-t border-line p-4"
                    onSubmit={async (event) => {
                      event.preventDefault();
                      const text = draft.trim();
                      if (text.length < 2) return;
                      setPending(true);
                      const res = await replySupportTicketFn({ data: { id: ticket.id, body: text } });
                      setPending(false);
                      if (!res.ok) {
                        toast.error(res.error);
                        return;
                      }
                      setDraft("");
                      await load();
                    }}
                  >
                    <Area
                      value={draft}
                      onChange={(event) => setDraft(event.target.value.slice(0, 1000))}
                      placeholder={ticket.status === "done" ? "برای نوشتن، پرونده را باز کنید" : "پاسخ‌تان را بنویسید…"}
                      rows={3}
                      disabled={ticket.status === "done" || pending}
                    />
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-xs text-muted">{faNum([...draft].length)} / {faNum(1000)}</span>
                      <Button type="submit" disabled={pending || ticket.status === "done" || draft.trim().length < 2}>ارسال پاسخ</Button>
                    </div>
                  </form>
                </section>
                <aside className="min-h-0 overflow-y-auto p-5 lg:h-full">
                  <h2 className="mb-4 text-sm font-semibold">وضعیت پرونده</h2>
                  <TicketTimeline ticket={ticket} />
                </aside>
              </>
            ) : (
              <div className="grid min-h-64 place-items-center lg:col-span-2 lg:h-full">
                {tickets === null ? null : <Empty title="گفت‌وگویی انتخاب نشده" body="یک تیکت از فهرست را باز کنید، یا تیکت تازه بسازید." />}
              </div>
            )}
          </div>
        </section>
      </div>

      {creating ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => { if (!pending) setCreating(false); }}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-ticket-title"
            className="grid w-full max-w-md gap-4 rounded-[1.375rem] border border-line bg-card p-5 text-ink"
            onClick={(event) => event.stopPropagation()}
          >
            <div>
              <h2 id="new-ticket-title" className="text-lg font-bold">تیکت جدید</h2>
              <p className="mt-1 text-sm text-muted">موضوع و متن درخواست را بنویسید.</p>
            </div>
            <form
              className="grid gap-3"
              onSubmit={async (event) => {
                event.preventDefault();
                if (subject.trim().length < 3) {
                  toast.error("موضوع تیکت را بنویسید");
                  return;
                }
                if (body.trim().length < 2) {
                  toast.error("متن پیام را بنویسید");
                  return;
                }
                setPending(true);
                const res = await createSupportTicketFn({ data: { subject: subject.trim(), body: body.trim() } });
                setPending(false);
                if (!res.ok) {
                  toast.error(res.error);
                  return;
                }
                toast.success("تیکت ثبت شد");
                setCreating(false);
                await load(res.data.id);
              }}
            >
              <Field label="موضوع"><TextInput value={subject} onChange={(event) => setSubject(event.target.value)} required minLength={3} /></Field>
              <Field label="پیام"><Area value={body} onChange={(event) => setBody(event.target.value.slice(0, 1000))} required rows={4} /></Field>
              <DialogActions>
                <Button type="button" variant="quiet" onClick={() => setCreating(false)}>انصراف</Button>
                <Button type="submit" disabled={pending}>{pending ? "در حال ثبت" : "ثبت تیکت"}</Button>
              </DialogActions>
            </form>
          </div>
        </div>
      ) : null}
    </Shell>
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

function TicketTimeline({ ticket }: { ticket: Ticket }) {
  const first = ticket.messages[0];
  const agent = [...ticket.messages].reverse().find((message) => message.author === "agent");
  const answered = Boolean(agent);
  const items = [
    { date: formatWhen(ticket.createdAt, "Asia/Tehran"), title: "ثبت تیکت", description: "درخواست شما ثبت شد", done: true },
    {
      date: answered && agent ? formatWhen(agent.at, "Asia/Tehran") : "هنوز پشتیبانی جواب نداده",
      title: "گفت‌وگو",
      description: answered ? "پشتیبانی جواب داده" : first ? "منتظر جواب پشتیبانی" : "",
      done: answered,
    },
    {
      date: ticket.status === "done" ? formatWhen(ticket.updatedAt, "Asia/Tehran") : "هنوز بسته نشده",
      title: "بستن پرونده",
      description: ticket.status === "done" ? "پرونده بسته شد" : "",
      done: ticket.status === "done",
    },
  ];
  const active = ticket.status === "done" ? 2 : answered ? 1 : 0;
  return (
    <ol>
      {items.map((item, index) => (
        <li key={item.title} className="relative flex gap-3 pb-5 last:pb-0">
          {index < items.length - 1 ? <span className="absolute start-[7px] top-4 bottom-0 w-px bg-line" /> : null}
          <span className={cn("relative z-10 mt-0.5 size-4 shrink-0 rounded-full border-2", index <= active && item.done ? "border-jade bg-jade" : index === active ? "border-jade bg-card" : "border-line bg-card")} />
          <span>
            <span className="block text-xs text-muted">{item.date}</span>
            <span className="block text-sm font-medium">{item.title}</span>
            {item.description ? <span className="block text-xs text-muted">{item.description}</span> : null}
          </span>
        </li>
      ))}
    </ol>
  );
}
