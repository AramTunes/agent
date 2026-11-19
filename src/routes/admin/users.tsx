import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Card, Skeleton, TextInput } from "@/components/ui";
import { faNum } from "@/lib/booking/fa";
import { formatWhen } from "@/lib/booking/format";
import { adminUserAccessFn, adminUserAdminFn, adminUsersFn } from "@/lib/api";

export const Route = createFileRoute("/admin/users")({ component: UsersPage });

type Page = { name: string; slug: string; role: string };
type User = { id: string; name: string; phone: string; createdAt: string; isAdmin: boolean; disabled: boolean; pages?: Page[] };

const ROLE: Record<string, string> = { owner: "صاحب", manager: "مدیر", staff: "پرسنل" };

function UsersPage() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<User[]>([]);
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(true);

  function load(query: string, cursor?: User) {
    setLoading(!cursor);
    adminUsersFn({ data: { q: query, before: cursor?.createdAt ?? "", beforeId: cursor?.id ?? "" } }).then((res) => {
      setLoading(false);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      const next = (res.data.rows ?? []) as User[];
      setRows((current) => (cursor ? [...current, ...next] : next));
      setMore(Boolean(res.data.more));
    });
  }
  useEffect(() => {
    load("");
  }, []);

  async function access(row: User, disabled: boolean) {
    const res = await adminUserAccessFn({ data: { userId: row.id, disabled } });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(disabled ? "ورود بسته شد" : "ورود باز شد");
    setRows((current) => current.map((item) => (item.id === row.id ? { ...item, disabled } : item)));
  }
  async function admin(row: User, on: boolean) {
    const res = await adminUserAdminFn({ data: { userId: row.id, admin: on } });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(on ? "مدیر شد" : "مدیریت برداشته شد");
    setRows((current) => current.map((item) => (item.id === row.id ? { ...item, isAdmin: on } : item)));
  }

  return (
    <div className="grid gap-3">
      <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); load(q); }}>
        <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="نام یا شماره" aria-label="جست‌وجوی کاربر" />
        <Button type="submit" variant="quiet">جست‌وجو</Button>
      </form>
      {loading ? <Skeleton className="h-24" /> : null}
      {!loading && rows.length === 0 ? <Card><p className="text-sm text-muted">کاربری پیدا نشد.</p></Card> : null}
      {rows.map((row) => (
        <Card key={row.id}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-bold">{row.name || "بدون نام"}</div>
              <p className="text-sm text-muted" dir="ltr">{row.phone ? faNum(row.phone) : "بدون شماره"}</p>
            </div>
            <div className="flex gap-2">
              {row.isAdmin ? <Badge>مدیر سامانه</Badge> : null}
              {row.disabled ? <Badge tone="danger">ورود بسته</Badge> : null}
            </div>
          </div>
          <p className="mt-2 text-sm text-muted">عضویت {formatWhen(row.createdAt, "Asia/Tehran")}</p>
          {(row.pages ?? []).length > 0 ? (
            <ul className="mt-2 grid gap-1 text-sm">
              {row.pages!.map((page) => (
                <li key={page.slug}>
                  <Link to="/b/$slug" params={{ slug: page.slug }} className="font-semibold text-jade">{page.name}</Link>
                  <span className="text-muted"> · {ROLE[page.role] ?? page.role}</span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-2 text-sm text-muted">صفحه‌ای ندارد.</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="quiet" onClick={() => void access(row, !row.disabled)}>{row.disabled ? "باز کردن ورود" : "بستن ورود"}</Button>
            <Button type="button" variant="quiet" onClick={() => void admin(row, !row.isAdmin)}>{row.isAdmin ? "برداشتن مدیریت" : "مدیر کردن"}</Button>
          </div>
        </Card>
      ))}
      {more ? <Button type="button" variant="quiet" onClick={() => load(q, rows[rows.length - 1])}>بیشتر</Button> : null}
    </div>
  );
}
