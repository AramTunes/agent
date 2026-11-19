import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Shell } from "@/components/shell";
import { Button, Card, ErrorNote, Field, Skeleton, TextInput } from "@/components/ui";
import { OtpField } from "@/components/otp-field";
import { acceptStaffInviteFn, staffInviteCodeFn, staffInviteFn } from "@/lib/api";
import { faNum } from "@/lib/booking/fa";
import { adoptSession } from "@/lib/session";

export const Route = createFileRoute("/join/$token")({ component: JoinPage });

function JoinPage() {
  const { token } = Route.useParams();
  const [info, setInfo] = useState<{ businessName: string; name: string; title: string; phone: string } | null>(null);
  const [missing, setMissing] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [shownCode, setShownCode] = useState("");
  const [smsSent, setSmsSent] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    staffInviteFn(token).then((res) => {
      if (!res.ok) {
        setMissing(true);
        return;
      }
      setInfo(res.data);
      setName(res.data.name || "");
    });
  }, [token]);

  async function sendCode() {
    setError("");
    setPending(true);
    const res = await staffInviteCodeFn({ data: { token } });
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setShownCode(res.data.code ?? "");
    setSmsSent(Boolean(res.data.sms));
  }

  async function accept(event: FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    const res = await acceptStaffInviteFn({ data: { token, name: name.trim(), code: code.trim() } });
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    await adoptSession(res.data.token);
    window.location.assign("/panel");
  }

  return (
    <Shell>
      <div className="mx-auto grid w-full max-w-md gap-4">
        <h1 className="text-3xl font-extrabold">پیوستن به پرسنل</h1>
        {missing ? <Card><p className="text-sm leading-6">این لینک دیگر معتبر نیست. از صاحب حساب بخواهید دوباره دعوت کند.</p></Card> : null}
        {!info && !missing ? <Skeleton className="h-40" /> : null}
        {info ? (
          <Card>
            <p className="text-sm leading-7 text-muted">برای پیوستن به {info.businessName}{info.title ? ` به عنوان ${info.title}` : ""} نام خود را تأیید کنید. کد به شماره {faNum(info.phone)} می‌رود.</p>
            <form className="mt-4 grid gap-3" onSubmit={(event) => void accept(event)}>
              <Field label="نام"><TextInput value={name} onChange={(event) => setName(event.target.value)} required minLength={2} /></Field>
              {shownCode ? (
                <p className="rounded-xl bg-paper-deep px-3 py-2 text-sm leading-6">
                  پیامک وصل نیست. کد تأیید: <span className="font-bold" dir="ltr">{faNum(shownCode)}</span>
                </p>
              ) : smsSent ? (
                <p className="rounded-xl bg-paper-deep px-3 py-2 text-sm leading-6">کد تأیید پیامک شد.</p>
              ) : null}
              <Field label="کد تأیید"><OtpField value={code} onChange={setCode} /></Field>
              {error ? <ErrorNote>{error}</ErrorNote> : null}
              <div className="flex gap-2">
                <Button type="button" variant="quiet" disabled={pending} onClick={() => void sendCode()}>{shownCode ? "ارسال دوباره" : pending ? "در حال ارسال" : "دریافت کد"}</Button>
                <Button type="submit" variant="signup" disabled={pending || code.trim().length < 6}>{pending ? "در حال تأیید" : "تأیید و ورود"}</Button>
              </div>
            </form>
          </Card>
        ) : null}
      </div>
    </Shell>
  );
}
