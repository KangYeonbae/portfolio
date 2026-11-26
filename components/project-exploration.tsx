"use client";

import { Component, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { projects } from "@/data/projects";
import styles from "./experience.module.css";

const ModernScene = dynamic(() => import("./modern-gallery-scene"), { ssr: false });
// Hallwyl museum is kept for later but hidden; load its viewer only when that scene is opened.
const MuseumViewer = dynamic(() => import("./museum-viewer").then((module) => module.MuseumViewer), { ssr: false });
const DubbyRoom = dynamic(() => import("./dubby-room").then((module) => module.DubbyRoom), { loading: RoomLoading });
const ByeoljariRoom = dynamic(() => import("./byeoljari-room").then((module) => module.ByeoljariRoom), { loading: RoomLoading });
// Each modern-gallery project opens its own room.
const customRooms = {
  "amazon-ads-agent": dynamic(() => import("./report-room"), { loading: RoomLoading }),
  "exam-forge": dynamic(() => import("./exam-room"), { loading: RoomLoading }),
  "snap-p": dynamic(() => import("./studio-room"), { loading: RoomLoading }),
  "bid-master": dynamic(() => import("./bid-room"), { loading: RoomLoading }),
  "voc-analyzer": dynamic(() => import("./voc-room"), { loading: RoomLoading }),
  "local-browser-agent": dynamic(() => import("./agent-room"), { loading: RoomLoading }),
};
const museumPage = "https://hallwylskamuseet.se/en/visit-us/visit-at-your-own-pace/the-great-drawing-room/";
const modernGallerySource = "https://sketchfab.com/3d-models/art-gallery-720b507d814740278c713d100def4c99";
const walkerSource = "https://sketchfab.com/3d-models/nathan-animated-003-walking-3d-man-143a2b1ea5eb4385ae90a73657aca3bc";

function RoomLoading() {
  return <div className={styles.roomContent}>
    <form method="dialog"><button type="submit" autoFocus>← 전시관으로 돌아가기</button></form>
    <p id="project-preview-title" role="status">전시실을 여는 중입니다.</p>
  </div>;
}

class SceneBoundary extends Component<{ children: ReactNode; onError?: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError?.();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const answers = ["광고비는 $1,200입니다.", "매출은 $3,600입니다.", "전환 수는 18건입니다."];
function ReportDemo() {
 const [selected, setSelected] = useState<number | null>(null);
 const [checked, setChecked] = useState(false);
 return <div className={styles.demo}><div className={styles.demoHead}><span>INTERACTIVE / SAMPLE DATA</span><span>FACT CHECK</span></div><h3>리포트의 오류를 찾아보세요</h3><p>원본 표와 다른 숫자가 들어간 문장을 선택해 주세요.</p><div className={styles.table}><span>광고비 <b>$1,200</b></span><span>매출 <b>$3,200</b></span><span>전환 <b>18건</b></span></div><div className={styles.options}>{answers.map((answer, i) => <button type="button" key={answer} aria-pressed={selected === i} className={selected === i ? styles.selected : ""} onClick={() => { setSelected(i); setChecked(false); }}><span>{String(i + 1).padStart(2, "0")}</span>{answer}</button>)}</div><div className={styles.demoActions}><button type="button" onClick={() => setChecked(true)}>검증 실행</button><button type="button" onClick={() => { setSelected(null); setChecked(false); }}>초기화</button></div><p className={styles.feedback} aria-live="polite">{checked ? selected === null ? "먼저 문장을 선택해 주세요." : selected === 1 ? "정답입니다. 원본 매출은 $3,200인데 문장에는 $3,600으로 적혀 있습니다." : "이 문장은 원본과 일치합니다. 다른 문장도 확인해 보세요." : "실제 고객 데이터가 아닌 체험용 샘플입니다."}</p></div>;
}
const galleryStories = [
 { id: "amazon-ads-agent", name: "Amazon Ads Reporting Agent", label: "AI REPORTING / TRUST", title: "생성보다 중요한\n검증의 순간.", text: "AI가 리포트를 작성하고, 코드는 원본 데이터와 숫자를 대조합니다. 신뢰할 수 있는 결과를 만들기 위해 역할을 분리했습니다.", tags: "LLM GENERATION / PYTHON VALIDATION", media: "/project-media/amazon-reporting.png" },
 { id: "bid-master", name: "Bid Master", label: "WORKFLOW / AUTOMATION", title: "몇 시간의 반복을\n하나의 흐름으로.", text: "흩어진 입찰 공고와 문서를 모으고 품목을 정리해, 사용자가 판단에 집중할 수 있도록 만들었습니다.", tags: "COLLECT / MATCH / DECIDE", media: "/project-media/bid-master.webp" },
 { id: "byeoljari", name: "Byeoljari.com", label: "PRODUCT / DELIVERY", title: "결제 이후까지\n제품의 경험이니까.", text: "계산과 AI 해석을 분리하고, 결제한 사용자가 끝내 결과를 받는 것까지 하나의 경험으로 설계했습니다.", tags: "CALCULATE / VERIFY / DELIVER", media: "/project-media/byeoljari.png" },
 { id: "dubby", name: "Dubby", label: "SOCIAL / MESSENGER", title: "대화하다가\n같이 게임하는 곳.", text: "1:1과 그룹 채팅, 스토리, 투표, 카드게임을 한 앱에 담은 소셜 메신저입니다.", tags: "FLUTTER / FIREBASE / REALTIME", media: "/project-media/dubby.jpg" },
] as const;

function portfolioStory<const Id extends string>(id: Id, media: string) {
  const project = projects.find((item) => item.id === id);
  return {
    id, media, name: project?.title ?? id, label: project?.eyebrow ?? "",
    title: project?.title ?? id, text: project?.summary ?? "", tags: project?.tags.join(" / ") ?? "",
  };
}

const modernStories = [
  galleryStories[2],
  {
    id: "local-browser-agent",
    name: "Local Browser Agent",
    label: "LOCAL AI / BROWSER AUTOMATION",
    title: "브라우저에서 이어지는\n로컬 AI.",
    text: "로컬 AI가 자연어 요청을 실행 순서로 바꾸고, 웹 화면과 DOM을 함께 읽어 결과를 확인하는 브라우저 자동화 프로토타입입니다.",
    tags: "OLLAMA / LANGGRAPH / PLAYWRIGHT",
    media: "/project-media/local-browser-agent.png",
  },
  galleryStories[1],
  galleryStories[0],
  galleryStories[3],
  portfolioStory("snap-p", "/project-media/snap-p.webp"),
  portfolioStory("voc-analyzer", "/project-media/voc-collector.webp"),
  portfolioStory("exam-forge", "/project-media/exam-forge.webp"),
] as const;
const modernGalleryImages = modernStories.map((story) => story.media);

const rooms = {
  "amazon-ads-agent": { theme: "control", name: "데이터 관제실", action: "리포트 검증 체험" },
  "bid-master": { theme: "dispatch", name: "물류 작업장" },
  byeoljari: { theme: "observatory", name: "별자리 관측실" },
  dubby: { theme: "dubby", name: "Dubby 라운지" },
  "local-browser-agent": { theme: "control", name: "로컬 AI 작업실" },
  "snap-p": { theme: "control", name: "상품 콘텐츠 제작" },
  "voc-analyzer": { theme: "control", name: "상담 데이터 분석" },
  "exam-forge": { theme: "control", name: "수학 문항 제작" },
} as const;

export function ProjectExploration({ scene = "modern" }: { scene?: "museum" | "modern" }) {
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(true);
  const [selected, setSelected] = useState(0);
  const [roomOpen, setRoomOpen] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);
  const [modernExhibit, setModernExhibit] = useState(0);
  const [exhibitRequest, setExhibitRequest] = useState<{ index: number } | null>(null);
  const [museumViewerOpen, setMuseumViewerOpen] = useState(false);
  const [galleryVisible, setGalleryVisible] = useState(true);
  const stage = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const marker = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const museum = scene === "museum";
  const modern = scene === "modern";
  const stories = modern ? modernStories : galleryStories;
  const lastStop = stories.length - 1;
  const active = modern ? modernExhibit : Math.round(progress * lastStop);
  const exhibit = stories[active];
  const preview = stories[selected];
  const room = rooms[preview.id];
  const CustomRoom = modern ? customRooms[preview.id as keyof typeof customRooms] : undefined;
  const onSceneReady = useCallback(() => setSceneReady(true), []);
  const scenePaused = roomOpen || !galleryVisible;
  // Not tied to "reduced": that starts true until the media query is read, which would flash a sharp poster.
  const sceneLoading = !sceneReady && !sceneFailed;

  useLayoutEffect(() => {
    const element = dialog.current;
    if (roomOpen && element && !element.open) element.showModal();
  }, [roomOpen]);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    let inView = true;
    const update = () => setGalleryVisible(inView && document.visibilityState === "visible");
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const element = stage.current;
        if (!element || !viewport.current) return;
        const rect = element.getBoundingClientRect();
        const distance = rect.height - viewport.current.offsetHeight;
        setProgress(Math.max(0, Math.min(1, -rect.top / Math.max(1, distance))));
      });
    };
    const syncMotion = () => {
      // The modern gallery is the content itself, so it loads in 3D even with reduced motion on.
      setReduced(!modern && motion.matches);
      if (!modern) update();
    };
    // Settle on an exhibit after each scroll gesture, moving one stop in the scroll direction.
    let resting = 0;
    const settle = () => {
      const element = stage.current;
      if (!element || !viewport.current) return;
      const distance = element.offsetHeight - viewport.current.offsetHeight;
      const raw = -element.getBoundingClientRect().top / Math.max(1, distance);
      if (raw <= 0 || raw >= 1) return; // outside the gallery: leave normal page scrolling alone
      const position = raw * lastStop;
      if (Math.abs(position - Math.round(position)) < .02) {
        resting = Math.round(position);
        return;
      }
      resting = position > resting ? Math.ceil(position) : Math.floor(position);
      window.scrollTo({
        top: element.getBoundingClientRect().top + window.scrollY + distance * resting / lastStop,
        behavior: motion.matches ? "instant" : "smooth",
      });
    };
    syncMotion();
    motion.addEventListener("change", syncMotion);
    if (modern) return () => motion.removeEventListener("change", syncMotion);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("scrollend", settle);
    window.addEventListener("resize", update);
    return () => {
      motion.removeEventListener("change", syncMotion);
      window.removeEventListener("scroll", update);
      window.removeEventListener("scrollend", settle);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(frame);
    };
  }, [lastStop, modern]);

  function goToExhibit(index: number) {
    if (modern) {
      if (reduced || !sceneReady) setModernExhibit(index);
      else setExhibitRequest({ index });
      return;
    }
    const section = stage.current;
    if (!section || !viewport.current) return;
    const start = section.getBoundingClientRect().top + window.scrollY;
    const distance = section.offsetHeight - viewport.current.offsetHeight;
    window.scrollTo({
      top: start + distance * index / lastStop,
      behavior: reduced ? "instant" : "smooth",
    });
  }

  function openPreview(index: number) {
    marker.current?.focus({ preventScroll: true });
    setSelected(index);
    setRoomOpen(true);
  }

  return <main className={styles.exploration}>
    <header className={styles.exploreNav} data-scene={scene}>
      <Link href="/">홈으로 돌아가기</Link>
      {!modern && <Link href="/explore" prefetch={false}>모던 갤러리</Link>}
      {/* 할빌 박물관은 코드만 남겨 둠(/explore?scene=museum). 다시 보이려면 아래 줄 주석 해제
      {modern && <Link href="/explore?scene=museum" prefetch={false}>할빌 박물관</Link>} */}
      {!modern && <Link href="/projects">전체 프로젝트 보기</Link>}
    </header>
    <div ref={stage} id="work" className={styles.galleryTrack} data-scene={scene}>
      <div ref={viewport} className={styles.galleryViewport} data-scene={scene}>
        {modern && (
          <picture className={styles.galleryPoster} data-loading={sceneLoading}>
            <source media="(max-aspect-ratio: 4/5)" srcSet="/project-media/modern-gallery-poster-portrait.webp" />
            <Image src="/project-media/modern-gallery-poster.webp" alt=""
              fill unoptimized loading="eager" fetchPriority="high" />
          </picture>
        )}
        {!museum && sceneLoading && <div className={styles.galleryLoading} role="status">
          <span className={styles.spinner} aria-hidden="true" />전시관을 불러오는 중
        </div>}
        {museum ? (
          <div className={styles.museumPreview}>
            <Image src="/project-media/hallwyl-drawing-room.jpg" alt="할빌 박물관 응접실" fill sizes="100vw" preload />
            {museumViewerOpen && <MuseumViewer active={active} reduced={reduced} />}
          </div>
        ) : (
          <div className={styles.galleryCanvas} data-ready={sceneReady} aria-hidden="true">
            {!reduced && (
              <SceneBoundary onError={() => setSceneFailed(true)}>
                <ModernScene images={modernGalleryImages}
                  onOpen={openPreview} onReady={onSceneReady} exhibitRequest={exhibitRequest}
                  paused={scenePaused} onExhibit={setModernExhibit} startIndex={modernExhibit} />
              </SceneBoundary>
            )}
          </div>
        )}
        <div className={styles.galleryIntro}>
          <h1>{museum ? "할빌 박물관" : "모던 갤러리"}</h1>
          {museum ? (
            <div className={styles.museumActions}>
              <button type="button" onClick={() => setMuseumViewerOpen((open) => !open)}>
                {museumViewerOpen ? "사진으로 돌아가기" : "3D 둘러보기"}
              </button>
              <a href={museumPage} target="_blank" rel="noreferrer">Erik Lernestål · Hallwyl Museum/SHM · CC BY</a>
            </div>
          ) : <p>{!reduced && sceneReady
            ? <>바닥을 눌러 이동 · 그림을 눌러 상세 보기
              <span className={styles.galleryDesktopHelp}><br />WASD / 방향키로 이동
                <br />휠로 확대·축소 · 우클릭 드래그로 시점 회전</span></>
            : "화살표로 작품을 둘러보세요."}</p>}
        </div>
        {modern && <Link href="/projects" className={styles.galleryDirectoryLink}>전체 프로젝트 <span aria-hidden="true">↗</span></Link>}
        <button ref={marker} type="button" className={styles.galleryMarker} data-mounted={!reduced && sceneReady}
          aria-haspopup="dialog" onClick={() => openPreview(active)}>
          {(reduced || !sceneReady) && <Image src={exhibit.media} alt="" width={192} height={108} sizes="192px" />}
          <span>{exhibit.name}</span>
          <span className={styles.galleryOpen}>{modern ? "작품 보기" : "보기"} <span aria-hidden="true">↗</span></span>
        </button>
        <nav className={styles.galleryControls} aria-label="전시관 이동">
          <button type="button" disabled={active === 0} onClick={() => goToExhibit(active - 1)} aria-label="이전 프로젝트">←</button>
          <span>{active + 1} / {stories.length}</span>
          <button type="button" disabled={active === lastStop} onClick={() => goToExhibit(active + 1)} aria-label="다음 프로젝트">→</button>
        </nav>
      </div>
    </div>
    <dialog ref={dialog} className={styles.galleryDialog} data-room={roomOpen ? room.theme : undefined}
      aria-labelledby={roomOpen ? "project-preview-title" : undefined} onClose={() => {
        setRoomOpen(false);
        marker.current?.focus({ preventScroll: true });
      }}>
      {roomOpen && (preview.id === "dubby" ? <DubbyRoom /> : preview.id === "byeoljari" ? <ByeoljariRoom />
        : CustomRoom ? <CustomRoom />
        : <>
      <div className={styles.roomAtmosphere} aria-hidden="true" />
      <div className={styles.roomContent}>
        <form method="dialog"><button type="submit" autoFocus>← 전시관으로 돌아가기</button></form>
        <div className={styles.roomLayout}>
          <div className={styles.roomCopy}>
            <p className={styles.roomName}>{room.name}</p>
            <h1 id="project-preview-title">{preview.name}</h1>
            <p>{preview.text}</p>
            <div className={styles.roomActions}>
              <Link className={styles.textLink} href={`/projects/${preview.id}`} prefetch={false}>프로젝트 자세히 보기 <span aria-hidden="true">↗</span></Link>
              {"action" in room && (
                <a className={styles.textLink} href="#report-experiment"
                  onClick={() => dialog.current?.close()}>
                  {room.action} <span aria-hidden="true">↓</span>
                </a>
              )}
            </div>
          </div>
          <figure className={styles.roomDisplay}>
            <Image src={preview.media} alt={`${preview.name} 제품 화면`} width={960} height={540} sizes="(max-width: 800px) 86vw, 52vw" />
          </figure>
        </div>
      </div>
      </>)}
    </dialog>
    {modern && <footer className={styles.galleryCredits}>
      <a href={modernGallerySource} target="_blank" rel="noreferrer">Art Gallery · Zeps3D · CC BY 4.0 · 수정하여 사용</a>
      <a href={walkerSource} target="_blank" rel="noreferrer">Nathan · Renderpeople · CC BY 4.0 · 대기 모션 추가</a>
    </footer>}
    {!modern && <>
 <div className={styles.stage}><div className={styles.storyContent}><div className={styles.chapterIntro}><p className={styles.eyebrow}>SELECTED WORK / 2025—2026</p><h2>문제와 해답 사이,<br /><em>제가 만든 것들.</em></h2><p>스크롤을 따라 제품 이야기를 만나보세요.</p></div>{stories.map((story, index) => <section id={`story-${story.id}`} className={styles.story} key={story.id}><div className={styles.storyCopy}><span className={styles.storyNumber}>{String(index + 1).padStart(2, "0")} <i>/ {String(stories.length).padStart(2, "0")}</i></span><p className={styles.eyebrow}>{story.label}</p><h2>{story.title}</h2><p>{story.text}</p><span className={styles.storyTags}>{story.tags}</span><Link className={styles.textLink} href={`/projects/${story.id}`}>프로젝트 자세히 보기 <span>↗</span></Link></div><Link href={`/projects/${story.id}`} className={styles.screen} aria-label={`${story.name} 상세 보기`}><div className={styles.screenBar}><span>● ● ●</span><span>{story.id}</span></div><div className={styles.screenImage} style={{ backgroundImage: `url('${story.media}')` }} /><div className={styles.screenCaption}><span>{story.label}</span><b>{String(index + 1).padStart(2, "0")} / {String(stories.length).padStart(2, "0")}</b></div></Link>{index === 0 && <div id="report-experiment" className={styles.reportExperiment}><ReportDemo /></div>}</section>)}</div></div>
    <footer className={styles.exploreEnd}>
      <Link href="/projects">전체 프로젝트 보기</Link>
    </footer>
    </>}
  </main>;
}
