import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArchitectureDiagram } from "@/components/architecture-diagram";
import { ArrowRight, ArrowUpRight } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { categoryLabels, projects as staticProjects } from "@/data/projects";
import { projectDetails, type ProjectDetail } from "@/data/project-details";
import { projectNarratives, type NarrativeItem, type ProjectNarrative } from "@/data/project-narratives";
import { projectChallenges } from "@/data/project-challenges";
import { listProjects } from "@/lib/content-store";
import styles from "./project-detail.module.css";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };

const relatedNotes: Record<string, { href: string; title: string }> = {
  "review-classifier": { href: "/notes/reduce-ai-api-cost-with-lightweight-model", title: "AI API 비용을 99.9% 줄인 방법" },
  "text-to-sql": { href: "/notes/building-bigquery-ai-analyst", title: "SQL을 몰라도 데이터를 분석할 수 있다면" },
};

async function findProject(id: string) {
  const local = staticProjects.find((project) => project.id === id);
  if (local) return local;
  try { return (await listProjects()).find((project) => project.id === id) ?? null; } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await findProject((await params).id);
  return project ? { title: `${project.title} — 강연배`, description: project.summary } : {};
}

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return <header className={styles.sectionHead}><p>{eyebrow}</p><h2>{title}</h2>{description && <span>{description}</span>}</header>;
}

function CompactCards({ items }: { items: NarrativeItem[] }) {
  return <div className={styles.compactGrid}>{items.map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.detail}</p></article>)}</div>;
}

function ExperienceFlow({ items }: { items: NarrativeItem[] }) {
  return <ol className={styles.experienceFlow}>{items.map((item, index) => <li key={item.title}><span>STEP {String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.detail}</p></li>)}</ol>;
}

function actionLabel(label?: string) {
  const labels: Record<string, string> = { "Live site": "서비스 사용하기", Demo: "영상 보기", Press: "보도자료", Presentation: "발표 자료" };
  return labels[label ?? ""] ?? label ?? "서비스 사용하기";
}

function fallbackNarrative(project: NonNullable<Awaited<ReturnType<typeof findProject>>>): ProjectNarrative {
  return {
    kind: `${categoryLabels[project.category]} 프로젝트`,
    team: project.role,
    user: "프로젝트의 핵심 기능을 사용하는 사용자",
    need: project.summary,
    success: "핵심 사용자 흐름의 안정적인 완성",
    experiences: [{ title: "핵심 기능", detail: project.summary }],
    ownership: [project.role],
    outcomes: [{ title: project.status ?? "완료", detail: "상세 공개 범위 정리 중" }],
  };
}

