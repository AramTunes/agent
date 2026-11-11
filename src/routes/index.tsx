import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarCheck, Store, Waypoints } from "lucide-react";
import { useEffect, useState } from "react";
import { Shell, StartFreeLink } from "@/components/shell";
import { Badge, Card } from "@/components/ui";
import { businessesFn, categoriesFn } from "@/lib/api";
import { PageMark } from "@/lib/page-avatar";

type Category = { id: string; name: string; slug: string };
type Biz = { name: string; slug: string; city: string; category_name: string | null; description: string; is_demo: boolean; avatar?: string };

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [businesses, setBusinesses] = useState<Biz[]>([]);
  useEffect(() => {
    let live = true;
    Promise.all([categoriesFn(), businessesFn({ data: { limit: 6 } })]).then(([categories, businesses]) => {
      if (!live) return;
      setCategories((categories.ok ? categories.data : []) as Category[]);
      setBusinesses((businesses.ok ? (businesses.data.items ?? []) : []) as Biz[]);
    });
    return () => {
      live = false;
    };
  }, []);
  return (
    <Shell>
      <section className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-5">
          <Badge tone="copper">دستیار کسب‌وکار</Badge>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">کار کسب‌وکارت را آنلاین کن</h1>
          <p className="max-w-xl text-base leading-7 text-muted">
            ایجنت صفحهٔ کسب‌وکار است. نوبت، سفارش، منو، محصول و خدمات، هر کدام برای همان نوع کار. مشتری از یک لینک اقدام می‌کند.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/explore" search={{ q: "", category: "" }} className="inline-flex min-h-11 items-center rounded-xl bg-jade px-5 font-semibold text-on-jade">
              دیدن کسب‌وکارها
            </Link>
            <StartFreeLink className="px-5" />
          </div>
          <ul className="grid gap-3 sm:grid-cols-3">
            {[
              [Store, "صفحه کسب‌وکار", "معرفی، راه‌های ارتباط و لینک‌ها یکجا."],
              [CalendarCheck, "نوبت یا سفارش", "بسته به نوع کار، رزرو یا سفارش در پنل می‌آید."],
              [Waypoints, "برای هر کسب‌وکار", "آرایشگاه، کافه، فروشگاه و خدمات."],
            ].map(([Icon, title, body]) => (
              <li key={String(title)} className="rounded-card border border-line bg-card p-4">
                <Icon className="mb-2 size-5 text-jade" aria-hidden="true" />
                <div className="font-semibold">{String(title)}</div>
                <p className="mt-1 text-sm text-muted">{String(body)}</p>
              </li>
            ))}
          </ul>
        </div>
        <Card>
          <p className="text-xs font-semibold text-copper">نمونه صفحه، نه دادهٔ واقعی</p>
          <h2 className="mt-3 text-2xl font-extrabold">اصلاح مو</h2>
          <p className="mt-1 text-sm text-muted">آرایشگاه سرو · سارا کریمی</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-paper p-3">
              <div className="text-xs text-muted">ساعت</div>
              <div className="text-2xl font-bold tabular-nums">۱۱:۳۰</div>
            </div>
            <div className="rounded-xl bg-jade-soft p-3 text-jade-deep">
              <div className="text-xs">مدت</div>
              <div className="text-2xl font-bold">۴۵ دقیقه</div>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">بعد از ثبت‌نام، صفحهٔ کسب‌وکارت را می‌سازی و همان لینک را برای مشتری می‌فرستی.</p>
        </Card>
      </section>
      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-2xl font-bold">دسته‌ها</h2>
          <Link to="/explore" search={{ q: "", category: "" }} className="inline-flex items-center gap-1 text-sm font-semibold text-jade">
            همه <ArrowLeft className="size-4" />
          </Link>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <Link key={cat.id} to="/explore" search={{ category: cat.slug, q: "" }} className="shrink-0 rounded-full border border-line bg-card px-4 py-2 text-sm">
              {cat.name}
            </Link>
          ))}
        </div>
      </section>
      <section className="mt-10">
        <h2 className="mb-4 text-2xl font-bold">کسب‌وکارهای فعال</h2>
        {businesses.length === 0 ? (
          <p className="text-sm text-muted">هنوز صفحه‌ای منتشر نشده. اولین کسب‌وکار را از پنل بسازید.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((biz) => (
              <Link key={biz.slug} to="/b/$slug" params={{ slug: biz.slug }} className="flex items-start gap-3 rounded-card border border-line bg-card p-4 hover:border-jade">
                <PageMark slug={biz.slug} name={biz.name} avatar={biz.avatar} size={48} />
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold">{biz.name}</h3>
                    {biz.is_demo ? <Badge>نمونه</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm text-muted">{biz.category_name}{biz.city ? ` · ${biz.city}` : ""}</p>
                  <p className="mt-3 line-clamp-2 text-sm leading-6">{biz.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      <section className="mt-12 grid gap-4 rounded-card bg-ink p-6 text-on-ink sm:grid-cols-3">
        {[
          ["۱", "صفحهٔ کسب‌وکارت را بچین"],
          ["۲", "مشتری از لینک اقدام می‌کند"],
          ["۳", "نوبت، سفارش یا منو در پنل تو جمع می‌شود"],
        ].map(([n, text]) => (
          <div key={n}>
            <div className="text-sm text-copper">{n}</div>
            <p className="mt-1 font-semibold">{text}</p>
          </div>
        ))}
      </section>
      <p className="mt-8 text-xs text-muted">پرداخت آنلاین در این نسخه فعال نیست و وضعیت اشتراک «فعال» ساخته نمی‌شود.</p>
    </Shell>
  );
}
