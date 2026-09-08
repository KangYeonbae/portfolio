import { Fragment } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PrintToolbar } from "@/components/print-toolbar";
import { projectDetails } from "@/data/project-details";
import { projectNarratives } from "@/data/project-narratives";
import { projectChallenges } from "@/data/project-challenges";
import { projectCount, projects, type Project } from "@/data/projects";
import styles from "./portfolio.module.css";

export const metadata: Metadata = {
  title: "강연배 포트폴리오 — AI Full-stack Engineer",
  description: "사용자 문제부터 배포와 운영까지 연결하는 AI 풀스택 엔지니어 강연배의 포트폴리오",
};

const featuredIds = ["byeoljari", "meetsub", "exam-forge", "amazon-ads-agent", "bid-master"] as const;
const personalIds = ["dubby", "sns-easyup", "cloudrun-monitor"] as const;
const operationsIds = ["multilingual-cms", "snap-p", "voc-analyzer", "review-classifier", "did-cms"] as const;
const appliedAiIds = ["local-browser-agent", "text-to-sql", "ga4-validator", "instagram-insight"] as const;
const studentIds = ["student-echo", "student-spaceplace"] as const;

function getProject(id: string) {
  const project = projects.find((item) => item.id === id);
  if (!project) throw new Error(`Unknown portfolio project: ${id}`);
  return project;
}

const pages: ((page: number) => React.ReactNode)[] = [
  (page) => <CoverPage page={page} />,
  (page) => <ProfilePage page={page} />,
  (page) => <CasePage id={featuredIds[0]} page={page} />,
  (page) => <CasePage id={featuredIds[1]} page={page} />,
  (page) => <CasePage id={featuredIds[2]} page={page} />,
  (page) => <ProjectGridPage page={page} label="PERSONAL PRODUCTS" kicker="SHIP · LEARN · OPERATE" title="개인 프로젝트를 통해 제품의 전 과정을 검증합니다." ids={personalIds} personal />,
  (page) => <CasePage id={featuredIds[3]} page={page} />,
  (page) => <CasePage id={featuredIds[4]} page={page} />,
  (page) => <ProjectGridPage page={page} label="WORK PRODUCTS" kicker="CONTENT · COMMERCE · OPERATIONS" title="현업의 반복 업무를 운영 가능한 제품으로 전환합니다." ids={operationsIds} />,
  (page) => <ProjectGridPage page={page} label="APPLIED AI" kicker="RIGHT-SIZED AI" title="문제에 맞는 크기의 AI와 자동화를 선택합니다." ids={appliedAiIds} />,
  (page) => <FoundationPage page={page} />,
];

const TOTAL_PAGES = pages.length;

export default function PortfolioPage() {
  return <main className={styles.document}>
    <PrintToolbar className={styles.toolbar} pdfHref="/Kang-Yeonbae-Portfolio.pdf" />
    {pages.map((render, index) => <Fragment key={index}>{render(index + 1)}</Fragment>)}
  </main>;
}

function CoverPage({ page }: { page: number }) {
  return <section className={`${styles.page} ${styles.cover}`}>
    <PageMark page={page} label="PORTFOLIO 2026" />
    <div className={styles.coverIdentity}><span>KYB</span><div><strong>Kang YeonBae</strong><small>AI Full-stack Engineer</small></div></div>
    <div className={styles.coverBody}>
      <p className={styles.kicker}>PRODUCT · AI · BACKEND · CLOUD</p>
      <h1>사용자 문제에서<br /><em>운영되는 제품</em>까지.</h1>
      <p>기획·설계·개발·배포를 연결해 실제 사용자가 계속 쓸 수 있는 제품 완성.</p>
    </div>
    <div className={styles.coverProof}>
      <article><span>PERSONAL</span><strong>개인 제품 우선</strong><p>결제·모바일·실시간·도메인 제품의 직접 운영</p></article>
      <article><span>WORK</span><strong>8개 실무 프로젝트</strong><p>광고·커머스·VOC 업무의 제품화</p></article>
      <article><span>RESULT</span><strong>40% · 95%+</strong><p>CS 생산성 개선 · 리뷰 분류 정확도</p></article>
    </div>
    <div className={styles.coverLinks}><a href="mailto:dusqo7951@gmail.com">dusqo7951@gmail.com</a><a href="https://github.com/KangYeonbae">github.com/KangYeonbae</a><a href="https://kangyeonbae.com">kangyeonbae.com</a></div>
  </section>;
}

