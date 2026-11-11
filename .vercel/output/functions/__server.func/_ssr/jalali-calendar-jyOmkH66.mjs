import { i as __toESM } from "../_runtime.mjs";
import { X as require_jsx_runtime, Z as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { h as cn, p as WEEKDAYS_FA, v as faNum } from "./ui-CYEMVOYZ.mjs";
import { Ft as ChevronRight, It as ChevronLeft } from "../_libs/lucide-react.mjs";
import { a as jalaliToGregorian, c as ymd, i as jalaliMonthName, o as monthLength, r as gregorianToJalali } from "./time-BneIW53_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/jalali-calendar-jyOmkH66.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var COLS = [
	"ش",
	"ی",
	"د",
	"س",
	"چ",
	"پ",
	"ج"
];
function shiftMonth(jy, jm, delta) {
	const index = jy * 12 + (jm - 1) + delta;
	return {
		jy: Math.floor(index / 12),
		jm: index % 12 + 1
	};
}
function JalaliCalendar({ value, onChange, min, max }) {
	const selected = (0, import_react.useMemo)(() => {
		const [y, m, d] = value.split("-").map(Number);
		return gregorianToJalali(y, m, d);
	}, [value]);
	const [cursor, setCursor] = (0, import_react.useState)({
		jy: selected.jy,
		jm: selected.jm
	});
	const length = monthLength(cursor.jy, cursor.jm);
	const first = jalaliToGregorian(cursor.jy, cursor.jm, 1);
	const offset = (new Date(Date.UTC(first.gy, first.gm - 1, first.gd)).getUTCDay() + 1) % 7;
	const cells = [...Array.from({ length: offset }, () => null), ...Array.from({ length }, (_, i) => {
		const g = jalaliToGregorian(cursor.jy, cursor.jm, i + 1);
		return {
			day: i + 1,
			ymd: ymd(g.gy, g.gm, g.gd)
		};
	})];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-card border border-line bg-card p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-center justify-between",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "grid size-11 place-items-center rounded-xl hover:bg-paper",
						onClick: () => setCursor(shiftMonth(cursor.jy, cursor.jm, -1)),
						"aria-label": "ماه قبل",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "font-semibold",
						children: [
							jalaliMonthName(cursor.jm),
							" ",
							faNum(cursor.jy)
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "grid size-11 place-items-center rounded-xl hover:bg-paper",
						onClick: () => setCursor(shiftMonth(cursor.jy, cursor.jm, 1)),
						"aria-label": "ماه بعد",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-7 gap-1 text-center text-xs text-muted",
				children: [COLS.map((col) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "py-1",
					children: col
				}, col)), cells.map((cell, index) => {
					if (!cell) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {}, `e-${index}`);
					const disabled = min && cell.ymd < min || max && cell.ymd > max;
					const active = cell.ymd === value;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: Boolean(disabled),
						onClick: () => onChange(cell.ymd),
						className: cn("min-h-11 rounded-lg text-sm tabular-nums disabled:text-muted/40", active ? "bg-jade font-semibold text-on-jade" : "hover:bg-paper"),
						children: faNum(cell.day)
					}, cell.ymd);
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-center text-xs text-muted",
				children: WEEKDAYS_FA[(/* @__PURE__ */ new Date(`${value}T12:00:00Z`)).getUTCDay()]
			})
		]
	});
}
//#endregion
export { JalaliCalendar as t };
