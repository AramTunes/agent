import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  Calendar,
  Check,
  ChevronsUpDown,
  ClipboardList,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Plus,
  Settings,
  Shield,
  UserRound,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PageMark, RoundAvatar } from "@/lib/page-avatar";
import { CreateBusinessDialog } from "@/components/dashboard-header";
import { useAccount, useBusinessId, type Membership } from "@/components/account";
import { markReadFn, notificationsFn } from "@/lib/api";
import { faNum } from "@/lib/booking/fa";
import { formatSlot, formatWhen } from "@/lib/booking/format";
import { focusNav } from "@/lib/business-focus";
import { usePanelFollowups } from "@/lib/followups";
import { isInboxNote, noteTo, type AppNote } from "@/lib/notes";
import { signOut } from "@/lib/session";

const nav = [
  { id: "dash", label: "داشبورد", icon: LayoutDashboard, to: "/panel" as const, exact: true },
  { id: "page", label: "صفحه من", icon: UserRound, to: "/panel/links" as const },
  { id: "bookings", label: "نوبت‌ها", icon: Calendar, to: "/panel/calendar" as const },
  { id: "customers", label: "مشتریان", icon: Users, to: "/panel/customers" as const },
  { id: "reports", label: "گزارشات", icon: BarChart3, to: "/panel/reports" as const },
  { id: "support", label: "پشتیبانی", icon: LifeBuoy, to: "/support" as const },
  { id: "settings", label: "تنظیمات", icon: Settings, to: "/panel/settings" as const },
];

const itemIdle = "flex h-8 items-center gap-2 rounded-md px-2 text-sm text-muted outline-none hover:bg-card hover:text-ink [&_svg]:size-4";
const itemActive = "flex h-8 items-center gap-2 rounded-md bg-card px-2 text-sm font-medium text-ink outline-none [&_svg]:size-4";
const popItem = "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm outline-none hover:bg-paper";
const popDanger = "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm text-danger outline-none hover:bg-danger-soft";

function pageTitle(pathname: string, memberships: Membership[], categoryId = "") {
  if (pathname === "/" || pathname === "") return "خانه";
  if (pathname.startsWith("/explore")) return "کسب‌وکارها";
  if (pathname === "/panel" || pathname === "/panel/") return "داشبورد";
  if (pathname.startsWith("/panel/calendar") || pathname.startsWith("/panel/bookings")) return "نوبت‌ها";
  if (pathname.startsWith("/panel/orders")) return focusNav(categoryId).label;
  if (pathname.startsWith("/panel/reports")) return "گزارشات";
  if (pathname.startsWith("/panel/customers")) return "مشتریان";
  if (pathname.startsWith("/panel/settings")) return "تنظیمات";
  if (pathname.startsWith("/panel/links")) return "صفحه من";
  if (pathname.startsWith("/panel/services")) return "خدمات";
  if (pathname.startsWith("/panel/staff")) return "پرسنل";
  if (pathname.startsWith("/support")) return "پشتیبانی";
  if (pathname.startsWith("/me")) return "حساب من";
  if (pathname.startsWith("/admin")) return "مدیریت";
  if (pathname.startsWith("/auth") || pathname.startsWith("/login")) return "ورود";
  if (pathname.startsWith("/start")) return "شروع";
  if (pathname.startsWith("/b/")) {
    const decoded = decodeURIComponent(pathname);
    const mine = memberships.some((item) => item.slug && (decoded === `/b/${item.slug}` || decoded.startsWith(`/b/${item.slug}/`)));
    return mine ? "صفحه من" : "کسب‌وکار";
  }
  return "ایجنت";
}

export function DesktopChrome() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const account = useAccount();
  const { businessId, choose } = useBusinessId(account.me?.memberships);
  const memberships = account.me?.memberships ?? [];
  const current = memberships.find((item) => item.businessId === businessId) ?? memberships[0];
  const title = pageTitle(pathname, memberships, current?.categoryId);

  return (
    <>
      <DesktopSidebar
        memberships={memberships}
        businessId={current?.businessId ?? ""}
        name={account.me?.profile.displayName || "حساب"}
        phone={account.me?.profile.phone ?? ""}
        isAdmin={account.me?.isAdmin ?? false}
        image={account.me?.profile.avatar || ""}
        unread={account.me?.unread ?? 0}
        personal={account.me?.profile.pageFor === "self" && current?.name === account.me?.profile.pageName}
        staff={current?.role === "staff"}
        onChoose={(id) => {
          choose(id);
        }}
        onCreated={(id) => {
          localStorage.setItem("agent.business", id);
          window.dispatchEvent(new Event("agent-account"));
        }}
      />
      <DesktopHeader title={title} />
    </>
  );
}

