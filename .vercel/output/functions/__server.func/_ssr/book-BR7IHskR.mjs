import { i as __toESM } from "../_runtime.mjs";
import { B as setBookingStatusFn, O as publicBusinessFn, f as createBookingFn, s as availabilityFn } from "./api-vBbERkBq.mjs";
import { X as require_jsx_runtime, Z as require_react, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as PageMark } from "./page-avatar-BIJU5HCZ.mjs";
import { c as useCurrentUserState } from "./account-CxecnhcZ.mjs";
import { a as Empty, b as toman, d as TextInput, i as Card, l as Skeleton, n as Badge, o as ErrorNote, r as Button, s as Field, u as Stepper, y as minutesLabel } from "./ui-CYEMVOYZ.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Shell } from "./shell-Dkqa3wbv.mjs";
import { n as civilInZone, s as todayYmd, t as addDaysYmd } from "./time-BneIW53_.mjs";
import { t as JalaliCalendar } from "./jalali-calendar-jyOmkH66.mjs";
import { h as normalizeIranMobile, l as formatClock, p as isIranMobile, r as Route, u as formatDay } from "./router-DEaekAna.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/book-BR7IHskR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
function BookPage() {
	const { slug } = Route.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookingScreen, { slug });
}
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
//#endregion
export { BookingScreen, BookPage as component };
