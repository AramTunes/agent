import { i as __toESM } from "../_runtime.mjs";
import { F as saveScheduleFn, I as saveServiceFn, K as uploadPageFile, O as publicBusinessFn, R as saveStaffFn, W as updateBusinessFn, q as uploadPageVideo, u as categoriesFn, v as deleteServiceFn, x as manageBusinessFn, y as deleteStaffFn } from "./api-vBbERkBq.mjs";
import { X as require_jsx_runtime, Z as require_react, d as require_react_dom, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as fitAvatar, c as readyAvatars, l as rememberPageAvatar, n as RoundAvatar, o as pageImageKey, s as readPageAvatar } from "./page-avatar-BIJU5HCZ.mjs";
import { l as usePanel } from "./account-CxecnhcZ.mjs";
import { _ as faFileSize, b as toman, d as TextInput, g as enDigits, h as cn, l as Skeleton, p as WEEKDAYS_FA, r as Button, s as Field, t as Area, u as Stepper, v as faNum, y as minutesLabel } from "./ui-CYEMVOYZ.mjs";
import { $ as MapPin, B as Pencil, Ct as File$1, Dt as Ellipsis, E as ShoppingBag, Ft as ChevronRight, I as Plus, It as ChevronLeft, J as Minus, K as Newspaper, Kt as Briefcase, Nt as CircleHelp, O as Share2, R as Phone, S as Star, T as SlidersHorizontal, Tt as FileText, U as Palette, Wt as CalendarPlus, c as UtensilsCrossed, f as Type, g as Trash2, gt as GraduationCap, ht as GripVertical, jt as Copy, k as Settings, l as Users, lt as Image$1, o as Video, r as X, rt as Link2, u as User, ut as ImagePlus, wt as FileUp } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as AnimatedTabs } from "./animated-tabs-B0-uRxFM.mjs";
import { n as pageIcon, t as iconsForSlug } from "./page-icons-BbT14YzL.mjs";
import { i as fitImage, r as Switch, t as MenuFields } from "./menu-block-BG4_aCM-.mjs";
import { C as videoWatch, S as themeColors, _ as normalizeDesign, a as AttachmentDescription, b as socialKinds, c as CustomerLink, d as addressKinds, f as cleanHex, g as gradientCss, h as defaultPageDesign, i as AttachmentContent, m as contactKinds, n as AttachmentAction, o as AttachmentMedia, p as contactKind, r as AttachmentActions, s as AttachmentTitle, t as Attachment, u as DividerLine, v as parseDesign, x as socialValueOk, y as resolveTheme } from "./link-page-3N_beGwN.mjs";
import { n as ScrollArea, t as QrDialog } from "./qr-share-ptNirTZ7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/links-r45mlN3T.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom());
/** آپلود فایل. برگرفته از وایب‌فارسی: ناحیه رها کردن، حجم فارسی، حذف. */
function FileUpload({ accept, multiple = true, maxSize, onFiles, onAdd, showList = true, hint, className }) {
	const [files, setFiles] = (0, import_react.useState)([]);
	const [over, setOver] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const inputRef = (0, import_react.useRef)(null);
	function add(list) {
		if (!list) return;
		const incoming = Array.from(list);
		const tooBig = maxSize ? incoming.find((file) => file.size > maxSize) : void 0;
		if (tooBig) {
			setError(`«${tooBig.name}» بزرگ‌تر از ${faFileSize(maxSize)} است.`);
			return;
		}
		setError(null);
		const picked = multiple ? incoming : incoming.slice(0, 1);
		if (!showList) {
			onAdd?.(picked);
			return;
		}
		const next = multiple ? [...files, ...picked] : picked;
		setFiles(next);
		onFiles?.(next);
	}
	function onDragOver(event) {
		event.preventDefault();
		setOver(true);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("space-y-2", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				tabIndex: 0,
				onKeyDown: (event) => {
					if (event.key === "Enter" || event.key === " ") {
						event.preventDefault();
						inputRef.current?.click();
					}
				},
				onDragOver,
				onDragLeave: () => setOver(false),
				onDrop: (event) => {
					event.preventDefault();
					setOver(false);
					add(event.dataTransfer.files);
				},
				className: cn("flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed p-6 text-center transition-colors", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade/60", over ? "border-ink bg-paper-deep" : "border-line bg-card hover:bg-paper"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, { className: "size-5 text-muted" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm",
						children: ["فایل را این‌جا رها کنید یا ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium underline underline-offset-4",
							children: "انتخاب کنید"
						})]
					}),
					hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: hint
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: inputRef,
						type: "file",
						accept,
						multiple,
						className: "sr-only",
						onChange: (event) => {
							const input = event.currentTarget;
							add(input.files);
							queueMicrotask(() => {
								input.value = "";
							});
						}
					})
				]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-danger",
				children: error
			}) : null,
			showList && files.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-line rounded-xl border border-line",
				children: files.map((file, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-2 px-3 py-2 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 flex-1 truncate",
							dir: "auto",
							children: file.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "shrink-0 text-muted",
							children: faFileSize(file.size)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "حذف",
							onClick: () => {
								const next = files.filter((_, item) => item !== index);
								setFiles(next);
								onFiles?.(next);
							},
							className: "rounded p-0.5 text-muted hover:text-ink",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
						})
					]
				}, `${file.name}-${index}`))
			}) : null
		]
	});
}
var tabs = [
	{
		id: "theme",
		label: "تم"
	},
	{
		id: "background",
		label: "پس‌زمینه"
	},
	{
		id: "layout",
		label: "چینش"
	},
	{
		id: "radius",
		label: "گوشه‌ها"
	}
];
function DesignStudio({ design, businessId, onChange, onClose, onSave }) {
	const [tab, setTab] = (0, import_react.useState)("theme");
	const [crop, setCrop] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [note, setNote] = (0, import_react.useState)("");
	const designRef = (0, import_react.useRef)(design);
	designRef.current = design;
	const patch = (next) => onChange({
		...designRef.current,
		...next
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-x-0 bottom-0 z-[60] flex h-[min(58dvh,34rem)] w-full max-w-full flex-col overflow-hidden rounded-t-[1.6rem] border border-line bg-card text-ink shadow-[0_-16px_40px_rgb(0_0_0/0.18)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mt-2 h-1.5 w-12 shrink-0 rounded-full bg-line" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid shrink-0 grid-cols-4 gap-1.5 px-3 pb-2 pt-3",
				children: tabs.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(item.id),
					className: `min-h-11 min-w-0 rounded-full px-1 text-center text-xs font-semibold ${tab === item.id ? "bg-ink text-on-ink" : "border border-line bg-paper text-ink"}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block truncate",
						children: item.label
					})
				}, item.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pb-3",
				children: [
					tab === "theme" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemePane, {
						design,
						onChange: patch
					}) : null,
					tab === "background" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BackgroundPane, {
						design,
						busy,
						note,
						onChange: patch,
						onImage: openCrop,
						onVideo: (file) => void uploadVideo(file)
					}) : null,
					tab === "layout" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutPane, {
						design,
						onChange: patch
					}) : null,
					tab === "radius" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RadiusPane, {
						design,
						onChange: (radius) => patch({ radius })
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 gap-2 border-t border-line px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					className: "inline-flex h-11 flex-1 items-center justify-center rounded-full border border-line bg-paper text-sm font-semibold",
					children: "انصراف"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onSave,
					className: "inline-flex h-11 flex-1 items-center justify-center rounded-full bg-ink text-sm font-semibold text-on-ink",
					children: "ذخیره"
				})]
			})
		]
	}), crop ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CropSheet, {
		src: crop,
		onCancel: () => setCrop(null),
		onSave: (file) => void uploadImage(file)
	}) : null] });
	async function uploadImage(file) {
		if (!businessId) {
			setNote("صفحه هنوز آماده نیست");
			return;
		}
		setBusy(true);
		setNote("");
		const res = await uploadPageFile(businessId, file);
		setBusy(false);
		if (!res.ok) {
			setNote(res.error);
			toast.error(res.error);
			return;
		}
		setCrop(null);
		patch({
			bgKind: "image",
			image: res.data.url
		});
	}
	async function uploadVideo(file) {
		if (!businessId) {
			setNote("صفحه هنوز آماده نیست");
			return;
		}
		if (!videoFile(file)) {
			setNote("فقط فیلم mp4، webm یا mov");
			return;
		}
		setBusy(true);
		setNote("");
		const res = await uploadPageVideo(businessId, file);
		setBusy(false);
		if (!res.ok) {
			setNote(res.error);
			toast.error(res.error);
			return;
		}
		patch({
			bgKind: "video",
			video: res.data.url
		});
	}
	function openCrop(file) {
		if (!file.type.startsWith("image/") && !/\.(png|jpe?g|webp|gif)$/i.test(file.name)) {
			setNote("فقط تصویر jpg، png، webp یا gif");
			return;
		}
		if (file.size > 12582912) {
			setNote("حجم تصویر بیشتر از ۱۲ مگابایت است");
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			const src = String(reader.result || "");
			const probe = new Image();
			probe.onload = () => setCrop(src);
			probe.onerror = () => setNote("این تصویر باز نشد. jpg یا png بفرست");
			probe.src = src;
		};
		reader.onerror = () => setNote("خواندن تصویر ممکن نشد");
		reader.readAsDataURL(file);
	}
}
function videoFile(file) {
	const name = file.name.toLowerCase();
	const type = file.type.toLowerCase();
	return name.endsWith(".mp4") || name.endsWith(".webm") || name.endsWith(".mov") || name.endsWith(".m4v") || type.includes("mp4") || type.includes("webm") || type.includes("quicktime");
}
function ThemePane({ design, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Group, {
				title: "پایه",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-3 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeCard, {
							label: "روشن",
							theme: "light",
							selected: design.theme === "light",
							onPick: (theme) => onChange({ theme }),
							sample: {
								...defaultPageDesign,
								theme: "light"
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeCard, {
							label: "تاریک",
							theme: "dark",
							selected: design.theme === "dark",
							onPick: (theme) => onChange({ theme }),
							sample: {
								...defaultPageDesign,
								theme: "dark"
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeCard, {
							label: "اختصاصی",
							theme: "custom",
							selected: design.theme === "custom",
							onPick: (theme) => onChange({ theme }),
							sample: {
								...defaultPageDesign,
								theme: "custom",
								accent: design.accent || "#00A693"
							}
						})
					]
				}), design.theme === "custom" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorField, {
						label: "رنگ اختصاصی",
						value: design.accent || "#00A693",
						onChange: (accent) => onChange({ accent })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NamedColors, {
						title: "رنگ‌های پیشنهادی",
						value: design.accent,
						onPick: (accent) => onChange({ accent })
					})]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Group, {
				title: "رنگ‌های روشن",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-2",
					children: themeColors.map((color) => {
						const id = `light-${color.hex.slice(1)}`;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeCard, {
							label: color.name,
							theme: id,
							selected: design.theme === id,
							onPick: (theme) => onChange({ theme }),
							sample: {
								...defaultPageDesign,
								theme: id
							},
							swatch: color.hex
						}, id);
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Group, {
				title: "رنگ‌های تیره",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-2",
					children: themeColors.map((color) => {
						const id = `dark-${color.hex.slice(1)}`;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeCard, {
							label: color.name,
							theme: id,
							selected: design.theme === id,
							onPick: (theme) => onChange({ theme }),
							sample: {
								...defaultPageDesign,
								theme: id
							},
							swatch: color.hex
						}, id);
					})
				})
			})
		]
	});
}
function ThemeCard({ label, theme, selected, onPick, sample, swatch }) {
	const tokens = resolveTheme(sample);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => onPick(theme),
		className: `w-full rounded-2xl border p-2 text-start ${selected ? "border-ink ring-2 ring-ink" : "border-line"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "mb-2 flex min-w-0 items-center gap-2 text-sm font-semibold",
			children: [swatch ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swatch, { value: swatch }) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "truncate",
				children: label
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "grid gap-1 rounded-xl p-2",
			style: { background: tokens.bg },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "h-4 rounded-md border border-black/15",
				style: { background: tokens.card }
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "h-4 w-12 rounded-full border border-black/15",
				style: { background: tokens.button }
			})]
		})]
	});
}
function BackgroundPane({ design, busy, note, onChange, onImage, onVideo }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid min-w-0 gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold",
				children: "رنگ پس‌زمینه"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-4 gap-1.5",
				children: [
					["solid", "تک‌رنگ"],
					["gradient", "گرادیانت"],
					["image", "تصویر"],
					["video", "ویدیو"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => onChange({ bgKind: id }),
					className: `min-h-11 min-w-0 rounded-full px-1 text-center text-xs font-semibold ${design.bgKind === id ? "bg-ink text-on-ink" : "border border-line bg-paper"}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block truncate",
						children: label
					})
				}, id))
			}),
			design.bgKind === "solid" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorField, {
				label: "رنگ",
				value: design.bgColor || "#111111",
				onChange: (bgColor) => onChange({ bgColor })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NamedColors, {
				title: "رنگ‌های پیشنهادی",
				value: design.bgColor,
				onPick: (bgColor) => onChange({ bgColor })
			})] }) : null,
			design.bgKind === "gradient" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GradientField, {
				design,
				onChange
			}) : null,
			design.bgKind === "image" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				design.image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: design.image,
					alt: "",
					className: "h-28 w-full rounded-2xl object-cover"
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePick, {
					accept: "image/*",
					label: busy ? "در حال آپلود" : design.image ? "عوض کردن تصویر" : "آپلود تصویر",
					disabled: busy,
					onFile: onImage
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EffectField, {
					design,
					onChange
				})
			] }) : null,
			design.bgKind === "video" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				design.video ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					src: design.video,
					className: "h-28 w-full rounded-2xl bg-black object-cover",
					muted: true,
					playsInline: true
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePick, {
					accept: "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov",
					label: busy ? "در حال آپلود" : design.video ? "عوض کردن ویدیو" : "آپلود ویدیو",
					disabled: busy,
					onFile: onVideo
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs leading-5 text-muted",
					children: "ویدیو خودش اندازهٔ صفحه می‌شود. mp4، webm یا mov."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EffectField, {
					design,
					onChange
				})
			] }) : null,
			note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-danger",
				children: note
			}) : null
		]
	});
}
function FilePick({ accept, label, disabled, onFile }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: `relative flex min-h-20 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-line bg-paper text-sm font-semibold ${disabled ? "opacity-60" : ""}`,
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "file",
			accept,
			disabled,
			className: "absolute inset-0 cursor-pointer opacity-0",
			onChange: (event) => {
				const file = event.target.files?.[0];
				event.target.value = "";
				if (file) onFile(file);
			}
		})]
	});
}
function GradientField({ design, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-14 rounded-2xl border border-line",
				style: { background: gradientCss(design) }
			}),
			design.gradientColors.map((color, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 rounded-2xl border border-line p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-2 text-sm font-semibold",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swatch, { value: color }),
								"رنگ ",
								faNum(index + 1)
							]
						}), design.gradientColors.length > 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "text-xs font-semibold text-danger",
							onClick: () => {
								onChange({
									gradientColors: design.gradientColors.filter((_, at) => at !== index),
									gradientStops: design.gradientStops.filter((_, at) => at !== index)
								});
							},
							children: "حذف"
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ColorField, {
						label: "کد رنگ",
						value: color,
						onChange: (next) => onChange({ gradientColors: design.gradientColors.map((item, at) => at === index ? next : item) })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "grid gap-1 text-xs text-muted",
						children: ["جای رنگ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 0,
							max: 100,
							value: design.gradientStops[index] ?? 0,
							onChange: (event) => onChange({ gradientStops: design.gradientStops.map((item, at) => at === index ? Number(event.target.value) : item) })
						})]
					})
				]
			}, `${color}-${index}`)),
			design.gradientColors.length < 4 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "h-11 rounded-full border border-line text-sm font-semibold",
				onClick: () => onChange({
					gradientColors: [...design.gradientColors, "#F77FBE"],
					gradientStops: [...design.gradientStops, 100]
				}),
				children: "افزودن رنگ"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-1.5",
				children: [
					["tb", "بالا و پایین"],
					["lr", "چپ و راست"],
					["radial", "شعاعی"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onChange({ gradientDir: id }),
					className: `min-w-0 rounded-2xl border p-2 text-xs font-semibold ${design.gradientDir === id ? "border-ink ring-2 ring-ink" : "border-line"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-2 block h-8 w-full rounded-lg",
						style: { background: gradientCss({
							...design,
							gradientDir: id
						}) }
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block truncate",
						children: label
					})]
				}, id))
			})
		]
	});
}
function EffectField({ design, onChange }) {
	const tint = resolveTheme(design).light ? "#000000" : "#FFFFFF";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold",
				children: "افکت"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-1.5",
				children: [
					["none", "هیچ"],
					["tint", "تک‌رنگ"],
					["blur", "محو"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => onChange({ effect: id }),
					className: `min-h-11 min-w-0 rounded-full px-1 text-xs font-semibold ${design.effect === id ? "bg-ink text-on-ink" : "border border-line"}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block truncate",
						children: label
					})
				}, id))
			}),
			design.effect === "tint" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "grid gap-1 text-xs text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-2",
					children: ["شدت پوشش ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swatch, { value: tint })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "range",
					min: 0,
					max: 80,
					value: design.effectAmount,
					onChange: (event) => onChange({ effectAmount: Number(event.target.value) })
				})]
			}) : null,
			design.effect === "blur" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "grid gap-1 text-xs text-muted",
				children: ["شدت محو", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "range",
					min: 0,
					max: 100,
					value: design.effectAmount,
					onChange: (event) => onChange({ effectAmount: Number(event.target.value) })
				})]
			}) : null
		]
	});
}
function LayoutPane({ design, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-2 gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PickCard, {
				label: "لیستی",
				selected: design.layout === "list",
				onClick: () => onChange({ layout: "list" }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "grid gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "h-3 rounded-full",
							style: {
								background: "currentColor",
								opacity: .85
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "h-3 rounded-full",
							style: {
								background: "currentColor",
								opacity: .55
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "h-3 rounded-full",
							style: {
								background: "currentColor",
								opacity: .3
							}
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PickCard, {
				label: "کارتی",
				selected: design.layout === "card",
				onClick: () => onChange({ layout: "card" }),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "grid grid-cols-2 gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "aspect-square rounded-lg",
						style: {
							background: "currentColor",
							opacity: .85
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "aspect-square rounded-lg",
						style: {
							background: "currentColor",
							opacity: .45
						}
					})]
				})
			})]
		}), design.layout === "card" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => onChange({ columns: 1 }),
				className: `h-11 flex-1 rounded-full text-sm font-semibold ${design.columns === 1 ? "bg-ink text-on-ink" : "border border-line"}`,
				children: "یک ستونه"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => onChange({ columns: 2 }),
				className: `h-11 flex-1 rounded-full text-sm font-semibold ${design.columns === 2 ? "bg-ink text-on-ink" : "border border-line"}`,
				children: "دو ستونه"
			})]
		}) : null]
	});
}
function RadiusPane({ design, onChange }) {
	const options = [
		[
			"sharp",
			"گوشه تیز",
			"0px"
		],
		[
			"round",
			"گوشه گرد",
			"1.25rem"
		],
		[
			"pill",
			"دایره‌ای",
			design.layout === "card" ? "1.25rem" : "999px"
		]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-3 gap-2",
		children: options.map(([id, label, radius]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PickCard, {
			label,
			selected: design.radius === id,
			onClick: () => onChange(id),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mx-auto block h-8 w-full border border-black/10",
				style: {
					borderRadius: radius,
					background: "currentColor",
					opacity: .85
				}
			})
		}, id))
	});
}
function CropSheet({ src, onCancel, onSave }) {
	const frameRef = (0, import_react.useRef)(null);
	const [zoom, setZoom] = (0, import_react.useState)(1);
	const [offset, setOffset] = (0, import_react.useState)({
		x: 0,
		y: 0
	});
	const [frame, setFrame] = (0, import_react.useState)({
		w: 0,
		h: 0
	});
	const [natural, setNatural] = (0, import_react.useState)({
		w: 0,
		h: 0
	});
	const drag = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const box = frameRef.current;
		if (!box) return;
		const measure = () => setFrame({
			w: box.clientWidth,
			h: box.clientHeight
		});
		measure();
		const watch = new ResizeObserver(measure);
		watch.observe(box);
		return () => watch.disconnect();
	}, []);
	(0, import_react.useEffect)(() => {
		const img = new Image();
		img.onload = () => setNatural({
			w: img.naturalWidth,
			h: img.naturalHeight
		});
		img.src = src;
	}, [src]);
	const placed = placeCover(frame, natural, zoom, offset);
	function nudge(dx, dy) {
		setOffset((current) => {
			const next = placeCover(frame, natural, zoom, {
				x: current.x + dx,
				y: current.y + dy
			});
			return {
				x: next.x,
				y: next.y
			};
		});
	}
	function move(event) {
		if (!drag.current) return;
		const next = placeCover(frame, natural, zoom, {
			x: drag.current.ox + event.clientX - drag.current.x,
			y: drag.current.oy + event.clientY - drag.current.y
		});
		setOffset({
			x: next.x,
			y: next.y
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[80] grid place-items-end bg-black/60 p-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-h-[92dvh] w-full overflow-y-auto rounded-[1.4rem] bg-card p-4 text-ink",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold",
					children: "برش تصویر"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs leading-5 text-muted",
					children: "عکس را بکش یا با دکمه‌ها جابه‌جا کن. قاب همیشه پر می‌ماند."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					ref: frameRef,
					className: "relative mx-auto mt-3 aspect-[9/16] h-[34dvh] overflow-hidden rounded-2xl bg-black",
					style: { touchAction: "none" },
					onPointerDown: (event) => {
						event.currentTarget.setPointerCapture(event.pointerId);
						drag.current = {
							x: event.clientX,
							y: event.clientY,
							ox: placed.x,
							oy: placed.y
						};
					},
					onPointerMove: move,
					onPointerUp: () => {
						drag.current = null;
					},
					onPointerCancel: () => {
						drag.current = null;
					},
					children: placed.dw ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src,
						alt: "",
						draggable: false,
						className: "absolute max-w-none select-none",
						style: {
							width: placed.dw,
							height: placed.dh,
							left: placed.left,
							top: placed.top
						}
					}) : null
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid grid-cols-4 gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => nudge(0, -36),
							className: "h-10 rounded-full border border-line text-xs font-semibold",
							children: "بالا"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => nudge(0, 36),
							className: "h-10 rounded-full border border-line text-xs font-semibold",
							children: "پایین"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => nudge(-36, 0),
							className: "h-10 rounded-full border border-line text-xs font-semibold",
							children: "چپ"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => nudge(36, 0),
							className: "h-10 rounded-full border border-line text-xs font-semibold",
							children: "راست"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-3 grid gap-1 text-xs text-muted",
					children: ["بزرگ‌نمایی", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 1,
						max: 3,
						step: .01,
						value: zoom,
						onChange: (event) => {
							const nextZoom = Number(event.target.value);
							setZoom(nextZoom);
							setOffset((current) => {
								const next = placeCover(frame, natural, nextZoom, current);
								return {
									x: next.x,
									y: next.y
								};
							});
						}
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onCancel,
						className: "h-11 flex-1 rounded-full border border-line text-sm font-semibold",
						children: "انصراف"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => void exportCrop(src, zoom, offset, frame).then(onSave).catch(() => toast.error("برش تصویر ممکن نشد")),
						className: "h-11 flex-1 rounded-full bg-ink text-sm font-semibold text-on-ink",
						children: "ثبت و آپلود"
					})]
				})
			]
		})
	});
}
function placeCover(frame, natural, zoom, offset) {
	if (!frame.w || !frame.h || !natural.w || !natural.h) return {
		x: 0,
		y: 0,
		dw: 0,
		dh: 0,
		left: 0,
		top: 0
	};
	const cover = Math.max(frame.w / natural.w, frame.h / natural.h);
	const dw = natural.w * cover * zoom;
	const dh = natural.h * cover * zoom;
	const maxX = Math.max(0, (dw - frame.w) / 2);
	const maxY = Math.max(0, (dh - frame.h) / 2);
	const x = Math.min(maxX, Math.max(-maxX, offset.x));
	const y = Math.min(maxY, Math.max(-maxY, offset.y));
	return {
		x,
		y,
		dw,
		dh,
		left: (frame.w - dw) / 2 + x,
		top: (frame.h - dh) / 2 + y
	};
}
function exportCrop(src, zoom, offset, frame) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			const outW = 1080;
			const outH = 1920;
			const canvas = document.createElement("canvas");
			canvas.width = outW;
			canvas.height = outH;
			const ctx = canvas.getContext("2d");
			const placed = placeCover(frame, {
				w: img.naturalWidth,
				h: img.naturalHeight
			}, zoom, offset);
			if (!ctx || !placed.dw || !frame.w || !frame.h) {
				reject(/* @__PURE__ */ new Error("canvas"));
				return;
			}
			const sx = outW / frame.w;
			const sy = outH / frame.h;
			ctx.drawImage(img, placed.left * sx, placed.top * sy, placed.dw * sx, placed.dh * sy);
			canvas.toBlob((blob) => {
				if (!blob) {
					reject(/* @__PURE__ */ new Error("blob"));
					return;
				}
				resolve(new File([blob], "background.jpg", { type: "image/jpeg" }));
			}, "image/jpeg", .86);
		};
		img.onerror = () => reject(/* @__PURE__ */ new Error("image"));
		img.src = src;
	});
}
function ColorField({ label, value, onChange }) {
	const [text, setText] = (0, import_react.useState)(value);
	(0, import_react.useEffect)(() => {
		setText(value);
	}, [value]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "grid gap-1 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "inline-flex items-center gap-2 font-semibold",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swatch, { value: cleanHex(value) || "#111111" }), label]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "color",
				value: cleanHex(value) || "#111111",
				onChange: (event) => {
					setText(event.target.value.toUpperCase());
					onChange(event.target.value.toUpperCase());
				},
				className: "size-11 shrink-0 rounded-xl border border-line bg-card"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				dir: "ltr",
				value: text,
				onChange: (event) => {
					setText(event.target.value);
					const next = cleanHex(event.target.value);
					if (next) onChange(next);
				},
				className: "min-h-11 w-full rounded-xl border border-line bg-card px-3 text-left text-sm outline-none"
			})]
		})]
	});
}
function NamedColors({ title, value, onPick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs font-semibold text-muted",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-2",
			children: themeColors.map((color) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onPick(color.hex),
				className: `flex items-center gap-2 rounded-xl border px-2 py-2 text-start text-sm font-semibold ${value.toUpperCase() === color.hex ? "border-ink" : "border-line"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swatch, { value: color.hex }), color.name]
			}, color.hex))
		})]
	});
}
function Swatch({ value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-block size-4 shrink-0 rounded-full border border-black/10",
		style: { background: value }
	});
}
function Group({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "grid gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "text-sm font-bold",
			children: title
		}), children]
	});
}
function PickCard({ label, selected, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: `w-full rounded-2xl border p-3 text-start text-sm font-semibold ${selected ? "border-ink ring-2 ring-ink" : "border-line"}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "grid gap-2",
			children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block truncate",
				children: label
			})]
		})
	});
}
var dayOrder = [
	6,
	0,
	1,
	2,
	3,
	4,
	5
];
var blankService = {
	id: "",
	name: "",
	description: "",
	durationMinutes: 45,
	bufferMinutes: 10,
	priceToman: 0,
	active: true
};
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
function plansOf(weekly) {
	return dayOrder.map((weekday) => {
		const ranges = (weekly ?? []).filter((item) => item.weekday === weekday).map((item) => ({
			start: pad(item.startMin),
			end: pad(item.endMin)
		}));
		return {
			weekday,
			enabled: weekly ? ranges.length > 0 : weekday !== 5,
			ranges: ranges.length ? ranges : [{
				start: "09:00",
				end: "18:00"
			}]
		};
	});
}
function bookingPath(url) {
	const value = url.trim().replace(/^\/+|\/+$/g, "");
	if (!value || value.includes("://") || value.includes("/") || value.length > 40) return "";
	return value;
}
function BookingFields({ businessId, slug, title, body, url, image, onTitle, onBody, onUrl, onImage, onBack, onSaveBlock }) {
	const [step, setStep] = (0, import_react.useState)(0);
	const fileRef = (0, import_react.useRef)(null);
	const servicesRef = (0, import_react.useRef)(null);
	const staffRef = (0, import_react.useRef)(null);
	const prefix = slug ? `/b/${slug}/` : "/b/نام‌کاربری/";
	async function next() {
		if (step === 1) {
			if (!await servicesRef.current?.flush()) return;
		}
		setStep((value) => value + 1);
	}
	async function finish() {
		if (await staffRef.current?.flush() === false) return;
		onSaveBlock();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stepper, {
			current: step,
			steps: [
				{ label: "معرفی" },
				{ label: "خدمات" },
				{ label: "پرسنل" }
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8",
			children: [
				step === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IntroStep, {
					fileRef,
					title,
					body,
					path: bookingPath(url),
					image,
					prefix,
					onTitle,
					onBody,
					onUrl,
					onImage
				}) : null,
				step === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServicesStep, {
					ref: servicesRef,
					businessId
				}) : null,
				step === 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaffStep, {
					ref: staffRef,
					businessId
				}) : null
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 flex justify-end gap-2",
			children: step < 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => step === 0 ? onBack() : setStep((value) => value - 1),
				className: "inline-flex h-11 items-center justify-center rounded-full border border-line bg-paper px-5 text-sm font-semibold",
				children: "بازگشت"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => void next(),
				className: "inline-flex h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-on-ink",
				children: "بعدی"
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => void finish(),
				className: "inline-flex h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-on-ink",
				children: "ذخیره"
			})
		})
	] });
}
function IntroStep({ fileRef, title, body, path, image, prefix, onTitle, onBody, onUrl, onImage }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
			label: "عکس",
			hint: "دلخواه",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: fileRef,
				type: "file",
				accept: "image/*",
				className: "sr-only",
				onChange: (event) => {
					const file = event.target.files?.[0];
					event.target.value = "";
					if (!file) return;
					fitImage(file).then(onImage).catch(() => toast.error("این تصویر باز نشد"));
				}
			}), image ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative overflow-hidden rounded-xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: image,
					alt: "",
					className: "h-44 w-full object-cover"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/70 px-3 py-2 text-sm font-semibold text-white",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => fileRef.current?.click(),
						className: "inline-flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, {
							className: "size-4",
							"aria-hidden": "true"
						}), "ویرایش"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onImage(""),
						className: "inline-flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
							className: "size-4",
							"aria-hidden": "true"
						}), "حذف"]
					})]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => fileRef.current?.click(),
				className: "flex h-44 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-paper text-sm font-semibold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, {
					className: "size-5",
					"aria-hidden": "true"
				}), "افزودن از گالری"]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "عنوان",
				hint: "دلخواه. اگر خالی بماند، «رزرو نوبت» نوشته می‌شود",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					value: title,
					maxLength: 80,
					onChange: (event) => onTitle(event.target.value)
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "توضیحات",
				hint: "دلخواه",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
					value: body,
					maxLength: 100,
					className: "min-h-16",
					onChange: (event) => onBody(event.target.value.slice(0, 100))
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs tabular-nums text-muted",
				children: [
					faNum(body.length),
					" از ",
					faNum(100)
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "نشانی صفحه رزرو",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					dir: "ltr",
					className: "flex min-h-11 overflow-hidden rounded-xl border border-line bg-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "flex items-center bg-paper px-3 text-xs text-muted",
						children: prefix
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: path,
						maxLength: 40,
						placeholder: "book",
						onChange: (event) => onUrl(event.target.value.replace(/\s/g, "").slice(0, 40)),
						className: "min-w-0 flex-1 bg-transparent px-3 text-left text-sm outline-none"
					})]
				})
			})
		})
	] });
}
var ServicesStep = (0, import_react.forwardRef)(function ServicesStep({ businessId }, ref) {
	const [items, setItems] = (0, import_react.useState)([]);
	const [draft, setDraft] = (0, import_react.useState)(null);
	const [saving, setSaving] = (0, import_react.useState)(false);
	function load() {
		manageBusinessFn({ data: { businessId } }).then((res) => {
			if (!res.ok) {
				toast.error(res.error);
				return;
			}
			setItems(res.data.services ?? []);
		});
	}
	(0, import_react.useEffect)(() => {
		if (businessId) load();
	}, [businessId]);
	async function save() {
		if (!draft) return true;
		if (draft.name.trim().length < 2) {
			if (!draft.id && !draft.name.trim() && !draft.description.trim()) {
				setDraft(null);
				return true;
			}
			toast.error("عنوان خدمت را وارد کنید");
			return false;
		}
		setSaving(true);
		const res = await saveServiceFn({ data: {
			businessId,
			...draft.id ? { id: draft.id } : {},
			name: draft.name.trim(),
			description: draft.description.trim().slice(0, 100),
			durationMinutes: Number(draft.durationMinutes) || 30,
			bufferMinutes: Number(draft.bufferMinutes) || 0,
			priceToman: Number(draft.priceToman) || 0,
			active: draft.active
		} });
		setSaving(false);
		if (!res.ok) {
			toast.error(res.error);
			return false;
		}
		setDraft(null);
		load();
		return true;
	}
	(0, import_react.useImperativeHandle)(ref, () => ({ flush: save }));
	async function remove(id) {
		const res = await deleteServiceFn({ data: {
			businessId,
			id
		} });
		if (!res.ok) {
			toast.error(res.error);
			return;
		}
		if (draft?.id === id) setDraft(null);
		load();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-2",
		children: [
			items.map((item) => draft?.id === item.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceForm, {
				draft,
				saving,
				onChange: setDraft,
				onSave: () => void save()
			}, item.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceCard, {
				item,
				onEdit: () => setDraft(item),
				onDelete: () => void remove(item.id)
			}, item.id)),
			draft && !draft.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServiceForm, {
				draft,
				saving,
				onChange: setDraft,
				onSave: () => void save()
			}) : null,
			!draft ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setDraft(blankService),
				className: "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-semibold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
					className: "size-4",
					"aria-hidden": "true"
				}), "افزودن خدمت جدید"]
			}) : null
		]
	});
});
function ServiceCard({ item, onEdit, onDelete }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-xl border border-line bg-card p-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-semibold",
							children: item.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-muted",
							children: [
								minutesLabel(item.durationMinutes),
								item.bufferMinutes ? ` · ${minutesLabel(item.bufferMinutes)} آماده‌سازی` : "",
								" · ",
								toman(item.priceToman),
								item.active ? "" : " · مخفی در صفحه"
							]
						}),
						item.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 line-clamp-2 text-sm text-muted",
							children: item.description
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "ویرایش",
					onClick: onEdit,
					className: "grid size-8 place-items-center rounded-full text-muted hover:bg-paper",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "حذف",
					onClick: onDelete,
					className: "grid size-8 place-items-center rounded-full text-muted hover:bg-paper",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
				})
			]
		})
	});
}
function ServiceForm({ draft, saving, onChange, onSave }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3 rounded-xl border border-line bg-paper p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "عنوان خدمت",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					value: draft.name,
					maxLength: 80,
					onChange: (event) => onChange({
						...draft,
						name: event.target.value
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "توضیح خدمت",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
					value: draft.description,
					maxLength: 100,
					className: "min-h-16",
					onChange: (event) => onChange({
						...draft,
						description: event.target.value.slice(0, 100)
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "-mt-1 text-xs tabular-nums text-muted",
				children: [
					faNum(draft.description.length),
					" از ",
					faNum(100)
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "مدت زمان (دقیقه)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						type: "number",
						min: 5,
						max: 480,
						value: draft.durationMinutes,
						onChange: (event) => onChange({
							...draft,
							durationMinutes: Number(enDigits(event.target.value)) || 0
						})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "آماده‌سازی (دقیقه)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						type: "number",
						min: 0,
						max: 180,
						value: draft.bufferMinutes,
						onChange: (event) => onChange({
							...draft,
							bufferMinutes: Number(enDigits(event.target.value)) || 0
						})
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "قیمت (تومان)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					type: "number",
					min: 0,
					value: draft.priceToman,
					onChange: (event) => onChange({
						...draft,
						priceToman: Number(enDigits(event.target.value)) || 0
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm",
					children: "این خدمت در صفحه اصلی نمایش داده شود"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
					checked: draft.active,
					onCheckedChange: (active) => onChange({
						...draft,
						active
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: saving,
					onClick: onSave,
					className: "inline-flex h-11 items-center rounded-full border border-line bg-card px-4 text-sm font-semibold",
					children: saving ? "در حال ثبت" : "افزودن"
				})
			})
		]
	});
}
var StaffStep = (0, import_react.forwardRef)(function StaffStep({ businessId }, ref) {
	const [services, setServices] = (0, import_react.useState)([]);
	const [people, setPeople] = (0, import_react.useState)([]);
	const [draft, setDraft] = (0, import_react.useState)(null);
	const [days, setDays] = (0, import_react.useState)(plansOf(null));
	const [day, setDay] = (0, import_react.useState)(6);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const photoRef = (0, import_react.useRef)(null);
	function load() {
		manageBusinessFn({ data: { businessId } }).then((res) => {
			if (!res.ok) {
				toast.error(res.error);
				return;
			}
			setServices(res.data.services ?? []);
			setPeople(res.data.staff ?? []);
		});
	}
	(0, import_react.useEffect)(() => {
		if (businessId) load();
	}, [businessId]);
	function openNew() {
		setDraft({
			id: "",
			name: "",
			title: "",
			active: true,
			photo: "",
			serviceIds: services.filter((item) => item.active).map((item) => item.id),
			weekly: []
		});
		setDays(plansOf(null));
		setDay(6);
	}
	function openEdit(person) {
		setDraft(person);
		setDays(plansOf(person.weekly));
		setDay(6);
	}
	async function save() {
		if (!draft) return true;
		if (!draft.id && draft.name.trim().length < 2 && !draft.title.trim()) {
			setDraft(null);
			return true;
		}
		if (draft.name.trim().length < 2) {
			toast.error("نام پرسنل را وارد کنید");
			return false;
		}
		if (draft.serviceIds.length === 0) {
			toast.error("حداقل یک خدمت را انتخاب کنید");
			return false;
		}
		if (days.filter((item) => item.enabled).some((item) => item.ranges.length === 0 || item.ranges.some((range) => toMin(range.end) <= toMin(range.start)))) {
			toast.error("ساعت پایان هر بازه باید بعد از شروع باشد");
			return false;
		}
		setSaving(true);
		const saved = await saveStaffFn({ data: {
			businessId,
			...draft.id ? { id: draft.id } : {},
			name: draft.name.trim(),
			title: draft.title.trim(),
			active: true,
			photo: draft.photo ?? "",
			serviceIds: draft.serviceIds
		} });
		if (!saved.ok) {
			setSaving(false);
			toast.error(saved.error);
			return false;
		}
		const schedule = await saveScheduleFn({ data: {
			businessId,
			staffId: saved.data.staffId,
			days: days.map((item) => ({
				weekday: item.weekday,
				enabled: item.enabled,
				ranges: item.enabled ? item.ranges.map((range) => ({
					startMin: toMin(range.start),
					endMin: toMin(range.end)
				})) : []
			}))
		} });
		setSaving(false);
		if (!schedule.ok) {
			toast.error(schedule.error);
			return false;
		}
		setDraft(null);
		load();
		return true;
	}
	(0, import_react.useImperativeHandle)(ref, () => ({ flush: save }));
	async function remove(id) {
		const res = await deleteStaffFn({ data: {
			businessId,
			id
		} });
		if (!res.ok) {
			toast.error(res.error);
			return;
		}
		if (draft?.id === id) setDraft(null);
		load();
	}
	const selected = days.find((item) => item.weekday === day) ?? days[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-2",
		children: [
			services.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "اول در مرحله خدمات، حداقل یک خدمت ذخیره کنید."
			}) : null,
			people.map((person) => draft?.id === person.id ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 rounded-xl border border-line bg-card p-3",
				children: [
					person.photo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: person.photo,
						alt: "",
						className: "size-12 shrink-0 rounded-full object-cover"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-12 shrink-0 place-items-center rounded-full bg-paper text-sm font-semibold",
						children: person.name.slice(0, 1)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate font-semibold",
							children: person.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate text-xs text-muted",
							children: person.title || "بدون عنوان شغلی"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "ویرایش",
						onClick: () => openEdit(person),
						className: "grid size-8 place-items-center rounded-full text-muted hover:bg-paper",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "حذف",
						onClick: () => void remove(person.id),
						className: "grid size-8 place-items-center rounded-full text-muted hover:bg-paper",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
					})
				]
			}, person.id)),
			draft ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 rounded-xl border border-line bg-paper p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
						label: "عکس",
						hint: "دلخواه",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: photoRef,
							type: "file",
							accept: "image/*",
							className: "sr-only",
							onChange: (event) => {
								const file = event.target.files?.[0];
								event.target.value = "";
								if (!file) return;
								fitImage(file, 480).then((photo) => setDraft({
									...draft,
									photo
								})).catch(() => toast.error("این تصویر باز نشد"));
							}
						}), draft.photo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative h-28 w-28 overflow-hidden rounded-full",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: draft.photo,
								alt: "",
								className: "size-full object-cover"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "absolute inset-x-0 bottom-0 flex justify-between bg-black/70 px-2 py-1 text-[10px] font-semibold text-white",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => photoRef.current?.click(),
									children: "ویرایش"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setDraft({
										...draft,
										photo: ""
									}),
									children: "حذف"
								})]
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => photoRef.current?.click(),
							className: "flex h-28 w-28 flex-col items-center justify-center gap-1 rounded-full border border-dashed border-line bg-card text-xs font-semibold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "size-4" }), "عکس"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "نام پرسنل",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							value: draft.name,
							maxLength: 80,
							onChange: (event) => setDraft({
								...draft,
								name: event.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "عنوان شغلی",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							value: draft.title,
							maxLength: 80,
							placeholder: "مثلاً استایلیست",
							onChange: (event) => setDraft({
								...draft,
								title: event.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "خدمات پرسنل",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: services.map((service) => {
								const on = draft.serviceIds.includes(service.id);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setDraft({
										...draft,
										serviceIds: on ? draft.serviceIds.filter((id) => id !== service.id) : [...draft.serviceIds, service.id]
									}),
									className: `min-h-10 rounded-full px-3 text-sm ${on ? "bg-ink text-on-ink" : "border border-line bg-card"}`,
									children: service.name
								}, service.id);
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
						label: "روزهای کاری",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-1 overflow-x-auto pb-1",
							children: dayOrder.map((weekday) => {
								const plan = days.find((item) => item.weekday === weekday);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setDay(weekday),
									className: `shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${day === weekday ? "bg-ink text-on-ink" : "border border-line bg-card"} ${plan?.enabled ? "" : "opacity-50"}`,
									children: WEEKDAYS_FA[weekday]
								}, weekday);
							})
						}), selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-sm",
										children: [WEEKDAYS_FA[selected.weekday], " باز است"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										checked: selected.enabled,
										onCheckedChange: (enabled) => setDays(days.map((item) => item.weekday === selected.weekday ? {
											...item,
											enabled
										} : item))
									})]
								}),
								selected.enabled ? selected.ranges.map((range, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "grid flex-1 gap-1 text-xs text-muted",
											children: ["از ساعت", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "time",
												dir: "ltr",
												value: range.start,
												onChange: (event) => setDays(days.map((item) => item.weekday === selected.weekday ? {
													...item,
													ranges: item.ranges.map((row, i) => i === index ? {
														...row,
														start: event.target.value
													} : row)
												} : item)),
												className: "min-h-11 rounded-xl border border-line bg-card px-3 text-left text-sm"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "grid flex-1 gap-1 text-xs text-muted",
											children: ["تا ساعت", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "time",
												dir: "ltr",
												value: range.end,
												onChange: (event) => setDays(days.map((item) => item.weekday === selected.weekday ? {
													...item,
													ranges: item.ranges.map((row, i) => i === index ? {
														...row,
														end: event.target.value
													} : row)
												} : item)),
												className: "min-h-11 rounded-xl border border-line bg-card px-3 text-left text-sm"
											})]
										}),
										selected.ranges.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											"aria-label": "حذف بازه",
											onClick: () => setDays(days.map((item) => item.weekday === selected.weekday ? {
												...item,
												ranges: item.ranges.filter((_, i) => i !== index)
											} : item)),
											className: "mt-5 grid size-9 place-items-center text-muted",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
										}) : null
									]
								}, index)) : null,
								selected.enabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setDays(days.map((item) => item.weekday === selected.weekday ? {
										...item,
										ranges: [...item.ranges, {
											start: "09:00",
											end: "18:00"
										}]
									} : item)),
									className: "inline-flex h-10 items-center justify-center gap-1 rounded-full border border-line bg-card px-3 text-sm font-semibold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "بازه جدید"]
								}) : null
							]
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: saving,
							onClick: () => void save(),
							className: "inline-flex h-11 items-center rounded-full border border-line bg-card px-4 text-sm font-semibold",
							children: saving ? "در حال ثبت" : "افزودن"
						})
					})
				]
			}) : null,
			!draft && services.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: openNew,
				className: "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-semibold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
					className: "size-4",
					"aria-hidden": "true"
				}), "افزودن پرسنل"]
			}) : null
		]
	});
});
var catalog = [
	{
		type: "link",
		label: "لینک",
		icon: Link2
	},
	{
		type: "contact",
		label: "تماس",
		icon: Phone
	},
	{
		type: "address",
		label: "آدرس",
		icon: MapPin
	},
	{
		type: "booking",
		label: "رزرو نوبت",
		icon: CalendarPlus
	},
	{
		type: "products",
		label: "محصولات",
		icon: ShoppingBag
	},
	{
		type: "menu",
		label: "منوی دیجیتال",
		icon: UtensilsCrossed
	},
	{
		type: "services",
		label: "خدمات",
		icon: Briefcase
	},
	{
		type: "form",
		label: "فرم‌ساز",
		icon: FileText
	},
	{
		type: "event",
		label: "ایونت",
		icon: CalendarPlus
	},
	{
		type: "course",
		label: "دوره آموزشی",
		icon: GraduationCap
	},
	{
		type: "blog",
		label: "وبلاگ",
		icon: Newspaper
	},
	{
		type: "text",
		label: "متن ساده",
		icon: Type
	},
	{
		type: "social",
		label: "شبکه اجتماعی",
		icon: Share2
	},
	{
		type: "faq",
		label: "سوالات متداول",
		icon: CircleHelp
	},
	{
		type: "team",
		label: "تیم",
		icon: Users
	},
	{
		type: "gallery",
		label: "عکس",
		icon: Image$1
	},
	{
		type: "video",
		label: "فیلم",
		icon: Video
	},
	{
		type: "resume",
		label: "رزومه",
		icon: FileText
	},
	{
		type: "file",
		label: "فایل",
		icon: File$1
	},
	{
		type: "divider",
		label: "جداکننده",
		icon: Minus
	}
];
var defaultDesign = defaultPageDesign;
function kindOf(type) {
	return catalog.find((item) => item.type === type) ?? catalog[0];
}
function designKey(businessId) {
	return `agent.page-design.${businessId}`;
}
function storageKey(businessId) {
	return `agent.page-blocks.${businessId}`;
}
function reorder(items, fromId, toId) {
	const next = [...items];
	const from = next.findIndex((item) => item.id === fromId);
	const to = next.findIndex((item) => item.id === toId);
	if (from < 0 || to < 0 || from === to) return items;
	const [moved] = next.splice(from, 1);
	next.splice(to, 0, moved);
	return next;
}
function LinksPage() {
	const { businessId, memberships } = usePanel();
	const current = memberships.find((item) => item.businessId === businessId);
	const slug = current?.slug ?? "";
	const url = slug && typeof window !== "undefined" ? `${window.location.origin}/b/${slug}` : "";
	const [blocks, setBlocks] = (0, import_react.useState)([]);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [adding, setAdding] = (0, import_react.useState)(false);
	const [editor, setEditor] = (0, import_react.useState)(null);
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [drag, setDrag] = (0, import_react.useState)(null);
	const [menuId, setMenuId] = (0, import_react.useState)("");
	const [specialId, setSpecialId] = (0, import_react.useState)("");
	const listRef = (0, import_react.useRef)(null);
	const blocksRef = (0, import_react.useRef)([]);
	const [sheet, setSheet] = (0, import_react.useState)("");
	const desktop = useIsDesktop();
	const [qrOpen, setQrOpen] = (0, import_react.useState)(false);
	const [design, setDesign] = (0, import_react.useState)(defaultDesign);
	const [draft, setDraft] = (0, import_react.useState)(defaultDesign);
	const designRef = (0, import_react.useRef)(defaultDesign);
	const [avatar, setAvatar] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!businessId) {
			blocksRef.current = [];
			setBlocks([]);
			setReady(false);
			return;
		}
		let live = true;
		setReady(false);
		manageBusinessFn({ data: { businessId } }).then((res) => {
			if (!live) return;
			let next = [];
			const remote = res.ok && Array.isArray(res.data?.pageBlocks) ? res.data.pageBlocks : null;
			if (remote) next = remote.filter((item) => item.type !== "design");
			if (next.length === 0 && !remote?.some((item) => item.type === "design")) try {
				const raw = localStorage.getItem(storageKey(businessId));
				const parsed = raw ? JSON.parse(raw) : [];
				if (Array.isArray(parsed) && parsed.length) next = parsed.filter((item) => item.type !== "design");
			} catch {
				next = [];
			}
			const designBody = remote?.find((item) => item.type === "design")?.body;
			const loaded = designBody ? parseDesign(designBody) : readStoredDesign(businessId);
			designRef.current = loaded;
			setDesign(loaded);
			setDraft(loaded);
			blocksRef.current = next;
			setBlocks(next);
			try {
				localStorage.setItem(storageKey(businessId), JSON.stringify(next));
				if (slug) localStorage.setItem(`agent.page-blocks.slug.${slug}`, JSON.stringify(next));
			} catch {}
			setReady(true);
		});
		return () => {
			live = false;
		};
	}, [businessId, slug]);
	(0, import_react.useEffect)(() => {
		const value = readPageAvatar(businessId, slug);
		setAvatar(value);
		if (value) rememberPageAvatar(businessId, slug, value);
	}, [
		businessId,
		slug,
		sheet
	]);
	function persistDesign(next) {
		const clean = normalizeDesign(next);
		designRef.current = clean;
		setDesign(clean);
		setDraft(clean);
		if (businessId) try {
			localStorage.setItem(designKey(businessId), JSON.stringify(clean));
		} catch {}
		commit((items) => items);
	}
	function openDesign() {
		setDraft(designRef.current);
		setSheet("design");
	}
	function commit(recipe) {
		const next = recipe(blocksRef.current).filter((item) => item.type !== "design");
		blocksRef.current = next;
		setBlocks(next);
		if (!businessId) return;
		try {
			localStorage.setItem(storageKey(businessId), JSON.stringify(next));
			if (slug) localStorage.setItem(`agent.page-blocks.slug.${slug}`, JSON.stringify(next));
		} catch {}
		const payload = [...next, {
			id: "page-design",
			type: "design",
			active: true,
			starred: false,
			body: JSON.stringify(designRef.current)
		}];
		updateBusinessFn({ data: {
			businessId,
			pageBlocks: payload
		} }).then((res) => {
			if (!res.ok) toast.error(res.error);
		});
	}
	(0, import_react.useEffect)(() => {
		if (!menuId) return;
		const close = () => setMenuId("");
		window.addEventListener("click", close);
		return () => window.removeEventListener("click", close);
	}, [menuId]);
	(0, import_react.useEffect)(() => {
		const onAction = (event) => {
			const action = event.detail;
			if (action === "qr") setQrOpen(true);
			if (action === "preview" || action === "settings") setSheet(action);
			if (action === "design") openDesign();
		};
		window.addEventListener("agent-links-action", onAction);
		return () => window.removeEventListener("agent-links-action", onAction);
	}, []);
	function pick(type) {
		setAdding(false);
		setEditor({
			mode: "add",
			block: {
				id: "",
				type,
				active: true,
				starred: false,
				icon: type === "contact" || type === "address" || type === "social" || type === "divider" ? "" : defaultIcon(type),
				title: "",
				url: "",
				body: "",
				items: [],
				layout: type === "menu" || type === "products" || type === "services" ? "list" : "buttons",
				currency: type === "menu" || type === "products" || type === "services" ? "toman" : void 0,
				align: type === "divider" ? "center" : void 0
			}
		});
	}
	function openEditor(block) {
		setMenuId("");
		setEditor({
			mode: "edit",
			block
		});
	}
	function saveEditor(data) {
		if (!editor) return;
		if (editor.mode === "edit") update(editor.block.id, data);
		else commit((items) => [...items, {
			id: crypto.randomUUID(),
			type: editor.block.type,
			active: true,
			starred: false,
			...data
		}]);
		setEditor(null);
	}
	function update(id, patch) {
		commit((items) => items.map((item) => item.id === id ? {
			...item,
			...patch
		} : item));
	}
	function beginDrag(event, id) {
		const row = event.currentTarget.closest("[data-block]");
		const list = listRef.current;
		if (!row || !list) return;
		event.preventDefault();
		event.stopPropagation();
		const pointerId = event.pointerId;
		event.currentTarget.setPointerCapture(pointerId);
		const rows = [...list.querySelectorAll("[data-block]")];
		const origin = rows.findIndex((item) => item.dataset.block === id);
		if (origin < 0) return;
		const rect = row.getBoundingClientRect();
		const centers = rows.map((item) => {
			const box = item.getBoundingClientRect();
			return box.top + box.height / 2;
		});
		const nextTop = rows[origin + 1]?.getBoundingClientRect().top;
		const slot = nextTop ? nextTop - rect.top : rect.height + 12;
		const startY = event.clientY;
		let over = origin;
		setDrag({
			id,
			origin,
			over,
			slot,
			dy: 0
		});
		const move = (ev) => {
			if (ev.pointerId !== pointerId) return;
			ev.preventDefault();
			const dy = ev.clientY - startY;
			const y = centers[origin] + dy;
			let nextOver = 0;
			let best = Infinity;
			centers.forEach((center, index) => {
				const dist = Math.abs(center - y);
				if (dist < best) {
					best = dist;
					nextOver = index;
				}
			});
			over = nextOver;
			setDrag({
				id,
				origin,
				over,
				slot,
				dy
			});
		};
		const end = (ev) => {
			if (ev.pointerId !== pointerId) return;
			window.removeEventListener("pointermove", move);
			window.removeEventListener("pointerup", end);
			window.removeEventListener("pointercancel", end);
			if (over !== origin) {
				const targetId = rows[over]?.dataset.block ?? "";
				if (targetId) commit((items) => reorder(items, id, targetId));
			}
			setDrag(null);
		};
		window.addEventListener("pointermove", move, { passive: false });
		window.addEventListener("pointerup", end);
		window.addEventListener("pointercancel", end);
	}
	async function copyLink() {
		if (!url) return;
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1600);
		} catch {
			setCopied(false);
		}
	}
	const pageBlocks = blocks.filter((block) => block.type !== "resume");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-ink px-3 text-sm font-medium text-on-ink",
							onClick: () => setAdding(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
								className: "size-4",
								"aria-hidden": "true"
							}), "افزودن بلوک"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "hidden h-10 shrink-0 items-center gap-2 rounded-full border border-line bg-paper px-3 text-sm font-medium lg:inline-flex",
							onClick: () => setSheet("settings"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, {
								className: "size-4",
								"aria-hidden": "true"
							}), "تنظیمات صفحه"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "hidden h-10 shrink-0 items-center gap-2 rounded-full border border-line bg-paper px-3 text-sm font-medium lg:inline-flex",
							onClick: openDesign,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Palette, {
								className: "size-4",
								"aria-hidden": "true"
							}), "طراحی صفحه"]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					ref: listRef,
					className: "mt-4 grid gap-3 lg:gap-2",
					children: [
						!ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "rounded-card border border-dashed border-line px-3 py-8 text-center text-sm text-muted",
							children: "در حال خواندن بلوک‌ها"
						}) : null,
						ready && pageBlocks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "rounded-card border border-dashed border-line px-3 py-8 text-center text-sm text-muted",
							children: "هنوز بلوکی به صفحه اضافه نشده."
						}) : null,
						pageBlocks.map((block, index) => {
							const kind = kindOf(block.type);
							const Mark = block.type === "file" ? File$1 : pageIcon(block.icon) ?? kind.icon;
							const fileName = block.type === "file" ? block.items?.find((item) => item.kind === "file")?.title?.trim() || block.url?.replace(/^https?:\/\//, "") : "";
							const label = block.type === "divider" ? block.body?.trim() || kind.label : block.type === "booking" ? block.title?.trim() || "رزرو نوبت" : block.title?.trim() || fileName || kind.label;
							let shift = 0;
							if (drag && drag.id !== block.id) {
								if (drag.origin < drag.over && index > drag.origin && index <= drag.over) shift = -drag.slot;
								else if (drag.origin > drag.over && index >= drag.over && index < drag.origin) shift = drag.slot;
							}
							const held = drag?.id === block.id;
							const copyBlock = () => commit((items) => {
								const at = items.findIndex((item) => item.id === block.id);
								if (at < 0) return items;
								const next = [...items];
								next.splice(at + 1, 0, {
									...block,
									id: crypto.randomUUID(),
									starred: false
								});
								return next;
							});
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								"data-block": block.id,
								className: "",
								style: held ? {
									transform: `translateY(${drag.dy}px)`,
									opacity: .45,
									zIndex: 30,
									position: "relative",
									transition: "none",
									boxShadow: "0 10px 24px rgb(0 0 0 / 0.14)"
								} : {
									transform: shift ? `translateY(${shift}px)` : void 0,
									transition: shift ? "transform 180ms ease" : void 0,
									position: "relative",
									zIndex: menuId === block.id ? 40 : void 0
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative lg:hidden",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: `flex items-center gap-3 rounded-card border border-line bg-card p-4 ${block.active || held ? "" : "opacity-60"}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												"aria-label": "جابه‌جایی",
												className: "grid size-8 shrink-0 cursor-grab touch-none place-items-center text-muted select-none active:cursor-grabbing",
												onPointerDown: (event) => beginDrag(event, block.id),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, {
													className: "size-4",
													"aria-hidden": "true"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, {
												className: "size-5 shrink-0 text-jade",
												"aria-hidden": "true"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "min-w-0 flex-1 truncate font-bold",
												children: label
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												"aria-label": "گزینه‌ها",
												"aria-expanded": menuId === block.id,
												className: "grid size-8 shrink-0 place-items-center rounded-full text-ink",
												onClick: (event) => {
													event.stopPropagation();
													setMenuId((currentId) => currentId === block.id ? "" : block.id);
												},
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, {
													className: "size-5",
													"aria-hidden": "true"
												})
											})
										]
									}), menuId === block.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "absolute end-3 top-14 z-40 w-48 rounded-lg border border-line bg-card p-1 shadow-md",
										onClick: (event) => event.stopPropagation(),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "فعال" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
													checked: block.active,
													label: block.active ? "فعال" : "غیرفعال",
													onCheckedChange: (active) => update(block.id, { active })
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												className: "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm hover:bg-paper",
												onClick: () => {
													setMenuId("");
													setSpecialId(block.id);
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
													className: `size-4 ${block.starred ? "fill-current text-copper" : ""}`,
													"aria-hidden": "true"
												}), "بلوک ویژه"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												className: "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm hover:bg-paper",
												onClick: () => openEditor(block),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {
													className: "size-4",
													"aria-hidden": "true"
												}), "ویرایش"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												className: "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm hover:bg-paper",
												onClick: () => {
													copyBlock();
													setMenuId("");
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
													className: "size-4",
													"aria-hidden": "true"
												}), "کپی"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												className: "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm font-semibold text-[#e11d2e] hover:bg-danger-soft",
												onClick: () => {
													commit((items) => items.filter((item) => item.id !== block.id));
													setMenuId("");
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
													className: "size-4",
													"aria-hidden": "true"
												}), "حذف"]
											})
										]
									}) : null]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: `hidden items-center gap-2 rounded-lg border border-line bg-card px-2 py-2 lg:flex ${block.active ? "" : "opacity-60"}`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											"aria-label": "جابه‌جایی",
											className: "grid size-8 shrink-0 cursor-grab touch-none place-items-center rounded-full text-muted select-none active:cursor-grabbing",
											onPointerDown: (event) => beginDrag(event, block.id),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, {
												className: "size-4",
												"aria-hidden": "true"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, {
											className: "size-4 shrink-0",
											"aria-hidden": "true"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "min-w-0 flex-1 truncate text-sm font-medium",
											children: label
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											"aria-label": block.starred ? "برداشتن ستاره" : "ستاره",
											"aria-pressed": block.starred,
											className: `grid size-8 place-items-center rounded-full ${block.starred ? "text-copper" : "text-muted"}`,
											onClick: () => update(block.id, { starred: !block.starred }),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, {
												className: `size-4 ${block.starred ? "fill-current" : ""}`,
												"aria-hidden": "true"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
											checked: block.active,
											label: block.active ? "فعال" : "غیرفعال",
											onCheckedChange: (active) => update(block.id, { active })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											"aria-label": "ویرایش",
											className: "grid size-8 place-items-center rounded-full text-muted hover:bg-paper hover:text-ink",
											onClick: () => openEditor(block),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {
												className: "size-4",
												"aria-hidden": "true"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											"aria-label": "کپی",
											className: "grid size-8 place-items-center rounded-full text-muted hover:bg-paper hover:text-ink",
											onClick: copyBlock,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
												className: "size-4",
												"aria-hidden": "true"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											"aria-label": "حذف",
											className: "grid size-8 place-items-center rounded-full text-danger hover:bg-danger-soft",
											onClick: () => commit((items) => items.filter((item) => item.id !== block.id)),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
												className: "size-4",
												"aria-hidden": "true"
											})
										})
									]
								})]
							}, block.id);
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "hidden min-w-0 lg:grid lg:gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => void copyLink(),
					title: url || void 0,
					className: "w-full min-w-0 overflow-hidden rounded-xl border border-line bg-card p-3 text-start",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-2 text-sm font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, {
							className: "size-4 shrink-0",
							"aria-hidden": "true"
						}), copied ? "کپی شد" : "اشتراک‌گذاری"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-2 block w-full break-all text-xs leading-5 text-muted",
						dir: "ltr",
						children: url || "نشانی صفحه هنوز آماده نیست"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-[1.7rem] border-4 border-ink bg-ink p-1.5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "overflow-hidden rounded-[1.3rem] bg-black",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mt-2 h-1.5 w-14 rounded-full bg-white/25" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneScreen, {
							slug,
							blocks,
							design,
							image: avatar
						})]
					})
				})]
			}),
			adding ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlockPicker, {
				onClose: () => setAdding(false),
				onPick: pick
			}) : null,
			editor ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BlockEditor, {
				businessId,
				slug,
				mode: editor.mode,
				block: editor.block,
				onBack: () => {
					const backToPicker = editor.mode === "add";
					setEditor(null);
					if (backToPicker) setAdding(true);
				},
				onClose: () => setEditor(null),
				onSave: saveEditor
			}) : null,
			sheet === "preview" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HalfSheet, {
				title: "پیش‌نمایش",
				onClose: () => setSheet(""),
				bare: true,
				initialLevel: 2,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0 overflow-hidden border-2 border-ink bg-black",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneScreen, {
						slug,
						blocks,
						design,
						image: avatar,
						className: "h-full"
					})
				})
			}) : null,
			sheet === "settings" ? desktop ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CenterWindow, {
				title: "تنظیمات صفحه",
				onClose: () => setSheet(""),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSettings, {
					businessId,
					slug,
					onClose: () => setSheet("")
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HalfSheet, {
				title: "تنظیمات صفحه",
				onClose: () => setSheet(""),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageSettings, {
					businessId,
					slug,
					onClose: () => setSheet("")
				})
			}) : null,
			sheet === "design" && desktop ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HalfSheet, {
				title: "طراحی صفحه",
				onClose: () => setSheet(""),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DesignSettings, {
					design,
					onChange: persistDesign
				})
			}) : null,
			sheet === "design" && !desktop ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobileDesign, {
				slug,
				blocks,
				image: avatar,
				design: draft,
				businessId,
				onChange: setDraft,
				onClose: () => {
					setDraft(designRef.current);
					setSheet("");
				},
				onSave: () => {
					persistDesign(draft);
					setSheet("");
				}
			}) : null,
			qrOpen && current ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrDialog, {
				name: current.name,
				slug,
				url,
				avatar: avatar || current.avatar || "",
				businessId,
				onClose: () => setQrOpen(false)
			}) : null,
			specialId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecialBlockDialog, { onClose: () => setSpecialId("") }) : null
		]
	});
}
function SpecialBlockDialog({ onClose }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 grid place-items-center p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute inset-0 bg-black/40",
			"aria-label": "بستن",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative z-10 w-full max-w-sm rounded-card border border-line bg-card p-5 shadow-xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-extrabold",
				children: "بلوک ویژه"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex justify-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "quiet",
					onClick: onClose,
					children: "بستن"
				})
			})]
		})]
	});
}
function readStoredDesign(businessId) {
	try {
		const raw = localStorage.getItem(designKey(businessId));
		return raw ? normalizeDesign(JSON.parse(raw)) : defaultDesign;
	} catch {
		return defaultDesign;
	}
}
function MobileDesign({ slug, blocks, image, design, businessId, onChange, onClose, onSave }) {
	(0, import_react.useEffect)(() => {
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prev;
		};
	}, []);
	if (typeof document === "undefined") return null;
	return (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 bg-black",
		onClickCapture: (event) => {
			if (event.target?.closest("a")) event.preventDefault();
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneScreen, {
			slug,
			blocks,
			design,
			image,
			className: "h-full",
			scrollClassName: "pb-[54dvh]"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DesignStudio, {
			design,
			businessId,
			onChange,
			onClose,
			onSave
		})]
	}), document.body);
}
function PhoneScreen({ slug, blocks, image = "", design = defaultDesign, className = "h-[40rem]", scrollClassName = "" }) {
	const [biz, setBiz] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!slug) return;
		let live = true;
		publicBusinessFn({ data: {
			slug,
			track: false
		} }).then((res) => {
			if (live && res.ok) setBiz(res.data);
		});
		return () => {
			live = false;
		};
	}, [slug]);
	const shareUrl = slug && typeof window !== "undefined" ? `${window.location.origin}/b/${encodeURIComponent(slug)}` : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `bg-black ${className}`,
		children: !slug || !biz ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "px-3 py-10 text-center text-xs text-white/50",
			children: "صفحه هنوز برای مشتری چیده نشده."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerLink, {
			fill: true,
			className: `h-full min-h-0 ${scrollClassName}`,
			name: biz.name,
			bio: biz.description,
			avatar: biz.avatar,
			image,
			slug,
			blocks,
			shareUrl,
			design
		})
	});
}
function useIsDesktop() {
	const [desktop, setDesktop] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const query = window.matchMedia("(min-width: 1024px)");
		const sync = () => setDesktop(query.matches);
		sync();
		query.addEventListener("change", sync);
		return () => query.removeEventListener("change", sync);
	}, []);
	return desktop;
}
function useDismissEscape(onDismiss, enabled) {
	const ignoreUntil = (0, import_react.useRef)(0);
	const blurred = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (!enabled) return;
		const onKey = (event) => {
			if (event.key !== "Escape" || Date.now() < ignoreUntil.current) return;
			onDismiss();
		};
		const onClick = (event) => {
			const target = event.target;
			if (!(target instanceof Element)) return;
			if (target instanceof HTMLInputElement && target.type === "file" ? target : target.closest("label")?.querySelector("input[type=\"file\"]")) ignoreUntil.current = Date.now() + 6e4;
		};
		const onChange = (event) => {
			const target = event.target;
			if (target instanceof HTMLInputElement && target.type === "file") ignoreUntil.current = Date.now() + 700;
		};
		const onBlur = () => {
			blurred.current = true;
		};
		const onFocus = () => {
			if (!blurred.current) return;
			blurred.current = false;
			if (ignoreUntil.current > Date.now()) ignoreUntil.current = Date.now() + 700;
		};
		window.addEventListener("keydown", onKey);
		document.addEventListener("click", onClick, true);
		document.addEventListener("change", onChange, true);
		window.addEventListener("blur", onBlur);
		window.addEventListener("focus", onFocus);
		return () => {
			window.removeEventListener("keydown", onKey);
			document.removeEventListener("click", onClick, true);
			document.removeEventListener("change", onChange, true);
			window.removeEventListener("blur", onBlur);
			window.removeEventListener("focus", onFocus);
		};
	}, [enabled, onDismiss]);
}
function CenterWindow({ title, onClose, onBack, closeOnEscape = true, z = "z-50", children }) {
	const titleId = (0, import_react.useId)();
	useDismissEscape(onClose, closeOnEscape);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `fixed inset-0 ${z} flex items-center justify-center p-4`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute inset-0 bg-black/60 backdrop-blur-sm",
			"aria-label": "بستن",
			onClick: onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": titleId,
			className: "relative z-10 grid max-h-[85dvh] w-full max-w-md gap-4 overflow-y-auto rounded-[1.375rem] border border-line bg-card p-5 text-ink shadow-[0_20px_50px_-20px_rgb(0_0_0/0.8)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-center gap-1",
					children: [onBack ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "برگشت",
						onClick: onBack,
						className: "grid size-9 shrink-0 place-items-center rounded-full text-ink hover:bg-paper",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
							className: "size-5",
							"aria-hidden": "true"
						})
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: titleId,
						className: "truncate text-base font-semibold",
						children: title
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "بستن",
					onClick: onClose,
					className: "grid size-9 shrink-0 place-items-center rounded-full text-ink hover:bg-paper",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
						className: "size-5",
						"aria-hidden": "true"
					})
				})]
			}), children]
		})]
	});
}
function HalfSheet({ title, onClose, onBack, closeOnEscape = true, z = "z-50", bare = false, initialLevel = 1, children }) {
	const heights = [
		"42dvh",
		"68dvh",
		"calc(100dvh - 4rem)"
	];
	const [level, setLevel] = (0, import_react.useState)(initialLevel);
	const [leaving, setLeaving] = (0, import_react.useState)(false);
	useDismissEscape(() => setLeaving(true), closeOnEscape);
	function close() {
		setLeaving(true);
	}
	function resizeFrom(event) {
		const startY = event.clientY;
		const start = level;
		const pointerId = event.pointerId;
		event.currentTarget.setPointerCapture(pointerId);
		const end = (ev) => {
			if (ev.pointerId !== pointerId) return;
			const dy = startY - ev.clientY;
			const steps = Math.abs(dy) > 140 ? Math.sign(dy) * 2 : Math.abs(dy) > 28 ? Math.sign(dy) : 0;
			setLevel(Math.min(2, Math.max(0, start + steps)));
			window.removeEventListener("pointerup", end);
			window.removeEventListener("pointercancel", end);
		};
		window.addEventListener("pointerup", end);
		window.addEventListener("pointercancel", end);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `fixed inset-0 ${z}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute inset-0 bg-black/40",
			"aria-label": "بستن",
			onClick: close
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: `absolute inset-x-0 bottom-0 flex flex-col rounded-t-2xl border border-line bg-card shadow-xl transition-[height] duration-200 ${leaving ? "sheet-down" : "sheet-up"}`,
			style: { height: heights[level] },
			onAnimationEnd: () => {
				if (leaving) onClose();
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex items-center justify-between px-4 pt-2 pb-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-center gap-1",
						children: [onBack ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "برگشت",
							onClick: onBack,
							className: "grid size-9 shrink-0 place-items-center text-ink",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
								className: "size-5",
								"aria-hidden": "true"
							})
						}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "truncate font-bold",
							children: title
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "اندازه صفحه",
						onPointerDown: resizeFrom,
						className: "absolute left-1/2 top-1 -translate-x-1/2 px-8 py-2 touch-none",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "block h-1.5 w-10 rounded-full bg-muted/50" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "بستن",
						onClick: close,
						className: "grid size-9 place-items-center text-ink",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
							className: "size-5",
							"aria-hidden": "true"
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: bare ? "relative min-h-0 flex-1 overflow-hidden" : "min-h-0 flex-1 overflow-y-auto px-4 pb-6",
				children
			})]
		})]
	});
}
function imageKey(businessId) {
	return pageImageKey(businessId);
}
function readGalleryImage(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () => reject(/* @__PURE__ */ new Error("read"));
		reader.onload = () => {
			const img = new Image();
			img.onerror = () => reject(/* @__PURE__ */ new Error("image"));
			img.onload = () => {
				const scale = Math.min(1, 640 / Math.max(img.width, img.height));
				const canvas = document.createElement("canvas");
				canvas.width = Math.max(1, Math.round(img.width * scale));
				canvas.height = Math.max(1, Math.round(img.height * scale));
				const ctx = canvas.getContext("2d");
				if (!ctx) {
					reject(/* @__PURE__ */ new Error("canvas"));
					return;
				}
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
				resolve(canvas.toDataURL("image/jpeg", .82));
			};
			img.src = String(reader.result);
		};
		reader.readAsDataURL(file);
	});
}
function PageSettings({ businessId, slug, onClose }) {
	const fileRef = (0, import_react.useRef)(null);
	const [imageOpen, setImageOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)(null);
	const [image, setImage] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!businessId) return;
		try {
			setImage(localStorage.getItem(imageKey(businessId)) ?? "");
		} catch {
			setImage("");
		}
		manageBusinessFn({ data: { businessId } }).then((res) => {
			if (!res.ok) return;
			const data = res.data;
			setForm({
				name: data.name ?? "",
				description: String(data.description ?? "").slice(0, 100),
				city: data.city ?? "",
				phone: data.phone ?? "",
				address: data.address ?? "",
				categoryId: data.categoryId ?? "",
				timezone: data.timezone ?? "Asia/Tehran",
				cancelBeforeMinutes: data.cancelBeforeMinutes ?? 0,
				minLeadMinutes: data.minLeadMinutes ?? 0,
				maxHorizonDays: data.maxHorizonDays ?? 30,
				slotStepMinutes: data.slotStepMinutes ?? 15,
				allowAnyStaff: Boolean(data.allowAnyStaff)
			});
		});
	}, [businessId]);
	if (!form) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "grid",
		onSubmit: (event) => {
			event.preventDefault();
			setPending(true);
			(async () => {
				const avatar = image ? await fitAvatar(image) : "";
				try {
					if (image) rememberPageAvatar(businessId, slug, image);
					else {
						localStorage.removeItem(pageImageKey(businessId));
						if (slug) localStorage.removeItem(`agent.page-image.slug.${slug}`);
						window.dispatchEvent(new Event("agent-avatar"));
					}
				} catch {
					toast.error("تصویر ذخیره نشد");
				}
				const res = await updateBusinessFn({ data: {
					businessId,
					...form,
					description: form.description.slice(0, 100),
					avatar
				} });
				setPending(false);
				if (!res.ok) {
					toast.error(res.error);
					return;
				}
				toast.success("تنظیمات صفحه ذخیره شد");
				window.dispatchEvent(new Event("agent-account"));
				onClose();
			})();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid justify-items-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-24 place-items-center overflow-hidden rounded-full bg-jade-soft text-jade",
						children: image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoundAvatar, {
							value: image,
							size: 96
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, {
							className: "size-10",
							"aria-hidden": "true"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: fileRef,
						type: "file",
						accept: "image/*",
						className: "hidden",
						onChange: (event) => {
							const file = event.target.files?.[0];
							event.target.value = "";
							if (!file) return;
							readGalleryImage(file).then(setImage).catch(() => toast.error("این تصویر باز نشد"));
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "mt-3 inline-flex h-10 items-center gap-2 rounded-full border border-line bg-paper px-4 text-sm font-medium",
						onClick: () => setImageOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, {
							className: "size-4",
							"aria-hidden": "true"
						}), "تغییر تصویر"]
					}),
					imageOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageDialog, {
						image,
						onPick: setImage,
						onUpload: () => fileRef.current?.click(),
						onClose: () => setImageOpen(false)
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "نام صفحه",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						value: form.name,
						onChange: (e) => setForm({
							...form,
							name: e.target.value
						}),
						required: true
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "grid gap-1.5 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: "بیو"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs tabular-nums text-muted",
							children: [
								faNum(form.description.length),
								"/",
								faNum(100)
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
						value: form.description,
						maxLength: 100,
						onChange: (e) => setForm({
							...form,
							description: e.target.value.slice(0, 100)
						})
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/panel/settings",
				className: "mt-4 flex items-center gap-2.5 rounded-xl border border-line bg-paper px-3 py-2.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, {
						className: "size-4 shrink-0 text-jade",
						"aria-hidden": "true"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-sm font-bold",
							children: "تنظیمات کامل صفحه"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-0.5 block text-xs leading-5 text-muted",
							children: "آدرس، دیده شدن در گوگل، اشتراک گذاری و اشتراک"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
						className: "size-4 shrink-0 text-muted",
						"aria-hidden": "true"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					disabled: pending,
					className: "inline-flex h-11 min-w-0 flex-1 items-center justify-center rounded-full bg-ink text-sm font-semibold text-on-ink disabled:opacity-50",
					children: pending ? "در حال ذخیره" : "ذخیره"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "inline-flex h-11 min-w-0 flex-1 items-center justify-center rounded-full border border-line bg-paper text-sm font-semibold text-ink",
					onClick: onClose,
					children: "انصراف"
				})]
			})
		]
	});
}
function ImageDialog({ image, onPick, onUpload, onClose }) {
	if (typeof document === "undefined") return null;
	return (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "alertdialog",
			"aria-modal": "true",
			"aria-labelledby": "page-image-title",
			className: "grid max-h-[85dvh] w-full max-w-sm gap-4 overflow-y-auto rounded-[1.375rem] border border-line bg-card p-5 text-ink shadow-[0_20px_50px_-20px_rgb(0_0_0/0.8)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "page-image-title",
					className: "text-base font-semibold",
					children: "تصویر صفحه"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mx-auto grid size-24 place-items-center overflow-hidden rounded-full bg-jade-soft text-jade",
					children: image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoundAvatar, {
						value: image,
						size: 96
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, {
						className: "size-10",
						"aria-hidden": "true"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink text-sm font-semibold text-on-ink",
					onClick: onUpload,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, {
						className: "size-4",
						"aria-hidden": "true"
					}), "تغییر تصویر"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold",
					children: "آواتارهای آماده"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
					className: "mt-3 max-h-48",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-5 gap-2 pe-1",
						children: readyAvatars.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "آواتار آماده",
							className: `grid size-12 place-items-center overflow-hidden rounded-full ${image === item.id ? "ring-2 ring-jade ring-offset-2 ring-offset-card" : ""}`,
							onClick: () => onPick(item.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoundAvatar, {
								value: item.id,
								size: 48
							})
						}, item.id))
					})
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-sm font-semibold text-[#e11d2e]",
					onClick: () => onPick(readyAvatars[0].id),
					children: "حذف تصویر آپلود شده"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "inline-flex h-11 items-center justify-center rounded-full border border-line bg-paper text-sm font-semibold text-ink",
					onClick: onClose,
					children: "بستن"
				})
			]
		})
	}), document.body);
}
function DesignSettings({ design, onChange }) {
	const theme = design.theme === "light" || design.theme === "custom" ? design.theme : "dark";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
				label: "تم",
				value: theme,
				options: [
					["light", "روشن"],
					["dark", "تیره"],
					["custom", "اختصاصی"]
				],
				onChange: (next) => onChange({
					...design,
					theme: next
				})
			}),
			theme === "custom" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-sm font-semibold",
				children: "رنگ دکمه"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-2",
				children: themeColors.map((color) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": color.name,
					className: `size-9 rounded-full border-2 ${design.accent.toUpperCase() === color.hex ? "border-ink" : "border-transparent"}`,
					style: { background: color.hex },
					onClick: () => onChange({
						...design,
						theme: "custom",
						accent: color.hex
					})
				}, color.hex))
			})] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
				label: "چینش",
				value: design.layout,
				options: [["list", "لیستی"], ["card", "کارتی"]],
				onChange: (layout) => onChange({
					...design,
					layout: layout === "card" ? "card" : "list"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
				label: "گوشه‌ها",
				value: design.radius,
				options: [
					["sharp", "تیز"],
					["round", "گرد"],
					["pill", "دایره‌ای"]
				],
				onChange: (radius) => onChange({
					...design,
					radius: radius === "sharp" || radius === "pill" ? radius : "round"
				})
			})
		]
	});
}
function Choice({ label, value, options, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mb-2 text-sm font-semibold",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap gap-2",
		children: options.map(([id, text]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: `h-9 rounded-full border px-3 text-sm ${value === id ? "border-ink bg-ink text-on-ink" : "border-line bg-paper"}`,
			onClick: () => onChange(id),
			children: text
		}, id))
	})] });
}
var hiddenTypes = /* @__PURE__ */ new Set([
	"form",
	"event",
	"course",
	"blog",
	"resume"
]);
function BlockPicker({ onClose, onPick }) {
	const desktop = useIsDesktop();
	const body = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-2",
		children: catalog.filter((item) => !hiddenTypes.has(item.type)).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			className: "flex min-h-20 flex-col justify-between rounded-xl border border-line bg-paper p-3 text-start",
			onClick: () => onPick(item.type),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
				className: "size-5 text-jade",
				"aria-hidden": "true"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-semibold",
				children: item.label
			})]
		}, item.type))
	});
	if (desktop) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CenterWindow, {
		title: "افزودن بلوک",
		onClose,
		children: body
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HalfSheet, {
		title: "افزودن بلوک",
		onClose,
		children: body
	});
}
function normalizeLink(value) {
	const next = value.trim();
	if (!next) return "";
	if (/^https?:\/\//i.test(next)) return next;
	if (/^[\w.-]+\.[a-z]{2,}([/?#].*)?$/i.test(next)) return `https://${next}`;
	return "";
}
var blockForms = {
	link: {
		title: "عنوان بلوک",
		extra: {
			key: "url",
			label: "نشانی لینک",
			kind: "url",
			required: true
		}
	},
	contact: {
		title: "عنوان",
		extra: {
			key: "body",
			label: "شماره تماس",
			kind: "phone",
			required: true
		}
	},
	address: {
		title: "عنوان",
		extra: {
			key: "body",
			label: "آدرس",
			kind: "text",
			required: true
		}
	},
	booking: { title: "عنوان" },
	products: {
		title: "عنوان",
		extra: {
			key: "body",
			label: "توضیح کوتاه",
			kind: "text",
			required: false
		}
	},
	menu: {
		title: "عنوان",
		extra: {
			key: "body",
			label: "توضیح کوتاه",
			kind: "text",
			required: false
		}
	},
	services: {
		title: "عنوان",
		extra: {
			key: "body",
			label: "توضیح کوتاه",
			kind: "text",
			required: false
		}
	},
	form: {
		title: "عنوان",
		extra: {
			key: "body",
			label: "توضیح فرم",
			kind: "text",
			required: false
		}
	},
	event: {
		title: "عنوان",
		extra: {
			key: "body",
			label: "جزئیات",
			kind: "text",
			required: false
		}
	},
	course: {
		title: "عنوان",
		extra: {
			key: "body",
			label: "توضیح دوره",
			kind: "text",
			required: false
		}
	},
	blog: {
		title: "عنوان",
		extra: {
			key: "body",
			label: "توضیح",
			kind: "text",
			required: false
		}
	},
	text: {
		title: "عنوان",
		extra: {
			key: "body",
			label: "متن",
			kind: "text",
			required: true
		}
	},
	social: {
		title: "عنوان",
		extra: {
			key: "url",
			label: "نشانی شبکه",
			kind: "url",
			required: true
		}
	},
	faq: {
		title: "پرسش",
		extra: {
			key: "body",
			label: "پاسخ",
			kind: "text",
			required: true
		}
	},
	team: {
		title: "عنوان",
		extra: {
			key: "body",
			label: "معرفی",
			kind: "text",
			required: false
		}
	},
	gallery: { title: "عنوان" },
	video: {
		title: "عنوان",
		extra: {
			key: "url",
			label: "نشانی ویدیو",
			kind: "url",
			required: true
		}
	},
	resume: {
		title: "عنوان",
		extra: {
			key: "body",
			label: "خلاصه",
			kind: "text",
			required: false
		}
	},
	file: {
		title: "عنوان",
		extra: {
			key: "body",
			label: "توضیحات",
			kind: "text",
			required: false
		}
	}
};
var defaultIcons = {
	link: "link",
	contact: "phone",
	address: "map",
	booking: "calendar",
	products: "bag",
	menu: "utensils",
	services: "store",
	form: "notebook",
	event: "calendar",
	course: "graduation",
	blog: "book",
	text: "pencil",
	social: "globe",
	faq: "messages",
	team: "user",
	gallery: "camera",
	video: "camera",
	resume: "book",
	file: "link"
};
function defaultIcon(type) {
	return defaultIcons[type] ?? "link";
}
function BlockEditor({ businessId, slug, mode, block, onBack, onClose, onSave }) {
	const desktop = useIsDesktop();
	const form = blockForms[block.type] ?? { title: "عنوان" };
	const kind = kindOf(block.type);
	const [icon, setIcon] = (0, import_react.useState)(block.icon || defaultIcon(block.type));
	const [title, setTitle] = (0, import_react.useState)(block.title ?? "");
	const [url, setUrl] = (0, import_react.useState)(block.url ?? "");
	const [body, setBody] = (0, import_react.useState)(block.body ?? "");
	const [items, setItems] = (0, import_react.useState)(block.items ?? []);
	const [align, setAlign] = (0, import_react.useState)(block.type === "divider" ? block.align === "left" || block.align === "right" ? block.align : "center" : block.align === "center" || block.align === "left" ? block.align : "right");
	const [image, setImage] = (0, import_react.useState)(block.image ?? "");
	const [imagePos, setImagePos] = (0, import_react.useState)(block.imagePos === "after" ? "after" : "before");
	const [layout, setLayout] = (0, import_react.useState)(block.type === "menu" || block.type === "products" || block.type === "services" ? block.layout === "grid" || block.layout === "card" ? block.layout : "list" : block.layout === "icons" || block.layout === "footer" ? block.layout : "buttons");
	const [currency, setCurrency] = (0, import_react.useState)(block.currency || "toman");
	const [faqDraft, setFaqDraft] = (0, import_react.useState)(null);
	const [iconsOpen, setIconsOpen] = (0, import_react.useState)(false);
	const [menuDialog, setMenuDialog] = (0, import_react.useState)(false);
	const Icon = pageIcon(icon) ?? Link2;
	function saveBooking() {
		const cleanTitle = title.trim();
		if (cleanTitle && cleanTitle.length < 2) {
			toast.error("عنوان را کامل‌تر بنویسید");
			return;
		}
		const path = bookingPath(url);
		if (url.trim() && !path) {
			toast.error("نشانی صفحه رزرو فقط یک بخش بعد از نام کاربری است");
			return;
		}
		onSave({
			icon: "",
			title: cleanTitle,
			url: path,
			body: body.trim().slice(0, 100),
			image
		});
	}
	function submit(event) {
		event.preventDefault();
		const cleanTitle = title.trim();
		if (block.type === "contact" || block.type === "address") {
			if (cleanTitle.length < 2) {
				toast.error("عنوان بلوک را وارد کنید");
				return;
			}
			const address = block.type === "address";
			let invalid = false;
			const cleanItems = items.flatMap((item) => {
				if (address && item.kind !== "text") {
					const url = normalizeLink(item.value);
					if (item.value.trim() && !url) invalid = true;
					if (!url) return [];
					return [{
						...item,
						title: item.title?.trim() ?? "",
						value: url
					}];
				}
				const value = item.value.trim();
				if (!value) return [];
				return [{
					...item,
					title: address ? "" : item.title?.trim() ?? "",
					value
				}];
			});
			if (invalid) {
				toast.error("نشانی لینک معتبر نیست");
				return;
			}
			if (cleanItems.length === 0) {
				toast.error(address ? "حداقل یک آدرس را کامل کنید" : "حداقل یک راه تماس را کامل کنید");
				return;
			}
			onSave({
				icon: "",
				title: cleanTitle,
				url: "",
				body: "",
				items: cleanItems
			});
			return;
		}
		if (block.type === "social") {
			if (cleanTitle.length < 2) {
				toast.error("عنوان را وارد کنید");
				return;
			}
			let invalid = false;
			const cleanItems = items.flatMap((item) => {
				const value = item.value.trim();
				if (value && !socialValueOk(item.kind, value)) invalid = true;
				if (!value || !socialValueOk(item.kind, value)) return [];
				return [{
					...item,
					title: item.title?.trim() ?? "",
					value
				}];
			});
			if (invalid) {
				toast.error("اطلاعات شبکه معتبر نیست");
				return;
			}
			if (cleanItems.length === 0) {
				toast.error("حداقل یک شبکه را کامل کنید");
				return;
			}
			onSave({
				icon: "",
				title: cleanTitle,
				url: "",
				body: "",
				items: cleanItems,
				layout
			});
			return;
		}
		if (block.type === "text") {
			const cleanBody = body.trim();
			if (cleanTitle.length < 2) {
				toast.error("عنوان را وارد کنید");
				return;
			}
			if (cleanBody.length < 1) {
				toast.error("متن را وارد کنید");
				return;
			}
			onSave({
				icon,
				title: cleanTitle,
				url: "",
				body: cleanBody.slice(0, 500),
				align,
				image,
				imagePos: image ? imagePos : "before"
			});
			return;
		}
		if (block.type === "faq") {
			if (faqDraft) {
				toast.error("اول سوال باز را ذخیره یا لغو کنید");
				return;
			}
			const cleanItems = items.flatMap((item) => {
				const question = item.title?.trim() ?? "";
				const answer = item.value.trim();
				if (question.length < 2 || answer.length < 1) return [];
				return [{
					id: item.id,
					kind: "qa",
					title: question,
					value: answer
				}];
			});
			if (cleanItems.length === 0) {
				toast.error("حداقل یک سوال را ذخیره کنید");
				return;
			}
			onSave({
				icon,
				title: cleanTitle,
				url: "",
				body: body.trim().slice(0, 160),
				items: cleanItems
			});
			return;
		}
		if (block.type === "gallery") {
			if (cleanTitle.length < 2) {
				toast.error("عنوان را وارد کنید");
				return;
			}
			const cleanItems = items.flatMap((item) => item.value.startsWith("data:image/") ? [{
				id: item.id,
				kind: "photo",
				title: "",
				value: item.value
			}] : []);
			if (cleanItems.length === 0) {
				toast.error("حداقل یک عکس اضافه کنید");
				return;
			}
			onSave({
				icon: "",
				title: cleanTitle,
				url: "",
				body: body.trim().slice(0, 120),
				items: cleanItems
			});
			return;
		}
		if (block.type === "video") {
			if (cleanTitle.length < 2) {
				toast.error("عنوان را وارد کنید");
				return;
			}
			let invalid = false;
			const cleanItems = items.flatMap((item) => {
				if (item.kind === "file") return item.value.startsWith("/api/v1/media/") ? [{
					...item,
					title: "",
					value: item.value
				}] : [];
				if (item.kind !== "youtube" && item.kind !== "aparat") return [];
				const next = videoWatch(item.kind, item.value);
				if (item.value.trim() && !next) invalid = true;
				if (!next) return [];
				return [{
					...item,
					title: "",
					value: next
				}];
			});
			if (invalid) {
				toast.error("لینک یوتیوب یا آپارات معتبر نیست");
				return;
			}
			if (cleanItems.length === 0) {
				toast.error("یک فیلم آپلود کنید یا لینک بگذارید");
				return;
			}
			onSave({
				icon: "",
				title: cleanTitle,
				url: "",
				body: body.trim().slice(0, 120),
				items: cleanItems
			});
			return;
		}
		if (block.type === "file") {
			if (cleanTitle && cleanTitle.length < 2) {
				toast.error("عنوان را کامل‌تر بنویسید");
				return;
			}
			const cleanUrl = normalizeLink(url);
			if (url.trim() && !cleanUrl) {
				toast.error("نشانی فایل معتبر نیست");
				return;
			}
			const files = items.filter((item) => item.kind === "file" && item.value.startsWith("/api/v1/media/") && item.title?.trim() && (item.size ?? 0) > 0);
			if (files.length === 0 && !cleanUrl) {
				toast.error("یک فایل آپلود کنید یا نشانی‌اش را بگذارید");
				return;
			}
			if (files.length > 8) {
				toast.error("بیشتر از ۸ فایل نمی‌شود");
				return;
			}
			const many = files.length + (cleanUrl ? 1 : 0) > 1;
			onSave({
				icon: "",
				title: cleanTitle,
				url: cleanUrl,
				body: many ? "" : body.trim().slice(0, 200),
				items: files.map((file) => ({
					id: file.id,
					kind: "file",
					title: file.title?.trim().slice(0, 120),
					value: file.value,
					size: file.size,
					label: many ? file.label?.trim().slice(0, 80) || "" : "",
					note: many ? file.note?.trim().slice(0, 200) || "" : ""
				}))
			});
			return;
		}
		if (block.type === "divider") {
			const place = align === "left" || align === "right" ? align : "center";
			onSave({
				icon: "",
				title: "",
				url: "",
				body: body.trim().slice(0, 40),
				align: place
			});
			return;
		}
		if (block.type === "booking") {
			saveBooking();
			return;
		}
		if (block.type === "menu" || block.type === "products" || block.type === "services") {
			const fallback = block.type === "products" ? "products" : block.type === "services" ? "services" : "menu";
			const path = url.trim().replace(/^\/+|\/+$/g, "");
			if (path && (path.includes("/") || path.length > 40)) {
				toast.error(block.type === "products" ? "نشانی صفحه محصولات فقط یک بخش بعد از نام کاربری است" : block.type === "services" ? "نشانی صفحه خدمات فقط یک بخش بعد از نام کاربری است" : "نشانی صفحه منو فقط یک بخش بعد از نام کاربری است");
				return;
			}
			onSave({
				icon: icon || (block.type === "products" ? "bag" : block.type === "services" ? "store" : "utensils"),
				title: cleanTitle,
				url: path || fallback,
				body: body.trim().slice(0, 100),
				items,
				layout: layout === "grid" || layout === "card" ? layout : "list",
				currency: currency || "toman"
			});
			return;
		}
		const extra = form.extra;
		const cleanUrl = extra?.kind === "url" ? normalizeLink(url) : "";
		const cleanBody = extra && extra.kind !== "url" ? body.trim() : "";
		if (cleanTitle.length < 2) {
			toast.error(`${form.title} را وارد کنید`);
			return;
		}
		if (extra?.required && extra.kind === "url" && !cleanUrl) {
			toast.error("نشانی معتبر نیست");
			return;
		}
		if (extra?.required && extra.kind !== "url" && cleanBody.length < 2) {
			toast.error(`${extra.label} را وارد کنید`);
			return;
		}
		onSave({
			icon,
			title: cleanTitle,
			url: cleanUrl,
			body: cleanBody
		});
	}
	const bodyFields = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		onSubmit: submit,
		children: [
			block.type === "contact" || block.type === "address" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContactFields, {
				title,
				items,
				onTitle: setTitle,
				onItems: setItems,
				specs: block.type === "address" ? addressKinds : contactKinds,
				empty: block.type === "address" ? "با دکمه‌های بالا آدرس اضافه کنید." : "با دکمه‌های بالا راه تماس اضافه کنید.",
				textKinds: block.type === "address" ? ["text"] : []
			}) : block.type === "social" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContactFields, {
				title,
				items,
				onTitle: setTitle,
				onItems: setItems,
				specs: socialKinds,
				empty: "با دکمه‌های بالا شبکه اضافه کنید.",
				textKinds: [],
				max: 20,
				afterTitle: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "نحوه نمایش",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedTabs, {
							className: "bg-card",
							items: [
								{ label: "دکمه‌ها" },
								{ label: "ردیف آیکون" },
								{ label: "پاورقی" }
							],
							value: layout === "icons" ? 1 : layout === "footer" ? 2 : 0,
							onChange: (next) => setLayout(next === 1 ? "icons" : next === 2 ? "footer" : "buttons")
						})
					})
				})
			}) : block.type === "text" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextFields, {
				icon,
				title,
				body,
				align,
				image,
				imagePos,
				onIcon: () => setIconsOpen(true),
				onTitle: setTitle,
				onBody: setBody,
				onAlign: setAlign,
				onImage: setImage,
				onImagePos: setImagePos
			}) : block.type === "faq" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FaqFields, {
				icon,
				title,
				body,
				items,
				draft: faqDraft,
				onIcon: () => setIconsOpen(true),
				onTitle: setTitle,
				onBody: setBody,
				onItems: setItems,
				onDraft: setFaqDraft
			}) : block.type === "gallery" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GalleryFields, {
				title,
				body,
				items,
				onTitle: setTitle,
				onBody: setBody,
				onItems: setItems
			}) : block.type === "video" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoFields, {
				businessId,
				title,
				body,
				items,
				onTitle: setTitle,
				onBody: setBody,
				onItems: setItems
			}) : block.type === "file" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileFields, {
				businessId,
				title,
				body,
				url,
				items,
				onTitle: setTitle,
				onBody: setBody,
				onUrl: setUrl,
				onItems: setItems
			}) : block.type === "divider" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DividerFields, {
				text: body,
				align,
				onText: setBody,
				onAlign: setAlign
			}) : block.type === "booking" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookingFields, {
				businessId,
				slug,
				title,
				body,
				url,
				image,
				onTitle: setTitle,
				onBody: setBody,
				onUrl: setUrl,
				onImage: setImage,
				onBack,
				onSaveBlock: saveBooking
			}) : block.type === "menu" || block.type === "products" || block.type === "services" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuFields, {
				mode: block.type === "products" ? "products" : block.type === "services" ? "services" : "menu",
				items,
				icon,
				title,
				body,
				path: url,
				layout,
				currency,
				prefix: slug ? `/b/${slug}/` : "/b/نام‌کاربری/",
				onItems: setItems,
				onIcon: () => setIconsOpen(true),
				onTitle: setTitle,
				onBody: setBody,
				onPath: setUrl,
				onLayout: setLayout,
				onCurrency: setCurrency,
				onDialog: setMenuDialog
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "آیکون",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setIconsOpen(true),
						className: "flex min-h-11 w-full items-center gap-3 rounded-xl border border-line bg-card px-3 text-start",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							className: "size-5 shrink-0",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm",
							children: "انتخاب آیکون"
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: form.title,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							value: title,
							maxLength: 80,
							onChange: (event) => setTitle(event.target.value),
							required: true
						})
					})
				}),
				form.extra?.kind === "url" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: form.extra.label,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							dir: "ltr",
							inputMode: "url",
							value: url,
							placeholder: "https://",
							onChange: (event) => setUrl(event.target.value),
							className: "min-h-11 w-full rounded-xl border border-line bg-card px-3 text-left text-sm outline-none"
						})
					})
				}) : null,
				form.extra?.kind === "phone" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: form.extra.label,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							dir: "ltr",
							className: "text-left",
							inputMode: "tel",
							value: body,
							maxLength: 20,
							onChange: (event) => setBody(event.target.value)
						})
					})
				}) : null,
				form.extra?.kind === "text" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: form.extra.label,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
							value: body,
							maxLength: 500,
							onChange: (event) => setBody(event.target.value)
						})
					})
				}) : null
			] }),
			block.type === "booking" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex justify-end gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					className: "inline-flex h-11 items-center justify-center rounded-full border border-line bg-paper px-5 text-sm font-semibold text-ink",
					children: "انصراف"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					className: "inline-flex h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-on-ink",
					children: mode === "edit" ? "ذخیره" : "اضافه کردن"
				})]
			}),
			iconsOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconPicker, {
				selected: icon,
				onPick: (next) => {
					setIcon(next);
					setIconsOpen(false);
				},
				onBack: () => setIconsOpen(false),
				onClose: () => setIconsOpen(false)
			}) : null
		]
	});
	if (desktop) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CenterWindow, {
		title: kind.label,
		onBack,
		onClose,
		closeOnEscape: !iconsOpen && !menuDialog,
		children: bodyFields
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HalfSheet, {
		title: kind.label,
		onBack,
		onClose,
		closeOnEscape: !iconsOpen && !menuDialog,
		children: bodyFields
	});
}
function TextFields({ icon, title, body, align, image, imagePos, onIcon, onTitle, onBody, onAlign, onImage, onImagePos }) {
	const fileRef = (0, import_react.useRef)(null);
	const Icon = pageIcon(icon) ?? Type;
	const aligns = [
		"right",
		"center",
		"left"
	];
	const places = ["before", "after"];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
			label: "آیکون",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onIcon,
				className: "flex min-h-11 w-full items-center gap-3 rounded-xl border border-line bg-card px-3 text-start",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "size-5 shrink-0",
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm",
					children: "انتخاب آیکون"
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "عنوان",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					value: title,
					maxLength: 80,
					onChange: (event) => onTitle(event.target.value),
					required: true
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "متن",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
					value: body,
					maxLength: 500,
					onChange: (event) => onBody(event.target.value.slice(0, 500))
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs tabular-nums text-muted",
				children: [
					faNum(body.length),
					" از ",
					faNum(500)
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "تراز متن",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedTabs, {
					className: "bg-card",
					items: [
						{ label: "راست‌چین" },
						{ label: "وسط‌چین" },
						{ label: "چپ‌چین" }
					],
					value: Math.max(0, aligns.indexOf(align)),
					onChange: (next) => onAlign(aligns[next] ?? "right")
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
				label: "عکس",
				hint: "دلخواه",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: fileRef,
					type: "file",
					accept: "image/*",
					className: "sr-only",
					onChange: (event) => {
						const file = event.target.files?.[0];
						event.target.value = "";
						if (!file) return;
						readTextImage(file).then(onImage).catch(() => toast.error("این تصویر باز نشد"));
					}
				}), image ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative overflow-hidden rounded-xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: image,
						alt: "",
						className: "h-48 w-full object-cover"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/70 px-3 py-2 text-sm font-semibold text-white",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => fileRef.current?.click(),
							className: "inline-flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, {
								className: "size-4",
								"aria-hidden": "true"
							}), "ویرایش"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onImage(""),
							className: "inline-flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
								className: "size-4",
								"aria-hidden": "true"
							}), "حذف"]
						})]
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => fileRef.current?.click(),
					className: "inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-semibold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, {
						className: "size-4",
						"aria-hidden": "true"
					}), "آپلود عکس"]
				})]
			})
		}),
		image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "جای عکس",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedTabs, {
					className: "bg-card",
					items: [{ label: "قبل از متن" }, { label: "بعد از متن" }],
					value: places.indexOf(imagePos) < 0 ? 0 : places.indexOf(imagePos),
					onChange: (next) => onImagePos(places[next] ?? "before")
				})
			})
		}) : null
	] });
}
var fileAccept = ".pdf,.png,.jpg,.jpeg,.webp,.gif,.txt,.csv,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.mp3,.wav,.ogg,.m4a";
var fileMax = 41943040;
var fileLimit = 8;
function fileAllowed(name) {
	const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")).toLowerCase() : "";
	return fileAccept.split(",").includes(ext);
}
function isUploadedFile(item) {
	return item.kind === "file" && item.value.startsWith("/api/v1/media/");
}
function FileFields({ businessId, title, body, url, items, onTitle, onBody, onUrl, onItems }) {
	const [queue, setQueue] = (0, import_react.useState)([]);
	const inflight = (0, import_react.useRef)(0);
	const dropped = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const itemsRef = (0, import_react.useRef)(items);
	const bodyRef = (0, import_react.useRef)(body);
	const urlRef = (0, import_react.useRef)(url);
	itemsRef.current = items;
	bodyRef.current = body;
	urlRef.current = url;
	const saved = items.filter(isUploadedFile);
	const many = saved.length + (url.trim() ? 1 : 0) > 1;
	function publish(next) {
		let copy = next;
		const several = copy.filter(isUploadedFile).length + (urlRef.current.trim() ? 1 : 0) > 1;
		const note = bodyRef.current.trim();
		if (several && note) {
			const index = copy.findIndex((item) => isUploadedFile(item) && !item.note?.trim());
			if (index >= 0) {
				copy = copy.map((item, itemIndex) => itemIndex === index ? {
					...item,
					note: note.slice(0, 200)
				} : item);
				bodyRef.current = "";
				onBody("");
			}
		}
		onItems(copy);
	}
	async function upload(next) {
		if (!fileAllowed(next.name)) {
			toast.error("این نوع فایل مجاز نیست");
			return;
		}
		if (next.size > fileMax) {
			toast.error("حجم فایل بیشتر از ۴۰ مگابایت است. جای دیگری آپلود کنید و نشانی را بگذارید");
			return;
		}
		if (saved.length + inflight.current >= fileLimit) {
			toast.error("بیشتر از ۸ فایل نمی‌شود");
			return;
		}
		const key = crypto.randomUUID();
		inflight.current += 1;
		setQueue((current) => [...current, {
			key,
			name: next.name,
			size: next.size,
			progress: 0
		}]);
		const res = await uploadPageFile(businessId, next, (percent) => {
			if (dropped.current.has(key)) return;
			setQueue((current) => current.map((item) => item.key === key ? {
				...item,
				progress: percent
			} : item));
		});
		const removed = dropped.current.has(key);
		dropped.current.delete(key);
		if (!removed) inflight.current = Math.max(0, inflight.current - 1);
		setQueue((current) => current.filter((item) => item.key !== key));
		if (removed) return;
		if (!res.ok) {
			toast.error(res.error);
			return;
		}
		const created = {
			id: crypto.randomUUID(),
			kind: "file",
			title: next.name.slice(0, 120),
			value: res.data.url,
			size: next.size
		};
		onItems((current) => {
			if (current.some((item) => item.value === created.value)) return current;
			const appended = [...current, created];
			const several = appended.filter(isUploadedFile).length + (urlRef.current.trim() ? 1 : 0) > 1;
			const note = bodyRef.current.trim();
			if (!several || !note) return appended;
			const index = appended.findIndex((item) => isUploadedFile(item) && !item.note?.trim());
			if (index < 0) return appended;
			bodyRef.current = "";
			queueMicrotask(() => onBody(""));
			return appended.map((item, itemIndex) => itemIndex === index ? {
				...item,
				note: note.slice(0, 200)
			} : item);
		});
	}
	function patch(id, patch) {
		onItems(items.map((item) => item.id === id ? {
			...item,
			...patch
		} : item));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
			label: "عنوان",
			hint: many ? "دلخواه. عنوان کارت فایل‌ها" : "دلخواه. اگر خالی بماند، اسم فایل نشان داده می‌شود",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
				value: title,
				maxLength: 80,
				onChange: (event) => onTitle(event.target.value)
			})
		}),
		many ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "توضیحات",
				hint: "دلخواه",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
					value: body,
					maxLength: 200,
					onChange: (event) => onBody(event.target.value)
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
				label: "فایل",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUpload, {
					multiple: true,
					showList: false,
					accept: fileAccept,
					maxSize: fileMax,
					hint: "PDF، تصویر، زیپ یا آفیس، تا ۴۰ مگابایت",
					onAdd: (files) => {
						let warned = false;
						for (const file of files) {
							if (saved.length + inflight.current >= fileLimit) {
								if (!warned) toast.error("بیشتر از ۸ فایل نمی‌شود");
								warned = true;
								break;
							}
							upload(file);
						}
					}
				}), queue.length > 0 || saved.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					dir: "rtl",
					className: "mt-2 flex flex-col gap-2",
					children: [saved.map((item) => {
						const name = item.title?.trim() || "فایل";
						const size = item.size ? faFileSize(item.size) : "";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid w-full justify-items-start gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Attachment, {
								dir: "rtl",
								state: "done",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentMedia, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { "aria-hidden": "true" }) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AttachmentContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentTitle, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", { children: item.label?.trim() || name }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentDescription, { children: size ? `بارگذاری شد · ${size}` : "بارگذاری شد" })] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentActions, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentAction, {
										"aria-label": "حذف",
										onClick: () => onItems(items.filter((entry) => entry.id !== item.id)),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
									}) })
								]
							}), many ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid w-full gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									value: item.label ?? "",
									maxLength: 80,
									placeholder: "عنوان، دلخواه",
									onChange: (event) => patch(item.id, { label: event.target.value })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
									value: item.note ?? "",
									maxLength: 200,
									placeholder: "توضیحات، دلخواه",
									onChange: (event) => patch(item.id, { note: event.target.value })
								})]
							}) : null]
						}, item.id);
					}), queue.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Attachment, {
						dir: "rtl",
						state: "uploading",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentMedia, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { "aria-hidden": "true" }) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AttachmentContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentTitle, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bdi", { children: item.name }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AttachmentDescription, { children: [
								"در حال بارگذاری · ",
								faNum(item.progress),
								"٪"
							] })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentActions, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AttachmentAction, {
								"aria-label": "حذف",
								onClick: () => {
									dropped.current.add(item.key);
									inflight.current = Math.max(0, inflight.current - 1);
									setQueue((current) => current.filter((entry) => entry.key !== item.key));
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
							}) })
						]
					}, item.key))]
				}) : null]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "نشانی فایل",
				hint: "دلخواه",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					dir: "ltr",
					inputMode: "url",
					value: url,
					placeholder: "https://",
					onChange: (event) => {
						const value = event.target.value;
						urlRef.current = value;
						onUrl(value);
						if (itemsRef.current.filter(isUploadedFile).length + (value.trim() ? 1 : 0) > 1) publish(itemsRef.current);
					},
					className: "min-h-11 w-full rounded-xl border border-line bg-card px-3 text-left text-sm outline-none"
				})
			})
		})
	] });
}
function DividerFields({ text, align, onText, onAlign }) {
	const places = [
		"center",
		"right",
		"left"
	];
	const place = places.includes(align) ? align : "center";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
			label: "متن",
			hint: "دلخواه. یک عبارت کوتاه روی خط",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
				value: text,
				maxLength: 40,
				onChange: (event) => onText(event.target.value.slice(0, 40))
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "موقعیت متن",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedTabs, {
					className: "bg-card",
					items: [
						{ label: "وسط" },
						{ label: "راست" },
						{ label: "چپ" }
					],
					value: Math.max(0, places.indexOf(place)),
					onChange: (next) => onAlign(places[next] ?? "center")
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "پیش‌نمایش",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-2xl bg-[#1c1c1c] px-4 py-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DividerLine, {
						text,
						align: place
					})
				})
			})
		})
	] });
}
function VideoFields({ businessId, title, body, items, onTitle, onBody, onItems }) {
	const fileRef = (0, import_react.useRef)(null);
	const [pending, setPending] = (0, import_react.useState)(false);
	const file = items.find((item) => item.kind === "file" && item.value.startsWith("/api/v1/media/"));
	const links = items.filter((item) => item.kind === "youtube" || item.kind === "aparat");
	async function upload(next) {
		if (next.size > 41943040) {
			toast.error("حجم فیلم بیشتر از ۴۰ مگابایت است");
			return;
		}
		setPending(true);
		const res = await uploadPageVideo(businessId, next);
		setPending(false);
		if (!res.ok) {
			toast.error(res.error);
			return;
		}
		const url = res.data.url;
		onItems((current) => {
			const rest = current.filter((item) => item.kind !== "file");
			const id = current.find((item) => item.kind === "file")?.id ?? crypto.randomUUID();
			return [...rest, {
				id,
				kind: "file",
				title: "",
				value: url
			}];
		});
	}
	function add(kind) {
		if (links.length >= 6) {
			toast.error("بیشتر از ۶ لینک نمی‌شود");
			return;
		}
		onItems((current) => [...current, {
			id: crypto.randomUUID(),
			kind,
			title: "",
			value: ""
		}]);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
			label: "عنوان",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
				value: title,
				maxLength: 80,
				onChange: (event) => onTitle(event.target.value),
				required: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "زیرعنوان",
				hint: "دلخواه",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					value: body,
					maxLength: 120,
					onChange: (event) => onBody(event.target.value)
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Field, {
				label: "آپلود فیلم",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: fileRef,
					type: "file",
					accept: "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov",
					className: "sr-only",
					onChange: (event) => {
						const next = event.target.files?.[0];
						event.target.value = "";
						if (next) upload(next);
					}
				}), file ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "overflow-hidden rounded-xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
						src: file.value,
						controls: true,
						playsInline: true,
						className: "h-48 w-full bg-black object-cover"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between bg-black/70 px-3 py-2 text-sm font-semibold text-white",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => fileRef.current?.click(),
							className: "inline-flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, {
								className: "size-4",
								"aria-hidden": "true"
							}), "ویرایش"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onItems((current) => current.filter((item) => item.kind !== "file")),
							className: "inline-flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
								className: "size-4",
								"aria-hidden": "true"
							}), "حذف"]
						})]
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					disabled: pending,
					onClick: () => fileRef.current?.click(),
					className: "inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-semibold disabled:opacity-60",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, {
						className: "size-4",
						"aria-hidden": "true"
					}), pending ? "در حال آپلود" : "آپلود فیلم"]
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "یوتیوب و آپارات",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => add("youtube"),
						className: "inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-card px-3 text-sm font-semibold",
						children: "یوتیوب"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => add("aparat"),
						className: "inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-card px-3 text-sm font-semibold",
						children: "آپارات"
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid gap-2",
				children: links.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 rounded-xl border border-line bg-paper p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 flex-1 text-sm font-semibold",
							children: item.kind === "aparat" ? "آپارات" : "یوتیوب"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "حذف",
							className: "grid size-8 shrink-0 place-items-center rounded-full text-danger hover:bg-danger-soft",
							onClick: () => onItems((current) => current.filter((row) => row.id !== item.id)),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
								className: "size-4",
								"aria-hidden": "true"
							})
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						dir: "ltr",
						inputMode: "url",
						value: item.value,
						placeholder: "https://",
						onChange: (event) => onItems((current) => current.map((row) => row.id === item.id ? {
							...row,
							value: event.target.value
						} : row)),
						className: "mt-2 min-h-11 w-full min-w-0 rounded-xl border border-line bg-card px-3 text-left text-sm outline-none"
					})]
				}, item.id))
			})]
		})
	] });
}
function GalleryFields({ title, body, items, onTitle, onBody, onItems }) {
	const fileRef = (0, import_react.useRef)(null);
	const target = (0, import_react.useRef)("");
	const photos = items.filter((item) => item.value.startsWith("data:image/"));
	function openPicker(id) {
		target.current = id;
		fileRef.current?.click();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
			label: "عنوان",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
				value: title,
				maxLength: 80,
				onChange: (event) => onTitle(event.target.value),
				required: true
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "زیرعنوان",
				hint: "دلخواه",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					value: body,
					maxLength: 120,
					onChange: (event) => onBody(event.target.value)
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			ref: fileRef,
			type: "file",
			accept: "image/*",
			className: "sr-only",
			onChange: (event) => {
				const file = event.target.files?.[0];
				event.target.value = "";
				const id = target.current;
				if (!file) return;
				readTextImage(file).then((next) => {
					if (id) onItems((current) => current.map((item) => item.id === id ? {
						...item,
						value: next
					} : item));
					else onItems((current) => [...current, {
						id: crypto.randomUUID(),
						kind: "photo",
						title: "",
						value: next
					}]);
				}).catch(() => toast.error("این تصویر باز نشد"));
			}
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 grid grid-cols-2 gap-2",
			children: [photos.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative overflow-hidden rounded-xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: item.value,
					alt: "",
					className: "h-40 w-full object-cover"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/70 px-2 py-1.5 text-xs font-semibold text-white",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => openPicker(item.id),
						className: "inline-flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, {
							className: "size-3.5",
							"aria-hidden": "true"
						}), "ویرایش"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-label": "حذف",
						onClick: () => onItems((current) => current.filter((row) => row.id !== item.id)),
						className: "inline-flex items-center gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
							className: "size-3.5",
							"aria-hidden": "true"
						}), "حذف"]
					})]
				})]
			}, item.id)), photos.length < 6 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => openPicker(""),
				className: "flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-paper text-sm font-semibold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, {
					className: "size-5",
					"aria-hidden": "true"
				}), "افزودن از گالری"]
			}) : null]
		})
	] });
}
function FaqFields({ icon, title, body, items, draft, onIcon, onTitle, onBody, onItems, onDraft }) {
	const Icon = pageIcon(icon) ?? CircleHelp;
	function add() {
		if (draft) {
			toast.error("اول این سوال را ذخیره یا لغو کنید");
			return;
		}
		if (items.length >= 30) {
			toast.error("بیشتر از ۳۰ سوال نمی‌شود");
			return;
		}
		onDraft({
			id: crypto.randomUUID(),
			question: "",
			answer: "",
			fresh: true
		});
	}
	function edit(item) {
		if (draft) {
			toast.error("اول این سوال را ذخیره یا لغو کنید");
			return;
		}
		onDraft({
			id: item.id,
			question: item.title ?? "",
			answer: item.value,
			fresh: false
		});
	}
	function saveDraft() {
		if (!draft) return;
		const question = draft.question.trim();
		const answer = draft.answer.trim();
		if (question.length < 2) {
			toast.error("سوال را وارد کنید");
			return;
		}
		if (answer.length < 1) {
			toast.error("جواب را وارد کنید");
			return;
		}
		const next = {
			id: draft.id,
			kind: "qa",
			title: question,
			value: answer
		};
		if (draft.fresh) onItems([...items, next]);
		else onItems((current) => current.map((row) => row.id === draft.id ? next : row));
		onDraft(null);
	}
	function startDrag(event, id) {
		event.preventDefault();
		const pointerId = event.pointerId;
		const move = (ev) => {
			if (ev.pointerId !== pointerId) return;
			const over = [...document.querySelectorAll("[data-faq]")].findIndex((row) => {
				const box = row.getBoundingClientRect();
				return ev.clientY >= box.top && ev.clientY <= box.bottom;
			});
			if (over < 0) return;
			onItems((current) => {
				const from = current.findIndex((item) => item.id === id);
				if (from < 0 || from === over) return current;
				const next = [...current];
				const [row] = next.splice(from, 1);
				next.splice(over, 0, row);
				return next;
			});
		};
		const end = (ev) => {
			if (ev.pointerId !== pointerId) return;
			window.removeEventListener("pointermove", move);
			window.removeEventListener("pointerup", end);
			window.removeEventListener("pointercancel", end);
		};
		window.addEventListener("pointermove", move);
		window.addEventListener("pointerup", end);
		window.addEventListener("pointercancel", end);
	}
	const form = draft ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-line bg-paper p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "سوال",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					value: draft.question,
					maxLength: 160,
					onChange: (event) => onDraft({
						...draft,
						question: event.target.value
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "جواب",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
						value: draft.answer,
						maxLength: 500,
						onChange: (event) => onDraft({
							...draft,
							answer: event.target.value.slice(0, 500)
						})
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex justify-end gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => onDraft(null),
					className: "inline-flex h-10 items-center justify-center rounded-full border border-line bg-card px-4 text-sm font-semibold",
					children: "انصراف"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: saveDraft,
					className: "inline-flex h-10 items-center justify-center rounded-full bg-ink px-4 text-sm font-semibold text-on-ink",
					children: "ذخیره"
				})]
			})
		]
	}) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
			label: "آیکون",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onIcon,
				className: "flex min-h-11 w-full items-center gap-3 rounded-xl border border-line bg-card px-3 text-start",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "size-5 shrink-0",
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm",
					children: "انتخاب آیکون"
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "عنوان",
				hint: "دلخواه",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					value: title,
					maxLength: 80,
					onChange: (event) => onTitle(event.target.value)
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "توضیحات کوتاه",
				hint: "دلخواه",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
					value: body,
					maxLength: 160,
					onChange: (event) => onBody(event.target.value.slice(0, 160))
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 grid gap-2",
			children: [items.map((item) => draft && !draft.fresh && draft.id === item.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: form }, item.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-faq": item.id,
				className: "flex min-w-0 items-center gap-2 rounded-xl border border-line bg-paper px-2 py-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "جابه‌جایی",
						disabled: Boolean(draft),
						className: "grid size-8 shrink-0 cursor-grab touch-none place-items-center rounded-full text-muted active:cursor-grabbing disabled:cursor-default",
						onPointerDown: (event) => {
							if (!draft) startDrag(event, item.id);
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, {
							className: "size-4",
							"aria-hidden": "true"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "min-w-0 flex-1 truncate text-sm font-semibold",
						children: item.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "ویرایش",
						className: "grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-card hover:text-ink",
						onClick: () => edit(item),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {
							className: "size-4",
							"aria-hidden": "true"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "حذف",
						className: "grid size-8 shrink-0 place-items-center rounded-full text-danger hover:bg-danger-soft",
						onClick: () => onItems((current) => current.filter((row) => row.id !== item.id)),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
							className: "size-4",
							"aria-hidden": "true"
						})
					})
				]
			}, item.id)), draft?.fresh ? form : null]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: add,
			className: "mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-semibold",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
				className: "size-4",
				"aria-hidden": "true"
			}), "افزودن سوال"]
		})
	] });
}
function readTextImage(file) {
	return fitImage(file, 960);
}
function ContactFields({ title, items, onTitle, onItems, specs, empty, textKinds, max = 12, afterTitle }) {
	function add(kind) {
		if (items.length >= max) {
			toast.error(`بیشتر از ${faNum(max)} مورد نمی‌شود`);
			return;
		}
		onItems([...items, {
			id: crypto.randomUUID(),
			kind,
			title: "",
			value: ""
		}]);
	}
	function startDrag(event, id) {
		event.preventDefault();
		const pointerId = event.pointerId;
		const move = (ev) => {
			if (ev.pointerId !== pointerId) return;
			const over = [...document.querySelectorAll("[data-contact]")].findIndex((row) => {
				const box = row.getBoundingClientRect();
				return ev.clientY >= box.top && ev.clientY <= box.bottom;
			});
			if (over < 0) return;
			onItems((current) => {
				const from = current.findIndex((item) => item.id === id);
				if (from < 0 || from === over) return current;
				const next = [...current];
				const [row] = next.splice(from, 1);
				next.splice(over, 0, row);
				return next;
			});
		};
		const end = (ev) => {
			if (ev.pointerId !== pointerId) return;
			window.removeEventListener("pointermove", move);
			window.removeEventListener("pointerup", end);
			window.removeEventListener("pointercancel", end);
		};
		window.addEventListener("pointermove", move);
		window.addEventListener("pointerup", end);
		window.addEventListener("pointercancel", end);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
			label: "عنوان بلوک",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
				value: title,
				maxLength: 80,
				onChange: (event) => onTitle(event.target.value),
				required: true
			})
		}),
		afterTitle,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 grid grid-cols-2 gap-2",
			children: specs.map((kind, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: `inline-flex min-h-11 w-full items-center justify-center rounded-full border border-line bg-card px-3 text-sm font-semibold ${index === specs.length - 1 && specs.length % 2 === 1 ? "col-span-2" : ""}`,
				onClick: () => add(kind.kind),
				children: kind.label
			}, kind.kind))
		}),
		items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-sm text-muted",
			children: empty
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 grid gap-2",
			children: items.map((item) => {
				const kind = specs.find((spec) => spec.kind === item.kind) ?? {
					...contactKind(item.kind),
					input: void 0,
					limit: void 0
				};
				const text = textKinds.includes(item.kind);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					"data-contact": item.id,
					className: "min-w-0 rounded-xl border border-line bg-paper p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "جابه‌جایی",
								className: "grid size-8 shrink-0 cursor-grab touch-none place-items-center rounded-full text-muted active:cursor-grabbing",
								onPointerDown: (event) => startDrag(event, item.id),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, {
									className: "size-4",
									"aria-hidden": "true"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "min-w-0 flex-1 text-sm font-semibold",
								children: kind.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "حذف",
								className: "grid size-8 shrink-0 place-items-center rounded-full text-danger hover:bg-danger-soft",
								onClick: () => onItems((current) => current.filter((row) => row.id !== item.id)),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
									className: "size-4",
									"aria-hidden": "true"
								})
							})
						]
					}), text ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: kind.field,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
								value: item.value,
								maxLength: 400,
								onChange: (event) => onItems((current) => current.map((row) => row.id === item.id ? {
									...row,
									value: event.target.value
								} : row))
							})
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "برچسب",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								value: item.title ?? "",
								maxLength: 40,
								placeholder: kind.label,
								onChange: (event) => onItems((current) => current.map((row) => row.id === item.id ? {
									...row,
									title: event.target.value
								} : row))
							})
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: kind.field,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								dir: "ltr",
								inputMode: kind.input === "tel" || item.kind === "phone" || item.kind === "whatsapp" ? "tel" : kind.input === "email" || item.kind === "email" ? "email" : kind.input === "text" ? "text" : "url",
								value: item.value,
								maxLength: kind.limit ?? (item.kind === "google" || item.kind === "neshan" || item.kind === "waze" || item.kind === "balad" ? 500 : 80),
								placeholder: kind.placeholder,
								onChange: (event) => onItems((current) => current.map((row) => row.id === item.id ? {
									...row,
									value: event.target.value
								} : row)),
								className: "min-h-11 w-full min-w-0 rounded-xl border border-line bg-card px-3 text-left text-sm outline-none"
							})
						})
					})] })]
				}, item.id);
			})
		})
	] });
}
var iconCategoryNames = {
	beauty: "زیبایی و آرایش",
	health: "سلامت",
	consult: "مشاوره",
	education: "آموزش",
	sport: "ورزش",
	auto: "خودرو",
	pets: "حیوانات خانگی",
	other: "سایر"
};
function IconPicker({ selected, onPick, onBack, onClose }) {
	const desktop = useIsDesktop();
	const [groups, setGroups] = (0, import_react.useState)([]);
	const [tab, setTab] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		categoriesFn().then((res) => {
			const next = !res.ok || !Array.isArray(res.data) || res.data.length === 0 ? Object.entries(iconCategoryNames).map(([slug, name]) => ({
				slug,
				name
			})) : res.data.map((item) => ({
				slug: item.slug,
				name: item.name
			}));
			setGroups(next);
			const home = activitySlug(selected);
			setTab(next.some((item) => item.slug === home) ? home : next[0]?.slug ?? "");
		});
	}, [selected]);
	const body = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryTabs, {
			groups,
			value: tab,
			onChange: setTab
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 grid grid-cols-[repeat(auto-fill,3rem)] justify-start gap-1.5",
			children: iconsForSlug(tab).map((item) => {
				const Icon = item.icon;
				const on = item.id === selected;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": item.id,
					"aria-pressed": on,
					className: `grid size-12 place-items-center rounded-xl border ${on ? "border-jade bg-jade-soft text-jade" : "border-line bg-paper text-ink"}`,
					onClick: () => onPick(item.id),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
						className: "size-5",
						"aria-hidden": "true"
					})
				}, item.id);
			})
		})]
	});
	if (desktop) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CenterWindow, {
		title: "انتخاب آیکون",
		onBack,
		onClose,
		z: "z-[80]",
		children: body
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HalfSheet, {
		title: "انتخاب آیکون",
		onBack,
		onClose,
		z: "z-[80]",
		children: body
	});
}
function CategoryTabs({ groups, value, onChange }) {
	const scroller = (0, import_react.useRef)(null);
	const [more, setMore] = (0, import_react.useState)(false);
	const index = Math.max(0, groups.findIndex((item) => item.slug === value));
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
	}, [groups.length]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-w-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: scroller,
			className: "w-full min-w-0 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedTabs, {
				className: "bg-card",
				items: groups.map((item) => ({ label: item.name })),
				value: index,
				onChange: (next) => {
					const group = groups[next];
					if (group) onChange(group.slug);
				}
			})
		}), more ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"aria-hidden": "true",
			className: "pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-card to-transparent"
		}) : null]
	});
}
function activitySlug(iconId) {
	return [
		"beauty",
		"health",
		"consult",
		"education",
		"sport",
		"auto",
		"pets",
		"other"
	].find((slug) => iconsForSlug(slug).some((item) => item.id === iconId)) ?? "other";
}
//#endregion
export { LinksPage as component };
