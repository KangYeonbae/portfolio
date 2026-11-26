"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReportMood } from "./report-scene";
import styles from "./report-room.module.css";

const ReportScene = dynamic(() => import("./report-scene"), { ssr: false });

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

const stages = ["수집 · BigQuery", "작성 · LLM", "숫자 대조 · Python", "교정 · LLM", "최종 검수 · Python"] as const;
type Phase = "idle" | "checking" | "fixing" | "final" | "done";

export default function ReportRoom() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [checked, setChecked] = useState(0);
  const [focus, setFocus] = useState<string | null>(null);
  const fixed = phase === "final" || phase === "done";

  useEffect(() => {
    if (phase === "idle" || phase === "done") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      if (phase === "checking" && checked < tokens.length) setChecked(reduced ? tokens.length : checked + 1);
      else setPhase(phase === "checking" ? "fixing" : phase === "fixing" ? "final" : "done");
    }, reduced ? 0 : phase === "checking" ? 420 : 900);
    return () => window.clearTimeout(timer);
  }, [phase, checked]);

  function run() {
    setChecked(0);
    setPhase("checking");
  }

  const pass = (token: Token) => allowed[token.kind].has(fixed && token.fix ? token.fix : token.text);
  // Collect and draft are already done; the number check "fails" once it has caught the planted errors.
  const stageStates: Record<Phase, string[]> = {
    idle: ["done", "done", "wait", "wait", "wait"],
    checking: ["done", "done", "active", "wait", "wait"],
    fixing: ["done", "done", "fail", "active", "wait"],
    final: ["done", "done", "fail", "done", "active"],
    done: ["done", "done", "fail", "done", "done"],
  };

  let tokenIndex = -1;
  // The control room behind reacts to the check: scan while comparing, alarm on the caught errors, green once it passes
  const mood: ReportMood = { idle: "idle", checking: "scan", fixing: "alert", final: "fix", done: "ok" }[phase] as ReportMood;
  return <div className={styles.room}>
    <div className={styles.scene} aria-hidden="true"><ReportScene mood={mood} /></div>
    <header className={styles.toolbar}>
      <form method="dialog"><button type="submit" autoFocus>← 전시관으로 돌아가기</button></form>
      <Link href="/projects/amazon-ads-agent" prefetch={false}>프로젝트 자세히 보기 ↗</Link>
    </header>
    <div className={styles.body}>
      <div className={styles.intro}>
        <p className={styles.roomName}>리포트 관제실</p>
        <h1 id="project-preview-title">Amazon Ads Reporting Agent</h1>
        <p>AI가 리포트를 쓰고, <strong>숫자의 진위는 코드가 판정합니다.</strong> 검증자를 LLM으로 두면 환각을 환각이 승인하기 때문입니다.</p>
      </div>

      <ol className={styles.pipeline} aria-label="리포트 생성 단계">
        {stages.map((stage, index) => <li key={stage} data-state={stageStates[phase][index]}>{stage}{stageStates[phase][index] === "fail" && ` · ${tokens.filter((token) => token.fix).length}건 발견`}</li>)}
      </ol>

      <div className={styles.actions}>
        <button type="button" className={styles.run} onClick={run} disabled={phase !== "idle" && phase !== "done"}>
          {phase === "done" ? "다시 검증하기" : phase === "idle" ? "검증 실행" : "검증 중…"}
        </button>
        <p>체험용 샘플 데이터입니다. 실제 시스템은 모든 금액을 원본 행으로 만든 표의 값과 대조해 통과시킵니다.</p>
      </div>

      <div className={styles.wall}>
        <section className={styles.monitor} aria-labelledby="source-title">
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

        <section className={styles.monitor} aria-labelledby="draft-title">
          <h2 id="draft-title"><span aria-hidden="true">●</span> {fixed ? "교정된 리포트" : "AI가 쓴 리포트 초안"}</h2>
          <p className={styles.draft}>
            {draft.map((part, index) => {
              if (typeof part === "string") return part;
              tokenIndex++;
              const text = fixed && part.fix ? part.fix : part.text;
              const state = tokenIndex >= checked && phase === "checking" ? "wait" : phase === "idle" ? "wait" : pass(part) ? (fixed && part.fix ? "fixed" : "ok") : "bad";
              return <mark key={index} data-state={state} tabIndex={0}
                onPointerEnter={() => setFocus(text)} onPointerLeave={() => setFocus(null)}
                onFocus={() => setFocus(text)} onBlur={() => setFocus(null)}>{text}</mark>;
            })}
          </p>
          <p className={styles.hint}>숫자에 마우스를 올리면 원본 표에서 같은 값을 찾아 줍니다.</p>
        </section>

        <section className={styles.monitor} aria-labelledby="log-title">
          <h2 id="log-title"><span aria-hidden="true">●</span> 검증 기록</h2>
          <ul className={styles.log} aria-live="polite">
            {phase === "idle" && <li>대기 중 · [검증 실행]을 눌러 보세요</li>}
            {tokens.slice(0, checked).map((token) => {
              const ok = allowed[token.kind].has(token.text);
              return <li key={token.text} data-state={ok ? "ok" : "bad"}>{ok ? "✓" : "✗"} {token.text} — {reasons[token.kind][ok ? 0 : 1]}</li>;
            })}
            {fixed && tokens.filter((token) => token.fix).map((token) =>
              <li key={`fix-${token.text}`} data-state="fixed">↺ 교정 {token.text} → {token.fix}</li>)}
            {phase === "done" && <li data-state="ok"><strong>최종 검수 통과 · 모든 숫자와 이름이 원본과 일치</strong></li>}
          </ul>
        </section>
      </div>

      <dl className={styles.facts}>
        <div><dt>누적 적재</dt><dd>1억 3,500만 행</dd></div>
        <div><dt>검증·교정 코드</dt><dd>전체의 20%</dd></div>
        <div><dt>리포트 생성</dt><dd>주간 3~4분</dd></div>
      </dl>
    </div>
  </div>;
}
