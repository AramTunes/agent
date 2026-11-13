import { useEffect, useState } from "react";
import { dashboardFn, manageBusinessFn } from "@/lib/api";

export type Followup = {
  id: string;
  text: string;
  to: "/panel/services" | "/panel/staff" | "/panel/settings";
  progress?: number;
  done?: number;
  total?: number;
};

export type OverdueBooking = {
  id: string;
  startsAt: string;
  serviceId: string;
  staffId: string;
  customer: string;
  phone: string;
  service: string;
  staff: string;
};

export function followups(data: {
  services?: { active?: boolean }[];
  staff?: { active?: boolean; weekly?: unknown[] }[];
  phone?: string;
  subscription?: { endsAt?: string; status?: string };
  smsCredit?: number;
}, personal: boolean): Followup[] {
  const items: Followup[] = [];
  const services = (data.services ?? []).filter((item) => item.active !== false);
  const ready = (data.staff ?? []).filter((item) => item.active !== false && (item.weekly?.length ?? 0) > 0);
  const hasService = services.length > 0;
  const hasStaff = ready.length > 0;
  const hasPhone = Boolean(String(data.phone ?? "").trim());
  if (!hasService || !hasStaff || !hasPhone) {
    const done = Number(hasService) + Number(hasStaff) + Number(hasPhone);
    const to = !hasService ? "/panel/services" : !hasStaff ? "/panel/staff" : "/panel/settings";
    const kind = personal ? "صفحه" : "کسب‌وکار";
    items.push({
      id: "setup",
      text: `راه‌اندازی ${kind} هنوز تمام نشده. بیا تمامش کن.`,
      to,
      progress: Math.round((done / 3) * 100),
      done,
      total: 3,
    });
  }
  if (data.subscription?.endsAt) {
    const left = new Date(data.subscription.endsAt).getTime() - Date.now();
    if (Number.isFinite(left) && left < 7 * 24 * 60 * 60 * 1000) {
      items.push({ id: "plan", text: "اشتراکت دارد تمام می‌شود. بیا از صفحهٔ تنظیمات تمدیدش کن.", to: "/panel/settings" });
    }
  }
  if (typeof data.smsCredit === "number" && data.smsCredit < 20) {
    items.push({ id: "sms", text: "اعتبار پیامک‌ها دارد تمام می‌شود. بیا اعتبارش را افزایش بده.", to: "/panel/settings" });
  }
  return items;
}

export function usePanelFollowups(businessId: string, personal: boolean, staff: boolean) {
  const [follow, setFollow] = useState<Followup[]>([]);
  const [overdue, setOverdue] = useState<OverdueBooking[]>([]);
  const [zone, setZone] = useState("Asia/Tehran");
  useEffect(() => {
    if (!businessId) {
      setFollow([]);
      setOverdue([]);
      return;
    }
    let live = true;
    manageBusinessFn({ data: { businessId } }).then((res) => {
      if (!live || !res.ok) return;
      setZone(res.data.timezone || "Asia/Tehran");
      setFollow(followups(res.data, personal).filter((item) => !staff || item.id !== "setup"));
    });
    dashboardFn({ data: { businessId } }).then((res) => {
      if (!live || !res.ok) return;
      setOverdue(Array.isArray(res.data.overdue) ? res.data.overdue : []);
    });
    return () => {
      live = false;
    };
  }, [businessId, personal, staff]);
  return { follow, overdue, zone };
}
