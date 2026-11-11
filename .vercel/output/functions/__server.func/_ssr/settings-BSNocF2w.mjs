import { i as __toESM } from "../_runtime.mjs";
import { A as removeHolidayFn, W as updateBusinessFn, _ as deleteBusinessFn, t as addHolidayFn, u as categoriesFn, x as manageBusinessFn } from "./api-vBbERkBq.mjs";
import { X as require_jsx_runtime, Z as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as usePanel } from "./account-CxecnhcZ.mjs";
import { a as Empty, c as Select, d as TextInput, i as Card, l as Skeleton, r as Button, s as Field, t as Area } from "./ui-CYEMVOYZ.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { s as todayYmd } from "./time-BneIW53_.mjs";
import { t as JalaliCalendar } from "./jalali-calendar-jyOmkH66.mjs";
import { u as formatDay } from "./router-DEaekAna.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-BSNocF2w.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SettingsPage() {
	const { businessId, memberships } = usePanel();
	const role = memberships.find((item) => item.businessId === businessId)?.role;
	const [form, setForm] = (0, import_react.useState)(null);
	const [categories, setCategories] = (0, import_react.useState)([]);
	const [holidays, setHolidays] = (0, import_react.useState)([]);
	const [staff, setStaff] = (0, import_react.useState)([]);
	const [day, setDay] = (0, import_react.useState)(todayYmd("Asia/Tehran"));
	const [note, setNote] = (0, import_react.useState)("");
	const [staffId, setStaffId] = (0, import_react.useState)("");
	const [confirmName, setConfirmName] = (0, import_react.useState)("");
	function load(id) {
		manageBusinessFn({ data: { businessId: id } }).then((res) => {
			if (!res.ok) {
				toast.error(res.error);
				return;
			}
			const data = res.data;
			setForm({
				name: data.name,
				description: data.description,
				categoryId: data.categoryId ?? "",
				city: data.city,
				address: data.address,
				phone: data.phone,
				timezone: data.timezone,
				cancelBeforeMinutes: data.cancelBeforeMinutes,
				minLeadMinutes: data.minLeadMinutes,
				maxHorizonDays: data.maxHorizonDays,
				slotStepMinutes: data.slotStepMinutes,
				allowAnyStaff: data.allowAnyStaff,
				isDemo: data.isDemo,
				slug: data.slug
			});
			setHolidays(data.holidays);
			setStaff(data.staff);
			setDay(todayYmd(data.timezone));
		});
	}
	(0, import_react.useEffect)(() => {
		categoriesFn().then((res) => {
			if (res.ok) setCategories(res.data);
		});
	}, []);
	(0, import_react.useEffect)(() => {
		if (businessId) load(businessId);
	}, [businessId]);
	if (!businessId) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
		title: "اول کسب‌وکار بسازید",
		body: "تنظیمات بعد از ساخت صفحه در دسترس است."
	});
	if (!form) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64" });
	const owner = role === "owner";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-bold",
				children: "مشخصات و سیاست رزرو"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted",
				children: ["نشانی عمومی: /b/", form.slug]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-4 grid gap-3",
				onSubmit: async (event) => {
					event.preventDefault();
					const res = await updateBusinessFn({ data: {
						businessId,
						...form,
						categoryId: form.categoryId,
						cancelBeforeMinutes: Number(form.cancelBeforeMinutes),
						minLeadMinutes: Number(form.minLeadMinutes),
						maxHorizonDays: Number(form.maxHorizonDays),
						slotStepMinutes: Number(form.slotStepMinutes)
					} });
					if (!res.ok) toast.error(res.error);
					else toast.success("تنظیمات ذخیره شد");
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
						label: "توضیح",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
							value: form.description,
							onChange: (e) => setForm({
								...form,
								description: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "دسته",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: form.categoryId,
							onChange: (e) => setForm({
								...form,
								categoryId: e.target.value
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "بدون دسته"
							}), categories.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: cat.id,
								children: cat.name
							}, cat.id))]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "شهر",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								value: form.city,
								onChange: (e) => setForm({
									...form,
									city: e.target.value
								})
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
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
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "آدرس",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							value: form.address,
							onChange: (e) => setForm({
								...form,
								address: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "منطقه زمانی",
						hint: "زمان‌ها در پایگاه داده به وقت جهانی ذخیره می‌شوند.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: form.timezone,
							onChange: (e) => setForm({
								...form,
								timezone: e.target.value
							}),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "Asia/Tehran",
									children: "تهران"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "Asia/Dubai",
									children: "دبی"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "Europe/Istanbul",
									children: "استانبول"
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "حداقل فاصله تا نوبت (دقیقه)",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									type: "number",
									min: 0,
									value: form.minLeadMinutes,
									onChange: (e) => setForm({
										...form,
										minLeadMinutes: Number(e.target.value)
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "مهلت لغو (دقیقه قبل)",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									type: "number",
									min: 0,
									value: form.cancelBeforeMinutes,
									onChange: (e) => setForm({
										...form,
										cancelBeforeMinutes: Number(e.target.value)
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "افق رزرو (روز)",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									type: "number",
									min: 1,
									max: 180,
									value: form.maxHorizonDays,
									onChange: (e) => setForm({
										...form,
										maxHorizonDays: Number(e.target.value)
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "گام زمان (دقیقه)",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									type: "number",
									min: 5,
									max: 60,
									value: form.slotStepMinutes,
									onChange: (e) => setForm({
										...form,
										slotStepMinutes: Number(e.target.value)
									})
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-11 items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: form.allowAnyStaff,
							onChange: (e) => setForm({
								...form,
								allowAnyStaff: e.target.checked
							})
						}), "مشتری بتواند بدون انتخاب متخصص رزرو کند"]
					}),
					form.isDemo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-copper",
						children: "این صفحه داده نمونه است و روی فهرست عمومی برچسب نمونه دارد."
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "ذخیره تنظیمات"
					})
				]
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid content-start gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-bold",
					children: "تعطیلی"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm leading-6 text-muted",
					children: "تعطیلی بدون همکار، کل کسب‌وکار را آن روز می‌بندد. ظرفیت لغوشده آزاد می‌ماند."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid gap-3 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(JalaliCalendar, {
						value: day,
						onChange: setDay
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid content-start gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "برای",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: staffId,
									onChange: (e) => setStaffId(e.target.value),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "",
										children: "همه همکاران"
									}), staff.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: person.id,
										children: person.name
									}, person.id))]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "یادداشت",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									value: note,
									onChange: (e) => setNote(e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								onClick: async () => {
									const res = await addHolidayFn({ data: {
										businessId,
										date: day,
										staffId,
										note
									} });
									if (!res.ok) toast.error(res.error);
									else {
										toast.success("تعطیلی ثبت شد");
										setNote("");
										load(businessId);
									}
								},
								children: "ثبت تعطیلی"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-4 grid gap-2",
					children: [holidays.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-sm text-muted",
						children: "تعطیلی ثبت نشده."
					}) : null, holidays.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							formatDay(item.date),
							" · ",
							item.staffId ? staff.find((person) => person.id === item.staffId)?.name ?? "همکار" : "همه",
							" ",
							item.note
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "quiet",
							onClick: async () => {
								const res = await removeHolidayFn({ data: {
									businessId,
									holidayId: item.id
								} });
								if (!res.ok) toast.error(res.error);
								else load(businessId);
							},
							children: "حذف"
						})]
					}, item.id))]
				})
			] }), owner ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-bold",
					children: "حذف کسب‌وکار"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm leading-6 text-muted",
					children: "نوبت‌ها، خدمات و مشتریان این صفحه پاک می‌شوند. برای تأیید، نام را دقیق بنویسید."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-col gap-2 sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						value: confirmName,
						onChange: (e) => setConfirmName(e.target.value),
						"aria-label": "تأیید نام"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "danger",
						disabled: confirmName.trim() !== form.name,
						onClick: async () => {
							const res = await deleteBusinessFn({ data: { businessId } });
							if (!res.ok) {
								toast.error(res.error);
								return;
							}
							localStorage.removeItem("agent.business");
							toast.success("حذف شد");
							window.location.assign("/panel");
						},
						children: "حذف"
					})]
				})
			] }) : null]
		})]
	});
}
//#endregion
export { SettingsPage as component };
