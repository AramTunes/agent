import {
  Activity,
  Bike,
  Bird,
  Bone,
  BookOpen,
  Brain,
  Calendar,
  Camera,
  Car,
  Cat,
  Dog,
  Dumbbell,
  Eye,
  Fish,
  Flower2,
  Fuel,
  Gauge,
  Gem,
  Globe,
  GraduationCap,
  Hand,
  Headset,
  Heart,
  HeartPulse,
  KeyRound,
  Library,
  Link2,
  Mail,
  MapPin,
  Medal,
  MessagesSquare,
  Music,
  NotebookPen,
  Paintbrush,
  PawPrint,
  Pencil,
  PersonStanding,
  Phone,
  Pill,
  Scale,
  School,
  Scissors,
  ShoppingBag,
  Sparkles,
  SprayCan,
  Stethoscope,
  Store,
  Syringe,
  Thermometer,
  Timer,
  Trophy,
  UserRound,
  Utensils,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type PageIconDef = { id: string; icon: LucideIcon };

export const activityIconGroups: { slug: string; icons: PageIconDef[] }[] = [
  {
    slug: "beauty",
    icons: [
      { id: "scissors", icon: Scissors },
      { id: "sparkles", icon: Sparkles },
      { id: "flower", icon: Flower2 },
      { id: "brush", icon: Paintbrush },
      { id: "hand", icon: Hand },
      { id: "gem", icon: Gem },
      { id: "heart", icon: Heart },
      { id: "spray", icon: SprayCan },
    ],
  },
  {
    slug: "health",
    icons: [
      { id: "heart-pulse", icon: HeartPulse },
      { id: "stethoscope", icon: Stethoscope },
      { id: "pill", icon: Pill },
      { id: "activity", icon: Activity },
      { id: "brain", icon: Brain },
      { id: "syringe", icon: Syringe },
      { id: "thermometer", icon: Thermometer },
      { id: "eye", icon: Eye },
    ],
  },
  {
    slug: "consult",
    icons: [
      { id: "messages", icon: MessagesSquare },
      { id: "phone", icon: Phone },
      { id: "headset", icon: Headset },
      { id: "user", icon: UserRound },
      { id: "notebook", icon: NotebookPen },
      { id: "scale", icon: Scale },
    ],
  },
  {
    slug: "education",
    icons: [
      { id: "graduation", icon: GraduationCap },
      { id: "book", icon: BookOpen },
      { id: "school", icon: School },
      { id: "pencil", icon: Pencil },
      { id: "library", icon: Library },
    ],
  },
  {
    slug: "sport",
    icons: [
      { id: "dumbbell", icon: Dumbbell },
      { id: "bike", icon: Bike },
      { id: "trophy", icon: Trophy },
      { id: "timer", icon: Timer },
      { id: "person", icon: PersonStanding },
      { id: "medal", icon: Medal },
    ],
  },
  {
    slug: "auto",
    icons: [
      { id: "car", icon: Car },
      { id: "wrench", icon: Wrench },
      { id: "fuel", icon: Fuel },
      { id: "gauge", icon: Gauge },
      { id: "key", icon: KeyRound },
    ],
  },
  {
    slug: "pets",
    icons: [
      { id: "paw", icon: PawPrint },
      { id: "dog", icon: Dog },
      { id: "cat", icon: Cat },
      { id: "bone", icon: Bone },
      { id: "fish", icon: Fish },
      { id: "bird", icon: Bird },
    ],
  },
  {
    slug: "other",
    icons: [
      { id: "link", icon: Link2 },
      { id: "globe", icon: Globe },
      { id: "map", icon: MapPin },
      { id: "store", icon: Store },
      { id: "camera", icon: Camera },
      { id: "music", icon: Music },
      { id: "utensils", icon: Utensils },
      { id: "mail", icon: Mail },
      { id: "calendar", icon: Calendar },
      { id: "bag", icon: ShoppingBag },
    ],
  },
];

const byId = new Map<string, LucideIcon>();
for (const group of activityIconGroups) {
  for (const item of group.icons) byId.set(item.id, item.icon);
}

export function pageIcon(id?: string): LucideIcon | null {
  if (!id) return null;
  return byId.get(id) ?? null;
}

export function iconsForSlug(slug: string): PageIconDef[] {
  return activityIconGroups.find((group) => group.slug === slug)?.icons ?? activityIconGroups.find((group) => group.slug === "other")!.icons;
}
