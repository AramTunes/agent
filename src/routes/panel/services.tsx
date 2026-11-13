import { createFileRoute, Navigate } from "@tanstack/react-router";
import { ImagePlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { usePanel } from "@/components/account";
import { Badge, Button, Card, DialogActions, Empty, Field, Area, Skeleton, TextInput } from "@/components/ui";
import { minutesLabel, toman } from "@/lib/booking/fa";
import { fitImage } from "@/lib/fit-image";
import { manageBusinessFn, deleteServiceFn, saveServiceFn } from "@/lib/api";

export const Route = createFileRoute("/panel/services")({ component: ServicesPage });

type Service = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  bufferMinutes: number;
  priceToman: number;
  active: boolean;
  photo: string;
};

const blank = {
  id: "",
  name: "",
  description: "",
  durationMinutes: 45,
  bufferMinutes: 10,
  priceToman: 0,
  active: true,
  photo: "",
};

function ServicesPage() {
  const { businessId, role } = usePanel();
  const [items, setItems] = useState<Service[]>([]);
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  function load(id: string) {
    setLoading(true);
    manageBusinessFn({ data: { businessId: id } }).then((res) => {
      setItems((res.ok ? res.data.services : []).map((item: Service) => ({ ...item, photo: item.photo || "" })));
      setLoading(false);
      if (!res.ok) toast.error(res.error);
    });
  }
  useEffect(() => {
    if (businessId) load(businessId);
  }, [businessId]);

  if (!businessId) return <Empty title="اول کسب‌وکار بسازید" body="از خانه پنل یک صفحه بسازید تا خدمات را تعریف کنید." />;
  if (role === "staff") return <Navigate to="/panel" />;
  if (loading) return <Skeleton className="h-48" />;

  const limited = role === "staff";

  return (
    <div className={limited ? "grid gap-3" : "grid gap-4 lg:grid-cols-[340px_1fr]"}>
      {limited ? null : (
      <Card>
        <h2 className="text-lg font-bold">{form.id ? "ویرایش خدمت" : "خدمت تازه"}</h2>
        <form
          className="mt-4 grid gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            setSaving(true);
            const res = await saveServiceFn({
              data: {
                businessId,
                ...(form.id ? { id: form.id } : {}),
                name: form.name,
                description: form.description,
                durationMinutes: Number(form.durationMinutes),
                bufferMinutes: Number(form.bufferMinutes),
                priceToman: Number(form.priceToman),
                active: form.active,
                photo: form.photo ?? "",
              },
            });
            setSaving(false);
            if (!res.ok) {
              toast.error(res.error);
              return;
            }
            toast.success("خدمت ذخیره شد");
            setForm(blank);
            load(businessId);
          }}
        >
          <PhotoField value={form.photo ?? ""} onChange={(photo) => setForm({ ...form, photo })} />
          <Field label="نام"><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} /></Field>
          <Field label="توضیح"><Area value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="مدت (دقیقه)"><TextInput type="number" min={5} max={480} value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} /></Field>
            <Field label="آماده‌سازی"><TextInput type="number" min={0} max={180} value={form.bufferMinutes} onChange={(e) => setForm({ ...form, bufferMinutes: Number(e.target.value) })} /></Field>
          </div>
          <Field label="قیمت (تومان)" hint="پرداخت آنلاین در این نسخه نیست."><TextInput type="number" min={0} value={form.priceToman} onChange={(e) => setForm({ ...form, priceToman: Number(e.target.value) })} /></Field>
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            در صفحه عمومی نمایش داده شود
          </label>
          <DialogActions>
            {form.id ? <Button type="button" variant="quiet" onClick={() => setForm(blank)}>انصراف</Button> : null}
            <Button type="submit" disabled={saving}>{saving ? "در حال ذخیره" : "ذخیره"}</Button>
            {form.id ? (
              <Button
                type="button"
                variant="danger"
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  const res = await deleteServiceFn({ data: { businessId, id: form.id } });
                  setSaving(false);
                  if (!res.ok) {
                    toast.error(res.error);
                    return;
                  }
                  toast.success("خدمت حذف شد");
                  setForm(blank);
                  load(businessId);
                }}
              >
                حذف
              </Button>
            ) : null}
          </DialogActions>
        </form>
      </Card>
      )}
      <div className="grid gap-3 content-start">
        {items.length === 0 ? <Empty title="هنوز خدمتی نیست" body="یک خدمت با مدت و قیمت بسازید تا مشتری بتواند وقت بگیرد." /> : null}
        {items.map((item) => (
          <button key={item.id} type="button" disabled={limited} className="rounded-card border border-line bg-card p-4 text-start hover:border-jade disabled:hover:border-line" onClick={() => { if (!limited) setForm(item); }}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex min-w-0 items-center gap-2 font-bold">
                {item.photo ? <img src={item.photo} alt="" className="size-8 shrink-0 rounded-lg object-cover" /> : null}
                <span className="truncate">{item.name}</span>
              </h3>
              <Badge tone={item.active ? "jade" : "muted"}>{item.active ? "فعال" : "مخفی"}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted">{minutesLabel(item.durationMinutes)}{item.bufferMinutes ? ` · ${minutesLabel(item.bufferMinutes)} فاصله` : ""} · {toman(item.priceToman)}</p>
            {item.description ? <p className="mt-2 text-sm leading-6">{item.description}</p> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function PhotoField({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <Field label="عکس" hint="دلخواه">
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          void fitImage(file, 480).then(onChange).catch(() => toast.error("این تصویر باز نشد"));
        }}
      />
      {value ? (
        <div className="relative h-24 w-24 overflow-hidden rounded-xl">
          <img src={value} alt="" className="size-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/70 px-2 py-1 text-[10px] font-semibold text-white">
            <button type="button" onClick={() => input.current?.click()}>ویرایش</button>
            <button type="button" onClick={() => onChange("")}>حذف</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => input.current?.click()} className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line bg-card text-xs font-semibold">
          <ImagePlus className="size-4" />
          عکس
        </button>
      )}
    </Field>
  );
}