function DesktopSidebar({
  memberships,
  businessId,
  name,
  phone,
  isAdmin,
  image,
  unread,
  personal,
  staff,
  onChoose,
  onCreated,
}: {
  memberships: Membership[];
  businessId: string;
  name: string;
  phone: string;
  isAdmin: boolean;
  image: string;
  unread: number;
  personal: boolean;
  staff: boolean;
  onChoose: (id: string) => void;
  onCreated: (id: string) => void;
}) {
  const navigate = useNavigate();
  const current = memberships.find((item) => item.businessId === businessId);
  const [accountsOpen, setAccountsOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [menu, setMenu] = useState<"" | "notes" | "user">("");
  const [leaving, setLeaving] = useState(false);
  const notesRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu("");
    };
    const onPointer = (event: MouseEvent) => {
      const node = menu === "notes" ? notesRef.current : userRef.current;
      if (node && !node.contains(event.target as Node)) setMenu("");
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [menu]);

  useEffect(() => {
    if (!accountsOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountsOpen(false);
    };
    const onPointer = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) setAccountsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [accountsOpen]);

  function openAccount(id: string) {
    onChoose(id);
    setAccountsOpen(false);
    void navigate({ to: "/panel" });
  }

  const { follow, overdue, tables } = usePanelFollowups(businessId, personal, staff);
  const open = follow.length + overdue.length + tables.length;
  const badge = unread + open;
  const noteLine = [
    unread > 0 ? `${faNum(unread)} خوانده‌نشده` : "",
    open > 0 ? `${faNum(open)} پیگیری` : "",
  ].filter(Boolean).join(" · ");
  const focus = focusNav(current?.categoryId);
  const staffMode = current?.role === "staff";
  const items = staffMode
    ? [
        { id: "dash", label: "داشبورد", icon: LayoutDashboard, to: "/panel" as const, exact: true },
        { id: "bookings", label: focus.label, icon: focus.kind === "booking" ? Calendar : ClipboardList, to: focus.to },
        ...(focus.kind === "booking" ? [{ id: "orders", label: "سفارشات", icon: ClipboardList, to: "/panel/orders" as const }] : []),
        { id: "customers", label: "مشتریان", icon: Users, to: "/panel/customers" as const },
        { id: "reports", label: "گزارشات", icon: BarChart3, to: "/panel/reports" as const },
        { id: "support", label: "پشتیبانی", icon: LifeBuoy, to: "/support" as const },
        { id: "settings", label: "تنظیمات", icon: Settings, to: "/panel/settings" as const },
      ]
    : nav.map((item) =>
        item.id === "bookings"
          ? { ...item, label: focus.label, to: focus.to, icon: focus.kind === "booking" ? Calendar : ClipboardList }
          : item,
      );

  return (
    <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 flex-col border-e border-line bg-paper text-ink lg:flex">
      <div className="relative shrink-0 p-2" ref={accountRef}>
        <button
          type="button"
          className="flex h-12 w-full items-center gap-2 rounded-md px-2 text-start outline-none hover:bg-card"
          aria-expanded={accountsOpen}
          onClick={() => setAccountsOpen((value) => !value)}
        >
          <PageMark businessId={current?.businessId} slug={current?.slug} name={current?.name ?? "حساب"} avatar={current?.avatar} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{current?.name ?? "بدون حساب"}</span>
            <span className="block truncate text-xs text-muted">حساب‌ها</span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted" aria-hidden="true" />
        </button>
        {accountsOpen ? (
          <div className="absolute inset-x-2 top-14 z-50 rounded-lg border border-line bg-card p-1 shadow-md">
            <ul className="max-h-64 overflow-y-auto">
              {memberships.map((item) => (
                <li key={item.businessId}>
                  <button type="button" className={popItem} onClick={() => openAccount(item.businessId)}>
                    <PageMark businessId={item.businessId} slug={item.slug} name={item.name} avatar={item.avatar} />
                    <span className="min-w-0 flex-1 truncate">{item.name}</span>
                    {item.businessId === businessId ? <Check className="size-4 shrink-0 text-jade" aria-hidden="true" /> : null}
                  </button>
                </li>
              ))}
            </ul>
            <div className="-mx-1 my-1 h-px bg-line" />
            <button
              type="button"
              className={popItem}
              onClick={() => {
                setAccountsOpen(false);
                setCreating(true);
              }}
            >
              <Plus className="size-4 shrink-0" aria-hidden="true" />
              اضافه کردن حساب
            </button>
          </div>
        ) : null}
      </div>
      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-2" aria-label="بخش‌ها">
        {items.map((item) => {
          const icon = <item.icon aria-hidden="true" />;
          if ("exact" in item && item.exact) {
            return (
              <Link key={item.id} to={item.to} activeOptions={{ exact: true }} className={itemIdle} activeProps={{ className: itemActive }}>
                {icon}{item.label}
              </Link>
            );
          }
          return (
            <Link key={item.id} to={item.to} className={itemIdle} activeProps={{ className: itemActive }}>
              {icon}{item.label}
            </Link>
          );
        })}
      </nav>
      <div className="shrink-0">
        <div className="p-2">
          <Link to="/panel/settings" className="flex items-center gap-3 rounded-xl bg-jade px-3 py-2.5 text-on-jade">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-card text-jade">
              <Zap className="size-4" fill="currentColor" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold">خرید اشتراک</span>
              <span className="mt-0.5 block text-xs opacity-80">دسترسی به تمام امکانات</span>
            </span>
          </Link>
        </div>
        <div className="h-px bg-line" />
        <div className="relative" ref={notesRef}>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2.5 text-start hover:bg-card"
            aria-expanded={menu === "notes"}
            onClick={() => setMenu((value) => (value === "notes" ? "" : "notes"))}
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-card">
              <Bell className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="text-sm font-medium">اعلان‌ها</span>
                {badge > 0 ? <span className="inline-flex rounded-full bg-copper px-2 py-0.5 text-xs font-medium text-on-ink">{faNum(badge)}</span> : null}
              </span>
              <span className="mt-0.5 block text-xs text-muted">{noteLine || "همه خوانده شده"}</span>
            </span>
          </button>
          {menu === "notes" ? <NotesMenu businessId={businessId} personal={personal} staff={staff} unread={unread} onClose={() => setMenu("")} /> : null}
        </div>
        <div className="h-px bg-line" />
        <div className="relative" ref={userRef}>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2.5 text-start hover:bg-card"
            aria-expanded={menu === "user"}
            aria-haspopup="menu"
            onClick={() => setMenu((value) => (value === "user" ? "" : "user"))}
          >
            <Avatar name={name} image={image} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{name}</span>
              <span className="mt-0.5 block truncate text-xs text-muted" dir="ltr">{phone ? faNum(phone) : "بدون شماره"}</span>
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted" aria-hidden="true" />
          </button>
          {menu === "user" ? (
            <div role="menu" className="absolute bottom-0 right-full z-50 mr-2 w-56 rounded-lg border border-line bg-card p-1 shadow-md">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <Avatar name={name} image={image} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{name}</span>
                  <span className="block truncate text-xs text-muted" dir="ltr">{phone ? faNum(phone) : "بدون شماره"}</span>
                </span>
              </div>
              <div className="-mx-1 my-1 h-px bg-line" />
              {isAdmin ? (
                <Link to="/admin" role="menuitem" className={popItem} onClick={() => setMenu("")}>
                  <Shield className="size-4 shrink-0" aria-hidden="true" />
                  مدیریت سامانه
                </Link>
              ) : null}
              <Link to="/me" role="menuitem" className={popItem} onClick={() => setMenu("")}>
                <Settings className="size-4 shrink-0" aria-hidden="true" />
                تنظیمات حساب
              </Link>
              <button
                type="button"
                role="menuitem"
                disabled={leaving}
                className={popDanger}
                onClick={() => {
                  setLeaving(true);
                  void signOut();
                }}
              >
                <LogOut className="size-4 shrink-0" aria-hidden="true" />
                {leaving ? "در حال خروج" : "خروج از حساب"}
              </button>
            </div>
          ) : null}
        </div>
        <div className="h-px bg-line" />
      </div>
      {creating ? (
        <CreateBusinessDialog
          onClose={() => setCreating(false)}
          onDone={(id) => {
            setCreating(false);
            onCreated(id);
            void navigate({ to: "/panel" });
          }}
        />
      ) : null}
    </aside>
  );
}

