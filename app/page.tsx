import Image from "next/image";
import Link from "next/link";
import { ArchitectureDiagram } from "@/components/architecture-diagram";
import { ArrowRight, ArrowUpRight } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { projectCount } from "@/data/projects";
import { listPosts, type Post } from "@/lib/content-store";

export const dynamic = "force-dynamic";

type FeaturedCase = {
  id: string;
  type: string;
  title: string;
  thesis: string;
  description: string;
  role: string;
  result: string;
  stack: string[];
  flow: string[];
  signals: string[];
  href: string;
  image: string;
  imageFit?: "cover" | "contain";
  externalUrl?: string;
  externalLabel?: string;
};

const cases: FeaturedCase[] = [
  {
    id: "amazon-ads-agent",
    type: "AI AGENT · AD TECH",
    title: "Amazon Ads Reporting Agent",
    thesis: "매일 반복되던 광고 분석을, 근거를 검수하는 Agent 시스템으로.",
    description:
      "광고·매출 데이터를 모으는 데서 끝내지 않고 생성 Agent와 검수 Agent를 분리했습니다. 숫자 근거, 시각화, 최종 리포트가 하나의 추적 가능한 파이프라인에서 만들어집니다.",
    role: "기획부터 배포·운영까지 단독 개발",
    result: "일일 수집 → 분석 → 검수 → 리포트 자동화",
    stack: ["Google ADK", "Gemini", "BigQuery", "Amazon APIs", "Cloud Tasks"],
    flow: ["SP / Ads API", "BigQuery", "Generator", "Verifier", "Report"],
    signals: ["Idempotent ingestion", "Retry queue", "Evidence check"],
    image: "/project-media/amazon-reporting.png",
    imageFit: "contain",
    href: "/projects/amazon-ads-agent",
    externalUrl: "https://www.donga.com/news/Economy/article/all/20260622/134158095/1",
    externalLabel: "Press",
  },
  {
    id: "bid-master",
    type: "BACKEND · WORKFLOW AUTOMATION",
    title: "Bid Master",
    thesis: "흩어진 학교급식 입찰 정보를, 수익성 있는 맞춤 공고로.",
    description:
      "입찰 공고와 현품설명서를 수집해 제각각인 품목·지역 코드를 정규화하고, 사업 규칙에 맞는 공고만 판별해 이메일로 전달합니다. 크롤링보다 변경과 중복, 실패 복구를 먼저 설계한 운영 서비스입니다.",
    role: "화면·제품 흐름 설계 · Full-stack · 배포 / 단독 개발",
    result: "공고 수집부터 수익성 판별·알림까지 운영 중",
    stack: ["FastAPI", "SQLAlchemy", "Playwright", "Next.js", "PostgreSQL"],
    flow: ["Tender source", "Crawler / Parser", "Normalized items", "Profitability rule", "Email alert"],
    signals: ["Change detection", "Code normalization", "Deduplication"],
    image: "/project-media/bid-master.webp",
    imageFit: "contain",
    href: "/projects/bid-master",
    externalUrl: "https://bid-master.co.kr",
    externalLabel: "Live site",
  },
  {
    id: "byeoljari",
    type: "B2C PRODUCT · SOLO",
    title: "Byeoljari.com",
    thesis: "복잡한 계산, AI 해석, 결제를 하나의 신뢰 가능한 사용자 여정으로.",
    description:
      "사주·점성술 도메인 계산을 Python 서비스로 분리하고, 결제 검증 후 AI 해석을 스트리밍합니다. 콘텐츠와 운영 도구까지 직접 설계한 유료 B2C 제품입니다.",
    role: "Product · Design · Frontend · Backend · Infra",
    result: "실결제·광고 집행·콘텐츠 운영 중",
    stack: ["Next.js", "FastAPI", "PortOne", "Supabase", "Vercel"],
    flow: ["Birth data", "Domain engine", "Payment verify", "AI stream", "Archive"],
    signals: ["Server-side calculation", "Payment verification", "Streaming recovery"],
    image: "/project-media/byeoljari.png",
    imageFit: "contain",
    href: "/projects/byeoljari",
    externalUrl: "https://byeoljari.com",
    externalLabel: "Live site",
  },
];

