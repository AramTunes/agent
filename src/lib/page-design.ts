export const themeColors = [
  { name: "فیروزه‌ای", hex: "#00A693" },
  { name: "قرمز", hex: "#C81D11" },
  { name: "آبی", hex: "#1C39BB" },
  { name: "آبی میانه", hex: "#0067A5" },
  { name: "نیلی", hex: "#32127A" },
  { name: "نارنجی ایرانی", hex: "#D99058" },
  { name: "عنابی", hex: "#701C1C" },
  { name: "صورتی", hex: "#F77FBE" },
  { name: "رز ایرانی", hex: "#FE28A2" },
  { name: "ارغوانی", hex: "#6239A1" },
] as const;

export type PageDesign = {
  theme: string;
  bgKind: "solid" | "gradient" | "image" | "video";
  bgColor: string;
  gradientColors: string[];
  gradientStops: number[];
  gradientDir: "tb" | "lr" | "radial";
  image: string;
  video: string;
  accent: string;
  effect: "none" | "tint" | "blur";
  effectAmount: number;
  layout: "list" | "card";
  columns: 1 | 2;
  radius: "sharp" | "soft" | "round" | "pill";
  buttonStyle: "default" | "solid" | "outline" | "glass";
  buttonShadow: "none" | "soft" | "hard";
};

export const defaultPageDesign: PageDesign = {
  theme: "dark",
  bgKind: "solid",
  bgColor: "",
  gradientColors: ["#00A693", "#1C39BB"],
  gradientStops: [0, 100],
  gradientDir: "tb",
  image: "",
  video: "",
  accent: "",
  effect: "none",
  effectAmount: 45,
  layout: "list",
  columns: 1,
  radius: "round",
  buttonStyle: "default",
  buttonShadow: "none",
};

export type ThemeTokens = {
  bg: string;
  card: string;
  text: string;
  muted: string;
  button: string;
  onButton: string;
  light: boolean;
};

export function cleanHex(value: string) {
  const raw = value.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.toUpperCase()}`;
  if (/^[0-9a-fA-F]{3}$/.test(raw)) return `#${raw.split("").map((ch) => ch + ch).join("").toUpperCase()}`;
  return "";
}

export function onColor(hex: string) {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return l > 0.62 ? "#161616" : "#F7F7F7";
}

function mix(hex: string, toward: string, amount: number) {
  const a = Number.parseInt(hex.slice(1), 16);
  const b = Number.parseInt(toward.slice(1), 16);
  const ch = (shift: number) => Math.round(((a >> shift) & 255) * (1 - amount) + ((b >> shift) & 255) * amount);
  return `#${[16, 8, 0].map((shift) => ch(shift).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

export function resolveTheme(design: PageDesign): ThemeTokens {
  if (design.theme === "light") {
    return { bg: "#F6F5F2", card: "#FFFFFF", text: "#161616", muted: "#6A6A6A", button: "#161616", onButton: "#FAFAFA", light: true };
  }
  if (design.theme === "custom") {
    const button = cleanHex(design.accent) || "#00A693";
    return { bg: "#111111", card: "#1C1C1C", text: "#F7F7F7", muted: "rgba(255,255,255,0.62)", button, onButton: onColor(button), light: false };
  }
  if (design.theme.startsWith("light-")) {
    const hex = cleanHex(`#${design.theme.slice(6)}`) || "#00A693";
    return { bg: mix(hex, "#FFFFFF", 0.9), card: "#FFFFFF", text: "#161616", muted: "#5E5E5E", button: hex, onButton: onColor(hex), light: true };
  }
  if (design.theme.startsWith("dark-")) {
    const hex = cleanHex(`#${design.theme.slice(5)}`) || "#00A693";
    return { bg: mix(hex, "#000000", 0.78), card: mix(hex, "#000000", 0.62), text: "#F7F7F7", muted: "rgba(255,255,255,0.66)", button: hex, onButton: onColor(hex), light: false };
  }
  return { bg: "#0A0A0A", card: "#1C1C1C", text: "#F7F7F7", muted: "rgba(255,255,255,0.62)", button: "#F7F7F7", onButton: "#111111", light: false };
}

