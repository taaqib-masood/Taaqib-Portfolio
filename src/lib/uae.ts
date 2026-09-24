// The UAE, traced coarsely clockwise from the Saudi/Qatar corner along the Gulf coast, round the
// east coast and back along the Oman and Saudi borders. Lit in cobalt on the globe so Dubai's
// country reads at a glance. ponytail: ~15 vertices, ±0.2° accuracy; islands are ignored.
const OUTLINE: [lat: number, lon: number][] = [
  [24.25, 51.6], [24.1, 52.7], [24.2, 53.6], [24.45, 54.4], [25.0, 54.95], [25.25, 55.3],
  [25.8, 55.95], [26.05, 56.08], [25.6, 56.36], [24.95, 56.36], [24.25, 55.9], [23.9, 55.55],
  [22.6, 55.15], [22.7, 52.6],
];

/** Ray-casting point-in-polygon on raw lat/lon: fine at this size, far from the poles and the antimeridian. */
export function inUae(lat: number, lon: number) {
  let inside = false;
  for (let i = 0, j = OUTLINE.length - 1; i < OUTLINE.length; j = i++) {
    const [ai, oi] = OUTLINE[i], [aj, oj] = OUTLINE[j];
    if ((ai > lat) !== (aj > lat) && lon < ((oj - oi) * (lat - ai)) / (aj - ai) + oi) inside = !inside;
  }
  return inside;
}

/** Evenly spaced lat/lon samples inside the UAE, for a dense highlight layer. */
export function uaeSamples(step = 0.3) {
  const out: [number, number][] = [];
  for (let lat = 22.5; lat <= 26.2; lat += step)
    for (let lon = 51.5; lon <= 56.5; lon += step) if (inUae(lat, lon)) out.push([lat, lon]);
  return out;
}