const roleEvidence = [
  {
    role: "APPLIED AI",
    title: "BigQuery AI Analyst",
    proof: "RAG · Text-to-SQL · SQL safety gate · recovery loop",
    detail: "질문에서 실행 가능한 SQL과 비즈니스 인사이트까지 연결",
    href: "/projects/text-to-sql",
  },
  {
    role: "CUSTOMER OPERATIONS AI",
    title: "VOC & Review Automation",
    proof: "업무 약 40% 절감 · 분류 비용 99.9% 절감 추정",
    detail: "같은 고객사의 상담 요약과 리뷰 판독·알림을 연속해서 개선",
    href: "/projects/voc-analyzer",
  },
  {
    role: "REAL-TIME PRODUCT",
    title: "MeetSub",
    proof: "WebSocket · Deepgram STT · Cloud Run",
    detail: "실시간 번역 자막부터 회의 기록과 PDF 리포트까지",
    href: "/projects/meetsub",
  },
  {
    role: "LOCAL MULTIMODAL AI",
    title: "Local Browser Agent",
    proof: "Ollama · Qwen2.5 · LLaVA · Playwright",
    detail: "고객 화면을 외부 AI API로 보내지 않는 자율 브라우저 Agent",
    href: "/projects/local-browser-agent",
  },
];

async function latestNotes() {
  try {
    return (await listPosts()).slice(0, 2);
  } catch {
    return [] as Post[];
  }
}