function NotesMenu({ businessId, personal, staff, unread, onClose }: { businessId: string; personal: boolean; staff: boolean; unread: number; onClose: () => void }) {
  const [notes, setNotes] = useState<AppNote[] | null>(null);
  const { follow, overdue, tables, zone } = usePanelFollowups(businessId, personal, staff);
  function load() {
    notificationsFn().then((res) => {
      setNotes(res.ok ? res.data : []);
    });
  }
  useEffect(() => {
    load();
  }, []);
  const inbox = notes?.filter((note) => isInboxNote(note.kind)) ?? [];
  const system = notes?.filter((note) => !isInboxNote(note.kind)) ?? [];
  const shownUnread = notes?.filter((note) => !note.read).length ?? 0;
  const extra = notes ? Math.max(0, unread - shownUnread) : 0;
  const systemEmpty = notes !== null && system.length === 0 && follow.length === 0 && overdue.length === 0 && tables.length === 0;
  return (
    <div className="absolute bottom-0 right-full z-50 mr-2 flex w-80 flex-col rounded-lg border border-line bg-card p-1 shadow-md">
      <div className="flex items-center justify-between px-2 py-1.5">
        <span className="text-xs font-medium text-muted">اعلان‌ها</span>
        <button
          type="button"
          className="text-xs font-medium text-jade"
          onClick={() => {
            void markReadFn({ data: {} }).then(() => {
              load();
              window.dispatchEvent(new Event("agent-account"));
            });
          }}
        >
          خواندم
        </button>
      </div>
      <div className="-mx-1 my-1 h-px bg-line" />
      <ul className="grid max-h-80 overflow-y-auto">
        {notes === null ? <li className="px-2 py-1.5 text-sm text-muted">در حال خواندن…</li> : null}
        <li className="px-2 pt-1 text-xs font-semibold text-muted">ثبت سفارش و نوبت</li>
        {notes !== null && inbox.length === 0 ? <li className="px-2 py-1.5 text-xs text-muted">چیزی ثبت نشده.</li> : null}
        {inbox.map((note) => (
          <li key={note.id}><BellNote note={note} onClose={onClose} /></li>
        ))}
        <li className="px-2 pt-2 text-xs font-semibold text-muted">سیستم و کسب‌وکار</li>
        {systemEmpty ? <li className="px-2 py-1.5 text-xs text-muted">اعلانی نیست.</li> : null}
        {follow.map((item) => (
          <li key={item.id}>
            <Link to={item.to} onClick={onClose} className="block rounded-md bg-paper px-2 py-1.5">
              <div className="text-sm font-medium">نیاز به پیگیری</div>
              <p className="mt-0.5 text-xs leading-5">{item.text}</p>
            </Link>
          </li>
        ))}
        {overdue.map((item) => (
          <li key={item.id}>
            <Link to="/panel" onClick={onClose} className="block rounded-md bg-paper px-2 py-1.5">
              <div className="text-sm font-medium">تعیین وضعیت نوبت</div>
              <p className="mt-0.5 text-xs leading-5">{item.customer || "مشتری"}{item.phone ? ` · ${faNum(item.phone)}` : ""}</p>
              <p className="text-xs leading-5 text-muted">{formatWhen(item.startsAt, zone)} · {item.service} · {item.staff}</p>
            </Link>
          </li>
        ))}
        {tables.map((item) => (
          <li key={item.id}>
            <Link to="/panel" onClick={onClose} className="block rounded-md bg-paper px-2 py-1.5">
              <div className="text-sm font-medium">آزادسازی میز {faNum(item.number)}</div>
              <p className="mt-0.5 text-xs leading-5">{item.customer}{item.phone ? ` · ${faNum(item.phone)}` : ""}</p>
              <p className="text-xs leading-5 text-muted">{formatSlot(item.startsAt)}</p>
            </Link>
          </li>
        ))}
        {system.map((note) => (
          <li key={note.id}><BellNote note={note} onClose={onClose} /></li>
        ))}
        {extra > 0 ? <li className="px-2 py-1.5 text-xs text-muted">و {faNum(extra)} اعلان خوانده‌نشدهٔ دیگر</li> : null}
      </ul>
      <div className="-mx-1 my-1 h-px bg-line" />
      <Link to="/me" className={popItem} onClick={onClose}>همه اعلان‌ها</Link>
    </div>
  );
}

