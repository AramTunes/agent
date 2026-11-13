package booking

import "testing"

func TestJalaliKnownDays(t *testing.T) {
	jy, jm, jd := ToJalali(2014, 3, 21)
	if jy != 1393 || jm != 1 || jd != 1 {
		t.Fatalf("nowruz 1393: got %d-%d-%d", jy, jm, jd)
	}
	gy, gm, gd := ToGregorian(1404, 1, 1)
	if gy != 2025 || gm != 3 || gd != 21 {
		t.Fatalf("nowruz 1404: got %d-%d-%d", gy, gm, gd)
	}
	if JalaliMonthLength(1403, 12) != 30 {
		t.Fatal("1403 esfand is 30 days")
	}
	if JalaliMonthLength(1404, 12) != 29 {
		t.Fatal("1404 esfand is 29 days")
	}
}
