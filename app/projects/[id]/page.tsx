import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArchitectureDiagram } from "@/components/architecture-diagram";
import { CaseFlow } from "@/components/case-flow";
import { ArrowRight, ArrowUpRight } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { categoryLabels, projects as staticProjects } from "@/data/projects";
import { projectDetails } from "@/data/project-details";
import { findCaseStudy, type CaseStudy } from "@/data/case-studies";
import { listProjects } from "@/lib/content-store";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ id: string }> };

const relatedNotes: Record<string, { href: string; title: string }> = {
  "review-classifier": {
    href: "/notes/reduce-ai-api-cost-with-lightweight-model",
    title: "AI API 비용을 99.9% 줄인 방법",
  },
  "text-to-sql": {
    href: "/notes/building-bigquery-ai-analyst",
    title: "SQL을 몰라도 데이터를 분석할 수 있다면",
  },
};

/**
 * Deep case-study layers for the three flagship projects.
 *
 * Progressive disclosure: IMPACT and ARCHITECTURE stay open so a recruiter can
 * scan product evidence and the system shape in well under a minute. DECISIONS
 * and OPERATIONS keep their headline and conclusion visible but fold the
 * reasoning, so an engineer can open exactly the part they want to interrogate.
 */
function DeepCaseSections({ study }: { study: CaseStudy }) {
  const trouble = study.troubleshooting;
  const collab = study.collaboration_detail;

  return (
    <>
      <section className="project-detail-section shell">
        <div className="detail-section-label"><span>02</span>IMPACT</div>
        <div className="detail-section-content">
          <h2>제품이 만든 변화</h2>
          <p className="deep-thesis">{study.thesis}</p>

          <div className="deep-scale">
            <div className="deep-scale-head"><span>PRODUCT EVIDENCE</span><small>{study.scaleSource}</small></div>
            <div className="deep-scale-grid">
              {study.scale.map((metric) => (
                <div key={metric.label}>
                  <strong>{metric.value}</strong>
                  <b>{metric.label}</b>
                  {metric.note && <small>{metric.note}</small>}
                </div>
              ))}
            </div>
          </div>
          <p className="deep-note">{study.scaleNote}</p>

          <div className="deep-outcomes">
            {study.outcomes.map((outcome) => (
              <article key={outcome.label}><span>{outcome.label}</span><p>{outcome.body}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="project-detail-section shell">
        <div className="detail-section-label"><span>03</span>ARCHITECTURE</div>
        <div className="detail-section-content">
          <h2>시스템 구조</h2>
          <p>{study.architectureNote} — 요청이 데이터와 서비스 경계를 지나 결과가 되기까지의 흐름입니다.</p>
          <CaseFlow lanes={study.lanes} />
        </div>
      </section>

      <section className="project-detail-section shell">
        <div className="detail-section-label"><span>04</span>DECISIONS</div>
        <div className="detail-section-content">
          <h2>무엇을 고르지 않았는지가<br />설계를 설명합니다.</h2>
          <p>결정과 그 결론은 펼쳐져 있습니다. 검토한 대안, 실제로 부딪힌 문제, 남은 부채는 항목을 열어 확인할 수 있습니다.</p>
          <div className="deep-decisions">
            {study.decisions.map((decision) => (
              <details className="deep-decision" key={decision.index}>
                <summary>
                  <span className="deep-index">{decision.index}</span>
                  <span className="deep-decision-head">
                    <strong>{decision.title}</strong>
                    <em>{decision.takeaway}</em>
                  </span>
                  <span className="deep-toggle" aria-hidden="true">＋</span>
                </summary>
                <div className="deep-decision-body">
                  <div><b>검토</b><p>{decision.considered}</p></div>
                  <div><b>문제</b><p>{decision.problem}</p></div>
                  <div><b>결정</b><p>{decision.decision}</p></div>
                  {decision.kept && <div><b>결과</b><p>{decision.kept}</p></div>}
                  {decision.debt && <div><b>남은 부채</b><p className="deep-debt">{decision.debt}</p></div>}
                </div>
              </details>
            ))}
          </div>

          {study.codeQuote && (
            <figure className="deep-quote">
              <blockquote>{study.codeQuote.code}</blockquote>
              <figcaption>{study.codeQuote.cite}</figcaption>
            </figure>
          )}
        </div>
      </section>

      <section className="project-detail-section shell">
        <div className="detail-section-label"><span>05</span>OPERATIONS</div>
        <div className="detail-section-content">
          <h2>무엇이 깨졌고,<br />누구와 무엇을 합의했는지.</h2>
          <p>운영에서 가장 오래 붙잡은 문제와, 요구를 수용 기준으로 옮긴 과정입니다.</p>

          <details className="deep-ops">
            <summary>
              <span className="deep-ops-kicker">TROUBLESHOOTING</span>
              <span className="deep-decision-head">
                <strong>{trouble.headline}</strong>
                <em>{trouble.evidence}</em>
              </span>
              <span className="deep-toggle" aria-hidden="true">＋</span>
            </summary>
            <div className="deep-ops-body">
              <div className="deep-incident">
                <b>{trouble.incident.when}</b>
                <div><span>증상</span><p>{trouble.incident.report}</p></div>
                <div><span>대응</span><p>{trouble.incident.fix}</p></div>
              </div>
              <p className="deep-note">{trouble.residue}</p>

              <h3>{trouble.secondary.headline}</h3>
              <p className="deep-note">{trouble.secondary.context}</p>
              <div className="deep-rows">
                {trouble.secondary.rows.map((row) => (
                  <div key={row.label}><span>{row.label}</span><b>{row.value}</b></div>
                ))}
              </div>
              <p className="deep-note">{trouble.secondary.resolution}</p>
            </div>
          </details>

          <details className="deep-ops">
            <summary>
              <span className="deep-ops-kicker">{collab.label ?? "COLLABORATION"}</span>
              <span className="deep-decision-head">
                <strong>{collab.note ?? "요구를 수용 기준으로 번역하기"}</strong>
                <em>{collab.setting}</em>
              </span>
              <span className="deep-toggle" aria-hidden="true">＋</span>
            </summary>
            <div className="deep-ops-body">
              <div className="deep-collab">
                <div className="deep-collab-head">
                  <span>{collab.headers?.[0] ?? "클라이언트가 말한 것"}</span>
                  <span>{collab.headers?.[1] ?? "내가 설계로 옮긴 것"}</span>
                </div>
                {collab.translations.map((row) => (
                  <div className="deep-collab-row" key={row.heard}>
                    <p className="deep-heard">{row.heard}</p>
                    <p className="deep-delivered">{row.delivered}</p>
                  </div>
                ))}
              </div>
              <div className="deep-boundary">
                <strong>{collab.boundary.title}</strong>
                <p>{collab.boundary.body}</p>
              </div>
            </div>
          </details>
        </div>
      </section>
    </>
  );
}

async function findProject(id: string) {
  const local = staticProjects.find((project) => project.id === id);
  if (local) return local;
  try { return (await listProjects()).find((project) => project.id === id) ?? null; } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await findProject((await params).id);
  return project ? { title: `${project.title} — 강연배`, description: project.summary } : {};
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const project = await findProject(id);
  if (!project) notFound();
  const detail = projectDetails[id];
  const deepCase = findCaseStudy(id);
  const relatedNote = relatedNotes[id];

  return (
    <>
      <SiteHeader />
      <main className="project-detail-main">
        <section className="project-detail-hero shell">
          <Link href="/projects" className="back-link">← All projects</Link>
          <div className="project-detail-heading">
            <div>
              <p className="overline"><span /> {categoryLabels[project.category]} · {project.period}</p>
              <h1>{project.title}</h1>
              <p>{project.summary}</p>
            </div>
            <dl>
              <div><dt>ROLE</dt><dd>{project.role}</dd></div>
              <div><dt>STATUS</dt><dd>{project.status ?? "완료"}</dd></div>
              <div><dt>STACK</dt><dd>{project.tags.join(" · ")}</dd></div>
              {(project.url || project.links?.length) && (
                <div>
                  <dt>LINK</dt>
                  <dd className="project-detail-links">
                    {project.url && <a className="project-hero-link" href={project.url} target="_blank" rel="noreferrer">{project.urlLabel ?? "Open result"} <ArrowUpRight /></a>}
                    {project.links?.map((link) => <a className="project-hero-link" href={link.url} target="_blank" rel="noreferrer" key={link.url}>{link.label} <ArrowUpRight /></a>)}
                  </dd>
                </div>
              )}
            </dl>
          </div>
          {project.video ? (
            <figure className="project-detail-media">
              <video controls playsInline preload="metadata" poster={project.videoPoster ?? project.image}>
                <source src={project.video} type="video/mp4" />
                브라우저가 이 영상을 지원하지 않습니다.
              </video>
              <figcaption>{project.videoCaption ?? "실제 실행 화면 · 1분 36초 · 화면과 모델 추론 로그를 함께 기록했습니다."}</figcaption>
            </figure>
          ) : project.image ? (
            <figure className={`project-detail-visual image-${project.imageAspect ?? "landscape"}`}>
              <figcaption><span>PRODUCT VIEW</span><span>{categoryLabels[project.category]} / {project.status ?? "완료"}</span></figcaption>
              <div className={`project-detail-image ${project.imageFit === "contain" ? "image-contain" : ""}`}>
                <Image src={project.image} alt={`${project.title} 제품 이미지`} fill priority sizes="(max-width: 920px) 100vw, 950px" />
              </div>
            </figure>
          ) : null}
        </section>

        {detail ? (
          <section className="project-detail-section shell">
            <div className="detail-section-label"><span>01</span>PROBLEM</div>
            <div className="detail-section-content">
              <h2>문제와 제약</h2>
              <div className="detail-problem-card">
                <p className="detail-lead">{detail.problem}</p>
                <div className="problem-constraints">
                  <span>KEY CONSTRAINTS</span>
                  <ul>{detail.signals.slice(0, 3).map((signal) => <li key={signal}>{signal}</li>)}</ul>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="project-detail-section shell"><div className="detail-section-label"><span>01</span>OVERVIEW</div><div className="detail-section-content"><h2>Project note</h2><p className="detail-lead">이 프로젝트의 상세 아키텍처 기록은 공개 가능한 범위를 정리하고 있습니다. 역할과 사용 기술은 전체 아카이브에서 먼저 확인할 수 있습니다.</p></div></section>
        )}

        {deepCase ? (
          <DeepCaseSections study={deepCase} />
        ) : detail ? (
          <>
            <section className="project-detail-section shell">
              <div className="detail-section-label"><span>02</span>PRODUCT FLOW</div>
              <div className="detail-section-content"><h2>사용자 문제를 푸는 흐름</h2><p>사용자의 입력이 제품의 핵심 경계를 지나 실제 결과로 이어지는 과정입니다.</p><div className="project-detail-architecture"><ArchitectureDiagram steps={detail.architecture} signals={detail.signals} /></div></div>
            </section>
            <section className="project-detail-section shell">
              <div className="detail-section-label"><span>03</span>DECISIONS</div>
              <div className="detail-section-content"><h2>제품을 만든 핵심 판단</h2><div className="decision-list">{detail.decisions.map((decision, index) => <article key={decision.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{decision.title}</h3><p>{decision.detail}</p></div></article>)}</div></div>
            </section>
          </>
        ) : null}

        {relatedNote && (
          <section className="project-detail-related shell">
            <span>RELATED NOTE</span>
            <Link href={relatedNote.href}>{relatedNote.title} <ArrowRight /></Link>
          </section>
        )}

        <section className="project-detail-next shell">
          {project.url ? <a href={project.url} target="_blank" rel="noreferrer">외부 결과물 열기 <ArrowUpRight /></a> : <span>Private repository / NDA</span>}
          <Link href="/projects">다른 프로젝트 보기 <ArrowRight /></Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
