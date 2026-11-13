export type AppNote = {
  id: string;
  title: string;
  body: string;
  kind?: string;
  read: boolean;
  createdAt?: string;
};

export function isInboxNote(kind?: string) {
  return kind === "menu_order" || kind === "booking_created";
}

export function noteTo(kind?: string): "/panel/orders" | "/panel/calendar" | null {
  if (kind === "menu_order") return "/panel/orders";
  if (kind?.startsWith("booking_")) return "/panel/calendar";
  return null;
}
