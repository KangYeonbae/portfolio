import { Fragment } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PrintToolbar } from "@/components/print-toolbar";
import { projectDetails } from "@/data/project-details";
import { projectCount } from "@/data/projects";
import { amazonAdsAgent, bidMaster, byeoljari, type CaseStudy, type FlowLane } from "@/data/case-studies";
import styles from "./portfolio.module.css";

export const metadata: Metadata = {
  title: "강연배 포트폴리오 — Software Engineer",
  description: "Applied AI, Backend, Product Engineering 포트폴리오",
};

type CompactCase = {
  id: "text-to-sql" | "meetsub";
  type: string;
  title: string;
  copy: string;
  role: string;
  proof: string;
  image: string;
  stack: string;
};

const compactCases: CompactCase[] = [
  {
    id: "text-to-sql",
    type: "APPLIED AI",
    title: "BigQuery AI Analyst",
    copy: "자연어 질문을 스키마에 맞는 SQL로 만들고, 안전성 검사·실행·오류 복구·인사이트 생성까지 연결했습니다.",
    role: "AI · Backend · Data Product / 단독 개발",
    proof: "SELECT/WITH only · 최대 2회 복구 · SSE 진행 상태",
    image: "/project-media/text-to-sql.png",
    stack: "Google ADK · LangGraph · BigQuery · RAG",
  },
  {
    id: "meetsub",
    type: "REAL-TIME PRODUCT",
    title: "MeetSub",
    copy: "실시간 STT와 번역 자막, 회의 기록, 요약 리포트와 PDF 내보내기를 한 세션으로 연결했습니다.",
    role: "Product · Full-stack · Cloud / 단독 개발",
    proof: "Realtime stream · Session recovery · Cloud Run scaling",
    image: "/project-media/meetsub.webp",
    stack: "Deepgram · Gemini · WebSocket · Cloud Run",
  },
];

const breadthCases = [
  { title: "Local Browser Agent", type: "LOCAL MULTIMODAL", image: "/project-media/local-browser-agent.png", result: "고객 화면을 외부 API로 보내지 않는 Ollama 기반 자율 브라우저 Agent", stack: "Qwen2.5 · LLaVA · Playwright" },
  { title: "Snap-p", type: "CREATIVE AUTOMATION", image: "/project-media/snap-p.webp", result: "상품 분석부터 아마존 리스팅 이미지 9장·카피·정책 검수까지 자동화", stack: "Gemini · Next.js · Prisma" },
  { title: "Exam Forge", type: "DOMAIN MODELING", image: "/project-media/exam-forge.svg", result: "수치·정답·선택지·TikZ 도형이 함께 변하는 수학 문항 생성·편집 PWA", stack: "Next.js · TikZ · KaTeX" },
  { title: "SNS EasyUp", type: "AI PUBLISHING", image: "/project-media/sns-easyup.png", result: "아이디어를 채널별 카피·이미지로 만들고 Meta 예약 발행까지 연결한 운영 실험", stack: "Meta API · Image Generation · Next.js" },
];

// Page order lives in one list so page numbers and the "NN / TOTAL" footer can
// never drift apart when a sheet is added or reordered.
const sheets: ((page: number) => React.ReactNode)[] = [
  (page) => <CoverPage page={page} />,
  (page) => <ProfilePage page={page} />,
  (page) => <CaseSystemPage study={amazonAdsAgent} page={page} />,
  (page) => <CaseDecisionPage study={amazonAdsAgent} page={page} />,
  (page) => <CaseOpsPage study={amazonAdsAgent} page={page} />,
  (page) => <CaseSystemPage study={bidMaster} page={page} />,
  (page) => <CaseDecisionPage study={bidMaster} page={page} />,
  (page) => <CaseOpsPage study={bidMaster} page={page} />,
  (page) => <CaseSystemPage study={byeoljari} page={page} />,
  (page) => <CaseDecisionPage study={byeoljari} page={page} />,
  (page) => <CaseOpsPage study={byeoljari} page={page} />,
  (page) => <PairPage title="데이터 질문과 실시간 회의를 제품 흐름으로 연결합니다." subtitle="Applied AI · Realtime Product" items={compactCases} page={page} />,
  (page) => <CustomerOperationsPage page={page} />,
  (page) => <BreadthPage page={page} />,
  (page) => <FoundationPage page={page} />,
];

