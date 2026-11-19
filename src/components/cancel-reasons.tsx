import { useState } from "react";
import { Button, TextInput } from "@/components/ui";

export const bookingCancelReasons = ["مشتری زنگ زد", "وقت دیگری می‌خواهد", "پرسنل در دسترس نیست", "اشتباه ثبت شده"];
export const customerCancelReasons = ["برنامه‌ام عوض شد", "وقت دیگری می‌خواهم", "دیگر نیاز ندارم", "اشتباه رزرو کردم"];
export const orderCancelReasons = ["مشتری منصرف شد", "موجود نیست", "آدرس یا زمان نمی‌خورد", "اشتباه ثبت شده"];
export const tableCancelReasons = ["مشتری نیامد", "مشتری لغو کرد", "میز عوض شد", "اشتباه ثبت شده"];

export function CancelReasonPick({
  reasons,
  pending = false,
  onPick,
}: {
  reasons: string[];
  pending?: boolean;
  onPick: (reason: string) => void;
}) {
  const [custom, setCustom] = useState(false);
  const [text, setText] = useState("");
  return (
    <div className="grid gap-2">
      {reasons.map((item) => (
        <button
          key={item}
          type="button"
          disabled={pending}
          onClick={() => onPick(item)}
          className="min-h-11 rounded-xl border border-line bg-card px-3 text-start text-sm disabled:opacity-50"
        >
          {item}
        </button>
      ))}
      {custom ? (
        <form
          className="grid gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const next = text.trim();
            if (next.length < 2 || pending) return;
            onPick(next);
          }}
        >
          <TextInput value={text} onChange={(event) => setText(event.target.value)} placeholder="دلیل دیگر" autoFocus />
          <Button type="submit" variant="danger" disabled={pending || text.trim().length < 2}>
            {pending ? "در حال لغو" : "لغو با این دلیل"}
          </Button>
        </form>
      ) : (
        <button type="button" className="min-h-11 rounded-xl border border-dashed border-line px-3 text-start text-sm text-muted" onClick={() => setCustom(true)}>
          دلیل دیگر
        </button>
      )}
    </div>
  );
}
