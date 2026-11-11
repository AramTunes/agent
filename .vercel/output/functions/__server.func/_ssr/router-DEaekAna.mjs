import { i as __toESM } from "../_runtime.mjs";
import { B as setBookingStatusFn, O as publicBusinessFn, f as createBookingFn, s as availabilityFn } from "./api-vBbERkBq.mjs";
import { X as require_jsx_runtime, Z as require_react, _ as Outlet, b as createRootRoute, f as Scripts, g as createRouter, p as HeadContent, v as lazyRouteComponent, w as useRouter, x as Link, y as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as PageMark } from "./page-avatar-BIJU5HCZ.mjs";
import { c as useCurrentUserState, r as SessionProvider } from "./account-CxecnhcZ.mjs";
import { a as Empty, b as toman, d as TextInput, g as enDigits, i as Card, l as Skeleton, m as clockLabel, n as Badge, o as ErrorNote, p as WEEKDAYS_FA, r as Button, s as Field, u as Stepper, v as faNum, y as minutesLabel } from "./ui-CYEMVOYZ.mjs";
import { h as TriangleAlert } from "../_libs/lucide-react.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { a as ThemeProvider, n as Shell } from "./shell-Dkqa3wbv.mjs";
import { i as jalaliMonthName, n as civilInZone, r as gregorianToJalali, s as todayYmd, t as addDaysYmd } from "./time-BneIW53_.mjs";
import { t as JalaliCalendar } from "./jalali-calendar-jyOmkH66.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/iran-phone-JBcCyBaq.js
/** «۰۹۱۲…»، «+98912…» یا «0098912…» را به ده رقم «912…» برمی‌گرداند. */
function normalizeIranMobile(input) {
	let digits = enDigits(input).replace(/\D/g, "");
	if (digits.startsWith("0098")) digits = digits.slice(4);
	else if (digits.startsWith("98") && digits.length > 10) digits = digits.slice(2);
	if (digits.startsWith("0")) digits = digits.slice(1);
	return digits.slice(0, 10);
}
function isIranMobile(input) {
	return /^9\d{9}$/.test(normalizeIranMobile(input));
}
/** «912 345 6789» */
function formatIranMobile(input) {
	const digits = normalizeIranMobile(input);
	return [
		digits.slice(0, 3),
		digits.slice(3, 6),
		digits.slice(6, 10)
	].filter(Boolean).join(" ");
}
var OPERATORS = [
	[/^(91\d|99[0-6])/, "همراه اول"],
	[/^(93[0-9]|90[1-5])/, "ایرانسل"],
	[/^92[0-2]/, "رایتل"],
	[/^998/, "شاتل موبایل"],
	[/^999/, "سامانتل"]
];
function mobileOperator(input) {
	const digits = normalizeIranMobile(input);
	if (digits.length < 3) return null;
	return OPERATORS.find(([re]) => re.test(digits))?.[1] ?? null;
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/format-D0bT6QDm.js
function formatWhen(iso, timeZone) {
	const c = civilInZone(new Date(iso), timeZone);
	const j = gregorianToJalali(c.year, c.month, c.day);
	return `${WEEKDAYS_FA[c.weekday]} ${faNum(j.jd)} ${jalaliMonthName(j.jm)}، ${clockLabel(c.hour * 60 + c.minute)}`;
}
function formatDay(ymd) {
	const [y, m, d] = ymd.split("-").map(Number);
	const j = gregorianToJalali(y, m, d);
	return `${faNum(j.jd)} ${jalaliMonthName(j.jm)} ${faNum(j.jy)}`;
}
function formatClock(iso, timeZone) {
	const c = civilInZone(new Date(iso), timeZone);
	return clockLabel(c.hour * 60 + c.minute);
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-DEaekAna.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* Path-based preview hosts serve the dev server under `/{port_id}/` and strip
* that prefix before forwarding, so SSR sees `/` while the browser URL keeps the
* prefix. TanStack Start resets `basepath` on hydration, so a `rewrite` keeps
* client routing and generated links aligned with the public URL.
*/
var PATH_BASED_PREVIEW_HOSTS = /* @__PURE__ */ new Set([
	"preview.grok.genai.mil",
	"preview.grok.mil",
	"preview.grokgsac.com"
]);
var PORT_ID_PREFIX = /^\/hds-[a-z0-9]+-\d+-[a-z0-9]+(?=\/|$)/i;
function previewPathPrefix(hostname, pathname) {
	if (!PATH_BASED_PREVIEW_HOSTS.has(hostname.toLowerCase())) return void 0;
	return PORT_ID_PREFIX.exec(pathname)?.[0];
}
function prefixRewrite(prefix) {
	return {
		input: ({ url }) => {
			if (url.pathname === prefix) url.pathname = "/";
			else if (url.pathname.startsWith(`${prefix}/`)) url.pathname = url.pathname.slice(prefix.length);
			return url;
		},
		output: ({ url }) => {
			url.pathname = `${prefix}${url.pathname}`;
			return url;
		}
	};
}
function previewPathRewrite() {
	if (typeof window === "undefined") return void 0;
	const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
	return prefix ? prefixRewrite(prefix) : void 0;
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-2EVbMdGi.css";
var Route$26 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "ایجنت — دستیار کسب‌وکار" },
			{
				name: "description",
				content: "ایجنت کار کسب‌وکار را آنلاین می‌کند: صفحه، نوبت، سفارش، منو، محصول و خدمات."
			},
			{
				name: "theme-color",
				content: "#0e6b54"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "fa",
		dir: "rtl",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { dangerouslySetInnerHTML: { __html: "(function(){try{var s=localStorage.getItem(\"agent.theme\")||localStorage.getItem(\"nobat.theme\");var t=s===\"light\"||s===\"dark\"?s:(window.matchMedia(\"(prefers-color-scheme: dark)\").matches?\"dark\":\"light\");document.documentElement.setAttribute(\"data-theme\",t);}catch(e){}})();" } }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SessionProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				position: "top-center",
				dir: "rtl",
				toastOptions: { style: {
					background: "var(--color-card)",
					color: "var(--color-ink)",
					border: "1px solid var(--color-line)",
					fontFamily: "inherit"
				} }
			})] }) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter$25 = () => import("./routes-BhlpKpE8.mjs");
