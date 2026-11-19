import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MenuScreen } from "@/components/menu-block";
import { Shell } from "@/components/shell";
import { Empty, Skeleton } from "@/components/ui";
import { publicBusinessFn } from "@/lib/api";
import { fitsTopic, focusKind } from "@/lib/business-focus";
import { BookingScreen } from "./book";
import { TableReserve } from "@/components/table-reserve";

export const Route = createFileRoute("/b/$slug/$page")({ component: CustomPage });

function CustomPage() {
  const { slug, page } = Route.useParams();
  const [mode, setMode] = useState<"load" | "book" | "menu" | "table" | "none">("load");
  useEffect(() => {
    let live = true;
    publicBusinessFn({ data: { slug } }).then((res) => {
      if (!live) return;
      const blocks = res.ok && Array.isArray(res.data?.pageBlocks) ? res.data.pageBlocks : [];
      const categoryId = res.ok ? res.data?.categoryId as string | undefined : undefined;
      const path = decodeURIComponent(page);
      const menu = blocks.some((item: { type?: string; url?: string; active?: boolean }) => fitsTopic(item.type ?? "", categoryId) && (item.type === "menu" || item.type === "products" || item.type === "services") && item.active !== false && (item.url?.trim() || (item.type === "products" ? "products" : item.type === "services" ? "services" : "menu")) === path);
      const book = fitsTopic("booking", categoryId) && (path === "book" || blocks.some((item: { type?: string; url?: string; active?: boolean }) => item.type === "booking" && item.active !== false && (item.url?.trim() || "book") === path));
      if (path === "table" && focusKind(categoryId) === "hospitality") setMode("table");
      else if (menu) setMode("menu");
      else if (book) setMode("book");
      else setMode("none");
    });
    return () => {
      live = false;
    };
  }, [slug, page]);
  if (mode === "table") return <TableReserve slug={slug} />;
  if (mode === "menu") return <MenuScreen slug={slug} page={page} />;
  if (mode === "book") return <BookingScreen slug={slug} />;
  if (mode === "none") {
    return (
      <Shell>
        <Empty title="این نشانی نیست" body="" />
      </Shell>
    );
  }
  return (
    <Shell>
      <Skeleton className="h-64" />
    </Shell>
  );
}
