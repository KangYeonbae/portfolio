"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./voc-room.module.css";

// Invented conversations. Summaries stand in for the LLM; categories come from fixed rules,
// so the same conversation always lands in the same category.
const rules = [
  { category: "환불·반품", words: ["환불", "반품"] },
  { category: "배송 지연", words: ["안 왔", "송장"] },
  { category: "제품 불량", words: ["충전이 안", "고장"] },
];
const chats = [
  {
    time: "09:12", customer: "고객 010-****-6789",
    lines: [
      ["고객", "주문한 지 5일째인데 아직 안 왔어요. 송장 조회도 안 되고요."],
      ["상담원", "불편을 드려 죄송합니다. 확인해 보니 택배사 집하가 늦어져 내일 출고 예정입니다."],
      ["고객", "내일은 꼭 보내 주세요. 선물이라 급해요."],
    ],
    summary: "택배사 집하 지연으로 5일째 미도착. 내일 출고를 안내했고, 선물이라 빠른 발송을 원함.",
    status: "출고 안내",
  },
  {
    time: "10:47", customer: "고객 010-****-2210",
    lines: [
      ["고객", "사이즈가 안 맞아서 환불하고 싶어요. 상자는 버렸는데 괜찮을까요?"],
      ["상담원", "상자가 없어도 상품만 상하지 않았다면 반품 접수가 가능합니다."],
    ],
    summary: "사이즈 불만으로 환불 요청. 상자 없이도 반품 가능하다고 안내하고 접수함.",
    status: "처리 완료",
  },
  {
    time: "14:05", customer: "고객 010-****-0423",
    lines: [
      ["고객", "충전기를 꽂으면 불만 깜빡이고 충전이 안 돼요."],
      ["상담원", "사용 중 불편을 드려 죄송합니다. 새 제품으로 교환해 드리겠습니다."],
    ],
    summary: "충전 불량(표시등만 깜빡임). 새 제품 교환을 접수함.",
    status: "교환 접수",
  },
];

function classify(text: string) {
  for (const rule of rules) {
    const word = rule.words.find((candidate) => text.includes(candidate));
    if (word) return { category: rule.category, word };
  }
  return { category: "기타", word: "" };
}
const results = chats.map((chat) => classify(chat.lines.filter(([who]) => who === "고객").map(([, text]) => text).join(" ")));

function Highlight({ text, word }: { text: string; word: string }) {
  if (!word || !text.includes(word)) return text;
  const [before, ...rest] = text.split(word);
  return <>{before}<mark>{word}</mark>{rest.join(word)}</>;
}

export default function VocRoom() {
  const [done, setDone] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      if (done >= chats.length) return setRunning(false);
      setDone(reduced ? chats.length : done + 1);
    }, reduced ? 0 : 1100);
    return () => window.clearTimeout(timer);
  }, [running, done]);

  function start() {
    setDone(0);
    setRunning(true);
  }

  return <div className={styles.room}>
    <header className={styles.toolbar}>
      <form method="dialog"><button type="submit" autoFocus>← 전시관으로 돌아가기</button></form>
      <Link href="/projects/voc-analyzer" prefetch={false}>프로젝트 자세히 보기 ↗</Link>
    </header>
    <div className={styles.body}>
      <div className={styles.intro}>
        <p className={styles.roomName}>상담 분류실</p>
        <h1 id="project-preview-title">VOC Counseling Analyzer</h1>
        <p><strong>요약은 LLM이, 분류는 고정된 규칙이</strong> 맡습니다. 같은 상담이 날마다 다른 분류로 바뀌면 통계를 낼 수 없기 때문입니다.</p>
      </div>

      <div className={styles.app}>
        <div className={styles.titlebar}>
          <span aria-hidden="true">● ● ●</span>
          <b>VOC Analyzer.exe</b>
          <button type="button" className={styles.start} onClick={start} disabled={running}>
            {running ? "분석 중…" : done ? "다시 분석" : "분석 실행"}
          </button>
        </div>
        <div className={styles.panes}>
          <section className={styles.chats} aria-label="오늘 상담 3건">
            {chats.map((chat, index) => {
              const result = results[index];
              const analyzed = index < done;
              return <article key={chat.time} data-analyzed={analyzed}>
                <header><span>{chat.time} · {chat.customer}</span><small>개인정보 가림</small></header>
                {analyzed ? <div className={styles.card}>
                  <p><span className={styles.tag} data-kind="llm">요약 · LLM</span> {chat.summary}</p>
                  <p><span className={styles.tag} data-kind="rule">분류 · 규칙</span> <b>{result.category}</b> <small>“{result.word}” 포함</small></p>
                </div> : <ul className={styles.lines}>
                  {chat.lines.map(([who, text]) => <li key={text} data-who={who}><b>{who}</b> {who === "고객" ? <Highlight text={text} word={running && index === done ? result.word : ""} /> : text}</li>)}
                </ul>}
              </article>;
            })}
          </section>

          <section className={styles.sheet} aria-labelledby="sheet-title">
            <h2 id="sheet-title"><span aria-hidden="true">▦</span> VOC 리포트 · Google Sheets</h2>
            <div className={styles.grid} role="table" aria-label="VOC 리포트">
              <div role="row" className={styles.head}>
                {["시간", "분류", "요약", "처리"].map((cell) => <span role="columnheader" key={cell}>{cell}</span>)}
              </div>
              {chats.slice(0, done).map((chat, index) => <div role="row" key={chat.time} className={styles.row}>
                <span role="cell">{chat.time}</span>
                <span role="cell">{results[index].category}</span>
                <span role="cell">{chat.summary}</span>
                <span role="cell">{chat.status}</span>
              </div>)}
              {done === 0 && <p className={styles.empty}>분석 결과가 팀이 이미 쓰는 시트로 쌓입니다.</p>}
            </div>
          </section>
        </div>
      </div>

      <dl className={styles.facts}>
        <div><dt>반복 업무</dt><dd>약 40% 절감</dd></div>
        <div><dt>배포</dt><dd>설치 없이 실행 파일 하나</dd></div>
        <div><dt>결과 위치</dt><dd>팀의 Google Sheets</dd></div>
      </dl>
    </div>
  </div>;
}
