"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { DubbyRoom } from "./dubby-room";
import { ByeoljariRoom } from "./byeoljari-room";
import styles from "./experience.module.css";

const Scene = dynamic(() => import("./experience-scene"), { ssr: false });
const answers = ["광고비는 $1,200입니다.", "매출은 $3,600입니다.", "전환 수는 18건입니다."];
function ReportDemo() {
 const [selected, setSelected] = useState<number | null>(null);
 const [checked, setChecked] = useState(false);
 return <div className={styles.demo}><div className={styles.demoHead}><span>INTERACTIVE / SAMPLE DATA</span><span>FACT CHECK</span></div><h3>리포트의 오류를 찾아보세요</h3><p>원본 표와 다른 숫자가 들어간 문장을 선택해 주세요.</p><div className={styles.table}><span>광고비 <b>$1,200</b></span><span>매출 <b>$3,200</b></span><span>전환 <b>18건</b></span></div><div className={styles.options}>{answers.map((answer, i) => <button type="button" key={answer} aria-pressed={selected === i} className={selected === i ? styles.selected : ""} onClick={() => { setSelected(i); setChecked(false); }}><span>{String(i + 1).padStart(2, "0")}</span>{answer}</button>)}</div><div className={styles.demoActions}><button type="button" onClick={() => setChecked(true)}>검증 실행</button><button type="button" onClick={() => { setSelected(null); setChecked(false); }}>초기화</button></div><p className={styles.feedback} aria-live="polite">{checked ? selected === null ? "먼저 문장을 선택해 주세요." : selected === 1 ? "정답입니다. 원본 매출은 $3,200인데 문장에는 $3,600으로 적혀 있습니다." : "이 문장은 원본과 일치합니다. 다른 문장도 확인해 보세요." : "실제 고객 데이터가 아닌 체험용 샘플입니다."}</p></div>;
}
const stories = [
 { id: "amazon-ads-agent", name: "Amazon Ads Reporting Agent", number: "01", label: "AI REPORTING / TRUST", title: "생성보다 중요한\n검증의 순간.", text: "AI가 리포트를 작성하고, 코드는 원본 데이터와 숫자를 대조합니다. 신뢰할 수 있는 결과를 만들기 위해 역할을 분리했습니다.", tags: "LLM GENERATION / PYTHON VALIDATION", media: "/project-media/amazon-reporting.png" },
 { id: "bid-master", name: "Bid Master", number: "02", label: "WORKFLOW / AUTOMATION", title: "몇 시간의 반복을\n하나의 흐름으로.", text: "흩어진 입찰 공고와 문서를 모으고 품목을 정리해, 사용자가 판단에 집중할 수 있도록 만들었습니다.", tags: "COLLECT / MATCH / DECIDE", media: "/project-media/bid-master.webp" },
 { id: "byeoljari", name: "Byeoljari.com", number: "03", label: "PRODUCT / DELIVERY", title: "결제 이후까지\n제품의 경험이니까.", text: "계산과 AI 해석을 분리하고, 결제한 사용자가 끝내 결과를 받는 것까지 하나의 경험으로 설계했습니다.", tags: "CALCULATE / VERIFY / DELIVER", media: "/project-media/byeoljari.png" },
 { id: "dubby", name: "Dubby", number: "04", label: "SOCIAL / MESSENGER", title: "대화하다가\n같이 게임하는 곳.", text: "1:1과 그룹 채팅, 스토리, 투표, 카드게임을 한 앱에 담은 소셜 메신저입니다.", tags: "FLUTTER / FIREBASE / REALTIME", media: "/project-media/dubby.jpg" },
] as const;
const galleryImages = stories.map((story) => story.media);

const rooms = {
  "amazon-ads-agent": { theme: "control", name: "데이터 관제실", action: "리포트 검증 체험" },
  "bid-master": { theme: "dispatch", name: "물류 작업장" },
  byeoljari: { theme: "observatory", name: "별자리 관측실" },
  dubby: { theme: "dubby", name: "Dubby 라운지" },
} as const;