const TOTAL_PAGES = sheets.length;

export default function PortfolioPage() {
  return (
    <main className={styles.document}>
      <PrintToolbar className={styles.toolbar} pdfHref="/Kang-Yeonbae-Portfolio.pdf" />
      {sheets.map((sheet, index) => (
        <Fragment key={index}>{sheet(index + 1)}</Fragment>
      ))}
    </main>
  );
}

function CoverPage({ page }: { page: number }) {
  return (
    <section className={`${styles.page} ${styles.cover}`}>
      <PageMark page={page} label="PORTFOLIO 2026" />
      <div className={styles.coverTop}>
        <span className={styles.logo}>KYB</span>
        <div><strong>Kang YeonBae</strong><span>Software Engineer</span></div>
      </div>
      <div className={styles.coverBody}>
        <p className={styles.kicker}>APPLIED AI · BACKEND · PRODUCT</p>
        <h1>복잡한 문제를<br /><em>운영되는 제품</em>으로.</h1>
        <p>AI·백엔드·제품 경험을 연결해 아이디어를 실제 업무와 사용자가 계속 사용할 수 있는 서비스로 만듭니다.</p>
      </div>
      <div className={styles.coverProof}>
        <div><span>OPERATIONS</span><strong>≈40%</strong><p>VOC/CS 업무 절감</p></div>
        <div><span>MODEL</span><strong>99.9%</strong><p>반복 AI 비용 절감</p></div>
        <div><span>DELIVERY</span><strong>{projectCount}</strong><p>선별 프로젝트</p></div>
      </div>
      <div className={styles.contactLine}>
        <a href="mailto:dusqo7951@gmail.com">dusqo7951@gmail.com</a>
        <a href="https://github.com/KangYeonbae">github.com/KangYeonbae</a>
        <a href="https://linkedin.com/in/yeonbae-kang-973436334">LinkedIn</a>
      </div>
    </section>
  );
}

function ProfilePage({ page }: { page: number }) {
  return (
    <section className={styles.page}>
      <PageMark page={page} label="PROFILE" />
      <header className={styles.pageHeader}>
        <p className={styles.kicker}>ENGINEERING PROFILE</p>
        <h2>기능을 구현하는 데서 끝나지 않고,<br />배포 이후의 운영까지 책임집니다.</h2>
      </header>
      <div className={styles.profileGrid}>
        <section>
          <h3>Experience</h3>
          <div className={styles.timeline}>
            <article><time>2025.07 — NOW</time><h4>Hurdlers · AI Engineer</h4><p>광고·커머스·VOC를 위한 AI 제품과 업무 자동화</p></article>
            <article><time>2025.03 — 2025.07</time><h4>Mooker · Backend Lead</h4><p>폐쇄망 DID CMS 백엔드와 미디어 아키텍처</p></article>
            <article><time>2023 — 2024</time><h4>Codelab · SeSac</h4><p>클라우드·AICC·백엔드 집중 과정, 최우수 프로젝트</p></article>
          </div>
        </section>
        <section>
          <h3>How I build</h3>
          <div className={styles.capabilityList}>
            <article><span>01</span><div><h4>문제를 좁힙니다</h4><p>기술보다 먼저 반복 비용과 실패 경계, 실제 사용자를 확인합니다.</p></div></article>
            <article><span>02</span><div><h4>맞는 크기의 기술을 고릅니다</h4><p>규칙·전통 ML·LLM·Agent를 정확도와 비용에 맞춰 조합합니다.</p></div></article>
            <article><span>03</span><div><h4>운영 가능하게 배포합니다</h4><p>로그, 검증, 재시도, 권한과 사람이 개입할 지점을 함께 설계합니다.</p></div></article>
          </div>
        </section>
      </div>
      <div className={styles.projectMap}>
        <h3>Core impact</h3>
        <div><span>PROBLEM</span><strong>반복 광고 분석 · 대량 입찰 탐색 · 복잡한 유료 콘텐츠 경험</strong></div>
        <div><span>MY ROLE</span><strong>문제 정의부터 AI·Backend·Frontend·Cloud 배포까지 직접 책임</strong></div>
        <div><span>RESULT</span><strong>근거 검수 자동화 · 운영 중인 입찰 서비스 · 실결제 B2C 제품</strong></div>
      </div>
      <PageFooter page={page} />
    </section>
  );
}

