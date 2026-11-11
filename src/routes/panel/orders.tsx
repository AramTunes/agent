import { createFileRoute } from "@tanstack/react-router";
import { usePanel } from "@/components/account";
import { focusNav } from "@/lib/business-focus";

export const Route = createFileRoute("/panel/orders")({ component: OrdersPage });

function OrdersPage() {
  const { businessId, memberships } = usePanel();
  const categoryId = memberships.find((item) => item.businessId === businessId)?.categoryId;
  const focus = focusNav(categoryId);
  const title = focus.kind === "booking" ? "سفارشات" : focus.label;
  const text = focus.kind === "hospitality"
    ? "رزروها و سفارش‌های این صفحه اینجا نشان داده می‌شود."
    : "سفارش‌های این صفحه اینجا نشان داده می‌شود.";
  return (
    <section className="grid gap-2">
      <h1 className="text-2xl font-extrabold">{title}</h1>
      <p className="text-sm leading-7 text-muted">{text}</p>
    </section>
  );
}
