import type { Metadata } from "next";
import { ProjectArchive } from "@/components/project-archive";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { projects as fallbackProjects } from "@/data/projects";
import { listProjects } from "@/lib/content-store";
import styles from "./projects.module.css";

export const metadata: Metadata = { title: "Project Portfolio — 강연배", description: "실제 제품 화면과 운영 경험을 함께 확인하는 강연배의 프로젝트 포트폴리오" };
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  let projects = fallbackProjects;
  try { projects = await listProjects(); } catch { /* static archive remains available */ }

  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <header className={styles.hero}>
          <p className={styles.kicker}>PROJECT ARCHIVE · 2023—2026</p>
          <div className={styles.heroRow}>
            <div>
              <h1>Project Portfolio</h1>
              <p>실제 제품 화면과 운영 경험을 함께 확인할 수 있는 프로젝트 모음입니다.</p>
            </div>
            <p className={styles.intro}>
              AI 에이전트와 백엔드 시스템부터 직접 운영하는 제품까지,
              문제를 발견하고 배포 이후까지 책임진 작업을 정리했습니다.
            </p>
          </div>
        </header>

        <section className={styles.archiveSection} aria-label="프로젝트 포트폴리오">
          <ProjectArchive projects={projects} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