function BellNote({ note, onClose }: { note: AppNote; onClose: () => void }) {
  const to = noteTo(note.kind);
  const body = (
    <>
      <div className="text-sm font-medium">{note.title}</div>
      <p className="mt-0.5 whitespace-pre-line text-xs leading-5">{note.body}</p>
    </>
  );
  if (!to) return <div className={`rounded-md px-2 py-1.5 ${note.read ? "text-muted" : "bg-paper"}`}>{body}</div>;
  return <Link to={to} onClick={onClose} className={`block rounded-md px-2 py-1.5 ${note.read ? "text-muted" : "bg-paper"}`}>{body}</Link>;
}

function DesktopHeader({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-20 hidden h-14 items-center gap-3 border-b border-line bg-paper/95 px-4 backdrop-blur lg:flex">
      <h1 className="min-w-0 flex-1 text-sm font-medium">{title}</h1>
      <Link to="/support" className="inline-flex h-8 shrink-0 items-center gap-2 rounded-full px-2.5 text-sm font-medium">
        <LifeBuoy className="size-4 text-jade" aria-hidden="true" />
        پشتیبانی
      </Link>
    </header>
  );
}

function Avatar({ name, image }: { name: string; image?: string }) {
  if (image) return <RoundAvatar value={image} size={32} />;
  return <RoundAvatar value={`beam:${name || "user"}`} size={32} />;
}
