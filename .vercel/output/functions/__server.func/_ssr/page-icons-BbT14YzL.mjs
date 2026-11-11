import { $ as MapPin, At as Dog, B as Pencil, Bt as Cat, C as SprayCan, E as ShoppingBag, Et as Eye, G as NotebookPen, H as PawPrint, Ht as Camera, Jt as BookOpen, L as Pill, M as Scissors, N as School, Ot as Dumbbell, P as Scale, Q as Medal, R as Phone, St as Fish, Ut as Calendar, Vt as Car, W as Paintbrush, Xt as Bird, Y as MessagesSquare, Yt as Bone, Zt as Bike, _ as Timer, _t as Globe, at as Library, b as Store, bt as Fuel, d as UserRound, dt as Heart, et as Mail, ft as HeartPulse, gt as GraduationCap, i as Wrench, m as Trophy, mt as Hand, pt as Headset, q as Music, qt as Brain, rt as Link2, s as Utensils, st as KeyRound, tn as Activity, v as Thermometer, vt as Gem, w as Sparkles, x as Stethoscope, xt as Flower2, y as Syringe, yt as Gauge, z as PersonStanding } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/page-icons-BbT14YzL.js
var activityIconGroups = [
	{
		slug: "beauty",
		icons: [
			{
				id: "scissors",
				icon: Scissors
			},
			{
				id: "sparkles",
				icon: Sparkles
			},
			{
				id: "flower",
				icon: Flower2
			},
			{
				id: "brush",
				icon: Paintbrush
			},
			{
				id: "hand",
				icon: Hand
			},
			{
				id: "gem",
				icon: Gem
			},
			{
				id: "heart",
				icon: Heart
			},
			{
				id: "spray",
				icon: SprayCan
			}
		]
	},
	{
		slug: "health",
		icons: [
			{
				id: "heart-pulse",
				icon: HeartPulse
			},
			{
				id: "stethoscope",
				icon: Stethoscope
			},
			{
				id: "pill",
				icon: Pill
			},
			{
				id: "activity",
				icon: Activity
			},
			{
				id: "brain",
				icon: Brain
			},
			{
				id: "syringe",
				icon: Syringe
			},
			{
				id: "thermometer",
				icon: Thermometer
			},
			{
				id: "eye",
				icon: Eye
			}
		]
	},
	{
		slug: "consult",
		icons: [
			{
				id: "messages",
				icon: MessagesSquare
			},
			{
				id: "phone",
				icon: Phone
			},
			{
				id: "headset",
				icon: Headset
			},
			{
				id: "user",
				icon: UserRound
			},
			{
				id: "notebook",
				icon: NotebookPen
			},
			{
				id: "scale",
				icon: Scale
			}
		]
	},
	{
		slug: "education",
		icons: [
			{
				id: "graduation",
				icon: GraduationCap
			},
			{
				id: "book",
				icon: BookOpen
			},
			{
				id: "school",
				icon: School
			},
			{
				id: "pencil",
				icon: Pencil
			},
			{
				id: "library",
				icon: Library
			}
		]
	},
	{
		slug: "sport",
		icons: [
			{
				id: "dumbbell",
				icon: Dumbbell
			},
			{
				id: "bike",
				icon: Bike
			},
			{
				id: "trophy",
				icon: Trophy
			},
			{
				id: "timer",
				icon: Timer
			},
			{
				id: "person",
				icon: PersonStanding
			},
			{
				id: "medal",
				icon: Medal
			}
		]
	},
	{
		slug: "auto",
		icons: [
			{
				id: "car",
				icon: Car
			},
			{
				id: "wrench",
				icon: Wrench
			},
			{
				id: "fuel",
				icon: Fuel
			},
			{
				id: "gauge",
				icon: Gauge
			},
			{
				id: "key",
				icon: KeyRound
			}
		]
	},
	{
		slug: "pets",
		icons: [
			{
				id: "paw",
				icon: PawPrint
			},
			{
				id: "dog",
				icon: Dog
			},
			{
				id: "cat",
				icon: Cat
			},
			{
				id: "bone",
				icon: Bone
			},
			{
				id: "fish",
				icon: Fish
			},
			{
				id: "bird",
				icon: Bird
			}
		]
	},
	{
		slug: "other",
		icons: [
			{
				id: "link",
				icon: Link2
			},
			{
				id: "globe",
				icon: Globe
			},
			{
				id: "map",
				icon: MapPin
			},
			{
				id: "store",
				icon: Store
			},
			{
				id: "camera",
				icon: Camera
			},
			{
				id: "music",
				icon: Music
			},
			{
				id: "utensils",
				icon: Utensils
			},
			{
				id: "mail",
				icon: Mail
			},
			{
				id: "calendar",
				icon: Calendar
			},
			{
				id: "bag",
				icon: ShoppingBag
			}
		]
	}
];
var byId = /* @__PURE__ */ new Map();
for (const group of activityIconGroups) for (const item of group.icons) byId.set(item.id, item.icon);
function pageIcon(id) {
	if (!id) return null;
	return byId.get(id) ?? null;
}
function iconsForSlug(slug) {
	return activityIconGroups.find((group) => group.slug === slug)?.icons ?? activityIconGroups.find((group) => group.slug === "other").icons;
}
//#endregion
export { pageIcon as n, iconsForSlug as t };
