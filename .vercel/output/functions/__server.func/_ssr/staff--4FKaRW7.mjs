import { i as __toESM } from "../_runtime.mjs";
import { F as saveScheduleFn, R as saveStaffFn, x as manageBusinessFn } from "./api-vBbERkBq.mjs";
import { X as require_jsx_runtime, Z as require_react, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as usePanel } from "./account-CxecnhcZ.mjs";
import { a as Empty, d as TextInput, g as enDigits, i as Card, l as Skeleton, m as clockLabel, n as Badge, p as WEEKDAYS_FA, r as Button, s as Field } from "./ui-CYEMVOYZ.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/staff--4FKaRW7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function pad(mins) {
	const h = Math.floor(mins / 60);
	const m = mins % 60;
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function toMin(value) {
	const [h, m] = enDigits(value).split(":").map(Number);
	if (!Number.isFinite(h) || !Number.isFinite(m)) return 0;
	return h * 60 + m;
}
function daysOf(person) {
	return WEEKDAYS_FA.map((_, weekday) => {
		const window = person?.weekly.find((item) => item.weekday === weekday);
		const rest = person?.breaks.find((item) => item.weekday === weekday);
		return {
			weekday,
			enabled: person ? Boolean(window) : weekday !== 5,
			start: pad(window?.startMin ?? 540),
			end: pad(window?.endMin ?? 1080),
			breakStart: rest ? pad(rest.startMin) : "",
			breakEnd: rest ? pad(rest.endMin) : ""
		};
	});
}
function StaffPage() {
	const { businessId } = usePanel();
	const [services, setServices] = (0, import_react.useState)([]);
	const [staff, setStaff] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [name, setName] = (0, import_react.useState)("");
	const [title, setTitle] = (0, import_react.useState)("");
	const [active, setActive] = (0, import_react.useState)(true);
	const [id, setId] = (0, import_react.useState)("");
	const [serviceIds, setServiceIds] = (0, import_react.useState)([]);
	const [days, setDays] = (0, import_react.useState)(daysOf(null));
	const [saving, setSaving] = (0, import_react.useState)(false);
	const primed = (0, import_react.useRef)(false);
	function load(biz) {
		setLoading(true);
		manageBusinessFn({ data: { businessId: biz } }).then((res) => {
			if (!res.ok) {
				toast.error(res.error);
				setLoading(false);
				return;
			}
			setServices(res.data.services);
			setStaff(res.data.staff);
			setLoading(false);
		});
	}
	(0, import_react.useEffect)(() => {
		if (businessId) load(businessId);
	}, [businessId]);
	(0, import_react.useEffect)(() => {
		if (primed.current || id || services.length === 0) return;
		primed.current = true;
		setServiceIds(services.filter((item) => item.active).map((item) => item.id));
	}, [services, id]);
	const selected = (0, import_react.useMemo)(() => staff.find((item) => item.id === id) ?? null, [staff, id]);
	function edit(person) {
		setId(person.id);
		setName(person.name);
		setTitle(person.title);
		setActive(person.active);
		setServiceIds(person.serviceIds);
		setDays(daysOf(person));
	}
	function reset() {
		setId("");
		setName("");
		setTitle("");
		setActive(true);
		setServiceIds(services.filter((item) => item.active).map((item) => item.id));
		setDays(daysOf(null));
	}
	if (!businessId) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
		title: "اول کسب‌وکار بسازید",
		body: "همکاران بعد از ساخت صفحه کسب‌وکار اضافه می‌شوند."
	});
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-48" });
	if (services.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
		title: "اول خدمت بسازید",
		body: "هر همکار باید حداقل به یک خدمت وصل شود.",
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/panel/services",
			className: "inline-flex min-h-11 items-center rounded-xl bg-jade px-4 font-semibold text-on-jade",
			children: "رفتن به خدمات"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[280px_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid content-start gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "quiet",
					onClick: reset,
					children: "همکار تازه"
				}),
				staff.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "هنوز همکاری ثبت نشده."
				}) : null,
				staff.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => edit(person),
					className: `rounded-xl border p-3 text-start ${person.id === id ? "border-jade bg-jade-soft" : "border-line bg-card"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: person.name
						}), !person.active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "muted",
							children: "غیرفعال"
						}) : null]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: person.title || "بدون عنوان"
					})]
				}, person.id))
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-bold",
				children: id ? "ویرایش همکار" : "همکار تازه"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "ساعت کاری جدید برای همکار تازه، شنبه تا پنجشنبه ۹ تا ۱۸ است. جمعه تعطیل است. استراحت را خالی بگذارید اگر ندارید."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-4 grid gap-4",
				onSubmit: async (event) => {
					event.preventDefault();
					if (!serviceIds.length) {
						toast.error("حداقل یک خدمت را انتخاب کنید");
						return;
					}
					setSaving(true);
					const saved = await saveStaffFn({ data: {
						businessId,
						...id ? { id } : {},
						name,
						title,
						active,
						serviceIds
					} });
					if (!saved.ok) {
						setSaving(false);
						toast.error(saved.error);
						return;
					}
					const schedule = await saveScheduleFn({ data: {
						businessId,
						staffId: saved.data.staffId,
						days: days.map((day) => ({
							weekday: day.weekday,
							enabled: day.enabled,
							startMin: toMin(day.start),
							endMin: toMin(day.end),
							breakStart: day.breakStart ? toMin(day.breakStart) : "",
							breakEnd: day.breakEnd ? toMin(day.breakEnd) : ""
						}))
					} });
					setSaving(false);
					if (!schedule.ok) {
						toast.error(schedule.error);
						setId(saved.data.staffId);
						load(businessId);
						return;
					}
					toast.success("همکار و برنامه ذخیره شد");
					setId(saved.data.staffId);
					load(businessId);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "نام",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								value: name,
								onChange: (e) => setName(e.target.value),
								required: true,
								minLength: 2
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "عنوان",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								value: title,
								onChange: (e) => setTitle(e.target.value),
								placeholder: "مثلاً استایلیست"
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
						className: "mb-2 text-sm font-medium",
						children: "خدمات"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: services.map((service) => {
							const on = serviceIds.includes(service.id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: `min-h-11 rounded-full px-4 text-sm ${on ? "bg-jade text-on-jade" : "border border-line"}`,
								onClick: () => setServiceIds(on ? serviceIds.filter((item) => item !== service.id) : [...serviceIds, service.id]),
								children: service.name
							}, service.id);
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-11 items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: active,
							onChange: (e) => setActive(e.target.checked)
						}), "برای رزرو در دسترس باشد"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-2",
						children: days.map((day, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid items-center gap-2 rounded-xl bg-paper px-3 py-2 sm:grid-cols-[7rem_4.5rem_1fr_1fr]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-medium",
									children: WEEKDAYS_FA[day.weekday]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex min-h-11 items-center gap-2 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: day.enabled,
										onChange: (e) => setDays(days.map((item, i) => i === index ? {
											...item,
											enabled: e.target.checked
										} : item))
									}), "باز"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "grid gap-1 text-xs text-muted",
									children: ["شروع تا پایان", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
											dir: "ltr",
											className: "px-2 text-left",
											disabled: !day.enabled,
											value: day.start,
											onChange: (e) => setDays(days.map((item, i) => i === index ? {
												...item,
												start: e.target.value
											} : item))
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
											dir: "ltr",
											className: "px-2 text-left",
											disabled: !day.enabled,
											value: day.end,
											onChange: (e) => setDays(days.map((item, i) => i === index ? {
												...item,
												end: e.target.value
											} : item))
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "grid gap-1 text-xs text-muted",
									children: ["استراحت", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
											dir: "ltr",
											className: "px-2 text-left",
											disabled: !day.enabled,
											value: day.breakStart,
											onChange: (e) => setDays(days.map((item, i) => i === index ? {
												...item,
												breakStart: e.target.value
											} : item))
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
											dir: "ltr",
											className: "px-2 text-left",
											disabled: !day.enabled,
											value: day.breakEnd,
											onChange: (e) => setDays(days.map((item, i) => i === index ? {
												...item,
												breakEnd: e.target.value
											} : item))
										})]
									})]
								})
							]
						}, day.weekday))
					}),
					selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: ["برنامه فعلی: ", selected.weekly.map((item) => `${WEEKDAYS_FA[item.weekday]} ${clockLabel(item.startMin)}–${clockLabel(item.endMin)}`).join("، ") || "بدون ساعت"]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: saving,
						children: saving ? "در حال ذخیره" : "ذخیره همکار"
					})
				]
			})
		] })]
	});
}
//#endregion
export { StaffPage as component };