function ProfilePage({ page }: { page: number }) {
  return <section className={styles.page}>
    <PageMark page={page} label="PROFILE" />
    <PageTitle kicker="ENGINEERING PROFILE" title={<>기능 구현 이후의<br />검증과 운영까지.</>} />
    <div className={styles.profileColumns}>
      <section><SectionLabel>EXPERIENCE</SectionLabel><div className={styles.timeline}>
        <article><time>2025.07 — 현재</time><h3>Hurdlers · AI Engineer</h3><p>광고·커머스·VOC AI 제품 및 업무 자동화</p></article>
        <article><time>2025.03 — 2025.07</time><h3>Mooker · Backend Lead</h3><p>폐쇄망 DID CMS 백엔드와 미디어 아키텍처</p></article>
        <article><time>2023 — 2024</time><h3>Codelab · SeSac</h3><p>클라우드·AICC·백엔드 집중 과정, 최우수 프로젝트</p></article>
      </div></section>
      <section><SectionLabel>WORKING PRINCIPLES</SectionLabel><div className={styles.principles}>
        <article><span>01</span><div><h3>실제 사용자 상황</h3><p>기술보다 먼저 반복 비용·실패 경계·성공 기준 확인</p></div></article>
        <article><span>02</span><div><h3>맞는 크기의 기술</h3><p>규칙·전통 ML·LLM·Agent의 목적별 조합</p></div></article>
        <article><span>03</span><div><h3>운영 가능한 완성</h3><p>로그·검증·재시도·권한·사람의 개입 지점 설계</p></div></article>
      </div></section>
    </div>
    <div className={styles.profileRail}>
      <article><span>문제 정의</span><p>현업 인터뷰와 실제 실패 상황의 요구사항 변환</p></article>
      <article><span>담당 범위</span><p>Product · Frontend · Backend · AI · Cloud</p></article>
      <article><span>제품 증거</span><p>실결제 · Google Play · 운영 서비스 · 언론 보도</p></article>
    </div>
    <div className={styles.skillLine}><span>STACK</span><p>Python · TypeScript · Next.js · FastAPI · PostgreSQL · Gemini · Google ADK · GCP · AWS</p></div>
    <PageFooter page={page} />
  </section>;
}

function CasePage({ id, page }: { id: string; page: number }) {
  const project = getProject(id);
  const narrative = projectNarratives[id];
  const detail = projectDetails[id];
  const challenge = projectChallenges[id];
  return <section className={styles.page}>
    <PageMark page={page} label={`${narrative.kind.toUpperCase()} · CASE STUDY`} />
    <header className={styles.caseHeader}>
      <div><p className={styles.kicker}>{project.eyebrow}</p><h2>{project.title}</h2><p>{project.summary}</p></div>
      <dl><div><dt>기간</dt><dd>{project.period}</dd></div><div><dt>상태</dt><dd>{project.status}</dd></div><div><dt>팀</dt><dd>{narrative.team}</dd></div></dl>
    </header>
    <div className={styles.caseHero}>
      {project.image && <figure><Image src={project.image} alt={`${project.title} 제품 화면`} fill sizes="105mm" loading="eager" /></figure>}
      <div className={styles.productBrief}><article><span>사용자</span><p>{narrative.user}</p></article><article><span>기존 불편</span><p>{narrative.need}</p></article><article><span>성공 기준</span><p>{narrative.success}</p></article></div>
    </div>
    <SectionLabel>USER JOURNEY</SectionLabel>
    <ol className={styles.journey}>{narrative.experiences.map((item, index) => <li key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.title}</strong><p>{item.detail}</p></li>)}</ol>
    <div className={styles.caseDetails}>
      <section><SectionLabel>OWNERSHIP</SectionLabel><ul>{narrative.ownership.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section><SectionLabel>KEY DECISIONS</SectionLabel>{detail.decisions.slice(0, 2).map((item) => <article className={styles.printDecision} key={item.title}><strong>{item.title}</strong><p>{item.detail}</p></article>)}</section>
      <section><SectionLabel>{challenge.label.toUpperCase()}</SectionLabel><h3 className={styles.challengeTitle}>{challenge.title}</h3><dl className={styles.challengeList}><div><dt>상황</dt><dd>{challenge.situation}</dd></div><div><dt>해결</dt><dd>{challenge.resolution}</dd></div><div><dt>재발 방지</dt><dd>{challenge.prevention}</dd></div></dl></section>
    </div>
    <div className={styles.outcomeBar}><span>RESULT</span>{narrative.outcomes.map((item) => <p key={item.title}><strong>{item.title}</strong>{item.detail}</p>)}{project.url && <a href={project.url}>{actionLabel(project)} ↗</a>}</div>
    <PageFooter page={page} />
  </section>;
}

