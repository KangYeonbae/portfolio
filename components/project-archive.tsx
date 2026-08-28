"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { type Project, type ProjectCategory } from "@/data/projects";
import { ArrowUpRight, Search } from "./icons";
import styles from "./project-archive.module.css";

type Filter = "all" | ProjectCategory;

const filterMeta: Record<Filter, { label: string; short: string }> = {
  all: { label: "전체", short: "ALL" },
  work: { label: "실무", short: "PRO" },
  product: { label: "개인 제품", short: "PRD" },
  lab: { label: "기술 실험", short: "LAB" },
  student: { label: "초기 프로젝트", short: "EDU" },
};

const externalLabels: Record<NonNullable<Project["urlLabel"]>, string> = {
  "Live site": "서비스 보기",
  Demo: "데모 보기",
  Press: "보도자료",
  GitHub: "GitHub",
  Notion: "문서 보기",
};

export function ProjectArchive({ projects, compact = false }: { projects: Project[]; compact?: boolean }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return projects.filter((project) => {
      if (filter !== "all" && project.category !== filter) return false;
      if (!normalized) return true;
      return [project.title, project.eyebrow, project.summary, project.role, ...project.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [filter, projects, query]);

  const filters: Filter[] = ["all", "work", "product", "lab", "student"];
  const counts = useMemo(() => {
    const categoryCounts = projects.reduce<Record<ProjectCategory, number>>(
      (result, project) => ({ ...result, [project.category]: result[project.category] + 1 }),
      { work: 0, product: 0, lab: 0, student: 0 },
    );
    return { all: projects.length, ...categoryCounts };
  }, [projects]);

  return (
    <div className={`${styles.archive} ${compact ? styles.compact : ""}`}>
      <aside className={styles.filterPanel} aria-label="프로젝트 필터">
        <header className={styles.filterHeader}>
          <div className={styles.filterTitle}>
            <span className={styles.filterIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M4 5h16l-6.2 7.1v5.7l-3.6 1.8v-7.5L4 5Z" /></svg>
            </span>
            <div><strong>필터</strong><span>{visible.length} / {projects.length}개 표시</span></div>
          </div>
          {(filter !== "all" || query) && (
            <button className={styles.resetButton} type="button" onClick={() => { setFilter("all"); setQuery(""); }} aria-label="필터 초기화">×</button>
          )}
        </header>

        <label className={styles.searchBox}>
          <Search />
          <span className="sr-only">프로젝트 검색</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="프로젝트 검색" />
        </label>

        <p className={styles.filterLabel}>분류</p>
        <div className={styles.filterList} role="group" aria-label="프로젝트 유형 필터">
          {filters.map((value) => (
            <button
              key={value}
              type="button"
              className={filter === value ? styles.active : ""}
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
            >
              <span className={styles.filterCode}>{filterMeta[value].short}</span>
              <strong>{filterMeta[value].label}</strong>
              <span className={styles.filterCount}>{counts[value]}</span>
              <span className={styles.chevron} aria-hidden="true">›</span>
            </button>
          ))}
        </div>
      </aside>

      <section className={styles.results} aria-live="polite">
        <div className={styles.resultsHeader}>
          <p><strong>{visible.length}</strong>개의 프로젝트</p>
          <span>최근 작업순</span>
        </div>

        <div className={styles.projectGrid}>
          {visible.map((project, index) => (
            <article className={styles.projectCard} key={project.id}>
              <header className={styles.cardHeader}>
                <span className={styles.categoryBadge} data-category={project.category}>
                  <span aria-hidden="true">{filterMeta[project.category].short}</span>
                  {filterMeta[project.category].label}
                </span>
                {project.status && <span className={styles.status} data-status={project.status}><i />{project.status}</span>}
              </header>

              <Link className={`${styles.thumbnail} ${project.imageFit === "contain" ? styles.imageContain : ""}`} href={`/projects/${project.id}`} aria-label={`${project.title} 상세 보기`}>
                {project.image ? (
                  <Image
                    src={project.image}
                    alt={`${project.title} 프로젝트 화면`}
                    fill
                    priority={index < 3}
                    sizes="(max-width: 700px) 100vw, (max-width: 1180px) 50vw, 330px"
                  />
                ) : (
                  <span className={styles.fallbackCover} data-category={project.category}>
                    <small>{project.eyebrow}</small>
                    <strong>{project.title}</strong>
                    <i>{filterMeta[project.category].short}</i>
                  </span>
                )}
              </Link>

              <div className={styles.cardBody}>
                <p className={styles.eyebrow}>{project.eyebrow}</p>
                <h2><Link href={`/projects/${project.id}`}>{project.title}</Link></h2>
                <p className={styles.summary}>{project.summary}</p>
                <p className={styles.role}>{project.role}</p>
                <div className={styles.tagList}>{project.tags.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}</div>
              </div>

              <footer className={styles.cardFooter}>
                <Link className={styles.primaryAction} href={`/projects/${project.id}`}>상세 보기 <ArrowUpRight /></Link>
                {project.url && (
                  <a className={styles.secondaryAction} href={project.url} target="_blank" rel="noreferrer">
                    {project.urlLabel ? externalLabels[project.urlLabel] : "결과 보기"} <ArrowUpRight />
                  </a>
                )}
                <span className={styles.period}>{project.period}</span>
              </footer>
            </article>
          ))}
        </div>

        {visible.length === 0 && (
          <div className={styles.emptyState}>
            <strong>일치하는 프로젝트가 없습니다.</strong>
            <p>검색어를 지우거나 다른 분류를 선택해 보세요.</p>
            <button type="button" onClick={() => { setFilter("all"); setQuery(""); }}>전체 프로젝트 보기</button>
          </div>
        )}
      </section>
    </div>
  );
}
