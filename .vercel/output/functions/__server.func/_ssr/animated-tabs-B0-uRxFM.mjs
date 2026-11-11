import { X as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { h as cn } from "./ui-CYEMVOYZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/animated-tabs-B0-uRxFM.js
var import_jsx_runtime = require_jsx_runtime();
function AnimatedTabs({ items, value, onChange, className }) {
	const count = Math.max(items.length, 1);
	const index = Math.min(Math.max(value, 0), count - 1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "tablist",
		className: cn("relative flex w-max min-w-full rounded-lg border border-line bg-paper p-1", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": "true",
			className: "absolute inset-y-1 rounded-md bg-ink transition-[inset-inline-start] duration-300 ease-out",
			style: {
				width: `calc((100% - 0.5rem) / ${count})`,
				insetInlineStart: `calc(0.25rem + ${index} * (100% - 0.5rem) / ${count})`
			}
		}), items.map((item, itemIndex) => {
			const active = index === itemIndex;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				role: "tab",
				"aria-selected": active,
				onClick: () => onChange(itemIndex),
				className: "relative z-10 flex min-w-20 flex-1 cursor-pointer flex-col items-center px-1 py-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("whitespace-nowrap text-sm leading-5 transition-colors duration-300", active ? "font-semibold text-on-ink" : "text-ink"),
					children: item.label
				}), item.hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("whitespace-nowrap text-xs leading-4 transition-colors duration-300", active ? "text-on-ink/80" : "text-muted"),
					children: item.hint
				}) : null]
			}, `${item.label}-${item.hint ?? itemIndex}`);
		})]
	});
}
//#endregion
export { AnimatedTabs as t };