function CaseSystemPage({ study, page }: { study: CaseStudy; page: number }) {
  return (
    <section className={styles.page}>
      <PageMark page={page} label={study.type} />
      <header className={`${styles.caseHeader} ${styles.caseHeaderWide}`}>
        <div>
          <p className={styles.kicker}>CASE STUDY {study.order} · SYSTEM & SCALE</p>
          <h2>{study.title}</h2>
          <p>{study.thesis}</p>
        </div>
      </header>

      <dl className={styles.caseMeta}>
        <div><dt>PERIOD</dt><dd>{study.period}</dd></div>
        <div><dt>ROLE</dt><dd>{study.role}</dd></div>
        <div><dt>COLLABORATION</dt><dd>{study.collaboration}</dd></div>
        <div><dt>STATUS</dt><dd>{study.status}</dd></div>
      </dl>

      <SectionLabel label="SCALE" note={study.scaleSource} />
      <div className={styles.scaleGrid}>
        {study.scale.map((metric) => (
          <div key={metric.label}>
            <strong>{metric.value}</strong>
            <b>{metric.label}</b>
            {metric.note && <small>{metric.note}</small>}
          </div>
        ))}
      </div>
      <p className={styles.scaleNote}>{study.scaleNote}</p>

      <SectionLabel label="ARCHITECTURE" note={study.architectureNote} />
      <div className={styles.flowDiagram}>
        {study.lanes.map((lane) => <FlowLaneBlock lane={lane} key={lane.name} />)}
      </div>

      <SectionLabel label="RESULT" />
      <div className={styles.outcomeRow}>
        {study.outcomes.map((outcome) => (
          <article key={outcome.label}><span>{outcome.label}</span><p>{outcome.body}</p></article>
        ))}
      </div>

      <div className={styles.caseBottom}>
        <div className={styles.tags}>{study.stack.map((tag) => <span key={tag}>{tag}</span>)}</div>
        {study.link && <a href={study.link.url}>{study.link.label} ↗</a>}
      </div>
      <PageFooter page={page} />
    </section>
  );
}

const nodeKindClass: Record<string, string> = {
  llm: styles.nodeLlm,
  check: styles.nodeCheck,
  store: styles.nodeStore,
  io: "",
};

function FlowNodeRow({ nodes }: { nodes: NonNullable<FlowLane["nodes"]> }) {
  return (
    <div className={styles.flowNodes}>
      {nodes.map((node, index) => (
        <div className={`${styles.flowNode} ${node.kind ? nodeKindClass[node.kind] : ""}`} key={node.title}>
          <div>
            {node.tag && <span className={styles.nodeTag}>{node.tag}</span>}
            <strong>{node.title}</strong>
            {node.detail && <small>{node.detail}</small>}
          </div>
          {index < nodes.length - 1 && <i aria-hidden="true">→</i>}
        </div>
      ))}
    </div>
  );
}

function FlowLaneBlock({ lane }: { lane: FlowLane }) {
  return (
    <div className={styles.flowLane}>
      <div className={styles.flowLaneHead}>
        <strong>{lane.name}</strong>
        {lane.caption && <span>{lane.caption}</span>}
      </div>

      {lane.nodes && <FlowNodeRow nodes={lane.nodes} />}

      {lane.split && (
        <div className={styles.flowSplit}>
          <p className={styles.splitCondition}>{lane.split.condition}</p>
          {lane.split.paths.map((path) => (
            <div className={styles.splitPath} key={path.label}>
              <div className={styles.splitLabel}>
                <strong>{path.label}</strong>
                {path.weight && <span>{path.weight}</span>}
              </div>
              <FlowNodeRow nodes={path.nodes} />
            </div>
          ))}
        </div>
      )}

      {lane.loop && <p className={styles.flowLoop}>{lane.loop}</p>}
    </div>
  );
}

