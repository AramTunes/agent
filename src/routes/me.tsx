import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAccount, useBusinessId } from "@/components/account";
import { PageMark, fitAvatar } from "@/lib/page-avatar";
import { Shell } from "@/components/shell";
import { Badge, Button, Card, Empty, Field, Skeleton, TextInput } from "@/components/ui";
import { OtpField } from "@/components/otp-field";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { faNum, STATUS_FA } from "@/lib/booking/fa";
import { formatClock, formatDay, formatSlot, formatWhen } from "@/lib/booking/format";
import { availabilityFn, markReadFn, myBookingsFn, notificationsFn, rescheduleBookingFn, resetPhonePasswordFn, revokeSessionFn, sendPhoneCodeFn, sessionsFn, setBookingStatusFn, updateProfileFn } from "@/lib/api";
import { isInboxNote, noteTo, type AppNote } from "@/lib/notes";
import { adoptSession, signOut } from "@/lib/session";
import { addDaysYmd, todayYmd } from "@/lib/booking/time";
import { usePanelFollowups } from "@/lib/followups";
import { CancelReasonPick, customerCancelReasons } from "@/components/cancel-reasons";

export const Route = createFileRoute("/me")({ component: MePage });

type Booking = {
  id: string;
  businessName: string;
  timezone: string;
  serviceName: string;
  staffName: string;
  startsAt: string;
  status: string;
  businessId: string;
  businessSlug?: string;
  avatar?: string;
  serviceId: string;
  staffId: string;
  customerNote?: string;
};

