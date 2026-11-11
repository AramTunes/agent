import { i as __toESM } from "../_runtime.mjs";
import { N as saveCategoryFn, i as adminCategoriesFn } from "./api-vBbERkBq.mjs";
import { X as require_jsx_runtime, Z as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as TextInput, i as Card, l as Skeleton, n as Badge, r as Button, s as Field } from "./ui-CYEMVOYZ.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/categories-dScdYa4j.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CategoriesPage() {
	const [rows, setRows] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [form, setForm] = (0, import_react.useState)({
		id: "",
		name: "",
		slug: "",
		active: true
	});
	function load() {
		setLoading(true);
		adminCategoriesFn().then((res) => {
			setRows(res.ok ? res.data : []);
			setLoading(false);
			if (!res.ok) toast.error(res.error);
		});
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[320px_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-bold",
			children: form.id ? "ویرایش دسته" : "دسته تازه"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-4 grid gap-3",
			onSubmit: async (event) => {
				event.preventDefault();
				const res = await saveCategoryFn({ data: {
					name: form.name,
					slug: form.slug,
					active: form.active,
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
					slug: "",
					active: true
				});
				load();
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "نام فارسی",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						value: form.name,
						onChange: (e) => setForm({
							...form,
							name: e.target.value
						}),
						required: true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "نشانی لاتین",
					hint: "فقط حروف انگلیسی، عدد و خط تیره.",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						dir: "ltr",
						className: "text-left",
						value: form.slug,
						onChange: (e) => setForm({
							...form,
							slug: e.target.value
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
					}), "فعال"]
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
							slug: "",
							active: true
						}),
						children: "انصراف"
					}) : null]
				})
			]
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid content-start gap-2",
			children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24" }) : null, rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "rounded-card border border-line bg-card p-4 text-start hover:border-jade",
				onClick: () => setForm({
					id: row.id,
					name: row.name,
					slug: row.slug,
					active: row.active
				}),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-bold",
						children: row.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: row.active ? "jade" : "muted",
						children: row.active ? "فعال" : "مخفی"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					dir: "ltr",
					children: row.slug
				})]
			}, row.id))]
		})]
	});
}
//#endregion
export { CategoriesPage as component };
