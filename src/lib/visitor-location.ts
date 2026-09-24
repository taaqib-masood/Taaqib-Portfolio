// Approximate visitor city from the browser's IANA timezone: no geolocation prompt, no network call.
// ponytail: a hand-picked table of common hiring-market timezones, not a full tz database.
// Unknown zones simply show no visitor arc. Upgrade path: a generated tz → coordinate table.
const ZONES: Record<string, [lat: number, lon: number, city: string]> = {
  "Europe/London": [51.5, -0.13, "London"], "Europe/Dublin": [53.35, -6.26, "Dublin"],
  "Europe/Paris": [48.86, 2.35, "Paris"], "Europe/Berlin": [52.52, 13.4, "Berlin"],
  "Europe/Amsterdam": [52.37, 4.9, "Amsterdam"], "Europe/Madrid": [40.42, -3.7, "Madrid"],
  "Europe/Rome": [41.9, 12.5, "Rome"], "Europe/Zurich": [47.37, 8.54, "Zurich"],
  "Europe/Stockholm": [59.33, 18.07, "Stockholm"], "Europe/Istanbul": [41.01, 28.98, "Istanbul"],
  "Europe/Moscow": [55.76, 37.62, "Moscow"], "Asia/Kolkata": [19.08, 72.88, "India"],
  "Asia/Calcutta": [19.08, 72.88, "India"], "Asia/Karachi": [24.86, 67.0, "Karachi"],
  "Asia/Riyadh": [24.71, 46.68, "Riyadh"], "Asia/Qatar": [25.29, 51.53, "Doha"],
  "Asia/Bahrain": [26.23, 50.59, "Manama"], "Asia/Kuwait": [29.38, 47.99, "Kuwait City"],
  "Asia/Muscat": [23.59, 58.41, "Muscat"], "Asia/Singapore": [1.35, 103.82, "Singapore"],
  "Asia/Hong_Kong": [22.32, 114.17, "Hong Kong"], "Asia/Shanghai": [31.23, 121.47, "Shanghai"],
  "Asia/Tokyo": [35.68, 139.69, "Tokyo"], "Asia/Seoul": [37.57, 126.98, "Seoul"],
  "Asia/Jakarta": [-6.2, 106.85, "Jakarta"], "Asia/Manila": [14.6, 120.98, "Manila"],
  "Asia/Bangkok": [13.76, 100.5, "Bangkok"], "Australia/Sydney": [-33.87, 151.21, "Sydney"],
  "Australia/Melbourne": [-37.81, 144.96, "Melbourne"], "Pacific/Auckland": [-36.85, 174.76, "Auckland"],
  "America/New_York": [40.71, -74.0, "New York"], "America/Toronto": [43.65, -79.38, "Toronto"],
  "America/Chicago": [41.88, -87.63, "Chicago"], "America/Denver": [39.74, -104.99, "Denver"],
  "America/Los_Angeles": [34.05, -118.24, "Los Angeles"], "America/Mexico_City": [19.43, -99.13, "Mexico City"],
  "America/Sao_Paulo": [-23.55, -46.63, "São Paulo"], "Africa/Cairo": [30.04, 31.24, "Cairo"],
  "Africa/Johannesburg": [-26.2, 28.05, "Johannesburg"], "Africa/Lagos": [6.52, 3.38, "Lagos"],
  "Africa/Nairobi": [-1.29, 36.82, "Nairobi"],
};

const offsetMinutes = (tz: string, at: Date) => {
  const local = new Date(at.toLocaleString("en-US", { timeZone: tz }));
  const utc = new Date(at.toLocaleString("en-US", { timeZone: "UTC" }));
  return Math.round((local.getTime() - utc.getTime()) / 60000);
};

export type Visitor = { lat: number; lon: number; city: string; label: string; sameZone: boolean };

/** The visitor's approximate city and Dubai's offset from them, or null if the zone isn't known. */
export function getVisitor(now = new Date()): Visitor | null {
  let tz: string;
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return null; }
  if (tz === "Asia/Dubai") return { lat: 25.2, lon: 55.3, city: "Dubai", label: "YOU'RE IN DUBAI TOO", sameZone: true };
  const zone = ZONES[tz];
  if (!zone) return null;
  const diff = (offsetMinutes("Asia/Dubai", now) - offsetMinutes(tz, now)) / 60;
  const rel = diff === 0 ? "SAME TIME" : `DXB ${diff > 0 ? "+" : "−"}${Math.abs(diff)}H`;
  return { lat: zone[0], lon: zone[1], city: zone[2], label: `YOU · ${zone[2].toUpperCase()} · ${rel}`, sameZone: false };
}

/** Subsolar point (lat, lon) for real day/night shading. Ignores the equation of time (<4° error). */
export function subsolarPoint(now = new Date()) {
  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  const day = (now.getTime() - start) / 86400000;
  const lat = -23.44 * Math.cos(((2 * Math.PI) / 365) * (day + 10));
  const hours = now.getUTCHours() + now.getUTCMinutes() / 60;
  const lon = -15 * (hours - 12);
  return { lat, lon };
}
