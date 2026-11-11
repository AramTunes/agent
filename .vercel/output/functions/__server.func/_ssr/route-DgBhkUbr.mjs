import { i as __toESM } from "../_runtime.mjs";
import { d as claimAdminFn } from "./api-vBbERkBq.mjs";
import { X as require_jsx_runtime, Z as require_react, _ as Outlet } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as useAccount } from "./account-CxecnhcZ.mjs";
import { a as Empty, l as Skeleton, r as Button } from "./ui-CYEMVOYZ.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as Subnav, n as Shell } from "./shell-Dkqa3wbv.mjs";
import { t as RedirectToSignIn } from "./gates-CUxTjxua.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-DgBhkUbr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminLayout() {
	const account = useAccount();
	const [pending, setPending] = (0, import_react.useState)(false);
	if (account.isPending || account.user && account.loading && !account.me) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40" }) });
	if (!account.user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	if (!account.me?.isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
		title: "مدیریت سامانه",
		body: account.me?.canClaim ? "هنوز مدیری تعیین نشده. اولین حساب واردشده می‌تواند مدیر سامانه شود. این کار فقط یک‌بار ممکن است." : "به این بخش دسترسی ندارید.",
		action: account.me?.canClaim ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			disabled: pending,
			onClick: async () => {
				setPending(true);
				const res = await claimAdminFn();
				setPending(false);
				if (!res.ok) toast.error(res.error);
				else {
					toast.success("مدیر سامانه شدید");
					account.reload();
				}
			},
			children: "پذیرفتن مدیریت"
		}) : void 0
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mb-3 text-2xl font-extrabold",
			children: "مدیریت سامانه"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Subnav, { items: [
			{
				to: "/admin",
				label: "نمای کلی",
				exact: true
			},
			{
				to: "/admin/users",
				label: "کاربران"
			},
			{
				to: "/admin/businesses",
				label: "کسب‌وکارها"
			},
			{
				to: "/admin/categories",
				label: "دسته‌ها"
			},
			{
				to: "/admin/audit",
				label: "حسابرسی"
			}
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
	] });
}
//#endregion
export { AdminLayout as component };
