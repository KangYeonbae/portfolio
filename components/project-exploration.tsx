"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import styles from "./experience.module.css";

const Scene = dynamic(() => import("./experience-scene"), { ssr: false });
const answers = ["광고비는 $1,200입니다.", "매출은 $3,600입니다.", "전환 수는 18건입니다."];
function ReportDemo() {
 const [selected, setSelected] = useState<number | null>(null);
 const [checked, setChecked] = useState(false);
 return <div className={styles.demo}><div className={styles.demoHead}><span>INTERACTIVE / SAMPLE DATA</span><span>FACT CHECK</span></div><h3>리포트의 오류를 찾아보세요</h3><p>원본 표와 다른 숫자가 들어간 문장을 선택해 주세요.</p><div className={styles.table}><span>광고비 <b>$1,200</b></span><span>매출 <b>$3,200</b></span><span>전환 <b>18건</b></span></div><div className={styles.options}>{answers.map((answer, i) => <button type="button" key={answer} aria-pressed={selected === i} className={selected === i ? styles.selected : ""} onClick={() => { setSelected(i); setChecked(false); }}><span>{String(i + 1).padStart(2, "0")}</span>{answer}</button>)}</div><div className={styles.demoActions}><button type="button" onClick={() => setChecked(true)}>검증 실행</button><button type="button" onClick={() => { setSelected(null); setChecked(false); }}>초기화</button></div><p className={styles.feedback} aria-live="polite">{checked ? selected === null ? "먼저 문장을 선택해 주세요." : selected === 1 ? "정답입니다. 원본 매출은 $3,200인데 문장에는 $3,600으로 적혀 있습니다." : "이 문장은 원본과 일치합니다. 다른 문장도 확인해 보세요." : "실제 고객 데이터가 아닌 체험용 샘플입니다."}</p></div>;
}
const stories = [
 { id: "amazon-ads-agent", number: "01", label: "AI REPORTING / TRUST", title: "생성보다 중요한\n검증의 순간.", text: "AI가 리포트를 작성하고, 코드는 원본 데이터와 숫자를 대조합니다. 신뢰할 수 있는 결과를 만들기 위해 역할을 분리했습니다.", tags: "LLM GENERATION / PYTHON VALIDATION", media: "/project-media/amazon-reporting.png" },
 { id: "bid-master", number: "02", label: "WORKFLOW / AUTOMATION", title: "몇 시간의 반복을\n하나의 흐름으로.", text: "흩어진 입찰 공고와 문서를 모으고 품목을 정리해, 사용자가 판단에 집중할 수 있도록 만들었습니다.", tags: "COLLECT / MATCH / DECIDE", media: "/project-media/bid-master.webp" },
 { id: "byeoljari", number: "03", label: "PRODUCT / DELIVERY", title: "결제 이후까지\n제품의 경험이니까.", text: "계산과 AI 해석을 분리하고, 결제한 사용자가 끝내 결과를 받는 것까지 하나의 경험으로 설계했습니다.", tags: "CALCULATE / VERIFY / DELIVER", media: "/project-media/byeoljari.png" },
];

export function ProjectExploration() {
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(true);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      if (frame || motion.matches) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const element = stage.current;
        if (!element) return;
        const rect = element.getBoundingClientRect();
        setProgress(Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - window.innerHeight))));
      });
    };
    const syncMotion = () => {
      setReduced(motion.matches);
      update();
    };
    syncMotion();
    motion.addEventListener("change", syncMotion);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      motion.removeEventListener("change", syncMotion);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <main className={styles.exploration}>
    <header className={styles.exploreNav}>
      <Link href="/">? ????? ?</Link>
      <Link href="/projects">?? ????</Link>
    </header>
 <div ref={stage} id="work" className={styles.stage}><div className={styles.scene} aria-hidden="true">{!reduced && <Scene progress={progress} />}</div><div className={styles.storyContent}><div className={styles.chapterIntro}><p className={styles.eyebrow}>SELECTED WORK / 2025—2026</p><h2>문제와 해답 사이,<br /><em>제가 만든 것들.</em></h2><p>스크롤을 따라 세 가지 제품 이야기를 만나보세요.</p></div>{stories.map((story, index) => <section id={`story-${story.id}`} className={styles.story} key={story.id}><div className={styles.storyCopy}><span className={styles.storyNumber}>{story.number} <i>/ 03</i></span><p className={styles.eyebrow}>{story.label}</p><h2>{story.title}</h2><p>{story.text}</p><span className={styles.storyTags}>{story.tags}</span><Link className={styles.textLink} href={`/projects/${story.id}`}>프로젝트 자세히 보기 <span>↗</span></Link></div><div className={styles.screen}><div className={styles.screenBar}><span>● ● ●</span><span>{story.id}</span></div><div className={styles.screenImage} style={{ backgroundImage: `url('${story.media}')` }} /><div className={styles.screenCaption}><span>{story.label}</span><b>{story.number} / 03</b></div></div>{index === 0 && <ReportDemo />}</section>)}</div></div>
    <footer className={styles.exploreEnd}><Link href="/projects">?? ???? ?? ?</Link></footer>
  </main>;
}
