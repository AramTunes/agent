//#region node_modules/.nitro/vite/services/ssr/assets/business-focus-IGUm2XT-.js
var hospitality = /* @__PURE__ */ new Set([
	"cat-restaurant",
	"cat-cafe",
	"cat-fastfood"
]);
var orders = /* @__PURE__ */ new Set(["cat-shop", "cat-service"]);
function focusKind(categoryId) {
	if (categoryId && hospitality.has(categoryId)) return "hospitality";
	if (categoryId && orders.has(categoryId)) return "orders";
	return "booking";
}
function focusNav(categoryId) {
	const kind = focusKind(categoryId);
	if (kind === "hospitality") return {
		kind,
		label: "رزرو و سفارش",
		to: "/panel/orders"
	};
	if (kind === "orders") return {
		kind,
		label: "سفارشات",
		to: "/panel/orders"
	};
	return {
		kind,
		label: "نوبت‌ها",
		to: "/panel/calendar"
	};
}
//#endregion
export { focusNav as t };
