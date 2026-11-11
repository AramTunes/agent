import { X as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sparkline-BNoHwVfd.js
var import_jsx_runtime = require_jsx_runtime();
function curve(values, width, height) {
	const max = Math.max(1, ...values);
	Math.max(values.length, 2);
	const pts = values.map((value, index) => ({
		x: values.length === 1 ? width / 2 : index / (values.length - 1) * width,
		y: height - 2 - value / max * (height - 6)
	}));
	if (pts.length === 0) return {
		line: "",
		area: ""
	};
	let line = `M ${pts[0].x} ${pts[0].y}`;
	for (let i = 0; i < pts.length - 1; i++) {
		const a = pts[i];
		const b = pts[i + 1];
		const mid = (a.x + b.x) / 2;
		line += ` C ${mid} ${a.y}, ${mid} ${b.y}, ${b.x} ${b.y}`;
	}
	const area = `${line} L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`;
	return {
		line,
		area
	};
}
function DualSpark({ primary, secondary, primaryColor, secondaryColor }) {
	const a = curve(primary, 300, 72);
	const b = curve(secondary, 300, 72);
	const id = `${primaryColor}-${secondaryColor}`.replace(/[^a-z0-9]/gi, "");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 300 72",
		className: "mt-2 h-16 w-full",
		preserveAspectRatio: "none",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: `${id}-a`,
				x1: "0",
				y1: "0",
				x2: "0",
				y2: "1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "0%",
					stopColor: primaryColor,
					stopOpacity: "0.45"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "100%",
					stopColor: primaryColor,
					stopOpacity: "0"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: `${id}-b`,
				x1: "0",
				y1: "0",
				x2: "0",
				y2: "1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "0%",
					stopColor: secondaryColor,
					stopOpacity: "0.35"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "100%",
					stopColor: secondaryColor,
					stopOpacity: "0"
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: b.area,
				fill: `url(#${id}-b)`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: a.area,
				fill: `url(#${id}-a)`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: b.line,
				fill: "none",
				stroke: secondaryColor,
				strokeWidth: "2",
				strokeLinejoin: "round",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: a.line,
				fill: "none",
				stroke: primaryColor,
				strokeWidth: "2",
				strokeLinejoin: "round",
				strokeLinecap: "round"
			})
		]
	});
}
//#endregion
export { DualSpark as t };
