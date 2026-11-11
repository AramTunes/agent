import { i as __toESM } from "../_runtime.mjs";
import { D as placeMenuOrderFn, O as publicBusinessFn } from "./api-vBbERkBq.mjs";
import { X as require_jsx_runtime, Z as require_react, d as require_react_dom, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Empty, d as TextInput, g as enDigits, h as cn, l as Skeleton, s as Field, t as Area, v as faNum } from "./ui-CYEMVOYZ.mjs";
import { B as Pencil, E as ShoppingBag, I as Plus, J as Minus, Kt as Briefcase, Lt as ChevronDown, Rt as Check, c as UtensilsCrossed, g as Trash2, j as Search, r as X, ut as ImagePlus } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Shell } from "./shell-Dkqa3wbv.mjs";
import { t as JalaliCalendar } from "./jalali-calendar-jyOmkH66.mjs";
import { t as AnimatedTabs } from "./animated-tabs-B0-uRxFM.mjs";
import { n as pageIcon } from "./page-icons-BbT14YzL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/menu-block-BG4_aCM-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom());
function Switch({ checked, onCheckedChange, disabled, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		role: "switch",
		"aria-checked": checked,
		"aria-label": label,
		disabled,
		onClick: () => onCheckedChange(!checked),
		className: cn("relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors", checked ? "bg-jade" : "bg-line", disabled && "cursor-not-allowed opacity-50"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("pointer-events-none block size-5 rounded-full shadow transition-transform", checked ? "-translate-x-5 bg-on-jade" : "-translate-x-0.5 bg-card") })
	});
}
function themeOf(el) {
	return el?.closest("[data-theme]")?.getAttribute("data-theme") ?? void 0;
}
function floatStyle(el, { side = "bottom", align = "start", gap = 8, panel, matchWidth } = {}) {
	const r = el.getBoundingClientRect();
	const rtl = getComputedStyle(el).direction === "rtl";
	const ph = panel?.offsetHeight ?? 0;
	const pw = panel?.offsetWidth ?? 0;
	let actual = side;
	if (ph) {
		if (side === "bottom" && r.bottom + gap + ph > window.innerHeight && r.top - gap - ph >= gap) actual = "top";
		else if (side === "top" && r.top - gap - ph < gap && r.bottom + gap + ph <= window.innerHeight) actual = "bottom";
	}
	const s = {};
	if (actual === "bottom") s.top = r.bottom + gap;
	else s.bottom = window.innerHeight - r.top + gap;
	if (matchWidth) {
		s.width = r.width;
		s.left = r.left;
	} else if (align === "center") s.left = Math.max(gap, r.left + r.width / 2 - pw / 2);
	else if (align === "start" === !rtl) s.left = r.left;
	else s.right = window.innerWidth - r.right;
	return s;
}
function useFloat(open, anchor, opts = {}) {
	const { side = "bottom", align = "start", gap = 8, matchWidth = false } = opts;
	const [mounted, setMounted] = (0, import_react.useState)(false);
	const [style, setStyle] = (0, import_react.useState)({});
	const [theme, setTheme] = (0, import_react.useState)();
	const panel = (0, import_react.useRef)(null);
	const update = (0, import_react.useCallback)(() => {
		const el = anchor.current;
		if (!el) return;
		setStyle(floatStyle(el, {
			side,
			align,
			gap,
			matchWidth,
			panel: panel.current
		}));
		setTheme(themeOf(el));
	}, [
		anchor,
		side,
		align,
		gap,
		matchWidth
	]);
	(0, import_react.useEffect)(() => setMounted(true), []);
	(0, import_react.useLayoutEffect)(() => {
		if (!open) return;
		update();
		window.addEventListener("resize", update);
		window.addEventListener("scroll", update, true);
		return () => {
			window.removeEventListener("resize", update);
			window.removeEventListener("scroll", update, true);
		};
	}, [open, update]);
	return {
		mounted,
		style,
		theme,
		panel,
		update
	};
}
function FloatPortal({ open, mounted, style, theme, panelRef, className, children }) {
	if (!mounted || !open) return null;
	return (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: panelRef,
		"data-theme": theme,
		style,
		className,
		children
	}), document.body);
}
function Combobox({ options, value = "", onChange, placeholder = "جست‌وجو…", emptyText = "چیزی پیدا نشد", className, id, name, disabled, strict }) {
	const [query, setQuery] = (0, import_react.useState)(value);
	const [prevValue, setPrevValue] = (0, import_react.useState)(value);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [index, setIndex] = (0, import_react.useState)(0);
	const listId = (0, import_react.useId)();
	const root = (0, import_react.useRef)(null);
	const listRef = (0, import_react.useRef)(null);
	const { mounted, style, theme, panel } = useFloat(open, root, {
		matchWidth: true,
		gap: 4
	});
	if (value !== prevValue) {
		setPrevValue(value);
		setQuery(value);
	}
	const q = query.trim();
	const filtered = (0, import_react.useMemo)(() => {
		const folded = fold(q);
		if (!folded || q === value) return options;
		const starts = options.filter((option) => fold(option).startsWith(folded));
		const contains = options.filter((option) => !fold(option).startsWith(folded) && fold(option).includes(folded));
		return [...starts, ...contains];
	}, [
		options,
		q,
		value
	]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		listRef.current?.querySelector(`[data-index="${index}"]`)?.scrollIntoView({ block: "nearest" });
	}, [open, index]);
	function pick(next) {
		setQuery(next);
		onChange?.(next);
		setOpen(false);
	}
	function commit() {
		setOpen(false);
		if (!strict || query === value) return;
		const folded = fold(query.trim());
		const exact = folded ? options.find((option) => fold(option) === folded) : void 0;
		if (exact) pick(exact);
		else if (!folded && value) pick("");
		else setQuery(value);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: root,
		className: cn("relative", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("flex min-h-11 w-full items-center rounded-xl border border-line bg-card pe-2 ps-3 focus-within:ring-2 focus-within:ring-ink/20", disabled && "cursor-not-allowed opacity-50"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id,
					role: "combobox",
					"aria-expanded": open,
					"aria-controls": listId,
					"aria-autocomplete": "list",
					disabled,
					autoComplete: "off",
					value: query,
					placeholder,
					onChange: (event) => {
						setQuery(event.target.value);
						setOpen(true);
						setIndex(0);
					},
					onFocus: (event) => {
						setOpen(true);
						if (query === value) event.currentTarget.select();
					},
					onBlur: () => setTimeout(commit, 120),
					onKeyDown: (event) => {
						if (event.key === "ArrowDown") {
							event.preventDefault();
							setOpen(true);
							setIndex((current) => Math.min(filtered.length - 1, current + 1));
						}
						if (event.key === "ArrowUp") {
							event.preventDefault();
							setIndex((current) => Math.max(0, current - 1));
						}
						if (event.key === "Enter" && open && filtered[index]) {
							event.preventDefault();
							pick(filtered[index]);
						}
						if (event.key === "Escape") setOpen(false);
					},
					className: "h-11 min-w-0 flex-1 bg-transparent pe-1 text-sm text-ink outline-none placeholder:text-muted disabled:cursor-not-allowed"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("size-4 text-muted transition-transform", open && "rotate-180") })]
			}),
			name ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "hidden",
				name,
				value
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloatPortal, {
				open,
				mounted,
				style,
				theme,
				panelRef: panel,
				className: "fixed z-[80]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					id: listId,
					ref: listRef,
					role: "listbox",
					className: "max-h-56 overflow-auto rounded-xl border border-line bg-card p-1 text-sm text-ink shadow-lg",
					children: [filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "px-2.5 py-2 text-muted",
						children: emptyText
					}) : null, filtered.map((option, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						role: "option",
						"data-index": i,
						"aria-selected": option === value,
						onMouseDown: (event) => {
							event.preventDefault();
							pick(option);
						},
						onMouseEnter: () => setIndex(i),
						className: cn("flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2", i === index && "bg-paper"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: q && q !== value && option.startsWith(q) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: q
						}), option.slice(q.length)] }) : option }), option === value ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 shrink-0" }) : null]
					}, option))]
				})
			})
		]
	});
}
function fold(value) {
	return value.replace(/ي/g, "ی").replace(/ى/g, "ی").replace(/ك/g, "ک").replace(/[آأإ]/g, "ا").replace(/[\s‌]+/g, "");
}
function Select({ className, options, placeholder, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
			className: cn("min-h-11 w-full cursor-pointer appearance-none rounded-xl border border-line bg-card ps-3 pe-9 text-sm text-ink outline-none", "focus-visible:ring-2 focus-visible:ring-ink/20", "disabled:cursor-not-allowed disabled:opacity-50", className),
			...props,
			children: [placeholder ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: "",
				disabled: true,
				children: placeholder
			}) : null, options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: option.value,
				disabled: option.disabled,
				children: option.label
			}, option.value))]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted" })]
	});
}
function fitImage(file, maxEdge = 960, limit = 18e4) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () => reject(/* @__PURE__ */ new Error("read"));
		reader.onload = () => {
			const img = new Image();
			img.onerror = () => reject(/* @__PURE__ */ new Error("image"));
			img.onload = () => {
				let edge = maxEdge;
				let quality = .72;
				const paint = () => {
					const scale = Math.min(1, edge / Math.max(img.width, img.height));
					const canvas = document.createElement("canvas");
					canvas.width = Math.max(1, Math.round(img.width * scale));
					canvas.height = Math.max(1, Math.round(img.height * scale));
					const ctx = canvas.getContext("2d");
					if (!ctx) {
						reject(/* @__PURE__ */ new Error("canvas"));
						return;
					}
					ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
					const url = canvas.toDataURL("image/jpeg", quality);
					if (url.length <= limit || edge <= 280 && quality <= .42) {
						resolve(url);
						return;
					}
					if (quality > .46) quality = Math.round((quality - .12) * 100) / 100;
					else edge = Math.round(edge * .72);
					paint();
				};
				paint();
			};
			img.src = String(reader.result);
		};
		reader.readAsDataURL(file);
	});
}
var statuses = [
	{
		id: "available",
		label: "موجود"
	},
	{
		id: "unavailable",
		label: "ناموجود"
	},
	{
		id: "hidden",
		label: "مخفی"
	}
];
var priceTypes = [
	{
		id: "fixed",
		label: "ثابت"
	},
	{
		id: "from",
		label: "از"
	},
	{
		id: "range",
		label: "بازه"
	},
	{
		id: "contact",
		label: "تماس بگیرید"
	},
	{
		id: "free",
		label: "رایگان"
	}
];
var presetLabels = [
	"ویژه",
	"جدید",
	"پرفروش",
	"پیشنهاد ما"
];
var presetUnits = [
	"عدد",
	"کیلوگرم",
	"گرم",
	"میلی‌گرم",
	"لیتر",
	"میلی‌لیتر",
	"متر",
	"سانتی‌متر",
	"بسته",
	"جفت"
];
var currencies = [
	{
		id: "toman",
		label: "تومان"
	},
	{
		id: "rial",
		label: "ریال"
	},
	{
		id: "dollar",
		label: "دلار"
	},
	{
		id: "euro",
		label: "یورو"
	},
	{
		id: "dinar",
		label: "دینار عراق"
	}
];
var views = [
	{
		id: "list",
		label: "لیست"
	},
	{
		id: "grid",
		label: "گرید"
	},
	{
		id: "card",
		label: "کارت"
	}
];
function money(value) {
	const n = Number(enDigits(value).replace(/[^\d]/g, ""));
	return Number.isFinite(n) ? n : 0;
}
function webLink(value) {
	const next = value.trim();
	if (!next) return "";
	if (/^https?:\/\//i.test(next)) return next;
	if (/^[\w.-]+\.[a-z]{2,}([/?#].*)?$/i.test(next)) return `https://${next}`;
	return next;
}
function unitName(currency) {
	return currencies.find((item) => item.id === currency)?.label ?? "تومان";
}
function formatMenuMoney(amount, currency) {
	const grouped = Math.max(0, Math.round(amount)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
	return `${faNum(grouped)} ${unitName(currency)}`;
}
function priceText(item, currency) {
	if (item.priceType === "free") return "رایگان";
	if (item.priceType === "contact") return "تماس بگیرید";
	if (item.priceType === "from") return `از ${formatMenuMoney(item.price ?? 0, currency)}`;
	if (item.priceType === "range") return `${formatMenuMoney(item.price ?? 0, currency)} تا ${formatMenuMoney(item.priceTo ?? 0, currency)}`;
	return formatMenuMoney(item.price ?? 0, currency);
}
function priceWithUnit(item, currency) {
	const text = priceText(item, currency);
	if (!item.unit || item.priceType === "free" || item.priceType === "contact") return text;
	return `${text} / ${item.unit}`;
}
function blankDish() {
	return {
		id: crypto.randomUUID(),
		image: "",
		title: "",
		description: "",
		price: "",
		priceTo: "",
		priceType: "fixed",
		variants: [],
		categoryId: "",
		status: "available",
		labels: [],
		unit: "",
		link: "",
		sku: "",
		featured: false
	};
}
function dishFrom(item) {
	return {
		id: item.id,
		image: item.image ?? "",
		title: item.title ?? "",
		description: item.value ?? "",
		price: item.price ? String(item.price) : "",
		priceTo: item.priceTo ? String(item.priceTo) : "",
		priceType: priceTypes.some((type) => type.id === item.priceType) ? item.priceType : "fixed",
		variants: (item.variants ?? []).map((variant) => ({ ...variant })),
		categoryId: item.categoryId ?? "",
		status: statuses.some((status) => status.id === item.status) ? item.status : "available",
		labels: item.labels ?? [],
		unit: item.unit ?? "",
		link: item.link ?? "",
		sku: item.sku ?? "",
		featured: Boolean(item.featured)
	};
}
function toItem(dish) {
	return {
		id: dish.id,
		kind: "item",
		title: dish.title.trim(),
		value: dish.description.trim().slice(0, 100),
		image: dish.image,
		price: money(dish.price),
		priceTo: dish.priceType === "range" ? money(dish.priceTo) : 0,
		priceType: dish.priceType,
		status: dish.status,
		categoryId: dish.categoryId,
		labels: dish.labels,
		unit: dish.unit.trim().slice(0, 24),
		link: webLink(dish.link),
		sku: dish.sku.trim().slice(0, 40),
		featured: dish.featured,
		variants: dish.variants
	};
}
function toCategory(category) {
	return {
		id: category.id,
		kind: "category",
		title: category.title.trim(),
		value: category.description.trim().slice(0, 100),
		image: category.image
	};
}
var words = {
	menu: {
		tab: "آیتم‌ها",
		search: "جست‌وجو در عنوان آیتم‌ها",
		empty: "هنوز آیتمی اضافه نشده.",
		none: "آیتمی با این عنوان نیست.",
		needTitle: "عنوان آیتم را وارد کنید",
		window: "آیتم منو",
		photo: "عکس آیتم",
		details: "جزئیات آیتم",
		path: "menu",
		pathHint: "اگر خالی بماند، نشانی صفحه menu می‌شود.",
		view: "نمای منو",
		screen: "منوی دیجیتال",
		missing: "این منو نیست",
		missingBody: "این نشانی به منو وصل نیست.",
		featured: "این مورد در منو برجسته‌تر از بقیه دیده می‌شود. اگر لیبل هم برایش بگذاری، دلیل برجسته بودنش برای مشتری روشن‌تر است."
	},
	products: {
		tab: "محصولات",
		search: "جست‌وجو در عنوان محصولات",
		empty: "هنوز محصولی اضافه نشده.",
		none: "محصولی با این عنوان نیست.",
		needTitle: "عنوان محصول را وارد کنید",
		window: "محصول",
		photo: "عکس محصول",
		details: "جزئیات محصول",
		path: "products",
		pathHint: "اگر خالی بماند، نشانی صفحه products می‌شود.",
		view: "نمای محصولات",
		screen: "محصولات",
		missing: "این فروشگاه نیست",
		missingBody: "این نشانی به محصولات وصل نیست.",
		featured: "این محصول در فهرست برجسته‌تر از بقیه دیده می‌شود. اگر لیبل هم برایش بگذاری، دلیل برجسته بودنش برای مشتری روشن‌تر است."
	},
	services: {
		tab: "خدمات",
		search: "جست‌وجو در عنوان خدمات",
		empty: "هنوز خدمتی اضافه نشده.",
		none: "خدمتی با این عنوان نیست.",
		needTitle: "عنوان خدمت را وارد کنید",
		window: "خدمت",
		photo: "عکس خدمت",
		details: "جزئیات خدمت",
		path: "services",
		pathHint: "اگر خالی بماند، نشانی صفحه services می‌شود.",
		view: "نمای خدمات",
		screen: "خدمات",
		missing: "این خدمات نیست",
		missingBody: "این نشانی به خدمات وصل نیست.",
		featured: "این خدمت در فهرست برجسته‌تر از بقیه دیده می‌شود. اگر لیبل هم برایش بگذاری، دلیل برجسته بودنش برای مشتری روشن‌تر است."
	}
};
function catalogMark(mode) {
	if (mode === "products") return ShoppingBag;
	if (mode === "services") return Briefcase;
	return UtensilsCrossed;
}
function catalogFallback(type) {
	if (type === "products") return "products";
	if (type === "services") return "services";
	return "menu";
}
function MenuFields({ items, icon, title, body, path, layout, currency, prefix, mode = "menu", onItems, onIcon, onTitle, onBody, onPath, onLayout, onCurrency, onDialog }) {
	const [tab, setTab] = (0, import_react.useState)(0);
	const [query, setQuery] = (0, import_react.useState)("");
	const [catQuery, setCatQuery] = (0, import_react.useState)("");
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [category, setCategory] = (0, import_react.useState)(null);
	const dishes = items.filter((item) => item.kind === "item");
	const categories = items.filter((item) => item.kind === "category");
	const shown = dishes.filter((item) => !query.trim() || (item.title ?? "").includes(query.trim()));
	const shownCats = categories.filter((item) => !catQuery.trim() || (item.title ?? "").includes(catQuery.trim()));
	const copy = words[mode];
	const storedUnits = items.map((item) => item.kind === "unit" ? item.title?.trim() || "" : "").filter(Boolean);
	const units = storedUnits.length > 0 ? storedUnits : [...presetUnits];
	const Mark = pageIcon(icon) ?? catalogMark(mode);
	(0, import_react.useEffect)(() => {
		onDialog(Boolean(editing));
		return () => onDialog(false);
	}, [editing, onDialog]);
	function saveDish(dish) {
		if (!dish.title.trim()) {
			toast.error(copy.needTitle);
			return;
		}
		const link = webLink(dish.link);
		if (link && !/^https?:\/\//i.test(link)) {
			toast.error("لینک محصول معتبر نیست");
			return;
		}
		const next = toItem(dish);
		onItems(items.some((item) => item.id === dish.id) ? items.map((item) => item.id === dish.id ? next : item) : [...items, next]);
		setEditing(null);
	}
	function saveCategory(next) {
		if (!next.title.trim()) {
			toast.error("عنوان دسته‌بندی را وارد کنید");
			return;
		}
		const row = toCategory(next);
		onItems(items.some((item) => item.id === next.id) ? items.map((item) => item.id === next.id ? row : item) : [...items, row]);
		setCategory(null);
	}
	function persistUnits(next, rename) {
		const unique = [...new Set(next.map((item) => item.trim()).filter(Boolean))].slice(0, 40);
		const rest = items.filter((item) => item.kind !== "unit").map((row) => {
			if (row.kind !== "item" || !row.unit) return row;
			if (rename && row.unit === rename.from) return {
				...row,
				unit: rename.to
			};
			if (!unique.includes(row.unit)) return {
				...row,
				unit: ""
			};
			return row;
		});
		const rows = unique.map((title) => {
			return {
				id: items.find((item) => item.kind === "unit" && item.title === title)?.id ?? crypto.randomUUID(),
				kind: "unit",
				title,
				value: ""
			};
		});
		onItems([...rest, ...rows]);
		setEditing((dish) => {
			if (!dish?.unit) return dish;
			if (rename && dish.unit === rename.from) return {
				...dish,
				unit: rename.to
			};
			if (!unique.includes(dish.unit)) return {
				...dish,
				unit: ""
			};
			return dish;
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedTabs, {
			className: "bg-card",
			items: [
				{ label: copy.tab },
				{ label: "دسته‌بندی‌ها" },
				{ label: "تنظیمات" }
			],
			value: tab,
			onChange: setTab
		}),
		tab === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchRow, {
					value: query,
					onChange: setQuery,
					placeholder: copy.search,
					onAdd: () => setEditing(blankDish())
				}),
				dishes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-xl border border-dashed border-line px-3 py-6 text-center text-sm text-muted",
					children: copy.empty
				}) : null,
				dishes.length > 0 && shown.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: copy.none
				}) : null,
				shown.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 rounded-xl border border-line bg-card p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Thumb, {
							image: item.image,
							mark: catalogMark(mode)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate font-semibold",
								children: item.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate text-xs text-muted",
								children: [
									priceWithUnit(item, currency),
									" · ",
									statuses.find((status) => status.id === item.status)?.label ?? "موجود"
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
							label: "ویرایش",
							onClick: () => setEditing(dishFrom(item)),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
							label: "حذف",
							onClick: () => onItems(items.filter((row) => row.id !== item.id)),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						})
					]
				}, item.id))
			]
		}) : null,
		tab === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchRow, {
					value: catQuery,
					onChange: setCatQuery,
					placeholder: "جست‌وجو در دسته‌بندی‌ها",
					onAdd: () => setCategory({
						id: crypto.randomUUID(),
						image: "",
						title: "",
						description: ""
					})
				}),
				category && !categories.some((item) => item.id === category.id) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryForm, {
					category,
					fresh: true,
					onChange: setCategory,
					onSave: () => saveCategory(category),
					onCancel: () => setCategory(null)
				}) : null,
				categories.length === 0 && !category ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-xl border border-dashed border-line px-3 py-6 text-center text-sm text-muted",
					children: "هنوز دسته‌بندی اضافه نشده."
				}) : null,
				categories.length > 0 && shownCats.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "دسته‌بندی با این عنوان نیست."
				}) : null,
				shownCats.map((item) => category?.id === item.id && category ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryForm, {
					category,
					onChange: setCategory,
					onSave: () => saveCategory(category),
					onCancel: () => setCategory(null)
				}, item.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 rounded-xl border border-line bg-card p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Thumb, { image: item.image }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate font-semibold",
								children: item.title
							}), item.value ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-xs text-muted",
								children: item.value
							}) : null]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
							label: "ویرایش",
							onClick: () => setCategory({
								id: item.id,
								image: item.image ?? "",
								title: item.title ?? "",
								description: item.value ?? ""
							}),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
							label: "حذف",
							onClick: () => onItems(items.filter((row) => row.id !== item.id).map((row) => row.categoryId === item.id ? {
								...row,
								categoryId: ""
							} : row)),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						})
					]
				}, item.id))
			]
		}) : null,
		tab === 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "آیکون",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onIcon,
						className: "flex min-h-11 w-full items-center gap-3 rounded-xl border border-line bg-card px-3 text-start",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, {
							className: "size-5 shrink-0",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm",
							children: "انتخاب آیکون"
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "عنوان بلوک",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						value: title,
						maxLength: 80,
						onChange: (event) => onTitle(event.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "توضیح کوتاه",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
						value: body,
						maxLength: 100,
						className: "min-h-16",
						onChange: (event) => onBody(event.target.value.slice(0, 100))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "-mt-1 text-xs tabular-nums text-muted",
					children: [
						faNum(body.length),
						" از ",
						faNum(100)
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "واحد پول",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: currencies.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => onCurrency(item.id),
							className: `min-h-10 rounded-full px-3 text-sm ${currency === item.id ? "bg-ink text-on-ink" : "border border-line bg-card"}`,
							children: item.label
						}, item.id))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "نشانی صفحه",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						dir: "ltr",
						className: "flex min-h-11 overflow-hidden rounded-xl border border-line bg-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex items-center bg-paper px-3 text-xs text-muted",
							children: prefix
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: path,
							maxLength: 40,
							placeholder: copy.path,
							onChange: (event) => onPath(event.target.value.replace(/\s/g, "").slice(0, 40)),
							className: "min-w-0 flex-1 bg-transparent px-3 text-left text-sm outline-none"
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "-mt-1 text-xs leading-5 text-muted",
					children: copy.pathHint
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: copy.view,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedTabs, {
						className: "bg-card",
						items: views.map((item) => ({ label: item.label })),
						value: Math.max(0, views.findIndex((item) => item.id === layout)),
						onChange: (next) => onLayout(views[next]?.id ?? "list")
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "-mt-1 text-xs leading-5 text-muted",
					children: layout === "grid" ? "در هر ردیف دو کارت است. اول عکس، بعد عنوان، قیمت و دکمه ثبت سفارش." : layout === "card" ? "مثل لیست است، با پس‌زمینه برای هر مورد." : "عکس، عنوان، قیمت و دکمه ثبت سفارش در یک ردیف و بدون پس‌زمینه."
				})
			]
		}) : null,
		editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemWindow, {
			dish: editing,
			categories,
			currency,
			mode,
			units,
			copy,
			onChange: setEditing,
			onUnits: persistUnits,
			onClose: () => setEditing(null),
			onSave: () => saveDish(editing),
			onOpenCategories: () => {
				setEditing(null);
				setTab(1);
				setCategory({
					id: crypto.randomUUID(),
					image: "",
					title: "",
					description: ""
				});
			}
		}) : null
	] });
}
function SearchRow({ value, onChange, placeholder, onAdd }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative min-w-0 flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
				className: "pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted",
				"aria-hidden": "true"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
				value,
				onChange: (event) => onChange(event.target.value),
				placeholder,
				className: "ps-9"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: onAdd,
			className: "inline-flex h-11 shrink-0 items-center gap-1 rounded-full bg-ink px-4 text-sm font-semibold text-on-ink",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
				className: "size-4",
				"aria-hidden": "true"
			}), "افزودن"]
		})]
	});
}
function IconButton({ label, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		onClick,
		className: "grid size-8 place-items-center rounded-full text-muted hover:bg-paper",
		children
	});
}
function Thumb({ image, mark: Mark = UtensilsCrossed }) {
	return image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: image,
		alt: "",
		className: "size-12 shrink-0 rounded-lg object-cover"
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "grid size-12 shrink-0 place-items-center rounded-lg bg-paper text-muted",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: "size-5" })
	});
}
function CategoryForm({ category, onChange, onSave, onCancel, fresh }) {
	const fileRef = (0, import_react.useRef)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3 rounded-xl border border-line bg-paper p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
				label: "آیکون یا عکس",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: fileRef,
					type: "file",
					accept: "image/*",
					className: "sr-only",
					onChange: (event) => {
						const file = event.target.files?.[0];
						event.target.value = "";
						if (!file) return;
						fitImage(file, 480, 8e4).then((image) => onChange({
							...category,
							image
						})).catch(() => toast.error("این تصویر باز نشد"));
					}
				}), category.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative overflow-hidden rounded-xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: category.image,
						alt: "",
						className: "h-28 w-full object-cover"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-x-0 bottom-0 flex justify-between bg-black/70 px-3 py-2 text-sm font-semibold text-white",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => fileRef.current?.click(),
							children: "ویرایش"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => onChange({
								...category,
								image: ""
							}),
							children: "حذف"
						})]
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => fileRef.current?.click(),
					className: "inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-semibold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "size-4" }), "آپلود آیکون یا عکس"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "عنوان",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					value: category.title,
					maxLength: 80,
					onChange: (event) => onChange({
						...category,
						title: event.target.value
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "توضیحات",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
					value: category.description,
					maxLength: 100,
					className: "min-h-16",
					onChange: (event) => onChange({
						...category,
						description: event.target.value.slice(0, 100)
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "-mt-1 text-xs tabular-nums text-muted",
				children: [
					faNum(category.description.length),
					" از ",
					faNum(100)
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-end gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onCancel,
					className: "inline-flex h-11 items-center rounded-full border border-line bg-card px-4 text-sm font-semibold",
					children: "انصراف"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onSave,
					className: "inline-flex h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-on-ink",
					children: fresh ? "اضافه کردن" : "ذخیره"
				})]
			})
		]
	});
}
function ItemWindow({ dish, categories, currency, mode, units, copy, onChange, onUnits, onClose, onSave, onOpenCategories }) {
	const desktop = useDesktop();
	const fileRef = (0, import_react.useRef)(null);
	const [variantDraft, setVariantDraft] = (0, import_react.useState)(null);
	const [detailsOpen, setDetailsOpen] = (0, import_react.useState)(false);
	const unit = unitName(currency);
	const showPrice = dish.priceType === "fixed" || dish.priceType === "from" || dish.priceType === "range";
	const body = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhotoField, {
				fileRef,
				image: dish.image,
				label: copy.photo,
				onImage: (image) => onChange({
					...dish,
					image
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "عنوان",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					value: dish.title,
					maxLength: 80,
					onChange: (event) => onChange({
						...dish,
						title: event.target.value
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "توضیح کوتاه",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
					value: dish.description,
					maxLength: 100,
					className: "min-h-16",
					onChange: (event) => onChange({
						...dish,
						description: event.target.value.slice(0, 100)
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "-mt-1 text-xs tabular-nums text-muted",
				children: [
					faNum(dish.description.length),
					" از ",
					faNum(100)
				]
			}),
			showPrice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: dish.priceType === "fixed" ? `قیمت (${unit})` : `قیمت از (${unit})`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					type: "number",
					min: 0,
					value: dish.price,
					onChange: (event) => onChange({
						...dish,
						price: event.target.value
					})
				})
			}) : null,
			dish.priceType === "range" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: `قیمت تا (${unit})`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					type: "number",
					min: 0,
					value: dish.priceTo,
					onChange: (event) => onChange({
						...dish,
						priceTo: event.target.value
					})
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 rounded-xl border border-line bg-paper p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-semibold",
						children: "تنوع قیمت"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs leading-5 text-muted",
						children: "اگر این مورد در چند نوع یا اندازه با قیمت‌های متفاوت ارائه می‌شود، گزینه‌ها را اینجا اضافه کنید."
					}),
					dish.variants.map((variant) => variantDraft?.id === variant.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VariantForm, {
						draft: variantDraft,
						unit,
						onChange: setVariantDraft,
						onSave: () => commitVariant(variantDraft, dish, onChange, setVariantDraft, true)
					}, variant.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-semibold",
									children: variant.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted",
									children: [
										formatMenuMoney(variant.price, currency),
										" · ",
										statuses.find((status) => status.id === variant.status)?.label
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
								label: "ویرایش",
								onClick: () => setVariantDraft(variant),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
								label: "حذف",
								onClick: () => onChange({
									...dish,
									variants: dish.variants.filter((item) => item.id !== variant.id)
								}),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})
						]
					}, variant.id)),
					variantDraft && !dish.variants.some((item) => item.id === variantDraft.id) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VariantForm, {
						draft: variantDraft,
						unit,
						onChange: setVariantDraft,
						onSave: () => commitVariant(variantDraft, dish, onChange, setVariantDraft, false)
					}) : null,
					!variantDraft ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setVariantDraft({
							id: crypto.randomUUID(),
							title: "",
							price: 0,
							status: "available"
						}),
						className: "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "افزودن گزینه / تنوع قیمت"]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryField, {
				categories,
				selected: dish.categoryId,
				onSelect: (categoryId) => onChange({
					...dish,
					categoryId
				}),
				onAdd: onOpenCategories
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: mode !== "menu" ? "grid gap-3 sm:grid-cols-2" : "",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "وضعیت",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
						value: dish.status,
						options: statuses.map((status) => ({
							value: status.id,
							label: status.label
						})),
						onChange: (event) => onChange({
							...dish,
							status: event.target.value
						})
					})
				}), mode !== "menu" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnitField, {
					units,
					value: dish.unit,
					onChange: (unit) => onChange({
						...dish,
						unit
					}),
					onUnits
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LabelField, {
				labels: dish.labels,
				onChange: (labels) => onChange({
					...dish,
					labels
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-line bg-paper",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"aria-expanded": detailsOpen,
					onClick: () => setDetailsOpen((open) => !open),
					className: "flex w-full items-center justify-between px-3 py-3 text-start",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold",
						children: copy.details
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `size-4 transition ${detailsOpen ? "rotate-180" : ""}` })]
				}), detailsOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 border-t border-line px-3 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "لینک محصول",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								dir: "ltr",
								className: "text-left",
								inputMode: "url",
								value: dish.link,
								placeholder: "https://",
								onChange: (event) => onChange({
									...dish,
									link: event.target.value
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "-mt-1 text-xs leading-5 text-muted",
							children: "در صورت وارد کردن لینک، کاربر با کلیک روی کارت محصول وارد لینک فروشگاه شما می‌شود."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "نوع قیمت",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2",
								children: priceTypes.map((type) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => onChange({
										...dish,
										priceType: type.id
									}),
									className: `min-h-10 rounded-full px-3 text-sm ${dish.priceType === type.id ? "bg-ink text-on-ink" : "border border-line bg-card"}`,
									children: type.label
								}, type.id))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "کد کالا",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								dir: "ltr",
								className: "text-left",
								value: dish.sku,
								maxLength: 40,
								onChange: (event) => onChange({
									...dish,
									sku: event.target.value
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-semibold",
								children: "پیشنهاد ویژه"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs leading-5 text-muted",
								children: copy.featured
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								checked: dish.featured,
								label: "پیشنهاد ویژه",
								onCheckedChange: (featured) => onChange({
									...dish,
									featured
								})
							})]
						})
					]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-end gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					className: "inline-flex h-11 items-center rounded-full border border-line bg-card px-4 text-sm font-semibold",
					children: "انصراف"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onSave,
					className: "inline-flex h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-on-ink",
					children: "ذخیره"
				})]
			})
		]
	});
	return desktop ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlainWindow, {
		title: copy.window,
		onClose,
		children: body
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlainSheet, {
		title: copy.window,
		onClose,
		children: body
	});
}
function commitVariant(draft, dish, onChange, setDraft, replace) {
	if (!draft.title.trim()) {
		toast.error("عنوان گزینه را وارد کنید");
		return;
	}
	onChange({
		...dish,
		variants: replace ? dish.variants.map((item) => item.id === draft.id ? draft : item) : [...dish.variants, draft]
	});
	setDraft(null);
}
function PhotoField({ fileRef, image, label, onImage }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
		label,
		hint: "دلخواه",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			ref: fileRef,
			type: "file",
			accept: "image/*",
			className: "sr-only",
			onChange: (event) => {
				const file = event.target.files?.[0];
				event.target.value = "";
				if (!file) return;
				fitImage(file, 640, 9e4).then(onImage).catch(() => toast.error("این تصویر باز نشد"));
			}
		}), image ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative overflow-hidden rounded-xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: image,
				alt: "",
				className: "h-40 w-full object-cover"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/70 px-3 py-2 text-sm font-semibold text-white",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => fileRef.current?.click(),
					className: "inline-flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "size-4" }), "ویرایش"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onImage(""),
					className: "inline-flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), "حذف"]
				})]
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => fileRef.current?.click(),
			className: "inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-semibold",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "size-4" }), "انتخاب عکس"]
		})]
	});
}
function VariantForm({ draft, unit, onChange, onSave }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-2 rounded-xl border border-line bg-card p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "عنوان گزینه",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					value: draft.title,
					maxLength: 40,
					placeholder: "مثلاً تک‌نفره",
					onChange: (event) => onChange({
						...draft,
						title: event.target.value
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: `قیمت (${unit})`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					type: "number",
					min: 0,
					value: draft.price ? String(draft.price) : "",
					onChange: (event) => onChange({
						...draft,
						price: money(event.target.value)
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "وضعیت گزینه",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
					value: draft.status,
					options: statuses.map((status) => ({
						value: status.id,
						label: status.label
					})),
					onChange: (event) => onChange({
						...draft,
						status: event.target.value
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onSave,
					className: "inline-flex h-11 items-center rounded-full bg-ink px-4 text-sm font-semibold text-on-ink",
					children: "ذخیره"
				})
			})
		]
	});
}
function UnitField({ units, value, onChange, onUnits }) {
	const [fresh, setFresh] = (0, import_react.useState)("");
	const [editing, setEditing] = (0, import_react.useState)("");
	const [draft, setDraft] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
		label: "واحد اندازه‌گیری",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
				value,
				placeholder: "انتخاب واحد",
				options: units.map((unit) => ({
					value: unit,
					label: unit
				})),
				onChange: (event) => onChange(event.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 grid max-h-40 gap-1 overflow-y-auto",
				children: units.map((unit) => editing === unit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						value: draft,
						maxLength: 24,
						onChange: (event) => setDraft(event.target.value)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							const next = draft.trim();
							if (!next || next === unit || units.includes(next)) return;
							onUnits(units.map((item) => item === unit ? next : item), {
								from: unit,
								to: next
							});
							setEditing("");
						},
						className: "inline-flex h-11 shrink-0 items-center rounded-full bg-ink px-4 text-sm font-semibold text-on-ink",
						children: "ذخیره"
					})]
				}, unit) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 flex-1 truncate text-sm font-semibold",
							children: unit
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
							label: "ویرایش",
							onClick: () => {
								setEditing(unit);
								setDraft(unit);
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
							label: "حذف",
							onClick: () => onUnits(units.filter((item) => item !== unit)),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						})
					]
				}, unit))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					value: fresh,
					maxLength: 24,
					placeholder: "واحد جدید",
					onChange: (event) => setFresh(event.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						const next = fresh.trim();
						if (!next || units.includes(next)) return;
						onUnits([...units, next]);
						if (!value) onChange(next);
						setFresh("");
					},
					className: "inline-flex h-11 shrink-0 items-center rounded-full border border-line bg-card px-4 text-sm font-semibold",
					children: "افزودن"
				})]
			})
		]
	});
}
function LabelField({ labels, onChange }) {
	const [fresh, setFresh] = (0, import_react.useState)("");
	const [editing, setEditing] = (0, import_react.useState)("");
	const [draft, setDraft] = (0, import_react.useState)("");
	const options = presetLabels.map((label) => ({
		value: label,
		label
	}));
	function pick(value) {
		if (!value) return;
		if (labels.includes(value)) {
			if (!presetLabels.includes(value)) return;
			onChange(labels.filter((item) => item !== value));
			return;
		}
		onChange([...labels, value].slice(0, 6));
	}
	function addCustom() {
		const next = fresh.trim();
		if (!next || labels.includes(next) || presetLabels.includes(next)) return;
		onChange([...labels, next].slice(0, 6));
		setFresh("");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
		label: "لیبل",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
				value: "",
				options,
				placeholder: "انتخاب لیبل",
				onChange: (event) => pick(event.target.value)
			}),
			labels.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 grid gap-1",
				children: labels.map((label) => {
					const preset = presetLabels.includes(label);
					if (!preset && editing === label) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							value: draft,
							maxLength: 24,
							onChange: (event) => setDraft(event.target.value)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								const next = draft.trim();
								if (!next || next === label || labels.includes(next) || presetLabels.includes(next)) return;
								onChange(labels.map((item) => item === label ? next : item));
								setEditing("");
							},
							className: "inline-flex h-11 shrink-0 items-center rounded-full bg-ink px-4 text-sm font-semibold text-on-ink",
							children: "ذخیره"
						})]
					}, label);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 flex-1 truncate text-sm font-semibold",
							children: label
						}), preset ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
							label: "ویرایش",
							onClick: () => {
								setEditing(label);
								setDraft(label);
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconButton, {
							label: "حذف",
							onClick: () => onChange(labels.filter((item) => item !== label)),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						})] })]
					}, label);
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					value: fresh,
					maxLength: 24,
					placeholder: "لیبل جدید",
					onChange: (event) => setFresh(event.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: addCustom,
					className: "inline-flex h-11 shrink-0 items-center rounded-full border border-line bg-card px-4 text-sm font-semibold",
					children: "افزودن"
				})]
			})
		]
	});
}
function CategoryField({ categories, selected, onSelect, onAdd }) {
	const titles = categories.map((item) => item.title).filter((title) => Boolean(title));
	const current = categories.find((item) => item.id === selected)?.title ?? "";
	if (categories.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
		label: "دسته‌بندی",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: onAdd,
			className: "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-line bg-card px-3 text-sm font-semibold",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "افزودن دسته‌بندی"]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
		label: "دسته‌بندی",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Combobox, {
			strict: true,
			options: titles,
			value: current,
			placeholder: "انتخاب دسته‌بندی",
			emptyText: "دسته‌بندی با این نام نیست",
			onChange: (title) => onSelect(categories.find((item) => item.title === title)?.id ?? "")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: onAdd,
			className: "mt-2 text-start text-sm font-semibold text-jade",
			children: "افزودن دسته‌بندی"
		})]
	});
}
function useDesktop() {
	const [desktop, setDesktop] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const query = window.matchMedia("(min-width: 1024px)");
		const sync = () => setDesktop(query.matches);
		sync();
		query.addEventListener("change", sync);
		return () => query.removeEventListener("change", sync);
	}, []);
	return desktop;
}
function PlainWindow({ title, onClose, children }) {
	const titleId = (0, import_react.useId)();
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			if (event.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [onClose]);
	return (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-[70] flex items-center justify-center p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute inset-0 bg-black/60",
			"aria-label": "بستن",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": titleId,
			className: "relative z-10 grid max-h-[85dvh] w-full max-w-md gap-4 overflow-y-auto rounded-[1.375rem] border border-line bg-card p-5 text-ink shadow-xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: titleId,
					className: "font-semibold",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "بستن",
					onClick: onClose,
					className: "grid size-9 place-items-center rounded-full hover:bg-paper",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
				})]
			}), children]
		})]
	}), document.body);
}
function PlainSheet({ title, onClose, children }) {
	const titleId = (0, import_react.useId)();
	return (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-[70]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute inset-0 bg-black/40",
			"aria-label": "بستن",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": titleId,
			className: "absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-2xl border border-line bg-card",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: titleId,
					className: "font-bold",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "بستن",
					onClick: onClose,
					className: "grid size-9 place-items-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1 overflow-y-auto px-4 pb-6",
				children
			})]
		})]
	}), document.body);
}
function MenuScreen({ slug, page }) {
	const [block, setBlock] = (0, import_react.useState)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [ordering, setOrdering] = (0, import_react.useState)(false);
	const [picking, setPicking] = (0, import_react.useState)(null);
	const [cart, setCart] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		let live = true;
		publicBusinessFn({ data: { slug } }).then((res) => {
			if (!live) return;
			if (!res.ok) {
				setError(res.error);
				setReady(true);
				return;
			}
			setName(res.data?.name ?? "");
			const blocks = Array.isArray(res.data?.pageBlocks) ? res.data.pageBlocks : [];
			const path = decodeURIComponent(page);
			setBlock(blocks.find((item) => (item.type === "menu" || item.type === "products" || item.type === "services") && item.active !== false && (item.url?.trim() || catalogFallback(item.type)) === path) ?? null);
			setReady(true);
		});
		return () => {
			live = false;
		};
	}, [slug, page]);
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64" }) });
	if (error || !block) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
		title: words.menu.missing,
		body: error || words.menu.missingBody
	}) });
	const copy = words[block.type === "products" || block.type === "services" ? block.type : "menu"];
	const currency = block.currency || "toman";
	const layout = block.layout === "grid" || block.layout === "card" ? block.layout : "list";
	const categories = (block.items ?? []).filter((item) => item.kind === "category");
	const dishes = (block.items ?? []).filter((item) => item.kind === "item" && item.status !== "hidden");
	const groups = categories.map((category) => ({
		category,
		items: dishes.filter((item) => item.categoryId === category.id)
	})).filter((group) => group.items.length > 0);
	const loose = dishes.filter((item) => !item.categoryId || !categories.some((category) => category.id === item.categoryId));
	const Mark = pageIcon(block.icon) ?? catalogMark(block.type === "products" || block.type === "services" ? block.type : "menu");
	const count = cart.reduce((sum, line) => sum + line.qty, 0);
	const total = cart.reduce((sum, line) => sum + linePrice(line.item, line.variantId) * line.qty, 0);
	function changeLine(item, variantId, delta) {
		const key = `${item.id}:${variantId}`;
		if (delta > 0 && !cart.some((line) => line.key === key)) toast.success("به سبد اضافه شد");
		setCart((prev) => {
			const found = prev.find((line) => line.key === key);
			if (!found) {
				if (delta < 1) return prev;
				return [...prev, {
					key,
					item,
					variantId,
					qty: 1
				}];
			}
			const qty = found.qty + delta;
			if (qty < 1) return prev.filter((line) => line.key !== key);
			return prev.map((line) => line.key === key ? {
				...line,
				qty: Math.min(20, qty)
			} : line);
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: "size-8 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "truncate text-2xl font-extrabold",
						children: block.title?.trim() || copy.screen
					}), block.body?.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: block.body
					}) : null]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/b/$slug",
				params: { slug },
				className: "text-sm font-semibold text-jade",
				children: "بازگشت"
			})]
		}),
		loose.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItems, {
			items: loose,
			layout,
			currency,
			cart,
			onOpen: (item) => setPicking(item),
			onChange: changeLine
		}) : null,
		groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-2 font-bold",
				children: group.category.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuItems, {
				items: group.items,
				layout,
				currency,
				cart,
				onOpen: (item) => setPicking(item),
				onChange: changeLine
			})]
		}, group.category.id)),
		dishes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "هنوز موردی در منو نیست."
		}) : null,
		name ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-8 text-center text-xs text-muted",
			children: name
		}) : null,
		count > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => setOrdering(true),
			className: "sticky bottom-4 mt-6 flex w-full items-center justify-between rounded-full bg-ink px-5 py-3 text-sm font-semibold text-on-ink",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "size-4" }),
					"سبد خرید · ",
					faNum(count)
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatMenuMoney(total, currency) })]
		}) : null,
		picking ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PickSheet, {
			item: picking,
			currency,
			cart,
			onClose: () => setPicking(null),
			onChange: changeLine
		}) : null,
		ordering ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartSheet, {
			slug,
			cart,
			currency,
			onClose: () => setOrdering(false),
			onChange: setCart,
			onDone: () => {
				setCart([]);
				setOrdering(false);
			}
		}) : null
	] });
}
function MenuItems({ items, layout, currency, cart, onOpen, onChange }) {
	if (layout === "grid") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-3",
		children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			className: "overflow-hidden rounded-xl border border-line bg-card",
			children: [item.link && item.status !== "unavailable" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: item.link,
				target: "_blank",
				rel: "noreferrer",
				children: item.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: item.image,
					alt: "",
					className: "aspect-square w-full object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid aspect-square w-full place-items-center bg-paper text-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UtensilsCrossed, { className: "size-8" })
				})
			}) : item.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: item.image,
				alt: "",
				className: "aspect-square w-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid aspect-square w-full place-items-center bg-paper text-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UtensilsCrossed, { className: "size-8" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate font-semibold",
						children: item.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: priceWithUnit(item, currency)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemQty, {
						item,
						cart,
						onOpen,
						onChange
					})
				]
			})]
		}, item.id))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-2",
		children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			className: `flex items-center gap-3 ${layout === "card" ? "rounded-xl border border-line bg-card px-3 py-3" : "py-2"}`,
			children: [
				item.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: item.image,
					alt: "",
					className: "size-14 shrink-0 rounded-lg object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-14 shrink-0 place-items-center rounded-lg bg-paper text-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UtensilsCrossed, { className: "size-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-semibold",
							children: item.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: priceWithUnit(item, currency)
						}),
						orderVariants(item).length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemQty, {
								item,
								cart,
								onOpen,
								onChange
							})
						}) : null
					]
				}),
				orderVariants(item).length > 0 ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemQty, {
					item,
					cart,
					onOpen,
					onChange
				})
			]
		}, item.id))
	});
}
function ItemQty({ item, cart, onOpen, onChange }) {
	const variants = orderVariants(item);
	if (!canOrder(item)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-flex h-10 items-center rounded-full bg-paper px-3 text-xs font-semibold text-muted",
		children: "ناموجود"
	});
	if (variants.length === 0) {
		const qty = cart.find((line) => line.item.id === item.id && !line.variantId)?.qty ?? 0;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QtyControl, {
			qty,
			enabled: canOrder(item),
			onAdd: () => onChange(item, "", 1),
			onMore: () => onChange(item, "", 1),
			onLess: () => onChange(item, "", -1)
		});
	}
	const lines = cart.filter((line) => line.item.id === item.id && line.variantId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-1.5",
		children: [lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 truncate text-xs font-semibold",
				children: line.item.variants?.find((variant) => variant.id === line.variantId)?.title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QtyControl, {
				qty: line.qty,
				enabled: true,
				onAdd: () => onChange(item, line.variantId, 1),
				onMore: () => onChange(item, line.variantId, 1),
				onLess: () => onChange(item, line.variantId, -1)
			})]
		}, line.key)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => onOpen(item),
			className: "inline-flex h-10 items-center justify-center gap-1 rounded-full border border-line bg-card px-3 text-xs font-semibold",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), lines.length ? "گزینه دیگر" : "انتخاب گزینه"]
		})]
	});
}
function QtyControl({ qty, enabled, onAdd, onMore, onLess }) {
	if (!enabled) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-flex h-10 items-center rounded-full bg-paper px-3 text-xs font-semibold text-muted",
		children: "ناموجود"
	});
	if (qty < 1) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": "افزودن",
		onClick: onAdd,
		className: "grid size-10 place-items-center rounded-full bg-ink text-on-ink",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "inline-flex items-center gap-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": qty === 1 ? "حذف" : "کم کردن",
				onClick: onLess,
				className: "grid size-10 place-items-center rounded-full border border-line bg-card",
				children: qty === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "w-6 text-center text-sm font-semibold tabular-nums",
				children: faNum(qty)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": "بیشتر",
				onClick: onMore,
				className: "grid size-10 place-items-center rounded-full bg-ink text-on-ink",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
			})
		]
	});
}
function canOrder(item) {
	if (item.status === "unavailable" || item.status === "hidden") return false;
	const variants = (item.variants ?? []).filter((variant) => variant.status !== "hidden");
	if (variants.length === 0) return true;
	return variants.some((variant) => variant.status !== "unavailable");
}
function orderVariants(item) {
	return (item.variants ?? []).filter((variant) => variant.status !== "hidden" && variant.status !== "unavailable");
}
function linePrice(item, variantId) {
	const variant = item.variants?.find((row) => row.id === variantId);
	if (variant) return variant.price;
	if (item.priceType === "free") return 0;
	return item.price ?? 0;
}
function lineLabel(line) {
	const variant = line.item.variants?.find((row) => row.id === line.variantId);
	return variant ? `${line.item.title}، ${variant.title}` : line.item.title || "آیتم";
}
function todayYmd() {
	const date = /* @__PURE__ */ new Date();
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
var orderTimes = Array.from({ length: 29 }, (_, index) => {
	const total = 480 + index * 30;
	return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
});
function PickSheet({ item, currency, cart, onClose, onChange }) {
	const desktop = useDesktop();
	const variants = orderVariants(item);
	const body = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-2",
		children: variants.map((variant) => {
			const qty = cart.find((line) => line.key === `${item.id}:${variant.id}`)?.qty ?? 0;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3 rounded-xl border border-line bg-paper px-3 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm font-semibold",
						children: variant.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: formatMenuMoney(variant.price, currency)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QtyControl, {
					qty,
					enabled: true,
					onAdd: () => onChange(item, variant.id, 1),
					onMore: () => onChange(item, variant.id, 1),
					onLess: () => onChange(item, variant.id, -1)
				})]
			}, variant.id);
		})
	});
	return desktop ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlainWindow, {
		title: item.title || "گزینه",
		onClose,
		children: body
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlainSheet, {
		title: item.title || "گزینه",
		onClose,
		children: body
	});
}
function CartSheet({ slug, cart, currency, onClose, onChange, onDone }) {
	const desktop = useDesktop();
	const [step, setStep] = (0, import_react.useState)("cart");
	const [customer, setCustomer] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [address, setAddress] = (0, import_react.useState)("");
	const [when, setWhen] = (0, import_react.useState)("now");
	const [day, setDay] = (0, import_react.useState)(todayYmd);
	const [time, setTime] = (0, import_react.useState)("12:00");
	const [note, setNote] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const total = cart.reduce((sum, line) => sum + linePrice(line.item, line.variantId) * line.qty, 0);
	function setQty(key, qty) {
		if (qty < 1) onChange(cart.filter((line) => line.key !== key));
		else onChange(cart.map((line) => line.key === key ? {
			...line,
			qty: Math.min(20, qty)
		} : line));
	}
	async function submit() {
		if (cart.length === 0) {
			toast.error("سبد خالی است");
			return;
		}
		if (customer.trim().length < 2) {
			toast.error("نام و نام خانوادگی را وارد کنید");
			return;
		}
		if (address.trim().length < 5) {
			toast.error("آدرس را کامل‌تر بنویسید");
			return;
		}
		setBusy(true);
		const res = await placeMenuOrderFn({ data: {
			slug,
			name: customer,
			phone,
			email,
			address,
			when,
			date: day,
			time,
			note,
			lines: cart.map((line) => ({
				itemId: line.item.id,
				variantId: line.variantId,
				qty: line.qty
			}))
		} });
		setBusy(false);
		if (!res.ok) {
			toast.error(res.error);
			return;
		}
		setStep("done");
	}
	const body = step === "done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-lg font-extrabold",
				children: "سفارش ثبت شد"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-7 text-muted",
				children: "سفارش را گرفتیم و به آدرسی که نوشتی می‌فرستیم. برای هماهنگی با همین شماره تماس می‌گیریم."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onDone,
				className: "inline-flex h-11 items-center justify-center rounded-full bg-ink px-4 text-sm font-semibold text-on-ink",
				children: "باشه"
			})
		]
	}) : step === "cart" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3",
		children: [
			cart.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "سبد خالی است."
			}) : null,
			cart.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 rounded-xl border border-line bg-card p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-semibold",
							children: lineLabel(line)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: formatMenuMoney(linePrice(line.item, line.variantId) * line.qty, currency)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": line.qty === 1 ? "حذف" : "کم کردن",
								onClick: () => setQty(line.key, line.qty - 1),
								className: "grid size-8 place-items-center rounded-full border border-line",
								children: line.qty === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }) : "−"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-6 text-center text-sm tabular-nums",
								children: faNum(line.qty)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "زیاد کردن",
								onClick: () => setQty(line.key, line.qty + 1),
								className: "grid size-8 place-items-center rounded-full border border-line",
								children: "+"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "حذف",
						onClick: () => setQty(line.key, 0),
						className: "grid size-8 place-items-center text-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
					})
				]
			}, line.key)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm font-semibold",
				children: ["جمع: ", formatMenuMoney(total, currency)]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: cart.length === 0,
				onClick: () => setStep("form"),
				className: "inline-flex h-11 items-center justify-center rounded-full bg-ink px-4 text-sm font-semibold text-on-ink disabled:opacity-50",
				children: "ادامه و ثبت سفارش"
			})
		]
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					faNum(cart.reduce((sum, line) => sum + line.qty, 0)),
					" کالا · ",
					formatMenuMoney(total, currency)
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "نام و نام خانوادگی",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					value: customer,
					maxLength: 80,
					onChange: (event) => setCustomer(event.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "شماره موبایل",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					dir: "ltr",
					className: "text-left",
					inputMode: "tel",
					value: phone,
					maxLength: 14,
					placeholder: "09123456789",
					onChange: (event) => setPhone(event.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "ایمیل",
				hint: "اختیاری",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					dir: "ltr",
					className: "text-left",
					inputMode: "email",
					value: email,
					maxLength: 80,
					onChange: (event) => setEmail(event.target.value)
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "آدرس",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
					value: address,
					maxLength: 200,
					className: "min-h-16",
					placeholder: "خیابان، کوچه، پلاک",
					onChange: (event) => setAddress(event.target.value.slice(0, 200))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "-mt-1 text-xs leading-5 text-muted",
				children: "سفارش به این نشانی ارسال می‌شود."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "زمان تحویل",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setWhen("now"),
						className: `rounded-xl border px-3 py-3 text-start ${when === "now" ? "border-ink bg-ink text-on-ink" : "border-line bg-card"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm font-semibold",
							children: "هرچه زودتر"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `mt-0.5 block text-xs ${when === "now" ? "text-on-ink/80" : "text-muted"}`,
							children: "همین حالا آماده و ارسال شود"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setWhen("later"),
						className: `rounded-xl border px-3 py-3 text-start ${when === "later" ? "border-ink bg-ink text-on-ink" : "border-line bg-card"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm font-semibold",
							children: "زمان دلخواه"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `mt-0.5 block text-xs ${when === "later" ? "text-on-ink/80" : "text-muted"}`,
							children: "تاریخ و ساعت را خودت مشخص کن"
						})]
					})]
				})
			}),
			when === "later" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(JalaliCalendar, {
				value: day,
				min: todayYmd(),
				onChange: setDay
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "ساعت",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: orderTimes.map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setTime(slot),
						className: `min-h-10 rounded-full px-3 text-sm tabular-nums ${time === slot ? "bg-ink text-on-ink" : "border border-line bg-card"}`,
						children: faNum(slot)
					}, slot))
				})
			})] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "یادداشت",
				hint: "اختیاری",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
					value: note,
					maxLength: 300,
					className: "min-h-16",
					onChange: (event) => setNote(event.target.value.slice(0, 300))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-end gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setStep("cart"),
					className: "inline-flex h-11 items-center rounded-full border border-line bg-card px-4 text-sm font-semibold",
					children: "سبد"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: busy,
					onClick: () => void submit(),
					className: "inline-flex h-11 items-center justify-center rounded-full bg-ink px-4 text-sm font-semibold text-on-ink disabled:opacity-50",
					children: busy ? "در حال ثبت" : "ثبت سفارش"
				})]
			})
		]
	});
	return desktop ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlainWindow, {
		title: step === "form" ? "ثبت سفارش" : "سبد خرید",
		onClose: step === "done" ? onDone : onClose,
		children: body
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlainSheet, {
		title: step === "form" ? "ثبت سفارش" : "سبد خرید",
		onClose: step === "done" ? onDone : onClose,
		children: body
	});
}
//#endregion
export { fitImage as i, MenuScreen as n, Switch as r, MenuFields as t };
