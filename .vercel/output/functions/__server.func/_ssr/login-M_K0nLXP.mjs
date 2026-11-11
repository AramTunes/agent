import { S as Navigate, X as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as Route$21 } from "./router-DEaekAna.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-M_K0nLXP.js
var import_jsx_runtime = require_jsx_runtime();
function LoginRedirect() {
	const { next } = Route$21.useSearch();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
		to: "/auth",
		search: { next }
	});
}
//#endregion
export { LoginRedirect as component };
