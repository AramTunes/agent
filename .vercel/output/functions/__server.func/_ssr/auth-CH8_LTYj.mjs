import { i as __toESM } from "../_runtime.mjs";
import { H as signInPhoneFn, M as resetPhonePasswordFn, V as signInPhoneCodeFn, b as lookupPhoneFn, z as sendPhoneCodeFn } from "./api-vBbERkBq.mjs";
import { X as require_jsx_runtime, Z as require_react, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as adoptSession } from "./account-CxecnhcZ.mjs";
import { d as TextInput, i as Card, o as ErrorNote, r as Button, s as Field, v as faNum } from "./ui-CYEMVOYZ.mjs";
import { n as Shell } from "./shell-Dkqa3wbv.mjs";
import { c as Route$23, f as formatIranMobile, p as isIranMobile } from "./router-DEaekAna.mjs";
import { n as PhoneInput, t as OtpField } from "./phone-input-CpYEyRvV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-CH8_LTYj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthPage() {
	const { next } = Route$23.useSearch();
	const [step, setStep] = (0, import_react.useState)("phone");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [code, setCode] = (0, import_react.useState)("");
	const [shownCode, setShownCode] = (0, import_react.useState)("");
	const [nextPassword, setNextPassword] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	async function enter(token) {
		await adoptSession(token);
		window.location.assign(next);
	}
	async function lookup(event) {
		event.preventDefault();
		setError("");
		setPending(true);
		const res = await lookupPhoneFn({ data: { phone } });
		if (!res.ok) {
			setPending(false);
			setError(res.error);
			return;
		}
		if (!res.data.registered) {
			setPending(false);
			setError("این شماره ثبت نشده است.");
			setStep("phone");
			return;
		}
		if (!res.data.hasPassword) {
			const codeRes = await sendPhoneCodeFn({ data: {
				phone,
				purpose: "login"
			} });
			setPending(false);
			if (!codeRes.ok) {
				setError(codeRes.error);
				return;
			}
			setShownCode(codeRes.data.code);
			setCode("");
			setStep("code");
			return;
		}
		setPending(false);
		setStep("password");
	}
	async function withPassword(event) {
		event.preventDefault();
		setError("");
		setPending(true);
		const res = await signInPhoneFn({ data: {
			phone,
			password
		} });
		setPending(false);
		if (!res.ok) {
			setError(res.error);
			return;
		}
		await enter(res.data.token);
	}
	async function requestCode(purpose) {
		setError("");
		setCode("");
		setShownCode("");
		setNextPassword("");
		setConfirm("");
		setPending(true);
		const res = await sendPhoneCodeFn({ data: {
			phone,
			purpose
		} });
		setPending(false);
		if (!res.ok) {
			setError(res.error);
			return;
		}
		setShownCode(res.data.code);
		setStep(purpose === "reset" ? "reset" : "code");
	}
	async function withCode(event) {
		event.preventDefault();
		setError("");
		setPending(true);
		const res = await signInPhoneCodeFn({ data: {
			phone,
			code
		} });
		setPending(false);
		if (!res.ok) {
			setError(res.error);
			return;
		}
		await enter(res.data.token);
	}
	async function changePassword(event) {
		event.preventDefault();
		setError("");
		setPending(true);
		const res = await resetPhonePasswordFn({ data: {
			phone,
			code,
			password: nextPassword,
			confirm
		} });
		setPending(false);
		if (!res.ok) {
			setError(res.error);
			return;
		}
		await enter(res.data.token);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid max-w-md gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-3xl font-extrabold",
				children: "ورود"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-6 text-muted",
				children: "شماره موبایل را بنویسید. اگر حساب داشته باشید، رمز یا کد تأیید خواسته می‌شود."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				step === "phone" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "grid gap-3",
					onSubmit: (event) => {
						event.preventDefault();
						lookup(event);
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
						error.includes("ثبت نشده") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/start",
							className: "text-sm font-semibold text-jade",
							children: "شروع رایگان و ساخت حساب"
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: pending || !isIranMobile(phone),
							children: pending ? "در حال بررسی" : "ادامه"
						})
					]
				}) : null,
				step === "password" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "grid gap-3",
					onSubmit: (event) => {
						event.preventDefault();
						withPassword(event);
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							dir: "ltr",
							children: faNum(`+98 ${formatIranMobile(phone)}`)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "رمز عبور",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								type: "password",
								dir: "ltr",
								className: "text-left",
								autoComplete: "current-password",
								value: password,
								onChange: (e) => setPassword(e.target.value),
								required: true
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-x-4 gap-y-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "font-semibold text-jade",
								onClick: () => requestCode("reset"),
								children: "فراموشی رمز عبور"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "font-semibold text-ink",
								onClick: () => requestCode("login"),
								children: "ورود بدون رمز"
							})]
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: error }) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: pending,
							children: pending ? "در حال ورود" : "ورود"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "text-sm text-muted",
							onClick: () => {
								setStep("phone");
								setError("");
							},
							children: "تغییر شماره"
						})
					]
				}) : null,
				step === "code" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "grid gap-3",
					onSubmit: (event) => {
						event.preventDefault();
						withCode(event);
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeNotice, { code: shownCode }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "کد تأیید",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OtpField, {
								value: code,
								onChange: setCode
							})
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: error }) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: pending || code.length < 6,
							children: pending ? "در حال ورود" : "ورود"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "text-sm text-muted",
							onClick: () => setStep("password"),
							children: "بازگشت"
						})
					]
				}) : null,
				step === "reset" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "grid gap-3",
					onSubmit: (event) => {
						event.preventDefault();
						changePassword(event);
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CodeNotice, { code: shownCode }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "کد تأیید",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OtpField, {
								value: code,
								onChange: setCode
							})
						}),
						code.trim().length >= 6 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "رمز تازه",
							hint: "حداقل ۸ نویسه",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								type: "password",
								dir: "ltr",
								className: "text-left",
								autoComplete: "new-password",
								value: nextPassword,
								onChange: (e) => setNextPassword(e.target.value),
								required: true,
								minLength: 8
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "تکرار رمز",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								type: "password",
								dir: "ltr",
								className: "text-left",
								autoComplete: "new-password",
								value: confirm,
								onChange: (e) => setConfirm(e.target.value),
								required: true,
								minLength: 8
							})
						})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "کد را وارد کنید تا رمز تازه را بنویسید."
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNote, { children: error }) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: pending || code.trim().length < 6,
							children: pending ? "در حال ذخیره" : "تأیید و ورود"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "text-sm text-muted",
							onClick: () => setStep("password"),
							children: "بازگشت"
						})
					]
				}) : null
			] })
		]
	}) });
}
function CodeNotice({ code }) {
	if (!code) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "rounded-xl bg-paper-deep px-3 py-2 text-sm leading-6",
		children: ["پیامک وصل نیست. کد تأیید: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-bold",
			dir: "ltr",
			children: faNum(code)
		})]
	});
}
//#endregion
export { AuthPage as component };
