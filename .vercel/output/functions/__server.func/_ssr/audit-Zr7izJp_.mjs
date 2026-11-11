import { i as __toESM } from "../_runtime.mjs";
import { n as adminAuditFn } from "./api-vBbERkBq.mjs";
import { X as require_jsx_runtime, Z as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as Card, l as Skeleton, v as faNum } from "./ui-CYEMVOYZ.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { d as formatWhen } from "./router-DEaekAna.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/audit-Zr7izJp_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ACTION = {
	create_business: "ساخت کسب‌وکار",
	update_business: "ویرایش کسب‌وکار",
	delete_business: "حذف کسب‌وکار",
	booking_status: "تغییر وضعیت نوبت",
	reschedule: "جابه‌جایی نوبت",
	moderate_business: "نظارت کسب‌وکار",
	save_category: "ویرایش دسته",
	save_settings: "تنظیمات سامانه",
	claim_admin: "تعیین مدیر"
};
function AuditPage() {
	const [logs, setLogs] = (0, import_react.useState)([]);
	const [jobs, setJobs] = (0, import_react.useState)([]);
	const [note, setNote] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		adminAuditFn().then((res) => {
			if (!res.ok) toast.error(res.error);
			else {
				setLogs(res.data.logs);
				setJobs(res.data.jobs);
				setNote(res.data.errorLog);
			}
			setLoading(false);
		});
	}, []);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-bold",
				children: "کارهای اعلان"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm leading-6 text-muted",
				children: [note, " وضعیت skipped یعنی ارسال نشده است."]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-3 grid gap-1 text-sm",
				children: [jobs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-muted",
					children: "کاری ثبت نشده."
				}) : null, jobs.map((job) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						dir: "ltr",
						children: [
							job.channel,
							" · ",
							job.status
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums",
						children: faNum(job.n)
					})]
				}, job.channel + job.status))]
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-2",
			children: [logs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "رخدادی نیست."
			}) }) : null, logs.map((log) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-semibold",
					children: ACTION[log.action] ?? log.action
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [log.entity, log.detail ? ` · ${log.detail}` : ""]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
					className: "text-sm text-muted",
					children: formatWhen(log.createdAt, "Asia/Tehran")
				})]
			}) }, log.id))]
		})]
	});
}
//#endregion
export { AuditPage as component };
