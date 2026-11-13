package app

import "testing"

func TestDefiniteLineSkipsOpenPrices(t *testing.T) {
	if amount, ok := definiteLine("fixed", 1000, 2); !ok || amount != 2000 {
		t.Fatalf("fixed %d %v", amount, ok)
	}
	if amount, ok := definiteLine("free", 1000, 1); !ok || amount != 0 {
		t.Fatalf("free %d %v", amount, ok)
	}
	for _, kind := range []string{"from", "range", "contact"} {
		if _, ok := definiteLine(kind, 1000, 1); ok {
			t.Fatalf("%s counted as definite", kind)
		}
	}
}

func TestMinuteOpenUsesShopWindow(t *testing.T) {
	spans := [][2]int{{9 * 60, 13 * 60}, {16 * 60, 22 * 60}}
	if !minuteOpen(spans, 10*60) || !minuteOpen(spans, 16*60) {
		t.Fatal("inside window rejected")
	}
	if minuteOpen(spans, 13*60) || minuteOpen(spans, 8*60) || minuteOpen(nil, 10*60) {
		t.Fatal("outside window accepted")
	}
}
