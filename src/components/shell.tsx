import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, Bell, Calendar, ClipboardList, Ellipsis, LayoutDashboard, Menu, Sparkles, User, Users, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { AccountChip, useCurrentUserState } from "@/lib/session";
import { ThemeSwitch } from "@/lib/theme";
import { DesktopChrome } from "@/components/desktop-nav";
import { useAccount, useBusinessId } from "@/components/account";
import { focusNav } from "@/lib/business-focus";

const links = [
  { to: "/explore", label: "کسب‌وکارها" },
  { to: "/me", label: "نوبت‌های من" },
  { to: "/panel", label: "پنل کسب‌وکار" },
] as const;

export function Shell({ children, header }: { children: ReactNode; header?: ReactNode }) {
  const { user } = useCurrentUserState();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <div className={`min-h-dvh ${user ? "lg:ps-64" : ""}`}>
      {user ? <DesktopChrome /> : null}
      {header ? (
        <div className={user ? "lg:hidden" : undefined}>{header}</div>
      ) : (
      <header className={`sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur ${user ? "lg:hidden" : ""}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight">
            <span className="grid size-9 place-items-center rounded-xl bg-jade text-on-jade">
              <Sparkles className="size-5" aria-hidden="true" />
            </span>
            ایجنت
          </Link>
          <nav className={user ? "hidden" : "hidden flex-1 items-center gap-1 text-sm md:flex"}>
            {links.map((link) => (
              <a
                key={link.to}
                href={link.to}
                className="shrink-0 rounded-lg px-3 py-2 text-muted hover:bg-card hover:text-ink"
              >
                {link.label}
              </a>
            ))}
            {user ? (
              <Link
                to="/admin"
                className="shrink-0 rounded-lg px-3 py-2 text-muted hover:bg-card hover:text-ink"
                activeProps={{ className: "shrink-0 rounded-lg bg-card px-3 py-2 font-semibold text-ink" }}
              >
                مدیریت
              </Link>
            ) : null}
          </nav>
          <div className={user ? "hidden" : "hidden items-center gap-2 md:flex"}>
            <ThemeSwitch className="w-40" />
            {user ? (
              <>
                <Link to="/me" aria-label="اعلان‌ها" className="grid size-11 place-items-center rounded-xl hover:bg-card">
                  <Bell className="size-5" />
                </Link>
                <AccountChip />
              </>
            ) : (
              <>
                <StartFreeLink className="px-3 text-sm" />
                <LoginLink />
              </>
            )}
          </div>
          <div className={user ? "flex items-center gap-2" : "flex items-center gap-2 md:hidden"} dir="ltr">
            {user ? (
              <button
                type="button"
                className="grid size-11 place-items-center rounded-xl border border-line bg-card text-ink"
                aria-label="منو"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(true)}
              >
                <Menu className="size-5" />
              </button>
            ) : (
              <>
                <input id="site-menu" type="checkbox" className="peer sr-only" />
                <label htmlFor="site-menu" className="grid size-11 cursor-pointer place-items-center rounded-xl border border-line bg-card text-ink" aria-label="منو">
                  <Menu className="size-5" />
                </label>
                <div className="invisible fixed inset-0 z-40 peer-checked:visible">
                  <label htmlFor="site-menu" className="absolute inset-0 bg-black/40" aria-label="بستن منو" />
                  <aside className="absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col border-r border-line bg-paper shadow-2xl">
                    <div className="flex items-center justify-between border-b border-line px-4 py-3">
                      <span className="font-extrabold">منو</span>
                      <label htmlFor="site-menu" className="grid size-11 cursor-pointer place-items-center rounded-xl hover:bg-card" aria-label="بستن">
                        <X className="size-5" />
                      </label>
                    </div>
                    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
                      {links.map((link) => (
                        <a key={link.to} href={link.to} className="rounded-xl px-3 py-3 text-base text-muted hover:bg-card hover:text-ink">
                          {link.label}
                        </a>
                      ))}
                    </nav>
                    <div className="grid gap-3 border-t border-line p-4">
                      <div>
                        <p className="mb-2 text-xs font-semibold text-muted">حالت نمایش</p>
                        <ThemeSwitch />
                      </div>
                      <LoginLink className="w-full justify-center" />
                      <StartFreeLink full className="px-4 text-sm" />
                    </div>
                  </aside>
                </div>
              </>
            )}
            {!user ? <LoginLink /> : null}
            {user ? (
              <Link to="/me" aria-label="اعلان‌ها" className="grid size-11 place-items-center rounded-xl border border-line bg-card">
                <Bell className="size-5" />
              </Link>
            ) : null}
          </div>
        </div>
      </header>
      )}
      {!header && menuOpen && user ? (
        <div className={`fixed inset-0 z-40 ${user ? "lg:hidden" : "md:hidden"}`}>
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="بستن منو" onClick={() => setMenuOpen(false)} />
          <aside className="drawer-left absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col border-r border-line bg-paper shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="font-extrabold">منو</span>
              <button type="button" className="grid size-11 place-items-center rounded-xl hover:bg-card" aria-label="بستن" onClick={() => setMenuOpen(false)}>
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-xl px-3 py-3 text-base text-muted hover:bg-card hover:text-ink"
                  activeProps={{ className: "rounded-xl bg-card px-3 py-3 text-base font-semibold text-ink" }}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <Link
                  to="/admin"
                  className="rounded-xl px-3 py-3 text-base text-muted hover:bg-card hover:text-ink"
                  activeProps={{ className: "rounded-xl bg-card px-3 py-3 text-base font-semibold text-ink" }}
                  onClick={() => setMenuOpen(false)}
                >
                  مدیریت
                </Link>
              ) : null}
            </nav>
            <div className="grid gap-3 border-t border-line p-4">
              <div>
                <p className="mb-2 text-xs font-semibold text-muted">حالت نمایش</p>
                <ThemeSwitch />
              </div>
              {!user ? (
                <>
                  <LoginLink className="w-full justify-center" />
                  <StartFreeLink full className="px-4 text-sm" />
                </>
              ) : (
                <AccountChip />
              )}
            </div>
          </aside>
        </div>
      ) : null}
      <main className={`mx-auto w-full max-w-6xl px-4 py-6 ${user ? "pb-28 lg:max-w-none lg:px-6 lg:pb-8" : ""}`}>{children}</main>
      {user ? <MobileDock /> : null}
    </div>
  );
}

function LoginLink({ className = "" }: { className?: string }) {
  return (
    <a
      href="/auth"
      className={`inline-flex min-h-11 shrink-0 items-center rounded-xl border border-line bg-card px-4 text-sm font-semibold text-ink ${className}`}
    >
      ورود
    </a>
  );
}

export function StartFreeLink({ className = "", full = false }: { className?: string; full?: boolean }) {
  return (
    <a href="/start" className={`relative inline-flex min-h-11 shrink-0 overflow-hidden rounded-xl p-px ${full ? "w-full" : ""}`}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[-100%]"
        style={{
          background:
            "conic-gradient(from var(--beam-angle), transparent 0 74%, var(--color-jade) 86%, var(--color-on-jade) 94%, transparent 100%)",
          animation: "beam 4s linear infinite",
        }}
      />
      <span
        className={`relative z-[1] inline-flex min-h-[calc(2.75rem-2px)] items-center justify-center rounded-[0.7rem] border border-line font-semibold ${full ? "w-full" : ""} ${className}`}
        style={{ background: "var(--start-bg)", color: "var(--start-fg)" }}
      >
        شروع رایگان
      </span>
    </a>
  );
}

export function Subnav({
  items,
  className = "",
}: {
  items: { to: string; label: string; exact?: boolean }[];
  className?: string;
}) {
  return (
    <div className={`mb-5 flex gap-2 overflow-x-auto pb-1 ${className}`}>
      {items.map((item) => (
        <Link
          key={item.to + item.label}
          to={item.to}
          activeOptions={{ exact: Boolean(item.exact) }}
          className="shrink-0 rounded-full border border-line bg-card px-4 py-2 text-sm"
          activeProps={{ className: "shrink-0 rounded-full bg-jade px-4 py-2 text-sm font-semibold text-on-jade" }}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

const moreLinks = [
  { to: "/panel/customers" as const, label: "مشتریان" },
  { to: "/support" as const, label: "پشتیبانی" },
  { to: "/panel/settings" as const, label: "تنظیمات" },
  { to: "/panel/services" as const, label: "خدمات" },
  { to: "/panel/staff" as const, label: "پرسنل" },
];

function dockTab(pathname: string, staffMode: boolean) {
  if (pathname === "/panel" || pathname === "/panel/") return "dash";
  if (pathname.startsWith("/panel/links")) return staffMode ? "" : "page";
  if (pathname.startsWith("/panel/calendar") || pathname.startsWith("/panel/orders") || pathname.startsWith("/panel/bookings")) return "bookings";
  if (pathname.startsWith("/panel/customers")) return staffMode ? "customers" : "more";
  if (pathname.startsWith("/panel/reports")) return "reports";
  if (pathname.startsWith("/support") || pathname.startsWith("/panel/settings") || pathname.startsWith("/panel/services") || pathname.startsWith("/panel/staff")) return "more";
  return "";
}

function MobileDock() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const account = useAccount();
  const { businessId } = useBusinessId(account.me?.memberships);
  const categoryId = account.me?.memberships.find((item) => item.businessId === businessId)?.categoryId;
  const focus = focusNav(categoryId);
  const [more, setMore] = useState(false);
  const staffMode = account.me?.memberships.find((item) => item.businessId === businessId)?.role === "staff";
  const current = dockTab(pathname, staffMode);

  useEffect(() => {
    setMore(false);
  }, [pathname]);

  const items = staffMode
    ? [
        { id: "dash", label: "داشبورد", icon: LayoutDashboard, to: "/panel" as const },
        { id: "bookings", label: focus.label, icon: focus.kind === "booking" ? Calendar : ClipboardList, to: focus.to },
        { id: "customers", label: "مشتریان", icon: Users, to: "/panel/customers" as const },
        { id: "reports", label: "گزارشات", icon: BarChart3, to: "/panel/reports" as const },
      ]
    : [
        { id: "dash", label: "داشبورد", icon: LayoutDashboard, to: "/panel" as const },
        { id: "page", label: "صفحه من", icon: User, to: "/panel/links" as const },
        { id: "bookings", label: focus.label, icon: focus.kind === "booking" ? Calendar : ClipboardList, to: focus.to },
        { id: "reports", label: "گزارشات", icon: BarChart3, to: "/panel/reports" as const },
      ];

  return (
    <>
      {more ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="بستن" onClick={() => setMore(false)} />
          <div className="absolute inset-x-3 bottom-24 grid gap-1 rounded-3xl border border-line bg-card p-2 shadow-xl">
            {(staffMode
              ? [
                  { to: "/support" as const, label: "پشتیبانی" },
                  { to: "/panel/settings" as const, label: "تنظیمات" },
                ]
              : moreLinks
            ).map((item) => (
              <Link key={item.to} to={item.to} className="rounded-2xl px-4 py-3 text-sm font-semibold" onClick={() => setMore(false)}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
      <nav
        className={`fixed inset-x-3 z-40 grid ${staffMode ? "grid-cols-5" : "grid-cols-5"} rounded-full border border-line bg-card/95 px-1 py-1.5 shadow-lg backdrop-blur lg:hidden`}
        style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        {items.map((item) => {
          const active = current === item.id;
          const icon = <item.icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />;
          const className = `flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] ${active ? "font-bold text-ink" : "font-medium text-muted"}`;
          return (
            <Link key={item.id} to={item.to} className={className}>
              {icon}
              <span className="max-w-full px-0.5 text-center text-[11px] leading-3">{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] ${current === "more" ? "font-bold text-ink" : "font-medium text-muted"}`}
          onClick={() => setMore((value) => !value)}
        >
          <Ellipsis className="size-5" strokeWidth={current === "more" ? 2.25 : 1.75} />
          بیشتر
        </button>
      </nav>
    </>
  );
}