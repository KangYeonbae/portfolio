"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./agent-room.module.css";

// A fake shop page; positions are percentages of the browser viewport.
type Element = { id: number; label: string; x: number; y: number; w: number; h: number; kind?: string; selector: string };
const pages: Record<"list" | "detail", Element[]> = {
  list: [
    { id: 1, label: "SAMPLE SHOP", x: 4, y: 5, w: 22, h: 9, kind: "logo", selector: "a.logo" },
    { id: 2, label: "검색", x: 34, y: 5, w: 34, h: 9, kind: "search", selector: "input#q" },
    { id: 3, label: "로그인", x: 82, y: 5, w: 14, h: 9, selector: "a.login" },
    { id: 4, label: "흰 티셔츠", x: 4, y: 22, w: 28, h: 64, kind: "product", selector: "a.product[data-sku=tee-white]" },
    { id: 5, label: "청바지", x: 36, y: 22, w: 28, h: 64, kind: "product", selector: "a.product[data-sku=denim]" },
    { id: 6, label: "모자", x: 68, y: 22, w: 28, h: 64, kind: "product", selector: "a.product[data-sku=cap]" },
  ],
  detail: [
    { id: 1, label: "← 목록", x: 4, y: 5, w: 16, h: 9, selector: "a.back" },
    { id: 2, label: "S", x: 52, y: 40, w: 9, h: 11, kind: "size", selector: "button.size[value=S]" },
    { id: 3, label: "M", x: 63, y: 40, w: 9, h: 11, kind: "size", selector: "button.size[value=M]" },
    { id: 4, label: "L", x: 74, y: 40, w: 9, h: 11, kind: "size", selector: "button.size[value=L]" },
    { id: 5, label: "장바구니 담기", x: 52, y: 60, w: 31, h: 12, kind: "primary", selector: "button.add-to-cart" },
    { id: 6, label: "바로 구매", x: 52, y: 76, w: 31, h: 11, selector: "button.buy-now" },
  ],
};
const plan = ["흰 티셔츠 상품 찾기", "사이즈 M 고르기", "장바구니에 담기"];
const actions = [
  { page: "list", target: 4 },
  { page: "detail", target: 3 },
  { page: "detail", target: 5 },
] as const;
const fallbacks = ["학습된 셀렉터", "Vision (LLaVA)", "텍스트 매칭", "좌표 클릭"];

// step: 0 idle, 1 plan, then per action: mark → click (2 sub-steps), last = saved
const LAST = 2 + actions.length * 2;

