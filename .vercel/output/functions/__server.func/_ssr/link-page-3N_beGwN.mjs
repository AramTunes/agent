import { i as __toESM } from "../_runtime.mjs";
import { X as require_jsx_runtime, Z as require_react, d as require_react_dom, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as PageMark } from "./page-avatar-BIJU5HCZ.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { _ as faFileSize, h as cn, v as faNum } from "./ui-CYEMVOYZ.mjs";
import { $ as MapPin, $t as AtSign, A as Send, Ct as File, D as Share, E as ShoppingBag, It as ChevronLeft, J as Minus, K as Newspaper, Kt as Briefcase, Lt as ChevronDown, Nt as CircleHelp, O as Share2, R as Phone, Tt as FileText, Wt as CalendarPlus, X as MessageCircle, _t as Globe, c as UtensilsCrossed, ct as Instagram, et as Mail, f as Type, gt as GraduationCap, kt as Download, l as Users, lt as Image, n as Youtube, nt as Linkedin, o as Video, p as Twitter, r as X, rt as Link2 } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as pageIcon } from "./page-icons-BbT14YzL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/link-page-3N_beGwN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom());
var themeColors = [
	{
		name: "فیروزه‌ای",
		hex: "#00A693"
	},
	{
		name: "قرمز",
		hex: "#C81D11"
	},
	{
		name: "آبی",
		hex: "#1C39BB"
	},
	{
		name: "آبی میانه",
		hex: "#0067A5"
	},
	{
		name: "نیلی",
		hex: "#32127A"
	},
	{
		name: "نارنجی ایرانی",
		hex: "#D99058"
	},
	{
		name: "عنابی",
		hex: "#701C1C"
	},
	{
		name: "صورتی",
		hex: "#F77FBE"
	},
	{
		name: "رز ایرانی",
		hex: "#FE28A2"
	},
	{
		name: "ارغوانی",
		hex: "#6239A1"
	}
];
var defaultPageDesign = {
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
	radius: "round"
};
function cleanHex(value) {
	const raw = value.trim().replace(/^#/, "");
	if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.toUpperCase()}`;
	if (/^[0-9a-fA-F]{3}$/.test(raw)) return `#${raw.split("").map((ch) => ch + ch).join("").toUpperCase()}`;
	return "";
}
function onColor(hex) {
	const n = Number.parseInt(hex.slice(1), 16);
	const r = n >> 16 & 255;
	const g = n >> 8 & 255;
	const b = n & 255;
	return (.2126 * r + .7152 * g + .0722 * b) / 255 > .62 ? "#161616" : "#F7F7F7";
}
function mix(hex, toward, amount) {
	const a = Number.parseInt(hex.slice(1), 16);
	const b = Number.parseInt(toward.slice(1), 16);
	const ch = (shift) => Math.round((a >> shift & 255) * (1 - amount) + (b >> shift & 255) * amount);
	return `#${[
		16,
		8,
		0
	].map((shift) => ch(shift).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}
function resolveTheme(design) {
	if (design.theme === "light") return {
		bg: "#F6F5F2",
		card: "#FFFFFF",
		text: "#161616",
		muted: "#6A6A6A",
		button: "#161616",
		onButton: "#FAFAFA",
		light: true
	};
	if (design.theme === "custom") {
		const button = cleanHex(design.accent) || "#00A693";
		return {
			bg: "#111111",
			card: "#1C1C1C",
			text: "#F7F7F7",
			muted: "rgba(255,255,255,0.62)",
			button,
			onButton: onColor(button),
			light: false
		};
	}
	if (design.theme.startsWith("light-")) {
		const hex = cleanHex(`#${design.theme.slice(6)}`) || "#00A693";
		return {
			bg: mix(hex, "#FFFFFF", .9),
			card: "#FFFFFF",
			text: "#161616",
			muted: "#5E5E5E",
			button: hex,
			onButton: onColor(hex),
			light: true
		};
	}
	if (design.theme.startsWith("dark-")) {
		const hex = cleanHex(`#${design.theme.slice(5)}`) || "#00A693";
		return {
			bg: mix(hex, "#000000", .78),
			card: mix(hex, "#000000", .62),
			text: "#F7F7F7",
			muted: "rgba(255,255,255,0.66)",
			button: hex,
			onButton: onColor(hex),
			light: false
		};
	}
	return {
		bg: "#0A0A0A",
		card: "#1C1C1C",
		text: "#F7F7F7",
		muted: "rgba(255,255,255,0.62)",
		button: "#F7F7F7",
		onButton: "#111111",
		light: false
	};
}
function gradientCss(design) {
	const colors = design.gradientColors.map(cleanHex).filter(Boolean);
	const stops = (colors.length ? colors : ["#00A693", "#1C39BB"]).map((color, index, list) => {
		return `${color} ${design.gradientStops[index] ?? Math.round(index / Math.max(1, list.length - 1) * 100)}%`;
	}).join(", ");
	if (design.gradientDir === "lr") return `linear-gradient(to left, ${stops})`;
	if (design.gradientDir === "radial") return `radial-gradient(circle, ${stops})`;
	return `linear-gradient(to bottom, ${stops})`;
}
function pageBackground(design, tokens) {
	if (design.bgKind === "gradient") return gradientCss(design);
	if (design.bgKind === "solid" && cleanHex(design.bgColor)) return design.bgColor;
	return tokens.bg;
}
function blockRadius(design) {
	if (design.radius === "sharp") return "0px";
	if (design.radius === "pill" && design.layout === "list") return "999px";
	return "1.25rem";
}
function parseDesign(raw) {
	if (!raw) return defaultPageDesign;
	try {
		return normalizeDesign(JSON.parse(raw));
	} catch {
		return defaultPageDesign;
	}
}
function normalizeDesign(parsed) {
	const next = {
		...defaultPageDesign,
		...parsed ?? {}
	};
	next.bgKind = next.bgKind === "gradient" || next.bgKind === "image" || next.bgKind === "video" ? next.bgKind : "solid";
	next.gradientDir = next.gradientDir === "lr" || next.gradientDir === "radial" ? next.gradientDir : "tb";
	next.effect = next.effect === "tint" || next.effect === "blur" ? next.effect : "none";
	next.layout = next.layout === "card" ? "card" : "list";
	next.columns = next.columns === 2 ? 2 : 1;
	next.radius = next.radius === "sharp" || next.radius === "pill" ? next.radius : "round";
	next.effectAmount = Math.min(100, Math.max(0, Number(next.effectAmount) || 0));
	const colors = (next.gradientColors ?? []).map(cleanHex).filter(Boolean).slice(0, 4);
	next.gradientColors = colors.length >= 2 ? colors : defaultPageDesign.gradientColors;
	next.gradientStops = next.gradientColors.map((_, index) => {
		const stop = Number(parsed?.gradientStops?.[index]);
		return Number.isFinite(stop) ? Math.min(100, Math.max(0, stop)) : Math.round(index / Math.max(1, next.gradientColors.length - 1) * 100);
	});
	next.bgColor = cleanHex(next.bgColor);
	next.accent = cleanHex(typeof next.accent === "string" ? next.accent : "");
	next.image = typeof next.image === "string" ? next.image : "";
	next.video = typeof next.video === "string" ? next.video : "";
	return next;
}
/** Light traveling around a border. Matches the vibefarsi border-beam motion. */
function BorderBeam({ children, className, duration = 4, color = "#fafafa" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative inline-flex overflow-hidden rounded-full p-px", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": true,
			className: "pointer-events-none absolute inset-[-100%]",
			style: {
				background: `conic-gradient(from var(--beam-angle), transparent 0 78%, ${color} 92%, transparent 100%)`,
				animation: `beam ${duration}s linear infinite`
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative rounded-full bg-black",
			children
		})]
	});
}
function Accordion({ items, multiple, defaultOpen = [], className }) {
	const [open, setOpen] = (0, import_react.useState)(defaultOpen);
	function toggle(id) {
		setOpen((current) => current.includes(id) ? current.filter((item) => item !== id) : multiple ? [...current, id] : [id]);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("divide-y divide-current/15 rounded-xl border border-current/15", className),
		children: items.map((item) => {
			const isOpen = open.includes(item.id);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				"aria-expanded": isOpen,
				"aria-controls": `acc-${item.id}`,
				onClick: () => toggle(item.id),
				className: "flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-start text-sm font-medium",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "min-w-0",
					children: item.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
					className: cn("size-4 shrink-0 opacity-70 transition-transform duration-200", isOpen && "rotate-180"),
					"aria-hidden": "true"
				})]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				id: `acc-${item.id}`,
				className: cn("grid transition-[grid-template-rows] duration-200 ease-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-4 pb-4 text-sm leading-7 whitespace-pre-wrap opacity-80 [overflow-wrap:anywhere]",
						children: item.content
					})
				})
			})] }, item.id);
		})
	});
}
var attachmentVariants = cva("group/attachment relative flex w-full max-w-full min-w-0 shrink-0 rounded-2xl border bg-card text-ink transition-colors data-[state=error]:border-danger/40 data-[state=idle]:border-dashed", {
	variants: {
		size: {
			default: "gap-2 text-sm has-data-[slot=attachment-content]:px-2.5 has-data-[slot=attachment-content]:py-2 has-data-[slot=attachment-media]:p-2",
			sm: "gap-2 text-xs has-data-[slot=attachment-content]:px-2 has-data-[slot=attachment-content]:py-1.5 has-data-[slot=attachment-media]:p-1.5",
			xs: "gap-1.5 rounded-xl text-xs has-data-[slot=attachment-content]:px-1.5 has-data-[slot=attachment-content]:py-1 has-data-[slot=attachment-media]:p-1"
		},
		orientation: {
			horizontal: "min-w-40 items-center",
			vertical: "w-24 flex-col"
		}
	},
	defaultVariants: {
		size: "default",
		orientation: "horizontal"
	}
});
var attachmentMediaVariants = cva("relative flex aspect-square w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-paper text-ink group-data-[orientation=vertical]/attachment:w-full group-data-[size=sm]/attachment:w-8 group-data-[size=xs]/attachment:w-7 group-data-[size=xs]/attachment:rounded-md group-data-[state=error]/attachment:bg-danger-soft group-data-[state=error]/attachment:text-danger [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4", {
	variants: { variant: {
		icon: "",
		image: "*:[img]:aspect-square *:[img]:w-full *:[img]:object-cover"
	} },
	defaultVariants: { variant: "icon" }
});
function Attachment({ className, state = "done", size = "default", orientation = "horizontal", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-slot": "attachment",
		"data-state": state,
		"data-size": size,
		"data-orientation": orientation,
		className: cn(attachmentVariants({
			size,
			orientation
		}), className),
		...props
	});
}
function AttachmentMedia({ className, variant = "icon", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-slot": "attachment-media",
		"data-variant": variant,
		className: cn(attachmentMediaVariants({ variant }), className),
		...props
	});
}
function AttachmentContent({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-slot": "attachment-content",
		className: cn("min-w-0 flex-1 leading-tight", className),
		...props
	});
}
function AttachmentTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		"data-slot": "attachment-title",
		className: cn("block min-w-0 truncate font-medium group-data-[state=processing]/attachment:attachment-shimmer group-data-[state=uploading]/attachment:attachment-shimmer", className),
		...props
	});
}
function AttachmentDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		"data-slot": "attachment-description",
		className: cn("mt-0.5 block min-w-0 truncate text-xs text-muted group-data-[state=error]/attachment:text-danger", className),
		...props
	});
}
function AttachmentActions({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-slot": "attachment-actions",
		className: cn("relative z-20 flex shrink-0 items-center", className),
		...props
	});
}
function AttachmentAction({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"data-slot": "attachment-action",
		className: cn("grid size-6 place-items-center rounded-md text-muted hover:bg-paper hover:text-ink [&_svg]:size-3.5", className),
		...props
	});
}
var kinds = [
	{
		type: "link",
		label: "لینک",
		hint: "یک پیوند بیرون از صفحه",
		icon: Link2
	},
	{
		type: "contact",
		label: "تماس",
		hint: "شماره و راه‌های ارتباطی",
		icon: Phone
	},
	{
		type: "address",
		label: "آدرس",
		hint: "نشانی و موقعیت",
		icon: MapPin
	},
	{
		type: "booking",
		label: "رزرو نوبت",
		hint: "دیدن زمان‌های آزاد",
		icon: CalendarPlus
	},
	{
		type: "products",
		label: "محصولات",
		hint: "فهرست کالاها",
		icon: ShoppingBag
	},
	{
		type: "menu",
		label: "منوی دیجیتال",
		hint: "غذا و قیمت",
		icon: UtensilsCrossed
	},
	{
		type: "services",
		label: "خدمات",
		hint: "خدمت‌ها و قیمت",
		icon: Briefcase
	},
	{
		type: "form",
		label: "فرم‌ساز",
		hint: "ارسال اطلاعات",
		icon: FileText
	},
	{
		type: "event",
		label: "ایونت",
		hint: "زمان و جزئیات",
		icon: CalendarPlus
	},
	{
		type: "course",
		label: "دوره آموزشی",
		hint: "سرفصل و ثبت‌نام",
		icon: GraduationCap
	},
	{
		type: "blog",
		label: "وبلاگ",
		hint: "نوشته‌های تازه",
		icon: Newspaper
	},
	{
		type: "text",
		label: "متن ساده",
		hint: "یک توضیح کوتاه",
		icon: Type
	},
	{
		type: "social",
		label: "شبکه اجتماعی",
		hint: "پیج‌ها و کانال‌ها",
		icon: Share2
	},
	{
		type: "faq",
		label: "سوالات متداول",
		hint: "پرسش و پاسخ",
		icon: CircleHelp
	},
	{
		type: "team",
		label: "تیم",
		hint: "اعضای مجموعه",
		icon: Users
	},
	{
		type: "gallery",
		label: "عکس",
		hint: "عکس‌های صفحه",
		icon: Image
	},
	{
		type: "video",
		label: "فیلم",
		hint: "ویدیو و لینک",
		icon: Video
	},
	{
		type: "resume",
		label: "رزومه",
		hint: "سوابق و مهارت",
		icon: FileText
	},
	{
		type: "file",
		label: "فایل",
		hint: "دریافت فایل",
		icon: File
	},
	{
		type: "divider",
		label: "جداکننده",
		hint: "",
		icon: Minus
	}
];
var contactKinds = [
	{
		kind: "phone",
		label: "شماره تماس",
		field: "شماره",
		placeholder: "09123456789"
	},
	{
		kind: "email",
		label: "ایمیل",
		field: "ایمیل",
		placeholder: "name@email.com"
	},
	{
		kind: "whatsapp",
		label: "واتساپ",
		field: "شماره واتساپ",
		placeholder: "09123456789"
	},
	{
		kind: "telegram",
		label: "تلگرام",
		field: "آیدی تلگرام",
		placeholder: "username"
	},
	{
		kind: "eitaa",
		label: "ایتا",
		field: "آیدی ایتا",
		placeholder: "username"
	},
	{
		kind: "bale",
		label: "بله",
		field: "آیدی بله",
		placeholder: "username"
	},
	{
		kind: "rubika",
		label: "روبیکا",
		field: "آیدی روبیکا",
		placeholder: "username"
	}
];
function contactKind(kind) {
	return contactKinds.find((item) => item.kind === kind) ?? contactKinds[0];
}
var addressKinds = [
	{
		kind: "google",
		label: "گوگل مپ",
		field: "نشانی لینک",
		placeholder: "https://"
	},
	{
		kind: "neshan",
		label: "نشان",
		field: "نشانی لینک",
		placeholder: "https://"
	},
	{
		kind: "waze",
		label: "ویز",
		field: "نشانی لینک",
		placeholder: "https://"
	},
	{
		kind: "balad",
		label: "بلد",
		field: "نشانی لینک",
		placeholder: "https://"
	},
	{
		kind: "text",
		label: "آدرس متنی",
		field: "آدرس",
		placeholder: ""
	}
];
function addressKind(kind) {
	return addressKinds.find((item) => item.kind === kind) ?? addressKinds[4];
}
var socialKinds = [
	{
		kind: "instagram",
		label: "اینستاگرام",
		field: "نام کاربری یا لینک",
		placeholder: "username",
		input: "text",
		limit: 200
	},
	{
		kind: "telegram",
		label: "تلگرام",
		field: "نام کاربری یا لینک",
		placeholder: "username",
		input: "text",
		limit: 200
	},
	{
		kind: "whatsapp",
		label: "واتساپ",
		field: "شماره واتساپ",
		placeholder: "09123456789",
		input: "tel",
		limit: 20
	},
	{
		kind: "x",
		label: "ایکس/توییتر",
		field: "نام کاربری یا لینک",
		placeholder: "username",
		input: "text",
		limit: 200
	},
	{
		kind: "youtube",
		label: "یوتیوب",
		field: "لینک یا شناسه",
		placeholder: "https://",
		input: "url",
		limit: 200
	},
	{
		kind: "linkedin",
		label: "لینکدین",
		field: "لینک",
		placeholder: "https://",
		input: "url",
		limit: 200
	},
	{
		kind: "kik",
		label: "کیک",
		field: "نام کاربری",
		placeholder: "username",
		input: "text",
		limit: 80
	},
	{
		kind: "bale",
		label: "بله",
		field: "آیدی بله",
		placeholder: "username",
		input: "text",
		limit: 80
	},
	{
		kind: "rubika",
		label: "روبیکا",
		field: "آیدی روبیکا",
		placeholder: "username",
		input: "text",
		limit: 80
	},
	{
		kind: "igap",
		label: "آیگپ",
		field: "نام کاربری",
		placeholder: "username",
		input: "text",
		limit: 80
	},
	{
		kind: "phone",
		label: "تماس",
		field: "شماره",
		placeholder: "09123456789",
		input: "tel",
		limit: 20
	},
	{
		kind: "email",
		label: "ایمیل",
		field: "ایمیل",
		placeholder: "name@email.com",
		input: "email",
		limit: 80
	},
	{
		kind: "website",
		label: "وبسایت",
		field: "نشانی وبسایت",
		placeholder: "https://",
		input: "url",
		limit: 200
	}
];
function socialKind(kind) {
	return socialKinds.find((item) => item.kind === kind) ?? socialKinds[0];
}
function socialValueOk(kind, value) {
	const raw = value.trim();
	if (!raw) return false;
	if (kind === "phone" || kind === "whatsapp") {
		const digits = onlyDigits(raw);
		return digits.length >= 8 && digits.length <= 15;
	}
	if (kind === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw);
	if (/^https?:\/\/\S+$/i.test(raw)) return true;
	if (kind === "website" || kind === "linkedin" || kind === "youtube") return /^[\w.-]+\.[a-z]{2,}([/?#]\S*)?$/i.test(raw) || kind !== "website" && /^@?[\w.-]{2,64}$/.test(raw);
	return /^@?[\w.]{2,64}$/.test(raw);
}
function socialHref(item) {
	const raw = item.value.trim();
	if (item.kind === "phone") return `tel:${onlyDigits(raw)}`;
	if (item.kind === "email") return `mailto:${raw}`;
	if (item.kind === "whatsapp") {
		if (/^https?:\/\//i.test(raw)) return raw;
		let number = onlyDigits(raw);
		if (number.startsWith("0")) number = `98${number.slice(1)}`;
		return `https://wa.me/${number}`;
	}
	if (/^https?:\/\//i.test(raw)) return raw;
	if (item.kind === "website") return `https://${raw}`;
	const handle = raw.replace(/^@/, "");
	if (item.kind === "youtube") return raw.includes(".") ? `https://${raw}` : `https://youtube.com/@${handle}`;
	if (item.kind === "linkedin") return raw.includes(".") ? `https://${raw}` : `https://www.linkedin.com/in/${handle}`;
	return `${{
		instagram: "https://instagram.com/",
		telegram: "https://t.me/",
		x: "https://x.com/",
		kik: "https://kik.me/",
		bale: "https://ble.ir/",
		rubika: "https://rubika.ir/",
		igap: "https://igap.net/"
	}[item.kind] ?? "https://"}${handle}`;
}
function linkHost(url) {
	if (!url) return "";
	try {
		return new URL(url).host.replace(/^www\./, "");
	} catch {
		return "";
	}
}
function kindOf(type) {
	return kinds.find((item) => item.type === type) ?? {
		type,
		label: "بلوک",
		hint: "",
		icon: Link2
	};
}
async function sharePage(url, name) {
	if (typeof navigator !== "undefined" && navigator.share) try {
		await navigator.share({
			title: name,
			url
		});
		return;
	} catch {
		return;
	}
	try {
		await navigator.clipboard.writeText(url);
		toast.success("لینک صفحه کپی شد");
	} catch {
		toast.error("اشتراک‌گذاری ممکن نشد");
	}
}
var FaceContext = (0, import_react.createContext)(null);
function faceFrom(design, tokens) {
	const themed = design.theme !== "dark";
	return {
		card: themed ? tokens.button : tokens.card,
		text: themed ? tokens.onButton : tokens.text,
		page: tokens.text,
		muted: tokens.muted,
		radius: blockRadius(design),
		layout: design.layout,
		columns: design.columns
	};
}
function useRow() {
	const face = (0, import_react.useContext)(FaceContext);
	if (!face) return {
		face,
		className: "flex w-full items-center gap-3.5 rounded-[1.25rem] bg-[#1c1c1c] px-4 py-3.5 text-start text-white",
		style: void 0
	};
	return {
		face,
		className: face.layout === "card" ? "flex aspect-square w-full flex-col items-center justify-center gap-2 overflow-hidden p-3 text-center" : "flex w-full items-center gap-3.5 px-4 py-3.5 text-start",
		style: {
			background: face.card,
			color: face.text,
			borderRadius: face.radius
		}
	};
}
function CustomerLink({ name, bio, avatar, slug, blocks, image, shareUrl, fill = false, className = "", design }) {
	const shown = blocks.filter((item) => item.active !== false && item.type !== "resume" && item.type !== "design");
	const footers = shown.filter((item) => item.type === "social" && item.layout === "footer");
	const listed = shown.filter((item) => !(item.type === "social" && item.layout === "footer"));
	const photo = image || avatar || "";
	const tokens = design ? resolveTheme(design) : null;
	const face = tokens && design ? faceFrom(design, tokens) : null;
	const row = useRowFrom(face);
	const frame = cn("relative isolate overflow-hidden", design ? "" : "bg-black text-white", fill ? "h-full" : "h-dvh lg:h-full lg:min-h-0");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FaceContext.Provider, {
		value: face,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: frame,
			style: tokens ? {
				background: tokens.bg,
				color: tokens.text
			} : void 0,
			children: [design ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageBackdrop, { design }) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("relative z-10 h-full overflow-y-auto", className),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-h-full flex-col px-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between pt-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/favicon.svg",
								alt: "",
								className: "size-11 rounded-xl"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "اشتراک‌گذاری لینک صفحه",
								className: "grid size-11 place-items-center rounded-full hover:bg-black/10",
								style: { color: tokens?.text ?? "#ffffff" },
								onClick: () => {
									sharePage(shareUrl || window.location.href, name);
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share, {
									className: "size-6",
									"aria-hidden": "true"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-9 grid justify-items-center text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMark, {
									slug,
									name,
									avatar: photo,
									size: 104
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "mt-4 text-2xl font-extrabold",
									style: tokens ? { color: tokens.text } : void 0,
									children: name
								}),
								bio ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 max-w-[22rem] text-base leading-7",
									style: { color: tokens?.muted ?? "rgba(255,255,255,0.6)" },
									children: bio
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: cn("mt-9", face?.layout === "card" ? face.columns === 2 ? "grid grid-cols-2 gap-3" : "grid grid-cols-1 gap-3" : "grid gap-3.5"),
							children: listed.map((block) => {
								if (block.type === "menu" || block.type === "products" || block.type === "services") {
									const fallback = block.type === "products" ? "products" : block.type === "services" ? "services" : "menu";
									const path = (block.url?.trim() || fallback).replace(/^\/+|\/+$/g, "") || fallback;
									const heading = block.title?.trim() || (block.type === "products" ? "محصولات" : block.type === "services" ? "خدمات" : "منوی دیجیتال");
									const Icon = pageIcon(block.icon) ?? (block.type === "products" ? ShoppingBag : block.type === "services" ? Briefcase : UtensilsCrossed);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/b/$slug/$page",
										params: {
											slug,
											page: path
										},
										className: row.className,
										style: row.style,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
												className: cn("size-6 shrink-0", row.style ? "" : "text-white"),
												"aria-hidden": "true"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "block truncate text-base font-medium leading-6",
													children: heading
												}), design?.layout === "card" || !block.body?.trim() ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: cn("mt-0.5 block truncate text-sm leading-5", row.style ? "opacity-70" : "text-white/55"),
													children: block.body
												})]
											}),
											design?.layout === "card" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
												className: cn("ms-auto size-6 shrink-0", row.style ? "opacity-70" : "text-white/75"),
												"aria-hidden": "true"
											})
										]
									}) }, block.id);
								}
								if (block.type === "booking") {
									const path = (block.url?.trim() || "book").replace(/^\/+|\/+$/g, "") || "book";
									const heading = block.title?.trim() || "رزرو نوبت";
									const card = design?.layout === "card";
									const radius = face?.radius;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: cn("overflow-hidden", card ? "aspect-square" : ""),
										style: row.style,
										children: [block.image && !card ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: block.image,
											alt: "",
											className: "h-40 w-full object-cover",
											style: radius ? { borderRadius: radius } : void 0
										}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/b/$slug/$page",
											params: {
												slug,
												page: path
											},
											className: card ? "relative flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center" : "flex w-full items-center gap-3.5 px-4 py-3.5 text-start",
											children: [
												card && block.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: block.image,
													alt: "",
													className: "absolute inset-0 h-full w-full object-cover"
												}) : null,
												card && block.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-0 bg-black/35" }) : null,
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarPlus, {
													className: cn("size-6 shrink-0", card && block.image ? "relative text-white" : row.style ? "" : "text-white"),
													"aria-hidden": "true"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: cn("min-w-0", card && block.image ? "relative text-white" : ""),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "block truncate text-base font-medium leading-6",
														children: heading
													}), card || !block.body?.trim() ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: cn("mt-0.5 block truncate text-sm leading-5", row.style ? "opacity-70" : "text-white/55"),
														children: block.body
													})]
												}),
												card ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
													className: cn("ms-auto size-6 shrink-0", row.style ? "opacity-70" : "text-white/75"),
													"aria-hidden": "true"
												})
											]
										})]
									}, block.id);
								}
								if (block.type === "divider") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "my-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DividerLine, {
										text: block.body,
										align: block.align,
										tone: tokens?.light ? "dark" : "light"
									})
								}, block.id);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlockRow, { block }) }, block.id);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-auto flex flex-col items-center pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-12",
							children: [footers.map((block) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialFooter, { block }, block.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BorderBeam, {
								duration: 5,
								color: "#f4fff9",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/",
									className: "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: "/favicon.svg",
											alt: "",
											className: "size-5 rounded-[4px]"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ساخته شده با ایجنت" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
											className: "size-4 text-white/80",
											"aria-hidden": "true"
										})
									]
								})
							})]
						})
					]
				})
			})]
		})
	});
}
function useRowFrom(face) {
	if (!face) return {
		className: "flex w-full items-center gap-3.5 rounded-[1.25rem] bg-[#1c1c1c] px-4 py-3.5 text-start text-white",
		style: void 0
	};
	return {
		className: face.layout === "card" ? "flex aspect-square w-full flex-col items-center justify-center gap-2 overflow-hidden p-3 text-center" : "flex w-full items-center gap-3.5 px-4 py-3.5 text-start",
		style: {
			background: face.card,
			color: face.text,
			borderRadius: face.radius
		}
	};
}
function PageBackdrop({ design }) {
	const tokens = resolveTheme(design);
	const tint = tokens.light ? "#000000" : "#FFFFFF";
	const blur = design.effect === "blur" ? `blur(${Math.round(design.effectAmount / 4)}px)` : void 0;
	const scale = design.effect === "blur" ? 1.12 : 1;
	const media = design.bgKind === "image" || design.bgKind === "video";
	if (design.bgKind === "solid" && !design.bgColor && design.effect === "none") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 overflow-hidden",
		children: [
			design.bgKind === "gradient" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0",
				style: { background: pageBackground(design, tokens) }
			}) : null,
			design.bgKind === "solid" && design.bgColor ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0",
				style: { background: design.bgColor }
			}) : null,
			design.bgKind === "image" && design.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: design.image,
				alt: "",
				className: "absolute inset-0 h-full w-full object-cover",
				style: {
					filter: blur,
					transform: `scale(${scale})`
				}
			}) : null,
			design.bgKind === "video" && design.video ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				src: design.video,
				className: "absolute inset-0 h-full w-full object-cover",
				autoPlay: true,
				muted: true,
				loop: true,
				playsInline: true,
				style: {
					filter: blur,
					transform: `scale(${scale})`
				}
			}) : null,
			design.effect === "tint" && media ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0",
				style: {
					background: tint,
					opacity: design.effectAmount / 100
				}
			}) : null
		]
	});
}
function BlockRow({ block }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const kind = kindOf(block.type);
	const Icon = block.type === "contact" ? Phone : block.type === "address" ? MapPin : block.type === "social" ? Share2 : pageIcon(block.icon) ?? kind.icon;
	const row = useRow();
	const title = block.title?.trim() || kind.label;
	const detailLine = block.type === "contact" || block.type === "address" || block.type === "social" ? (block.items ?? []).map((item) => item.title?.trim() || (block.type === "address" ? addressKind(item.kind).label : block.type === "social" ? socialKind(item.kind).label : contactKind(item.kind).label)).join("، ") : "";
	const dishes = block.type === "menu" || block.type === "products" || block.type === "services" ? (block.items ?? []).filter((item) => item.kind === "item").length : 0;
	const hint = block.type === "menu" || block.type === "products" || block.type === "services" ? dishes ? `${faNum(dishes)} ${block.type === "products" ? "محصول" : block.type === "services" ? "خدمت" : "مورد"}` : kind.hint : block.type === "contact" || block.type === "address" || block.type === "social" ? detailLine || kind.hint : block.url ? linkHost(block.url) || block.body?.trim() || kind.hint : block.body?.trim() || kind.hint;
	const className = row.className;
	const body = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			className: cn("size-6 shrink-0", row.style ? "" : "text-white"),
			"aria-hidden": "true"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block text-base font-medium leading-6",
				children: title
			}), hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-0.5 block truncate text-sm leading-5 opacity-70",
				children: hint
			}) : null]
		}),
		row.face?.layout === "card" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
			className: "ms-auto size-6 shrink-0 opacity-70",
			"aria-hidden": "true"
		})
	] });
	if (block.type === "text") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextBlock, { block });
	if (block.type === "faq") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FaqBlock, { block });
	if (block.type === "gallery") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GalleryBlock, { block });
	if (block.type === "video") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoBlock, { block });
	if (block.type === "file") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCard, { block });
	if (block.type === "social" && block.layout === "icons") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialIcons, { items: block.items ?? [] });
	if (block.type === "contact" || block.type === "address" || block.type === "social") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className,
		style: row.style,
		onClick: () => setOpen(true),
		children: body
	}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContactWindow, {
		title,
		items: block.items ?? [],
		mode: block.type === "social" ? "social" : block.type,
		onClose: () => setOpen(false)
	}) : null] });
	if (block.url) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
		href: block.url,
		target: "_blank",
		rel: "noreferrer",
		className,
		style: row.style,
		children: body
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className,
		style: row.style,
		children: body
	});
}
function DividerLine({ text, align, tone = "light" }) {
	const label = text?.trim() ?? "";
	const place = align === "left" || align === "right" ? align : "center";
	const face = (0, import_react.useContext)(FaceContext);
	const line = face ? "" : tone === "dark" ? "bg-line" : "bg-white/25";
	const ink = face ? "" : tone === "dark" ? "text-muted" : "text-white/70";
	const lineStyle = face ? { background: face.muted } : void 0;
	const textStyle = face ? { color: face.muted } : void 0;
	if (!label) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `h-px w-full ${line}`,
		style: lineStyle
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		dir: "rtl",
		className: "flex w-full items-center gap-3",
		children: [
			place !== "right" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `h-px min-w-4 flex-1 ${line}`,
				style: lineStyle
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `max-w-[70%] shrink-0 truncate text-xs leading-4 ${ink}`,
				style: textStyle,
				children: label
			}),
			place !== "left" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `h-px min-w-4 flex-1 ${line}`,
				style: lineStyle
			}) : null
		]
	});
}
function fileHref(url, name) {
	const query = new URLSearchParams();
	if (name) query.set("name", name);
	const extra = query.toString();
	return extra ? `${url}${url.includes("?") ? "&" : "?"}${extra}` : url;
}
function fileNameFromUrl(url) {
	try {
		const name = decodeURIComponent(new URL(url).pathname.split("/").filter(Boolean).pop() ?? "");
		return name.includes(".") ? name : "";
	} catch {
		return "";
	}
}
function FileCard({ block }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const row = useRow();
	const files = (block.items ?? []).filter((item) => item.kind === "file" && item.value.startsWith("/api/v1/media/"));
	const remote = block.url?.trim() ?? "";
	const total = files.length + (remote ? 1 : 0);
	if (total === 0) return null;
	const shell = row.style ? row.className : "flex w-full items-center gap-3.5 rounded-[1.25rem] bg-[#1c1c1c] px-4 py-3.5 text-start text-white";
	const mute = row.style ? "opacity-70" : "text-white/55";
	if (total === 1) {
		const file = files[0];
		const name = file?.title?.trim() || fileNameFromUrl(remote) || linkHost(remote) || "فایل";
		const title = block.title?.trim() || name;
		const hint = (file && typeof file.size === "number" && file.size > 0 ? faFileSize(file.size) : "") || (remote ? linkHost(remote) : "");
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
			href: file ? fileHref(file.value, name) : remote,
			...file ? { download: name } : {
				target: "_blank",
				rel: "noreferrer"
			},
			className: shell,
			style: row.style,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(File, {
					className: cn("size-6 shrink-0", row.style ? "" : "text-white"),
					"aria-hidden": "true"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block truncate text-base font-medium leading-6",
						dir: "auto",
						children: title
					}), row.face?.layout === "card" || !hint ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("mt-0.5 block truncate text-sm leading-5", mute),
						dir: "auto",
						children: hint
					})]
				}),
				row.face?.layout === "card" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
					className: cn("ms-auto size-6 shrink-0", row.style ? "opacity-70" : "text-white/75"),
					"aria-hidden": "true"
				})
			]
		});
	}
	const title = block.title?.trim() || "فایل‌ها";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => setOpen(true),
		className: shell,
		style: row.style,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(File, {
				className: cn("size-6 shrink-0", row.style ? "" : "text-white"),
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block truncate text-base font-medium leading-6",
					dir: "auto",
					children: title
				}), row.face?.layout === "card" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: cn("mt-0.5 block truncate text-sm leading-5", mute),
					children: [faNum(total), " فایل"]
				})]
			}),
			row.face?.layout === "card" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
				className: cn("ms-auto size-6 shrink-0", row.style ? "opacity-70" : "text-white/75"),
				"aria-hidden": "true"
			})
		]
	}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileWindow, {
		title,
		files,
		remote,
		onClose: () => setOpen(false)
	}) : null] });
}
function FileWindow({ title, files, remote, onClose }) {
	const [desktop, setDesktop] = (0, import_react.useState)(() => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches);
	(0, import_react.useEffect)(() => {
		const query = window.matchMedia("(min-width: 1024px)");
		const sync = () => setDesktop(query.matches);
		sync();
		query.addEventListener("change", sync);
		return () => query.removeEventListener("change", sync);
	}, []);
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			if (event.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose]);
	const cards = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		dir: "rtl",
		className: "flex flex-col gap-2",
		children: [files.map((item) => {
			const name = item.title?.trim() || "فایل";
			const label = item.label?.trim() || name;
			const size = typeof item.size === "number" && item.size > 0 ? faFileSize(item.size) : "";
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: fileHref(item.value, name),
				download: name,
				className: "block w-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Attachment, {
					dir: "rtl",
					state: "done",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentMedia, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(File, { "aria-hidden": "true" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AttachmentContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentTitle, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", { children: label }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentDescription, { children: item.note?.trim() || (size ? `بارگذاری شد · ${size}` : "بارگذاری شد") })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentActions, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
							className: "size-4 text-muted",
							"aria-hidden": "true"
						}) })
					]
				})
			}, item.id);
		}), remote ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
			href: remote,
			target: "_blank",
			rel: "noreferrer",
			className: "block w-full",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Attachment, {
				dir: "rtl",
				state: "done",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentMedia, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(File, { "aria-hidden": "true" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AttachmentContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentTitle, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", { children: fileNameFromUrl(remote) || linkHost(remote) || "فایل" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentDescription, { children: linkHost(remote) || "بارگذاری شد" })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentActions, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
						className: "size-4 text-muted",
						"aria-hidden": "true"
					}) })
				]
			})
		}) : null]
	});
	const panel = desktop ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-[80] flex items-center justify-center p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute inset-0 bg-black/60 backdrop-blur-sm",
			"aria-label": "بستن",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "dialog",
			"aria-modal": "true",
			className: "relative z-10 grid max-h-[85dvh] w-full min-w-0 max-w-md gap-4 overflow-x-hidden overflow-y-auto rounded-[1.375rem] border border-line bg-card p-5 text-ink shadow-[0_20px_50px_-20px_rgb(0_0_0/0.8)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "min-w-0 truncate text-base font-semibold",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "بستن",
					onClick: onClose,
					className: "grid size-9 shrink-0 place-items-center rounded-full text-ink hover:bg-paper",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
						className: "size-5",
						"aria-hidden": "true"
					})
				})]
			}), cards]
		})]
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-[80]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute inset-0 bg-black/40",
			"aria-label": "بستن",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "sheet-up absolute inset-x-0 bottom-0 max-h-[85dvh] w-full min-w-0 overflow-x-hidden overflow-y-auto rounded-t-2xl border border-line bg-card px-4 pt-4 pb-6 text-ink shadow-xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "min-w-0 truncate font-bold",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "بستن",
					onClick: onClose,
					className: "grid size-9 shrink-0 place-items-center text-ink",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
						className: "size-5",
						"aria-hidden": "true"
					})
				})]
			}), cards]
		})]
	});
	if (typeof document === "undefined") return null;
	return (0, import_react_dom.createPortal)(panel, document.body);
}
function GalleryBlock({ block }) {
	const photos = (block.items ?? []).filter((item) => item.value.startsWith("data:image/"));
	const face = (0, import_react.useContext)(FaceContext);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: face ? { color: face.page } : void 0,
		className: face ? "" : "text-white",
		children: [
			block.title?.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-base font-medium leading-6",
				children: block.title
			}) : null,
			block.body?.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm leading-6",
				style: { color: face?.muted ?? "rgba(255,255,255,0.7)" },
				children: block.body
			}) : null,
			photos.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${block.title?.trim() || block.body?.trim() ? "mt-3" : ""}`,
				children: photos.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: item.value,
					alt: "",
					draggable: false,
					className: "h-52 w-[84%] shrink-0 snap-center object-cover",
					style: { borderRadius: face?.radius ?? "0.75rem" }
				}, item.id))
			}) : null
		]
	});
}
function videoWatch(kind, value) {
	const raw = value.trim();
	if (kind === "youtube") {
		const id = youtubeId(raw);
		return id ? `https://www.youtube.com/watch?v=${id}` : "";
	}
	if (kind === "aparat") {
		const hash = aparatHash(raw);
		return hash ? `https://www.aparat.com/v/${hash}` : "";
	}
	return "";
}
function videoEmbed(kind, value) {
	if (kind === "youtube") {
		const id = youtubeId(value);
		return id ? `https://www.youtube.com/embed/${id}` : "";
	}
	if (kind === "aparat") {
		const hash = aparatHash(value);
		return hash ? `https://www.aparat.com/video/video/embed/videohash/${hash}/vt/frame` : "";
	}
	return "";
}
function youtubeId(value) {
	try {
		const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
		const host = url.hostname.replace(/^www\./, "");
		if (host === "youtu.be") return cleanId(url.pathname.split("/").filter(Boolean)[0] ?? "", true);
		if (host === "youtube.com" || host === "m.youtube.com") {
			if (url.pathname === "/watch") return cleanId(url.searchParams.get("v") ?? "", true);
			const parts = url.pathname.split("/").filter(Boolean);
			if (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live") return cleanId(parts[1] ?? "", true);
		}
	} catch {
		return "";
	}
	return "";
}
function aparatHash(value) {
	try {
		const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
		if (url.hostname.replace(/^www\./, "") !== "aparat.com") return "";
		const parts = url.pathname.split("/").filter(Boolean);
		if (parts[0] === "v" && parts[1]) return cleanId(parts[1], false);
		const at = parts.indexOf("videohash");
		if (at >= 0 && parts[at + 1]) return cleanId(parts[at + 1], false);
	} catch {
		return "";
	}
	return "";
}
function cleanId(value, youtube) {
	const id = value.split("?")[0] ?? "";
	return (youtube ? /^[A-Za-z0-9_-]{6,20}$/ : /^[A-Za-z0-9]{4,20}$/).test(id) ? id : "";
}
function VideoBlock({ block }) {
	const clips = (block.items ?? []).filter((item) => item.kind === "file" || videoEmbed(item.kind, item.value));
	const face = (0, import_react.useContext)(FaceContext);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: face ? { color: face.page } : void 0,
		className: face ? "" : "text-white",
		children: [
			block.title?.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-base font-medium leading-6",
				children: block.title
			}) : null,
			block.body?.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm leading-6",
				style: { color: face?.muted ?? "rgba(255,255,255,0.7)" },
				children: block.body
			}) : null,
			clips.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `grid gap-3 ${block.title?.trim() || block.body?.trim() ? "mt-3" : ""}`,
				children: clips.map((item) => item.kind === "file" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					src: item.value,
					controls: true,
					playsInline: true,
					className: "w-full bg-black object-cover",
					style: { borderRadius: face?.radius ?? "0.75rem" }
				}, item.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
					src: videoEmbed(item.kind, item.value),
					title: item.kind === "aparat" ? "آپارات" : "یوتیوب",
					className: "aspect-video w-full",
					style: { borderRadius: face?.radius ?? "0.75rem" },
					allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
					allowFullScreen: true
				}, item.id))
			}) : null
		]
	});
}
function FaqBlock({ block }) {
	const Icon = pageIcon(block.icon) ?? CircleHelp;
	const face = (0, import_react.useContext)(FaceContext);
	const questions = (block.items ?? []).filter((item) => item.title?.trim() && item.value.trim());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("px-4 py-3.5", face ? "overflow-hidden" : "rounded-[1.25rem] bg-[#1c1c1c] text-white", face?.layout === "card" ? "flex aspect-square flex-col justify-center" : ""),
		style: face ? {
			background: face.card,
			color: face.text,
			borderRadius: face.radius
		} : void 0,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
				className: cn("size-5 shrink-0", face ? "" : "text-white"),
				"aria-hidden": "true"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-base font-medium leading-6",
					children: block.title?.trim() || "سوالات متداول"
				}), block.body?.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("mt-0.5 block text-sm leading-6", face ? "opacity-70" : "text-white/60"),
					children: block.body
				}) : null]
			})]
		}), questions.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Accordion, {
			multiple: true,
			items: questions.map((item) => ({
				id: item.id,
				title: item.title,
				content: item.value
			}))
		}) : null]
	});
}
function TextBlock({ block }) {
	const Icon = pageIcon(block.icon) ?? Type;
	const face = (0, import_react.useContext)(FaceContext);
	const align = block.align === "center" || block.align === "left" ? block.align : "right";
	const alignClass = align === "center" ? "text-center" : align === "left" ? "text-left" : "text-right";
	const photo = block.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: block.image,
		alt: "",
		className: "w-full object-cover",
		style: { borderRadius: face?.radius ?? "0.75rem" }
	}) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("px-4 py-3.5", face ? "overflow-hidden" : "rounded-[1.25rem] bg-[#1c1c1c] text-white", face?.layout === "card" ? "flex aspect-square flex-col items-center justify-center text-center" : ""),
		style: face ? {
			background: face.card,
			color: face.text,
			borderRadius: face.radius
		} : void 0,
		children: [
			photo && block.imagePos !== "after" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-3",
				children: photo
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: cn("size-5 shrink-0", face ? "" : "text-white"),
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "min-w-0 text-base font-medium leading-6",
					children: block.title?.trim() || "متن ساده"
				})]
			}),
			block.body?.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: `mt-2 whitespace-pre-wrap text-sm leading-7 [overflow-wrap:anywhere] ${face ? "opacity-80" : "text-white/80"} ${alignClass}`,
				children: block.body
			}) : null,
			photo && block.imagePos === "after" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: photo
			}) : null
		]
	});
}
function SocialMark({ kind, className = "size-5" }) {
	const letters = {
		kik: "ک",
		bale: "ب",
		rubika: "ر",
		igap: "آ"
	};
	if (letters[kind]) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-sm font-bold leading-none",
		children: letters[kind]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(kind === "instagram" ? Instagram : kind === "telegram" ? Send : kind === "x" ? Twitter : kind === "youtube" ? Youtube : kind === "linkedin" ? Linkedin : kind === "email" ? Mail : kind === "phone" ? Phone : kind === "website" ? Globe : kind === "whatsapp" ? MessageCircle : AtSign, {
		className,
		"aria-hidden": "true"
	});
}
function SocialIcons({ items }) {
	const face = (0, import_react.useContext)(FaceContext);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap justify-center gap-2.5",
		children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
			href: socialHref(item),
			target: item.kind === "phone" || item.kind === "email" ? void 0 : "_blank",
			rel: "noreferrer",
			"aria-label": item.title?.trim() || socialKind(item.kind).label,
			className: cn("grid size-12 place-items-center rounded-full border", face ? "border-current" : "border-white/15 text-white"),
			style: face ? { color: face.page } : void 0,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialMark, { kind: item.kind })
		}, item.id))
	});
}
function SocialFooter({ block }) {
	const items = block.items ?? [];
	const face = (0, import_react.useContext)(FaceContext);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mb-4 flex w-full max-w-sm overflow-hidden rounded-full",
		style: {
			background: face?.card ?? "#1c1c1c",
			color: face?.text ?? "#fff"
		},
		children: items.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
			href: socialHref(item),
			target: item.kind === "phone" || item.kind === "email" ? void 0 : "_blank",
			rel: "noreferrer",
			"aria-label": item.title?.trim() || socialKind(item.kind).label,
			className: `grid h-12 min-w-12 flex-1 place-items-center ${index > 0 ? "border-s border-current/20" : ""}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialMark, { kind: item.kind })
		}, item.id))
	});
}
function ContactWindow({ title, items, mode, onClose }) {
	const [desktop, setDesktop] = (0, import_react.useState)(() => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches);
	(0, import_react.useEffect)(() => {
		const query = window.matchMedia("(min-width: 1024px)");
		const sync = () => setDesktop(query.matches);
		sync();
		query.addEventListener("change", sync);
		return () => query.removeEventListener("change", sync);
	}, []);
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			if (event.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose]);
	const list = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "grid min-w-0 gap-2",
		children: items.map((item) => {
			if (mode === "address" && item.kind === "text") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "min-w-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex w-full min-w-0 items-start gap-3 rounded-xl bg-paper px-3 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
						className: "mt-0.5 size-5 shrink-0 text-jade",
						"aria-hidden": "true"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm font-semibold leading-6",
							children: "آدرس متنی"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-0.5 block whitespace-pre-wrap text-sm leading-6 text-muted [overflow-wrap:anywhere]",
							children: item.value
						})]
					})]
				})
			}, item.id);
			const kind = mode === "address" ? addressKind(item.kind) : mode === "social" ? socialKind(item.kind) : contactKind(item.kind);
			const href = mode === "address" ? item.value : mode === "social" ? socialHref(item) : contactHref(item);
			const external = mode === "address" || mode === "social" ? item.kind !== "phone" && item.kind !== "email" : item.kind !== "phone" && item.kind !== "email";
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "min-w-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href,
					target: external ? "_blank" : void 0,
					rel: "noreferrer",
					className: "flex w-full min-w-0 items-center gap-3 rounded-xl bg-paper px-3 py-3",
					children: [
						mode === "address" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, {
							className: "size-5 shrink-0 text-jade",
							"aria-hidden": "true"
						}) : mode === "social" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-jade",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SocialMark, { kind: item.kind })
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContactMark, { kind: item.kind }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-sm font-semibold leading-6",
								children: item.title?.trim() || kind.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								dir: "ltr",
								className: "mt-0.5 block text-end text-sm leading-5 text-muted [overflow-wrap:anywhere]",
								children: item.value
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
							className: "size-4 shrink-0 text-muted",
							"aria-hidden": "true"
						})
					]
				})
			}, item.id);
		})
	});
	const panel = desktop ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-[80] flex items-center justify-center p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute inset-0 bg-black/60 backdrop-blur-sm",
			"aria-label": "بستن",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "dialog",
			"aria-modal": "true",
			className: "relative z-10 grid max-h-[85dvh] w-full min-w-0 max-w-md gap-4 overflow-x-hidden overflow-y-auto rounded-[1.375rem] border border-line bg-card p-5 text-ink shadow-[0_20px_50px_-20px_rgb(0_0_0/0.8)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "min-w-0 truncate text-base font-semibold",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "بستن",
					onClick: onClose,
					className: "grid size-9 shrink-0 place-items-center rounded-full text-ink hover:bg-paper",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
						className: "size-5",
						"aria-hidden": "true"
					})
				})]
			}), list]
		})]
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-[80]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute inset-0 bg-black/40",
			"aria-label": "بستن",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "sheet-up absolute inset-x-0 bottom-0 max-h-[85dvh] w-full min-w-0 overflow-x-hidden overflow-y-auto rounded-t-2xl border border-line bg-card px-4 pt-4 pb-6 text-ink shadow-xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "min-w-0 truncate font-bold",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "بستن",
					onClick: onClose,
					className: "grid size-9 shrink-0 place-items-center text-ink",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
						className: "size-5",
						"aria-hidden": "true"
					})
				})]
			}), list]
		})]
	});
	if (typeof document === "undefined") return null;
	return (0, import_react_dom.createPortal)(panel, document.body);
}
function ContactMark({ kind }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(kind === "email" ? Mail : kind === "telegram" ? Send : kind === "phone" ? Phone : MessageCircle, {
		className: "size-5 shrink-0 text-jade",
		"aria-hidden": "true"
	});
}
function contactHref(item) {
	const value = item.value.trim();
	if (item.kind === "phone") return `tel:${onlyDigits(value)}`;
	if (item.kind === "email") return `mailto:${value}`;
	if (item.kind === "whatsapp") {
		let number = onlyDigits(value);
		if (number.startsWith("0")) number = `98${number.slice(1)}`;
		return `https://wa.me/${number}`;
	}
	if (/^https?:\/\//i.test(value)) return value;
	const handle = value.replace(/^@/, "");
	if (item.kind === "telegram") return `https://t.me/${handle}`;
	if (item.kind === "eitaa") return `https://eitaa.com/${handle}`;
	if (item.kind === "bale") return `https://ble.ir/${handle}`;
	return `https://rubika.ir/${handle}`;
}
function onlyDigits(value) {
	const persian = "۰۱۲۳۴۵۶۷۸۹";
	return value.replace(/[۰-۹]/g, (digit) => String(persian.indexOf(digit))).replace(/\D/g, "");
}
function CustomerLinkStage(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-dvh overflow-hidden bg-black lg:grid lg:h-auto lg:min-h-dvh lg:place-items-center lg:bg-[#242424] lg:px-4 lg:py-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto flex h-full w-full max-w-[480px] flex-col lg:h-[min(58rem,calc(100dvh-3rem))] lg:w-[30rem] lg:max-w-none lg:overflow-hidden lg:rounded-[2.9rem] lg:bg-black lg:shadow-[0_40px_90px_-28px_rgb(0_0_0/0.75)] lg:ring-1 lg:ring-white/10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerLink, { ...props })
		})
	});
}
//#endregion
export { videoWatch as C, themeColors as S, normalizeDesign as _, AttachmentDescription as a, socialKinds as b, CustomerLink as c, addressKinds as d, cleanHex as f, gradientCss as g, defaultPageDesign as h, AttachmentContent as i, CustomerLinkStage as l, contactKinds as m, AttachmentAction as n, AttachmentMedia as o, contactKind as p, AttachmentActions as r, AttachmentTitle as s, Attachment as t, DividerLine as u, parseDesign as v, socialValueOk as x, resolveTheme as y };
