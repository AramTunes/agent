import "@/lib/keys";
import { useEffect, useState } from "react";
import Avatar from "boring-avatars";

const seeds = [
  "aria", "mina", "reza", "sara", "kian", "nilo", "omid", "lida", "arman", "homa",
  "yas", "pari", "sina", "roya", "nima", "dara", "elham", "farid", "gita", "hamed",
  "iman", "jaleh", "kamran", "leila", "mahsa", "nader", "ozra", "pouya", "ramin", "shadi",
  "tara", "vahid", "yegane", "zahra", "baran", "caspian",
];

export const avatarColors = ["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"];
export const readyAvatars = seeds.map((name) => ({ variant: "beam" as const, name, id: `beam:${name}` }));

export function pageImageKey(businessId: string) {
  return `agent.page-image.${businessId}`;
}

export function pageImageSlugKey(slug: string) {
  return `agent.page-image.slug.${slug}`;
}

export function assignRandomPageAvatar(businessId: string) {
  const pick = readyAvatars[Math.floor(Math.random() * readyAvatars.length)];
  try {
    localStorage.setItem(pageImageKey(businessId), pick.id);
  } catch {
    /* storage can be full or blocked */
  }
  return pick.id;
}

export function rememberPageAvatar(businessId: string, slug: string, value: string) {
  try {
    if (businessId) localStorage.setItem(pageImageKey(businessId), value);
    if (slug) localStorage.setItem(pageImageSlugKey(slug), value);
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event("agent-avatar"));
}

export function readPageAvatar(businessId?: string, slug?: string) {
  if (typeof window === "undefined") return "";
  try {
    if (businessId) {
      const byId = localStorage.getItem(pageImageKey(businessId));
      if (byId) return byId;
    }
    if (slug) return localStorage.getItem(pageImageSlugKey(slug)) ?? "";
  } catch {
    return "";
  }
  return "";
}

export function fitAvatar(value: string) {
  if (!value.startsWith("data:")) return Promise.resolve(value);
  return new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const max = 192;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve("");
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => resolve("");
    img.src = value;
  });
}

function isPhoto(value: string) {
  return value.startsWith("data:") || value.startsWith("blob:") || value.startsWith("http");
}

function pickMark(local: string, server: string) {
  if (isPhoto(server)) return server;
  if (isPhoto(local)) return local;
  if (server) return server;
  return local;
}

export function RoundAvatar({ value, size = 40 }: { value: string; size?: number }) {
  const beamName = value.startsWith("beam:") ? value.slice(5) : value.includes(":") ? value.slice(value.indexOf(":") + 1) : "";
  const photo = value.startsWith("data:") || value.startsWith("blob:") || value.startsWith("http");
  return (
    <span className="grid shrink-0 overflow-hidden rounded-full [&>svg]:block [&>svg]:size-full" style={{ width: size, height: size }}>
      {photo ? <img src={value} alt="" className="size-full rounded-full object-cover" /> : beamName ? <Avatar size={size} name={beamName} variant="beam" colors={avatarColors} /> : null}
    </span>
  );
}

export function PageMark({ businessId, slug, name, avatar = "", size = 32 }: { businessId?: string; slug?: string; name: string; avatar?: string; size?: number }) {
  const [image, setImage] = useState(avatar);
  useEffect(() => {
    const sync = () => setImage(pickMark(readPageAvatar(businessId, slug), avatar || ""));
    sync();
    window.addEventListener("agent-avatar", sync);
    return () => window.removeEventListener("agent-avatar", sync);
  }, [businessId, slug, avatar]);
  if (image) return <RoundAvatar value={image} size={size} />;
  const letter = name.trim().slice(0, 1) || "ن";
  return (
    <span className="grid shrink-0 place-items-center rounded-full bg-jade font-bold text-on-jade" style={{ width: size, height: size, fontSize: Math.max(12, Math.round(size * 0.36)) }}>
      {letter}
    </span>
  );
}
