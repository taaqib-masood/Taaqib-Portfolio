import assert from "node:assert/strict";
import { isLand } from "../src/lib/land-mask.ts";

// Inland cities: at 1° resolution coastal cities (Dubai, Chennai) can land on a sea cell, which is
// fine since globe markers use real coordinates. Inland points prove the map isn't flipped or mirrored.
for (const [name, lat, lon] of [["Riyadh", 24.7, 46.7], ["Delhi", 28.6, 77.2], ["Madrid", 40.4, -3.7], ["Brasilia", -15.8, -47.9], ["Alice Springs", -23.7, 133.9], ["Denver", 39.7, -105.0]])
  assert.ok(isLand(lat, lon), `${name} should be land`);
for (const [name, lat, lon] of [["mid-Atlantic", 30, -40], ["mid-Pacific", 0, -150], ["Indian Ocean", -20, 75]])
  assert.ok(!isLand(lat, lon), `${name} should be ocean`);
console.log("PASS: land mask places cities on land and open ocean as water");
