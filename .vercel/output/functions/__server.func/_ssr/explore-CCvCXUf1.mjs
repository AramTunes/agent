import { i as __toESM } from "../_runtime.mjs";
import { l as businessesFn, u as categoriesFn } from "./api-vBbERkBq.mjs";
import { X as require_jsx_runtime, Z as require_react, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as PageMark } from "./page-avatar-BIJU5HCZ.mjs";
import { a as Empty, d as TextInput, l as Skeleton, n as Badge } from "./ui-CYEMVOYZ.mjs";
import { n as Shell } from "./shell-Dkqa3wbv.mjs";
import { s as Route$22 } from "./router-DEaekAna.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/explore-CCvCXUf1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ExplorePage() {
	const search = Route$22.useSearch();
	const navigate = Route$22.useNavigate();
	const [q, setQ] = (0, import_react.useState)(search.q);
	const [categories, setCategories] = (0, import_react.useState)([]);
	const [items, setItems] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		categoriesFn().then((res) => {
			if (res.ok) setCategories(res.data);
		});
	}, []);
	(0, import_react.useEffect)(() => {
		let live = true;
		setLoading(true);
		businessesFn({ data: {
			q: search.q,
			category: search.category,
			limit: 24
		} }).then((res) => {
			if (!live) return;
			setItems(res.ok ? res.data.items : []);
			setLoading(false);
		});
		return () => {
			live = false;
		};
	}, [search.q, search.category]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl font-extrabold",
			children: "کسب‌وکارها"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-4 flex gap-2",
			onSubmit: (event) => {
				event.preventDefault();
				navigate({ search: {
					q,
					category: search.category
				} });
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
				value: q,
				onChange: (e) => setQ(e.target.value),
				placeholder: "نام یا شهر",
				"aria-label": "جستجو"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "min-h-11 rounded-xl bg-jade px-4 text-sm font-semibold text-on-jade",
				type: "submit",
				children: "جستجو"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex gap-2 overflow-x-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => navigate({ search: {
					q: search.q,
					category: ""
				} }),
				className: `shrink-0 rounded-full px-4 py-2 text-sm ${search.category === "" ? "bg-jade text-on-jade" : "border border-line bg-card"}`,
				children: "همه"
			}), categories.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => navigate({ search: {
					q: search.q,
					category: cat.slug
				} }),
				className: `shrink-0 rounded-full px-4 py-2 text-sm ${search.category === cat.slug ? "bg-jade text-on-jade" : "border border-line bg-card"}`,
				children: cat.name
			}, cat.id))]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 grid gap-3 sm:grid-cols-2",
			children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32" })] }) : items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sm:col-span-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
					title: "کسب‌وکاری با این مشخصات نیست",
					body: "دسته دیگری را انتخاب کنید یا خودتان صفحه کسب‌وکار بسازید."
				})
			}) : items.map((biz) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/b/$slug",
				params: { slug: biz.slug },
				className: "flex items-start gap-3 rounded-card border border-line bg-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMark, {
					slug: biz.slug,
					name: biz.name,
					avatar: biz.avatar,
					size: 48
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-bold",
								children: biz.name
							}), biz.is_demo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: "copper",
								children: "نمونه"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: biz.category_name || "کسب‌وکار" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: biz.city || "شهر ثبت نشده"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 line-clamp-3 text-sm leading-6",
							children: biz.description
						})
					]
				})]
			}, biz.id))
		})
	] });
}
//#endregion
export { ExplorePage as component };
