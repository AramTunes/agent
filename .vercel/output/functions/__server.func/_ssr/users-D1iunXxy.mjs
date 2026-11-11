import { i as __toESM } from "../_runtime.mjs";
import { o as adminUsersFn } from "./api-vBbERkBq.mjs";
import { X as require_jsx_runtime, Z as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as TextInput, i as Card, l as Skeleton, n as Badge, r as Button } from "./ui-CYEMVOYZ.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { d as formatWhen } from "./router-DEaekAna.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/users-D1iunXxy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function UsersPage() {
	const [q, setQ] = (0, import_react.useState)("");
	const [rows, setRows] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	function load(query) {
		setLoading(true);
		adminUsersFn({ data: { q: query } }).then((res) => {
			setRows(res.ok ? res.data : []);
			setLoading(false);
			if (!res.ok) toast.error(res.error);
		});
	}
	(0, import_react.useEffect)(() => {
		load("");
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex gap-2",
				onSubmit: (event) => {
					event.preventDefault();
					load(q);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					value: q,
					onChange: (e) => setQ(e.target.value),
					placeholder: "نام یا ایمیل",
					"aria-label": "جست‌وجوی کاربر"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					variant: "quiet",
					children: "جست‌وجو"
				})]
			}),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24" }) : null,
			!loading && rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "کاربری پیدا نشد."
			}) }) : null,
			rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-bold",
					children: row.name || "بدون نام"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					dir: "ltr",
					children: row.email
				})] }), row.isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "مدیر سامانه" }) : null]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-muted",
				children: ["عضویت ", formatWhen(row.createdAt, "Asia/Tehran")]
			})] }, row.id))
		]
	});
}
//#endregion
export { UsersPage as component };
