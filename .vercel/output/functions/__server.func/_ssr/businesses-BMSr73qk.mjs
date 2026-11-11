import { i as __toESM } from "../_runtime.mjs";
import { r as adminBusinessesFn, w as moderateBusinessFn } from "./api-vBbERkBq.mjs";
import { X as require_jsx_runtime, Z as require_react, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as PageMark } from "./page-avatar-BIJU5HCZ.mjs";
import { c as Select, d as TextInput, i as Card, l as Skeleton, n as Badge, r as Button, s as Field, t as Area } from "./ui-CYEMVOYZ.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/businesses-BMSr73qk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var LABEL = {
	active: "فعال",
	inactive: "غیرفعال",
	suspended: "تعلیق"
};
function BusinessesPage() {
	const [q, setQ] = (0, import_react.useState)("");
	const [rows, setRows] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [draft, setDraft] = (0, import_react.useState)({});
	function load(query) {
		setLoading(true);
		adminBusinessesFn({ data: { q: query } }).then((res) => {
			if (!res.ok) {
				toast.error(res.error);
				setLoading(false);
				return;
			}
			setRows(res.data);
			setDraft(Object.fromEntries(res.data.map((row) => [row.id, {
				status: row.status,
				reason: row.status_reason
			}])));
			setLoading(false);
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
					placeholder: "نام یا شهر",
					"aria-label": "جست‌وجو"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					variant: "quiet",
					children: "جست‌وجو"
				})]
			}),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24" }) : null,
			!loading && rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "کسب‌وکاری نیست."
			}) }) : null,
			rows.map((row) => {
				const item = draft[row.id] ?? {
					status: row.status,
					reason: row.status_reason
				};
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMark, {
							slug: row.slug,
							name: row.name,
							avatar: row.avatar,
							size: 40
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-bold",
								children: row.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: [
									row.city || "بدون شهر",
									" · ",
									row.slug
								]
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [row.is_demo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "copper",
							children: "نمونه"
						}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: row.status === "active" ? "jade" : "danger",
							children: LABEL[row.status] ?? row.status
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid gap-2 sm:grid-cols-[12rem_1fr_auto]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "وضعیت",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: item.status,
								onChange: (e) => setDraft({
									...draft,
									[row.id]: {
										...item,
										status: e.target.value
									}
								}),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "active",
										children: "فعال"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "inactive",
										children: "غیرفعال"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "suspended",
										children: "تعلیق"
									})
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "دلیل، اگر فعال نیست",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
								value: item.reason,
								onChange: (e) => setDraft({
									...draft,
									[row.id]: {
										...item,
										reason: e.target.value
									}
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								onClick: async () => {
									const res = await moderateBusinessFn({ data: {
										businessId: row.id,
										status: item.status,
										reason: item.reason
									} });
									if (!res.ok) toast.error(res.error);
									else {
										toast.success("وضعیت عوض شد");
										load(q);
									}
								},
								children: "اعمال"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/b/$slug",
								params: { slug: row.slug },
								className: "inline-flex min-h-11 items-center text-sm font-semibold text-jade",
								children: "صفحه"
							})]
						})
					]
				})] }, row.id);
			})
		]
	});
}
//#endregion
export { BusinessesPage as component };
