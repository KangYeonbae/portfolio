import type { Metadata } from "next";
import { ProjectExploration } from "@/components/project-exploration";

export const metadata: Metadata = {
  title: "프로젝트 탐험 — 강연배",
  description: "강연배의 대표 프로젝트를 둘러보는 스크롤 탐험.",
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ scene?: string | string[] }>;
}) {
  const { scene: requestedScene } = await searchParams;
  const scene = requestedScene === "museum" ? "museum" : "modern";
  return <ProjectExploration key={scene} scene={scene} />;
}