function CaseDecisionPage({ study, page }: { study: CaseStudy; page: number }) {
  return (
    <section className={styles.page}>
      <PageMark page={page} label={`${study.title.toUpperCase()} · DECISIONS`} />
      <header className={`${styles.pageHeader} ${styles.pageHeaderTight}`}>
        <p className={styles.kicker}>ENGINEERING DECISIONS</p>
        <h2>무엇을 고르지 않았는지가<br />설계를 설명합니다.</h2>
      </header>

      <div className={styles.decisionStack} style={{ marginTop: "5mm" }}>
        {study.decisions.map((decision) => (
          <article className={styles.decisionCard} key={decision.index}>
            <span>{decision.index}</span>
            <div>
              <h3>{decision.title}</h3>
              <div className={styles.decisionRow}><b>검토</b><p>{decision.considered}</p></div>
              <div className={styles.decisionRow}><b>문제</b><p>{decision.problem}</p></div>
              <div className={styles.decisionRow}><b>결정</b><p>{decision.decision}</p></div>
              {decision.kept && <div className={styles.decisionRow}><b>결과</b><p>{decision.kept}</p></div>}
              {decision.debt && <div className={styles.decisionRow}><b>남은 부채</b><p className={styles.debtNote}>{decision.debt}</p></div>}
              <p className={styles.decisionTakeaway}>{decision.takeaway}</p>
            </div>
          </article>
        ))}
      </div>

      {study.codeQuote && (
        <div className={styles.quoteBlock}>
          <p>{study.codeQuote.code}</p>
          <cite>{study.codeQuote.cite}</cite>
        </div>
      )}

      <PageFooter page={page} />
    </section>
  );
}

function CaseOpsPage({ study, page }: { study: CaseStudy; page: number }) {
  const { troubleshooting: trouble, collaboration_detail: collab } = study;
  return (
    <section className={styles.page}>
      <PageMark page={page} label={`${study.title.toUpperCase()} · OPERATIONS`} />
      <header className={`${styles.pageHeader} ${styles.pageHeaderTight}`}>
        <p className={styles.kicker}>TROUBLESHOOTING &amp; COLLABORATION</p>
        <h2>무엇이 깨졌고,<br />누구와 무엇을 합의했는지.</h2>
      </header>

      <SectionLabel label="TROUBLESHOOTING" note="가장 오래 붙잡은 문제" />
      <div className={styles.troubleGrid}>
        <div className={styles.troubleMain}>
          <h3>{trouble.headline}</h3>
          <p className={styles.troubleEvidence}>{trouble.evidence}</p>
          <div className={styles.incidentCard}>
            <b>{trouble.incident.when}</b>
            <div className={styles.incidentRow}><span>증상</span><p>{trouble.incident.report}</p></div>
            <div className={styles.incidentRow}><span>대응</span><p>{trouble.incident.fix}</p></div>
          </div>
          <p className={styles.residueNote}>{trouble.residue}</p>
        </div>

        <div className={styles.troubleSide}>
          <h3>{trouble.secondary.headline}</h3>
          <p className={styles.contextNote}>{trouble.secondary.context}</p>
          <div className={styles.errorTable}>
            {trouble.secondary.rows.map((row) => (
              <div key={row.label}><span>{row.label}</span><b>{row.value}</b></div>
            ))}
          </div>
          <p className={styles.resolutionNote}>{trouble.secondary.resolution}</p>
        </div>
      </div>

      <SectionLabel label={collab.label ?? "COLLABORATION"} note={collab.note ?? "요구를 수용 기준으로 번역하기"} />
      <p className={styles.collabSetting}>{collab.setting}</p>
      <div className={styles.collabTable}>
        <div className={styles.collabHead}>
          <span>{collab.headers?.[0] ?? "클라이언트가 말한 것"}</span>
          <span>{collab.headers?.[1] ?? "내가 설계로 옮긴 것"}</span>
        </div>
        {collab.translations.map((row) => (
          <div className={styles.collabRow} key={row.heard}>
            <p className={styles.collabHeard}>{row.heard}</p>
            <p className={styles.collabDelivered}>{row.delivered}</p>
          </div>
        ))}
      </div>
      <div className={styles.collabBoundary}>
        <strong>{collab.boundary.title}</strong>
        <p>{collab.boundary.body}</p>
      </div>
      <PageFooter page={page} />
    </section>
  );
}

function SectionLabel({ label, note }: { label: string; note?: string }) {
  return <div className={styles.sectionLabel}><strong>{label}</strong><span /> {note && <small>{note}</small>}</div>;
}

