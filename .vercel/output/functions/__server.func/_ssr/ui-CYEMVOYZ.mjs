import { X as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { Rt as Check } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cn-wIRwYFgh.js
var DIGITS = "۰۱۲۳۴۵۶۷۸۹";
var ARABIC = "٠١٢٣٤٥٦٧٨٩";
function enDigits(input) {
	return String(input).replace(/[۰-۹٠-٩]/g, (ch) => {
		const fa = DIGITS.indexOf(ch);
		if (fa >= 0) return String(fa);
		const ar = ARABIC.indexOf(ch);
		return ar >= 0 ? String(ar) : ch;
	});
}
function faNum(value) {
	return String(value).replace(/\d/g, (d) => DIGITS[Number(d)] ?? d);
}
function toman(amount) {
	return `${faNum(Math.max(0, Math.round(amount)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "٬"))} تومان`;
}
function minutesLabel(total) {
	const h = Math.floor(total / 60);
	const m = total % 60;
	if (h && m) return `${faNum(h)} ساعت و ${faNum(m)} دقیقه`;
	if (h) return `${faNum(h)} ساعت`;
	return `${faNum(m)} دقیقه`;
}
function clockLabel(mins) {
	const h = Math.floor(mins / 60);
	const m = mins % 60;
	return faNum(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
}
function faFileSize(bytes) {
	const size = Math.max(0, Math.round(bytes));
	if (size < 1024) return `${faNum(size)} بایت`;
	if (size < 1048576) {
		const kb = size / 1024;
		return `${faNum(kb >= 10 ? kb.toFixed(0) : kb.toFixed(1))} کیلوبایت`;
	}
	const mb = size / 1048576;
	return `${faNum(mb >= 10 ? mb.toFixed(0) : mb.toFixed(1))} مگابایت`;
}
var WEEKDAYS_FA = [
	"یکشنبه",
	"دوشنبه",
	"سه‌شنبه",
	"چهارشنبه",
	"پنجشنبه",
	"جمعه",
	"شنبه"
];
var STATUS_FA = {
	pending: "در انتظار",
	confirmed: "تأییدشده",
	completed: "انجام‌شده",
	cancelled: "لغوشده",
	no_show: "عدم مراجعه"
};
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/ui-CYEMVOYZ.js
var import_jsx_runtime = require_jsx_runtime();
function Button({ variant = "primary", className, ...props }) {
	const styles = {
		primary: "bg-jade text-on-jade hover:bg-jade-deep",
		quiet: "bg-card text-ink border border-line hover:bg-paper",
		danger: "bg-danger-soft text-danger hover:bg-danger hover:text-on-ink",
		ink: "bg-ink text-on-ink hover:bg-jade-deep",
		signup: "bg-[var(--signup-bg)] text-[var(--signup-fg)] hover:opacity-90"
	}[variant];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		className: cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition disabled:opacity-50", styles, className),
		...props
	});
}
function Card({ className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: cn("rounded-card border border-line bg-card p-5 shadow-sm", className),
		children
	});
}
function Stepper({ steps, current, orientation = "horizontal", className }) {
	const horizontal = orientation === "horizontal";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
		className: cn(horizontal ? "relative flex w-full items-start justify-between pb-7" : "flex flex-col gap-5", className),
		"aria-label": "مراحل",
		children: [horizontal ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute start-3.5 end-3.5 top-3.5 flex",
			"aria-hidden": "true",
			children: steps.slice(0, -1).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-px flex-1", index < current ? "bg-jade" : "bg-line") }, index))
		}) : null, steps.map((step, index) => {
			const done = index < current;
			const active = index === current;
			const last = index === steps.length - 1;
			const circle = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold", done && "bg-jade text-on-jade", active && "border-2 border-jade bg-paper text-ink", !done && !active && "border border-line bg-paper text-muted"),
				children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
					className: "size-3.5",
					"aria-hidden": "true"
				}) : faNum(index + 1)
			});
			const text = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("text-xs leading-5", active ? "font-semibold text-ink" : done ? "text-ink" : "text-muted"),
				children: step.label
			}), step.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: step.description
			}) : null] });
			if (!horizontal) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "relative flex items-start gap-3",
				"aria-current": active ? "step" : void 0,
				children: [
					!last ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("absolute start-3.5 top-8 h-[calc(100%-0.5rem)] w-px", done ? "bg-jade" : "bg-line") }) : null,
					circle,
					text
				]
			}, index);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: cn("relative flex flex-col", index === 0 ? "items-start text-start" : last ? "items-end text-end" : "items-center text-center"),
				"aria-current": active ? "step" : void 0,
				children: [circle, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("absolute top-full mt-2 w-max max-w-16", index === 0 ? "start-0" : last ? "end-0" : "left-1/2 -translate-x-1/2"),
					children: text
				})]
			}, index);
		})]
	});
}
function Badge({ tone = "jade", children }) {
	const styles = {
		jade: "bg-jade-soft text-jade-deep",
		copper: "bg-copper-soft text-copper",
		muted: "bg-paper-deep text-muted",
		danger: "bg-danger-soft text-danger"
	}[tone];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", styles),
		children
	});
}
function Field({ label, hint, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "grid gap-1.5 text-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-medium",
				children: label
			}),
			children,
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-muted",
				children: hint
			}) : null
		]
	});
}
function TextInput({ value, onChange, type, inputMode, ...props }) {
	const numeric = type === "number";
	const controlled = value !== void 0 && value !== null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		...props,
		type: numeric ? "text" : type,
		inputMode: numeric ? "numeric" : inputMode,
		value: controlled ? faNum(String(value)) : value,
		onChange: (event) => {
			const english = enDigits(event.target.value);
			if (english !== event.target.value) event.target.value = english;
			onChange?.(event);
		},
		className: cn("min-h-11 w-full rounded-xl border border-line bg-card px-3 text-sm outline-none", props.className)
	});
}
function Area({ value, onChange, ...props }) {
	const controlled = value !== void 0 && value !== null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		...props,
		value: controlled ? faNum(String(value)) : value,
		onChange: (event) => {
			const english = enDigits(event.target.value);
			if (english !== event.target.value) event.target.value = english;
			onChange?.(event);
		},
		className: cn("min-h-24 w-full rounded-xl border border-line bg-card px-3 py-2 text-sm outline-none", props.className)
	});
}
function Select(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		...props,
		className: cn("min-h-11 w-full rounded-xl border border-line bg-card px-3 text-sm outline-none", props.className)
	});
}
function Empty({ title, body, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid justify-items-center gap-3 rounded-card border border-dashed border-line bg-card px-6 py-12 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm text-muted",
				children: body
			}),
			action
		]
	});
}
function Skeleton({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("animate-pulse rounded-xl bg-paper-deep", className) });
}
function ErrorNote({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger",
		children
	});
}
//#endregion
export { faFileSize as _, Empty as a, toman as b, Select as c, TextInput as d, STATUS_FA as f, enDigits as g, cn as h, Card as i, Skeleton as l, clockLabel as m, Badge as n, ErrorNote as o, WEEKDAYS_FA as p, Button as r, Field as s, Area as t, Stepper as u, faNum as v, minutesLabel as y };
