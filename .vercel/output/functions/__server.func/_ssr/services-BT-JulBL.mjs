import { i as __toESM } from "../_runtime.mjs";
import { I as saveServiceFn, x as manageBusinessFn } from "./api-vBbERkBq.mjs";
import { X as require_jsx_runtime, Z as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as usePanel } from "./account-CxecnhcZ.mjs";
import { a as Empty, b as toman, d as TextInput, i as Card, l as Skeleton, n as Badge, r as Button, s as Field, t as Area, y as minutesLabel } from "./ui-CYEMVOYZ.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/services-BT-JulBL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var blank = {
	id: "",
	name: "",
	description: "",
	durationMinutes: 45,
	bufferMinutes: 10,
	priceToman: 0,
	active: true
};
function ServicesPage() {
	const { businessId } = usePanel();
	const [items, setItems] = (0, import_react.useState)([]);
	const [form, setForm] = (0, import_react.useState)(blank);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [saving, setSaving] = (0, import_react.useState)(false);
	function load(id) {
		setLoading(true);
		manageBusinessFn({ data: { businessId: id } }).then((res) => {
			setItems(res.ok ? res.data.services : []);
			setLoading(false);
			if (!res.ok) toast.error(res.error);
		});
	}
	(0, import_react.useEffect)(() => {
		if (businessId) load(businessId);
	}, [businessId]);
	if (!businessId) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
		title: "اول کسب‌وکار بسازید",
		body: "از خانه پنل یک صفحه بسازید تا خدمات را تعریف کنید."
	});
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-48" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[340px_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-lg font-bold",
			children: form.id ? "ویرایش خدمت" : "خدمت تازه"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-4 grid gap-3",
			onSubmit: async (event) => {
				event.preventDefault();
				setSaving(true);
				const res = await saveServiceFn({ data: {
					businessId,
					...form.id ? { id: form.id } : {},
					name: form.name,
					description: form.description,
					durationMinutes: Number(form.durationMinutes),
					bufferMinutes: Number(form.bufferMinutes),
					priceToman: Number(form.priceToman),
					active: form.active
				} });
				setSaving(false);
				if (!res.ok) {
					toast.error(res.error);
					return;
				}
				toast.success("خدمت ذخیره شد");
				setForm(blank);
				load(businessId);
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
					label: "توضیح",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
						value: form.description,
						onChange: (e) => setForm({
							...form,
							description: e.target.value
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "مدت (دقیقه)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							type: "number",
							min: 5,
							max: 480,
							value: form.durationMinutes,
							onChange: (e) => setForm({
								...form,
								durationMinutes: Number(e.target.value)
							})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "آماده‌سازی",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							type: "number",
							min: 0,
							max: 180,
							value: form.bufferMinutes,
							onChange: (e) => setForm({
								...form,
								bufferMinutes: Number(e.target.value)
							})
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "قیمت (تومان)",
					hint: "پرداخت آنلاین در این نسخه نیست.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						type: "number",
						min: 0,
						value: form.priceToman,
						onChange: (e) => setForm({
							...form,
							priceToman: Number(e.target.value)
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex min-h-11 items-center gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: form.active,
						onChange: (e) => setForm({
							...form,
							active: e.target.checked
						})
					}), "در صفحه عمومی نمایش داده شود"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: saving,
						children: saving ? "در حال ذخیره" : "ذخیره"
					}), form.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "quiet",
						onClick: () => setForm(blank),
						children: "انصراف"
					}) : null]
				})
			]
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3 content-start",
			children: [items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
				title: "هنوز خدمتی نیست",
				body: "یک خدمت با مدت و قیمت بسازید تا مشتری بتواند وقت بگیرد."
			}) : null, items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "rounded-card border border-line bg-card p-4 text-start hover:border-jade",
				onClick: () => setForm(item),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-bold",
							children: item.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: item.active ? "jade" : "muted",
							children: item.active ? "فعال" : "مخفی"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							minutesLabel(item.durationMinutes),
							item.bufferMinutes ? ` · ${minutesLabel(item.bufferMinutes)} فاصله` : "",
							" · ",
							toman(item.priceToman)
						]
					}),
					item.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-6",
						children: item.description
					}) : null
				]
			}, item.id))]
		})]
	});
}
//#endregion
export { ServicesPage as component };
