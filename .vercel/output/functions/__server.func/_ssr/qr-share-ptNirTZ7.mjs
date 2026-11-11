import { i as __toESM } from "../_runtime.mjs";
import { X as require_jsx_runtime, Z as require_react, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as P } from "../_libs/boring-avatars.mjs";
import { i as avatarColors, s as readPageAvatar } from "./page-avatar-BIJU5HCZ.mjs";
import { h as cn, l as Skeleton, r as Button, v as faNum } from "./ui-CYEMVOYZ.mjs";
import { Rt as Check, jt as Copy, r as X } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as require_client } from "../_libs/react-dom+scheduler.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/qr-share-ptNirTZ7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_client = require_client();
var thickness = {
	thin: "[scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5",
	md: "[scrollbar-width:auto] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2"
};
var ScrollArea = (0, import_react.forwardRef)(function ScrollArea({ orientation = "vertical", size = "thin", className, children, ...props }, ref) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		"data-slot": "scroll-area",
		className: cn("min-h-0 min-w-0", orientation === "vertical" && "overflow-y-auto overflow-x-hidden", orientation === "horizontal" && "overflow-x-auto overflow-y-hidden", orientation === "both" && "overflow-auto", "[scrollbar-color:var(--line)_transparent]", "[&::-webkit-scrollbar-track]:bg-transparent", "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-line", "hover:[&::-webkit-scrollbar-thumb]:bg-ink/35", "[&::-webkit-scrollbar-corner]:bg-transparent", thickness[size], className),
		...props,
		children
	});
});
var message = "برای تماس با ما از طریق لینک اقدام کنید";
var shareText = (url) => `سلام، وقت بخیر\nاگه می‌خوای با ما در تماس باشی از طریق لینک زیر می‌تونی اقدام کنی\n${url}`;
var posters = [
	{
		id: "x",
		label: "پست ایکس / توییتر",
		w: 1500,
		h: 675
	},
	{
		id: "facebook",
		label: "پست فیسبوک",
		w: 1200,
		h: 630
	},
	{
		id: "instagram",
		label: "پست اینستاگرام",
		w: 1080,
		h: 1350
	},
	{
		id: "story",
		label: "استوری اینستاگرام",
		w: 1080,
		h: 1920
	}
];
function isPhoto(value) {
	return value.startsWith("data:") || value.startsWith("blob:") || value.startsWith("http") || value.startsWith("/");
}
function loadImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		if (/^https?:/i.test(src)) img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => reject(/* @__PURE__ */ new Error("image"));
		img.src = src;
	});
}
async function loadMark(value) {
	const src = value.trim();
	if (isPhoto(src)) try {
		return await loadImage(src);
	} catch {
		return null;
	}
	const beam = src.startsWith("beam:") ? src.slice(5) : "";
	if (!beam) return null;
	const host = document.createElement("div");
	host.style.cssText = "position:fixed;left:-9999px;top:0;width:280px;height:280px;pointer-events:none";
	document.body.appendChild(host);
	const root = (0, import_client.createRoot)(host);
	try {
		await new Promise((resolve) => {
			root.render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, {
				size: 280,
				name: beam,
				variant: "beam",
				colors: avatarColors
			}));
			requestAnimationFrame(() => resolve());
		});
		const svg = host.querySelector("svg");
		if (!svg) return null;
		if (!svg.getAttribute("xmlns")) svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		const xml = new XMLSerializer().serializeToString(svg);
		return await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`);
	} catch {
		return null;
	} finally {
		root.unmount();
		host.remove();
	}
}
function roundedRect(ctx, x, y, w, h, r) {
	const radius = Math.min(r, w / 2, h / 2);
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.arcTo(x + w, y, x + w, y + h, radius);
	ctx.arcTo(x + w, y + h, x, y + h, radius);
	ctx.arcTo(x, y + h, x, y, radius);
	ctx.arcTo(x, y, x + w, y, radius);
	ctx.closePath();
}
function ellipsis(ctx, text, max) {
	if (ctx.measureText(text).width <= max) return text;
	let out = text;
	while (out.length > 4 && ctx.measureText(`${out}…`).width > max) out = out.slice(0, -1);
	return `${out}…`;
}
function wrap(ctx, text, max) {
	const words = text.split(/\s+/);
	const lines = [];
	let line = "";
	for (const word of words) {
		const next = line ? `${line} ${word}` : word;
		if (line && ctx.measureText(next).width > max) {
			lines.push(line);
			line = word;
		} else line = next;
	}
	if (line) lines.push(line);
	return lines;
}
function drawAvatar(ctx, img, name, cx, cy, r) {
	ctx.save();
	ctx.beginPath();
	ctx.arc(cx, cy, r, 0, Math.PI * 2);
	ctx.closePath();
	ctx.clip();
	if (img) {
		const scale = Math.max(r * 2 / img.width, r * 2 / img.height);
		const dw = img.width * scale;
		const dh = img.height * scale;
		ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
	} else {
		ctx.fillStyle = "#0e6b54";
		ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
		ctx.fillStyle = "#f4fff9";
		ctx.direction = "rtl";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.font = `800 ${Math.round(r * .86)}px Vazirmatn, sans-serif`;
		ctx.fillText(name.trim().slice(0, 1) || "ن", cx, cy);
	}
	ctx.restore();
}
function drawQr(ctx, img, x, y, size) {
	roundedRect(ctx, x, y, size, size, size * .07);
	ctx.fillStyle = "#ffffff";
	ctx.fill();
	const pad = size * .07;
	ctx.drawImage(img, x + pad, y + pad, size - pad * 2, size - pad * 2);
}
async function paintPoster(width, height, name, url, avatar, qr) {
	await document.fonts.load("800 64px Vazirmatn");
	await document.fonts.load("500 32px Vazirmatn");
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("canvas");
	ctx.fillStyle = "#f6f3ec";
	ctx.fillRect(0, 0, width, height);
	ctx.fillStyle = "#0e6b54";
	ctx.fillRect(0, 0, width, Math.max(10, Math.round(height * .012)));
	if (width / height > 1.35) {
		const pad = Math.round(width * .045);
		const qrSize = Math.round(height * .7);
		const qrX = pad;
		drawQr(ctx, qr, qrX, Math.round((height - qrSize) / 2), qrSize);
		const right = width - pad;
		const left = qrX + qrSize + pad;
		const col = right - left;
		const radius = Math.round(height * .105);
		const avatarCy = Math.round(height * .36);
		drawAvatar(ctx, avatar, name, right - radius, avatarCy, radius);
		ctx.direction = "rtl";
		ctx.textAlign = "right";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "#121212";
		ctx.font = `800 ${Math.round(height * .085)}px Vazirmatn, sans-serif`;
		ctx.fillText(ellipsis(ctx, name, col - radius * 2 - 28), right - radius * 2 - 24, avatarCy);
		const body = Math.round(height * .046);
		ctx.font = `500 ${body}px Vazirmatn, sans-serif`;
		ctx.fillStyle = "#3a3a3a";
		ctx.textBaseline = "top";
		let y = avatarCy + radius + Math.round(body * .4);
		for (const line of wrap(ctx, message, col)) {
			ctx.fillText(line, right, y);
			y += body * 1.55;
		}
		ctx.direction = "ltr";
		ctx.textAlign = "left";
		ctx.textBaseline = "bottom";
		ctx.fillStyle = "#0e6b54";
		ctx.font = `500 ${Math.round(height * .036)}px Vazirmatn, sans-serif`;
		ctx.fillText(ellipsis(ctx, url, col), left, height - pad);
	} else {
		const pad = Math.round(width * .08);
		const radius = Math.round(width * .125);
		let y = Math.round(height * (height > width * 1.5 ? .14 : .09));
		drawAvatar(ctx, avatar, name, width / 2, y + radius, radius);
		y += radius * 2 + Math.round(width * .05);
		ctx.direction = "rtl";
		ctx.textAlign = "center";
		ctx.textBaseline = "top";
		ctx.fillStyle = "#121212";
		const nameSize = Math.round(width * .058);
		ctx.font = `800 ${nameSize}px Vazirmatn, sans-serif`;
		ctx.fillText(ellipsis(ctx, name, width - pad * 2), width / 2, y);
		y += nameSize * 1.45;
		const body = Math.round(width * .038);
		ctx.font = `500 ${body}px Vazirmatn, sans-serif`;
		ctx.fillStyle = "#3f3f3f";
		for (const line of wrap(ctx, message, width - pad * 2)) {
			ctx.fillText(line, width / 2, y);
			y += body * 1.55;
		}
		const qrSize = Math.round(Math.min(width * .5, height - y - pad * 1.6));
		y += Math.round(width * .04);
		drawQr(ctx, qr, (width - qrSize) / 2, y, qrSize);
		y += qrSize + Math.round(width * .04);
		ctx.direction = "ltr";
		ctx.fillStyle = "#0e6b54";
		ctx.font = `500 ${Math.round(width * .03)}px Vazirmatn, sans-serif`;
		ctx.fillText(ellipsis(ctx, url, width - pad * 2), width / 2, y);
	}
	return canvas;
}
function canvasBlob(canvas) {
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => blob ? resolve(blob) : reject(/* @__PURE__ */ new Error("blob")), "image/png");
	});
}
function iosDevice() {
	return /iPhone|iPad|iPod/i.test(navigator.userAgent) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
}
function QrDialog({ name, slug, url, avatar = "", businessId = "", onClose }) {
	const [src, setSrc] = (0, import_react.useState)("");
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [menu, setMenu] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)("");
	const [preview, setPreview] = (0, import_react.useState)(null);
	const menuRef = (0, import_react.useRef)(null);
	const previewRef = (0, import_react.useRef)(null);
	const target = url || (typeof window !== "undefined" ? `${window.location.origin}/b/${slug}` : `/b/${slug}`);
	const photo = (() => {
		const local = readPageAvatar(businessId, slug);
		if (isPhoto(avatar)) return avatar;
		if (isPhoto(local)) return local;
		return avatar || local;
	})();
	(0, import_react.useEffect)(() => {
		let live = true;
		import("../_libs/qrcode.mjs").then((n) => /* @__PURE__ */ __toESM(n.t())).then((QR) => QR.toDataURL(target, {
			width: 640,
			margin: 1,
			color: {
				dark: "#121212",
				light: "#ffffff"
			}
		})).then((next) => {
			if (live) setSrc(next);
		});
		return () => {
			live = false;
		};
	}, [target]);
	(0, import_react.useEffect)(() => {
		if (!menu) return;
		const close = (event) => {
			const node = event.target;
			if (node instanceof Node && menuRef.current?.contains(node)) return;
			setMenu(false);
		};
		window.addEventListener("click", close);
		return () => window.removeEventListener("click", close);
	}, [menu]);
	(0, import_react.useEffect)(() => {
		return () => {
			if (previewRef.current) URL.revokeObjectURL(previewRef.current.url);
		};
	}, []);
	function closePreview() {
		const current = previewRef.current;
		previewRef.current = null;
		setPreview(null);
		if (current) window.setTimeout(() => URL.revokeObjectURL(current.url), 6e4);
	}
	async function openPreview(item) {
		if (busy) return;
		setBusy(item.id);
		try {
			const data = await (await import("../_libs/qrcode.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()))).toDataURL(target, {
				width: 900,
				margin: 1,
				color: {
					dark: "#121212",
					light: "#ffffff"
				}
			});
			const [qr, mark] = await Promise.all([loadImage(data), loadMark(photo)]);
			const blob = await canvasBlob(await paintPoster(item.w, item.h, name || "کسب‌وکار", target, mark, qr));
			const next = {
				url: URL.createObjectURL(blob),
				blob,
				filename: `agent-${item.id}.png`,
				label: item.label,
				w: item.w,
				h: item.h
			};
			if (previewRef.current) URL.revokeObjectURL(previewRef.current.url);
			previewRef.current = next;
			setPreview(next);
			setMenu(false);
		} catch {
			toast.error("ساخت تصویر نشد");
		} finally {
			setBusy("");
		}
	}
	async function share() {
		const text = shareText(target);
		if (typeof navigator !== "undefined" && navigator.share) try {
			await navigator.share({
				title: name || "صفحه من",
				text
			});
			return;
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") return;
		}
		try {
			await navigator.clipboard.writeText(text);
			toast.success("متن اشتراک‌گذاری کپی شد");
		} catch {
			toast.error("اشتراک‌گذاری ممکن نشد");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 grid place-items-center p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "absolute inset-0 bg-black/40",
				"aria-label": "بستن",
				onClick: onClose
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 grid max-h-[92dvh] w-full max-w-sm gap-3 overflow-y-auto rounded-card border border-line bg-card p-5 text-ink shadow-xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "min-w-0 truncate font-extrabold",
							children: name
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
					}),
					src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src,
						alt: "",
						className: "mx-auto size-52 rounded-xl bg-white p-2"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mx-auto size-52" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 rounded-xl border border-line bg-paper p-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "min-w-0 flex-1 truncate text-left text-sm text-ink",
							dir: "ltr",
							children: target
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "h-10 shrink-0 rounded-lg bg-ink px-3 text-sm font-semibold text-on-ink",
							onClick: () => {
								navigator.clipboard.writeText(target).then(() => {
									setCopied(true);
									toast.success("لینک کپی شد");
									window.setTimeout(() => setCopied(false), 1600);
								}).catch(() => toast.error("کپی نشد"));
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1.5",
								children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
									className: "size-4",
									"aria-hidden": "true"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
									className: "size-4",
									"aria-hidden": "true"
								}), copied ? "کپی شد" : "کپی"]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						ref: menuRef,
						className: "grid gap-2",
						children: [
							slug ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/b/$slug",
								params: { slug },
								className: "inline-flex h-11 items-center justify-center rounded-full border border-line bg-card px-3 text-sm font-semibold",
								children: "صفحه من"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "quiet",
								disabled: true,
								children: "صفحه من"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "quiet",
									"aria-expanded": menu,
									disabled: !slug,
									onClick: (event) => {
										event.stopPropagation();
										setMenu((open) => !open);
									},
									children: "دانلود"
								}), menu ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-xl border border-line bg-paper p-1",
									children: posters.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "w-full rounded-lg px-3 py-2 text-start hover:bg-card disabled:opacity-50",
										disabled: Boolean(busy),
										onClick: () => void openPreview(item),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-sm font-semibold",
											children: busy === item.id ? "در حال ساخت…" : item.label
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mt-0.5 block text-xs text-muted",
											dir: "ltr",
											children: [
												faNum(item.w),
												"×",
												faNum(item.h)
											]
										})]
									}, item.id))
								}) : null]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "signup",
								disabled: !slug,
								onClick: () => void share(),
								children: "اشتراک‌گذاری"
							})
						]
					})
				]
			}),
			preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative z-10 flex max-h-[92dvh] w-full max-w-sm flex-col gap-3 rounded-card border border-line bg-card p-4 text-ink shadow-xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "truncate font-extrabold",
									children: preview.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted",
									dir: "ltr",
									children: [
										faNum(preview.w),
										"×",
										faNum(preview.h)
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": "بستن",
								onClick: closePreview,
								className: "grid size-9 shrink-0 place-items-center rounded-full text-ink hover:bg-paper",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
									className: "size-5",
									"aria-hidden": "true"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: preview.url,
							alt: preview.label,
							className: "max-h-[60dvh] w-full rounded-xl bg-paper object-contain"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: preview.url,
							download: preview.filename,
							className: "inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--signup-bg)] text-sm font-semibold text-[var(--signup-fg)]",
							onClick: (event) => {
								const current = previewRef.current;
								if (!current) return;
								const file = new File([current.blob], current.filename, { type: "image/png" });
								if (iosDevice() && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
									event.preventDefault();
									navigator.share({
										files: [file],
										title: name || current.label
									}).catch((error) => {
										if (error instanceof Error && error.name === "AbortError") return;
										toast.error("دانلود تصویر نشد");
									});
								}
							},
							children: "دانلود"
						})
					]
				})
			}) : null
		]
	});
}
//#endregion
export { ScrollArea as n, QrDialog as t };