export function gradientCss(design: PageDesign) {
  const colors = design.gradientColors.map(cleanHex).filter(Boolean);
  const stops = (colors.length ? colors : ["#00A693", "#1C39BB"]).map((color, index, list) => {
    const at = design.gradientStops[index] ?? Math.round((index / Math.max(1, list.length - 1)) * 100);
    return `${color} ${at}%`;
  }).join(", ");
  if (design.gradientDir === "lr") return `linear-gradient(to left, ${stops})`;
  if (design.gradientDir === "radial") return `radial-gradient(circle, ${stops})`;
  return `linear-gradient(to bottom, ${stops})`;
}

export function pageBackground(design: PageDesign, tokens: ThemeTokens) {
  if (design.bgKind === "gradient") return gradientCss(design);
  if (design.bgKind === "solid" && cleanHex(design.bgColor)) return design.bgColor;
  return tokens.bg;
}

export function blockRadius(design: PageDesign) {
  if (design.radius === "sharp") return "0px";
  if (design.radius === "soft") return "0.55rem";
  if (design.radius === "pill") return "999px";
  return "1.25rem";
}

export function buttonChrome(design: PageDesign, tokens: ThemeTokens) {
  const radius = blockRadius(design);
  const shadow = design.buttonShadow === "hard"
    ? "5px 5px 0 rgba(0,0,0,0.72)"
    : design.buttonShadow === "soft"
      ? "0 10px 24px rgba(0,0,0,0.18)"
      : "none";
  const base = { borderRadius: radius, boxShadow: shadow, backdropFilter: undefined as string | undefined };
  if (design.buttonStyle === "solid") {
    return { ...base, background: tokens.button, color: tokens.onButton, border: "1.5px solid transparent" };
  }
  if (design.buttonStyle === "outline") {
    return { ...base, background: "transparent", color: tokens.text, border: `1.5px solid ${tokens.button}` };
  }
  if (design.buttonStyle === "glass") {
    return {
      ...base,
      background: tokens.light ? "rgba(255,255,255,0.42)" : "rgba(255,255,255,0.14)",
      color: tokens.text,
      border: "1px solid rgba(255,255,255,0.34)",
      backdropFilter: "blur(16px)",
    };
  }
  const themed = design.theme !== "dark";
  return {
    ...base,
    background: tokens.card,
    color: tokens.text,
    border: themed ? "1.5px solid rgba(0,0,0,0.12)" : "1.5px solid rgba(255,255,255,0.16)",
  };
}

export function parseDesign(raw: string | undefined | null): PageDesign {
  if (!raw) return defaultPageDesign;
  try {
    const parsed = JSON.parse(raw) as Partial<PageDesign>;
    return normalizeDesign(parsed);
  } catch {
    return defaultPageDesign;
  }
}

export function normalizeDesign(parsed: Partial<PageDesign> | null | undefined): PageDesign {
  const next = { ...defaultPageDesign, ...(parsed ?? {}) };
  next.bgKind = next.bgKind === "gradient" || next.bgKind === "image" || next.bgKind === "video" ? next.bgKind : "solid";
  next.gradientDir = next.gradientDir === "lr" || next.gradientDir === "radial" ? next.gradientDir : "tb";
  next.effect = next.effect === "tint" || next.effect === "blur" ? next.effect : "none";
  next.layout = next.layout === "card" ? "card" : "list";
  next.columns = next.columns === 2 ? 2 : 1;
  next.radius = next.radius === "sharp" || next.radius === "soft" || next.radius === "pill" ? next.radius : "round";
  next.buttonStyle = next.buttonStyle === "solid" || next.buttonStyle === "outline" || next.buttonStyle === "glass" ? next.buttonStyle : "default";
  next.buttonShadow = next.buttonShadow === "soft" || next.buttonShadow === "hard" ? next.buttonShadow : "none";
  next.effectAmount = Math.min(100, Math.max(0, Number(next.effectAmount) || 0));
  const colors = (next.gradientColors ?? []).map(cleanHex).filter(Boolean).slice(0, 4);
  next.gradientColors = colors.length >= 2 ? colors : defaultPageDesign.gradientColors;
  next.gradientStops = next.gradientColors.map((_, index) => {
    const stop = Number(parsed?.gradientStops?.[index]);
    return Number.isFinite(stop) ? Math.min(100, Math.max(0, stop)) : Math.round((index / Math.max(1, next.gradientColors.length - 1)) * 100);
  });
  next.bgColor = cleanHex(next.bgColor);
  next.accent = cleanHex(typeof next.accent === "string" ? next.accent : "");
  next.image = typeof next.image === "string" ? next.image : "";
  next.video = typeof next.video === "string" ? next.video : "";
  return next;
}
