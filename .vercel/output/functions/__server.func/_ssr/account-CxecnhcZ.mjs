import { i as __toESM } from "../_runtime.mjs";
import { C as meFn, J as writeToken, W as updateBusinessFn, k as readToken } from "./api-vBbERkBq.mjs";
import { X as require_jsx_runtime, Z as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as fitAvatar, n as RoundAvatar, s as readPageAvatar } from "./page-avatar-BIJU5HCZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account-CxecnhcZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SessionContext = (0, import_react.createContext)({
	user: null,
	isPending: true
});
var USER_KEY = "agent.user";
function readCachedUser() {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(USER_KEY);
		if (!raw) return null;
		const user = JSON.parse(raw);
		if (!user || typeof user.id !== "string") return null;
		return user;
	} catch {
		return null;
	}
}
function writeCachedUser(user) {
	if (typeof window === "undefined") return;
	try {
		if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
		else localStorage.removeItem(USER_KEY);
	} catch {}
}
function SessionProvider({ children }) {
	const [state, setState] = (0, import_react.useState)({
		user: null,
		isPending: true
	});
	(0, import_react.useEffect)(() => {
		let live = true;
		const token = readToken();
		const cached = token ? readCachedUser() : null;
		if (!token) {
			writeCachedUser(null);
			setState({
				user: null,
				isPending: false
			});
			return;
		}
		if (cached) setState({
			user: cached,
			isPending: false
		});
		fetch("/api/v1/session", { headers: { authorization: `Bearer ${token}` } }).then((res) => res.json()).then((json) => {
			if (!live) return;
			const user = json?.ok ? json.data?.user ?? null : null;
			if (!user) writeToken(null);
			writeCachedUser(user);
			setState({
				user,
				isPending: false
			});
		}).catch(() => {
			if (live) setState({
				user: cached,
				isPending: false
			});
		});
		return () => {
			live = false;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const refresh = () => {
			const token = readToken();
			if (!token) return;
			fetch("/api/v1/session", { headers: { authorization: `Bearer ${token}` } }).then((res) => res.json()).then((json) => {
				const user = json?.ok ? json.data?.user ?? null : null;
				if (user) {
					writeCachedUser(user);
					setState({
						user,
						isPending: false
					});
				}
			}).catch(() => void 0);
		};
		window.addEventListener("agent-avatar", refresh);
		return () => window.removeEventListener("agent-avatar", refresh);
	}, []);
	const value = (0, import_react.useMemo)(() => state, [state]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SessionContext.Provider, {
		value,
		children
	});
}
function useCurrentUserState() {
	return (0, import_react.useContext)(SessionContext);
}
function useCurrentUser() {
	return useCurrentUserState().user;
}
async function adoptSession(token) {
	writeToken(token);
}
async function signOut() {
	const token = readToken();
	writeToken(null);
	writeCachedUser(null);
	try {
		await fetch("/api/v1/auth/signout", {
			method: "POST",
			headers: token ? { authorization: `Bearer ${token}` } : {}
		});
	} catch {}
	window.location.assign("/");
}
function AccountChip() {
	const user = useCurrentUser();
	const [pending, setPending] = (0, import_react.useState)(false);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "حساب";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoundAvatar, {
				value: user.profileImageUrl,
				size: 32
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoundAvatar, {
				value: `beam:${label}`,
				size: 32
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden max-w-28 truncate text-sm font-medium sm:inline",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: pending,
				onClick: () => {
					setPending(true);
					signOut();
				},
				className: "text-sm text-muted",
				children: pending ? "…" : "خروج"
			})
		]
	});
}
function useAccount() {
	const { user, isPending } = useCurrentUserState();
	const [me, setMe] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [nonce, setNonce] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (isPending) return;
		if (!user) {
			setLoading(false);
			return;
		}
		let live = true;
		meFn().then((res) => {
			if (!live) return;
			if (res.ok) setMe(res.data);
			else setError(res.error);
			setLoading(false);
		});
		return () => {
			live = false;
		};
	}, [
		user?.id,
		isPending,
		nonce
	]);
	(0, import_react.useEffect)(() => {
		if (!me) return;
		let cancel = false;
		(async () => {
			let changed = false;
			for (const item of me.memberships) {
				const local = readPageAvatar(item.businessId, item.slug);
				if (!local.startsWith("data:") || item.avatar) continue;
				const avatar = await fitAvatar(local);
				if (cancel || !avatar) continue;
				if ((await updateBusinessFn({ data: {
					businessId: item.businessId,
					avatar
				} })).ok) changed = true;
			}
			if (!cancel && changed) {
				window.dispatchEvent(new Event("agent-avatar"));
				window.dispatchEvent(new Event("agent-account"));
			}
		})();
		return () => {
			cancel = true;
		};
	}, [me]);
	(0, import_react.useEffect)(() => {
		const onReload = () => {
			setLoading(true);
			setNonce((n) => n + 1);
		};
		window.addEventListener("agent-account", onReload);
		return () => window.removeEventListener("agent-account", onReload);
	}, []);
	return {
		user,
		isPending,
		me,
		error,
		loading,
		reload: () => {
			setLoading(true);
			setNonce((n) => n + 1);
		}
	};
}
function useBusinessId(memberships) {
	const [businessId, setBusinessId] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!memberships?.length) {
			setBusinessId("");
			return;
		}
		const saved = typeof window !== "undefined" ? localStorage.getItem("agent.business") ?? "" : "";
		const next = memberships.some((item) => item.businessId === saved) ? saved : memberships[0].businessId;
		setBusinessId(next);
	}, [memberships]);
	(0, import_react.useEffect)(() => {
		function sync() {
			if (!memberships?.length) return;
			const saved = localStorage.getItem("agent.business") ?? "";
			if (memberships.some((item) => item.businessId === saved)) setBusinessId(saved);
		}
		window.addEventListener("agent-business", sync);
		return () => window.removeEventListener("agent-business", sync);
	}, [memberships]);
	function choose(next) {
		localStorage.setItem("agent.business", next);
		setBusinessId(next);
		window.dispatchEvent(new Event("agent-business"));
	}
	return {
		businessId,
		choose
	};
}
var PanelState = (0, import_react.createContext)({
	businessId: "",
	memberships: [],
	displayName: "",
	pageFor: "",
	pageName: ""
});
function usePanel() {
	return (0, import_react.useContext)(PanelState);
}
//#endregion
export { signOut as a, useCurrentUserState as c, adoptSession as i, usePanel as l, PanelState as n, useAccount as o, SessionProvider as r, useBusinessId as s, AccountChip as t };
