import type { Metadata } from "next";
import { ProjectExploration } from "@/components/project-exploration";

export const metadata: Metadata = {
  title: "프로젝트 탐험 — 강연배",
  description: "강연배의 대표 프로젝트 세 가지를 둘러보는 스크롤 탐험.",
};

export default function ExplorePage() {
  return <ProjectExploration />;
}
