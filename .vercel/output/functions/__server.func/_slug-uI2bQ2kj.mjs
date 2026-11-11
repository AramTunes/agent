import { i as __toESM } from "./_runtime.mjs";
import { O as publicBusinessFn } from "./_ssr/api-vBbERkBq.mjs";
import { X as require_jsx_runtime, Z as require_react } from "./_libs/@tanstack/react-router+[...].mjs";
import { a as Route$2 } from "./_ssr/router-DEaekAna.mjs";
import { l as CustomerLinkStage, v as parseDesign } from "./_ssr/link-page-3N_beGwN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug-uI2bQ2kj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BusinessPage() {
	const { slug } = Route$2.useParams();
	const [biz, setBiz] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		let live = true;
		publicBusinessFn({ data: {
			slug,
			track: true
		} }).then((res) => {
			if (!live) return;
			if (res.ok) setBiz(res.data);
			else setError(res.error);
		});
		return () => {
			live = false;
		};
	}, [slug]);
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerLinkStage, {
		name: "ایجنت",
		bio: error,
		slug,
		blocks: []
	});
	if (!biz) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-dvh bg-black" });
	const blocks = Array.isArray(biz.pageBlocks) ? biz.pageBlocks : [];
	const design = parseDesign(blocks.find((item) => item.type === "design")?.body);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerLinkStage, {
		name: biz.name,
		bio: biz.description ?? "",
		avatar: biz.avatar,
		slug,
		blocks,
		design
	});
}
//#endregion
export { BusinessPage as component };