function MePage() {
  const account = useAccount();
  const { businessId } = useBusinessId(account.me?.memberships);
  const current = account.me?.memberships.find((item) => item.businessId === businessId);
  const personal = account.me?.profile.pageFor === "self" && current?.name === account.me?.profile.pageName;
  const { follow, overdue, tables, zone } = usePanelFollowups(businessId, Boolean(personal), current?.role === "staff");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notes, setNotes] = useState<AppNote[]>([]);
  const [name, setName] = useState("");
  const [moveId, setMoveId] = useState("");
  const [cancelId, setCancelId] = useState("");
  const [moveDay, setMoveDay] = useState("");
  const [slots, setSlots] = useState<{ start: string; taken?: boolean }[] | null>(null);
  const [passOpen, setPassOpen] = useState(false);
  const [passCode, setPassCode] = useState("");
  const [shownCode, setShownCode] = useState("");
  const [smsSent, setSmsSent] = useState(false);
  const [nextPassword, setNextPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passError, setPassError] = useState("");
  const [passPending, setPassPending] = useState(false);
  const [devices, setDevices] = useState<{ id: string; device: string; lastSeen: string; current: boolean }[]>([]);
  const photoRef = useRef<HTMLInputElement>(null);

  function load() {
    myBookingsFn().then((res) => {
      if (res.ok) setBookings(res.data);
    });
    notificationsFn().then((res) => {
      if (res.ok) setNotes(res.data);
    });
    sessionsFn().then((res) => {
      if (res.ok) setDevices(res.data ?? []);
    });
  }

  async function openMove(item: Booking, day: string) {
    setMoveId(item.id);
    setMoveDay(day);
    setSlots(null);
    const res = await availabilityFn({
      data: { businessId: item.businessId, serviceId: item.serviceId, day, staffId: item.staffId, exceptBookingId: item.id },
    });
    const next = res.ok ? (res.data.slots ?? []) : [];
    setSlots(next.filter((slot: { taken?: boolean; start: string }) => !slot.taken && slot.start !== item.startsAt));
  }
  useEffect(() => {
    if (!account.user) return;
    load();
    if (account.me) {
      setName(account.me.profile.displayName);
    }
  }, [account.user?.id, account.me]);

  if (account.isPending || account.loading) {
    return <Shell><Skeleton className="h-40" /></Shell>;
  }
  if (!account.user) return <RedirectToSignIn />;

  const upcoming = bookings.filter((item) => item.status === "confirmed" || item.status === "pending");
  const past = bookings.filter((item) => item.status !== "confirmed" && item.status !== "pending");

  return (
    <Shell>
      <h1 className="text-3xl font-extrabold">نوبت‌های من</h1>
      <p className="mt-1 text-sm text-muted">{[
        account.me?.unread ? `${faNum(account.me.unread)} اعلان خوانده‌نشده` : "",
        follow.length + overdue.length + tables.length > 0 ? `${faNum(follow.length + overdue.length + tables.length)} پیگیری` : "",
      ].filter(Boolean).join(" · ") || "اعلان داخلی، نه پیامک"}</p>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-3">
          {upcoming.length === 0 ? <Empty title="نوبت آینده‌ای نیست" body="از فهرست کسب‌وکارها یک زمان آزاد انتخاب کنید." /> : null}
          {upcoming.map((item) => (
            <Card key={item.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-3">
                  <PageMark slug={item.businessSlug} name={item.businessName} avatar={item.avatar} size={40} />
                  <div>
                    <h2 className="font-bold">{item.serviceName}</h2>
                    <p className="text-sm text-muted">{item.businessName} · {item.staffName}</p>
                    <p className="mt-2 text-sm">{formatWhen(item.startsAt, item.timezone)}</p>
                    {item.customerNote ? <p className="mt-2 text-sm leading-6">{item.customerNote}</p> : null}
                  </div>
                </div>
                <Badge>{STATUS_FA[item.status] ?? item.status}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="danger" onClick={() => setCancelId(cancelId === item.id ? "" : item.id)}>لغو</Button>
                <Button variant="quiet" onClick={() => void openMove(item, todayYmd(item.timezone))}>جابه‌جایی</Button>
              </div>
              {cancelId === item.id ? (
                <div className="mt-3 grid gap-2">
                  <p className="text-sm font-semibold">یک دلیل را بزنید تا نوبت لغو شود</p>
                  <CancelReasonPick
                    reasons={customerCancelReasons}
                    onPick={async (reason) => {
                      const res = await setBookingStatusFn({ data: { bookingId: item.id, status: "cancelled", reason } });
                      if (!res.ok) toast.error(res.error);
                      else {
                        toast.success("نوبت لغو شد");
                        setCancelId("");
                        load();
                      }
                    }}
                  />
                </div>
              ) : null}
              {moveId === item.id ? (
                <div className="mt-3 grid gap-3">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {Array.from({ length: 14 }, (_, index) => addDaysYmd(todayYmd(item.timezone), index, item.timezone)).map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => void openMove(item, day)}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${day === moveDay ? "bg-ink text-on-ink" : "border border-line"}`}
                      >
                        {formatDay(day)}
                      </button>
                    ))}
                  </div>
                  {slots === null ? <p className="text-sm text-muted">در حال بررسی وقت‌ها</p> : null}
                  {slots && slots.length === 0 ? <p className="text-sm text-muted">در این روز وقت آزادی نیست.</p> : null}
                  <div className="grid grid-cols-3 gap-2">
                    {(slots ?? []).map((slot) => (
                      <button key={slot.start} type="button" className="min-h-11 rounded-xl border border-line text-sm" onClick={async () => {
                        const res = await rescheduleBookingFn({ data: { bookingId: item.id, start: slot.start, staffId: item.staffId } });
                        if (!res.ok) toast.error(res.error);
                        else { toast.success("زمان عوض شد"); setMoveId(""); load(); }
                      }}>{formatClock(slot.start, item.timezone)}</button>
                    ))}
                  </div>
                </div>
              ) : null}
            </Card>
          ))}
          {past.length ? <h2 className="mt-2 font-bold">تاریخچه</h2> : null}
          {past.map((item) => (
            <Card key={item.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-3">
                  <PageMark slug={item.businessSlug} name={item.businessName} avatar={item.avatar} size={40} />
                  <div>
                    <div className="font-semibold">{item.serviceName}</div>
                    <div className="text-sm text-muted">{item.businessName} · {formatWhen(item.startsAt, item.timezone)}</div>
                    {item.customerNote ? <p className="mt-2 text-sm leading-6">{item.customerNote}</p> : null}
                  </div>
                </div>
                <Badge tone="muted">{STATUS_FA[item.status] ?? item.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
        <div className="grid gap-3">
          <Card>
            <div className="mb-3 flex items-center gap-3">
              <PageMark name={account.me?.profile.displayName || "حساب"} avatar={account.me?.profile.avatar} size={56} />
              <h2 className="font-bold">حساب کاربری</h2>
            </div>
            <form className="mt-3 grid gap-3" onSubmit={async (event) => {
              event.preventDefault();
              const res = await updateProfileFn({ data: { displayName: name } });
              if (!res.ok) toast.error(res.error);
              else { toast.success("حساب ذخیره شد"); account.reload(); }
            }}>
              <input
                ref={photoRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    void fitAvatar(String(reader.result || "")).then(async (avatar) => {
                      if (!avatar) {
                        toast.error("این تصویر باز نشد");
                        return;
                      }
                      const res = await updateProfileFn({ data: { displayName: name.trim() || account.me?.profile.displayName, avatar } });
                      if (!res.ok) toast.error(res.error);
                      else {
                        toast.success("عکس حساب ذخیره شد");
                        account.reload();
                        window.dispatchEvent(new Event("agent-avatar"));
                      }
                    });
                  };
                  reader.readAsDataURL(file);
                }}
              />
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="quiet" onClick={() => photoRef.current?.click()}>عکس صاحب حساب</Button>
                {account.me?.profile.avatar ? (
                  <Button type="button" variant="quiet" onClick={async () => {
                    const res = await updateProfileFn({ data: { displayName: name.trim() || account.me?.profile.displayName, avatar: "" } });
                    if (!res.ok) toast.error(res.error);
                    else {
                      account.reload();
                      window.dispatchEvent(new Event("agent-avatar"));
                    }
                  }}>حذف عکس</Button>
                ) : null}
              </div>
              <p className="text-xs leading-5 text-muted">این عکس مال خود شماست و با عکس صفحه کسب‌وکار فرق دارد. عکس صفحه را از تنظیمات صفحه عوض کنید.</p>
              <Field label="نام"><TextInput value={name} onChange={(e) => setName(e.target.value)} /></Field>
              <p className="text-sm leading-6">
                <span className="text-muted">شماره موبایل</span>
                <span className="mt-1 block" dir="ltr">{account.me?.profile.phone ? faNum(account.me.profile.phone) : "ثبت نشده"}</span>
              </p>
              <p className="text-xs leading-5 text-muted">شماره بعد از ساخت حساب عوض نمی‌شود. اگر هنگام ورود یا ثبت‌نام اشتباه زدید، قبل از تأیید برگردید و درستش کنید.</p>
              <Button type="submit">ذخیره</Button>
            </form>
          </Card>
          <Card>
            <h2 className="font-bold">{account.me?.profile.hasPassword ? "عوض کردن رمز" : "گذاشتن رمز"}</h2>
            <p className="mt-1 text-sm leading-6 text-muted">کد به شمارهٔ همین حساب می‌رود. شماره را از اینجا عوض نمی‌کنیم.</p>
            {shownCode ? (
              <p className="mt-3 rounded-xl bg-paper-deep px-3 py-2 text-sm leading-6">
                پیامک وصل نیست. کد تأیید: <span className="font-bold" dir="ltr">{faNum(shownCode)}</span>
              </p>
            ) : smsSent ? (
              <p className="mt-3 rounded-xl bg-paper-deep px-3 py-2 text-sm leading-6">کد تأیید پیامک شد.</p>
            ) : null}
            {!passOpen ? (
              <Button
                type="button"
                className="mt-3"
                disabled={passPending || !account.me?.profile.phone}
                onClick={() => {
                  setPassError("");
                  setPassPending(true);
                  void sendPhoneCodeFn({ data: { phone: account.me?.profile.phone, purpose: "reset" } }).then((res) => {
                    setPassPending(false);
                    if (!res.ok) {
                      setPassError(res.error);
                      return;
                    }
                    setShownCode(res.data.code ?? "");
                    setSmsSent(Boolean(res.data.sms));
                    setPassCode("");
                    setPassOpen(true);
                  });
                }}
              >
                {passPending ? "در حال ارسال" : "دریافت کد"}
              </Button>
            ) : (
              <form
                className="mt-3 grid gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (nextPassword.length < 8) {
                    setPassError("رمز باید حداقل ۸ نویسه باشد");
                    return;
                  }
                  if (nextPassword !== confirm) {
                    setPassError("تکرار رمز با رمز یکی نیست");
                    return;
                  }
                  setPassError("");
                  setPassPending(true);
                  void resetPhonePasswordFn({
                    data: { phone: account.me?.profile.phone, code: passCode.trim(), password: nextPassword, confirm },
                  }).then(async (res) => {
                    setPassPending(false);
                    if (!res.ok) {
                      setPassError(res.error);
                      return;
                    }
                    await adoptSession(res.data.token);
                    setPassOpen(false);
                    setNextPassword("");
                    setConfirm("");
                    setPassCode("");
                    setShownCode("");
                    toast.success("رمز ذخیره شد");
                    account.reload();
                  });
                }}
              >
                <Field label="کد تأیید"><OtpField value={passCode} onChange={setPassCode} /></Field>
                <Field label="رمز تازه" hint="حداقل ۸ نویسه">
                  <TextInput type="password" dir="ltr" className="text-left" autoComplete="new-password" value={nextPassword} onChange={(event) => setNextPassword(event.target.value)} minLength={8} />
                </Field>
                <Field label="تکرار رمز">
                  <TextInput type="password" dir="ltr" className="text-left" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} minLength={8} />
                </Field>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="quiet" disabled={passPending} onClick={() => { setPassOpen(false); setPassError(""); }}>انصراف</Button>
                  <Button
                    type="button"
                    variant="quiet"
                    disabled={passPending}
                    onClick={() => {
                      setPassPending(true);
                      void sendPhoneCodeFn({ data: { phone: account.me?.profile.phone, purpose: "reset" } }).then((res) => {
                        setPassPending(false);
                        if (!res.ok) {
                          setPassError(res.error);
                          return;
                        }
                        setShownCode(res.data.code ?? "");
                        setSmsSent(Boolean(res.data.sms));
                        setPassCode("");
                      });
                    }}
                  >
                    ارسال دوباره
                  </Button>
                  <Button type="submit" disabled={passPending || passCode.trim().length < 6}>{passPending ? "در حال ذخیره" : "ذخیره رمز"}</Button>
                </div>
              </form>
            )}
            {passError ? <p className="mt-3 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{passError}</p> : null}
          </Card>
          <Card>
            <h2 className="font-bold">دستگاه‌های واردشده</h2>
            <p className="mt-1 text-sm leading-6 text-muted">هر دستگاهی که با آن وارد شوید جدا می‌ماند. اگر ۳۰ روز از آن استفاده نکنید، خودش خارج می‌شود. خروج فقط همین دستگاه را می‌بندد.</p>
            <ul className="mt-3 grid gap-2">
              {devices.length === 0 ? <li className="text-sm text-muted">دستگاهی نیست.</li> : null}
              {devices.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{item.device}{item.current ? " · این دستگاه" : ""}</span>
                    {item.lastSeen ? <span className="block text-xs text-muted">آخرین استفاده {new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(item.lastSeen))}</span> : null}
                  </span>
                  <Button type="button" variant="quiet" onClick={async () => {
                    const res = await revokeSessionFn({ data: { id: item.id } });
                    if (!res.ok) {
                      toast.error(res.error);
                      return;
                    }
                    if (res.data.current) {
                      await signOut();
                      return;
                    }
                    setDevices((list) => list.filter((row) => row.id !== item.id));
                  }}>خروج</Button>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="font-bold">اعلان‌ها</h2>
              <button type="button" className="text-sm text-jade" onClick={() => markReadFn({ data: {} }).then(() => { load(); account.reload(); })}>خواندم</button>
            </div>
            <h3 className="mt-4 font-bold">ثبت سفارش و نوبت</h3>
            <p className="mt-1 text-xs leading-5 text-muted">هر وقت مشتری نوبت یا سفارش ثبت کند، این‌جا می‌آید.</p>
            <ul className="mt-2 grid gap-2">
              {notes.filter((note) => isInboxNote(note.kind)).length === 0 ? <li className="text-sm text-muted">هنوز چیزی ثبت نشده.</li> : null}
              {notes.filter((note) => isInboxNote(note.kind)).map((note) => (
                <li key={note.id}><NoteRow note={note} /></li>
              ))}
            </ul>
            <h3 className="mt-5 font-bold">سیستم و کسب‌وکار</h3>
            <p className="mt-1 text-xs leading-5 text-muted">پیگیری، تغییر وضعیت و پیام‌های خود برنامه.</p>
            <ul className="mt-2 grid gap-2">
              {follow.length === 0 && overdue.length === 0 && tables.length === 0 && notes.every((note) => isInboxNote(note.kind)) ? <li className="text-sm text-muted">اعلانی نیست.</li> : null}
              {follow.map((item) => (
                <li key={item.id}>
                  <Link to={item.to} className="block rounded-xl bg-paper px-3 py-2">
                    <div className="font-semibold">نیاز به پیگیری</div>
                    <p className="text-sm leading-6">{item.text}</p>
                    {item.done != null && item.total != null ? (
                      <p className="text-xs text-muted">{faNum(item.done)} مرحله از {faNum(item.total)} مرحله انجام شده</p>
                    ) : null}
                  </Link>
                </li>
              ))}
              {overdue.map((item) => (
                <li key={item.id}>
                  <Link to="/panel" className="block rounded-xl bg-paper px-3 py-2">
                    <div className="font-semibold">تعیین وضعیت نوبت</div>
                    <p className="text-sm leading-6">{item.customer || "مشتری"}{item.phone ? ` · ${faNum(item.phone)}` : ""}</p>
                    <p className="text-xs leading-5 text-muted">{formatWhen(item.startsAt, zone)} · {item.service} · {item.staff}</p>
                  </Link>
                </li>
              ))}
              {tables.map((item) => (
                <li key={item.id}>
                  <Link to="/panel/orders" className="block rounded-xl bg-paper px-3 py-2">
                    <div className="font-semibold">آزادسازی میز {faNum(item.number)}</div>
                    <p className="text-sm leading-6">{item.customer}{item.phone ? ` · ${faNum(item.phone)}` : ""}</p>
                    <p className="text-xs leading-5 text-muted">{formatSlot(item.startsAt)}</p>
                  </Link>
                </li>
              ))}
              {notes.filter((note) => !isInboxNote(note.kind)).map((note) => (
                <li key={note.id}><NoteRow note={note} /></li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </Shell>
  );
}

function NoteRow({ note }: { note: AppNote }) {
  const to = noteTo(note.kind);
  const body = (
    <>
      <div className="font-semibold">{note.title}</div>
      <p className="whitespace-pre-line text-sm leading-6">{note.body}</p>
    </>
  );
  if (!to) return <div className={note.read ? "text-muted" : ""}>{body}</div>;
  return <Link to={to} className={`block rounded-xl bg-paper px-3 py-2 ${note.read ? "text-muted" : ""}`}>{body}</Link>;
}
