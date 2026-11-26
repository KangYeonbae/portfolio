"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import styles from "./studio-room.module.css";

// Sample product invented for the demo. Slot names and purposes follow Snap-p's Amazon slot table.
type Market = "us" | "jp";
const copy: Record<Market, Record<string, string>> = {
  us: { usp: "Leak-proof lid.\nIce for 24 hours.", before: "Before", after: "After", size: "20 oz · fits cup holders", steps: "Twist · Lock · Go", life: "Your commute, cold till evening", close: "Ready to gift" },
  jp: { usp: "漏れないフタ。\n24時間ひんやり。", before: "以前", after: "以後", size: "590ml・カップホルダー対応", steps: "回す・ロック・出発", life: "通勤中もずっと冷たい", close: "ギフトにも最適" },
};
const slots = [
  ["Main Image", "검색 결과 클릭"], ["USP Hero", "핵심 장점"], ["Infographic", "스펙 정리"],
  ["Before/After", "문제와 해결"], ["Size/Scale", "실제 크기감"], ["How to Use", "사용 순서"],
  ["Lifestyle", "사용 장면"], ["Trust", "인증·소재"], ["Closing", "선물·포장"],
] as const;
const brief = [
  ["타깃", "차로 출퇴근하는 직장인"],
  ["판매 포인트", "새지 않는 잠금 뚜껑 · 24시간 보냉 · 컵홀더 크기"],
  ["톤", "깔끔하고 실용적으로"],
] as const;

type Phase = "idle" | "brief" | "shoot" | "gate" | "done";

function Tumbler({ size = 46 }: { size?: number }) {
  return <svg className={styles.tumbler} width={size} height={size * 1.6} viewBox="0 0 40 64" aria-hidden="true">
    <rect x="9" y="2" width="22" height="7" rx="2" fill="#2f2a3a" />
    <path d="M7 10h26l-3 50a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4z" fill="#8fc7c1" />
    <path d="M10 22h20" stroke="#ffffff70" strokeWidth="2" />
    <rect x="13" y="13" width="3" height="40" rx="1.5" fill="#ffffff45" />
  </svg>;
}

function Shot({ index, market, flagged }: { index: number; market: Market; flagged: boolean }) {
  const text = copy[market];
  const scenes: ReactNode[] = [
    flagged ? <><span className={styles.badge}>BEST</span><Tumbler size={52} /></> : <Tumbler size={52} />,
    <><Tumbler size={30} /><strong>{text.usp}</strong></>,
    <><Tumbler size={30} /><ul><li>Steel · 2 layer</li><li>BPA free</li><li>24h cold</li></ul></>,
    <><span data-side="before">{text.before}<i className={styles.drop} aria-hidden="true" /></span><span data-side="after">{text.after}<Tumbler size={20} /></span></>,
    <><Tumbler size={40} /><span className={styles.ruler} /><small>{text.size}</small></>,
    <><ol><li>1</li><li>2</li><li>3</li></ol><small>{text.steps}</small></>,
    <><span className={styles.sun} /><Tumbler size={22} /><small>{text.life}</small></>,
    <><span className={styles.seal}>BPA<br />FREE</span><span className={styles.seal}>FOOD<br />GRADE</span><Tumbler size={26} /></>,
    <><span className={styles.box} /><Tumbler size={28} /><small>{text.close}</small></>,
  ];
  return <div className={styles.shot} data-slot={index} data-flagged={flagged}>{scenes[index]}</div>;
}

export default function StudioRoom() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [shots, setShots] = useState(0);
  const [market, setMarket] = useState<Market>("us");

  useEffect(() => {
    if (phase === "idle" || phase === "done") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      if (phase === "brief") setPhase("shoot");
      else if (phase === "shoot" && shots < slots.length) setShots(reduced ? slots.length : shots + 1);
      else setPhase(phase === "shoot" ? "gate" : "done");
    }, reduced ? 0 : phase === "shoot" ? 260 : 1100);
    return () => window.clearTimeout(timer);
  }, [phase, shots]);

  function start() {
    setShots(0);
    setPhase("brief");
  }

  const flagged = phase === "shoot" || phase === "gate";
  return <div className={styles.room}>
    <header className={styles.toolbar}>
      <form method="dialog"><button type="submit" autoFocus>← 전시관으로 돌아가기</button></form>
      <Link href="/projects/snap-p" prefetch={false}>프로젝트 자세히 보기 ↗</Link>
    </header>
    <div className={styles.body}>
      <section className={styles.side}>
        <p className={styles.roomName}>상품 촬영 스튜디오</p>
        <h1 id="project-preview-title">Snap-p</h1>
        <p className={styles.lead}>이미지를 바로 만들지 않습니다. <strong>기획서를 먼저 쓰고, 9장마다 역할을 정해 둡니다.</strong></p>

        <div className={styles.market} role="group" aria-label="판매 국가">
          {(["us", "jp"] as const).map((key) => <button key={key} type="button" aria-pressed={market === key}
            onClick={() => setMarket(key)}>{key === "us" ? "미국" : "일본"}</button>)}
        </div>
        <button type="button" className={styles.start} onClick={start} disabled={phase !== "idle" && phase !== "done"}>
          {phase === "idle" ? "촬영 시작" : phase === "done" ? "다시 촬영" : "촬영 중…"}
        </button>

        <article className={styles.brief} data-on={phase !== "idle"} aria-live="polite">
          <h2>크리에이티브 기획서</h2>
          {phase === "idle" ? <p>촬영을 시작하면 상품을 분석해 기획서부터 씁니다.</p>
            : <dl>{brief.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>}
        </article>
        <p className={styles.gate} data-state={phase === "gate" ? "fail" : phase === "done" ? "pass" : "wait"} aria-live="polite">
          {phase === "gate" ? "✗ 정책 검수: 메인 이미지는 흰 배경·글자 없음 → 다시 촬영"
            : phase === "done" ? "✓ 정책·품질 검수 통과 · 9장 완성" : "정책 검수 대기"}
        </p>
      </section>

      <ol className={styles.grid} aria-label="리스팅 이미지 9장">
        {slots.map(([name, purpose], index) => <li key={name} data-ready={index < shots}>
          {index < shots ? <Shot index={index} market={market} flagged={index === 0 && flagged} /> : <div className={styles.empty} aria-hidden="true" />}
          <p><b>{name}</b> {purpose}</p>
        </li>)}
      </ol>
    </div>
  </div>;
}
