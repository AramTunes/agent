import { i as __toESM } from "../_runtime.mjs";
import { U as startAccountFn, u as categoriesFn, z as sendPhoneCodeFn } from "./api-vBbERkBq.mjs";
import { X as require_jsx_runtime, Z as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as adoptSession } from "./account-CxecnhcZ.mjs";
import { g as enDigits, i as Card, o as ErrorNote, r as Button, s as Field, u as Stepper, v as faNum } from "./ui-CYEMVOYZ.mjs";
import { b as Store, d as UserRound, rt as Link2 } from "../_libs/lucide-react.mjs";
import { n as Shell } from "./shell-Dkqa3wbv.mjs";
import { p as isIranMobile } from "./router-DEaekAna.mjs";
import { n as PhoneInput, t as OtpField } from "./phone-input-CpYEyRvV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/start-C67Tu2hS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STEPS = [
	{
		title: "حوزه فعالیت",
		hint: "حوزه‌ای را انتخاب کن که بیشتر به کارت می‌خورد."
	},
	{
		title: "این صفحه برای کیست",
		hint: "بگو این صفحه برای خودت است یا برای کسب‌وکارت."
	},
	{
		title: "اسم صفحه",
		hint: "این اسم را مشتری بالای صفحهٔ تو می‌بیند."
	},
	{
		title: "نام کاربری",
		hint: "فقط نام را بنویس. دامنهٔ سایت ثابت است و عوض نمی‌شود."
	},
	{
		title: "شماره موبایل",
		hint: "کد تأیید برای همین شماره ساخته می‌شود. پیامک واقعی فرستاده نمی‌شود."
	},
	{
		title: "کد تأیید",
		hint: "کدی که همین‌جا نشان داده می‌شود را وارد کن تا حساب ساخته شود."
	}
];
function StartPage() {
	const [categories, setCategories] = (0, import_react.useState)([]);
	const [step, setStep] = (0, import_react.useState)(0);
	const [categoryId, setCategoryId] = (0, import_react.useState)("");
	const [pageFor, setPageFor] = (0, import_react.useState)("");
	const [pageName, setPageName] = (0, import_react.useState)("");
	const [username, setUsername] = (0, import_react.useState)("");
	const [domain, setDomain] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [code, setCode] = (0, import_react.useState)("");
	const [shownCode, setShownCode] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		categoriesFn().then((res) => {
			if (res.ok) setCategories(res.data);
		});
		setDomain(window.location.hostname);
	}, []);
	function back() {
		setError("");
		setStep((n) => Math.max(0, n - 1));
	}
	function pickCategory(id) {
		setError("");
		setCategoryId(id);
		setStep(1);
	}
	function pickFor(value) {
		setError("");
		setPageFor(value);
		setStep(2);
	}
	function next() {
		setError("");
		if (step === 0 && !categoryId) return setError("حوزه فعالیت را انتخاب کنید");
		if (step === 1 && !pageFor) return setError("یکی را انتخاب کنید");
		if (step === 2 && pageName.trim().length < 2) return setError("اسم صفحه را بنویسید");
		if (step === 3 && !/^[\p{L}\p{N}_]{3,24}$/u.test(username.trim())) return setError("نام کاربری باید ۳ تا ۲۴ حرف، عدد یا _ باشد");
		setStep((n) => Math.min(n + 1, STEPS.length - 1));
	}
	function requestCode(event) {
		event?.preventDefault();
		setError("");
		setPending(true);
		(async () => {
			const res = await sendPhoneCodeFn({ data: {
				phone,
				purpose: "signup"
			} });
			setPending(false);
			if (!res.ok) {
				setError(res.error);
				return;
			}
			setShownCode(res.data.code);
			setCode("");
			setStep(5);
		})();
	}
	async function finish(event) {
		event.preventDefault();
		setError("");
		setPending(true);
		const res = await startAccountFn({ data: {
			categoryId,
			pageFor,
			pageName: pageName.trim(),
			username: username.trim(),
			phone,
			code: code.trim()
		} });
		setPending(false);
		if (!res.ok) {
			setError(res.error);
			return;
		}
		await adoptSession(res.data.token);
		window.location.assign("/panel");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid w-full max-w-xl gap-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stepper, {
			className: "w-full",
			current: step,
			steps: [
				{ label: "حوزه" },
				{ label: "برای کی" },
				{ label: "اسم" },
				{ label: "کاربری" },
				{ label: "موبایل" },
				{ label: "کد" }
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-extrabold",
					children: STEPS[step].title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm leading-7 text-muted",
					children: STEPS[step].hint
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					step === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-2 sm:grid-cols-2",
						children: categories.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: categoryId === cat.id ? "min-h-11 rounded-xl bg-jade px-3 text-sm font-semibold text-on-jade" : "min-h-11 rounded-xl border border-line bg-card px-3 text-sm",
							onClick: () => pickCategory(cat.id),
							children: cat.name
						}, cat.id))
					}) : null,
					step === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
							on: pageFor === "self",
							onClick: () => pickFor("self"),
							title: "برای خودم",
							text: "صفحه با اسم خودتان ساخته می‌شود."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
							on: pageFor === "business",
							onClick: () => pickFor("business"),
							title: "برای کسب‌وکارم",
							text: "صفحه با اسم کسب‌وکار ساخته می‌شود."
						})]
					}) : null,
					step === 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: pageFor === "business" ? "اسم کسب‌وکار" : "اسم شما",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldBox, {
							icon: pageFor === "business" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "size-4" }),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: faNum(pageName),
								onChange: (e) => setPageName(enDigits(e.target.value)),
								minLength: 2,
								autoComplete: "organization",
								className: "min-w-0 flex-1 bg-transparent text-sm outline-none"
							})
						})
					}) : null,
					step === 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "نام کاربری",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							dir: "ltr",
							className: "flex min-h-11 overflow-hidden rounded-xl border border-line bg-card focus-within:border-jade",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex shrink-0 items-center gap-1.5 border-e border-line bg-paper-deep px-3 text-sm text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, {
									className: "size-4 shrink-0",
									"aria-hidden": "true"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "max-w-36 truncate",
									children: [faNum(domain || "…"), "/"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: faNum(username),
								onChange: (e) => setUsername(enDigits(e.target.value)),
								autoComplete: "username",
								autoCapitalize: "none",
								spellCheck: false,
								"aria-label": "نام کاربری",
								placeholder: "username",
								className: "min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
							})]
						})
					}) : null,
					step === 4 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "grid gap-3",
						onSubmit: (event) => {
							event.preventDefault();
							requestCode();
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "شماره موبایل",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneInput, {
									value: phone,
									onChange: (digits) => setPhone(digits)
								})
							}),
							error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: error }) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "quiet",
									onClick: back,
									children: "بازگشت"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									variant: "signup",
									disabled: pending || !isIranMobile(phone),
									children: pending ? "در حال ارسال" : "دریافت کد"
								})]
							})
						]
					}) : null,
					step === 5 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "grid gap-3",
						onSubmit: (event) => {
							event.preventDefault();
							finish(event);
						},
						children: [
							shownCode ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "rounded-xl bg-paper-deep px-3 py-2 text-sm leading-6",
								children: ["پیامک وصل نیست. کد تأیید: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold",
									dir: "ltr",
									children: faNum(shownCode)
								})]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "کد تأیید",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OtpField, {
									value: code,
									onChange: setCode
								})
							}),
							error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: error }) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "quiet",
									onClick: back,
									children: "بازگشت"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									variant: "signup",
									disabled: pending || code.trim().length < 6,
									children: pending ? "در حال ساخت" : "ساخت حساب"
								})]
							})
						]
					}) : null,
					step > 0 && step < 4 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-3",
						children: [error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: error }) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "quiet",
								onClick: back,
								children: "بازگشت"
							}), step >= 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "signup",
								onClick: next,
								children: "ادامه"
							}) : null]
						})]
					}) : null
				] })
			]
		})]
	}) });
}
function FieldBox({ icon, ltr = false, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		dir: ltr ? "ltr" : void 0,
		className: "flex min-h-11 items-center gap-2 rounded-xl border border-line bg-card px-3 focus-within:border-jade",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "shrink-0 text-muted",
			"aria-hidden": "true",
			children: icon
		}), children]
	});
}
function Choice({ on, onClick, title, text }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: on ? "rounded-xl bg-jade px-4 py-4 text-start text-on-jade" : "rounded-xl border border-line px-4 py-4 text-start",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-bold",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: on ? "mt-1 text-sm" : "mt-1 text-sm text-muted",
			children: text
		})]
	});
}
//#endregion
export { StartPage as component };
