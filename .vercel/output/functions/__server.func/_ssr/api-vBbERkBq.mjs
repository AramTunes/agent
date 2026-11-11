//#region node_modules/.nitro/vite/services/ssr/assets/api-vBbERkBq.js
var TOKEN_KEY = "agent.token";
function readToken() {
	if (typeof window === "undefined") return null;
	try {
		return window.localStorage.getItem(TOKEN_KEY);
	} catch {
		return null;
	}
}
function writeToken(token) {
	if (typeof window === "undefined") return;
	try {
		if (token) window.localStorage.setItem(TOKEN_KEY, token);
		else window.localStorage.removeItem(TOKEN_KEY);
	} catch {}
}
function resolvePath(path) {
	if (typeof window !== "undefined") return path;
	const env = globalThis.process?.env;
	return (env?.AGENT_API_URL || env?.NOBAT_API_URL || "http://127.0.0.1:8090").replace(/\/$/, "") + path;
}
async function call(method, path, body) {
	const headers = {};
	const token = readToken();
	if (token) headers.authorization = `Bearer ${token}`;
	if (body !== void 0) headers["content-type"] = "application/json";
	let response;
	try {
		response = await fetch(resolvePath(path), {
			method,
			headers,
			body: body !== void 0 ? JSON.stringify(body) : void 0
		});
	} catch {
		return {
			ok: false,
			error: "ارتباط با سرور برقرار نشد",
			code: "NETWORK"
		};
	}
	const json = await response.json().catch(() => null);
	if (json && typeof json === "object" && "ok" in json) return json;
	return {
		ok: false,
		error: "پاسخ سرور نامعتبر بود",
		code: "INTERNAL"
	};
}
var post = (path, data) => call("POST", path, data ?? {});
var get = (path) => call("GET", path);
async function uploadPageVideo(businessId, file) {
	return uploadMedia(businessId, file);
}
function uploadPageFile(businessId, file, onProgress) {
	return new Promise((resolve) => {
		const body = new FormData();
		body.set("businessId", businessId);
		body.set("file", file);
		body.set("kind", "file");
		const xhr = new XMLHttpRequest();
		xhr.open("POST", "/api/v1/media");
		const token = readToken();
		if (token) xhr.setRequestHeader("authorization", `Bearer ${token}`);
		xhr.upload.onprogress = (event) => {
			if (!onProgress || !event.lengthComputable || event.total <= 0) return;
			onProgress(Math.min(100, Math.round(event.loaded / event.total * 100)));
		};
		xhr.onload = () => {
			try {
				const json = JSON.parse(xhr.responseText);
				if (json && typeof json === "object" && "ok" in json) {
					resolve(json);
					return;
				}
			} catch {}
			resolve({
				ok: false,
				error: "پاسخ سرور نامعتبر بود",
				code: "INTERNAL"
			});
		};
		xhr.onerror = () => resolve({
			ok: false,
			error: "ارتباط با سرور برقرار نشد",
			code: "NETWORK"
		});
		xhr.onabort = () => resolve({
			ok: false,
			error: "آپلود لغو شد",
			code: "NETWORK"
		});
		xhr.send(body);
	});
}
async function uploadMedia(businessId, file, kind) {
	const body = new FormData();
	body.set("businessId", businessId);
	body.set("file", file);
	if (kind) body.set("kind", kind);
	const headers = {};
	const token = readToken();
	if (token) headers.authorization = `Bearer ${token}`;
	try {
		const json = await (await fetch("/api/v1/media", {
			method: "POST",
			headers,
			body
		})).json().catch(() => null);
		if (json && typeof json === "object" && "ok" in json) return json;
		return {
			ok: false,
			error: "پاسخ سرور نامعتبر بود",
			code: "INTERNAL"
		};
	} catch {
		return {
			ok: false,
			error: "ارتباط با سرور برقرار نشد",
			code: "NETWORK"
		};
	}
}
var categoriesFn = () => get("/api/v1/categories");
var businessesFn = (args) => {
	const data = args.data ?? {};
	const q = new URLSearchParams();
	if (data.q) q.set("q", String(data.q));
	if (data.category) q.set("category", String(data.category));
	if (data.limit != null) q.set("limit", String(data.limit));
	if (data.offset != null) q.set("offset", String(data.offset));
	return get(`/api/v1/businesses?${q.toString()}`);
};
var publicBusinessFn = (args) => {
	const slug = encodeURIComponent(args.data.slug ?? "");
	const visitor = args.data.track ? visitorId() : "";
	return get(`/api/v1/business/${slug}${visitor ? `?v=${encodeURIComponent(visitor)}` : ""}`);
};
var placeMenuOrderFn = (args) => post("/api/v1/menu-orders", args.data);
function visitorId() {
	if (typeof window === "undefined") return "";
	const key = "agent.visitor";
	const saved = window.localStorage.getItem(key) ?? "";
	if (/^[a-zA-Z0-9_-]{8,64}$/.test(saved)) return saved;
	const next = crypto.randomUUID().replace(/-/g, "");
	window.localStorage.setItem(key, next);
	return next;
}
var availabilityFn = (args) => {
	const q = new URLSearchParams();
	for (const key of [
		"businessId",
		"serviceId",
		"staffId",
		"day"
	]) if (args.data[key] != null) q.set(key, String(args.data[key]));
	return get(`/api/v1/availability?${q.toString()}`);
};
var lookupPhoneFn = (args) => post("/api/v1/auth/lookup", args.data);
var sendPhoneCodeFn = (args) => post("/api/v1/auth/code", args.data);
var signInPhoneFn = (args) => post("/api/v1/auth/password", args.data);
var signInPhoneCodeFn = (args) => post("/api/v1/auth/code-login", args.data);
var resetPhonePasswordFn = (args) => post("/api/v1/auth/reset", args.data);
var startAccountFn = (args) => post("/api/v1/auth/start", args.data);
var meFn = () => get("/api/v1/me");
var updateProfileFn = (args) => post("/api/v1/me", args.data);
var claimAdminFn = () => post("/api/v1/admin/claim", {});
var createBusinessFn = (args) => post("/api/v1/businesses", args.data);
var createDemoFn = () => post("/api/v1/demo", {});
var updateBusinessFn = (args) => post("/api/v1/businesses/update", args.data);
var deleteBusinessFn = (args) => post("/api/v1/businesses/delete", args.data);
var manageBusinessFn = (args) => post("/api/v1/businesses/manage", args.data);
var saveServiceFn = (args) => post("/api/v1/services", args.data);
var deleteServiceFn = (args) => post("/api/v1/services/delete", args.data);
var saveStaffFn = (args) => post("/api/v1/staff", args.data);
var deleteStaffFn = (args) => post("/api/v1/staff/delete", args.data);
var saveScheduleFn = (args) => post("/api/v1/schedule", args.data);
var addHolidayFn = (args) => post("/api/v1/holidays", args.data);
var removeHolidayFn = (args) => post("/api/v1/holidays/remove", args.data);
var createBookingFn = (args) => post("/api/v1/bookings", args.data);
var setBookingStatusFn = (args) => post("/api/v1/bookings/status", args.data);
var rescheduleBookingFn = (args) => post("/api/v1/bookings/reschedule", args.data);
var myBookingsFn = () => get("/api/v1/me/bookings");
var businessBookingsFn = (args) => post("/api/v1/business-bookings", args.data);
var customersFn = (args) => post("/api/v1/customers/list", args.data);
var saveCustomerFn = (args) => post("/api/v1/customers", args.data);
var dashboardFn = (args) => post("/api/v1/dashboard", args.data);
var notificationsFn = () => get("/api/v1/notifications");
var markReadFn = (args) => post("/api/v1/notifications/read", args.data);
var adminOverviewFn = () => get("/api/v1/admin/overview");
var adminUsersFn = (args) => post("/api/v1/admin/users", args.data);
var adminBusinessesFn = (args) => post("/api/v1/admin/businesses", args.data);
var moderateBusinessFn = (args) => post("/api/v1/admin/moderate", args.data);
var adminCategoriesFn = () => get("/api/v1/admin/categories");
var saveCategoryFn = (args) => post("/api/v1/admin/categories", args.data);
var adminAuditFn = () => get("/api/v1/admin/audit");
var saveSettingsFn = (args) => post("/api/v1/admin/settings", args.data);
//#endregion
export { removeHolidayFn as A, setBookingStatusFn as B, meFn as C, placeMenuOrderFn as D, notificationsFn as E, saveScheduleFn as F, updateProfileFn as G, signInPhoneFn as H, saveServiceFn as I, writeToken as J, uploadPageFile as K, saveSettingsFn as L, resetPhonePasswordFn as M, saveCategoryFn as N, publicBusinessFn as O, saveCustomerFn as P, saveStaffFn as R, markReadFn as S, myBookingsFn as T, startAccountFn as U, signInPhoneCodeFn as V, updateBusinessFn as W, deleteBusinessFn as _, adminOverviewFn as a, lookupPhoneFn as b, businessBookingsFn as c, claimAdminFn as d, createBookingFn as f, dashboardFn as g, customersFn as h, adminCategoriesFn as i, rescheduleBookingFn as j, readToken as k, businessesFn as l, createDemoFn as m, adminAuditFn as n, adminUsersFn as o, createBusinessFn as p, uploadPageVideo as q, adminBusinessesFn as r, availabilityFn as s, addHolidayFn as t, categoriesFn as u, deleteServiceFn as v, moderateBusinessFn as w, manageBusinessFn as x, deleteStaffFn as y, sendPhoneCodeFn as z };
