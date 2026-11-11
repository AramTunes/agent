import "@ncdai/react-wheel-picker/style.css";

import { WheelPicker, WheelPickerWrapper, type WheelPickerOption } from "@ncdai/react-wheel-picker";
import { useEffect, useRef } from "react";
import { faNum } from "@/lib/booking/fa";

export function TimeWheel({
  hours,
  hour,
  minutes,
  minute,
  onHour,
  onMinute,
}: {
  hours: number[];
  hour: number;
  minutes: number[];
  minute: number;
  onHour: (value: number) => void;
  onMinute: (value: number) => void;
}) {
  const boundary = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = boundary.current;
    if (!node) return;
    const stop = (event: TouchEvent) => event.stopPropagation();
    node.addEventListener("touchstart", stop);
    node.addEventListener("touchmove", stop);
    node.addEventListener("touchend", stop);
    node.addEventListener("touchcancel", stop);
    return () => {
      node.removeEventListener("touchstart", stop);
      node.removeEventListener("touchmove", stop);
      node.removeEventListener("touchend", stop);
      node.removeEventListener("touchcancel", stop);
    };
  }, []);

  return (
    <div ref={boundary} dir="ltr" className="touch-none">
      <div className="mb-1 grid grid-cols-2 px-1 text-center text-xs text-muted">
        <span>ساعت</span>
        <span>دقیقه</span>
      </div>
      <WheelPickerWrapper className="min-w-56 rounded-lg border border-line bg-card px-1 shadow-xs *:data-rwp:first:*:data-rwp-highlight-wrapper:rounded-s-md *:data-rwp:last:*:data-rwp-highlight-wrapper:rounded-e-md">
        <Column options={hours} value={hour} onChange={onHour} />
        <Column options={minutes} value={minute} onChange={onMinute} />
      </WheelPickerWrapper>
    </div>
  );
}

function Column({ options, value, onChange }: { options: number[]; value: number; onChange: (value: number) => void }) {
  const items: WheelPickerOption<number>[] = options.map((item) => ({
    value: item,
    label: faNum(String(item).padStart(2, "0")),
  }));
  const selected = items.some((item) => item.value === value) ? value : items[0]?.value;
  if (selected == null) return null;
  return (
    <WheelPicker
      options={items}
      value={selected}
      infinite={false}
      scrollSensitivity={8}
      dragSensitivity={5}
      onValueChange={onChange}
      classNames={{
        optionItem: "text-muted",
        highlightWrapper: "bg-ink/6 text-ink",
      }}
    />
  );
}
