import type { Metadata } from "next";
import { ProjectArchive } from "@/components/project-archive";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { projects as fallbackProjects } from "@/data/projects";
import { listProjects } from "@/lib/content-store";

export const metadata: Metadata = { title: "Projects — 강연배", description: "역할, 설계 판단, 결과가 분명한 프로젝트를 선별한 아카이브" };
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  let projects = fallbackProjects;
  try { projects = await listProjects(); } catch { /* static archive remains available */ }

  return <><SiteHeader /><main className="page-main"><section className="page-hero shell"><p className="overline"><span /> CURATED ARCHIVE</p><h1>많이 만든 것보다,<br /><em>무엇을 해결했는지.</em></h1><p>역할과 설계 판단, 결과가 분명한 작업만 선별했습니다. 실무 제품부터 직접 운영하는 서비스, 기술 실험과 초기 프로젝트까지 성장의 흐름으로 정리했습니다.</p><div className="archive-legend"><span>Professional</span><span>Product</span><span>Lab</span><span>Student</span></div></section><section className="shell archive-section"><ProjectArchive projects={projects} /></section></main><SiteFooter /></>;
}
