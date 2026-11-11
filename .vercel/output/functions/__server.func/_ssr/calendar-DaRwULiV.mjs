import { i as __toESM } from "../_runtime.mjs";
import { B as setBookingStatusFn, c as businessBookingsFn, f as createBookingFn, s as availabilityFn, x as manageBusinessFn } from "./api-vBbERkBq.mjs";
import { X as require_jsx_runtime, Z as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as usePanel } from "./account-CxecnhcZ.mjs";
import { a as Empty, d as TextInput, f as STATUS_FA, i as Card, l as Skeleton, n as Badge, r as Button, s as Field } from "./ui-CYEMVOYZ.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { s as todayYmd } from "./time-BneIW53_.mjs";
import { t as JalaliCalendar } from "./jalali-calendar-jyOmkH66.mjs";
import { d as formatWhen, l as formatClock } from "./router-DEaekAna.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/calendar-DaRwULiV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CalendarPage() {
	const { businessId } = usePanel();
	const [day, setDay] = (0, import_react.useState)(todayYmd("Asia/Tehran"));
	const [rows, setRows] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [services, setServices] = (0, import_react.useState)([]);
	const [staff, setStaff] = (0, import_react.useState)([]);
	const [manual, setManual] = (0, import_react.useState)({
		serviceId: "",
		staffId: "",
		name: "",
		phone: "",
		start: ""
	});
	const [slots, setSlots] = (0, import_react.useState)([]);
	function load(id, date) {
		setLoading(true);
		businessBookingsFn({ data: {
			businessId: id,
			day: date
		} }).then((res) => {
			setRows(res.ok ? res.data : []);
			setLoading(false);
			if (!res.ok) toast.error(res.error);
		});
	}
	(0, import_react.useEffect)(() => {
		if (!businessId) return;
		manageBusinessFn({ data: { businessId } }).then((res) => {
			if (!res.ok) return;
			setDay(todayYmd(res.data.timezone));
			setServices(res.data.services.filter((item) => item.active));
			setStaff(res.data.staff.filter((item) => item.active));
			setManual((m) => ({
				...m,
				serviceId: res.data.services[0]?.id ?? "",
				staffId: res.data.staff[0]?.id ?? ""
			}));
		});
	}, [businessId]);
	(0, import_react.useEffect)(() => {
		if (businessId) load(businessId, day);
	}, [businessId, day]);
	(0, import_react.useEffect)(() => {
		if (!businessId || !manual.serviceId) return;
		availabilityFn({ data: {
			businessId,
			serviceId: manual.serviceId,
			staffId: manual.staffId,
			day
		} }).then((res) => {
			setSlots(res.ok ? res.data.slots : []);
		});
	}, [
		businessId,
		manual.serviceId,
		manual.staffId,
		day
	]);
	if (!businessId) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
		title: "اول کسب‌وکار بسازید",
		body: "از خانه پنل یک صفحه بسازید."
	});
	const zone = rows[0]?.timezone ?? "Asia/Tehran";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[280px_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(JalaliCalendar, {
			value: day,
			onChange: setDay
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-bold",
						children: "نوبت تلفنی یا حضوری"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid gap-2 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "خدمت",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									className: "min-h-11 rounded-xl border border-line bg-card px-3",
									value: manual.serviceId,
									onChange: (e) => setManual({
										...manual,
										serviceId: e.target.value
									}),
									children: services.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: item.id,
										children: item.name
									}, item.id))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "متخصص",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									className: "min-h-11 rounded-xl border border-line bg-card px-3",
									value: manual.staffId,
									onChange: (e) => setManual({
										...manual,
										staffId: e.target.value
									}),
									children: staff.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: item.id,
										children: item.name
									}, item.id))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "نام مشتری",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									value: manual.name,
									onChange: (e) => setManual({
										...manual,
										name: e.target.value
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "تلفن",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									dir: "ltr",
									className: "text-left",
									value: manual.phone,
									onChange: (e) => setManual({
										...manual,
										phone: e.target.value
									})
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex gap-2 overflow-x-auto",
						children: slots.slice(0, 10).map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: `min-h-11 shrink-0 rounded-xl px-3 text-sm ${manual.start === slot.start ? "bg-ink text-on-ink" : "border border-line"}`,
							onClick: () => setManual({
								...manual,
								start: slot.start
							}),
							children: formatClock(slot.start, zone)
						}, slot.start))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-3",
						disabled: !manual.start || manual.name.trim().length < 2,
						onClick: async () => {
							const res = await createBookingFn({ data: {
								businessId,
								serviceId: manual.serviceId,
								staffId: manual.staffId,
								start: manual.start,
								note: "",
								manual: true,
								customerName: manual.name,
								customerPhone: manual.phone,
								idempotencyKey: `desk-${crypto.randomUUID()}`
							} });
							if (!res.ok) toast.error(res.error);
							else {
								toast.success("نوبت دستی ثبت شد");
								setManual({
									...manual,
									name: "",
									start: ""
								});
								load(businessId, day);
							}
						},
						children: "ثبت نوبت"
					})
				] }),
				loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24" }) : null,
				!loading && rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
					title: "این روز خالی است",
					body: "نوبت آنلاین یا دستی این‌جا دیده می‌شود."
				}) : null,
				rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "font-bold",
						children: [
							formatWhen(row.startsAt, row.timezone),
							" · ",
							row.serviceName
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							row.staffName,
							" · ",
							row.customerName,
							" ",
							row.customerPhone
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: row.status === "cancelled" ? "danger" : "jade",
						children: STATUS_FA[row.status] ?? row.status
					})]
				}), row.status === "confirmed" || row.status === "pending" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => change(row.id, "completed"),
							children: "انجام شد"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "quiet",
							onClick: () => change(row.id, "no_show"),
							children: "عدم مراجعه"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "danger",
							onClick: () => change(row.id, "cancelled"),
							children: "لغو"
						})
					]
				}) : null] }, row.id))
			]
		})]
	});
	async function change(bookingId, status) {
		const res = await setBookingStatusFn({ data: {
			bookingId,
			status,
			reason: "از پنل کسب‌وکار"
		} });
		if (!res.ok) toast.error(res.error);
		else load(businessId, day);
	}
}
//#endregion
export { CalendarPage as component };
