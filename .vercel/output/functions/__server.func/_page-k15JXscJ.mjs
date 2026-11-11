import { i as __toESM } from "./_runtime.mjs";
import { O as publicBusinessFn } from "./_ssr/api-vBbERkBq.mjs";
import { X as require_jsx_runtime, Z as require_react } from "./_libs/@tanstack/react-router+[...].mjs";
import { a as Empty, l as Skeleton } from "./_ssr/ui-CYEMVOYZ.mjs";
import { n as Shell } from "./_ssr/shell-Dkqa3wbv.mjs";
import { i as Route$1, n as BookingScreen } from "./_ssr/router-DEaekAna.mjs";
import { n as MenuScreen } from "./_ssr/menu-block-BG4_aCM-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_page-k15JXscJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CustomPage() {
	const { slug, page } = Route$1.useParams();
	const [mode, setMode] = (0, import_react.useState)("load");
	(0, import_react.useEffect)(() => {
		let live = true;
		publicBusinessFn({ data: { slug } }).then((res) => {
			if (!live) return;
			const blocks = res.ok && Array.isArray(res.data?.pageBlocks) ? res.data.pageBlocks : [];
			const path = decodeURIComponent(page);
			const menu = blocks.some((item) => (item.type === "menu" || item.type === "products" || item.type === "services") && item.active !== false && (item.url?.trim() || (item.type === "products" ? "products" : item.type === "services" ? "services" : "menu")) === path);
			const book = path === "book" || blocks.some((item) => item.type === "booking" && item.active !== false && (item.url?.trim() || "book") === path);
			if (menu) setMode("menu");
			else if (book) setMode("book");
			else setMode("none");
		});
		return () => {
			live = false;
		};
	}, [slug, page]);
	if (mode === "menu") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuScreen, {
		slug,
		page
	});
	if (mode === "book") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookingScreen, { slug });
	if (mode === "none") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
		title: "این نشانی نیست",
		body: ""
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64" }) });
}
//#endregion
export { CustomPage as component };