function PairPage({ title, subtitle, items, page }: { title: string; subtitle: string; items: CompactCase[]; page: number }) {
  return (
    <section className={styles.page}>
      <PageMark page={page} label={subtitle} />
      <header className={styles.pageHeader}><p className={styles.kicker}>ROLE-SPECIFIC EVIDENCE</p><h2>{title}</h2></header>
      <div className={styles.pairGrid}>
        {items.map((item) => {
          const detail = projectDetails[item.id];
          return <article className={styles.pairCard} key={item.id}>
            <header><span>{item.type}</span><h3>{item.title}</h3><p>{item.copy}</p></header>
            <figure><Image src={item.image} alt={`${item.title} 화면`} fill sizes="85mm" /></figure>
            <PrintArchitecture steps={detail.architecture} signals={detail.signals.slice(0, 3)} compact />
            <div className={styles.pairMeta}><div><span>MY ROLE</span><strong>{item.role}</strong></div><div><span>RESULT</span><strong>{item.proof}</strong></div></div>
            <div className={styles.pairStack}>{item.stack}</div>
          </article>;
        })}
      </div>
      <PageFooter page={page} />
    </section>
  );
}

function CustomerOperationsPage({ page }: { page: number }) {
  return (
    <section className={styles.page}>
      <PageMark page={page} label="CUSTOMER OPERATIONS AI" />
      <header className={styles.pageHeader}>
        <p className={styles.kicker}>ONE CLIENT · TWO OPERATIONAL PROBLEMS</p>
        <h2>상담 정리와 리뷰 판독을 연결해<br />CS 운영 비용을 함께 줄였습니다.</h2>
      </header>

      <div className={styles.operationsSummary}>
        <article><span>PROBLEM</span><p>같은 고객사에서 상담 기록과 상품 리뷰가 빠르게 쌓였고, 사람이 다시 읽어 정리하는 반복 업무와 범용 AI API 비용이 함께 증가했습니다.</p></article>
        <article><span>MY ROLE</span><p>두 제품 모두 요구 분석, 기획, 설계, 개발, 패키징과 배포까지 전 과정을 단독으로 담당했습니다.</p></article>
        <article><span>RESULT</span><p>VOC/CS 반복 업무 약 40% 절감. 리뷰 분류는 월 10만 건 동일 처리량 기준 월 약 80만원에서 약 1천원으로 비용을 낮추도록 설계했습니다.</p></article>
      </div>

      <div className={styles.operationsProducts}>
        <article>
          <header><span>01 · LLM OPERATIONS</span><h3>VOC Counseling Analyzer</h3><p>채널톡 상담을 수집해 LLM으로 요약·항목화하고 Google Sheets 리포트까지 자동 생성했습니다.</p></header>
          <figure><Image src="/project-media/voc-collector.webp" alt="VOC 상담 분석기 실행 화면" fill sizes="85mm" /></figure>
          <PrintArchitecture steps={["ChannelTalk", "Conversation extract", "LLM summary", "Structured fields", "Google Sheets"]} signals={["Desktop package", "Manual review", "Batch workflow"]} compact />
          <footer><strong>성과 · VOC/CS 반복 업무 약 40% 절감</strong><span>OpenAI · ChannelTalk API · Streamlit · PyInstaller</span></footer>
        </article>
        <article>
          <header><span>02 · RIGHT-SIZED MODEL</span><h3>Review Sentiment Classifier</h3><p>AI-Hub 데이터로 TF-IDF·Linear SVM 기반 경량 NLP 모델을 직접 학습하고, 리뷰 수집·판독·부정 리뷰 알림을 연결했습니다.</p></header>
          <div className={styles.operationsMetric}><strong>99.9%</strong><span>동일 처리량 기준 추정 비용 절감</span><p>월 10만 건: 약 80만원 → 약 1천원</p></div>
          <PrintArchitecture steps={["Cafe24 reviews", "Clean / Label", "TF-IDF", "Linear SVM", "Negative alert"]} signals={["Self-trained model", "No per-request LLM", "Flask API"]} compact />
          <footer><strong>성과 · 반복 분류의 외부 API 의존과 비용 축소</strong><span>scikit-learn · TF-IDF · Linear SVM · Flask</span></footer>
        </article>
      </div>
      <PageFooter page={page} />
    </section>
  );
}

