"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./bid-room.module.css";

// Sample notices with made-up schools and prices. Rules follow Bid Master:
// floor price = item total × assessment rate, expected profit = floor price − our cost.
const RATE = 0.88;
const HANDLED = "축산";
type Item = { raw: string; std: string; price: number; qty: number };
type Notice = { school: string; source: "구조화 데이터" | "엑셀 규칙 파서" | "LLM 폴백"; group: string; cost: number; items: Item[] };
const notices: Notice[] = [
  { school: "서울 A초", source: "엑셀 규칙 파서", group: "축산", cost: 980000, items: [
    { raw: "한우양지(국거리용) 1kg", std: "쇠고기 › 양지", price: 18000, qty: 30 },
    { raw: "돈육 앞다리 다짐", std: "돼지고기 › 앞다리", price: 9000, qty: 40 },
    { raw: "계육 닭가슴살(냉장)", std: "닭고기 › 가슴살", price: 7000, qty: 50 },
  ] },
  { school: "경기 B중", source: "구조화 데이터", group: "축산", cost: 606000, items: [
    { raw: "소고기 우둔 슬라이스", std: "쇠고기 › 우둔", price: 22000, qty: 20 },
    { raw: "돈삼겹 구이용", std: "돼지고기 › 삼겹살", price: 15000, qty: 20 },
  ] },
  { school: "서울 C고", source: "엑셀 규칙 파서", group: "수산", cost: 0, items: [
    { raw: "고등어 순살 필렛", std: "수산 › 고등어", price: 6000, qty: 40 },
    { raw: "오징어 링 냉동", std: "수산 › 오징어", price: 8000, qty: 25 },
  ] },
  { school: "경기 D초", source: "LLM 폴백", group: "축산", cost: 628400, items: [
    { raw: "우사태 (장조림)", std: "쇠고기 › 사태", price: 16000, qty: 25 },
    { raw: "돈 목살-구이", std: "돼지고기 › 목심", price: 14000, qty: 20 },
  ] },
  { school: "서울 E초", source: "구조화 데이터", group: "축산", cost: 651200, items: [
    { raw: "한우 불고기감", std: "쇠고기 › 불고기", price: 20000, qty: 15 },
    { raw: "닭다리살 정육", std: "닭고기 › 다리살", price: 8000, qty: 40 },
    { raw: "돈등심 돈까스용", std: "돼지고기 › 등심", price: 11000, qty: 20 },
  ] },
  { school: "경기 F중", source: "엑셀 규칙 파서", group: "농산", cost: 0, items: [
    { raw: "감자(특) 10kg", std: "농산 › 감자", price: 21000, qty: 6 },
    { raw: "깐양파", std: "농산 › 양파", price: 3000, qty: 30 },
  ] },
];

const won = (value: number) => `${value.toLocaleString("ko-KR")}원`;
function judge(notice: Notice) {
  const total = notice.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const floor = Math.round(total * RATE);
  const profit = floor - notice.cost;
  const handled = notice.group === HANDLED;
  return { total, floor, profit, pick: handled && profit > 0, reason: !handled ? "취급 품목 아님" : profit > 0 ? "검토 대상" : "예상이익 마이너스" };
}
const results = notices.map(judge);
const picks = results.filter((result) => result.pick).length;

export default function BidRoom() {
  const [done, setDone] = useState(0);
  const [running, setRunning] = useState(false);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!running) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      if (done >= notices.length) return setRunning(false);
      const next = reduced ? notices.length : done + 1;
      setSelected(next - 1);
      setDone(next);
    }, reduced ? 0 : 950);
    return () => window.clearTimeout(timer);
  }, [running, done]);

  function start() {
    setDone(0);
    setSelected(0);
    setRunning(true);
  }

  const notice = notices[selected];
  const result = results[selected];
  const shown = selected < done;
  const finished = done === notices.length && !running;

  return <div className={styles.room}>
    <header className={styles.toolbar}>
      <form method="dialog"><button type="submit" autoFocus>← 전시관으로 돌아가기</button></form>
      <Link href="/projects/bid-master" prefetch={false}>프로젝트 자세히 보기 ↗</Link>
    </header>
    <div className={styles.body}>
      <div className={styles.intro}>
        <p className={styles.roomName}>입찰 분류대</p>
        <h1 id="project-preview-title">Bid Master</h1>
        <p>학교마다 제각각인 품목 표기를 표준 품목으로 맞추고, <strong>남는 공고만 골라 보냅니다.</strong> 공고 검토 3~4시간이 30분으로 줄었습니다.</p>
        <button type="button" className={styles.start} onClick={start} disabled={running}>
          {running ? "분류 중…" : done ? "다시 분류" : "분류 시작"}
        </button>
      </div>

      <section className={styles.inbox} aria-labelledby="inbox-title">
        <h2 id="inbox-title">오늘 들어온 학교급식 공고 {notices.length}건 · 취급: {HANDLED}</h2>
        <ol>
          {notices.map((item, index) => {
            const state = index >= done ? "wait" : results[index].pick ? "pick" : "drop";
            return <li key={item.school}>
              <button type="button" data-state={state} aria-pressed={selected === index} disabled={index >= done}
                onClick={() => setSelected(index)}>
                <span className={styles.school}>{item.school} <small>{item.group}</small></span>
                <span className={styles.source} data-source={item.source}>{item.source}</span>
                <span className={styles.verdict}>{state === "wait" ? "대기" : results[index].reason}</span>
              </button>
            </li>;
          })}
        </ol>
        <p className={styles.mail} data-on={finished} aria-live="polite">
          {finished ? `✉ 검토 대상 ${picks}건을 담당자 메일로 보냈습니다` : "분류가 끝나면 검토 대상만 메일로 보냅니다"}
        </p>
      </section>

      <section className={styles.sheet} aria-labelledby="sheet-title" aria-live="polite">
        <h2 id="sheet-title">현품설명서 · {notice.school}</h2>
        {!shown ? <p className={styles.placeholder}>[분류 시작]을 누르면 공고를 하나씩 읽습니다.</p> : <>
          <table>
            <thead><tr><th scope="col">학교가 쓴 표기</th><th scope="col">표준 품목</th><th scope="col">금액</th></tr></thead>
            <tbody>
              {notice.items.map((item) => <tr key={item.raw}>
                <td>{item.raw}</td>
                <td><span className={styles.code} data-handled={notice.group === HANDLED}>{item.std}</span></td>
                <td>{won(item.price * item.qty)}</td>
              </tr>)}
            </tbody>
          </table>
          {notice.group === HANDLED ? <dl className={styles.calc}>
            <div><dt>품목 합계</dt><dd>{won(result.total)}</dd></div>
            <div><dt>하한가 (× 사정률 {RATE * 100}%)</dt><dd>{won(result.floor)}</dd></div>
            <div><dt>내 물품가</dt><dd>− {won(notice.cost)}</dd></div>
            <div data-profit={result.profit > 0 ? "plus" : "minus"}><dt>예상이익</dt><dd>{result.profit > 0 ? "+" : "−"} {won(Math.abs(result.profit))}</dd></div>
          </dl> : <p className={styles.skip}>표준 품목이 {notice.group}이라 계산 전에 제외했습니다.</p>}
        </>}
      </section>
    </div>
  </div>;
}
