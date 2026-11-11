import { i as __toESM } from "../_runtime.mjs";
import { X as require_jsx_runtime, Z as require_react } from "./@tanstack/react-router+[...].mjs";
//#region node_modules/boring-avatars/dist/index.js
var import_jsx_runtime = require_jsx_runtime();
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var m = (l) => {
	let r = 0;
	for (let i = 0; i < l.length; i++) {
		const a = l.charCodeAt(i);
		r = (r << 5) - r + a, r = r & r;
	}
	return Math.abs(r);
};
var C = (l, r) => Math.floor(l / Math.pow(10, r) % 10);
var v = (l, r) => !(C(l, r) % 2);
var f = (l, r, i) => {
	const a = l % r;
	return i && C(l, i) % 2 === 0 ? -a : a;
};
var u = (l, r, i) => r[l % i];
var _ = (l) => {
	l.slice(0, 1) === "#" && (l = l.slice(1));
	const r = parseInt(l.substr(0, 2), 16), i = parseInt(l.substr(2, 2), 16), a = parseInt(l.substr(4, 2), 16);
	return (r * 299 + i * 587 + a * 114) / 1e3 >= 128 ? "#000000" : "#FFFFFF";
};
var A = 4;
var o = 80;
function $(l, r) {
	const i = m(l), a = r && r.length;
	return Array.from({ length: A }, (n, t) => ({
		color: u(i + t, r, a),
		translateX: f(i * (t + 1), o / 2 - (t + 17), 1),
		translateY: f(i * (t + 1), o / 2 - (t + 17), 2),
		rotate: f(i * (t + 1), 360),
		isSquare: v(i, 2)
	}));
}
var k = ({ name: l, colors: r, title: i, square: a, size: h, ...n }) => {
	const t = $(l, r), s = import_react.useId();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 80 80",
		fill: "none",
		role: "img",
		xmlns: "http://www.w3.org/2000/svg",
		width: h,
		height: h,
		...n,
		children: [
			i && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: l }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mask", {
				id: s,
				maskUnits: "userSpaceOnUse",
				x: 0,
				y: 0,
				width: o,
				height: o,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					width: o,
					height: o,
					rx: a ? void 0 : 160,
					fill: "#FFFFFF"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				mask: `url(#${s})`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						width: o,
						height: o,
						fill: t[0].color
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 10,
						y: 30,
						width: o,
						height: t[1].isSquare ? o : o / 8,
						fill: t[1].color,
						transform: "translate(" + t[1].translateX + " " + t[1].translateY + ") rotate(" + t[1].rotate + " 40 40)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: o / 2,
						cy: o / 2,
						fill: t[2].color,
						r: o / 5,
						transform: "translate(" + t[2].translateX + " " + t[2].translateY + ")"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: 0,
						y1: o / 2,
						x2: o,
						y2: o / 2,
						strokeWidth: 2,
						stroke: t[3].color,
						transform: "translate(" + t[3].translateX + " " + t[3].translateY + ") rotate(" + t[3].rotate + " 40 40)"
					})
				]
			})
		]
	});
};
var p = 90;
var B = 5;
function U(l, r) {
	const i = m(l), a = r && r.length, h = Array.from({ length: B }, (t, s) => u(i + s, r, a)), n = [];
	return n[0] = h[0], n[1] = h[1], n[2] = h[1], n[3] = h[2], n[4] = h[2], n[5] = h[3], n[6] = h[3], n[7] = h[0], n[8] = h[4], n;
}
var E = ({ name: l, colors: r, title: i, square: a, size: h, ...n }) => {
	const t = U(l, r), s = import_react.useId();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 90 90",
		fill: "none",
		role: "img",
		xmlns: "http://www.w3.org/2000/svg",
		width: h,
		height: h,
		...n,
		children: [
			i && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: l }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mask", {
				id: s,
				maskUnits: "userSpaceOnUse",
				x: 0,
				y: 0,
				width: p,
				height: p,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					width: p,
					height: p,
					rx: a ? void 0 : 180,
					fill: "#FFFFFF"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				mask: `url(#${s})`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M0 0h90v45H0z",
						fill: t[0]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M0 45h90v45H0z",
						fill: t[1]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M83 45a38 38 0 00-76 0h76z",
						fill: t[2]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M83 45a38 38 0 01-76 0h76z",
						fill: t[3]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M77 45a32 32 0 10-64 0h64z",
						fill: t[4]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M77 45a32 32 0 11-64 0h64z",
						fill: t[5]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M71 45a26 26 0 00-52 0h52z",
						fill: t[6]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M71 45a26 26 0 01-52 0h52z",
						fill: t[7]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: 45,
						cy: 45,
						r: 23,
						fill: t[8]
					})
				]
			})
		]
	});
};
var L = 64;
var x = 80;
function T(l, r) {
	const i = m(l), a = r && r.length;
	return Array.from({ length: L }, (n, t) => u(i % (t + 1), r, a));
}
var O = ({ name: l, colors: r, title: i, square: a, size: h, ...n }) => {
	const t = T(l, r), s = import_react.useId();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 80 80",
		fill: "none",
		role: "img",
		xmlns: "http://www.w3.org/2000/svg",
		width: h,
		height: h,
		...n,
		children: [
			i && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: l }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mask", {
				id: s,
				"mask-type": "alpha",
				maskUnits: "userSpaceOnUse",
				x: 0,
				y: 0,
				width: x,
				height: x,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					width: x,
					height: x,
					rx: a ? void 0 : 160,
					fill: "#FFFFFF"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				mask: `url(#${s})`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						width: 10,
						height: 10,
						fill: t[0]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 20,
						width: 10,
						height: 10,
						fill: t[1]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 40,
						width: 10,
						height: 10,
						fill: t[2]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 60,
						width: 10,
						height: 10,
						fill: t[3]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 10,
						width: 10,
						height: 10,
						fill: t[4]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 30,
						width: 10,
						height: 10,
						fill: t[5]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 50,
						width: 10,
						height: 10,
						fill: t[6]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 70,
						width: 10,
						height: 10,
						fill: t[7]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						y: 10,
						width: 10,
						height: 10,
						fill: t[8]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						y: 20,
						width: 10,
						height: 10,
						fill: t[9]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						y: 30,
						width: 10,
						height: 10,
						fill: t[10]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						y: 40,
						width: 10,
						height: 10,
						fill: t[11]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						y: 50,
						width: 10,
						height: 10,
						fill: t[12]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						y: 60,
						width: 10,
						height: 10,
						fill: t[13]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						y: 70,
						width: 10,
						height: 10,
						fill: t[14]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 20,
						y: 10,
						width: 10,
						height: 10,
						fill: t[15]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 20,
						y: 20,
						width: 10,
						height: 10,
						fill: t[16]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 20,
						y: 30,
						width: 10,
						height: 10,
						fill: t[17]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 20,
						y: 40,
						width: 10,
						height: 10,
						fill: t[18]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 20,
						y: 50,
						width: 10,
						height: 10,
						fill: t[19]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 20,
						y: 60,
						width: 10,
						height: 10,
						fill: t[20]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 20,
						y: 70,
						width: 10,
						height: 10,
						fill: t[21]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 40,
						y: 10,
						width: 10,
						height: 10,
						fill: t[22]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 40,
						y: 20,
						width: 10,
						height: 10,
						fill: t[23]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 40,
						y: 30,
						width: 10,
						height: 10,
						fill: t[24]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 40,
						y: 40,
						width: 10,
						height: 10,
						fill: t[25]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 40,
						y: 50,
						width: 10,
						height: 10,
						fill: t[26]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 40,
						y: 60,
						width: 10,
						height: 10,
						fill: t[27]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 40,
						y: 70,
						width: 10,
						height: 10,
						fill: t[28]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 60,
						y: 10,
						width: 10,
						height: 10,
						fill: t[29]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 60,
						y: 20,
						width: 10,
						height: 10,
						fill: t[30]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 60,
						y: 30,
						width: 10,
						height: 10,
						fill: t[31]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 60,
						y: 40,
						width: 10,
						height: 10,
						fill: t[32]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 60,
						y: 50,
						width: 10,
						height: 10,
						fill: t[33]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 60,
						y: 60,
						width: 10,
						height: 10,
						fill: t[34]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 60,
						y: 70,
						width: 10,
						height: 10,
						fill: t[35]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 10,
						y: 10,
						width: 10,
						height: 10,
						fill: t[36]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 10,
						y: 20,
						width: 10,
						height: 10,
						fill: t[37]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 10,
						y: 30,
						width: 10,
						height: 10,
						fill: t[38]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 10,
						y: 40,
						width: 10,
						height: 10,
						fill: t[39]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 10,
						y: 50,
						width: 10,
						height: 10,
						fill: t[40]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 10,
						y: 60,
						width: 10,
						height: 10,
						fill: t[41]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 10,
						y: 70,
						width: 10,
						height: 10,
						fill: t[42]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 30,
						y: 10,
						width: 10,
						height: 10,
						fill: t[43]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 30,
						y: 20,
						width: 10,
						height: 10,
						fill: t[44]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 30,
						y: 30,
						width: 10,
						height: 10,
						fill: t[45]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 30,
						y: 40,
						width: 10,
						height: 10,
						fill: t[46]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 30,
						y: 50,
						width: 10,
						height: 10,
						fill: t[47]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 30,
						y: 60,
						width: 10,
						height: 10,
						fill: t[48]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 30,
						y: 70,
						width: 10,
						height: 10,
						fill: t[49]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 50,
						y: 10,
						width: 10,
						height: 10,
						fill: t[50]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 50,
						y: 20,
						width: 10,
						height: 10,
						fill: t[51]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 50,
						y: 30,
						width: 10,
						height: 10,
						fill: t[52]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 50,
						y: 40,
						width: 10,
						height: 10,
						fill: t[53]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 50,
						y: 50,
						width: 10,
						height: 10,
						fill: t[54]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 50,
						y: 60,
						width: 10,
						height: 10,
						fill: t[55]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 50,
						y: 70,
						width: 10,
						height: 10,
						fill: t[56]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 70,
						y: 10,
						width: 10,
						height: 10,
						fill: t[57]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 70,
						y: 20,
						width: 10,
						height: 10,
						fill: t[58]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 70,
						y: 30,
						width: 10,
						height: 10,
						fill: t[59]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 70,
						y: 40,
						width: 10,
						height: 10,
						fill: t[60]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 70,
						y: 50,
						width: 10,
						height: 10,
						fill: t[61]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 70,
						y: 60,
						width: 10,
						height: 10,
						fill: t[62]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 70,
						y: 70,
						width: 10,
						height: 10,
						fill: t[63]
					})
				]
			})
		]
	});
};
var c = 36;
function b(l, r) {
	const i = m(l), a = r && r.length, h = u(i, r, a), n = f(i, 10, 1), t = n < 5 ? n + c / 9 : n, s = f(i, 10, 2), y = s < 5 ? s + c / 9 : s;
	return {
		wrapperColor: h,
		faceColor: _(h),
		backgroundColor: u(i + 13, r, a),
		wrapperTranslateX: t,
		wrapperTranslateY: y,
		wrapperRotate: f(i, 360),
		wrapperScale: 1 + f(i, c / 12) / 10,
		isMouthOpen: v(i, 2),
		isCircle: v(i, 1),
		eyeSpread: f(i, 5),
		mouthSpread: f(i, 3),
		faceRotate: f(i, 10, 3),
		faceTranslateX: t > c / 6 ? t / 2 : f(i, 8, 1),
		faceTranslateY: y > c / 6 ? y / 2 : f(i, 7, 2)
	};
}
var S = ({ name: l, colors: r, title: i, square: a, size: h, ...n }) => {
	const t = b(l, r), s = import_react.useId();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 36 36",
		fill: "none",
		role: "img",
		xmlns: "http://www.w3.org/2000/svg",
		width: h,
		height: h,
		...n,
		children: [
			i && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: l }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mask", {
				id: s,
				maskUnits: "userSpaceOnUse",
				x: 0,
				y: 0,
				width: c,
				height: c,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					width: c,
					height: c,
					rx: a ? void 0 : 72,
					fill: "#FFFFFF"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				mask: `url(#${s})`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						width: c,
						height: c,
						fill: t.backgroundColor
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: "0",
						y: "0",
						width: c,
						height: c,
						transform: "translate(" + t.wrapperTranslateX + " " + t.wrapperTranslateY + ") rotate(" + t.wrapperRotate + " 18 18) scale(" + t.wrapperScale + ")",
						fill: t.wrapperColor,
						rx: t.isCircle ? c : c / 6
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						transform: "translate(" + t.faceTranslateX + " " + t.faceTranslateY + ") rotate(" + t.faceRotate + " 18 18)",
						children: [
							t.isMouthOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								d: "M15 " + (19 + t.mouthSpread) + "c2 1 4 1 6 0",
								stroke: t.faceColor,
								fill: "none",
								strokeLinecap: "round"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								d: "M13," + (19 + t.mouthSpread) + " a1,0.75 0 0,0 10,0",
								fill: t.faceColor
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
								x: 14 - t.eyeSpread,
								y: 14,
								width: 1.5,
								height: 2,
								rx: 1,
								stroke: "none",
								fill: t.faceColor
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
								x: 20 + t.eyeSpread,
								y: 14,
								width: 1.5,
								height: 2,
								rx: 1,
								stroke: "none",
								fill: t.faceColor
							})
						]
					})
				]
			})
		]
	});
};
var R = 4;
var w = 80;
function X(l, r) {
	const i = m(l), a = r && r.length;
	return Array.from({ length: R }, (n, t) => u(i + t, r, a));
}
var Y = ({ name: l, colors: r, title: i, square: a, size: h, ...n }) => {
	const t = X(l, r), s = l.replace(/\s/g, ""), y = import_react.useId();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 80 80",
		fill: "none",
		role: "img",
		xmlns: "http://www.w3.org/2000/svg",
		width: h,
		height: h,
		...n,
		children: [
			i && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: l }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mask", {
				id: y,
				maskUnits: "userSpaceOnUse",
				x: 0,
				y: 0,
				width: w,
				height: w,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					width: w,
					height: w,
					rx: a ? void 0 : 160,
					fill: "#FFFFFF"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				mask: `url(#${y})`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					fill: "url(#gradient_paint0_linear_" + s + ")",
					d: "M0 0h80v40H0z"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					fill: "url(#gradient_paint1_linear_" + s + ")",
					d: "M0 40h80v40H0z"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: "gradient_paint0_linear_" + s,
				x1: w / 2,
				y1: 0,
				x2: w / 2,
				y2: w / 2,
				gradientUnits: "userSpaceOnUse",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", { stopColor: t[0] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: 1,
					stopColor: t[1]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: "gradient_paint1_linear_" + s,
				x1: w / 2,
				y1: w / 2,
				x2: w / 2,
				y2: w,
				gradientUnits: "userSpaceOnUse",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", { stopColor: t[2] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: 1,
					stopColor: t[3]
				})]
			})] })
		]
	});
};
var D = 3;
var g = 80;
function N(l, r) {
	const i = m(l), a = r && r.length;
	return Array.from({ length: D }, (n, t) => ({
		color: u(i + t, r, a),
		translateX: f(i * (t + 1), g / 10, 1),
		translateY: f(i * (t + 1), g / 10, 2),
		scale: 1.2 + f(i * (t + 1), g / 20) / 10,
		rotate: f(i * (t + 1), 360, 1)
	}));
}
var I = ({ name: l, colors: r, title: i, square: a, size: h, ...n }) => {
	const t = N(l, r), s = import_react.useId();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 80 80",
		fill: "none",
		role: "img",
		xmlns: "http://www.w3.org/2000/svg",
		width: h,
		height: h,
		...n,
		children: [
			i && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("title", { children: l }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mask", {
				id: s,
				maskUnits: "userSpaceOnUse",
				x: 0,
				y: 0,
				width: g,
				height: g,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					width: g,
					height: g,
					rx: a ? void 0 : 160,
					fill: "#FFFFFF"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				mask: `url(#${s})`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						width: g,
						height: g,
						fill: t[0].color
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						filter: `url(#filter_${s})`,
						d: "M32.414 59.35L50.376 70.5H72.5v-71H33.728L26.5 13.381l19.057 27.08L32.414 59.35z",
						fill: t[1].color,
						transform: "translate(" + t[1].translateX + " " + t[1].translateY + ") rotate(" + t[1].rotate + " 40 40) scale(" + t[2].scale + ")"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						filter: `url(#filter_${s})`,
						style: { mixBlendMode: "overlay" },
						d: "M22.216 24L0 46.75l14.108 38.129L78 86l-3.081-59.276-22.378 4.005 12.972 20.186-23.35 27.395L22.215 24z",
						fill: t[2].color,
						transform: "translate(" + t[2].translateX + " " + t[2].translateY + ") rotate(" + t[2].rotate + " 40 40) scale(" + t[2].scale + ")"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("filter", {
				id: `filter_${s}`,
				filterUnits: "userSpaceOnUse",
				colorInterpolationFilters: "sRGB",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("feFlood", {
						floodOpacity: 0,
						result: "BackgroundImageFix"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("feBlend", {
						in: "SourceGraphic",
						in2: "BackgroundImageFix",
						result: "shape"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("feGaussianBlur", {
						stdDeviation: 7,
						result: "effect1_foregroundBlur"
					})
				]
			}) })
		]
	});
};
var z = {
	pixel: O,
	bauhaus: k,
	ring: E,
	beam: S,
	sunset: Y,
	marble: I,
	geometric: S,
	abstract: k
};
var P = ({ variant: l = "marble", colors: r = [
	"#92A1C6",
	"#146A7C",
	"#F0AB3D",
	"#C271B4",
	"#C20D90"
], name: i = "Clara Barton", title: a = !1, size: h = "40px", square: n = !1, ...t }) => {
	const s = z[l] || I;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s, {
		colors: r,
		name: i,
		title: a,
		size: h,
		square: n,
		...t
	});
};
//#endregion
export { P as t };
