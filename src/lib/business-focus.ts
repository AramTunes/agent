export type FocusKind = "booking" | "hospitality" | "orders";
export type TopicBlock = "booking" | "menu" | "products" | "services";

const hospitality = new Set(["cat-restaurant", "cat-cafe", "cat-fastfood"]);
const orders = new Set(["cat-shop", "cat-service"]);
const topicTypes = new Set(["booking", "menu", "products", "services"]);

export function focusKind(categoryId?: string): FocusKind {
  if (categoryId && hospitality.has(categoryId)) return "hospitality";
  if (categoryId && orders.has(categoryId)) return "orders";
  return "booking";
}

export function topicBlock(categoryId?: string): TopicBlock {
  if (categoryId && hospitality.has(categoryId)) return "menu";
  if (categoryId === "cat-shop") return "products";
  if (categoryId === "cat-service") return "services";
  return "booking";
}

export function fitsTopic(type: string, categoryId?: string) {
  return !topicTypes.has(type) || type === topicBlock(categoryId);
}

export function focusNav(categoryId?: string) {
  const kind = focusKind(categoryId);
  if (kind === "booking") return { kind, label: "نوبت‌ها", to: "/panel/calendar" as const };
  return { kind, label: "سفارشات", to: "/panel/orders" as const };
}
