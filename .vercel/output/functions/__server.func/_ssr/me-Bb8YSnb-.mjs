import { i as __toESM } from "../_runtime.mjs";
import { B as setBookingStatusFn, E as notificationsFn, G as updateProfileFn, S as markReadFn, T as myBookingsFn, j as rescheduleBookingFn, s as availabilityFn } from "./api-vBbERkBq.mjs";
import { X as require_jsx_runtime, Z as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as PageMark } from "./page-avatar-BIJU5HCZ.mjs";
import { o as useAccount } from "./account-CxecnhcZ.mjs";
import { a as Empty, d as TextInput, f as STATUS_FA, i as Card, l as Skeleton, n as Badge, r as Button, s as Field, v as faNum } from "./ui-CYEMVOYZ.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Shell } from "./shell-Dkqa3wbv.mjs";
import { c as ymd, n as civilInZone } from "./time-BneIW53_.mjs";
import { d as formatWhen } from "./router-DEaekAna.mjs";
import { t as RedirectToSignIn } from "./gates-CUxTjxua.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/me-Bb8YSnb-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MePage() {
	const account = useAccount();
	const [bookings, setBookings] = (0, import_react.useState)([]);
	const [notes, setNotes] = (0, import_react.useState)([]);
	const [name, setName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [moveId, setMoveId] = (0, import_react.useState)("");
	const [slots, setSlots] = (0, import_react.useState)([]);
	function load() {
		myBookingsFn().then((res) => {
			if (res.ok) setBookings(res.data);
		});
		notificationsFn().then((res) => {
			if (res.ok) setNotes(res.data);
		});
	}
	(0, import_react.useEffect)(() => {
		if (!account.user) return;
		load();
		if (account.me) {
			setName(account.me.profile.displayName);
			setPhone(account.me.profile.phone);
		}
	}, [account.user?.id, account.me]);
	if (account.isPending || account.loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40" }) });
	if (!account.user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	const upcoming = bookings.filter((item) => item.status === "confirmed" || item.status === "pending");
	const past = bookings.filter((item) => item.status !== "confirmed" && item.status !== "pending");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Shell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl font-extrabold",
			children: "نوبت‌های من"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: account.me?.unread ? `${account.me.unread} اعلان خوانده‌نشده` : "اعلان داخلی، نه پیامک"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3",
				children: [
					upcoming.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
						title: "نوبت آینده‌ای نیست",
						body: "از فهرست کسب‌وکارها یک زمان آزاد انتخاب کنید."
					}) : null,
					upcoming.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-w-0 items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMark, {
									slug: item.businessSlug,
									name: item.businessName,
									avatar: item.avatar,
									size: 40
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-bold",
										children: item.serviceName
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm text-muted",
										children: [
											item.businessName,
											" · ",
											item.staffName
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm",
										children: formatWhen(item.startsAt, item.timezone)
									})
								] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: STATUS_FA[item.status] ?? item.status })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "danger",
								onClick: async () => {
									const res = await setBookingStatusFn({ data: {
										bookingId: item.id,
										status: "cancelled",
										reason: "لغو توسط مشتری"
									} });
									if (!res.ok) toast.error(res.error);
									else {
										toast.success("نوبت لغو شد");
										load();
									}
								},
								children: "لغو"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "quiet",
								onClick: async () => {
									setMoveId(item.id);
									const c = civilInZone(new Date(item.startsAt), item.timezone);
									const day = ymd(c.year, c.month, c.day);
									const res = await availabilityFn({ data: {
										businessId: item.businessId,
										serviceId: item.serviceId,
										day,
										staffId: ""
									} });
									setSlots(res.ok ? res.data.slots : []);
								},
								children: "جابه‌جایی"
							})]
						}),
						moveId === item.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 grid grid-cols-3 gap-2",
							children: slots.slice(0, 12).map((slot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "min-h-11 rounded-xl border border-line text-sm",
								onClick: async () => {
									const res = await rescheduleBookingFn({ data: {
										bookingId: item.id,
										start: slot.start,
										staffId: null
									} });
									if (!res.ok) toast.error(res.error);
									else {
										toast.success("زمان عوض شد");
										setMoveId("");
										load();
									}
								},
								children: formatWhen(slot.start, item.timezone)
							}, slot.start))
						}) : null
					] }, item.id)),
					past.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-bold",
						children: "تاریخچه"
					}) : null,
					past.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMark, {
								slug: item.businessSlug,
								name: item.businessName,
								avatar: item.avatar,
								size: 40
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-semibold",
								children: item.serviceName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-sm text-muted",
								children: [
									item.businessName,
									" · ",
									formatWhen(item.startsAt, item.timezone)
								]
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: "muted",
							children: STATUS_FA[item.status] ?? item.status
						})]
					}) }, item.id))
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageMark, {
							name: account.me?.profile.displayName || "حساب",
							avatar: account.me?.profile.avatar,
							size: 56
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-bold",
							children: "مشخصات"
						})]
					}),
					account.me?.profile.username ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-3 grid gap-1 text-sm text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["نام کاربری: ", faNum(account.me.profile.username)] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["صفحه: ", faNum(account.me.profile.pageName)] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["حوزه: ", account.me.profile.activityName] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: account.me.profile.pageFor === "business" ? "برای کسب‌وکار" : "برای خودم" })
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-3 grid gap-3",
						onSubmit: async (event) => {
							event.preventDefault();
							const res = await updateProfileFn({ data: {
								displayName: name,
								phone
							} });
							if (!res.ok) toast.error(res.error);
							else {
								toast.success("ذخیره شد");
								account.reload();
							}
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "نام",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									value: name,
									onChange: (e) => setName(e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "تلفن",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									dir: "ltr",
									className: "text-left",
									value: phone,
									onChange: (e) => setPhone(e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "ذخیره"
							})
						]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-bold",
						children: "اعلان‌های داخلی"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-sm text-jade",
						onClick: () => markReadFn({ data: {} }).then(() => {
							load();
							account.reload();
						}),
						children: "خواندم"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 grid gap-3",
					children: [notes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-sm text-muted",
						children: "اعلانی نیست."
					}) : null, notes.map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: note.read ? "text-muted" : "",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-semibold",
							children: note.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-6",
							children: note.body
						})]
					}, note.id))]
				})] })]
			})]
		})
	] });
}
//#endregion
export { MePage as component };
