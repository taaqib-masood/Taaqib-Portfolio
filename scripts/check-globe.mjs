import assert from "node:assert/strict";
import { isLand } from "../src/lib/land-mask.ts";

// Inland cities: at 1° resolution coastal cities (Dubai, Chennai) can land on a sea cell, which is
// fine since globe markers use real coordinates. Inland points prove the map isn't flipped or mirrored.
for (const [name, lat, lon] of [["Riyadh", 24.7, 46.7], ["Delhi", 28.6, 77.2], ["Madrid", 40.4, -3.7], ["Brasilia", -15.8, -47.9], ["Alice Springs", -23.7, 133.9], ["Denver", 39.7, -105.0]])
  assert.ok(isLand(lat, lon), `${name} should be land`);
for (const [name, lat, lon] of [["mid-Atlantic", 30, -40], ["mid-Pacific", 0, -150], ["Indian Ocean", -20, 75]])
  assert.ok(!isLand(lat, lon), `${name} should be ocean`);
console.log("PASS: land mask orientation");

// Day/night: at the March equinox, 12:00 UTC, the sun is overhead near (0°, 0°).
const { subsolarPoint, getVisitor } = await import("../src/lib/visitor-location.ts");
const s = subsolarPoint(new Date(Date.UTC(2026, 2, 20, 12, 0)));
assert.ok(Math.abs(s.lat) < 1.5 && Math.abs(s.lon) < 1, `equinox subsolar point ${JSON.stringify(s)}`);
const june = subsolarPoint(new Date(Date.UTC(2026, 5, 21, 0, 0)));
assert.ok(june.lat > 23 && Math.abs(Math.abs(june.lon) - 180) < 1, "June solstice midnight UTC: sun over the Pacific, tropic of Cancer");

// Visitor arc: London in September (BST, UTC+1) sees Dubai (UTC+4) as +3h.
process.env.TZ = "Europe/London";
const v = getVisitor(new Date(Date.UTC(2026, 8, 24, 12)));
assert.equal(v?.city, "London");
assert.ok(v.label.endsWith("DXB +3H"), v.label);
process.env.TZ = "Asia/Dubai";
assert.equal(getVisitor()?.sameZone, true);
console.log("PASS: sun position (equinox, solstice) and visitor timezone arc offsets");

// UAE highlight: its cities are inside the outline, neighbours' capitals are not.
const { inUae, uaeSamples } = await import("../src/lib/uae.ts");
for (const [name, lat, lon] of [["Dubai", 25.2, 55.3], ["Abu Dhabi", 24.45, 54.5], ["Al Ain", 24.2, 55.7], ["Fujairah", 25.12, 56.3]])
  assert.ok(inUae(lat, lon), `${name} should be in the UAE`);
for (const [name, lat, lon] of [["Doha", 25.29, 51.53], ["Muscat", 23.59, 58.41], ["Riyadh", 24.7, 46.7], ["Gulf", 26.0, 54.0]])
  assert.ok(!inUae(lat, lon), `${name} should be outside the UAE`);
assert.ok(uaeSamples().length > 60, "UAE highlight layer too sparse");
console.log("PASS: UAE outline");
