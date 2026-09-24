"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { isLand } from "@/lib/land-mask";
import { uaeSamples } from "@/lib/uae";
import { getVisitor, subsolarPoint, type Visitor } from "@/lib/visitor-location";
import { useT } from "@/components/LocaleProvider";

const R = 2;
const DEG = Math.PI / 180;
const DUBAI = { lat: 25.2, lon: 55.3 };

// Real places from the CV. `link` points at the section that tells the rest of the story.
const PLACES = [
  { id: "dxb", lat: DUBAI.lat, lon: DUBAI.lon, name: "Dubai, UAE", dx: -126, dy: -26,
    lines: ["Home base · UAE resident, no sponsorship needed", "GEMS Our Own Indian School · 2020–2022", "Available immediately"], link: { label: "Contact", href: "#contact" } },
  { id: "vit", lat: 12.92, lon: 79.13, name: "Vellore, India", dx: 0, dy: 10,
    lines: ["B.Tech Computer Science, Bioinformatics", "VIT University · 2022–2026 · CGPA 7.1"], link: { label: "Education", href: "#experience" } },
  { id: "maa", lat: 13.08, lon: 80.27, name: "Chennai, India", dx: 0, dy: -8,
    lines: ["Full Stack Developer Intern", "L&T Technology Services · Feb–Jun 2026", "Proctoring portal, LIPM, MCP code reviewer"], link: { label: "Experience", href: "#experience" } },
] as const;
type PlaceId = (typeof PLACES)[number]["id"];

// The journey, in order. Each leg draws after the previous one.
const JOURNEY: { from: PlaceId; to: PlaceId; text: string }[] = [
  { from: "dxb", to: "vit", text: "2022 · DUBAI → VELLORE · B.TECH AT VIT" },
  { from: "vit", to: "maa", text: "2026 · VELLORE → CHENNAI · INTERN AT L&T" },
  { from: "maa", to: "dxb", text: "2026 · CHENNAI → DUBAI · AVAILABLE NOW" },
];
const LEG = 1.6; // seconds per leg

const toVec = (lat: number, lon: number, r = R) =>
  new THREE.Vector3(r * Math.cos(lat * DEG) * Math.sin(lon * DEG), r * Math.sin(lat * DEG), r * Math.cos(lat * DEG) * Math.cos(lon * DEG));

