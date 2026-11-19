import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CustomerLinkStage, type CustomerBlock } from "@/components/link-page";
import { publicBusinessFn, trackStayFn } from "@/lib/api";
import { fitsTopic, focusKind } from "@/lib/business-focus";
import { parseDesign } from "@/lib/page-design";

export const Route = createFileRoute("/b/$slug/")({ component: BusinessPage });

type Biz = {
  name: string;
  description: string;
  avatar?: string;
  categoryId?: string;
  pageBlocks?: CustomerBlock[];
};

function BusinessPage() {
  const { slug } = Route.useParams();
  const [biz, setBiz] = useState<Biz | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    publicBusinessFn({ data: { slug, track: true } }).then((res) => {
      if (!live) return;
      if (res.ok) setBiz(res.data);
      else setError(res.error);
    });
    return () => {
      live = false;
    };
  }, [slug]);
  useEffect(() => {
    const start = Date.now();
    let sent = false;
    const send = () => {
      if (sent) return;
      sent = true;
      const seconds = Math.round((Date.now() - start) / 1000);
      if (seconds < 1) return;
      void trackStayFn(slug, seconds);
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") send();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", send);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", send);
    };
  }, [slug]);
  if (error) {
    return (
      <CustomerLinkStage name="ایجنت" bio={error} slug={slug} blocks={[]} />
    );
  }
  if (!biz) {
    return <div className="min-h-dvh bg-black" />;
  }
  const blocks = (Array.isArray(biz.pageBlocks) ? biz.pageBlocks : []).filter((item) => fitsTopic(item.type, biz.categoryId));
  const design = parseDesign(blocks.find((item) => item.type === "design")?.body);
  return <CustomerLinkStage name={biz.name} bio={biz.description ?? ""} avatar={biz.avatar} slug={slug} blocks={blocks} design={design} reserve={focusKind(biz.categoryId) === "hospitality"} />;
}
