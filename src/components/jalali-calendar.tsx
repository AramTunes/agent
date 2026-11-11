import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { faNum, WEEKDAYS_FA } from "@/lib/booking/fa";
import { gregorianToJalali, jalaliMonthName, jalaliToGregorian, monthLength } from "@/lib/booking/jalali";
import { ymd } from "@/lib/booking/time";
import { cn } from "@/lib/cn";

const COLS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

function shiftMonth(jy: number, jm: number, delta: number) {
  const index = jy * 12 + (jm - 1) + delta;
  return { jy: Math.floor(index / 12), jm: (index % 12) + 1 };
}

export function JalaliCalendar({
  value,
  onChange,
  min,
  max,
  plain,
  disabledDay,
  dayTitle,
  onMonth,
}: {
  value: string;
  onChange: (day: string) => void;
  min?: string;
  max?: string;
  plain?: boolean;
  disabledDay?: (day: string) => boolean;
  dayTitle?: (day: string) => string | undefined;
  onMonth?: (jy: number, jm: number) => void;
}) {
  const selected = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const now = new Date();
      return gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }
    const [y, m, d] = value.split("-").map(Number);
    return gregorianToJalali(y, m, d);
  }, [value]);
  const [cursor, setCursor] = useState({ jy: selected.jy, jm: selected.jm });
  useEffect(() => {
    onMonth?.(cursor.jy, cursor.jm);
  }, [cursor.jy, cursor.jm, onMonth]);
  const length = monthLength(cursor.jy, cursor.jm);
  const first = jalaliToGregorian(cursor.jy, cursor.jm, 1);
  const offset = (new Date(Date.UTC(first.gy, first.gm - 1, first.gd)).getUTCDay() + 1) % 7;
  const cells: Array<{ day: number; ymd: string } | null> = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length }, (_, i) => {
      const g = jalaliToGregorian(cursor.jy, cursor.jm, i + 1);
      return { day: i + 1, ymd: ymd(g.gy, g.gm, g.gd) };
    }),
  ];
  return (
    <div className={cn("min-w-0 w-full p-1", plain ? "" : "rounded-card border border-line bg-card p-3")}>
      <div className="mb-3 flex items-center justify-between">
        <button type="button" className="grid size-11 place-items-center rounded-xl hover:bg-paper" onClick={() => setCursor(shiftMonth(cursor.jy, cursor.jm, -1))} aria-label="ماه قبل">
          <ChevronRight className="size-5" />
        </button>
        <div className="font-semibold">
          {jalaliMonthName(cursor.jm)} {faNum(cursor.jy)}
        </div>
        <button type="button" className="grid size-11 place-items-center rounded-xl hover:bg-paper" onClick={() => setCursor(shiftMonth(cursor.jy, cursor.jm, 1))} aria-label="ماه بعد">
          <ChevronLeft className="size-5" />
        </button>
      </div>
      <div className="grid min-w-0 grid-cols-7 gap-1 text-center text-xs text-muted">
        {COLS.map((col) => (
          <div key={col} className="py-1">{col}</div>
        ))}
        {cells.map((cell, index) => {
          if (!cell) return <div key={`e-${index}`} />;
          const disabled = (min && cell.ymd < min) || (max && cell.ymd > max);
          const blocked = Boolean(disabled) || Boolean(disabledDay?.(cell.ymd));
          const active = cell.ymd === value && !blocked;
          return (
            <button
              key={cell.ymd}
              type="button"
              disabled={blocked}
              title={dayTitle?.(cell.ymd)}
              onClick={() => onChange(cell.ymd)}
              className={cn(
                "min-h-11 rounded-lg text-sm tabular-nums disabled:cursor-not-allowed disabled:text-muted/35",
                active ? "bg-jade font-semibold text-on-jade" : "hover:bg-paper",
              )}
            >
              {faNum(cell.day)}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-center text-xs text-muted">{/^\d{4}-\d{2}-\d{2}$/.test(value) ? WEEKDAYS_FA[new Date(`${value}T12:00:00Z`).getUTCDay()] : ""}</p>
    </div>
  );
}
