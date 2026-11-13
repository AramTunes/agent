import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccount, useBusinessId } from "@/components/account";
import { PageMark } from "@/lib/page-avatar";
import { Shell } from "@/components/shell";
import { Badge, Button, Card, Empty, Field, Skeleton, TextInput } from "@/components/ui";
import { OtpField } from "@/components/otp-field";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { faNum, STATUS_FA } from "@/lib/booking/fa";
import { formatWhen } from "@/lib/booking/format";
import { availabilityFn, markReadFn, myBookingsFn, notificationsFn, rescheduleBookingFn, resetPhonePasswordFn, sendPhoneCodeFn, setBookingStatusFn, updateProfileFn } from "@/lib/api";
import { adoptSession } from "@/lib/session";
import { civilInZone, ymd } from "@/lib/booking/time";
import { usePanelFollowups } from "@/lib/followups";

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
  customerNote?: string;
};

function MePage() {
  const account = useAccount();
  const { businessId } = useBusinessId(account.me?.memberships);
  const current = account.me?.memberships.find((item) => item.businessId === businessId);
  const personal = account.me?.profile.pageFor === "self" && current?.name === account.me?.profile.pageName;
  const { follow, overdue, zone } = usePanelFollowups(businessId, Boolean(personal), current?.role === "staff");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notes, setNotes] = useState<{ id: string; title: string; body: string; kind?: string; read: boolean; createdAt: string }[]>([]);
  const [name, setName] = useState("");
  const [moveId, setMoveId] = useState("");
  const [slots, setSlots] = useState<{ start: string }[]>([]);
  const [passOpen, setPassOpen] = useState(false);
  const [passCode, setPassCode] = useState("");
  const [shownCode, setShownCode] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passError, setPassError] = useState("");
  const [passPending, setPassPending] = useState(false);

  function load() {
    myBookingsFn().then((res) => {
      if (res.ok) setBookings(res.data);
    });
    notificationsFn().then((res) => {
      if (res.ok) setNotes(res.data);
    });
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
        follow.length + overdue.length > 0 ? `${faNum(follow.length + overdue.length)} پیگیری` : "",
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
                <Button variant="danger" onClick={async () => {
                  const res = await setBookingStatusFn({ data: { bookingId: item.id, status: "cancelled", reason: "لغو توسط مشتری" } });
                  if (!res.ok) toast.error(res.error);
                  else { toast.success("نوبت لغو شد"); load(); }
                }}>لغو</Button>
                <Button variant="quiet" onClick={async () => {
                  setMoveId(item.id);
                  const c = civilInZone(new Date(item.startsAt), item.timezone);
                  const day = ymd(c.year, c.month, c.day);
                  const res = await availabilityFn({ data: { businessId: item.businessId, serviceId: item.serviceId, day, staffId: "" } });
                  setSlots(res.ok ? res.data.slots : []);
                }}>جابه‌جایی</Button>
              </div>
              {moveId === item.id ? (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {slots.slice(0, 12).map((slot) => (
                    <button key={slot.start} type="button" className="min-h-11 rounded-xl border border-line text-sm" onClick={async () => {
                      const res = await rescheduleBookingFn({ data: { bookingId: item.id, start: slot.start, staffId: null } });
                      if (!res.ok) toast.error(res.error);
                      else { toast.success("زمان عوض شد"); setMoveId(""); load(); }
                    }}>{formatWhen(slot.start, item.timezone)}</button>
                  ))}
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
            <div className="flex items-center justify-between">
              <h2 className="font-bold">اعلان‌های داخلی</h2>
              <button type="button" className="text-sm text-jade" onClick={() => markReadFn({ data: {} }).then(() => { load(); account.reload(); })}>خواندم</button>
            </div>
            <ul className="mt-3 grid gap-3">
              {notes.length === 0 && follow.length === 0 && overdue.length === 0 ? <li className="text-sm text-muted">اعلانی نیست.</li> : null}
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
              {notes.map((note) => (
                <li key={note.id} className={note.read ? "text-muted" : ""}>
                  {note.kind === "menu_order" || note.kind === "booking_created" ? (
                    <Link to={note.kind === "menu_order" ? "/panel/orders" : "/panel/calendar"} className="block">
                      <div className="font-semibold">{note.title}</div>
                      <p className="whitespace-pre-line text-sm leading-6">{note.body}</p>
                    </Link>
                  ) : (
                    <>
                      <div className="font-semibold">{note.title}</div>
                      <p className="whitespace-pre-line text-sm leading-6">{note.body}</p>
                    </>
                  )}
                </li>
              ))}
              {Math.max(0, (account.me?.unread ?? 0) - notes.filter((note) => !note.read).length) > 0 ? (
                <li className="text-xs text-muted">بعضی اعلان‌های قدیمی‌تر در این فهرست نیستند. عدد بالا همهٔ خوانده‌نشده‌هاست.</li>
              ) : null}
            </ul>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
