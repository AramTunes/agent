import { i as __toESM } from "../_runtime.mjs";
import { E as notificationsFn, S as markReadFn, h as customersFn, p as createBusinessFn, u as categoriesFn } from "./api-vBbERkBq.mjs";
import { C as useNavigate, X as require_jsx_runtime, Z as require_react, m as useRouterState, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as RoundAvatar, r as assignRandomPageAvatar, t as PageMark } from "./page-avatar-BIJU5HCZ.mjs";
import { a as signOut, c as useCurrentUserState, o as useAccount, s as useBusinessId, t as AccountChip } from "./account-CxecnhcZ.mjs";
import { d as TextInput, r as Button, s as Field, v as faNum } from "./ui-CYEMVOYZ.mjs";
import { Dt as Ellipsis, Et as Eye, F as QrCode, I as Plus, Lt as ChevronDown, Mt as ClipboardList, Pt as ChevronsUpDown, Qt as Bell, Rt as Check, U as Palette, Ut as Calendar, Z as Menu, c as UtensilsCrossed, d as UserRound, it as LifeBuoy, j as Search, k as Settings, l as Users, ot as LayoutDashboard, r as X, t as Zap, tt as LogOut, u as User, w as Sparkles, zt as ChartColumn } from "../_libs/lucide-react.mjs";
import { t as focusNav } from "./business-focus-IGUm2XT-.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shell-Dkqa3wbv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KEY = "agent.theme";
var ThemeContext = (0, import_react.createContext)({
	theme: "light",
	setTheme: () => {}
});
function applyTheme(theme) {
	document.documentElement.setAttribute("data-theme", theme);
	const meta = document.querySelector("meta[name=\"theme-color\"]");
	if (meta) meta.setAttribute("content", theme === "dark" ? "#0a0a0a" : "#f7f7f5");
}
function ThemeProvider({ children }) {
	const [theme, setThemeState] = (0, import_react.useState)("light");
	(0, import_react.useEffect)(() => {
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const sync = () => {
			const saved = localStorage.getItem(KEY);
			const next = saved === "light" || saved === "dark" ? saved : media.matches ? "dark" : "light";
			applyTheme(next);
			setThemeState(next);
		};
		sync();
		media.addEventListener("change", sync);
		return () => media.removeEventListener("change", sync);
	}, []);
	const setTheme = (next) => {
		localStorage.setItem(KEY, next);
		applyTheme(next);
		setThemeState(next);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeContext.Provider, {
		value: {
			theme,
			setTheme
		},
		children
	});
}
function useTheme() {
	return (0, import_react.useContext)(ThemeContext);
}
function ThemeSwitch({ className = "" }) {
	const { theme, setTheme } = useTheme();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `grid grid-cols-2 gap-1 rounded-xl bg-paper-deep p-1 ${className}`,
		role: "group",
		"aria-label": "حالت نمایش",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-pressed": theme === "light",
			onClick: () => setTheme("light"),
			className: chip(theme === "light"),
			children: "روشن"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-pressed": theme === "dark",
			onClick: () => setTheme("dark"),
			className: chip(theme === "dark"),
			children: "تیره"
		})]
	});
}
function chip(on) {
	return on ? "min-h-11 rounded-lg bg-card text-sm font-semibold text-ink" : "min-h-11 rounded-lg text-sm font-semibold text-muted";
}
function DashboardHeader({ memberships, businessId, onChoose, onCreated }) {
	const current = memberships.find((item) => item.businessId === businessId) ?? memberships[0];
	const [open, setOpen] = (0, import_react.useState)(false);
	const [creating, setCreating] = (0, import_react.useState)(false);
	const linksPage = useRouterState({ select: (state) => state.location.pathname.startsWith("/panel/links") });
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const onKey = (event) => {
			if (event.key === "Escape") setOpen(false);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open]);
	function linksAction(action) {
		window.dispatchEvent(new CustomEvent("agent-links-action", { detail: action }));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto flex h-16 max-w-6xl items-center justify-between px-3",
				children: [
					linksPage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeaderIcon, {
							label: "تنظیمات صفحه",
							onClick: () => linksAction("settings"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeaderIcon, {
							label: "طراحی صفحه",
							onClick: () => linksAction("design"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Palette, { className: "size-5" })
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "flex items-center gap-2 font-extrabold tracking-tight",
						"aria-label": "ایجنت",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-9 place-items-center rounded-xl bg-jade text-on-jade",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
								className: "size-5",
								"aria-hidden": "true"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: "ایجنت"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: `flex items-center gap-2 rounded-full border border-line bg-card px-2.5 py-1.5 shadow-sm ${linksPage ? "max-w-[42vw]" : "max-w-[70vw]"}`,
							"aria-expanded": open,
							"aria-haspopup": "listbox",
							onClick: () => setOpen((value) => !value),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMark, {
									businessId: current?.businessId,
									slug: current?.slug,
									name: current?.name ?? "کسب‌وکار",
									avatar: current?.avatar
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate text-sm font-bold",
									children: current?.name ?? "بدون کسب‌وکار"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
									className: `size-4 shrink-0 text-muted transition ${open ? "rotate-180" : ""}`,
									"aria-hidden": "true"
								})
							]
						}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute left-1/2 top-[calc(100%+0.5rem)] z-40 w-64 -translate-x-1/2 overflow-hidden rounded-xl border border-line bg-card shadow-xl",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "max-h-64 overflow-y-auto p-1",
								role: "listbox",
								children: memberships.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-start hover:bg-paper",
									onClick: () => {
										onChoose(item.businessId);
										setOpen(false);
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMark, {
											businessId: item.businessId,
											slug: item.slug,
											name: item.name,
											avatar: item.avatar
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "min-w-0 flex-1 truncate text-sm font-semibold",
											children: item.name
										}),
										item.businessId === businessId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
											className: "size-4 shrink-0 text-jade",
											"aria-hidden": "true"
										}) : null
									]
								}) }, item.businessId))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "border-t border-line p-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold hover:bg-paper",
									onClick: () => {
										setOpen(false);
										setCreating(true);
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid size-8 place-items-center rounded-full border border-dashed border-line",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
											className: "size-4",
											"aria-hidden": "true"
										})
									}), "کسب‌وکار جدید"]
								})
							})]
						}) : null]
					}),
					linksPage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeaderIcon, {
							label: "پیش‌نمایش",
							onClick: () => linksAction("preview"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeaderIcon, {
							label: "کد صفحه",
							onClick: () => linksAction("qr"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, { className: "size-5" })
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/support",
						"aria-label": "پشتیبانی",
						className: "absolute left-4 grid size-11 place-items-center text-ink",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LifeBuoy, { className: "size-5" })
					})
				]
			}),
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "fixed inset-0 z-20",
				"aria-label": "بستن فهرست",
				onClick: () => setOpen(false)
			}) : null,
			creating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateBusinessDialog, {
				onClose: () => setCreating(false),
				onDone: (id) => {
					onChoose(id);
					onCreated();
					setCreating(false);
				}
			}) : null
		]
	});
}
function HeaderIcon({ label, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		onClick,
		className: "grid size-10 place-items-center text-ink",
		children
	});
}
function CreateBusinessDialog({ onClose, onDone }) {
	const [categories, setCategories] = (0, import_react.useState)([]);
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		city: "",
		phone: "",
		categoryId: "cat-beauty"
	});
	const [pending, setPending] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		categoriesFn().then((res) => {
			if (res.ok && res.data[0]) {
				setCategories(res.data);
				setForm((current) => ({
					...current,
					categoryId: current.categoryId || res.data[0].id
				}));
			}
		});
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 grid place-items-center p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute inset-0 bg-black/40",
			"aria-label": "بستن",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "relative z-10 grid w-full max-w-md gap-3 rounded-card border border-line bg-card p-5 shadow-xl",
			onSubmit: (event) => {
				event.preventDefault();
				setPending(true);
				createBusinessFn({ data: {
					...form,
					timezone: "Asia/Tehran"
				} }).then((res) => {
					setPending(false);
					if (!res.ok) {
						toast.error(res.error);
						return;
					}
					toast.success("کسب‌وکار ساخته شد");
					assignRandomPageAvatar(res.data.businessId);
					onDone(res.data.businessId);
				});
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-extrabold",
					children: "کسب‌وکار جدید"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "نام",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						value: form.name,
						onChange: (e) => setForm({
							...form,
							name: e.target.value
						}),
						required: true
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "شهر",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						value: form.city,
						onChange: (e) => setForm({
							...form,
							city: e.target.value
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "تلفن",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						dir: "ltr",
						className: "text-left",
						value: form.phone,
						onChange: (e) => setForm({
							...form,
							phone: e.target.value
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "دسته",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: "min-h-11 rounded-xl border border-line bg-card px-3",
						value: form.categoryId,
						onChange: (e) => setForm({
							...form,
							categoryId: e.target.value
						}),
						children: categories.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: cat.id,
							children: cat.name
						}, cat.id))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "quiet",
						onClick: onClose,
						children: "انصراف"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						variant: "signup",
						disabled: pending,
						children: pending ? "در حال ساخت" : "ساخت"
					})]
				})
			]
		})]
	});
}
var nav = [
	{
		id: "dash",
		label: "داشبورد",
		icon: LayoutDashboard,
		to: "/panel",
		exact: true
	},
	{
		id: "page",
		label: "صفحه من",
		icon: UserRound,
		to: "/panel/links"
	},
	{
		id: "bookings",
		label: "نوبت‌ها",
		icon: Calendar,
		to: "/panel/calendar"
	},
	{
		id: "reports",
		label: "گزارشات",
		icon: ChartColumn,
		to: "/panel/reports"
	},
	{
		id: "customers",
		label: "مشتریان",
		icon: Users,
		to: "/panel/customers"
	},
	{
		id: "support",
		label: "پشتیبانی",
		icon: LifeBuoy,
		to: "/support"
	},
	{
		id: "settings",
		label: "تنظیمات",
		icon: Settings,
		to: "/panel/settings"
	}
];
var itemIdle = "flex h-8 items-center gap-2 rounded-md px-2 text-sm text-muted outline-none hover:bg-card hover:text-ink [&_svg]:size-4";
var itemActive = "flex h-8 items-center gap-2 rounded-md bg-card px-2 text-sm font-medium text-ink outline-none [&_svg]:size-4";
var popItem = "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm outline-none hover:bg-paper";
var popDanger = "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm text-danger outline-none hover:bg-danger-soft";
function pageTitle(pathname, memberships, categoryId = "") {
	if (pathname === "/" || pathname === "") return "خانه";
	if (pathname.startsWith("/explore")) return "کسب‌وکارها";
	if (pathname === "/panel" || pathname === "/panel/") return "داشبورد";
	if (pathname.startsWith("/panel/calendar")) return "نوبت‌ها";
	if (pathname.startsWith("/panel/orders")) return focusNav(categoryId).label;
	if (pathname.startsWith("/panel/reports")) return "گزارشات";
	if (pathname.startsWith("/panel/customers")) return "مشتریان";
	if (pathname.startsWith("/panel/settings")) return "تنظیمات";
	if (pathname.startsWith("/panel/links")) return "صفحه من";
	if (pathname.startsWith("/panel/services")) return "خدمات";
	if (pathname.startsWith("/panel/staff")) return "همکاران";
	if (pathname.startsWith("/support")) return "پشتیبانی";
	if (pathname.startsWith("/me")) return "حساب من";
	if (pathname.startsWith("/admin")) return "مدیریت";
	if (pathname.startsWith("/auth") || pathname.startsWith("/login")) return "ورود";
	if (pathname.startsWith("/start")) return "شروع";
	if (pathname.startsWith("/b/")) {
		const decoded = decodeURIComponent(pathname);
		return memberships.some((item) => item.slug && (decoded === `/b/${item.slug}` || decoded.startsWith(`/b/${item.slug}/`))) ? "صفحه من" : "کسب‌وکار";
	}
	return "ایجنت";
}
function DesktopChrome() {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const account = useAccount();
	const { businessId, choose } = useBusinessId(account.me?.memberships);
	const memberships = account.me?.memberships ?? [];
	const current = memberships.find((item) => item.businessId === businessId) ?? memberships[0];
	const title = pageTitle(pathname, memberships, current?.categoryId);
	const dashboard = pathname === "/panel" || pathname === "/panel/";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DesktopSidebar, {
		memberships,
		businessId: current?.businessId ?? "",
		name: account.me?.profile.displayName || "حساب",
		phone: account.me?.profile.phone ?? "",
		image: current?.avatar || account.me?.profile.avatar || "",
		unread: account.me?.unread ?? 0,
		onChoose: (id) => {
			choose(id);
		},
		onCreated: (id) => {
			localStorage.setItem("agent.business", id);
			window.dispatchEvent(new Event("agent-account"));
		}
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DesktopHeader, {
		title,
		dashboard,
		businessId: current?.businessId ?? ""
	})] });
}
function DesktopSidebar({ memberships, businessId, name, phone, image, unread, onChoose, onCreated }) {
	const navigate = useNavigate();
	const current = memberships.find((item) => item.businessId === businessId);
	const [accountsOpen, setAccountsOpen] = (0, import_react.useState)(false);
	const [creating, setCreating] = (0, import_react.useState)(false);
	const [menu, setMenu] = (0, import_react.useState)("");
	const [leaving, setLeaving] = (0, import_react.useState)(false);
	const notesRef = (0, import_react.useRef)(null);
	const userRef = (0, import_react.useRef)(null);
	const accountRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!menu) return;
		const onKey = (event) => {
			if (event.key === "Escape") setMenu("");
		};
		const onPointer = (event) => {
			const node = menu === "notes" ? notesRef.current : userRef.current;
			if (node && !node.contains(event.target)) setMenu("");
		};
		window.addEventListener("keydown", onKey);
		window.addEventListener("mousedown", onPointer);
		return () => {
			window.removeEventListener("keydown", onKey);
			window.removeEventListener("mousedown", onPointer);
		};
	}, [menu]);
	(0, import_react.useEffect)(() => {
		if (!accountsOpen) return;
		const onKey = (event) => {
			if (event.key === "Escape") setAccountsOpen(false);
		};
		const onPointer = (event) => {
			if (accountRef.current && !accountRef.current.contains(event.target)) setAccountsOpen(false);
		};
		window.addEventListener("keydown", onKey);
		window.addEventListener("mousedown", onPointer);
		return () => {
			window.removeEventListener("keydown", onKey);
			window.removeEventListener("mousedown", onPointer);
		};
	}, [accountsOpen]);
	function openAccount(id) {
		onChoose(id);
		setAccountsOpen(false);
		navigate({ to: "/panel" });
	}
	const focus = focusNav(current?.categoryId);
	const items = nav.map((item) => item.id === "bookings" ? {
		...item,
		label: focus.label,
		to: focus.to,
		icon: focus.kind === "hospitality" ? UtensilsCrossed : focus.kind === "orders" ? ClipboardList : Calendar
	} : item);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "fixed inset-y-0 start-0 z-30 hidden w-64 flex-col border-e border-line bg-paper text-ink lg:flex",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative shrink-0 p-2",
				ref: accountRef,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "flex h-12 w-full items-center gap-2 rounded-md px-2 text-start outline-none hover:bg-card",
					"aria-expanded": accountsOpen,
					onClick: () => setAccountsOpen((value) => !value),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMark, {
							businessId: current?.businessId,
							slug: current?.slug,
							name: current?.name ?? "حساب",
							avatar: current?.avatar
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate text-sm font-medium",
								children: current?.name ?? "بدون حساب"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate text-xs text-muted",
								children: "حساب‌ها"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsUpDown, {
							className: "size-4 shrink-0 text-muted",
							"aria-hidden": "true"
						})
					]
				}), accountsOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute inset-x-2 top-14 z-50 rounded-lg border border-line bg-card p-1 shadow-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "max-h-64 overflow-y-auto",
							children: memberships.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: popItem,
								onClick: () => openAccount(item.businessId),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMark, {
										businessId: item.businessId,
										slug: item.slug,
										name: item.name,
										avatar: item.avatar
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "min-w-0 flex-1 truncate",
										children: item.name
									}),
									item.businessId === businessId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
										className: "size-4 shrink-0 text-jade",
										"aria-hidden": "true"
									}) : null
								]
							}) }, item.businessId))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "-mx-1 my-1 h-px bg-line" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: popItem,
							onClick: () => {
								setAccountsOpen(false);
								setCreating(true);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
								className: "size-4 shrink-0",
								"aria-hidden": "true"
							}), "اضافه کردن حساب"]
						})
					]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-2",
				"aria-label": "بخش‌ها",
				children: items.map((item) => {
					const icon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { "aria-hidden": "true" });
					if (item.exact) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: item.to,
						activeOptions: { exact: true },
						className: itemIdle,
						activeProps: { className: itemActive },
						children: [icon, item.label]
					}, item.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: item.to,
						className: itemIdle,
						activeProps: { className: itemActive },
						children: [icon, item.label]
					}, item.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "shrink-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/panel/settings",
							className: "flex items-center gap-3 rounded-xl bg-jade px-3 py-2.5 text-on-jade",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-9 shrink-0 place-items-center rounded-full bg-card text-jade",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, {
									className: "size-4",
									fill: "currentColor",
									"aria-hidden": "true"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-sm font-bold",
									children: "خرید اشتراک"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-0.5 block text-xs opacity-80",
									children: "دسترسی به تمام امکانات"
								})]
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px bg-line" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						ref: notesRef,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "flex w-full items-center gap-2 px-3 py-2.5 text-start hover:bg-card",
							"aria-expanded": menu === "notes",
							onClick: () => setMenu((value) => value === "notes" ? "" : "notes"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-8 shrink-0 place-items-center rounded-md bg-card",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {
									className: "size-4",
									"aria-hidden": "true"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm font-medium",
										children: "اعلان‌ها"
									}), unread > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "inline-flex rounded-full bg-copper px-2 py-0.5 text-xs font-medium text-on-ink",
										children: faNum(unread)
									}) : null]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-0.5 block text-xs text-muted",
									children: unread > 0 ? `${faNum(unread)} خوانده‌نشده` : "همه خوانده شده"
								})]
							})]
						}), menu === "notes" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotesMenu, { onClose: () => setMenu("") }) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px bg-line" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						ref: userRef,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "flex w-full items-center gap-2 px-3 py-2.5 text-start hover:bg-card",
							"aria-expanded": menu === "user",
							"aria-haspopup": "menu",
							onClick: () => setMenu((value) => value === "user" ? "" : "user"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
									name,
									image
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block truncate text-sm font-medium",
										children: name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-0.5 block truncate text-xs text-muted",
										dir: "ltr",
										children: phone ? faNum(phone) : "بدون شماره"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsUpDown, {
									className: "size-4 shrink-0 text-muted",
									"aria-hidden": "true"
								})
							]
						}), menu === "user" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							role: "menu",
							className: "absolute bottom-0 right-full z-50 mr-2 w-56 rounded-lg border border-line bg-card p-1 shadow-md",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 px-2 py-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Avatar, {
										name,
										image
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate text-sm font-medium",
											children: name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate text-xs text-muted",
											dir: "ltr",
											children: phone ? faNum(phone) : "بدون شماره"
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "-mx-1 my-1 h-px bg-line" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/me",
									role: "menuitem",
									className: popItem,
									onClick: () => setMenu(""),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, {
										className: "size-4 shrink-0",
										"aria-hidden": "true"
									}), "تنظیمات حساب"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									role: "menuitem",
									disabled: leaving,
									className: popDanger,
									onClick: () => {
										setLeaving(true);
										signOut();
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, {
										className: "size-4 shrink-0",
										"aria-hidden": "true"
									}), leaving ? "در حال خروج" : "خروج از حساب"]
								})
							]
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px bg-line" })
				]
			}),
			creating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateBusinessDialog, {
				onClose: () => setCreating(false),
				onDone: (id) => {
					setCreating(false);
					onCreated(id);
					navigate({ to: "/panel" });
				}
			}) : null
		]
	});
}
function NotesMenu({ onClose }) {
	const [notes, setNotes] = (0, import_react.useState)(null);
	function load() {
		notificationsFn().then((res) => {
			setNotes(res.ok ? res.data : []);
		});
	}
	(0, import_react.useEffect)(() => {
		load();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute bottom-0 right-full z-50 mr-2 flex w-64 flex-col rounded-lg border border-line bg-card p-1 shadow-md",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-2 py-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-medium text-muted",
					children: "اعلان‌ها"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-xs font-medium text-jade",
					onClick: () => {
						markReadFn({ data: {} }).then(() => {
							load();
							window.dispatchEvent(new Event("agent-account"));
						});
					},
					children: "خواندم"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "-mx-1 my-1 h-px bg-line" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "grid max-h-80 overflow-y-auto",
				children: [
					notes === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "px-2 py-1.5 text-sm text-muted",
						children: "در حال خواندن…"
					}) : null,
					notes && notes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "px-2 py-1.5 text-sm text-muted",
						children: "اعلانی نیست."
					}) : null,
					notes?.map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: `rounded-md px-2 py-1.5 ${note.read ? "text-muted" : "bg-paper"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-medium",
							children: note.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-xs leading-5",
							children: note.body
						})]
					}, note.id))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "-mx-1 my-1 h-px bg-line" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/me",
				className: popItem,
				onClick: onClose,
				children: "همه اعلان‌ها"
			})
		]
	});
}
function DesktopHeader({ title, dashboard, businessId }) {
	const navigate = useNavigate();
	const [q, setQ] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [hits, setHits] = (0, import_react.useState)([]);
	const box = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!dashboard) return;
		const query = q.trim();
		if (!businessId || query.length < 2) {
			setHits([]);
			return;
		}
		let live = true;
		const timer = window.setTimeout(() => {
			customersFn({ data: {
				businessId,
				q: query
			} }).then((res) => {
				if (!live) return;
				setHits(res.ok ? res.data.slice(0, 6) : []);
			});
		}, 250);
		return () => {
			live = false;
			window.clearTimeout(timer);
		};
	}, [
		q,
		businessId,
		dashboard
	]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const onPointer = (event) => {
			if (box.current && !box.current.contains(event.target)) setOpen(false);
		};
		window.addEventListener("mousedown", onPointer);
		return () => window.removeEventListener("mousedown", onPointer);
	}, [open]);
	function go(query) {
		const next = query.trim();
		if (!next) return;
		sessionStorage.setItem("agent.customers.q", next);
		setOpen(false);
		setQ("");
		navigate({ to: "/panel/customers" });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-20 hidden h-14 items-center gap-3 border-b border-line bg-paper/95 px-4 backdrop-blur lg:flex",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "shrink-0 text-sm font-medium",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex min-w-0 flex-1 justify-center",
				children: dashboard ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative w-full max-w-md",
					ref: box,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: (event) => {
							event.preventDefault();
							go(q);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
							className: "pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							value: q,
							onChange: (event) => {
								setQ(event.target.value);
								setOpen(true);
							},
							onFocus: () => setOpen(true),
							placeholder: "جست‌وجوی نام یا تلفن",
							"aria-label": "جست‌وجو",
							className: "h-8 min-h-8 rounded-lg bg-card ps-8"
						})]
					}), open && q.trim().length >= 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "absolute inset-x-0 top-full z-30 mt-1.5 rounded-lg border border-line bg-card p-1 shadow-md",
						children: [hits.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "px-2 py-1.5 text-sm text-muted",
							children: "مشتری‌ای پیدا نشد"
						}) : null, hits.map((hit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: popItem,
							onClick: () => go(hit.name),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "min-w-0 flex-1 truncate",
								children: hit.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "shrink-0 text-xs text-muted",
								dir: "ltr",
								children: hit.phone ? faNum(hit.phone) : ""
							})]
						}) }, hit.id))]
					}) : null]
				}) : null
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/support",
				className: "inline-flex h-8 shrink-0 items-center gap-2 rounded-full px-2.5 text-sm font-medium",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LifeBuoy, {
					className: "size-4 text-jade",
					"aria-hidden": "true"
				}), "پشتیبانی"]
			})
		]
	});
}
function Avatar({ name, image }) {
	if (image) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoundAvatar, {
		value: image,
		size: 32
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoundAvatar, {
		value: `beam:${name || "user"}`,
		size: 32
	});
}
var links = [
	{
		to: "/explore",
		label: "کسب‌وکارها"
	},
	{
		to: "/me",
		label: "نوبت‌های من"
	},
	{
		to: "/panel",
		label: "پنل کسب‌وکار"
	}
];
function Shell({ children, header }) {
	const { user } = useCurrentUserState();
	const [menuOpen, setMenuOpen] = (0, import_react.useState)(false);
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	(0, import_react.useEffect)(() => {
		setMenuOpen(false);
	}, [pathname]);
	(0, import_react.useEffect)(() => {
		if (!menuOpen) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const onKey = (event) => {
			if (event.key === "Escape") setMenuOpen(false);
		};
		window.addEventListener("keydown", onKey);
		return () => {
			document.body.style.overflow = prev;
			window.removeEventListener("keydown", onKey);
		};
	}, [menuOpen]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `min-h-dvh ${user ? "lg:ps-64" : ""}`,
		children: [
			user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DesktopChrome, {}) : null,
			header ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: user ? "lg:hidden" : void 0,
				children: header
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: `sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur ${user ? "lg:hidden" : ""}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "flex items-center gap-2 font-extrabold tracking-tight",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-9 place-items-center rounded-xl bg-jade text-on-jade",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, {
									className: "size-5",
									"aria-hidden": "true"
								})
							}), "ایجنت"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
							className: user ? "hidden" : "hidden flex-1 items-center gap-1 text-sm md:flex",
							children: [links.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: link.to,
								className: "shrink-0 rounded-lg px-3 py-2 text-muted hover:bg-card hover:text-ink",
								children: link.label
							}, link.to)), user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/admin",
								className: "shrink-0 rounded-lg px-3 py-2 text-muted hover:bg-card hover:text-ink",
								activeProps: { className: "shrink-0 rounded-lg bg-card px-3 py-2 font-semibold text-ink" },
								children: "مدیریت"
							}) : null]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: user ? "hidden" : "hidden items-center gap-2 md:flex",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeSwitch, { className: "w-40" }), user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/me",
								"aria-label": "اعلان‌ها",
								className: "grid size-11 place-items-center rounded-xl hover:bg-card",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountChip, {})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StartFreeLink, { className: "px-3 text-sm" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginLink, {})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: user ? "flex items-center gap-2" : "flex items-center gap-2 md:hidden",
							dir: "ltr",
							children: [
								user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "grid size-11 place-items-center rounded-xl border border-line bg-card text-ink",
									"aria-label": "منو",
									"aria-expanded": menuOpen,
									onClick: () => setMenuOpen(true),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "site-menu",
										type: "checkbox",
										className: "peer sr-only"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										htmlFor: "site-menu",
										className: "grid size-11 cursor-pointer place-items-center rounded-xl border border-line bg-card text-ink",
										"aria-label": "منو",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "invisible fixed inset-0 z-40 peer-checked:visible",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											htmlFor: "site-menu",
											className: "absolute inset-0 bg-black/40",
											"aria-label": "بستن منو"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
											className: "absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col border-r border-line bg-paper shadow-2xl",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between border-b border-line px-4 py-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-extrabold",
														children: "منو"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
														htmlFor: "site-menu",
														className: "grid size-11 cursor-pointer place-items-center rounded-xl hover:bg-card",
														"aria-label": "بستن",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
													className: "flex flex-1 flex-col gap-1 overflow-y-auto p-3",
													children: links.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
														href: link.to,
														className: "rounded-xl px-3 py-3 text-base text-muted hover:bg-card hover:text-ink",
														children: link.label
													}, link.to))
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid gap-3 border-t border-line p-4",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "mb-2 text-xs font-semibold text-muted",
															children: "حالت نمایش"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeSwitch, {})] }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginLink, { className: "w-full justify-center" }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StartFreeLink, {
															full: true,
															className: "px-4 text-sm"
														})
													]
												})
											]
										})]
									})
								] }),
								!user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginLink, {}) : null,
								user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/me",
									"aria-label": "اعلان‌ها",
									className: "grid size-11 place-items-center rounded-xl border border-line bg-card",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-5" })
								}) : null
							]
						})
					]
				})
			}),
			!header && menuOpen && user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `fixed inset-0 z-40 ${user ? "lg:hidden" : "md:hidden"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "absolute inset-0 bg-black/40",
					"aria-label": "بستن منو",
					onClick: () => setMenuOpen(false)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "drawer-left absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col border-r border-line bg-paper shadow-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between border-b border-line px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-extrabold",
								children: "منو"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "grid size-11 place-items-center rounded-xl hover:bg-card",
								"aria-label": "بستن",
								onClick: () => setMenuOpen(false),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
							className: "flex flex-1 flex-col gap-1 overflow-y-auto p-3",
							children: [links.map((link) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: link.to,
								className: "rounded-xl px-3 py-3 text-base text-muted hover:bg-card hover:text-ink",
								activeProps: { className: "rounded-xl bg-card px-3 py-3 text-base font-semibold text-ink" },
								onClick: () => setMenuOpen(false),
								children: link.label
							}, link.to)), user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/admin",
								className: "rounded-xl px-3 py-3 text-base text-muted hover:bg-card hover:text-ink",
								activeProps: { className: "rounded-xl bg-card px-3 py-3 text-base font-semibold text-ink" },
								onClick: () => setMenuOpen(false),
								children: "مدیریت"
							}) : null]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 border-t border-line p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-2 text-xs font-semibold text-muted",
								children: "حالت نمایش"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeSwitch, {})] }), !user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginLink, { className: "w-full justify-center" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StartFreeLink, {
								full: true,
								className: "px-4 text-sm"
							})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountChip, {})]
						})
					]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: `mx-auto w-full max-w-6xl px-4 py-6 ${user ? "pb-28 lg:max-w-none lg:px-6 lg:pb-8" : ""}`,
				children
			}),
			user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileDock, {}) : null
		]
	});
}
function LoginLink({ className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
		href: "/auth",
		className: `inline-flex min-h-11 shrink-0 items-center rounded-xl border border-line bg-card px-4 text-sm font-semibold text-ink ${className}`,
		children: "ورود"
	});
}
function StartFreeLink({ className = "", full = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		href: "/start",
		className: `relative inline-flex min-h-11 shrink-0 overflow-hidden rounded-xl p-px ${full ? "w-full" : ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			"aria-hidden": true,
			className: "pointer-events-none absolute inset-[-100%]",
			style: {
				background: "conic-gradient(from var(--beam-angle), transparent 0 74%, var(--color-jade) 86%, var(--color-on-jade) 94%, transparent 100%)",
				animation: "beam 4s linear infinite"
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `relative z-[1] inline-flex min-h-[calc(2.75rem-2px)] items-center justify-center rounded-[0.7rem] border border-line font-semibold ${full ? "w-full" : ""} ${className}`,
			style: {
				background: "var(--start-bg)",
				color: "var(--start-fg)"
			},
			children: "شروع رایگان"
		})]
	});
}
function Subnav({ items, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `mb-5 flex gap-2 overflow-x-auto pb-1 ${className}`,
		children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: item.to,
			activeOptions: { exact: Boolean(item.exact) },
			className: "shrink-0 rounded-full border border-line bg-card px-4 py-2 text-sm",
			activeProps: { className: "shrink-0 rounded-full bg-jade px-4 py-2 text-sm font-semibold text-on-jade" },
			children: item.label
		}, item.to + item.label))
	});
}
var moreLinks = [
	{
		to: "/panel/customers",
		label: "مشتریان"
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
		to: "/panel/settings",
		label: "تنظیمات"
	},
	{
		to: "/support",
		label: "پشتیبانی"
	}
];
function dockTab(pathname) {
	if (pathname === "/panel" || pathname === "/panel/") return "dash";
	if (pathname.startsWith("/panel/links")) return "page";
	if (pathname.startsWith("/panel/calendar") || pathname.startsWith("/panel/orders")) return "bookings";
	if (pathname.startsWith("/panel/reports")) return "reports";
	if (moreLinks.some((item) => pathname === item.to || pathname.startsWith(`${item.to}/`))) return "more";
	return "";
}
function MobileDock() {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const account = useAccount();
	const { businessId } = useBusinessId(account.me?.memberships);
	const categoryId = account.me?.memberships.find((item) => item.businessId === businessId)?.categoryId;
	const focus = focusNav(categoryId);
	const [more, setMore] = (0, import_react.useState)(false);
	const current = dockTab(pathname);
	(0, import_react.useEffect)(() => {
		setMore(false);
	}, [pathname]);
	const items = [
		{
			id: "dash",
			label: "داشبورد",
			icon: LayoutDashboard,
			to: "/panel"
		},
		{
			id: "page",
			label: "صفحه من",
			icon: User,
			to: "/panel/links"
		},
		{
			id: "bookings",
			label: focus.label,
			icon: focus.kind === "hospitality" ? UtensilsCrossed : focus.kind === "orders" ? ClipboardList : Calendar,
			to: focus.to
		},
		{
			id: "reports",
			label: "گزارشات",
			icon: ChartColumn,
			to: "/panel/reports"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [more ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-40 lg:hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute inset-0 bg-black/40",
			"aria-label": "بستن",
			onClick: () => setMore(false)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-x-3 bottom-24 grid gap-1 rounded-3xl border border-line bg-card p-2 shadow-xl",
			children: moreLinks.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: item.to,
				className: "rounded-2xl px-4 py-3 text-sm font-semibold",
				onClick: () => setMore(false),
				children: item.label
			}, item.to))
		})]
	}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
		className: "fixed inset-x-3 z-40 grid grid-cols-5 rounded-full border border-line bg-card/95 px-1 py-1.5 shadow-lg backdrop-blur lg:hidden",
		style: { bottom: "max(0.75rem, env(safe-area-inset-bottom))" },
		children: [items.map((item) => {
			const active = current === item.id;
			const icon = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
				className: "size-5",
				strokeWidth: active ? 2.25 : 1.75
			});
			const className = `flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] ${active ? "font-bold text-ink" : "font-medium text-muted"}`;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: item.to,
				className,
				children: [icon, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "max-w-full px-0.5 text-center text-[11px] leading-3",
					children: item.label
				})]
			}, item.id);
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: `flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] ${current === "more" ? "font-bold text-ink" : "font-medium text-muted"}`,
			onClick: () => setMore((value) => !value),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, {
				className: "size-5",
				strokeWidth: current === "more" ? 2.25 : 1.75
			}), "بیشتر"]
		})]
	})] });
}
//#endregion
export { ThemeProvider as a, Subnav as i, Shell as n, StartFreeLink as r, DashboardHeader as t };