export default async function Home() {
  const notes = await latestNotes();

  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero shell">
          <div className="hero-copy">
            <p className="overline"><span /> SOFTWARE ENGINEER / APPLIED AI · BACKEND · PRODUCT</p>
            <h1>복잡한 문제를<br /><em>운영되는 제품</em>으로.</h1>
            <p className="hero-lead">
              안녕하세요, 강연배입니다. AI·백엔드·제품 경험을 연결해 아이디어를 실제 업무와 사용자가
              <strong> 계속 사용할 수 있는 서비스</strong>로 만듭니다.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#work">대표 작업 보기 <ArrowRight /></a>
              <Link className="button button-ghost" href="/portfolio">포트폴리오 문서 <ArrowUpRight /></Link>
            </div>
          </div>

          <aside className="hero-aside" aria-label="엔지니어링 프로필">
            <p className="aside-label">ENGINEERING PROFILE</p>
            <p className="aside-note">기능 구현에 그치지 않고,<br />운영과 실패 이후까지 설계합니다.</p>
            <dl>
              <div><dt>METHOD</dt><dd>Evidence-first<br />Right-sized AI</dd></div>
              <div><dt>BUILD</dt><dd>Agent · Backend · Product</dd></div>
              <div><dt>SHIP</dt><dd>Cloud · Monitoring · Recovery</dd></div>
            </dl>
            <p className="aside-proof">Evidence before generation<br />Recovery by design</p>
          </aside>
        </section>

        <section className="impact-strip" aria-label="주요 성과">
          <div className="shell impact-grid">
            <div><span>OPERATIONS</span><strong>≈40% 업무 절감</strong><small>VOC/CS 사내 측정 기준</small></div>
            <div><span>MODEL</span><strong>99.9% 비용 절감</strong><small>월 80만원 → 1천원</small></div>
            <div><span>DELIVERY</span><strong>기획부터 운영까지</strong><small>제품 전체를 잇는 실행력</small></div>
            <div><span>ARCHIVE</span><strong>{projectCount}개 선별 사례</strong><small>실무 · 제품 · Lab · 학생</small></div>
          </div>
        </section>

        <section className="selected-work section shell" id="work">
          <div className="section-heading">
            <div><p className="overline"><span /> SELECTED WORK</p><h2>세 가지 사례로<br />어떻게 만드는지 보여드립니다.</h2></div>
            <p>AI Agent, 업무 자동화, 유료 B2C 제품을 통해 문제 정의부터 구조 설계와 운영까지의 판단을 보여드립니다.</p>
          </div>

          <div className="case-list">
            {cases.map((item) => (
              <article className="case-card" key={item.id}>
                <div className="case-head"><span>CASE STUDY</span><span>{item.type}</span></div>
                <div className="case-grid">
                  <div className="case-copy">
                    <h3>{item.title}</h3>
                    <p className="case-thesis">{item.thesis}</p>
                    <p className="case-description">{item.description}</p>
                    <dl>
                      <div><dt>ROLE</dt><dd>{item.role}</dd></div>
                      <div><dt>OUTCOME</dt><dd>{item.result}</dd></div>
                    </dl>
                    <div className="case-tags">{item.stack.map((tag) => <span key={tag}>{tag}</span>)}</div>
                    <div className="case-links">
                      <Link className="case-link" href={item.href}>View case <ArrowUpRight /></Link>
                      {item.externalUrl && <a className="case-link case-link-live" href={item.externalUrl} target="_blank" rel="noreferrer">{item.externalLabel} <ArrowUpRight /></a>}
                    </div>
                  </div>
                  <div className="case-technical">
                    <figure className="case-visual">
                      <figcaption><span>PRODUCT VIEW</span><span>SYSTEM CAPTURE</span></figcaption>
                      <div className={`case-image image-${item.imageFit}`}>
                        <Image src={item.image} alt={`${item.title} 제품 이미지`} fill sizes="(max-width: 920px) 100vw, 420px" />
                      </div>
                    </figure>
                    <ArchitectureDiagram steps={item.flow} signals={item.signals} />
                  </div>
                </div>
              </article>
            ))}
          </div>

          <section className="role-evidence" aria-labelledby="role-evidence-title">
            <div className="role-evidence-heading">
              <div>
                <p className="overline"><span /> ROLE-SPECIFIC EVIDENCE</p>
                <h2 id="role-evidence-title">포지션에 따라<br />더 깊게 볼 기술 증거.</h2>
              </div>
              <p>대표 사례를 보완하는 Applied AI, 모델 효율화, 실시간 제품, 백엔드 아키텍처 경험입니다.</p>
            </div>
            <div className="evidence-list">
              {roleEvidence.map((item) => (
                <Link href={item.href} className="evidence-row" key={item.title}>
                  <span>{item.role}</span>
                  <div><h3>{item.title}</h3><p>{item.detail}</p></div>
                  <strong>{item.proof}</strong>
                  <ArrowUpRight />
                </Link>
              ))}
            </div>
          </section>

          <Link href="/projects" className="all-work-link">전체 프로젝트 아카이브 <span>{projectCount}</span><ArrowRight /></Link>
        </section>

        <section className="about-section section" id="about">
          <div className="shell about-grid">
            <div className="about-intro">
              <p className="overline"><span /> ABOUT</p>
              <h2>제품의 처음과 끝을<br />함께 보는 엔지니어.</h2>
              <p>Interior Architecture에서 공간의 동선과 구조를 배웠고, 지금은 디지털 제품의 흐름과 경계를 설계합니다. 낯선 도메인을 빠르게 이해하고 실제로 작동하는 시스템으로 바꾸는 일을 좋아합니다.</p>
            </div>
            <div className="timeline">
              <div><span>2025.07 — NOW</span><h3>Hurdlers · AI Engineer</h3><p>광고·커머스·VOC를 위한 AI 제품과 운영 자동화</p></div>
              <div><span>2025.03 — 2025.07</span><h3>Mooker · Backend Lead</h3><p>폐쇄망 DID CMS 백엔드와 미디어 아키텍처</p></div>
              <div><span>2023 — 2024</span><h3>Codelab · SeSac</h3><p>클라우드, AICC, 백엔드 집중 과정 · 최우수 프로젝트</p></div>
              <div><span>2012 — 2016</span><h3>Interior Architecture &amp; Energy</h3><p>용인송담대학교</p></div>
            </div>
          </div>
        </section>

        <section className="notes-preview section shell">
          <div className="section-heading">
            <div><p className="overline"><span /> NOTES &amp; LOG</p><h2>만들며 알게 된 것을<br />기록합니다.</h2></div>
            <Link href="/notes">모든 글 보기 <ArrowRight /></Link>
          </div>
          {notes.length ? (
            <div className="note-grid">
              {notes.map((note) => (
                <Link href={`/notes/${note.slug}`} className="note-card" key={note.id}>
                  <span>{formatDate(note.publishedAt ?? note.createdAt)}</span>
                  <h3>{note.title}</h3><p>{note.excerpt}</p><ArrowUpRight />
                </Link>
              ))}
            </div>
          ) : (
            <div className="notes-empty"><span>FIELD NOTES / 000</span><h3>첫 번째 기록을 준비하고 있습니다.</h3><p>제품 설계, AI 운영, 실패와 개선에 관한 글이 이곳에 쌓입니다.</p><Link href="/studio">Studio에서 글쓰기 <ArrowUpRight /></Link></div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}
