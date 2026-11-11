import { i as __toESM } from "../_runtime.mjs";
import { g as dashboardFn } from "./api-vBbERkBq.mjs";
import { X as require_jsx_runtime, Z as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as usePanel } from "./account-CxecnhcZ.mjs";
import { b as toman, i as Card, l as Skeleton, v as faNum } from "./ui-CYEMVOYZ.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as DualSpark } from "./sparkline-BNoHwVfd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports-Davamlq7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ReportsPage() {
	const { businessId } = usePanel();
	const [dash, setDash] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!businessId) return;
		dashboardFn({ data: { businessId } }).then((res) => {
			if (!res.ok) {
				toast.error(res.error);
				return;
			}
			setDash(res.data);
		});
	}, [businessId]);
	if (!dash) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40" });
	const total = Object.values(dash.byStatus).reduce((sum, n) => sum + n, 0);
	const stats = dash.stats ?? {
		views: 0,
		visitors: 0,
		booked: 0,
		cancelled: 0,
		completed: 0,
		sales: 0,
		revenueToman: 0
	};
	const series = dash.series ?? {
		views: [],
		visitors: [],
		sales: [],
		revenue: []
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-extrabold lg:hidden",
				children: "گزارشات"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-semibold",
					children: "بازدید و بازدیدکننده"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DualSpark, {
					primary: series.views,
					secondary: series.visitors,
					primaryColor: "var(--color-jade)",
					secondaryColor: "var(--color-copper)"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-semibold",
					children: "فروش و درآمد"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DualSpark, {
					primary: series.sales,
					secondary: series.revenue,
					primaryColor: "var(--color-jade)",
					secondaryColor: "var(--color-copper)"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [
					["بازدید", faNum(stats.views)],
					["بازدیدکننده", faNum(stats.visitors)],
					["نوبت ثبت‌شده", faNum(stats.booked)],
					["نوبت لغوشده", faNum(stats.cancelled)],
					["نوبت تکمیل‌شده", faNum(stats.completed)],
					["فروش", faNum(stats.sales)],
					["درآمد", toman(stats.revenueToman)],
					["امروز", faNum(dash.today)],
					["هفت روز", faNum(total)]
				].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm text-muted",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 text-3xl font-extrabold tabular-nums",
					children: value
				})] }, label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm leading-6 text-muted",
				children: [
					"ظرفیت هفت روز: ",
					faNum(dash.capacity.freeMinutes),
					" دقیقه آزاد از ",
					faNum(dash.capacity.availableMinutes),
					" دقیقه."
				]
			}) })
		]
	});
}
//#endregion
export { ReportsPage as component };
