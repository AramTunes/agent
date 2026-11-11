import { X as require_jsx_runtime, _ as Outlet, m as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as PanelState, o as useAccount, s as useBusinessId } from "./account-CxecnhcZ.mjs";
import { l as Skeleton } from "./ui-CYEMVOYZ.mjs";
import { i as Subnav, n as Shell, t as DashboardHeader } from "./shell-Dkqa3wbv.mjs";
import { t as RedirectToSignIn } from "./gates-CUxTjxua.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-DEHz4qBI.js
var import_jsx_runtime = require_jsx_runtime();
function PanelLayout() {
	const account = useAccount();
	const { businessId, choose } = useBusinessId(account.me?.memberships);
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const home = pathname === "/panel" || pathname === "/panel/";
	const linksPage = pathname.startsWith("/panel/links");
	const header = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardHeader, {
		memberships: account.me?.memberships ?? [],
		businessId,
		onChoose: choose,
		onCreated: () => account.reload()
	});
	if (account.isPending || account.user && account.loading && !account.me) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, {
		header,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40" })
	});
	if (!account.user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, {
		header,
		children: [home || linksPage ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Subnav, {
			className: "lg:hidden",
			items: [
				{
					to: "/panel",
					label: "خانه",
					exact: true
				},
				{
					to: "/panel/calendar",
					label: "تقویم"
				},
				{
					to: "/panel/services",
					label: "خدمات"
				},
				{
					to: "/panel/staff",
					label: "همکاران"
				},
				{
					to: "/panel/customers",
					label: "مشتریان"
				},
				{
					to: "/panel/settings",
					label: "تنظیمات"
				}
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelState.Provider, {
			value: {
				businessId,
				memberships: account.me?.memberships ?? [],
				displayName: account.me?.profile.displayName ?? "",
				pageFor: account.me?.profile.pageFor ?? "",
				pageName: account.me?.profile.pageName ?? ""
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
		})]
	});
}
//#endregion
export { PanelLayout as component };