function fallbackDetail(project: NonNullable<Awaited<ReturnType<typeof findProject>>>): ProjectDetail {
  return { problem: project.summary, architecture: ["User input", "Product", "Result"], signals: project.tags.slice(0, 4), decisions: [] };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const project = await findProject(id);
  if (!project) notFound();

  const detail = projectDetails[id] ?? fallbackDetail(project);
  const narrative = projectNarratives[id] ?? fallbackNarrative(project);
  const challenge = projectChallenges[id];

  const relatedNote = relatedNotes[id];
  const currentIndex = staticProjects.findIndex((item) => item.id === id);
  const nextProject = staticProjects[(currentIndex + 1) % staticProjects.length];

  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <section className={`${styles.hero} shell`}>
          <Link href="/projects" className={styles.back}>← 전체 프로젝트</Link>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p className={styles.kicker}>{narrative.kind} · {categoryLabels[project.category]}</p>
              <h1>{project.title}</h1>
              <p className={styles.summary}>{project.summary}</p>
              {(project.url || project.video || project.links?.length) && <div className={styles.actions}>
                {project.url && <a className={styles.primaryAction} href={project.url} target="_blank" rel="noreferrer">{actionLabel(project.urlLabel)} <ArrowUpRight /></a>}
                {project.video && <a href={project.video} target="_blank" rel="noreferrer">영상 보기 <ArrowUpRight /></a>}
                {project.links?.map((link) => <a href={link.url} target="_blank" rel="noreferrer" key={link.url}>{actionLabel(link.label)} <ArrowUpRight /></a>)}
              </div>}
            </div>
            <dl className={styles.meta}>
              <div><dt>기간</dt><dd>{project.period}</dd></div>
              <div><dt>상태</dt><dd>{project.status ?? "완료"}</dd></div>
              <div><dt>역할</dt><dd>{project.role}</dd></div>
              <div><dt>팀 구성</dt><dd>{narrative.team}</dd></div>
            </dl>
          </div>

          {project.video ? <figure className={styles.productMedia}>
            <video controls playsInline preload="metadata" poster={project.videoPoster ?? project.image}><source src={project.video} type="video/mp4" />브라우저가 영상을 지원하지 않습니다.</video>
            <figcaption><span>제품 실행 화면</span>{project.videoCaption}</figcaption>
          </figure> : project.image ? <figure className={`${styles.productMedia} ${project.imageAspect === "portrait" ? styles.portrait : ""}`}>
            <div className={styles.imageFrame}><Image src={project.image} alt={`${project.title} 대표 제품 화면`} fill priority sizes="(max-width: 760px) 92vw, 860px" className={project.imageFit === "contain" ? styles.contain : undefined} /></div>
            <figcaption><span>대표 제품 화면</span>{project.title}</figcaption>
          </figure> : <figure className={`${styles.productMedia} ${styles.systemPreview}`}>
            <figcaption><span>공개 시스템 뷰</span>제품 화면 비공개 또는 기록 없음</figcaption>
            <div><p>{project.title}</p>{detail.architecture.map((step, index) => <span key={step}><small>{String(index + 1).padStart(2, "0")}</small>{step}</span>)}</div>
          </figure>}
        </section>

        <section className={`${styles.brief} shell`}>
          <div className={styles.briefIntro}><p>PRODUCT BRIEF</p><h2>문제와 사용자</h2></div>
          <div className={styles.briefRail}>
            <article><span>사용자</span><p>{narrative.user}</p></article>
            <article><span>기존 불편</span><p>{narrative.need}</p></article>
            <article><span>해결 방향</span><p>{project.summary}</p></article>
            <article className={styles.success}><span>성공 기준</span><p>{narrative.success}</p></article>
          </div>
        </section>

        <section className={`${styles.section} shell`}>
          <SectionTitle eyebrow="PRODUCT EXPERIENCE" title="제품이 제공하는 경험" description="사용자 입력부터 실제 결과까지의 핵심 기능" />
          <ExperienceFlow items={narrative.experiences} />
        </section>

        <section className={`${styles.splitSection} shell`}>
          <div className={styles.ownership}>
            <SectionTitle eyebrow="OWNERSHIP" title="내가 맡은 범위" />
            <ul>{narrative.ownership.map((item) => <li key={item}>{item}</li>)}</ul>
            <div className={styles.stack}><span>기술</span><p>{project.tags.join(" · ")}</p></div>
          </div>
          <div className={styles.flowCopy}>
            <SectionTitle eyebrow="PRODUCT FLOW" title="제품 및 시스템 흐름" />
            <p>입력 → 처리 → 검증 → 저장 → 사용자 결과</p>
            <div className={styles.architecture}><ArchitectureDiagram steps={detail.architecture} signals={detail.signals} /></div>
          </div>
        </section>

        {detail.decisions.length > 0 && <section className={`${styles.section} shell`}>
          <SectionTitle eyebrow="ENGINEERING DECISIONS" title="핵심 기술 판단" description="검토한 제약과 최종 선택" />
          <div className={styles.decisionContext}><span>검토한 문제</span><p>{detail.problem}</p></div>
          <div className={styles.decisionList}>{detail.decisions.map((decision, index) => <article className={styles.decisionItem} key={decision.title}>
            <header className={styles.decisionHeading}><span>{String(index + 1).padStart(2, "0")}</span><h3>{decision.title}</h3></header>
            <div className={styles.decisionBody}>
              <div><p>선택과 결과</p><strong>{decision.detail}</strong></div>
              {challenge?.limitations[index] && <div><p>남은 한계</p><strong>{challenge.limitations[index]}</strong></div>}
            </div>
          </article>)}</div>
        </section>}

        <section className={`${styles.challengeResult} shell`}>
          <div className={styles.challenge}>
            <SectionTitle eyebrow="HARDEST PROBLEM" title="가장 어려웠던 문제" />
            {challenge ? <article><span>{challenge.label}</span><h3>{challenge.title}</h3><dl><div><dt>상황</dt><dd>{challenge.situation}</dd></div><div><dt>해결</dt><dd>{challenge.resolution}</dd></div><div><dt>재발 방지</dt><dd>{challenge.prevention}</dd></div></dl></article> : <article><span>상세 준비 중</span><h3>공개 가능한 문제 해결 기록 정리 중</h3><p>{narrative.need}</p></article>}
          </div>
          <div className={styles.results}><SectionTitle eyebrow="OUTCOME" title="결과와 영향" /><CompactCards items={narrative.outcomes} /></div>
        </section>

        {narrative.featured && <section className={`${styles.featured} shell`}>
          <SectionTitle eyebrow="IN PRACTICE" title="운영·검증·협업" description="대표 프로젝트 심화 기록" />
          <div className={styles.featuredGrid}>
            <div><span>운영·보안·검증</span><CompactCards items={narrative.featured.operations} /></div>
            <article className={styles.textCard}><span>협업과 트레이드오프</span><p>{narrative.featured.collaboration}</p></article>
            <article className={styles.textCard}><span>회고와 다음 단계</span><p>{narrative.featured.retrospective}</p></article>
          </div>
        </section>}

        {relatedNote && <section className={`${styles.note} shell`}><span>RELATED NOTE</span><Link href={relatedNote.href}>{relatedNote.title} <ArrowRight /></Link></section>}

        <section className={`${styles.next} shell`}>
          <div><p>NEXT PROJECT</p><h2>{nextProject.title}</h2><span>{nextProject.summary}</span></div>
          <Link href={`/projects/${nextProject.id}`}>다음 프로젝트 <ArrowRight /></Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