function BreadthPage({ page }: { page: number }) {
  return (
    <section className={styles.page}>
      <PageMark page={page} label="ADDITIONAL WORK" />
      <header className={styles.pageHeader}><p className={styles.kicker}>PRODUCT BREADTH</p><h2>도메인이 달라도,<br />문제를 제품으로 끝까지 연결합니다.</h2></header>
      <div className={styles.breadthGrid}>
        {breadthCases.map((item) => <article key={item.title}>
          <figure><Image src={item.image} alt={`${item.title} 화면`} fill sizes="85mm" /></figure>
          <span>{item.type}</span><h3>{item.title}</h3><p>{item.result}</p><small>{item.stack}</small>
        </article>)}
      </div>
      <PageFooter page={page} />
    </section>
  );
}

function FoundationPage({ page }: { page: number }) {
  return (
    <section className={`${styles.page} ${styles.foundation}`}>
      <PageMark page={page} label="FOUNDATION & CONTACT" />
      <header className={styles.pageHeader}><p className={styles.kicker}>STUDENT FOUNDATION</p><h2>팀 프로젝트에서 시작해,<br />운영 제품을 만드는 엔지니어로.</h2></header>
      <div className={styles.foundationGrid}>
        <FoundationCase title="Echo Recycle Hub" role="Architecture · Backend · ML / 기여도 50%" image="/project-media/echo-recycle-hub.webp" copy="폐기물 이미지 분류를 배출 방법·재활용 추천·챗봇·음성 상담까지 연결한 AICC 서비스." href="https://github.com/KangYeonbae/Project1_3" />
        <FoundationCase title="SpacePlace.store" role="Frontend · API / 기여도 35%" image="/project-media/spaceplace-system.webp" copy="공간 검색과 예약을 서비스 경계로 나누고 API 계약과 통합 비용을 경험한 MSA 팀 프로젝트." href="https://github.com/orgs/Spaces-Place/repositories" />
      </div>
      <div className={styles.closing}>
        <div><p className={styles.kicker}>LET&apos;S WORK TOGETHER</p><h3>문제를 발견하고,<br />작동하는 제품으로 만들겠습니다.</h3></div>
        <div className={styles.closingLinks}>
          <a href="mailto:dusqo7951@gmail.com"><span>EMAIL</span><strong>dusqo7951@gmail.com</strong></a>
          <a href="https://github.com/KangYeonbae"><span>GITHUB</span><strong>github.com/KangYeonbae</strong></a>
          <a href="https://linkedin.com/in/yeonbae-kang-973436334"><span>LINKEDIN</span><strong>yeonbae-kang-973436334</strong></a>
          <Link href="/projects"><span>WEB ARCHIVE</span><strong>{projectCount} selected projects</strong></Link>
        </div>
      </div>
      <PageFooter page={page} />
    </section>
  );
}

function FoundationCase({ title, role, image, copy, href }: { title: string; role: string; image: string; copy: string; href: string }) {
  return <article><figure><Image src={image} alt={`${title} 대표 화면`} fill sizes="85mm" /></figure><h3>{title}</h3><p>{copy}</p><span>{role}</span><a href={href}>GITHUB ↗</a></article>;
}

function PrintArchitecture({ steps, signals, compact = false }: { steps: string[]; signals: string[]; compact?: boolean }) {
  return <div className={`${styles.architecture} ${compact ? styles.architectureCompact : ""}`}>
    <header><span>SYSTEM FLOW</span><span>INPUT → RESULT</span></header>
    <div className={styles.architectureSteps}>{steps.map((step, index) => <div className={styles.architectureStep} key={step}><div><small>{String(index + 1).padStart(2, "0")}</small><strong>{step}</strong></div>{index < steps.length - 1 && <i>→</i>}</div>)}</div>
    <footer>{signals.map((signal) => <span key={signal}>{signal}</span>)}</footer>
  </div>;
}

function PageMark({ page, label }: { page: number; label: string }) {
  return <div className={styles.pageMark}><span>{String(page).padStart(2, "0")}</span><strong>{label}</strong></div>;
}

function PageFooter({ page }: { page: number }) {
  return <footer className={styles.pageFooter}><span>KANG YEONBAE · SOFTWARE ENGINEER</span><span>{String(page).padStart(2, "0")} / {String(TOTAL_PAGES).padStart(2, "0")}</span></footer>;
}
