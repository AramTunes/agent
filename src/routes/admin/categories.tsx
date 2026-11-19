import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Card, Field, Skeleton, TextInput } from "@/components/ui";
import { adminCategoriesFn, deleteCategoryFn, moveCategoryFn, saveCategoryFn } from "@/lib/api";
import { faNum } from "@/lib/booking/fa";

export const Route = createFileRoute("/admin/categories")({ component: CategoriesPage });

type Cat = { id: string; name: string; slug: string; active: boolean; sort: number; pages: number };

function CategoriesPage() {
  const [rows, setRows] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ id: "", name: "", slug: "", active: true });

  function load() {
    setLoading(true);
    adminCategoriesFn().then((res) => {
      setRows(res.ok ? res.data : []);
      setLoading(false);
      if (!res.ok) toast.error(res.error);
    });
  }
  useEffect(() => {
    load();
  }, []);

  async function move(id: string, dir: "up" | "down") {
    const res = await moveCategoryFn({ data: { id, dir } });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setRows(res.data);
  }
  async function remove(row: Cat) {
    const res = await deleteCategoryFn({ data: { id: row.id } });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("حذف شد");
    setRows(res.data);
    if (form.id === row.id) setForm({ id: "", name: "", slug: "", active: true });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <Card>
        <h2 className="font-bold">{form.id ? "ویرایش دسته" : "دسته تازه"}</h2>
        <form
          className="mt-4 grid gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            const res = await saveCategoryFn({
              data: { name: form.name, slug: form.slug, active: form.active, ...(form.id ? { id: form.id } : {}) },
            });
            if (!res.ok) {
              toast.error(res.error);
              return;
            }
            toast.success("ذخیره شد");
            setForm({ id: "", name: "", slug: "", active: true });
            load();
          }}
        >
          <Field label="نام فارسی"><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
          <Field label="نشانی لاتین" hint="فقط حروف انگلیسی، عدد و خط تیره."><TextInput dir="ltr" className="text-left" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></Field>
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            فعال
          </label>
          <div className="flex gap-2">
            <Button type="submit">ذخیره</Button>
            {form.id ? <Button type="button" variant="quiet" onClick={() => setForm({ id: "", name: "", slug: "", active: true })}>انصراف</Button> : null}
          </div>
        </form>
      </Card>
      <div className="grid content-start gap-2">
        {loading ? <Skeleton className="h-24" /> : null}
        {rows.map((row) => (
          <div key={row.id} className="rounded-card border border-line bg-card p-4">
            <button type="button" className="w-full text-start" onClick={() => setForm({ id: row.id, name: row.name, slug: row.slug, active: row.active })}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold">{row.name}</span>
                <Badge tone={row.active ? "jade" : "muted"}>{row.active ? "فعال" : "مخفی"}</Badge>
              </div>
              <p className="text-sm text-muted" dir="ltr">{row.slug}</p>
              <p className="text-sm text-muted">{faNum(row.pages)} صفحه</p>
            </button>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button type="button" variant="quiet" onClick={() => void move(row.id, "up")}>بالا</Button>
              <Button type="button" variant="quiet" onClick={() => void move(row.id, "down")}>پایین</Button>
              <Button type="button" variant="quiet" disabled={row.pages > 0} onClick={() => void remove(row)}>حذف</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
