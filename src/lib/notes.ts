export type AppNote = {
  id: string;
  title: string;
  body: string;
  kind?: string;
  read: boolean;
  createdAt?: string;
};

export function isInboxNote(kind?: string) {
  return kind === "menu_order" || kind === "booking_created" || kind === "table_reservation";
}

export function noteTo(kind?: string): "/panel/orders" | "/panel/calendar" | "/support" | "/admin/support" | null {
  if (kind === "menu_order" || kind === "table_reservation") return "/panel/orders";
  if (kind?.startsWith("booking_")) return "/panel/calendar";
  if (kind === "support_reply") return "/support";
  if (kind === "support_waiting") return "/admin/support";
  return null;
}
