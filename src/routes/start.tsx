import { createFileRoute } from "@tanstack/react-router";
import { Link2, Store } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Shell } from "@/components/shell";
import { Button, Card, ErrorNote, Field, Skeleton, Stepper, TextInput } from "@/components/ui";
import { OtpField } from "@/components/otp-field";
import { PhoneInput } from "@/components/phone-input";
import { isIranMobile } from "@/lib/iran-phone";
import { enDigits, faNum } from "@/lib/booking/fa";
import { adoptSession } from "@/lib/session";
import { useAccount } from "@/components/account";
import { categoriesFn, createPageFn, registerPersonFn, sendPhoneCodeFn } from "@/lib/api";

export const Route = createFileRoute("/start")({
  component: StartPage,
});

function StartPage() {
  const account = useAccount();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [phase, setPhase] = useState<"account" | "page">("account");
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [shownCode, setShownCode] = useState("");
  const [smsSent, setSmsSent] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [categoriesReady, setCategoriesReady] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [pageFor, setPageFor] = useState<"self" | "business" | "">("");
  const [pageName, setPageName] = useState("");
  const [username, setUsername] = useState("");
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    categoriesFn().then((res) => {
      if (res.ok) setCategories(res.data);
      else setCategoryError(res.error || "حوزه‌ها خوانده نشد");
      setCategoriesReady(true);
    });
    setDomain(window.location.hostname);
  }, []);

  useEffect(() => {
    if (!account.user || account.loading) return;
    if ((account.me?.memberships.length ?? 0) > 0) {
      window.location.assign("/panel");
      return;
    }
    setPhase("page");
    setStep(0);
  }, [account.user, account.loading, account.me]);

  function requestCode(event?: React.FormEvent) {
    event?.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError("نام را بنویسید");
    setPending(true);
    void (async () => {
      const res = await sendPhoneCodeFn({ data: { phone, purpose: "signup" } });
      setPending(false);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setShownCode(res.data.code ?? "");
      setSmsSent(Boolean(res.data.sms));
      setCode("");
      setStep(2);
    })();
  }

  async function finishAccount(withPassword: boolean) {
    setError("");
    if (withPassword) {
      if (password.length < 8) {
        setError("رمز باید حداقل ۸ نویسه باشد");
        return;
      }
      if (password !== confirm) {
        setError("تکرار رمز با رمز یکی نیست");
        return;
      }
    }
    setPending(true);
    const res = await registerPersonFn({
      data: { name: name.trim(), phone, code: code.trim(), ...(withPassword ? { password, confirm } : {}) },
    });
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    await adoptSession(res.data.token);
    setPhase("page");
    setStep(0);
    account.reload();
  }

  async function finishPage(event?: React.FormEvent) {
    event?.preventDefault();
    setError("");
    if (!categoryId) return setError("حوزه فعالیت را انتخاب کنید");
    if (!pageFor) return setError("یکی را انتخاب کنید");
    if (pageName.trim().length < 2) return setError("اسم صفحه را بنویسید");
    if (!/^[\p{L}\p{N}_]{3,24}$/u.test(username.trim())) return setError("نام کاربری باید ۳ تا ۲۴ حرف، عدد یا _ باشد");
    setPending(true);
    const res = await createPageFn({
      data: { categoryId, pageFor, pageName: pageName.trim(), username: username.trim() },
    });
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    window.location.assign("/panel");
  }

  if (account.isPending || (account.user && account.loading && !account.me)) {
    return <Shell><Skeleton className="h-40" /></Shell>;
  }

  const accountSteps = [{ label: "نام" }, { label: "موبایل" }, { label: "کد" }, { label: "رمز" }];
  const pageSteps = [{ label: "حوزه" }, { label: "برای کی" }, { label: "اسم" }, { label: "کاربری" }];

  return (
    <Shell>
      <div className="mx-auto grid w-full max-w-xl gap-6">
        <Stepper className="w-full" current={step} steps={phase === "account" ? accountSteps : pageSteps} />
        <div className="grid gap-3">
          <h1 className="text-3xl font-extrabold">{phase === "account" ? ["نام شما", "شماره موبایل", "کد تأیید", "رمز عبور"][step] : ["حوزه فعالیت", "این صفحه برای کیست", "اسم صفحه", "نام کاربری"][step]}</h1>
          <p className="text-sm leading-7 text-muted">
            {phase === "account"
              ? "اول حساب شخصی ساخته می‌شود. بعد صفحه کسب‌وکار یا شخصی را جدا می‌سازید."
              : "این مرحله صفحه را می‌سازد و از حساب شخصی جداست."}
          </p>
          <Card>
            {phase === "account" && step === 0 ? (
              <form className="grid gap-3" onSubmit={(event) => { event.preventDefault(); if (name.trim().length < 2) setError("نام را بنویسید"); else { setError(""); setStep(1); } }}>
                <Field label="نام">
                  <TextInput value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
                </Field>
                {error ? <ErrorNote>{error}</ErrorNote> : null}
                <Button type="submit" variant="signup">ادامه</Button>
              </form>
            ) : null}
            {phase === "account" && step === 1 ? (
              <form className="grid gap-3" onSubmit={requestCode}>
                <Field label="شماره موبایل">
                  <PhoneInput value={phone} onChange={setPhone} />
                </Field>
                {error ? <ErrorNote>{error}</ErrorNote> : null}
                <div className="flex gap-2">
                  <Button type="button" variant="quiet" onClick={() => { setError(""); setStep(0); }}>بازگشت</Button>
                  <Button type="submit" variant="signup" disabled={pending || !isIranMobile(phone)}>{pending ? "در حال ارسال" : "دریافت کد"}</Button>
                </div>
              </form>
            ) : null}
            {phase === "account" && step === 2 ? (
              <form className="grid gap-3" onSubmit={(event) => { event.preventDefault(); if (code.trim().length < 6) setError("کد را کامل وارد کنید"); else { setError(""); setStep(3); } }}>
                {shownCode ? (
                  <p className="rounded-xl bg-paper-deep px-3 py-2 text-sm leading-6">
                    پیامک وصل نیست. کد تأیید: <span className="font-bold" dir="ltr">{faNum(shownCode)}</span>
                  </p>
                ) : smsSent ? (
                  <p className="rounded-xl bg-paper-deep px-3 py-2 text-sm leading-6">کد تأیید پیامک شد.</p>
                ) : null}
                <Field label="کد تأیید">
                  <OtpField value={code} onChange={setCode} />
                </Field>
                {error ? <ErrorNote>{error}</ErrorNote> : null}
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="quiet" onClick={() => { setError(""); setCode(""); setStep(1); }}>تغییر شماره</Button>
                  <Button type="button" variant="quiet" disabled={pending} onClick={() => requestCode()}>ارسال دوباره</Button>
                  <Button type="submit" variant="signup" disabled={code.trim().length < 6}>ادامه</Button>
                </div>
              </form>
            ) : null}
            {phase === "account" && step === 3 ? (
              <form className="grid gap-3" onSubmit={(event) => { event.preventDefault(); void finishAccount(true); }}>
                <p className="text-sm leading-6 text-muted">رمز اختیاری است. اگر نگذارید، هر بار با کد وارد می‌شوید.</p>
                <Field label="رمز عبور" hint="حداقل ۸ نویسه">
                  <TextInput type="password" dir="ltr" className="text-left" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} />
                </Field>
                <Field label="تکرار رمز">
                  <TextInput type="password" dir="ltr" className="text-left" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} minLength={8} />
                </Field>
                {error ? <ErrorNote>{error}</ErrorNote> : null}
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="quiet" onClick={() => { setError(""); setStep(2); }}>بازگشت</Button>
                  <Button type="button" variant="quiet" disabled={pending} onClick={() => void finishAccount(false)}>{pending ? "در حال ساخت" : "بدون رمز"}</Button>
                  <Button type="submit" variant="signup" disabled={pending}>{pending ? "در حال ساخت" : "ذخیره رمز"}</Button>
                </div>
              </form>
            ) : null}
            {phase === "page" && step === 0 ? (
              categoryError ? <ErrorNote>{categoryError}</ErrorNote> : !categoriesReady ? <Skeleton className="h-24" /> : categories.length === 0 ? <ErrorNote>حوزه‌ای برای انتخاب نیست.</ErrorNote> : (
              <div className="grid gap-2 sm:grid-cols-2">
                {categories.map((cat) => (
                  <button key={cat.id} type="button" className={categoryId === cat.id ? "min-h-11 rounded-xl bg-jade px-3 text-sm font-semibold text-on-jade" : "min-h-11 rounded-xl border border-line bg-card px-3 text-sm"} onClick={() => { setCategoryId(cat.id); setError(""); setStep(1); }}>
                    {cat.name}
                  </button>
                ))}
              </div>
              )
            ) : null}
            {phase === "page" && step === 1 ? (
              <div className="grid gap-3">
                <Choice on={pageFor === "self"} onClick={() => { setPageFor("self"); setPageName((account.me?.profile.displayName || name).trim()); setError(""); setStep(2); }} title="برای خودم" text="صفحه با اسم خودتان ساخته می‌شود." />
                <Choice on={pageFor === "business"} onClick={() => { setPageFor("business"); setPageName(""); setError(""); setStep(2); }} title="برای کسب‌وکارم" text="اسم کسب‌وکار را جدا می‌نویسید." />
              </div>
            ) : null}
            {phase === "page" && step === 2 && pageFor === "self" ? (
              <p className="text-sm leading-7">اسم صفحه همان اسم حساب است: <span className="font-bold">{(account.me?.profile.displayName || name).trim() || "نام شما"}</span></p>
            ) : null}
            {phase === "page" && step === 2 && pageFor !== "self" ? (
              <Field label="اسم کسب‌وکار">
                <FieldBox icon={<Store className="size-4" />}>
                  <input value={faNum(pageName)} onChange={(event) => setPageName(enDigits(event.target.value))} className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
                </FieldBox>
              </Field>
            ) : null}
            {phase === "page" && step === 3 ? (
              <Field label="نام کاربری">
                <div dir="ltr" className="flex min-h-11 overflow-hidden rounded-xl border border-line bg-card focus-within:border-jade">
                  <span className="flex shrink-0 items-center gap-1.5 border-e border-line bg-paper-deep px-3 text-sm text-muted">
                    <Link2 className="size-4 shrink-0" aria-hidden="true" />
                    <span className="max-w-36 truncate">{faNum(domain || "…")}/</span>
                  </span>
                  <input value={faNum(username)} onChange={(event) => setUsername(enDigits(event.target.value))} autoCapitalize="none" spellCheck={false} placeholder="username" className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" />
                </div>
              </Field>
            ) : null}
            {phase === "page" && step >= 2 ? (
              <div className="mt-4 grid gap-3">
                {error ? <ErrorNote>{error}</ErrorNote> : null}
                <div className="flex gap-2">
                  <Button type="button" variant="quiet" onClick={() => { setError(""); setStep((value) => Math.max(0, value - 1)); }}>بازگشت</Button>
                  {step === 2 ? <Button type="button" variant="signup" onClick={() => { const own = (account.me?.profile.displayName || name).trim(); if (pageFor === "self") { if (own.length < 2) setError("اول نام خودتان را بنویسید"); else { setPageName(own); setError(""); setStep(3); } } else if (pageName.trim().length < 2) setError("اسم کسب‌وکار را بنویسید"); else { setError(""); setStep(3); } }}>ادامه</Button> : null}
                  {step === 3 ? <Button type="button" variant="signup" disabled={pending} onClick={() => void finishPage()}>{pending ? "در حال ساخت" : "ساخت صفحه"}</Button> : null}
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </Shell>
  );
}

function FieldBox({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-11 items-center gap-2 rounded-xl border border-line bg-card px-3 focus-within:border-jade">
      <span className="shrink-0 text-muted" aria-hidden="true">{icon}</span>
      {children}
    </div>
  );
}

function Choice({ on, onClick, title, text }: { on: boolean; onClick: () => void; title: string; text: string }) {
  return (
    <button type="button" onClick={onClick} className={on ? "rounded-xl bg-jade px-4 py-4 text-start text-on-jade" : "rounded-xl border border-line px-4 py-4 text-start"}>
      <div className="font-bold">{title}</div>
      <p className={on ? "mt-1 text-sm" : "mt-1 text-sm text-muted"}>{text}</p>
    </button>
  );
}