// Dense cobalt layer over the UAE so Dubai's country stands out from the white dot map.
function buildUae() {
  const pos: number[] = [];
  for (const [lat, lon] of uaeSamples()) { const v = toVec(lat, lon, R * 1.002); pos.push(v.x, v.y, v.z); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aLand", new THREE.Float32BufferAttribute(new Array(pos.length / 3).fill(1), 1));
  return g;
}

function buildEarth(samples: number) {
  const pos: number[] = [], land: number[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < samples; i++) {
    const y = 1 - (i / (samples - 1)) * 2;
    const lat = Math.asin(y) / DEG;
    const lon = ((((i * golden) / DEG) % 360) + 360) % 360 - 180;
    const onLand = isLand(lat, lon);
    // Hash-based ocean thinning: a plain i % n would alias with the golden-angle spiral into stripes.
    if (!onLand && ((Math.imul(i, 2654435761) >>> 0) % 100) >= 7) continue;
    const v = toVec(lat, lon);
    pos.push(v.x, v.y, v.z);
    land.push(onLand ? 1 : 0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aLand", new THREE.Float32BufferAttribute(land, 1));
  return g;
}

// Great-circle arc lifted off the surface, drawn in over time via drawRange.
const ARC_STEPS = 64;
function buildArc(a: THREE.Vector3, b: THREE.Vector3, lift = 0.12) {
  const pts: THREE.Vector3[] = [];
  const an = a.clone().normalize(), bn = b.clone().normalize();
  const angle = Math.max(an.angleTo(bn), 1e-4);
  for (let i = 0; i <= ARC_STEPS; i++) {
    const t = i / ARC_STEPS;
    const p = an.clone().multiplyScalar(Math.sin((1 - t) * angle)).add(bn.clone().multiplyScalar(Math.sin(t * angle))).divideScalar(Math.sin(angle));
    pts.push(p.multiplyScalar(R * (1 + lift * Math.sin(Math.PI * t))));
  }
  return new THREE.BufferGeometry().setFromPoints(pts);
}

const vertex = /* glsl */ `
uniform float uPixelRatio; uniform float uFade; uniform float uBoost; uniform vec3 uSun;
attribute float aLand;
varying float vAlpha;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vec3 normal = normalize(world.xyz - (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz);
  float facing = dot(normal, normalize(cameraPosition - world.xyz));
  // Real day/night: points on the night side of the actual terminator are dimmed.
  float day = smoothstep(-0.12, 0.18, dot(normalize(position), uSun));
  vAlpha = smoothstep(0.0, 0.45, facing) * mix(0.1, 0.46, aLand) * mix(0.35, 1.0, day) * uFade * uBoost;
  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = mix(1.2, 1.7, aLand) * uPixelRatio * (8.0 / -mv.z);
}`;
// Square points on purpose: the site has zero radius everywhere.
const fragment = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;
void main() { gl_FragColor = vec4(uColor, vAlpha); }`;

type Shared = {
  labels: (HTMLElement | null)[];
  visitorLabel: HTMLElement | null;
  ticker: HTMLElement | null;
  journey: string[]; // translated ticker lines
  drag: { active: boolean; lastX: number; lastY: number; rotY: number; rotX: number; vel: number; releasedAt: number };
  replayAt: number;
  hover: boolean;
  invalidate: () => void;
};

function Earth({ progress, animate, shared, selected, visitor }: {
  progress: MotionValue<number>; animate: boolean; shared: React.MutableRefObject<Shared>; selected: PlaceId | null; visitor: Visitor | null;
}) {
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const pulse = useRef<THREE.Mesh>(null);
  const { gl, camera, size, invalidate } = useThree();
  const geometry = useMemo(() => buildEarth(36000), []);
  const pts = useMemo(() => Object.fromEntries(PLACES.map((p) => [p.id, toVec(p.lat, p.lon, R * 1.005)])) as Record<PlaceId, THREE.Vector3>, []);
  const legs = useMemo(
    () => JOURNEY.map((j) => new THREE.Line(buildArc(pts[j.from], pts[j.to], j.from === "vit" ? 0.04 : j.to === "dxb" ? 0.24 : 0.12), new THREE.LineBasicMaterial({ color: "#2e5bff", transparent: true, opacity: 0.95 }))),
    [pts],
  );
  const visitorArc = useMemo(() => {
    if (!visitor || visitor.sameZone) return null;
    const line = new THREE.Line(buildArc(toVec(visitor.lat, visitor.lon, R * 1.005), pts.dxb, 0.18), new THREE.LineDashedMaterial({ color: "#ffffff", dashSize: 0.05, gapSize: 0.05, transparent: true, opacity: 0.55 }));
    line.computeLineDistances();
    return line;
  }, [visitor, pts]);
  const visitorPos = useMemo(() => (visitor && !visitor.sameZone ? toVec(visitor.lat, visitor.lon, R * 1.005) : null), [visitor]);

  const uniforms = useMemo(() => ({ uPixelRatio: { value: gl.getPixelRatio() }, uFade: { value: 1 }, uBoost: { value: 1 }, uSun: { value: new THREE.Vector3(0, 0, 1) }, uColor: { value: new THREE.Color("#ffffff") } }), [gl]);
  // Same pixel ratio, fade and sun as the earth (shared objects), but cobalt and boosted so it stays lit at night.
  const uaeUniforms = useMemo(() => ({ ...uniforms, uBoost: { value: 6 }, uColor: { value: new THREE.Color("#2e5bff") } }), [uniforms]);
  const uae = useMemo(buildUae, []);
  // The pulse ring lies flat on the surface instead of facing the camera edge-on.
  const ringTilt = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), pts.dxb.clone().normalize()), [pts]);
  const pointer = useRef(new THREE.Vector2());
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const camDir = useMemo(() => new THREE.Vector3(), []);
  const focusY = useRef(0);
  const swayT = useRef(0);

  // Sun position from the real clock, refreshed every minute.
  useEffect(() => {
    const update = () => { const s = subsolarPoint(); uniforms.uSun.value.copy(toVec(s.lat, s.lon, 1)); invalidate(); };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [uniforms, invalidate]);

  useEffect(() => {
    shared.current.invalidate = invalidate;
    const move = (e: PointerEvent) => pointer.current.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [shared, invalidate]);
  useEffect(() => () => {
    geometry.dispose();
    uae.dispose();
    legs.forEach((l) => l.geometry.dispose());
    visitorArc?.geometry.dispose();
  }, [geometry, uae, legs, visitorArc]);
  useEffect(() => { invalidate(); }, [selected, animate, invalidate]);

  useFrame((state, delta) => {
    const g = outer.current;
    if (!g || !inner.current) return;
    const s = shared.current;
    const t = animate ? state.clock.elapsedTime : 0; // drives the DXB pulse
    const p = progress.get();

    // Drag with momentum; after 2.5s idle it eases back so Dubai returns to the crest.
    if (!s.drag.active) {
      s.drag.rotY += s.drag.vel;
      s.drag.vel *= animate ? 0.92 : 0;
      if (performance.now() - s.drag.releasedAt > 2500) {
        const k = animate ? 1 - Math.exp(-2 * delta) : 1;
        s.drag.rotY += (0 - s.drag.rotY) * k;
        s.drag.rotX += (0 - s.drag.rotX) * k;
      }
    }
    // Selecting a place turns the globe to face it.
    const target = selected ? -(PLACES.find((pl) => pl.id === selected)!.lon - DUBAI.lon) * DEG : 0;
    focusY.current += (target - focusY.current) * (animate ? 1 - Math.exp(-4 * delta) : 1);

    // Sway and parallax pause while the pointer is over the globe, so labels hold still to be clicked.
    const still = s.hover || s.drag.active || selected;
    if (animate && !still) swayT.current += delta;
    const parallax = still ? 0 : 1;
    g.rotation.y = Math.sin(swayT.current * 0.12) * 10 * DEG + pointer.current.x * 3 * DEG * parallax + s.drag.rotY + focusY.current + p * 0.6;
    g.rotation.x = pointer.current.y * 2 * DEG * parallax + s.drag.rotX;
    g.position.y = -p * 1.2;
    uniforms.uFade.value = 1 - p * 0.8;

    // Journey legs draw one after another; the ticker narrates the current leg.
    const elapsed = animate ? state.clock.elapsedTime - s.replayAt : Infinity;
    legs.forEach((line, i) => {
      const f = Math.min(1, Math.max(0, (elapsed - i * LEG) / LEG));
      line.geometry.setDrawRange(0, Math.floor((ARC_STEPS + 1) * f));
    });
    if (s.ticker) {
      const leg = Math.min(JOURNEY.length - 1, Math.max(0, Math.floor(elapsed / LEG)));
      s.ticker.textContent = s.journey[leg] ?? JOURNEY[leg].text;
    }
    if (pulse.current) {
      // Sonar ping: the ring grows and fades out, then restarts.
      const f = animate ? (t * 0.8) % 1 : 0;
      pulse.current.scale.setScalar(1 + f * 3);
      (pulse.current.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - f) * (1 - p);
    }

    // Project markers to screen for the DOM labels; hide the ones on the far side.
    camera.getWorldDirection(camDir);
    const place = (v: THREE.Vector3, el: HTMLElement | null, dx: number, dy: number) => {
      if (!el) return;
      tmp.copy(v).applyMatrix4(inner.current!.matrixWorld);
      const visible = tmp.clone().normalize().dot(camDir) < 0.02; // front hemisphere, limb included
      tmp.project(camera);
      el.style.opacity = visible ? String(1 - p) : "0";
      el.style.pointerEvents = visible && p < 0.5 ? "auto" : "none";
      el.style.transform = `translate(${((tmp.x + 1) / 2) * size.width + 10 + dx}px, ${((1 - tmp.y) / 2) * size.height - 8 + dy}px)`;
    };
    PLACES.forEach((pl, i) => place(pts[pl.id], s.labels[i], pl.dx, pl.dy));
    if (visitorPos) place(visitorPos, s.visitorLabel, -70, 14); // below its dot, clear of the DUBAI label
  });

  return (
    <group ref={outer}>
      {/* Tilt so Dubai sits on the crest facing the viewer. */}
      <group rotation={[-(52 - DUBAI.lat) * DEG, 0, 0]}>
        <group ref={inner} rotation={[0, -DUBAI.lon * DEG, 0]}>
          <mesh>
            <sphereGeometry args={[R * 0.985, 48, 48]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          <points geometry={geometry}>
            <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent depthWrite={false} />
          </points>
          <points geometry={uae}>
            <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uaeUniforms} transparent depthWrite={false} />
          </points>
          {legs.map((line, i) => <primitive key={i} object={line} />)}
          {visitorArc && <primitive object={visitorArc} />}
          {PLACES.map((pl) => (
            <mesh key={pl.id} position={pts[pl.id]}>
              <boxGeometry args={pl.id === "dxb" ? [0.09, 0.09, 0.09] : [0.045, 0.045, 0.045]} />
              <meshBasicMaterial color={pl.id === "dxb" || pl.id === selected ? "#2e5bff" : "#ffffff"} />
            </mesh>
          ))}
          {visitorPos && (
            <mesh position={visitorPos}>
              <boxGeometry args={[0.04, 0.04, 0.04]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          )}
          <mesh ref={pulse} position={pts.dxb} quaternion={ringTilt}>
            <ringGeometry args={[0.08, 0.1, 4, 1]} />
            <meshBasicMaterial color="#2e5bff" transparent opacity={0.8} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

const dubaiTime = () => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", hour: "2-digit", minute: "2-digit" }).format(new Date());

export default function Globe3D({ progress, animate }: { progress: MotionValue<number>; animate: boolean }) {
  const t = useT();
  const shared = useRef<Shared>({
    labels: [], visitorLabel: null, ticker: null,
    drag: { active: false, lastX: 0, lastY: 0, rotY: 0, rotX: 0, vel: 0, releasedAt: 0 },
    journey: [], replayAt: 0.4, hover: false, invalidate: () => {},
  });
  const clock = useRef<THREE.Clock | null>(null);
  const [selected, setSelected] = useState<PlaceId | null>(null);
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [time, setTime] = useState("");

  useEffect(() => {
    setVisitor(getVisitor());
    setTime(dubaiTime());
    const id = setInterval(() => setTime(dubaiTime()), 30000);
    return () => clearInterval(id);
  }, []);

  const d = shared.current.drag;
  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button, a")) return;
    d.active = true; d.lastX = e.clientX; d.lastY = e.clientY; d.vel = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!d.active) return;
    const dx = (e.clientX - d.lastX) * 0.006, dy = (e.clientY - d.lastY) * 0.004;
    d.rotY += dx; d.vel = dx;
    d.rotX = Math.max(-0.35, Math.min(0.35, d.rotX + dy));
    d.lastX = e.clientX; d.lastY = e.clientY;
    shared.current.invalidate();
  };
  const onPointerUp = () => { d.active = false; d.releasedAt = performance.now(); shared.current.invalidate(); };
  const replay = () => { shared.current.replayAt = clock.current?.getElapsedTime() ?? 0; setSelected(null); };
  const place = PLACES.find((p) => p.id === selected);
  shared.current.journey = JOURNEY.map((j) => t(j.text));
  const arabic = t("DUBAI") !== "DUBAI";
  const visitorLabel = !visitor ? "" : !arabic ? visitor.label : visitor.sameZone ? "أنت في دبي أيضاً"
    : visitor.label.replace("YOU", "أنت").replace("SAME TIME", "التوقيت نفسه").replace("DXB", "دبي").replace(/(\d+)H$/, "$1 س");

  return (
    <div
      className="absolute inset-0 touch-pan-y cursor-grab active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerEnter={() => { shared.current.hover = true; }}
      onPointerLeave={() => { shared.current.hover = false; }}
    >
      <Canvas
        aria-hidden="true"
        dpr={[1, 1.5]}
        frameloop={animate ? "always" : "demand"}
        camera={{ position: [0, 1.0, 5.4], fov: 40 }}
        onCreated={({ camera, clock: c }) => { camera.lookAt(0, 1.0, 0); clock.current = c; }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      >
        <Earth progress={progress} animate={animate} shared={shared} selected={selected} visitor={visitor} />
      </Canvas>

      {/* Place labels are real buttons: keyboard reachable, and they open the detail card. */}
      {PLACES.map((p, i) => (
        <button
          key={p.id}
          ref={(el) => { shared.current.labels[i] = el; }}
          onClick={() => setSelected(selected === p.id ? null : p.id)}
          aria-expanded={selected === p.id}
          className={`absolute left-0 top-0 opacity-0 font-mono text-[10px] tracking-[0.14em] whitespace-nowrap px-1 py-0.5 bg-background/80 hover:bg-foreground hover:text-background ${p.id === "dxb" ? "text-primary font-bold text-[11px]" : "text-[#a3a6b6]"} ${selected === p.id ? "bg-primary text-foreground" : ""}`}
        >
          {p.id === "dxb" ? `${t("DUBAI")}${time ? ` · ${time}` : ""}` : t(p.name.split(",")[0].toUpperCase())}
        </button>
      ))}
      {visitor && !visitor.sameZone && (
        <span ref={(el) => { shared.current.visitorLabel = el; }} className="absolute left-0 top-0 opacity-0 font-mono text-[10px] tracking-[0.14em] text-foreground whitespace-nowrap bg-background/80 px-1">
          {visitorLabel}
        </span>
      )}

      {/* Journey ticker + replay, sitting on the horizon line. */}
      <div className="absolute start-0 bottom-3 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em]">
        <button onClick={replay} className="border border-border bg-background px-2 py-1 hover:bg-foreground hover:text-background transition-colors">
          {t("▶ Replay journey")}
        </button>
        <span ref={(el) => { shared.current.ticker = el; }} className="text-on-surface-variant bg-background px-1" aria-live="polite" />
        {visitor?.sameZone && <span className="text-foreground">· {visitorLabel}</span>}
      </div>

      {place && (
        <div role="dialog" aria-label={t(place.name)} className="absolute end-0 bottom-12 w-[260px] border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">{t(place.name)}</span>
            <button onClick={() => setSelected(null)} aria-label={t("Close")} className="font-mono text-[12px] px-1 hover:bg-foreground hover:text-background">×</button>
          </div>
          <ul className="px-4 py-3 space-y-1.5 text-[13px] leading-[1.4]">
            {place.lines.map((l) => <li key={l}>{t(l)}</li>)}
          </ul>
          <a href={place.link.href} className="block border-t border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] hover:bg-foreground hover:text-background">
            {t(place.link.label)} ↓
          </a>
        </div>
      )}
    </div>
  );
}
