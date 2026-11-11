import { i as __toESM } from "../_runtime.mjs";
import { L as saveSettingsFn, a as adminOverviewFn } from "./api-vBbERkBq.mjs";
import { X as require_jsx_runtime, Z as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as TextInput, i as Card, l as Skeleton, r as Button, s as Field, v as faNum } from "./ui-CYEMVOYZ.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-xV-rO9pv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS = {
	active: "فعال",
	inactive: "غیرفعال",
	suspended: "تعلیق",
	pending: "در انتظار",
	confirmed: "تأییدشده",
	completed: "انجام‌شده",
	cancelled: "لغوشده",
	no_show: "عدم مراجعه"
};
function AdminHome() {
	const [data, setData] = (0, import_react.useState)(null);
	const [name, setName] = (0, import_react.useState)("ایجنت");
	const [email, setEmail] = (0, import_react.useState)("");
	function load() {
		adminOverviewFn().then((res) => {
			if (!res.ok) {
				toast.error(res.error);
				return;
			}
			setData(res.data);
			const map = Object.fromEntries(res.data.settings.map((item) => [item.key, item.value]));
			setName(map.platform_name || "ایجنت");
			setEmail(map.support_email || "");
		});
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40" });
	const bizTotal = Object.values(data.businesses).reduce((sum, n) => sum + n, 0);
	const bookTotal = Object.values(data.bookings).reduce((sum, n) => sum + n, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-6 text-muted",
				children: "ارسال پیامک و ایمیل وصل نیست. اعلان‌ها فقط داخل برنامه ثبت می‌شوند و به‌عنوان پیام واقعی نشان داده نمی‌شوند."
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					["کاربران", data.users],
					["کسب‌وکارها", bizTotal],
					["نوبت‌ها", bookTotal]
				].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm text-muted",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 text-3xl font-extrabold tabular-nums",
					children: faNum(Number(value))
				})] }, String(label)))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-bold",
					children: "وضعیت کسب‌وکارها"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 grid gap-1 text-sm",
					children: [Object.entries(data.businesses).map(([key, n]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: STATUS[key] ?? key }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums",
							children: faNum(n)
						})]
					}, key)), Object.keys(data.businesses).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-muted",
						children: "هنوز کسب‌وکاری نیست."
					}) : null]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-bold",
					children: "وضعیت نوبت‌ها"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 grid gap-1 text-sm",
					children: [Object.entries(data.bookings).map(([key, n]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: STATUS[key] ?? key }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums",
							children: faNum(n)
						})]
					}, key)), Object.keys(data.bookings).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-muted",
						children: "نوبتی ثبت نشده."
					}) : null]
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-bold",
					children: "تنظیمات عمومی"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: data.note
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-4 grid gap-3 sm:grid-cols-2",
					onSubmit: async (event) => {
						event.preventDefault();
						const res = await saveSettingsFn({ data: {
							platform_name: name,
							support_email: email
						} });
						if (!res.ok) toast.error(res.error);
						else {
							toast.success("ذخیره شد");
							setData(res.data);
						}
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "نام پلتفرم",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								value: name,
								onChange: (e) => setName(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "ایمیل پشتیبانی",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								dir: "ltr",
								className: "text-left",
								value: email,
								onChange: (e) => setEmail(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "sm:col-span-2 sm:w-fit",
							children: "ذخیره"
						})
					]
				})
			] })
		]
	});
}
//#endregion
export { AdminHome as component };
