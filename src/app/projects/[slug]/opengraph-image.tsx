import { ImageResponse } from "next/og";
import { projects } from "@/data/projects";
import { caseStudies } from "@/data/case-studies";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Case study by Taaqib Masood";

// The link preview recruiters see when they paste a case-study URL into LinkedIn, Slack or WhatsApp.
export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  const plain = caseStudies[slug]?.plain ?? "";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#000", color: "#fff", padding: 64, border: "2px solid #fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 4, color: "#a3a6b6" }}>
          <span>TAAQIB MASOOD · CASE STUDY</span>
          <span>{project?.categories.join(" · ").toUpperCase()}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 0.95, letterSpacing: -3, textTransform: "uppercase" }}>{project?.title ?? "Project"}</div>
          <div style={{ fontSize: 30, lineHeight: 1.35, marginTop: 28, color: "#d4d6e0", maxWidth: 980 }}>{plain}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <span style={{ fontSize: 22, letterSpacing: 4, color: "#a3a6b6" }}>AI ENGINEER · DUBAI</span>
          <div style={{ width: 56, height: 56, background: "#2e5bff" }} />
        </div>
      </div>
    ),
    size,
  );
}
