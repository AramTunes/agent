import { i as __toESM } from "../_runtime.mjs";
import { l as businessesFn, u as categoriesFn } from "./api-vBbERkBq.mjs";
import { X as require_jsx_runtime, Z as require_react, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as PageMark } from "./page-avatar-BIJU5HCZ.mjs";
import { i as Card, n as Badge } from "./ui-CYEMVOYZ.mjs";
import { Gt as CalendarCheck, a as Waypoints, b as Store, en as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as Shell, r as StartFreeLink } from "./shell-Dkqa3wbv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BhlpKpE8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const [categories, setCategories] = (0, import_react.useState)([]);
	const [businesses, setBusinesses] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		let live = true;
		Promise.all([categoriesFn(), businessesFn({ data: { limit: 6 } })]).then(([categories, businesses]) => {
			if (!live) return;
			setCategories(categories.ok ? categories.data : []);
			setBusinesses(businesses.ok ? businesses.data.items ?? [] : []);
		});
		return () => {
			live = false;
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: "copper",
						children: "دستیار کسب‌وکار"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-4xl font-extrabold leading-tight sm:text-5xl",
						children: "کار کسب‌وکارت را آنلاین کن"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-xl text-base leading-7 text-muted",
						children: "ایجنت صفحهٔ کسب‌وکار است. نوبت، سفارش، منو، محصول و خدمات، هر کدام برای همان نوع کار. مشتری از یک لینک اقدام می‌کند."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/explore",
							search: {
								q: "",
								category: ""
							},
							className: "inline-flex min-h-11 items-center rounded-xl bg-jade px-5 font-semibold text-on-jade",
							children: "دیدن کسب‌وکارها"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StartFreeLink, { className: "px-5" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "grid gap-3 sm:grid-cols-3",
						children: [
							[
								Store,
								"صفحه کسب‌وکار",
								"معرفی، راه‌های ارتباط و لینک‌ها یکجا."
							],
							[
								CalendarCheck,
								"نوبت یا سفارش",
								"بسته به نوع کار، رزرو یا سفارش در پنل می‌آید."
							],
							[
								Waypoints,
								"برای هر کسب‌وکار",
								"آرایشگاه، کافه، فروشگاه و خدمات."
							]
						].map(([Icon, title, body]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-card border border-line bg-card p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									className: "mb-2 size-5 text-jade",
									"aria-hidden": "true"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold",
									children: String(title)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted",
									children: String(body)
								})
							]
						}, String(title)))
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold text-copper",
					children: "نمونه صفحه، نه دادهٔ واقعی"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-3 text-2xl font-extrabold",
					children: "اصلاح مو"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "آرایشگاه سرو · سارا کریمی"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl bg-paper p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted",
							children: "ساعت"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xl font-bold tabular-nums",
							children: "۱۱:۳۰"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl bg-jade-soft p-3 text-jade-deep",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs",
							children: "مدت"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xl font-bold",
							children: "۴۵ دقیقه"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm leading-6 text-muted",
					children: "بعد از ثبت‌نام، صفحهٔ کسب‌وکارت را می‌سازی و همان لینک را برای مشتری می‌فرستی."
				})
			] })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-bold",
					children: "دسته‌ها"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/explore",
					search: {
						q: "",
						category: ""
					},
					className: "inline-flex items-center gap-1 text-sm font-semibold text-jade",
					children: ["همه ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" })]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 overflow-x-auto pb-1",
				children: categories.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/explore",
					search: {
						category: cat.slug,
						q: ""
					},
					className: "shrink-0 rounded-full border border-line bg-card px-4 py-2 text-sm",
					children: cat.name
				}, cat.id))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-4 text-2xl font-bold",
				children: "کسب‌وکارهای فعال"
			}), businesses.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "هنوز صفحه‌ای منتشر نشده. اولین کسب‌وکار را از پنل بسازید."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: businesses.map((biz) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/b/$slug",
					params: { slug: biz.slug },
					className: "flex items-start gap-3 rounded-card border border-line bg-card p-4 hover:border-jade",
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
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-bold",
									children: biz.name
								}), biz.is_demo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "نمونه" }) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-muted",
								children: [biz.category_name, biz.city ? ` · ${biz.city}` : ""]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 line-clamp-2 text-sm leading-6",
								children: biz.description
							})
						]
					})]
				}, biz.slug))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mt-12 grid gap-4 rounded-card bg-ink p-6 text-on-ink sm:grid-cols-3",
			children: [
				["۱", "صفحهٔ کسب‌وکارت را بچین"],
				["۲", "مشتری از لینک اقدام می‌کند"],
				["۳", "نوبت، سفارش یا منو در پنل تو جمع می‌شود"]
			].map(([n, text]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm text-copper",
				children: n
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-semibold",
				children: text
			})] }, n))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-8 text-xs text-muted",
			children: "پرداخت آنلاین در این نسخه فعال نیست و وضعیت اشتراک «فعال» ساخته نمی‌شود."
		})
	] });
}
//#endregion
export { Home as component };
