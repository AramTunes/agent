import { i as __toESM } from "../_runtime.mjs";
import { c as businessBookingsFn, g as dashboardFn, m as createDemoFn, p as createBusinessFn, u as categoriesFn, x as manageBusinessFn } from "./api-vBbERkBq.mjs";
import { X as require_jsx_runtime, Z as require_react, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as assignRandomPageAvatar, t as PageMark } from "./page-avatar-BIJU5HCZ.mjs";
import { l as usePanel } from "./account-CxecnhcZ.mjs";
import { b as toman, d as TextInput, f as STATUS_FA, i as Card, l as Skeleton, m as clockLabel, p as WEEKDAYS_FA, r as Button, s as Field, v as faNum } from "./ui-CYEMVOYZ.mjs";
import { F as QrCode, It as ChevronLeft, V as PenLine, Wt as CalendarPlus, it as LifeBuoy, k as Settings, l as Users, rt as Link2, zt as ChartColumn } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as jalaliMonthName, l as zonedCivilToUtc, n as civilInZone, r as gregorianToJalali, s as todayYmd, t as addDaysYmd } from "./time-BneIW53_.mjs";
import { t as AnimatedTabs } from "./animated-tabs-B0-uRxFM.mjs";
import { n as ScrollArea, t as QrDialog } from "./qr-share-ptNirTZ7.mjs";
import { t as DualSpark } from "./sparkline-BNoHwVfd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/panel-Dx2c3kkD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProgressRing({ value, size = 48, stroke = 5, label }) {
	const ref = (0, import_react.useRef)(null);
	const pct = Math.max(0, Math.min(100, Math.round(value)));
	const radius = (size - stroke) / 2;
	const turn = 2 * Math.PI * radius;
	const [shown, setShown] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const node = ref.current;
		if (!node || typeof IntersectionObserver === "undefined") {
			setShown(pct);
			return;
		}
		const watcher = new IntersectionObserver(([entry]) => {
			if (!entry?.isIntersecting) return;
			setShown(pct);
			watcher.disconnect();
		});
		watcher.observe(node);
		return () => watcher.disconnect();
	}, [pct]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		ref,
		className: "relative inline-flex shrink-0 items-center justify-center",
		style: {
			width: size,
			height: size
		},
		role: "progressbar",
		"aria-valuenow": pct,
		"aria-valuemin": 0,
		"aria-valuemax": 100,
		"aria-label": label ?? `${faNum(pct)} درصد`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			width: size,
			height: size,
			className: "-rotate-90",
			"aria-hidden": "true",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: size / 2,
				cy: size / 2,
				r: radius,
				fill: "none",
				stroke: "var(--line)",
				strokeWidth: stroke
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: size / 2,
				cy: size / 2,
				r: radius,
				fill: "none",
				stroke: "var(--jade)",
				strokeWidth: stroke,
				strokeLinecap: "round",
				strokeDasharray: turn,
				strokeDashoffset: turn - turn * shown / 100,
				className: "transition-[stroke-dashoffset] duration-1000 ease-out"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "absolute text-xs font-bold tabular-nums",
			children: [faNum(shown), "٪"]
		})]
	});
}
var HOUR = 48;
function WeekBoard({ businessId, timezone, weekly }) {
	const zone = timezone || "Asia/Tehran";
	const today = todayYmd(zone);
	const days = weekDays(zone);
	const [day, setDay] = (0, import_react.useState)(today);
	const [rows, setRows] = (0, import_react.useState)(null);
	const body = (0, import_react.useRef)(null);
	const selected = days.find((item) => item.ymd === day) ?? days[0];
	const index = Math.max(0, days.findIndex((item) => item.ymd === selected.ymd));
	(0, import_react.useEffect)(() => {
		let live = true;
		setRows(null);
		businessBookingsFn({ data: {
			businessId,
			day
		} }).then((res) => {
			if (!live) return;
			setRows(res.ok ? res.data : []);
		});
		return () => {
			live = false;
		};
	}, [businessId, day]);
	const visible = (rows ?? []).filter((row) => row.status !== "cancelled");
	const range = rangeFor(weekly, selected.weekday, visible, zone);
	const nowCivil = civilInZone(/* @__PURE__ */ new Date(), zone);
	const nowMin = nowCivil.hour * 60 + nowCivil.minute;
	(0, import_react.useEffect)(() => {
		const node = body.current;
		if (!node || !range || day !== today) return;
		node.scrollTop = Math.max(0, (nowMin / 60 - range.startHour - 1) * HOUR);
	}, [
		day,
		today,
		range?.startHour,
		nowMin,
		rows
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "min-w-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-extrabold",
				children: "امروز و هفته پیش رو"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayTabs, {
				days,
				index,
				onPick: (next) => setDay(days[next]?.ymd ?? day)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 overflow-hidden rounded-lg border border-line",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex border-b border-line",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-14 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `flex min-w-0 flex-1 flex-col items-center border-s border-line px-2 py-1.5 ${selected.weekday === 5 ? "bg-danger-soft" : ""}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted",
								children: selected.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-semibold",
								children: selected.date
							})]
						})]
					}),
					rows === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "m-3 h-40" }) : null,
					rows && !range ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-3 py-6 text-sm text-muted",
						children: "ساعت کاری این روز تنظیم نشده."
					}) : null,
					rows && range ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
						ref: body,
						className: "max-h-96",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayGrid, {
							startHour: range.startHour,
							endHour: range.endHour,
							events: place(visible, zone),
							friday: selected.weekday === 5,
							nowTop: day === today && nowMin >= range.startHour * 60 && nowMin <= range.endHour * 60 ? (nowMin - range.startHour * 60) / 60 * HOUR : null
						})
					}) : null
				]
			})
		]
	});
}
function DayTabs({ days, index, onPick }) {
	const scroller = (0, import_react.useRef)(null);
	const [more, setMore] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const node = scroller.current;
		if (!node) return;
		const update = () => {
			const max = node.scrollWidth - node.clientWidth;
			setMore(max - Math.abs(node.scrollLeft) > 8);
		};
		update();
		node.addEventListener("scroll", update, { passive: true });
		const watcher = new ResizeObserver(update);
		watcher.observe(node);
		return () => {
			node.removeEventListener("scroll", update);
			watcher.disconnect();
		};
	}, [days.length]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mt-3 min-w-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: scroller,
			className: "w-full min-w-0 max-lg:overflow-x-auto max-lg:overscroll-x-contain max-lg:[scrollbar-width:none] max-lg:[&::-webkit-scrollbar]:hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedTabs, {
				className: "bg-card",
				items: days.map((item) => ({
					label: item.name,
					hint: item.date
				})),
				value: index,
				onChange: onPick
			})
		}), more ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"aria-hidden": "true",
			className: "pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-card to-transparent lg:hidden"
		}) : null]
	});
}
function DayGrid({ startHour, endHour, events, friday, nowTop }) {
	const hours = Array.from({ length: endHour - startHour }, (_, index) => startHour + index);
	const height = hours.length * HOUR;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex",
		style: { height },
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative w-14 shrink-0",
			"aria-hidden": "true",
			children: hours.map((hour, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute inset-x-0 -translate-y-1/2 text-center text-xs text-muted tabular-nums",
				style: { top: index * HOUR },
				children: index === 0 ? "" : clockLabel(hour * 60)
			}, hour))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: `relative flex-1 border-s border-line ${friday ? "bg-danger-soft/60" : ""}`,
			style: { backgroundImage: `repeating-linear-gradient(to bottom, var(--line) 0 1px, transparent 1px ${HOUR}px)` },
			children: [events.map((event) => {
				const top = (event.start - startHour * 60) / 60 * HOUR;
				const block = Math.max(22, (event.end - event.start) / 60 * HOUR - 2);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute px-0.5",
					style: {
						top,
						height: block,
						insetInlineStart: `${event.col / event.cols * 100}%`,
						width: `${100 / event.cols}%`
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex h-full flex-col overflow-hidden rounded-md border-s-2 border-jade bg-jade-soft px-1.5 py-0.5 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate font-semibold",
							children: event.customerName
						}), block > 36 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "truncate text-muted",
							children: [
								event.serviceName,
								" · ",
								clockLabel(event.start),
								" · ",
								STATUS_FA[event.status] ?? event.status
							]
						}) : null]
					})
				}, event.id);
			}), nowTop != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute inset-x-0 z-10 flex items-center",
				style: { top: nowTop },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full bg-danger px-1 text-xs font-medium text-on-ink",
					children: "الان"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-danger" })]
			}) : null]
		})]
	});
}
function weekDays(zone) {
	const today = todayYmd(zone);
	const weekday = civilInZone(zonedCivilToUtc({
		...parts(today),
		hour: 12,
		minute: 0
	}, zone), zone).weekday;
	const start = addDaysYmd(today, -((weekday + 1) % 7), zone);
	return Array.from({ length: 7 }, (_, index) => {
		const ymd = addDaysYmd(start, index, zone);
		const civil = civilInZone(zonedCivilToUtc({
			...parts(ymd),
			hour: 12,
			minute: 0
		}, zone), zone);
		const jalali = gregorianToJalali(civil.year, civil.month, civil.day);
		return {
			ymd,
			weekday: civil.weekday,
			name: WEEKDAYS_FA[civil.weekday],
			date: `${faNum(jalali.jd)} ${jalaliMonthName(jalali.jm)}`
		};
	});
}
function parts(ymd) {
	const [year, month, day] = ymd.split("-").map(Number);
	return {
		year,
		month,
		day
	};
}
function minutesOf(iso, zone) {
	const civil = civilInZone(new Date(iso), zone);
	return civil.hour * 60 + civil.minute;
}
function rangeFor(weekly, weekday, rows, zone) {
	const spans = weekly.filter((item) => item.weekday === weekday);
	let startHour = spans.length ? Math.floor(Math.min(...spans.map((item) => item.startMin)) / 60) : null;
	let endHour = spans.length ? Math.ceil(Math.max(...spans.map((item) => item.endMin)) / 60) : null;
	for (const row of rows) {
		const start = minutesOf(row.startsAt, zone);
		let end = row.endsAt ? minutesOf(row.endsAt, zone) : start + (row.durationMinutes || 30);
		if (end <= start) end = start + (row.durationMinutes || 30);
		startHour = startHour == null ? Math.floor(start / 60) : Math.min(startHour, Math.floor(start / 60));
		endHour = endHour == null ? Math.ceil(end / 60) : Math.max(endHour, Math.ceil(end / 60));
	}
	if (startHour == null || endHour == null || endHour <= startHour) return null;
	return {
		startHour,
		endHour
	};
}
function place(rows, zone) {
	const sorted = rows.map((row) => {
		const start = minutesOf(row.startsAt, zone);
		let end = row.endsAt ? minutesOf(row.endsAt, zone) : start + (row.durationMinutes || 30);
		if (end <= start) end = start + (row.durationMinutes || 30);
		return {
			...row,
			start,
			end,
			col: 0,
			cols: 1
		};
	}).sort((a, b) => a.start - b.start || a.end - b.end);
	let cluster = [];
	let clusterEnd = -1;
	function flush() {
		const columns = [];
		for (const event of cluster) {
			let col = 0;
			while (columns[col]?.some((other) => other.start < event.end && event.start < other.end)) col += 1;
			(columns[col] ??= []).push(event);
			event.col = col;
		}
		const count = Math.max(columns.length, 1);
		for (const event of cluster) event.cols = count;
		cluster = [];
	}
	for (const event of sorted) {
		if (cluster.length && event.start >= clusterEnd) flush();
		cluster.push(event);
		clusterEnd = Math.max(clusterEnd, event.end);
	}
	if (cluster.length) flush();
	return sorted;
}
function tehranMinutes(now = /* @__PURE__ */ new Date()) {
	const parts = new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		minute: "numeric",
		hourCycle: "h23",
		timeZone: "Asia/Tehran"
	}).formatToParts(now);
	const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
	const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
	return hour * 60 + minute;
}
function greeting(now = /* @__PURE__ */ new Date()) {
	const hour = Math.floor(tehranMinutes(now) / 60);
	if (hour >= 5 && hour < 12) return "صبح بخیر";
	if (hour >= 12 && hour < 15) return "ظهر بخیر";
	if (hour >= 15 && hour < 19) return "عصر بخیر";
	return "شب بخیر";
}
function firstName(full) {
	return full.trim().split(/\s+/)[0] || "کاربر";
}
var zeros = Array.from({ length: 30 }, () => 0);
var emptySeries = {
	views: zeros,
	visitors: zeros,
	sales: zeros,
	revenue: zeros
};
var emptyStats = {
	views: 0,
	visitors: 0,
	clicks: 0,
	booked: 0,
	cancelled: 0,
	completed: 0,
	sales: 0,
	revenueToman: 0,
	prevViews: 0,
	prevRevenueToman: 0
};
function rate(part, whole) {
	if (whole <= 0) return "۰٪";
	return `${faNum(Math.round(part / whole * 100))}٪`;
}
function monthChange(current, previous) {
	if (current === previous) return {
		text: "بدون تغییر نسبت به ماه قبل",
		tone: "text-muted"
	};
	if (previous <= 0) return {
		text: "۱۰۰٪ پیشرفت نسبت به ماه قبل",
		tone: "text-jade"
	};
	const pct = Math.round((current - previous) / previous * 100);
	if (pct === 0) return {
		text: "بدون تغییر نسبت به ماه قبل",
		tone: "text-muted"
	};
	if (pct > 0) return {
		text: `${faNum(pct)}٪ پیشرفت نسبت به ماه قبل`,
		tone: "text-[#2acc8a]"
	};
	return {
		text: `${faNum(Math.abs(pct))}٪ پسرفت نسبت به ماه قبل`,
		tone: "text-danger"
	};
}
function followups(data, personal) {
	const items = [];
	const services = (data.services ?? []).filter((item) => item.active !== false);
	const ready = (data.staff ?? []).filter((item) => item.active !== false && (item.weekly?.length ?? 0) > 0);
	const hasService = services.length > 0;
	const hasStaff = ready.length > 0;
	const hasPhone = Boolean(String(data.phone ?? "").trim());
	if (!hasService || !hasStaff || !hasPhone) {
		const done = Number(hasService) + Number(hasStaff) + Number(hasPhone);
		const to = !hasService ? "/panel/services" : !hasStaff ? "/panel/staff" : "/panel/settings";
		const kind = personal ? "صفحه" : "کسب‌وکار";
		items.push({
			id: "setup",
			text: `راه‌اندازی ${kind} هنوز تمام نشده. بیا تمامش کن.`,
			to,
			progress: Math.round(done / 3 * 100),
			done,
			total: 3
		});
	}
	if (data.subscription?.endsAt) {
		const left = new Date(data.subscription.endsAt).getTime() - Date.now();
		if (Number.isFinite(left) && left < 6048e5) items.push({
			id: "plan",
			text: "اشتراکت دارد تمام می‌شود. بیا از صفحهٔ تنظیمات تمدیدش کن.",
			to: "/panel/settings"
		});
	}
	if (typeof data.smsCredit === "number" && data.smsCredit < 20) items.push({
		id: "sms",
		text: "اعتبار پیامک‌ها دارد تمام می‌شود. بیا اعتبارش را افزایش بده.",
		to: "/panel/settings"
	});
	return items;
}
function PanelHome() {
	const { businessId, memberships, displayName, pageFor, pageName } = usePanel();
	const current = memberships.find((item) => item.businessId === businessId);
	const personalPage = pageFor === "self" && current?.name === pageName;
	const [categories, setCategories] = (0, import_react.useState)([]);
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		city: "",
		phone: "",
		categoryId: "cat-beauty"
	});
	const [qrOpen, setQrOpen] = (0, import_react.useState)(false);
	const [follow, setFollow] = (0, import_react.useState)(null);
	const [schedule, setSchedule] = (0, import_react.useState)(null);
	const [stats, setStats] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		categoriesFn().then((res) => {
			if (res.ok) setCategories(res.data);
		});
	}, []);
	(0, import_react.useEffect)(() => {
		if (!businessId) return;
		let live = true;
		setFollow(null);
		manageBusinessFn({ data: { businessId } }).then((res) => {
			if (!live) return;
			setFollow(res.ok ? followups(res.data, personalPage) : []);
			if (!res.ok) return;
			const weekly = (res.data.staff ?? []).flatMap((person) => person.weekly ?? []);
			setSchedule({
				timezone: res.data.timezone || "Asia/Tehran",
				weekly
			});
		});
		return () => {
			live = false;
		};
	}, [businessId, personalPage]);
	(0, import_react.useEffect)(() => {
		if (!businessId) return;
		let live = true;
		dashboardFn({ data: { businessId } }).then((res) => {
			if (!live || !res.ok) return;
			const next = res.data.stats ?? emptyStats;
			setStats({
				...next,
				series: res.data.series ?? emptySeries
			});
		});
		return () => {
			live = false;
		};
	}, [businessId]);
	if (!businessId) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "graphite grid gap-4 lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-xl font-bold",
			children: "کسب‌وکار تازه"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-4 grid gap-3",
			onSubmit: async (event) => {
				event.preventDefault();
				const res = await createBusinessFn({ data: {
					...form,
					timezone: "Asia/Tehran"
				} });
				if (!res.ok) {
					toast.error(res.error);
					return;
				}
				assignRandomPageAvatar(res.data.businessId);
				localStorage.setItem("agent.business", res.data.businessId);
				toast.success("ساخته شد");
				window.location.assign("/panel/services");
			},
			children: [
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
						className: "min-h-11 rounded-lg border border-line bg-[#101011] px-3 text-ink",
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
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "ساخت کسب‌وکار"
				})
			]
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xl font-bold",
				children: "نمونه قابل حذف"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-6 text-muted",
				children: "یک آرایشگاه با خدمت، همکار و ساعت کاری می‌سازد تا رزرو را امتحان کنید. برچسب نمونه روی صفحه عمومی می‌ماند."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4",
				variant: "quiet",
				onClick: async () => {
					const res = await createDemoFn();
					if (!res.ok) {
						toast.error(res.error);
						return;
					}
					assignRandomPageAvatar(res.data.businessId);
					localStorage.setItem("agent.business", res.data.businessId);
					window.location.assign("/panel");
				},
				children: "ساخت نمونه"
			})
		] })]
	});
	const summary = personalPage ? "صفحه شما" : current?.name;
	const pageUrl = typeof window !== "undefined" && current?.slug ? `${window.location.origin}/b/${current.slug}` : "";
	const shortcuts = [
		{
			label: "ثبت نوبت",
			icon: CalendarPlus,
			to: "/panel/calendar"
		},
		{
			label: "مشتریان",
			icon: Users,
			to: "/panel/customers"
		},
		{
			label: "گزارشات",
			icon: ChartColumn,
			to: "/panel/reports"
		},
		{
			label: "ویرایش صفحه",
			icon: PenLine,
			to: "/panel/settings"
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "graphite grid min-w-0 gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMark, {
						businessId,
						slug: current?.slug,
						name: current?.name || displayName,
						avatar: current?.avatar,
						size: 48
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "text-2xl font-extrabold",
							children: [
								greeting(),
								" ",
								firstName(displayName)
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: ["خلاصه امروز ", summary]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "grid size-11 shrink-0 place-items-center rounded-lg border border-line bg-card text-ink",
					"aria-label": "کد صفحه کسب‌وکار",
					onClick: () => setQrOpen(true),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, { className: "size-5" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-extrabold",
					children: "نیاز به پیگیری"
				}),
				follow === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-3 h-12" }) : null,
				follow && follow.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "موردی برای پیگیری نیست."
				}) : null,
				follow && follow.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 grid gap-2",
					children: follow.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: item.to,
						className: "flex items-center gap-3 rounded-lg bg-[#101011] px-3 py-3 text-sm leading-6",
						children: [item.progress != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressRing, { value: item.progress }) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block",
								children: item.text
							}), item.done != null && item.total != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mt-0.5 block text-xs text-muted",
								children: [
									faNum(item.done),
									" مرحله از ",
									faNum(item.total),
									" مرحله برای راه‌اندازی صفحه شما انجام شده"
								]
							}) : null]
						})]
					}) }, item.id))
				}) : null
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [
					shortcuts.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: item.to,
						className: "flex min-h-24 flex-col justify-between rounded-card border border-line bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
							className: "size-5 text-[#ffa640]",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold",
							children: item.label
						})]
					}, item.label)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/panel/links",
						className: "flex min-h-24 flex-col justify-between rounded-card border border-line bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, {
							className: "size-5 text-[#ffa640]",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold",
							children: "لینک من"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/panel/settings",
						className: "flex min-h-24 flex-col justify-between rounded-card border border-line bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, {
							className: "size-5 text-[#ffa640]",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-bold",
							children: "تنظیمات"
						})]
					})
				]
			}),
			businessId && schedule ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeekBoard, {
				businessId,
				timezone: schedule.timezone,
				weekly: schedule.weekly
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-extrabold",
					children: "عملکرد یکماه اخیر"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/panel/reports",
					className: "text-sm font-semibold text-[#ffa640]",
					children: "مشاهده بیشتر"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
						className: "grid grid-cols-2 gap-x-3 gap-y-2",
						children: [
							["بازدید", faNum(stats?.views ?? 0)],
							["بازدیدکننده", faNum(stats?.visitors ?? 0)],
							["کلیک", faNum(stats?.clicks ?? 0)],
							["درصد تبدیل", rate(stats?.booked ?? 0, stats?.visitors ?? 0)]
						].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-xs text-muted",
							children: label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "text-lg font-extrabold tabular-nums",
							children: value
						})] }, label))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex items-center justify-between text-xs text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "size-2 rounded-full bg-[#ffa640]" }), "بازدید"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "size-2 rounded-full bg-[#f7f7f7]" }), "بازدیدکننده"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DualSpark, {
						primary: stats?.series.views ?? zeros,
						secondary: stats?.series.visitors ?? zeros,
						primaryColor: "#ffa640",
						secondaryColor: "#f7f7f7"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `mt-2 text-xs font-semibold ${monthChange(stats?.views ?? 0, stats?.prevViews ?? 0).tone}`,
						children: monthChange(stats?.views ?? 0, stats?.prevViews ?? 0).text
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
						className: "grid grid-cols-2 gap-x-3 gap-y-2",
						children: [
							["نوبت ثبت‌شده", faNum(stats?.booked ?? 0)],
							["نوبت لغوشده", faNum(stats?.cancelled ?? 0)],
							["نوبت تکمیل‌شده", faNum(stats?.completed ?? 0)],
							["فروش", faNum(stats?.sales ?? 0)],
							["درآمد", toman(stats?.revenueToman ?? 0)],
							["درصد لغو", rate(stats?.cancelled ?? 0, (stats?.booked ?? 0) + (stats?.cancelled ?? 0))]
						].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "text-xs text-muted",
							children: label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "text-lg font-extrabold tabular-nums",
							children: value
						})] }, label))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex items-center justify-between text-xs text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "size-2 rounded-full bg-[#ffa640]" }), "فروش"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "size-2 rounded-full bg-[#f7f7f7]" }), "درآمد"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DualSpark, {
						primary: stats?.series.sales ?? zeros,
						secondary: stats?.series.revenue ?? zeros,
						primaryColor: "#ffa640",
						secondaryColor: "#f7f7f7"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `mt-2 text-xs font-semibold ${monthChange(stats?.revenueToman ?? 0, stats?.prevRevenueToman ?? 0).tone}`,
						children: monthChange(stats?.revenueToman ?? 0, stats?.prevRevenueToman ?? 0).text
					})
				] })]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/support",
				className: "flex items-center justify-between gap-3 rounded-card border border-line bg-card p-4 lg:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex min-w-0 items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-11 shrink-0 place-items-center rounded-lg bg-[rgba(255,166,64,0.14)] text-[#ffa640]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LifeBuoy, {
							className: "size-5",
							"aria-hidden": "true"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block font-extrabold",
							children: "راهنما و پشتیبانی"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-0.5 block text-sm text-muted",
							children: "سوالی داری؟ با ما در ارتباط باش"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
					className: "size-5 shrink-0 text-muted",
					"aria-hidden": "true"
				})]
			}),
			qrOpen && current ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrDialog, {
				name: current.name,
				slug: current.slug,
				url: pageUrl,
				avatar: current.avatar,
				businessId,
				onClose: () => setQrOpen(false)
			}) : null
		]
	});
}
//#endregion
export { PanelHome as component };
