"use client";

import { useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import type { Project } from "@/data/projects";
import { CLUSTER_RADIUS, layoutProjects, matchesSkill, stackLinks } from "@/lib/embedding";

const PER_CLUSTER = 520;
const WHITE = new THREE.Color("#ffffff");
const COBALT = new THREE.Color("#2e5bff");
const DIM = new THREE.Color("#3a3c4e");

const vertex = /* glsl */ `
uniform float uTime; uniform float uFocus; uniform float uPixelRatio;
attribute float aCluster; attribute vec3 color;
varying vec3 vColor; varying float vFocus;
void main() {
  vec3 p = position + normalize(position + 0.001) * 0.015 * sin(uTime + aCluster * 3.0 + position.x * 9.0);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vFocus = 1.0 - smoothstep(0.0, 0.8, abs(aCluster - uFocus));
  vColor = color;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = mix(2.0, 3.6, vFocus) * uPixelRatio * (6.0 / -mv.z);
}`;
const fragment = /* glsl */ `
varying vec3 vColor; varying float vFocus;
void main() { gl_FragColor = vec4(vColor, mix(0.5, 1.0, vFocus)); }`;

function Scene({ projects, activeSkill, progress, animate }: { projects: Project[]; activeSkill: string | null; progress: MotionValue<number>; animate: boolean }) {
  const { camera, gl, invalidate } = useThree();
  const centers = useMemo(() => layoutProjects(projects).map((c) => new THREE.Vector3(...c)), [projects]);
  const links = useMemo(() => stackLinks(projects), [projects]);

  const points = useMemo(() => {
    const pos: number[] = [], cluster: number[] = [];
    centers.forEach((c, i) => {
      for (let k = 0; k < PER_CLUSTER; k++) {
        // Gaussian-ish blob: denser core, soft edge.
        const d = new THREE.Vector3().randomDirection().multiplyScalar(CLUSTER_RADIUS * Math.pow(Math.random(), 0.7));
        pos.push(c.x + d.x, c.y + d.y, c.z + d.z);
        cluster.push(i);
      }
    });
    // Sparse background noise so the space reads as a space.
    for (let k = 0; k < 900; k++) {
      pos.push((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8 - 2);
      cluster.push(-10);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("aCluster", new THREE.Float32BufferAttribute(cluster, 1));
    g.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(pos.length), 3));
    return g;
  }, [centers]);

  const lines = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(links.flatMap(([a, b]) => [centers[a], centers[b]]));
    g.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(links.length * 6), 3));
    return g;
  }, [centers, links]);

  // The selected skill is the query vector: matching clusters and their edges go cobalt.
  useEffect(() => {
    const match = projects.map((p) => matchesSkill(p, activeSkill));
    const col = points.getAttribute("color") as THREE.BufferAttribute;
    const cl = points.getAttribute("aCluster") as THREE.BufferAttribute;
    for (let i = 0; i < cl.count; i++) {
      const c = cl.getX(i);
      const color = c < 0 ? DIM : !activeSkill ? WHITE : match[c] ? COBALT : DIM;
      col.setXYZ(i, color.r, color.g, color.b);
    }
    col.needsUpdate = true;
    const lc = lines.getAttribute("color") as THREE.BufferAttribute;
    links.forEach(([a, b], i) => {
      const color = activeSkill && match[a] && match[b] ? COBALT : DIM;
      lc.setXYZ(i * 2, color.r, color.g, color.b);
      lc.setXYZ(i * 2 + 1, color.r, color.g, color.b);
    });
    lc.needsUpdate = true;
    invalidate();
  }, [activeSkill, projects, points, lines, links, invalidate]);

  useEffect(() => () => { points.dispose(); lines.dispose(); }, [points, lines]);

  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uFocus: { value: 0 }, uPixelRatio: { value: gl.getPixelRatio() } }), [gl]);
  const look = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const eye = useMemo(() => new THREE.Vector3(), []);

  // Scroll flies the camera from cluster to cluster.
  useFrame((_, delta) => {
    const f = progress.get() * (centers.length - 1);
    const i = Math.min(Math.floor(f), centers.length - 2);
    const t = THREE.MathUtils.smootherstep(f - i, 0, 1);
    target.lerpVectors(centers[i], centers[i + 1], t);
    uniforms.uTime.value += delta;
    uniforms.uFocus.value = i + t;
    const damp = animate ? 1 - Math.exp(-5 * delta) : 1;
    look.lerp(target, damp);
    camera.position.lerp(eye.set(target.x + 0.9, target.y + 0.4, target.z + 3.0), damp);
    camera.lookAt(look);
  });

  return (
    <>
      <points geometry={points}>
        <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent depthWrite={false} />
      </points>
      <lineSegments geometry={lines}>
        <lineBasicMaterial vertexColors transparent opacity={0.6} />
      </lineSegments>
    </>
  );
}

export default function EmbeddingSpace(props: { projects: Project[]; activeSkill: string | null; progress: MotionValue<number>; animate: boolean }) {
  return (
    <Canvas
      aria-hidden="true"
      className="!absolute inset-0"
      dpr={[1, 1.5]}
      frameloop={props.animate ? "always" : "demand"}
      camera={{ position: [0, 0, 8], fov: 45 }}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
