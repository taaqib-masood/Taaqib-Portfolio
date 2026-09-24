"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { isLand } from "@/lib/land-mask";

const R = 2;
const DEG = Math.PI / 180;
// Real places from the resume: base in Dubai, internship in Chennai, degree at VIT Vellore.
const DUBAI = { lat: 25.2, lon: 55.3 };
const PLACES = [
  { id: "dxb", lat: DUBAI.lat, lon: DUBAI.lon, label: "DXB · BASE", dx: -88, dy: -14 },
  { id: "maa", lat: 13.08, lon: 80.27, label: "CHENNAI · L&T", dx: 0, dy: -8 },
  // Vellore is ~130 km from Chennai: its label drops a line so the two never overlap.
  { id: "vit", lat: 12.92, lon: 79.13, label: "VELLORE · VIT", dx: 0, dy: 8 },
];

const toVec = (lat: number, lon: number, r = R) =>
  new THREE.Vector3(r * Math.cos(lat * DEG) * Math.sin(lon * DEG), r * Math.sin(lat * DEG), r * Math.cos(lat * DEG) * Math.cos(lon * DEG));

// Fibonacci sphere: land cells become visible points, a sparse subset of ocean keeps the sphere readable.
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
function buildArc(a: THREE.Vector3, b: THREE.Vector3, steps = 64) {
  const pts: THREE.Vector3[] = [];
  const an = a.clone().normalize(), bn = b.clone().normalize();
  const angle = an.angleTo(bn);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const p = an.clone().multiplyScalar(Math.sin((1 - t) * angle)).add(bn.clone().multiplyScalar(Math.sin(t * angle))).divideScalar(Math.sin(angle));
    pts.push(p.multiplyScalar(R * (1 + 0.12 * Math.sin(Math.PI * t))));
  }
  return new THREE.BufferGeometry().setFromPoints(pts);
}

const vertex = /* glsl */ `
uniform float uPixelRatio; uniform float uFade;
attribute float aLand;
varying float vAlpha;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vec3 normal = normalize(world.xyz - (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz);
  float facing = dot(normal, normalize(cameraPosition - world.xyz));
  // Fade toward the limb so the globe reads as a horizon, not a flat disc.
  vAlpha = smoothstep(0.0, 0.45, facing) * mix(0.1, 0.42, aLand) * uFade;
  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = mix(1.2, 1.7, aLand) * uPixelRatio * (8.0 / -mv.z);
}`;
// Square points on purpose: the site has zero radius everywhere.
const fragment = /* glsl */ `
varying float vAlpha;
void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, vAlpha); }`;

function Earth({ progress, animate, labels }: { progress: MotionValue<number>; animate: boolean; labels: React.MutableRefObject<(HTMLDivElement | null)[]> }) {
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const pulse = useRef<THREE.Mesh>(null);
  const { gl, camera, size, invalidate } = useThree();
  const geometry = useMemo(() => buildEarth(36000), []);
  const places = useMemo(() => PLACES.map((p) => toVec(p.lat, p.lon, R * 1.005)), []);
  const arcs = useMemo(
    () => places.slice(1).map((p) => new THREE.Line(buildArc(places[0], p), new THREE.LineBasicMaterial({ color: "#2e5bff", transparent: true, opacity: 0.9 }))),
    [places],
  );
  const uniforms = useMemo(() => ({ uPixelRatio: { value: gl.getPixelRatio() }, uFade: { value: 1 } }), [gl]);
  const pointer = useRef(new THREE.Vector2());
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const camDir = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const move = (e: PointerEvent) => pointer.current.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
  useEffect(() => () => { geometry.dispose(); arcs.forEach((l) => l.geometry.dispose()); }, [geometry, arcs]);
  useEffect(() => { if (!animate) invalidate(); }, [animate, invalidate]);

  useFrame((state) => {
    const g = outer.current;
    if (!g) return;
    const t = animate ? state.clock.elapsedTime : 0;
    const p = progress.get();
    // Sway ±12° around Dubai (never a full spin, so DXB stays on the crest), plus slight parallax.
    g.rotation.y = Math.sin(t * 0.12) * 12 * DEG + pointer.current.x * 4 * DEG + p * 0.6;
    g.rotation.x = pointer.current.y * 2 * DEG;
    g.position.y = -p * 1.2;
    uniforms.uFade.value = 1 - p * 0.8;
    // Arcs draw in over the first 2.5s; reduced motion shows them complete.
    const drawn = animate ? Math.min(1, t / 2.5) : 1;
    arcs.forEach((line) => line.geometry.setDrawRange(0, Math.floor(65 * drawn)));
    if (pulse.current) pulse.current.scale.setScalar(1 + (animate ? (t * 0.8) % 1 : 0) * 2.5);
    // Project markers to screen for the DOM labels; hide them on the far side.
    camera.getWorldDirection(camDir);
    places.forEach((v, i) => {
      const el = labels.current[i];
      if (!el) return;
      tmp.copy(v).applyMatrix4(inner.current!.matrixWorld);
      const visible = tmp.clone().normalize().dot(camDir) < -0.15;
      tmp.project(camera);
      el.style.opacity = visible ? String(1 - p) : "0";
      el.style.transform = `translate(${((tmp.x + 1) / 2) * size.width + 10 + PLACES[i].dx}px, ${((1 - tmp.y) / 2) * size.height - 6 + PLACES[i].dy}px)`;
    });
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
          {arcs.map((line, i) => <primitive key={i} object={line} />)}
          {places.map((v, i) => (
            <mesh key={PLACES[i].id} position={v}>
              <boxGeometry args={i === 0 ? [0.07, 0.07, 0.07] : [0.045, 0.045, 0.045]} />
              <meshBasicMaterial color={i === 0 ? "#2e5bff" : "#ffffff"} />
            </mesh>
          ))}
          <mesh ref={pulse} position={places[0]}>
            <ringGeometry args={[0.06, 0.07, 4, 1]} />
            <meshBasicMaterial color="#2e5bff" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default function Globe3D({ progress, animate }: { progress: MotionValue<number>; animate: boolean }) {
  const labels = useRef<(HTMLDivElement | null)[]>([]);
  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
      <Canvas
        dpr={[1, 1.5]}
        frameloop={animate ? "always" : "demand"}
        camera={{ position: [0, 1.0, 5.4], fov: 40 }}
        onCreated={({ camera }) => camera.lookAt(0, 1.0, 0)}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      >
        <Earth progress={progress} animate={animate} labels={labels} />
      </Canvas>
      {PLACES.map((p, i) => (
        <div
          key={p.id}
          ref={(el) => { labels.current[i] = el; }}
          className={`absolute left-0 top-0 font-mono text-[10px] tracking-[0.14em] whitespace-nowrap opacity-0 ${i === 0 ? "text-primary" : "text-[#a3a6b6]"}`}
        >
          {p.label}
        </div>
      ))}
    </div>
  );
}
