import { civilInZone, pad2, todayYmd } from "@/lib/booking/time";

export type ShopSpan = { weekday: number; startMin: number; endMin: number };

export function weekdayOf(day: string, zone: string) {
  const [year, month, date] = day.split("-").map(Number);
  if (!year || !month || !date) return 0;
  return civilInZone(new Date(Date.UTC(year, month - 1, date, 12)), zone).weekday;
}

export function deliverySlots(day: string, hours: ShopSpan[], zone: string, now = new Date()) {
  const weekday = weekdayOf(day, zone);
  const today = todayYmd(zone, now);
  const clock = civilInZone(now, zone);
  const nowMin = clock.hour * 60 + clock.minute;
  const slots: string[] = [];
  for (const span of hours) {
    if (span.weekday !== weekday || span.endMin <= span.startMin) continue;
    for (let minute = span.startMin; minute < span.endMin; minute += 30) {
      if (day === today && minute <= nowMin) continue;
      slots.push(`${pad2(Math.floor(minute / 60))}:${pad2(minute % 60)}`);
    }
  }
  return slots;
}