export function ProjectExploration() {
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(true);
  const [selected, setSelected] = useState(0);
  const [roomOpen, setRoomOpen] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const marker = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const active = Math.round(progress * (stories.length - 1));
  const exhibit = stories[active];
  const preview = stories[selected];
  const room = rooms[preview.id];
  const onSceneReady = useCallback(() => setSceneReady(true), []);

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
      setReduced(motion.matches);
      update();
    };
    // Settle on an exhibit after each scroll gesture, moving one stop in the scroll direction.
    let resting = 0;
    const settle = () => {
      const element = stage.current;
      if (!element || !viewport.current) return;
      const distance = element.offsetHeight - viewport.current.offsetHeight;
      const raw = -element.getBoundingClientRect().top / Math.max(1, distance);
      if (raw <= 0 || raw >= 1) return; // outside the gallery: leave normal page scrolling alone
      const position = raw * (stories.length - 1);
      if (Math.abs(position - Math.round(position)) < .02) {
        resting = Math.round(position);
        return;
      }
      resting = position > resting ? Math.ceil(position) : Math.floor(position);
      window.scrollTo({
        top: element.getBoundingClientRect().top + window.scrollY + distance * resting / (stories.length - 1),
        behavior: motion.matches ? "instant" : "smooth",
      });
    };
    syncMotion();
    motion.addEventListener("change", syncMotion);
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
  }, []);

  function goToExhibit(index: number) {
    const section = stage.current;
    if (!section || !viewport.current) return;
    const start = section.getBoundingClientRect().top + window.scrollY;
    const distance = section.offsetHeight - viewport.current.offsetHeight;
    window.scrollTo({
      top: start + distance * index / (stories.length - 1),
      behavior: reduced ? "instant" : "smooth",
    });
  }

  function openPreview(index: number) {
    marker.current?.focus({ preventScroll: true });
    setSelected(index);
    setRoomOpen(true);
    dialog.current?.showModal();
  }

  return <main className={styles.exploration}>
    <header className={styles.exploreNav}>
      <Link href="/">홈으로 돌아가기</Link>
      <Link href="/projects">전체 프로젝트 보기</Link>
    </header>
    <div ref={stage} id="work" className={styles.galleryTrack}>
      <div ref={viewport} className={styles.galleryViewport}>
        <div className={styles.galleryCanvas} aria-hidden="true">
          {!reduced && <Scene progress={progress} images={galleryImages} onOpen={openPreview} onReady={onSceneReady} />}
        </div>
        <div className={styles.galleryIntro}>
          <h1>프로젝트 전시관</h1>
          <p>스크롤하거나 화살표로 이동하세요.</p>
        </div>
        <button ref={marker} type="button" className={styles.galleryMarker} data-mounted={!reduced && sceneReady}
          aria-haspopup="dialog" onClick={() => openPreview(active)}>
          {(reduced || !sceneReady) && <Image src={exhibit.media} alt="" width={192} height={108} sizes="192px" />}
          <span>{exhibit.name}</span>
          <span className={styles.galleryOpen}>보기 <span aria-hidden="true">↗</span></span>
        </button>
        <nav className={styles.galleryControls} aria-label="전시관 이동">
          <button type="button" disabled={active === 0} onClick={() => goToExhibit(active - 1)} aria-label="이전 프로젝트">←</button>
          <span>{active + 1} / {stories.length}</span>
          <button type="button" disabled={active === stories.length - 1} onClick={() => goToExhibit(active + 1)} aria-label="다음 프로젝트">→</button>
        </nav>
      </div>
    </div>
    <dialog ref={dialog} className={styles.galleryDialog} data-room={room.theme} aria-labelledby="project-preview-title" onClose={() => setRoomOpen(false)}>
      {preview.id === "dubby" && roomOpen ? <DubbyRoom /> : preview.id === "byeoljari" && roomOpen ? <ByeoljariRoom /> : <>
      <div className={styles.roomAtmosphere} aria-hidden="true" />
      <div className={styles.roomContent}>
        <form method="dialog"><button type="submit" autoFocus>← 전시관으로 돌아가기</button></form>
        <div className={styles.roomLayout}>
          <div className={styles.roomCopy}>
            <p className={styles.roomName}>{room.name}</p>
            <h1 id="project-preview-title">{preview.name}</h1>
            <p>{preview.text}</p>
            <div className={styles.roomActions}>
              <Link className={styles.textLink} href={`/projects/${preview.id}`}>프로젝트 자세히 보기 <span aria-hidden="true">↗</span></Link>
              {"action" in room && (
                <a className={styles.textLink} href="#report-experiment" onClick={() => dialog.current?.close()}>
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
      </>}
    </dialog>
 <div className={styles.stage}><div className={styles.storyContent}><div className={styles.chapterIntro}><p className={styles.eyebrow}>SELECTED WORK / 2025—2026</p><h2>문제와 해답 사이,<br /><em>제가 만든 것들.</em></h2><p>스크롤을 따라 제품 이야기를 만나보세요.</p></div>{stories.map((story, index) => <section id={`story-${story.id}`} className={styles.story} key={story.id}><div className={styles.storyCopy}><span className={styles.storyNumber}>{story.number} <i>/ {String(stories.length).padStart(2, "0")}</i></span><p className={styles.eyebrow}>{story.label}</p><h2>{story.title}</h2><p>{story.text}</p><span className={styles.storyTags}>{story.tags}</span><Link className={styles.textLink} href={`/projects/${story.id}`}>프로젝트 자세히 보기 <span>↗</span></Link></div><Link href={`/projects/${story.id}`} className={styles.screen} aria-label={`${story.name} 상세 보기`}><div className={styles.screenBar}><span>● ● ●</span><span>{story.id}</span></div><div className={styles.screenImage} style={{ backgroundImage: `url('${story.media}')` }} /><div className={styles.screenCaption}><span>{story.label}</span><b>{story.number} / {String(stories.length).padStart(2, "0")}</b></div></Link>{index === 0 && <div id="report-experiment" className={styles.reportExperiment}><ReportDemo /></div>}</section>)}</div></div>
    <footer className={styles.exploreEnd}><Link href="/projects">전체 프로젝트 보기</Link></footer>
  </main>;
}
