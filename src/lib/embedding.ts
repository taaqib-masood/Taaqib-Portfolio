// Deterministic "latent space" layout for the Projects scene: each project sits
// at the mean of its category anchors plus a slug-hashed offset, so projects that
// share categories cluster together but never collide.
// ponytail: hand-placed category anchors, not a real embedding model. Upgrade path:
// embed each project's blurb offline and PCA it to 3D.

type Vec3 = [number, number, number];
export interface EmbeddableProject { slug: string; categories: string[]; stack: string[] }

const ANCHORS: Record<string, Vec3> = {
  "AI/LLM": [0, 1.2, 0],
  "Full-Stack": [3.2, -0.4, -1.2],
  "ML": [-3.2, -0.4, -1.2],
  "Edge": [-3.6, -1.8, 1.6],
};

export const CLUSTER_RADIUS = 0.55;

function hash(s: string) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

export function layoutProjects(projects: EmbeddableProject[]): Vec3[] {
  const centers: Vec3[] = [];
  for (const p of projects) {
    const anchors = p.categories.map((c) => ANCHORS[c]).filter(Boolean);
    const base = anchors.reduce<Vec3>((a, v) => [a[0] + v[0] / anchors.length, a[1] + v[1] / anchors.length, a[2] + v[2] / anchors.length], [0, 0, 0]);
    // Golden-angle spiral from the slug hash: stable per project, spread around the anchor.
    let angle = (hash(p.slug) % 360) * (Math.PI / 180);
    let r = 1.4;
    let c: Vec3 = [base[0] + Math.cos(angle) * r, base[1] + Math.sin(angle) * r * 0.6, base[2] + Math.sin(angle) * r * 0.8];
    // Push out along the spiral until clear of every placed cluster.
    while (centers.some((o) => Math.hypot(o[0] - c[0], o[1] - c[1], o[2] - c[2]) < CLUSTER_RADIUS * 3)) {
      angle += 2.39996;
      r += 0.35;
      c = [base[0] + Math.cos(angle) * r, base[1] + Math.sin(angle) * r * 0.6, base[2] + Math.sin(angle) * r * 0.8];
    }
    centers.push(c);
  }
  return centers;
}

/** Nearest-neighbour edges: pairs of projects sharing at least `min` stack items. */
export function stackLinks(projects: EmbeddableProject[], min = 2): [number, number][] {
  const links: [number, number][] = [];
  for (let i = 0; i < projects.length; i++)
    for (let j = i + 1; j < projects.length; j++)
      if (projects[i].stack.filter((s) => projects[j].stack.includes(s)).length >= min) links.push([i, j]);
  return links;
}

/** A skill acts as the query vector: matching projects light up (same rule as the card grid). */
export const matchesSkill = (p: EmbeddableProject, skill: string | null) => !skill || p.stack.includes(skill);
