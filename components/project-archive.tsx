"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { categoryLabels, type Project, type ProjectCategory } from "@/data/projects";
import { ArrowUpRight, Search } from "./icons";

type Filter = "all" | ProjectCategory;

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

  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    ...Object.entries(categoryLabels).map(([value, label]) => ({ value: value as ProjectCategory, label })),
  ];

  return (
    <div className={compact ? "archive archive-compact" : "archive"}>
      <div className="archive-controls">
        <div className="filter-list" role="group" aria-label="프로젝트 유형 필터">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              className={filter === item.value ? "active" : ""}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="search-box">
          <Search />
          <span className="sr-only">프로젝트 검색</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" />
        </label>
      </div>

      <p className="result-count"><strong>{visible.length}</strong> projects</p>

      <div className="project-list">
        {visible.map((project, index) => {
          const content = (
            <>
              <div className="project-index">{String(index + 1).padStart(2, "0")}</div>
              <div className={`project-thumbnail ${project.image ? "has-image" : ""} ${project.imageFit === "contain" ? "image-contain" : ""}`}>
                {project.image ? <Image src={project.image} alt="" fill sizes="120px" /> : <span>{categoryLabels[project.category].slice(0, 3).toUpperCase()}</span>}
              </div>
              <div className="project-main">
                <div className="project-title-row">
                  <h3>{project.title}</h3>
                  {project.status && <span className={`status status-${project.status}`}>{project.status}</span>}
                </div>
                <p className="project-eyebrow">{project.eyebrow}</p>
                <p className="project-summary">{project.summary}</p>
                <p className="project-role">{project.role}</p>
                <div className="tag-list">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              </div>
              <div className="project-meta">
                <span>{categoryLabels[project.category]}</span>
                <span>{project.period}</span>
                <div className="project-row-actions">
                  <Link className="project-action-case" href={`/projects/${project.id}`}>Case <ArrowUpRight /></Link>
                  {project.url && <a className="project-action-external" href={project.url} target="_blank" rel="noreferrer">{project.urlLabel ?? "Result"} <ArrowUpRight /></a>}
                </div>
              </div>
            </>
          );

          return <article className="project-row" key={project.id}>{content}</article>;
        })}
      </div>

      {visible.length === 0 && <p className="empty-state">조건에 맞는 프로젝트가 없습니다.</p>}
    </div>
  );
}