var Route$25 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$25, "component") });
var $$splitComponentImporter$24 = () => import("./route-DgBhkUbr.mjs");
var Route$24 = createFileRoute("/admin")({ component: lazyRouteComponent($$splitComponentImporter$24, "component") });
var $$splitComponentImporter$23 = () => import("./auth-CH8_LTYj.mjs");
var Route$23 = createFileRoute("/auth")({
	validateSearch: (search) => {
		return { next: typeof search.next === "string" && search.next.startsWith("/") && !search.next.startsWith("//") ? search.next : "/panel" };
	},
	component: lazyRouteComponent($$splitComponentImporter$23, "component")
});
var $$splitComponentImporter$22 = () => import("./explore-CCvCXUf1.mjs");
var Route$22 = createFileRoute("/explore")({
	validateSearch: (search) => ({
		q: typeof search.q === "string" ? search.q : "",
		category: typeof search.category === "string" ? search.category : ""
	}),
	component: lazyRouteComponent($$splitComponentImporter$22, "component")
});
var $$splitComponentImporter$21 = () => import("./login-M_K0nLXP.mjs");
var Route$21 = createFileRoute("/login")({
	validateSearch: (search) => {
		return { next: typeof search.next === "string" && search.next.startsWith("/") && !search.next.startsWith("//") ? search.next : "/panel" };
	},
	component: lazyRouteComponent($$splitComponentImporter$21, "component")
});
var $$splitComponentImporter$20 = () => import("./me-Bb8YSnb-.mjs");
var Route$20 = createFileRoute("/me")({ component: lazyRouteComponent($$splitComponentImporter$20, "component") });
var $$splitComponentImporter$19 = () => import("./route-DEHz4qBI.mjs");
var Route$19 = createFileRoute("/panel")({ component: lazyRouteComponent($$splitComponentImporter$19, "component") });
var $$splitComponentImporter$18 = () => import("./start-C67Tu2hS.mjs");
var Route$18 = createFileRoute("/start")({ component: lazyRouteComponent($$splitComponentImporter$18, "component") });
var $$splitComponentImporter$17 = () => import("./support-BnCuREUQ.mjs");
var Route$17 = createFileRoute("/support")({ component: lazyRouteComponent($$splitComponentImporter$17, "component") });
var $$splitComponentImporter$16 = () => import("./admin-xV-rO9pv.mjs");
var Route$16 = createFileRoute("/admin/")({ component: lazyRouteComponent($$splitComponentImporter$16, "component") });
var $$splitComponentImporter$15 = () => import("./audit-Zr7izJp_.mjs");
var Route$15 = createFileRoute("/admin/audit")({ component: lazyRouteComponent($$splitComponentImporter$15, "component") });
var $$splitComponentImporter$14 = () => import("./businesses-BMSr73qk.mjs");
var Route$14 = createFileRoute("/admin/businesses")({ component: lazyRouteComponent($$splitComponentImporter$14, "component") });
var $$splitComponentImporter$13 = () => import("./categories-dScdYa4j.mjs");
var Route$13 = createFileRoute("/admin/categories")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
var $$splitComponentImporter$12 = () => import("./users-D1iunXxy.mjs");
var Route$12 = createFileRoute("/admin/users")({ component: lazyRouteComponent($$splitComponentImporter$12, "component") });
var $$splitComponentImporter$11 = () => import("./panel-Dx2c3kkD.mjs");
var Route$11 = createFileRoute("/panel/")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./calendar-DaRwULiV.mjs");
var Route$10 = createFileRoute("/panel/calendar")({ component: lazyRouteComponent($$splitComponentImporter$10, "component") });
var $$splitComponentImporter$9 = () => import("./customers-BC1gjBYT.mjs");
var Route$9 = createFileRoute("/panel/customers")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./links-r45mlN3T.mjs");
var Route$8 = createFileRoute("/panel/links")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./orders-By8KUt9L.mjs");
var Route$7 = createFileRoute("/panel/orders")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./reports-Davamlq7.mjs");
var Route$6 = createFileRoute("/panel/reports")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./services-BT-JulBL.mjs");
var Route$5 = createFileRoute("/panel/services")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./settings-BSNocF2w.mjs");
var Route$4 = createFileRoute("/panel/settings")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./staff--4FKaRW7.mjs");
var Route$3 = createFileRoute("/panel/staff")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("../_slug-uI2bQ2kj.mjs");
var Route$2 = createFileRoute("/b/$slug/")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("../_page-k15JXscJ.mjs");
var Route$1 = createFileRoute("/b/$slug/$page")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./book-BR7IHskR.mjs");
var Route = createFileRoute("/b/$slug/book")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
function localDay(iso, zone) {
	const c = civilInZone(new Date(iso), zone || "Asia/Tehran");
	return `${c.year}-${String(c.month).padStart(2, "0")}-${String(c.day).padStart(2, "0")}`;
}
function idempotency() {
	return `web-${crypto.randomUUID()}`;
}
var cancelReasons = [
	"برنامه‌ام عوض شد",
	"وقت دیگری می‌خواهم",
	"دیگر نیاز ندارم",
	"اشتباه رزرو کردم"
];
function BookingScreen({ slug }) {
	const { user, isPending } = useCurrentUserState();
	const [biz, setBiz] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [serviceId, setServiceId] = (0, import_react.useState)("");
	const [staffId, setStaffId] = (0, import_react.useState)(null);
	const [day, setDay] = (0, import_react.useState)("");
	const [slots, setSlots] = (0, import_react.useState)([]);
	const [slotLoading, setSlotLoading] = (0, import_react.useState)(false);
	const [start, setStart] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	const [firstName, setFirstName] = (0, import_react.useState)("");
	const [lastName, setLastName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	const [step, setStep] = (0, import_react.useState)(0);
	const [receipt, setReceipt] = (0, import_react.useState)(null);
	const [askCancel, setAskCancel] = (0, import_react.useState)(false);
	const [reason, setReason] = (0, import_react.useState)(cancelReasons[0]);
	const [canceling, setCanceling] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let live = true;
		publicBusinessFn({ data: { slug } }).then((res) => {
			if (!live) return;
			if (!res.ok) {
				setError(res.error);
				return;
			}
			setBiz(res.data);
			setServiceId(res.data.services?.[0]?.id ?? "");
			setDay(todayYmd(res.data.timezone || "Asia/Tehran"));
		});
		return () => {
			live = false;
		};
	}, [slug]);
	(0, import_react.useEffect)(() => {
		if (!user || firstName || lastName) return;
		const parts = (user.displayName ?? "").trim().split(/\s+/).filter(Boolean);
		if (parts.length) setFirstName(parts[0] ?? "");
		if (parts.length > 1) setLastName(parts.slice(1).join(" "));
		if (user.primaryEmail) setEmail(user.primaryEmail);
	}, [
		user,
		firstName,
		lastName
	]);
	const services = biz?.services ?? [];
	const service = services.find((item) => item.id === serviceId);
	const staffChoices = (0, import_react.useMemo)(() => (biz?.staff ?? []).filter((person) => person.serviceIds?.includes(serviceId)) ?? [], [biz, serviceId]);
	(0, import_react.useEffect)(() => {
		if (!biz || !serviceId || !day) return;
		let live = true;
		setSlotLoading(true);
		setStart("");
		availabilityFn({ data: {
			businessId: biz.id,
			serviceId,
			staffId: staffId ?? "",
			day
		} }).then((res) => {
			if (!live) return;
			setSlots(res.ok ? res.data.slots : []);
			if (!res.ok) setError(res.error);
			setSlotLoading(false);
		});
		return () => {
			live = false;
		};
	}, [
		biz,
		serviceId,
		staffId,
		day
	]);
	async function confirm() {
		if (!biz || !start) return;
		const given = firstName.trim();
		const family = lastName.trim();
		if (given.length < 2 || family.length < 2) {
			toast.error("اسم و فامیل را کامل بنویسید");
			return;
		}
		if (!isIranMobile(phone)) {
			toast.error("شماره موبایل معتبر نیست");
			return;
		}
		const mail = email.trim();
		if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
			toast.error("ایمیل معتبر نیست");
			return;
		}
		setPending(true);
		const res = await createBookingFn({ data: {
			businessId: biz.id,
			serviceId,
			staffId,
			start,
			note,
			firstName: given,
			lastName: family,
			customerPhone: `0${normalizeIranMobile(phone)}`,
			customerEmail: mail,
			idempotencyKey: idempotency()
		} });
		setPending(false);
		if (!res.ok) {
			toast.error(res.error);
			return;
		}
		setReceipt(res.data);
		toast.success("نوبت ثبت شد");
	}
	async function cancelBooking() {
		if (!receipt) return;
		setCanceling(true);
		const res = await setBookingStatusFn({ data: {
			bookingId: receipt.id,
			status: "cancelled",
			reason
		} });
		setCanceling(false);
		if (!res.ok) {
			toast.error(res.error);
			return;
		}
		setReceipt(res.data);
		setAskCancel(false);
		toast.success("نوبت لغو شد");
	}
	if (error && !biz) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
		title: "رزرو ممکن نیست",
		body: error
	}) });
	if (!biz) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64" }) });
	const min = todayYmd(biz.timezone || "Asia/Tehran");
	const max = addDaysYmd(min, biz.maxHorizonDays, biz.timezone || "Asia/Tehran");
	const heading = biz.pageBlocks?.find((item) => item.type === "booking" && item.active !== false)?.title?.trim() || "رزرو نوبت";
	const openSlots = slots.filter((slot) => !slot.taken);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-4 flex items-center justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMark, {
				slug,
				name: biz.name,
				avatar: biz.avatar,
				size: 56
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-extrabold",
					children: heading
				}), biz.isDemo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "copper",
					children: "تمرین با داده نمونه"
				}) : null]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/b/$slug",
			params: { slug },
			className: "text-sm font-semibold text-jade",
			children: "بازگشت به صفحه"
		})]
	}), receipt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-xl font-bold",
			children: receipt.status === "cancelled" ? "نوبت لغو شد" : "نوبت ثبت شد"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
			className: "mt-4 grid gap-2 text-sm leading-7",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted",
						children: "اسمت"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: receipt.customerName || "ثبت نشده" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted",
						children: "شماره‌ت"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						dir: "ltr",
						children: receipt.customerPhone || "ثبت نشده"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted",
						children: "ایمیل"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						dir: "ltr",
						children: receipt.customerEmail?.trim() || "ندارد"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted",
						children: "یادداشت برای کسب‌وکار"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "text-end",
						children: receipt.note?.trim() || "ندارد"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted",
						children: "روز"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: receipt.startsAt ? formatDay(localDay(receipt.startsAt, biz.timezone)) : "" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted",
						children: "ساعت"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: receipt.startsAt ? formatClock(receipt.startsAt, biz.timezone) : "" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted",
						children: "خدمت"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: receipt.serviceName })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted",
						children: "پرسنل"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: receipt.staffName })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted",
						children: "آدرس ما"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "text-end",
						children: biz.address?.trim() || "ثبت نشده"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted",
						children: "شماره ما"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						dir: "ltr",
						children: biz.phone?.trim() || "ثبت نشده"
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm leading-7 text-muted",
			children: "اگر سوالی داشتی با شماره بالا تماس بگیر."
		}),
		receipt.status !== "cancelled" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 border-t border-line pt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-7",
				children: "اگر می‌خواهی نوبتت را لغو کنی، از فرم زیر استفاده کن."
			}), !askCancel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setAskCancel(true),
				className: "mt-3 inline-flex h-11 items-center rounded-full border border-line px-4 text-sm font-semibold",
				children: "لغو نوبت"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold",
						children: "چرا می‌خواهی لغو کنی؟"
					}),
					cancelReasons.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setReason(item),
						className: `min-h-11 rounded-xl border px-3 text-start text-sm ${reason === item ? "border-ink bg-paper" : "border-line"}`,
						children: item
					}, item)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: canceling,
						onClick: () => void cancelBooking(),
						className: "inline-flex h-11 items-center justify-center rounded-full bg-ink px-4 text-sm font-semibold text-on-ink",
						children: canceling ? "در حال لغو" : "لغو نوبت"
					})
				]
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm",
			children: "این نوبت لغو شده است."
		})
	] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stepper, {
				current: step,
				steps: [
					{ label: "خدمت" },
					{ label: "متخصص" },
					{ label: "زمان" },
					{ label: "مشخصات" }
				]
			}),
			step === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-bold",
					children: "خدمت"
				}),
				services.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: "هنوز خدمتی برای رزرو تعریف نشده."
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 grid gap-2",
					children: services.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setServiceId(item.id),
						className: `rounded-xl border px-3 py-3 text-start ${item.id === serviceId ? "border-jade bg-jade-soft" : "border-line"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold",
								children: item.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums",
								children: toman(item.priceToman)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-sm text-muted",
							children: [minutesLabel(item.durationMinutes), item.bufferMinutes ? ` + ${minutesLabel(item.bufferMinutes)} آماده‌سازی` : ""]
						})]
					}, item.id))
				})
			] }) : null,
			step === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-bold",
					children: "متخصص"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: [biz.allowAnyStaff ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: `min-h-11 rounded-full px-4 text-sm ${staffId === null ? "bg-jade text-on-jade" : "border border-line"}`,
						onClick: () => setStaffId(null),
						children: "اولین متخصص آزاد"
					}) : null, staffChoices.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: `min-h-11 rounded-full px-4 text-sm ${staffId === person.id ? "bg-jade text-on-jade" : "border border-line"}`,
						onClick: () => setStaffId(person.id),
						children: person.name
					}, person.id))]
				}),
				staffChoices.length === 0 && !biz.allowAnyStaff ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: "برای این خدمت متخصصی تعریف نشده."
				}) : null
			] }) : null,
			step === 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(JalaliCalendar, {
					value: day || min,
					onChange: setDay,
					min,
					max
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "font-bold",
						children: ["زمان ", day ? formatDay(day) : ""]
					}),
					slotLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-3 h-16" }) : null,
					!slotLoading && slots.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "در این روز وقتی نیست."
					}) : null,
					!slotLoading && slots.length > 0 && openSlots.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "همه وقت‌های این روز گرفته شده."
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4",
						children: slots.map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: slot.taken,
							onClick: () => setStart(slot.start),
							className: `min-h-11 rounded-xl px-1 text-sm tabular-nums ${slot.taken ? "border border-line bg-paper text-muted" : start === slot.start ? "bg-ink text-on-ink" : "border border-line"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: slot.taken ? "line-through" : "",
								children: formatClock(slot.start, biz.timezone)
							}), slot.taken ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 block text-[10px] leading-4 no-underline",
								children: "گرفته‌شده"
							}) : null]
						}, slot.start))
					})
				] })]
			}) : null,
			step === 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-bold",
					children: "مشخصات"
				}),
				service && start ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-muted",
					children: [
						service.name,
						"، ",
						day ? formatDay(day) : "",
						"، ",
						formatClock(start, biz.timezone)
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid gap-3 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "اسم",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							value: firstName,
							maxLength: 40,
							onChange: (event) => setFirstName(event.target.value)
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "فامیل",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							value: lastName,
							maxLength: 40,
							onChange: (event) => setLastName(event.target.value)
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "شماره",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							dir: "ltr",
							className: "text-left",
							inputMode: "tel",
							value: phone,
							maxLength: 15,
							placeholder: "۰۹۱۲xxxxxxx",
							onChange: (event) => setPhone(event.target.value)
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "ایمیل",
						hint: "اختیاری",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							dir: "ltr",
							className: "text-left",
							inputMode: "email",
							value: email,
							maxLength: 120,
							onChange: (event) => setEmail(event.target.value)
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "یادداشت",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							value: note,
							maxLength: 500,
							onChange: (event) => setNote(event.target.value)
						})
					})
				}),
				isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-3 h-11" }) : null,
				!isPending && !user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: "برای ثبت نوبت وارد شوید." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth",
						search: { next: `/b/${slug}/book` },
						className: "inline-flex min-h-11 items-center justify-center rounded-xl bg-ink font-semibold text-on-ink",
						children: "ورود"
					})]
				}) : null
			] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end gap-2",
				children: step < 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [step === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/b/$slug",
					params: { slug },
					className: "inline-flex h-11 items-center justify-center rounded-full border border-line bg-paper px-5 text-sm font-semibold",
					children: "بازگشت"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setStep((value) => value - 1),
					className: "inline-flex h-11 items-center justify-center rounded-full border border-line bg-paper px-5 text-sm font-semibold",
					children: "بازگشت"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						if (step === 0 && !serviceId) {
							toast.error("یک خدمت انتخاب کنید");
							return;
						}
						if (step === 1 && staffId === null && !biz.allowAnyStaff && staffChoices.length === 0) {
							toast.error("متخصصی برای این خدمت نیست");
							return;
						}
						if (step === 2 && !start) {
							toast.error("یک زمان آزاد انتخاب کنید");
							return;
						}
						setStep((value) => value + 1);
					},
					className: "inline-flex h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-on-ink",
					children: "بعدی"
				})] }) : user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: !start || pending,
					onClick: confirm,
					children: pending ? "در حال ثبت" : "ذخیره"
				}) : null
			})
		]
	})] });
}
var IndexRoute = Route$25.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$26
});
var AdminRouteRoute = Route$24.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => Route$26
});
var AuthRoute = Route$23.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$26
});
var ExploreRoute = Route$22.update({
	id: "/explore",
	path: "/explore",
	getParentRoute: () => Route$26
});
var LoginRoute = Route$21.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$26
});
var MeRoute = Route$20.update({
	id: "/me",
	path: "/me",
	getParentRoute: () => Route$26
});
var PanelRouteRoute = Route$19.update({
	id: "/panel",
	path: "/panel",
	getParentRoute: () => Route$26
});
var StartRoute = Route$18.update({
	id: "/start",
	path: "/start",
	getParentRoute: () => Route$26
});
var SupportRoute = Route$17.update({
	id: "/support",
	path: "/support",
	getParentRoute: () => Route$26
});
var AdminIndexRoute = Route$16.update({
	id: "/",
	path: "/",
	getParentRoute: () => AdminRouteRoute
});
var AdminAuditRoute = Route$15.update({
	id: "/audit",
	path: "/audit",
	getParentRoute: () => AdminRouteRoute
});
var AdminBusinessesRoute = Route$14.update({
	id: "/businesses",
	path: "/businesses",
	getParentRoute: () => AdminRouteRoute
});
var AdminCategoriesRoute = Route$13.update({
	id: "/categories",
	path: "/categories",
	getParentRoute: () => AdminRouteRoute
});
var AdminUsersRoute = Route$12.update({
	id: "/users",
	path: "/users",
	getParentRoute: () => AdminRouteRoute
});
var PanelIndexRoute = Route$11.update({
	id: "/",
	path: "/",
	getParentRoute: () => PanelRouteRoute
});
var PanelCalendarRoute = Route$10.update({
	id: "/calendar",
	path: "/calendar",
	getParentRoute: () => PanelRouteRoute
});
var PanelCustomersRoute = Route$9.update({
	id: "/customers",
	path: "/customers",
	getParentRoute: () => PanelRouteRoute
});
var PanelLinksRoute = Route$8.update({
	id: "/links",
	path: "/links",
	getParentRoute: () => PanelRouteRoute
});
var PanelOrdersRoute = Route$7.update({
	id: "/orders",
	path: "/orders",
	getParentRoute: () => PanelRouteRoute
});
var PanelReportsRoute = Route$6.update({
	id: "/reports",
	path: "/reports",
	getParentRoute: () => PanelRouteRoute
});
var PanelServicesRoute = Route$5.update({
	id: "/services",
	path: "/services",
	getParentRoute: () => PanelRouteRoute
});
var PanelSettingsRoute = Route$4.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => PanelRouteRoute
});
var PanelStaffRoute = Route$3.update({
	id: "/staff",
	path: "/staff",
	getParentRoute: () => PanelRouteRoute
});
var BSlugIndexRoute = Route$2.update({
	id: "/b/$slug/",
	path: "/b/$slug/",
	getParentRoute: () => Route$26
});
var BSlugPageRoute = Route$1.update({
	id: "/b/$slug/$page",
	path: "/b/$slug/$page",
	getParentRoute: () => Route$26
});
var BSlugBookRoute = Route.update({
	id: "/b/$slug/book",
	path: "/b/$slug/book",
	getParentRoute: () => Route$26
});
var AdminRouteRouteChildren = {
	AdminAuditRoute,
	AdminBusinessesRoute,
	AdminCategoriesRoute,
	AdminUsersRoute,
	AdminIndexRoute
};
var AdminRouteRouteWithChildren = AdminRouteRoute._addFileChildren(AdminRouteRouteChildren);
var PanelRouteRouteChildren = {
	PanelCalendarRoute,
	PanelCustomersRoute,
	PanelLinksRoute,
	PanelOrdersRoute,
	PanelReportsRoute,
	PanelServicesRoute,
	PanelSettingsRoute,
	PanelStaffRoute,
	PanelIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	AdminRouteRoute: AdminRouteRouteWithChildren,
	PanelRouteRoute: PanelRouteRoute._addFileChildren(PanelRouteRouteChildren),
	AuthRoute,
	ExploreRoute,
	LoginRoute,
	MeRoute,
	StartRoute,
	SupportRoute,
	BSlugPageRoute,
	BSlugBookRoute,
	BSlugIndexRoute
};
var routeTree = Route$26._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		rewrite: previewPathRewrite(),
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { Route$2 as a, Route$23 as c, formatWhen as d, formatIranMobile as f, normalizeIranMobile as h, Route$1 as i, formatClock as l, mobileOperator as m, BookingScreen as n, Route$21 as o, isIranMobile as p, Route as r, Route$22 as s, router_exports as t, formatDay as u };
