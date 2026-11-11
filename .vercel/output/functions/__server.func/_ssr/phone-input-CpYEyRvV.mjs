import { i as __toESM } from "../_runtime.mjs";
import { X as require_jsx_runtime, Z as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { g as enDigits, h as cn, v as faNum } from "./ui-CYEMVOYZ.mjs";
import { Rt as Check } from "../_libs/lucide-react.mjs";
import { f as formatIranMobile, h as normalizeIranMobile, m as mobileOperator, p as isIranMobile } from "./router-DEaekAna.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/phone-input-CpYEyRvV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function OtpField({ length = 6, value, defaultValue = "", onChange, onComplete, disabled, size = "md", className, "aria-label": ariaLabel = "کد تأیید" }) {
	const [internal, setInternal] = (0, import_react.useState)(defaultValue);
	const code = value ?? internal;
	const refs = (0, import_react.useRef)([]);
	function commit(next) {
		const clean = enDigits(next).replace(/\D/g, "").slice(0, length);
		if (value === void 0) setInternal(clean);
		onChange?.(clean);
		if (clean.length === length) onComplete?.(clean);
		refs.current[Math.min(clean.length, length - 1)]?.focus();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("inline-flex", size === "sm" ? "gap-1" : "gap-1.5", className),
		dir: "ltr",
		role: "group",
		"aria-label": ariaLabel,
		children: Array.from({ length }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			ref: (el) => {
				refs.current[index] = el;
			},
			inputMode: "numeric",
			autoComplete: index === 0 ? "one-time-code" : "off",
			disabled,
			value: code[index] ? faNum(code[index]) : "",
			onChange: (e) => {
				const typed = enDigits(e.target.value).replace(/\D/g, "");
				if (typed.length > 1) {
					commit(code.slice(0, index) + typed);
					return;
				}
				commit(code.slice(0, index) + typed + code.slice(index + 1));
			},
			onKeyDown: (e) => {
				if (e.key === "Backspace" && !code[index] && index > 0) {
					e.preventDefault();
					commit(code.slice(0, index - 1));
				}
				if (e.key === "ArrowLeft") refs.current[index - 1]?.focus();
				if (e.key === "ArrowRight") refs.current[index + 1]?.focus();
			},
			onFocus: (e) => e.target.select(),
			className: cn("shrink-0 rounded-lg border border-line bg-card text-center font-semibold text-ink caret-transparent", "focus:border-jade focus:outline-none focus:ring-2 focus:ring-jade/20", "disabled:opacity-50", size === "sm" ? "h-10 w-8 text-sm" : "h-11 w-9 text-base")
		}, index))
	});
}
function PhoneInput({ value, onChange, className, id, autoFocus }) {
	const [internal, setInternal] = (0, import_react.useState)("");
	const digits = normalizeIranMobile(value ?? internal);
	const valid = isIranMobile(digits);
	const operator = mobileOperator(digits);
	function set(next) {
		const normalized = normalizeIranMobile(next);
		if (value === void 0) setInternal(normalized);
		onChange?.(normalized, isIranMobile(normalized));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("grid gap-1.5", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("flex min-h-11 items-center gap-2 rounded-xl border bg-card px-3 focus-within:border-jade", digits.length === 10 && !valid ? "border-danger" : "border-line"),
			dir: "ltr",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-muted",
					children: faNum("+98")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id,
					type: "tel",
					inputMode: "tel",
					autoComplete: "tel-national",
					autoFocus,
					value: faNum(formatIranMobile(digits)),
					onChange: (e) => set(e.target.value),
					placeholder: faNum("912 345 6789"),
					"aria-invalid": digits.length === 10 && !valid ? true : void 0,
					className: "h-full min-w-0 flex-1 bg-transparent text-sm tabular-nums outline-none placeholder:text-muted/50"
				}),
				valid ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
					className: "size-4 shrink-0 text-jade",
					"aria-hidden": "true"
				}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] leading-5 text-muted",
			children: operator ? `اپراتور: ${operator}` : digits.length === 10 && !valid ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-danger",
				children: "شماره باید با ۹ شروع شود و ۱۰ رقم باشد"
			}) : "بدون صفر اول هم می‌توانید وارد کنید"
		})]
	});
}
//#endregion
export { PhoneInput as n, OtpField as t };
