"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";

const W = 2, H = 3, D = 1.2;

// Monolith as a point cloud: dense along the 12 edges, sparse across the 6 faces.
function buildMonolith(count: number) {
  const pos: number[] = [], rand: number[] = [], edge: number[] = [];
  const corners: THREE.Vector3[] = [];
  for (const x of [-W / 2, W / 2]) for (const y of [-H / 2, H / 2]) for (const z of [-D / 2, D / 2]) corners.push(new THREE.Vector3(x, y, z));
  const edges = corners.flatMap((a, i) => corners.slice(i + 1).filter((b) => [a.x !== b.x, a.y !== b.y, a.z !== b.z].filter(Boolean).length === 1).map((b) => [a, b] as const));
  const push = (p: THREE.Vector3, isEdge: number) => {
    pos.push(p.x, p.y, p.z);
    const r = new THREE.Vector3().randomDirection().multiplyScalar(0.4 + Math.random());
    rand.push(r.x, r.y, r.z);
    edge.push(isEdge);
  };
  const edgeCount = Math.floor(count * 0.45);
  for (let i = 0; i < edgeCount; i++) {
    const [a, b] = edges[i % edges.length];
    push(a.clone().lerp(b, Math.random()), 1);
  }
  const size = [W, H, D];
  for (let i = edgeCount; i < count; i++) {
    const axis = Math.floor(Math.random() * 3);
    const p = [(Math.random() - 0.5) * W, (Math.random() - 0.5) * H, (Math.random() - 0.5) * D];
    p[axis] = (Math.random() < 0.5 ? -0.5 : 0.5) * size[axis];
    push(new THREE.Vector3(...p), 0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aRand", new THREE.Float32BufferAttribute(rand, 3));
  g.setAttribute("aEdge", new THREE.Float32BufferAttribute(edge, 1));
  return g;
}

const vertex = /* glsl */ `
uniform float uTime; uniform float uScatter; uniform float uPixelRatio; uniform vec3 uMouse;
attribute vec3 aRand; attribute float aEdge;
varying float vAttn; varying float vEdge;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  // Cursor as an attention field: nearby points are pushed away and light up.
  float attn = smoothstep(1.3, 0.0, distance(world.xyz, uMouse));
  world.xyz += normalize(world.xyz - uMouse + 1e-4) * attn * 0.4;
  // Scroll dissolves the monolith into a drifting cloud.
  world.xyz += aRand * uScatter * 5.0 + vec3(0.0, uScatter * 1.5, 0.0);
  world.xyz += aRand * 0.025 * sin(uTime * 1.3 + aRand.x * 12.0);
  vAttn = attn; vEdge = aEdge;
  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = mix(1.6, 2.6, aEdge) * uPixelRatio * (9.0 / -mv.z);
}`;

// Square points on purpose: the site has zero radius everywhere.
const fragment = /* glsl */ `
uniform float uScatter;
varying float vAttn; varying float vEdge;
void main() {
  vec3 color = mix(vec3(1.0), vec3(0.18, 0.357, 1.0), vAttn);
  float alpha = mix(0.28, 0.9, max(vEdge, vAttn)) * (1.0 - uScatter * 0.7);
  gl_FragColor = vec4(color, alpha);
}`;

function Points({ progress, mouse, animate }: { progress: MotionValue<number>; mouse: React.MutableRefObject<THREE.Vector2>; animate: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const { camera, gl, invalidate } = useThree();
  const geometry = useMemo(() => buildMonolith(6000), []);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uScatter: { value: 0 }, uPixelRatio: { value: gl.getPixelRatio() },
    uMouse: { value: new THREE.Vector3(99, 99, 99) },
  }), [gl]);
  const ray = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const pts = ref.current;
    if (!pts) return;
    uniforms.uTime.value += delta;
    uniforms.uScatter.value = THREE.MathUtils.damp(uniforms.uScatter.value, progress.get(), 6, delta);
    pts.rotation.y += delta * 0.18;
    pts.rotation.x = THREE.MathUtils.damp(pts.rotation.x, mouse.current.y * 0.15, 3, delta);
    // Project the cursor onto the z=0 plane in world space.
    ray.set(mouse.current.x, mouse.current.y, 0.5).unproject(camera).sub(camera.position).normalize();
    const t = -camera.position.z / ray.z;
    uniforms.uMouse.value.copy(camera.position).addScaledVector(ray, t);
  });

  useEffect(() => () => geometry.dispose(), [geometry]);
  // Still frame for reduced motion: tilt the monolith once so it reads as 3D.
  useEffect(() => {
    if (!animate && ref.current) { ref.current.rotation.set(0.12, 0.6, 0); invalidate(); }
  }, [animate, invalidate]);

  return (
    <points ref={ref} geometry={geometry}>
      <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default function Monolith3D({ progress, animate }: { progress: MotionValue<number>; animate: boolean }) {
  const mouse = useRef(new THREE.Vector2(9, 9));
  useEffect(() => {
    const move = (e: PointerEvent) => mouse.current.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <Canvas
      aria-hidden="true"
      className="!absolute inset-0 pointer-events-none"
      dpr={[1, 1.5]}
      frameloop={animate ? "always" : "demand"}
      camera={{ position: [0, 0, 9], fov: 35 }}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
    >
      <Points progress={progress} mouse={mouse} animate={animate} />
    </Canvas>
  );
}
