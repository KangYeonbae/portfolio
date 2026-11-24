"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import styles from "./byeoljari-room.module.css";

const ObservatorySky = dynamic(() => import("./observatory-sky"), { ssr: false });

const instruments = [
  { id: "saju", name: "사주", symbol: "四", description: "네 기둥의 오행을 읽습니다." },
  { id: "astrology", name: "점성술", symbol: "☾", description: "천궁도에서 천체를 살펴봅니다." },
  { id: "tarot", name: "타로", symbol: "✦", description: "세 장 중 한 장을 뒤집습니다." },
] as const;

const pillars = [
  { label: "년주", characters: "甲子", name: "갑자", element: "나무 · 물" },
  { label: "월주", characters: "丙寅", name: "병인", element: "불 · 나무" },
  { label: "일주", characters: "戊辰", name: "무진", element: "흙 · 흙" },
  { label: "시주", characters: "庚申", name: "경신", element: "금 · 금" },
];

const points = [
  { symbol: "☉", name: "태양", detail: "천궁도에서 태양은 자아와 나를 표현하는 방식을 읽는 데 쓰입니다." },
  { symbol: "☾", name: "달", detail: "달은 감정과 익숙한 환경에서 드러나는 반응을 읽는 데 쓰입니다." },
  { symbol: "↑", name: "상승점", detail: "태어난 순간 동쪽 지평선의 지점이며, 하우스 배치의 기준 중 하나입니다." },
];

const cards = [
  { file: "17_star", name: "별", english: "THE STAR", detail: "회복과 희망. 지금 이어갈 작은 한 걸음을 떠올려 보세요." },
  { file: "18_moon", name: "달", english: "THE MOON", detail: "직관과 불확실함. 어떤 감정에서 이 선택이 시작됐는지 살펴보세요." },
  { file: "19_sun", name: "태양", english: "THE SUN", detail: "명료함과 활기. 이미 잘 풀리고 있는 것은 무엇인지 돌아보세요." },
];

function Saju() {
  const [active, setActive] = useState(2);
  return <>
    <h2>예시 명식</h2>
    <div className={styles.pillars} role="group" aria-label="네 기둥">
      {pillars.map((pillar, index) => <button key={pillar.label} type="button" aria-pressed={active === index} onClick={() => setActive(index)}>
        <span>{pillar.label}</span><strong lang="zh">{pillar.characters}</strong><small>{pillar.name}</small>
      </button>)}
    </div>
    <p className={styles.result} aria-live="polite">{pillars[active].label} · {pillars[active].name} · {pillars[active].element}</p>
  </>;
}

function Astrology() {
  const [active, setActive] = useState(0);
  return <>
    <h2>예시 천궁도</h2>
    <div className={styles.chart} role="group" aria-label="천궁도 읽기">
      {points.map((point, index) => <button key={point.name} type="button" aria-pressed={active === index} onClick={() => setActive(index)}>
        <span aria-hidden="true">{point.symbol}</span>{point.name}
      </button>)}
    </div>
    <p className={styles.result} aria-live="polite">{points[active].detail}</p>
  </>;
}

function Tarot() {
  const [picked, setPicked] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const result = picked === null ? null : cards[(picked + offset) % cards.length];
  return <>
    <h2>오늘의 카드</h2>
    <div className={styles.cards} role="group" aria-label="타로 카드 세 장">
      {cards.map((_, index) => (
        <button key={index} type="button" className={styles.card}
          aria-label={picked === index ? `${result?.name} 카드` : `${index + 1}번 카드 뒤집기`}
          aria-pressed={picked === index}
          onClick={() => setPicked(index)}>
          {picked === index && result ? (
            <Image className={styles.cardFace} src={`/project-media/byeoljari-${result.file}.webp`} alt="" fill sizes="(max-width: 600px) 24vw, 116px" />
          ) : <span className={styles.cardBack} aria-hidden="true"><i /><b>☾</b><i /></span>}
        </button>
      ))}
    </div>
    <div className={styles.result} aria-live="polite">
      {result ? <><strong>{result.name} · {result.english}</strong><p>{result.detail}</p></> : "마음에 드는 카드를 골라보세요."}
    </div>
    {result && <button type="button" className={styles.reset} onClick={() => {
      setPicked(null);
      setOffset((value) => (value + 1) % cards.length);
    }}>다시 고르기</button>}
  </>;
}

export function ByeoljariRoom() {
  const [tool, setTool] = useState<(typeof instruments)[number]["id"]>("tarot");

  return (
    <div className={styles.room}>
      <div className={styles.backdrop} aria-hidden="true"><ObservatorySky /></div>
      <header className={styles.top}>
        <form method="dialog"><button type="submit" autoFocus>← 전시관으로 돌아가기</button></form>
      </header>
      <div className={styles.layout}>
        <div className={styles.intro}>
          <p>Byeoljari.com</p>
          <h1 id="project-preview-title">별자리 관측실</h1>
          <div className={styles.instruments} role="group" aria-label="관측 도구 선택">
            {instruments.map((item) => (
              <button key={item.id} type="button" data-instrument={item.id} aria-pressed={tool === item.id} onClick={() => setTool(item.id)}>
                <span className={styles.instrumentIcon} aria-hidden="true">{item.symbol}</span>
                <span><strong>{item.name}</strong><small>{item.description}</small></span>
              </button>
            ))}
          </div>
          <div className={styles.links}>
            <a href="https://byeoljari.com" target="_blank" rel="noreferrer">별자리 서비스 열기 ↗</a>
            <Link href="/projects/byeoljari">프로젝트 자세히 보기 ↗</Link>
          </div>
        </div>
        <section key={tool} className={styles.workbench} aria-label={instruments.find((item) => item.id === tool)?.name}>
          {tool === "saju" ? <Saju /> : tool === "astrology" ? <Astrology /> : <Tarot />}
          <p className={styles.sample}>포트폴리오 체험용 예시</p>
        </section>
      </div>
      <footer className={styles.credits}><a href="/sky/credits.txt" target="_blank" rel="noreferrer">별 데이터 · HYG</a></footer>
    </div>
  );
}
