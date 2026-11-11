import { i as __toESM } from "../_runtime.mjs";
import { X as require_jsx_runtime, Z as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as P } from "../_libs/boring-avatars.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/page-avatar-BIJU5HCZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var seeds = [
	"aria",
	"mina",
	"reza",
	"sara",
	"kian",
	"nilo",
	"omid",
	"lida",
	"arman",
	"homa",
	"yas",
	"pari",
	"sina",
	"roya",
	"nima",
	"dara",
	"elham",
	"farid",
	"gita",
	"hamed",
	"iman",
	"jaleh",
	"kamran",
	"leila",
	"mahsa",
	"nader",
	"ozra",
	"pouya",
	"ramin",
	"shadi",
	"tara",
	"vahid",
	"yegane",
	"zahra",
	"baran",
	"caspian"
];
var avatarColors = [
	"#92A1C6",
	"#146A7C",
	"#F0AB3D",
	"#C271B4",
	"#C20D90"
];
var readyAvatars = seeds.map((name) => ({
	variant: "beam",
	name,
	id: `beam:${name}`
}));
function pageImageKey(businessId) {
	return `agent.page-image.${businessId}`;
}
function pageImageSlugKey(slug) {
	return `agent.page-image.slug.${slug}`;
}
function assignRandomPageAvatar(businessId) {
	const pick = readyAvatars[Math.floor(Math.random() * readyAvatars.length)];
	try {
		localStorage.setItem(pageImageKey(businessId), pick.id);
	} catch {}
	return pick.id;
}
function rememberPageAvatar(businessId, slug, value) {
	try {
		if (businessId) localStorage.setItem(pageImageKey(businessId), value);
		if (slug) localStorage.setItem(pageImageSlugKey(slug), value);
	} catch {}
	if (typeof window !== "undefined") window.dispatchEvent(new Event("agent-avatar"));
}
function readPageAvatar(businessId, slug) {
	if (typeof window === "undefined") return "";
	try {
		if (businessId) {
			const byId = localStorage.getItem(pageImageKey(businessId));
			if (byId) return byId;
		}
		if (slug) return localStorage.getItem(pageImageSlugKey(slug)) ?? "";
	} catch {
		return "";
	}
	return "";
}
function fitAvatar(value) {
	if (!value.startsWith("data:")) return Promise.resolve(value);
	return new Promise((resolve) => {
		const img = new Image();
		img.onload = () => {
			const scale = Math.min(1, 192 / Math.max(img.width, img.height));
			const canvas = document.createElement("canvas");
			canvas.width = Math.max(1, Math.round(img.width * scale));
			canvas.height = Math.max(1, Math.round(img.height * scale));
			const ctx = canvas.getContext("2d");
			if (!ctx) {
				resolve("");
				return;
			}
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			resolve(canvas.toDataURL("image/jpeg", .82));
		};
		img.onerror = () => resolve("");
		img.src = value;
	});
}
function isPhoto(value) {
	return value.startsWith("data:") || value.startsWith("blob:") || value.startsWith("http");
}
function pickMark(local, server) {
	if (isPhoto(server)) return server;
	if (isPhoto(local)) return local;
	if (server) return server;
	return local;
}
function RoundAvatar({ value, size = 40 }) {
	const beamName = value.startsWith("beam:") ? value.slice(5) : value.includes(":") ? value.slice(value.indexOf(":") + 1) : "";
	const photo = value.startsWith("data:") || value.startsWith("blob:") || value.startsWith("http");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "grid shrink-0 overflow-hidden rounded-full [&>svg]:block [&>svg]:size-full",
		style: {
			width: size,
			height: size
		},
		children: photo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: value,
			alt: "",
			className: "size-full rounded-full object-cover"
		}) : beamName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, {
			size,
			name: beamName,
			variant: "beam",
			colors: avatarColors
		}) : null
	});
}
function PageMark({ businessId, slug, name, avatar = "", size = 32 }) {
	const [image, setImage] = (0, import_react.useState)(avatar);
	(0, import_react.useEffect)(() => {
		const sync = () => setImage(pickMark(readPageAvatar(businessId, slug), avatar || ""));
		sync();
		window.addEventListener("agent-avatar", sync);
		return () => window.removeEventListener("agent-avatar", sync);
	}, [
		businessId,
		slug,
		avatar
	]);
	if (image) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoundAvatar, {
		value: image,
		size
	});
	const letter = name.trim().slice(0, 1) || "ن";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "grid shrink-0 place-items-center rounded-full bg-jade font-bold text-on-jade",
		style: {
			width: size,
			height: size,
			fontSize: Math.max(12, Math.round(size * .36))
		},
		children: letter
	});
}
//#endregion
export { fitAvatar as a, readyAvatars as c, avatarColors as i, rememberPageAvatar as l, RoundAvatar as n, pageImageKey as o, assignRandomPageAvatar as r, readPageAvatar as s, PageMark as t };
