import { i as __toESM } from "../_runtime.mjs";
import { P as saveCustomerFn, h as customersFn } from "./api-vBbERkBq.mjs";
import { X as require_jsx_runtime, Z as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as usePanel } from "./account-CxecnhcZ.mjs";
import { a as Empty, d as TextInput, i as Card, l as Skeleton, r as Button, s as Field, t as Area, v as faNum } from "./ui-CYEMVOYZ.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { d as formatWhen } from "./router-DEaekAna.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/customers-BC1gjBYT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CustomersPage() {
	const { businessId } = usePanel();
	const [q, setQ] = (0, import_react.useState)("");
	const [rows, setRows] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [form, setForm] = (0, import_react.useState)({
		id: "",
		name: "",
		phone: "",
		notes: ""
	});
	function load(id, query) {
		setLoading(true);
		customersFn({ data: {
			businessId: id,
			q: query
		} }).then((res) => {
			setRows(res.ok ? res.data : []);
			setLoading(false);
			if (!res.ok) toast.error(res.error);
		});
	}
	(0, import_react.useEffect)(() => {
		if (!businessId) return;
		const preset = sessionStorage.getItem("agent.customers.q");
		if (preset) {
			sessionStorage.removeItem("agent.customers.q");
			setQ(preset);
			load(businessId, preset);
			return;
		}
		load(businessId, "");
	}, [businessId]);
	if (!businessId) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
		title: "اول کسب‌وکار بسازید",
		body: "مشتریان بعد از ساخت صفحه یا اولین رزرو این‌جا می‌آیند."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[320px_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-lg font-bold",
			children: form.id ? "ویرایش مشتری" : "مشتری حضوری"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-4 grid gap-3",
			onSubmit: async (event) => {
				event.preventDefault();
				const res = await saveCustomerFn({ data: {
					businessId,
					name: form.name,
					phone: form.phone,
					notes: form.notes,
					...form.id ? { id: form.id } : {}
				} });
				if (!res.ok) {
					toast.error(res.error);
					return;
				}
				toast.success("ذخیره شد");
				setForm({
					id: "",
					name: "",
					phone: "",
					notes: ""
				});
				load(businessId, q);
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "نام",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						value: form.name,
						onChange: (e) => setForm({
							...form,
							name: e.target.value
						}),
						required: true,
						minLength: 2
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "تلفن",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						dir: "ltr",
						className: "text-left",
						value: form.phone,
						onChange: (e) => setForm({
							...form,
							phone: e.target.value
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "یادداشت",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
						value: form.notes,
						onChange: (e) => setForm({
							...form,
							notes: e.target.value
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "ذخیره"
					}), form.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "quiet",
						onClick: () => setForm({
							id: "",
							name: "",
							phone: "",
							notes: ""
						}),
						children: "انصراف"
					}) : null]
				})
			]
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid content-start gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "flex gap-2",
					onSubmit: (event) => {
						event.preventDefault();
						load(businessId, q);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "جست‌وجوی نام یا تلفن",
						"aria-label": "جست‌وجو"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						variant: "quiet",
						children: "جست‌وجو"
					})]
				}),
				loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24" }) : null,
				!loading && rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
					title: "مشتری‌ای نیست",
					body: "با رزرو آنلاین یا ثبت دستی، نام این‌جا دیده می‌شود."
				}) : null,
				rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "rounded-card border border-line bg-card p-4 text-start hover:border-jade",
					onClick: () => setForm({
						id: row.id,
						name: row.name,
						phone: row.phone,
						notes: row.notes
					}),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-bold",
								children: row.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-sm text-muted",
								children: [faNum(row.visits), " مراجعه"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							dir: "ltr",
							children: row.phone ? faNum(row.phone) : "بدون تلفن"
						}),
						row.lastVisit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm",
							children: ["آخرین نوبت: ", formatWhen(row.lastVisit, "Asia/Tehran")]
						}) : null,
						row.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-6",
							children: row.notes
						}) : null
					]
				}, row.id))
			]
		})]
	});
}
//#endregion
export { CustomersPage as component };
