package booking

func div(a, b int) int { return a / b }
func mod(a, b int) int { return a - div(a, b)*b }

func g2d(gy, gm, gd int) int {
	d := div((gy+div(gm-8, 6)+100100)*1461, 4) + div(153*mod(gm+9, 12)+2, 5) + gd - 34840408
	return d - div(div(gy+100100+div(gm-8, 6), 100)*3, 4) + 752
}

func d2g(jdn int) (int, int, int) {
	j := 4*jdn + 139361631
	j = j + div(div(4*jdn+183187720, 146097)*3, 4)*4 - 3908
	i := div(mod(j, 1461), 4)*5 + 308
	gd := div(mod(i, 153), 5) + 1
	gm := mod(div(i, 153), 12) + 1
	gy := div(j, 1461) - 100100 + div(8-gm, 6)
	return gy, gm, gd
}

func jalCal(jy int) (leap, gy, march int) {
	breaks := []int{-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178}
	gy = jy + 621
	leapJ := -14
	jp := breaks[0]
	jump := 0
	for i := 1; i < len(breaks); i++ {
		jm := breaks[i]
		jump = jm - jp
		if jy < jm {
			break
		}
		leapJ = leapJ + div(jump, 33)*8 + div(mod(jump, 33), 4)
		jp = jm
	}
	n := jy - jp
	leapJ = leapJ + div(n, 33)*8 + div(mod(n, 33)+3, 4)
	if mod(jump, 33) == 4 && jump-n == 4 {
		leapJ++
	}
	leapG := div(gy, 4) - div((div(gy, 100)+1)*3, 4) - 150
	march = 20 + leapJ - leapG
	if jump-n < 6 {
		n = n - jump + div(jump+4, 33)*33
	}
	leap = mod(mod(n+1, 33)-1, 4)
	if leap == -1 {
		leap = 4
	}
	return leap, gy, march
}

func j2d(jy, jm, jd int) int {
	_, gy, march := jalCal(jy)
	return g2d(gy, 3, march) + (jm-1)*31 - div(jm, 7)*(jm-7) + jd - 1
}

func ToJalali(gy, gm, gd int) (int, int, int) {
	return d2j(g2d(gy, gm, gd))
}

func d2j(jdn int) (int, int, int) {
	gy, _, _ := d2g(jdn)
	jy := gy - 621
	_, _, march := jalCal(jy)
	jdn1f := g2d(gy, 3, march)
	k := jdn - jdn1f
	if k >= 0 {
		if k <= 185 {
			jm := 1 + div(k, 31)
			jd := mod(k, 31) + 1
			return jy, jm, jd
		}
		k -= 186
	} else {
		jy--
		k += 179
		if leap, _, _ := jalCal(jy); leap == 1 {
			k++
		}
	}
	jm := 7 + div(k, 30)
	jd := mod(k, 30) + 1
	return jy, jm, jd
}

func ToGregorian(jy, jm, jd int) (int, int, int) {
	return d2g(j2d(jy, jm, jd))
}

func JalaliMonthLength(jy, jm int) int {
	if jm <= 6 {
		return 31
	}
	if jm <= 11 {
		return 30
	}
	leap, _, _ := jalCal(jy)
	if leap == 0 {
		return 30
	}
	return 29
}