function actionLabel(project: Project) {
  if (project.urlLabel === "Google Play") return "GOOGLE PLAY";
  if (project.urlLabel === "Press") return "보도자료";
  if (project.urlLabel === "GitHub") return "GITHUB";
  return "서비스 사용하기";
}

function secondaryLinkLabel(label: string) {
  if (label === "Demo") return "영상 보기";
  if (label === "Presentation") return "발표 자료";
  return label;
}

function ProjectGridPage({ page, label, kicker, title, ids, personal = false }: { page: number; label: string; kicker: string; title: string; ids: readonly string[]; personal?: boolean }) {
  return <section className={styles.page}>
    <PageMark page={page} label={label} />
    <PageTitle kicker={kicker} title={title} />
    <div className={`${styles.projectGrid} ${personal ? styles.personalGrid : ""}`}>
      {ids.map((id) => <ProjectCard key={id} project={getProject(id)} personal={personal} />)}
    </div>
    <PageFooter page={page} />
  </section>;
}

function ProjectCard({ project, personal }: { project: Project; personal: boolean }) {
  const narrative = projectNarratives[project.id];
  const challenge = projectChallenges[project.id];
  return <article className={styles.projectCard}>
    {personal && project.image && <figure><Image src={project.image} alt={`${project.title} 화면`} fill sizes="55mm" loading="eager" /></figure>}
    <div className={styles.cardBody}>
      <header><span>{narrative.kind}</span><h3>{project.title}</h3><p>{project.summary}</p></header>
      <dl><div><dt>사용자 문제</dt><dd>{narrative.need}</dd></div><div><dt>담당 범위</dt><dd>{narrative.ownership.slice(0, 2).join(" · ")}</dd></div><div><dt>{challenge.label}</dt><dd>{challenge.title} — {challenge.resolution}</dd></div><div><dt>결과</dt><dd>{narrative.outcomes.map((item) => item.title).join(" · ")}</dd></div></dl>
      <footer><span>{project.tags.slice(0, 4).join(" · ")}</span>{project.url && <a href={project.url}>{actionLabel(project)} ↗</a>}{project.links?.[0] && <a href={project.links[0].url}>{secondaryLinkLabel(project.links[0].label)} ↗</a>}</footer>
    </div>
  </article>;
}

function FoundationPage({ page }: { page: number }) {
  return <section className={`${styles.page} ${styles.foundation}`}>
    <PageMark page={page} label="FOUNDATION & CONTACT" />
    <PageTitle kicker="STUDENT FOUNDATION" title={<>팀 프로젝트에서 시작해,<br />운영 제품을 만드는 엔지니어로.</>} />
    <div className={`${styles.projectGrid} ${styles.foundationGrid}`}>{studentIds.map((id) => <ProjectCard key={id} project={getProject(id)} personal />)}</div>
    <div className={styles.closing}>
      <div><p className={styles.kicker}>LET&apos;S WORK TOGETHER</p><h3>문제를 발견하고<br />작동하는 제품으로.</h3><p>{projectCount}개 프로젝트의 전체 기록은 웹 포트폴리오에서 확인할 수 있습니다.</p></div>
      <div><a href="mailto:dusqo7951@gmail.com"><span>EMAIL</span><strong>dusqo7951@gmail.com</strong></a><a href="https://github.com/KangYeonbae"><span>GITHUB</span><strong>github.com/KangYeonbae</strong></a><a href="https://linkedin.com/in/yeonbae-kang-973436334"><span>LINKEDIN</span><strong>yeonbae-kang-973436334</strong></a><Link href="/projects"><span>WEB</span><strong>전체 프로젝트 보기</strong></Link></div>
    </div>
    <PageFooter page={page} />
  </section>;
}

function PageTitle({ kicker, title }: { kicker: string; title: React.ReactNode }) {
  return <header className={styles.pageTitle}><p className={styles.kicker}>{kicker}</p><h2>{title}</h2></header>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h3 className={styles.sectionLabel}>{children}</h3>;
}

function PageMark({ page, label }: { page: number; label: string }) {
  return <div className={styles.pageMark}><span>{String(page).padStart(2, "0")}</span><strong>{label}</strong></div>;
}

function PageFooter({ page }: { page: number }) {
  return <footer className={styles.pageFooter}><span>KANG YEONBAE · AI FULL-STACK ENGINEER</span><span>{String(page).padStart(2, "0")} / {String(TOTAL_PAGES).padStart(2, "0")}</span></footer>;
}
