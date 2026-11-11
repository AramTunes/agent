export type BookingDefaults = { service?: string; staff?: string; group?: string; address?: string };

function key(businessId: string) {
  return `nobat.booking-defaults.${businessId}`;
}

export function readBookingDefaults(businessId: string): BookingDefaults {
  try {
    const raw = localStorage.getItem(key(businessId));
    return raw ? (JSON.parse(raw) as BookingDefaults) : {};
  } catch {
    return {};
  }
}

export function rememberBookingDefaults(businessId: string, patch: BookingDefaults) {
  const next = { ...readBookingDefaults(businessId), ...patch };
  localStorage.setItem(key(businessId), JSON.stringify(next));
}

export function pickDefault(saved: string | undefined, options: string[], fallback: string) {
  if (saved && options.includes(saved)) return saved;
  if (options.includes(fallback)) return fallback;
  return options[0] ?? fallback;
}
