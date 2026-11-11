import { n as toGregorian, r as toJalaali, t as jalaaliMonthLength } from "../_libs/jalaali-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/time-BneIW53_.js
function gregorianToJalali(year, month, day) {
	return toJalaali(year, month, day);
}
function jalaliToGregorian(jy, jm, jd) {
	return toGregorian(jy, jm, jd);
}
function monthLength(jy, jm) {
	return jalaaliMonthLength(jy, jm);
}
var JMONTHS = [
	"فروردین",
	"اردیبهشت",
	"خرداد",
	"تیر",
	"مرداد",
	"شهریور",
	"مهر",
	"آبان",
	"آذر",
	"دی",
	"بهمن",
	"اسفند"
];
function jalaliMonthName(jm) {
	return JMONTHS[jm - 1] ?? "";
}
var WEEKDAY = {
	Sun: 0,
	Mon: 1,
	Tue: 2,
	Wed: 3,
	Thu: 4,
	Fri: 5,
	Sat: 6
};
function pad2(n) {
	return String(n).padStart(2, "0");
}
function ymd(year, month, day) {
	return `${year}-${pad2(month)}-${pad2(day)}`;
}
function civilInZone(date, timeZone) {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone,
		hourCycle: "h23",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		weekday: "short"
	}).formatToParts(date);
	const get = (type) => parts.find((p) => p.type === type)?.value ?? "";
	let hour = Number(get("hour"));
	if (hour === 24) hour = 0;
	return {
		year: Number(get("year")),
		month: Number(get("month")),
		day: Number(get("day")),
		hour,
		minute: Number(get("minute")),
		second: Number(get("second")),
		weekday: WEEKDAY[get("weekday")] ?? 0
	};
}
/** Convert a wall-clock time in `timeZone` to a UTC instant. Two-pass offset correction. */
function zonedCivilToUtc(c, timeZone) {
	const desired = Date.UTC(c.year, c.month - 1, c.day, c.hour, c.minute, 0);
	let utc = desired;
	for (let i = 0; i < 2; i += 1) {
		const got = civilInZone(new Date(utc), timeZone);
		const gotAsUtc = Date.UTC(got.year, got.month - 1, got.day, got.hour, got.minute, got.second);
		const next = utc + (desired - gotAsUtc);
		if (next === utc) break;
		utc = next;
	}
	return new Date(utc);
}
function todayYmd(timeZone, now = /* @__PURE__ */ new Date()) {
	const c = civilInZone(now, timeZone);
	return ymd(c.year, c.month, c.day);
}
function addDaysYmd(day, days, timeZone) {
	const [y, m, d] = day.split("-").map(Number);
	const noon = zonedCivilToUtc({
		year: y,
		month: m,
		day: d,
		hour: 12,
		minute: 0
	}, timeZone);
	const next = civilInZone(new Date(noon.getTime() + days * 864e5), timeZone);
	return ymd(next.year, next.month, next.day);
}
//#endregion
export { jalaliToGregorian as a, ymd as c, jalaliMonthName as i, zonedCivilToUtc as l, civilInZone as n, monthLength as o, gregorianToJalali as r, todayYmd as s, addDaysYmd as t };
