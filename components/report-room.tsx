"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import styles from "./report-room.module.css";

// Sample data only: campaign names and figures are invented for the demo.
const rows = [
  { name: "브랜드 검색", spend: 420, sales: 1680 },
  { name: "자동 타기팅", spend: 510, sales: 1020 },
  { name: "상품 타기팅", spend: 270, sales: 500 },
] as const;
const total = { spend: 1200, sales: 3200 };
const roas = (spend: number, sales: number) => (sales / spend).toFixed(2);

type Kind = "money" | "name" | "roas";
type Token = { kind: Kind; text: string; fix?: string };
const draft: (string | Token)[] = [
  "이번 주 총 광고비는 ", { kind: "money", text: "$1,200" }, ", 매출은 ", { kind: "money", text: "$3,600", fix: "$3,200" },
  "으로 ROAS ", { kind: "roas", text: "2.67" }, "를 기록했습니다. ",
  { kind: "name", text: "브랜드 키워드", fix: "브랜드 검색" }, " 캠페인이 매출 ", { kind: "money", text: "$1,680" },
  "로 가장 높았고, ", { kind: "name", text: "자동 타기팅" }, " 캠페인은 광고비 ", { kind: "money", text: "$510" },
  " 대비 ROAS ", { kind: "roas", text: "2.00" }, "에 머물렀습니다.",
];
const tokens = draft.filter((part): part is Token => typeof part !== "string");

// Like the real fact_guard: a value passes only if it exists in the set built from the source rows.
const allowed: Record<Kind, Set<string>> = {
  money: new Set([...rows.flatMap((row) => [row.spend, row.sales]), total.spend, total.sales].map((value) => `$${value.toLocaleString("en-US")}`)),
  name: new Set(rows.map((row) => row.name)),
  roas: new Set([...rows.map((row) => roas(row.spend, row.sales)), roas(total.spend, total.sales)]),
};
const reasons: Record<Kind, [string, string]> = {
  money: ["원본 표에 있는 금액", "원본 표에 없는 금액"],
  name: ["원본에 있는 캠페인명", "원본에 없는 캠페인명"],
  roas: ["원본으로 계산한 ROAS", "원본으로 계산되지 않는 ROAS"],
};

const stages = ["수집 · BigQuery", "작성 · AI", "숫자 대조 · 코드", "교정 · AI", "최종 검수 · 코드"] as const;
const architecture = [
  ["BigQuery", "수집"], ["Worker", "초안 작성"], ["fact_guard", "숫자 대조"],
  ["style_editor", "교정"], ["report_qa_agent", "최종 검수"],
] as const;
type Phase = "idle" | "collect" | "writing" | "checking" | "fixing" | "final" | "verified" | "done";
const order: Phase[] = ["idle", "collect", "writing", "checking", "fixing", "final", "verified", "done"];
const delays: Partial<Record<Phase, number>> = { collect: 1200, writing: 1350, checking: 320, fixing: 1350, final: 850, verified: 950 };
// Stage lights per phase; the number check "fails" once it has caught the planted errors.
const stageStates: Record<Phase, string[]> = {
  idle: ["wait", "wait", "wait", "wait", "wait"],
  collect: ["active", "wait", "wait", "wait", "wait"],
  writing: ["done", "active", "wait", "wait", "wait"],
  checking: ["done", "done", "active", "wait", "wait"],
  fixing: ["done", "done", "fail", "active", "wait"],
  final: ["done", "done", "fail", "done", "active"],
  verified: ["done", "done", "fail", "done", "done"],
  done: ["done", "done", "fail", "done", "done"],
};

const manualDraft = "광고비는 $1,200입니다. 캠페인별 매출은 원본에서 다시 확인합니다.";
const typoAt = manualDraft.indexOf("다시") + 1;
const typingFrames = [
  ...Array.from({ length: typoAt + 1 }, (_, index) => manualDraft.slice(0, index)),
  `${manualDraft.slice(0, typoAt)}서`, `${manualDraft.slice(0, typoAt)}서`, manualDraft.slice(0, typoAt),
  ...Array.from({ length: manualDraft.length - typoAt }, (_, index) => manualDraft.slice(0, typoAt + index + 1)),
  ...Array<string>(30).fill(manualDraft),
];
const motionQuery = "(prefers-reduced-motion: reduce)";

function subscribeMotion(notify: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
}

function ManualDraft({ playing }: { playing: boolean }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setFrame((index) => (index + 1) % typingFrames.length), 76);
    return () => window.clearInterval(timer);
  }, [playing]);

  return <>
    <span className={styles.srOnly}>{manualDraft}</span>
    <p className={styles.manualText} aria-hidden="true">
      {playing || frame > 0 ? typingFrames[frame] : manualDraft}<span className={styles.cursor} />
    </p>
  </>;
}

