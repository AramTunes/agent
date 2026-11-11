import { X as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as usePanel } from "./account-CxecnhcZ.mjs";
import { t as focusNav } from "./business-focus-IGUm2XT-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/orders-By8KUt9L.js
var import_jsx_runtime = require_jsx_runtime();
function OrdersPage() {
	const { businessId, memberships } = usePanel();
	const categoryId = memberships.find((item) => item.businessId === businessId)?.categoryId;
	const focus = focusNav(categoryId);
	const title = focus.kind === "booking" ? "سفارشات" : focus.label;
	const text = focus.kind === "hospitality" ? "رزروها و سفارش‌های این صفحه اینجا نشان داده می‌شود." : "سفارش‌های این صفحه اینجا نشان داده می‌شود.";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "grid gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-extrabold",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm leading-7 text-muted",
			children: text
		})]
	});
}
//#endregion
export { OrdersPage as component };