export default function AgentRoom() {
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [learned, setLearned] = useState<string[]>([]);
  const [usedMemory, setUsedMemory] = useState(false);

  useEffect(() => {
    if (!running) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      if (step >= LAST) {
        setRunning(false);
        setLearned(actions.map((action) => pages[action.page].find((item) => item.id === action.target)!.selector));
        return;
      }
      setStep(reduced ? LAST : step + 1);
    }, reduced ? 0 : usedMemory ? 450 : 1000);
    return () => window.clearTimeout(timer);
  }, [running, step, usedMemory]);

  function start() {
    setUsedMemory(learned.length > 0);
    setStep(1);
    setRunning(true);
  }

  const index = Math.min(actions.length - 1, Math.max(0, Math.floor((step - 2) / 2)));
  const action = actions[index];
  const clicked = step >= 3 && (step - 2) % 2 === 1;
  const acting = step >= 2 && step < LAST;
  // The click happens on the current page; the next action starts on its own page.
  const page = action.page;
  const size = step >= 5 ? "M" : null;
  const added = step >= LAST - 1 && step > 0;
  const target = pages[action.page].find((item) => item.id === action.target)!;
  const showMarks = acting && !clicked && !usedMemory;
  const cursor = acting ? { left: `${target.x + target.w / 2}%`, top: `${target.y + target.h / 2}%` } : { left: "88%", top: "92%" };

  return <div className={styles.room}>
    <header className={styles.toolbar}>
      <form method="dialog"><button type="submit" autoFocus>← 전시관으로 돌아가기</button></form>
      <Link href="/projects/local-browser-agent" prefetch={false}>프로젝트 자세히 보기 ↗</Link>
    </header>
    <div className={styles.body}>
      <section className={styles.side}>
        <p className={styles.roomName}>로컬 AI 작업실</p>
        <h1 id="project-preview-title">Local Browser Agent</h1>
        <p className={styles.lead}>고객 화면을 밖으로 보내지 않습니다. <strong>내 PC의 모델이 화면에 붙인 번호 중 하나를 고릅니다.</strong></p>

        <p className={styles.goal}><span>목표</span> 흰 티셔츠 M 사이즈를 장바구니에 담아 줘</p>
        <button type="button" className={styles.start} onClick={start} disabled={running}>
          {running ? "실행 중…" : learned.length ? "다시 실행 (학습된 경로)" : "실행"}
        </button>

        <ol className={styles.plan} aria-label="Qwen2.5 실행 계획">
          {plan.map((item, i) => <li key={item} data-state={step < 1 ? "wait" : added || i < index ? "done" : i === index && acting ? "active" : "plan"}>{item}</li>)}
        </ol>

        <div className={styles.fallback} aria-label="클릭 대상 찾는 순서">
          {fallbacks.map((item, i) => <span key={item} data-on={acting && (usedMemory ? i === 0 : i === 1)}>{i + 1}. {item}</span>)}
        </div>
        <p className={styles.network}><span aria-hidden="true">●</span> localhost:11434 · 외부 API 호출 <b>0건</b></p>
      </section>

      <div className={styles.browser}>
        <div className={styles.bar}><span aria-hidden="true">● ● ●</span><span className={styles.url}>shop.example.com/{page === "list" ? "" : "products/tee-white"}</span></div>
        <div className={styles.viewport} data-page={page} aria-label="에이전트가 조작하는 화면" role="img">
          {pages[page].map((item) => <div key={`${page}-${item.id}`} className={styles.el} data-kind={item.kind}
            data-picked={acting && item.id === action.target && action.page === page}
            data-selected={item.kind === "size" && item.label === size}
            style={{ left: `${item.x}%`, top: `${item.y}%`, width: `${item.w}%`, height: `${item.h}%` }}>
            {item.kind === "product" && <span className={styles.photo} data-sku={item.label} />}
            <span>{item.label}</span>
            {showMarks && action.page === page && <b className={styles.mark}>{item.id}</b>}
          </div>)}
          {page === "detail" && <div className={styles.hero}><span className={styles.photo} data-sku="흰 티셔츠" /></div>}
          {added && <p className={styles.toast}>장바구니에 담았습니다 ✓</p>}
          <span className={styles.cursor} style={cursor} data-click={clicked} aria-hidden="true" />
        </div>
        <p className={styles.say} aria-live="polite">
          {step === 0 ? "실행하면 화면 요소에 번호를 붙여 모델에게 보여 줍니다."
            : step === 1 ? "Qwen2.5가 목표를 세 단계로 나눴습니다."
            : added ? `성공한 클릭에서 셀렉터 ${actions.length}개를 거꾸로 찾아 저장했습니다.`
            : usedMemory ? `학습된 셀렉터 ${target.selector} 로 바로 클릭합니다.`
            : clicked ? `${target.id}번 “${target.label}” 클릭`
            : `LLaVA: 번호 ${pages[action.page].length}개 중 ${target.id}번을 고릅니다.`}
        </p>
        {learned.length > 0 && <ul className={styles.memory} aria-label="학습된 셀렉터 (SQLite)">
          {learned.map((selector) => <li key={selector}><code>{selector}</code><span>신뢰도 0.9</span></li>)}
        </ul>}
      </div>
    </div>
  </div>;
}