export default function ReportRoom() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [checked, setChecked] = useState(0);
  const [focus, setFocus] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const reduced = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => true);
  const action = useRef<HTMLButtonElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const fixed = phase === "final" || phase === "verified" || phase === "done";
  const morning = phase === "done";
  const daylight = morning || repeat;
  const busy = phase !== "idle" && phase !== "done";

  useEffect(() => {
    if (!busy) return;
    const timer = window.setTimeout(() => {
      if (phase === "checking" && checked < tokens.length) setChecked(reduced ? tokens.length : checked + 1);
      else setPhase(order[order.indexOf(phase) + 1]);
    }, reduced ? 0 : delays[phase]);
    return () => window.clearTimeout(timer);
  }, [busy, phase, checked, reduced]);

  useEffect(() => {
    if (morning && document.activeElement === screen.current) action.current?.focus({ preventScroll: true });
  }, [morning]);

  function run() {
    if (busy) return;
    screen.current?.focus({ preventScroll: true });
    setChecked(0);
    setFocus(null);
    setRepeat(morning);
    setPhase("collect");
  }

  const pass = (token: Token) => allowed[token.kind].has(fixed && token.fix ? token.fix : token.text);
  const written = order.indexOf(phase) >= order.indexOf("writing");
  const corrected = tokens.filter((token) => token.fix);
  const activity: Record<Phase, string> = {
    idle: "", collect: "BigQuery에서 캠페인 데이터를 가져오는 중",
    writing: "AI가 원본을 바탕으로 보고서 초안 작성 중",
    checking: `원본과 숫자·캠페인명 대조 중 (${checked}/${tokens.length})`,
    fixing: "$3,600 → $3,200 · 브랜드 키워드 → 브랜드 검색",
    final: "교정한 숫자와 캠페인명을 다시 검수 중",
    verified: "최종 검수 통과 · 보고서 완성",
    done: "최종 검수 통과. 주간 광고 보고서가 완성됐습니다.",
  };

  let tokenIndex = -1;
  return <div className={styles.room} data-morning={daylight}>
    <h1 className={styles.srOnly} id="project-preview-title">Amazon Ads Reporting Agent</h1>
    <header className={styles.toolbar}>
      <form method="dialog"><button type="submit" autoFocus>← 전시관으로 돌아가기</button></form>
      <div className={styles.toolbarActions}>
        {!reduced && <button type="button" onClick={() => setPaused(!paused)}>{paused ? "움직임 재생" : "움직임 정지"}</button>}
        <Link href="/projects/amazon-ads-agent" prefetch={false}>프로젝트 자세히 보기 ↗</Link>
      </div>
    </header>

    <section className={styles.hero} aria-label="마케터의 보고서 작성 장면" data-busy={busy} data-phase={phase} data-paused={paused} data-daylight={daylight}>
      <div className={styles.camera}>
        <Image src="/project-media/amazon-scene-night.webp" className={styles.illustration} alt={daylight ? "" : "새벽 3시, 마케터가 책상에서 보고서를 쓰고 있습니다."} fill loading="eager" sizes="(max-width: 600px) 112vw, 100vw" />
        <Image src="/project-media/amazon-scene-hands.webp" alt="" className={styles.hands} width={460} height={251} unoptimized />
        <Image src="/project-media/amazon-scene-morning.webp" className={`${styles.illustration} ${styles.morning}`} alt={daylight ? "아침 8시, 마케터가 커피를 마십니다." : ""} fill loading="eager" sizes="(max-width: 600px) 112vw, 100vw" />
        <div className={styles.steam} aria-hidden="true"><span /><span /></div>
        <div ref={screen} className={styles.screen} tabIndex={-1}>
          {busy ? <div className={styles.flow}>
            <div className={styles.screenHeading}>보고서 생성 흐름</div>
            <ol className={styles.nodes} aria-label="에이전트 아키텍처">
              {architecture.map(([name, label], index) => <li key={name} data-state={stageStates[phase][index]}>
                <strong>{label}</strong><small>{name.replaceAll("_", "_\u200B")}</small>
              </li>)}
            </ol>
            <div className={styles.activity} aria-hidden="true" data-phase-status={phase}>
              {phase === "fixing" && <div className={styles.feedback}><span>↶</span> 원본 불일치 · AI에 교정 요청</div>}
              {activity[phase]}
            </div>
          </div> : <>
            <div className={styles.screenHeading}>주간 광고 보고서</div>
            {morning ? <div className={styles.result}>
              <p>광고비 <strong>$1,200</strong><br />매출 <strong>$3,200</strong> · ROAS <strong>2.67</strong></p>
              <p className={styles.resultDetail}>브랜드 검색 캠페인 매출 $1,680 · 최종 검수 통과</p>
            </div> : <ManualDraft playing={!paused && !reduced} />}
            <button ref={action} type="button" className={styles.run} onClick={run}>{morning ? "보고서 만들기" : "에이전트에게 맡기기"}</button>
          </>}
        </div>
      </div>
    </section>
    <p className={styles.srOnly} role="status">{phase === "checking" ? "원본과 숫자·캠페인명 대조 중" : activity[phase]}</p>

    <details className={styles.details}>
      <summary>원본 데이터와 검증 과정 자세히 보기</summary>
      <div className={styles.body}>
        <ol className={styles.pipeline} aria-label="에이전트 파이프라인">
          {stages.map((stage, index) => <li key={stage} data-state={stageStates[phase][index]}>{stage}{stageStates[phase][index] === "fail" && ` · ${corrected.length}건 발견`}</li>)}
        </ol>

        <div className={styles.wall}>
          <section className={styles.monitor} data-active={phase === "collect"} aria-labelledby="source-title">
            <h2 id="source-title"><span aria-hidden="true">●</span> 원본 데이터 · BigQuery</h2>
            <table>
              <thead><tr><th scope="col">캠페인</th><th scope="col">광고비</th><th scope="col">매출</th><th scope="col">ROAS</th></tr></thead>
              <tbody>
                {rows.map((row) => <tr key={row.name}>
                  <th scope="row" data-hit={focus === row.name}>{row.name}</th>
                  {[`$${row.spend.toLocaleString("en-US")}`, `$${row.sales.toLocaleString("en-US")}`, roas(row.spend, row.sales)].map((cell) =>
                    <td key={cell} data-hit={focus === cell}>{cell}</td>)}
                </tr>)}
              </tbody>
              <tfoot><tr>
                <th scope="row">합계</th>
                {["$1,200", "$3,200", roas(total.spend, total.sales)].map((cell) => <td key={cell} data-hit={focus === cell}>{cell}</td>)}
              </tr></tfoot>
            </table>
          </section>

          <section className={styles.monitor} data-active={phase === "writing"} aria-labelledby="draft-title">
            <h2 id="draft-title"><span aria-hidden="true">●</span> {fixed ? "완성된 리포트" : "AI가 쓰는 리포트"}</h2>
            {!written ? <p className={styles.waiting}>{phase === "collect" ? "광고 데이터를 모으는 중…" : "아직 쓰기 전입니다."}</p>
              : <p className={styles.draft} data-writing={phase === "writing"}>
                {draft.map((part, index) => {
                  if (typeof part === "string") return part;
                  tokenIndex++;
                  const text = fixed && part.fix ? part.fix : part.text;
                  const state = phase === "writing" || (phase === "checking" && tokenIndex >= checked) ? "wait" : pass(part) ? (fixed && part.fix ? "fixed" : "ok") : "bad";
                  return <mark key={index} data-state={state} tabIndex={0}
                    onPointerEnter={() => setFocus(text)} onPointerLeave={() => setFocus(null)}
                    onFocus={() => setFocus(text)} onBlur={() => setFocus(null)}>{text}</mark>;
                })}
              </p>}
            <p className={styles.hint}>숫자에 마우스를 올리면 원본 표에서 같은 값을 찾아 줍니다.</p>
          </section>

          <section className={styles.monitor} data-active={phase === "checking" || phase === "fixing"} aria-labelledby="log-title">
            <h2 id="log-title"><span aria-hidden="true">●</span> 코드가 하는 숫자 검사</h2>
            <ul className={styles.log} aria-live="polite">
              {checked === 0 && !fixed && <li>코드가 AI 초안의 숫자와 캠페인명을 원본과 하나씩 대조합니다.</li>}
              {tokens.slice(0, checked).map((token) => {
                const ok = allowed[token.kind].has(token.text);
                return <li key={token.text} data-state={ok ? "ok" : "bad"}>{ok ? "✓" : "✗"} {token.text} — {reasons[token.kind][ok ? 0 : 1]}</li>;
              })}
              {fixed && corrected.map((token) =>
                <li key={`fix-${token.text}`} data-state="fixed">↺ 교정 {token.text} → {token.fix}</li>)}
              {phase === "done" && <li data-state="ok"><strong>최종 검수 통과 · 모든 숫자와 이름이 원본과 일치</strong></li>}
            </ul>
          </section>
        </div>

        <p className={styles.note}>체험용 샘플 데이터입니다. 실제 시스템은 모든 금액을 원본 행으로 만든 표의 값과 대조해 통과시킵니다.</p>
        <dl className={styles.facts}>
          <div><dt>리포트 생성</dt><dd>주간 3~4분 · 월간 4~8분</dd></div>
          <div><dt>누적 적재</dt><dd>1억 3,500만 행</dd></div>
          <div><dt>검증·교정 코드</dt><dd>전체의 20%</dd></div>
        </dl>
      </div>
    </details>
  </div>;
}
