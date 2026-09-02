import type { Metadata } from "next";
import { ProjectArchive } from "@/components/project-archive";
import { projects as fallbackProjects } from "@/data/projects";
import { listProjects } from "@/lib/content-store";
import styles from "./home.module.css";

export const metadata: Metadata = {
  title: "Project Portfolio — 강연배",
  description: "실제 서비스 화면과 운영 경험을 함께 확인할 수 있는 강연배의 프로젝트 포트폴리오",
};

export const dynamic = "force-dynamic";

export default async function Home() {
  let projects = fallbackProjects;

  try {
    projects = await listProjects();
  } catch {
    // Keep the portfolio available when the content store is unavailable.
  }

  return (
    <main className={styles.main}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>KANG YEONBAE · AI PRODUCT ENGINEER</p>
            <h1>Project Portfolio</h1>
            <p className={styles.description}>
              실제 서비스 화면과 운영 경험을 함께 확인할 수 있는 프로젝트 모음입니다.
            </p>
          </div>

          <nav className={styles.quickLinks} aria-label="빠른 링크">
            <a href="mailto:dusqo7951@gmail.com">Email</a>
            <a href="https://github.com/KangYeonbae" target="_blank" rel="noreferrer">GitHub</a>
            <a href="/Kang-Yeonbae-Portfolio.pdf" target="_blank" rel="noreferrer">PDF</a>
          </nav>
        </header>

        <section className={styles.archive} aria-label="프로젝트 포트폴리오">
          <ProjectArchive projects={projects} />
        </section>
      </div>
    </main>
  );
}
