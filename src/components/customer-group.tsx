import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Combobox } from "@/components/ui/combobox";
import { Field, TextInput } from "@/components/ui";
import { deleteCustomerGroupFn, renameCustomerGroupFn, saveCustomerGroupFn } from "@/lib/api";

export const defaultCustomerGroups = ["همکاران", "کارکنان", "بستگان", "سازمانی", "مشتریان ویژه", "بدون گروه"];

export type CustomGroup = { id: string; name: string };

export function CustomerGroupField({
  businessId,
  groups,
  value,
  onChange,
  onGroups,
  manage,
}: {
  businessId: string;
  groups: CustomGroup[];
  value: string;
  onChange: (value: string) => void;
  onGroups: (groups: CustomGroup[]) => void;
  manage?: boolean;
}) {
  const [fresh, setFresh] = useState("");
  const [editing, setEditing] = useState("");
  const [draft, setDraft] = useState("");
  const options = [...defaultCustomerGroups, ...groups.map((item) => item.name).filter((name) => !defaultCustomerGroups.includes(name))];

  async function add() {
    const name = fresh.trim();
    if (name.length < 2) return;
    if (defaultCustomerGroups.includes(name) || groups.some((item) => item.name === name)) {
      toast.error("این گروه وجود دارد");
      return;
    }
    const res = await saveCustomerGroupFn({ data: { businessId, name } });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    onGroups([...groups, { id: res.data.id, name: res.data.name }]);
    onChange(res.data.name);
    setFresh("");
  }

  async function rename(id: string) {
    const name = draft.trim();
    if (name.length < 2) return;
    const res = await renameCustomerGroupFn({ data: { businessId, id, name } });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    onGroups(groups.map((item) => (item.id === id ? { ...item, name: res.data.name } : item)));
    if (value === groups.find((item) => item.id === id)?.name) onChange(res.data.name);
    setEditing("");
  }

  async function remove(id: string) {
    const current = groups.find((item) => item.id === id);
    const res = await deleteCustomerGroupFn({ data: { businessId, id } });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    onGroups(groups.filter((item) => item.id !== id));
    if (current && value === current.name) onChange("بدون گروه");
  }

  return (
    <Field label="گروه مشتریان">
      <Combobox strict options={options} value={value} onChange={onChange} placeholder="انتخاب گروه" emptyText="گروهی با این نام نیست" />
      {manage ? (
        <div className="mt-2 grid gap-2">
          <div className="flex gap-2">
            <TextInput value={fresh} placeholder="گروه جدید" onChange={(event) => setFresh(event.target.value)} />
            <button type="button" aria-label="افزودن گروه" onClick={() => void add()} className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-card">
              <Plus className="size-4" />
            </button>
          </div>
          {groups.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              {editing === item.id ? (
                <TextInput value={draft} onChange={(event) => setDraft(event.target.value)} />
              ) : (
                <span className="min-w-0 flex-1 truncate text-sm">{item.name}</span>
              )}
              {editing === item.id ? (
                <>
                  <button type="button" aria-label="ذخیره نام گروه" onClick={() => void rename(item.id)} className="grid size-9 place-items-center"><Check className="size-4" /></button>
                  <button type="button" aria-label="انصراف" onClick={() => setEditing("")} className="grid size-9 place-items-center"><X className="size-4" /></button>
                </>
              ) : (
                <>
                  <button type="button" aria-label="ویرایش گروه" onClick={() => { setEditing(item.id); setDraft(item.name); }} className="grid size-9 place-items-center text-muted"><Pencil className="size-4" /></button>
                  <button type="button" aria-label="حذف گروه" onClick={() => void remove(item.id)} className="grid size-9 place-items-center text-danger"><Trash2 className="size-4" /></button>
                </>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </Field>
  );
}
