"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import type { SkyDirection } from "./observatory-sky";
import { constellations, type ConstellationButtons, type ConstellationId } from "./observatory-constellations";
import styles from "./byeoljari-room.module.css";

const ObservatorySky = dynamic(() => import("./observatory-sky"), { ssr: false });

const instruments = [
  { id: "saju", name: "사주", symbol: "四", description: "네 기둥의 오행을 읽습니다." },
  { id: "astrology", name: "점성술", symbol: "☾", description: "천궁도에서 천체를 살펴봅니다." },
  { id: "tarot", name: "타로", symbol: "✦", description: "세 장 중 한 장을 뒤집습니다." },
  { id: "sky", name: "별 관측", symbol: "⌖", description: "하늘의 방향을 바꿉니다." },
] as const;

const skyDirections = [
  { id: "north", name: "북쪽", description: "북극성이 떠 있는 북쪽 하늘을 봅니다." },
  { id: "east", name: "동쪽", description: "별이 떠오르는 동쪽 지평선 위를 살펴봅니다." },
  { id: "south", name: "남쪽", description: "별이 가장 높이 지나는 남쪽 하늘을 봅니다." },
  { id: "west", name: "서쪽", description: "별이 지는 서쪽 하늘을 살펴봅니다." },
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
  const [reading, setReading] = useState(false);
  const [offset, setOffset] = useState(0);
  const result = picked === null ? null : cards[(picked + offset) % cards.length];
  // choose: three cards → flip: the others leave, the pick turns over → read: card slides left, reading on the right.
  const phase = picked === null ? "choose" : reading ? "read" : "flip";
  return <div className={styles.tarot} data-phase={phase}>
    <div className={styles.cards} role="group" aria-label="타로 카드 세 장">
      {cards.map((_, index) => {
        const chosen = picked === index;
        return <button key={index} type="button" className={styles.card} data-chosen={chosen}
          style={{ "--shift": 1 - index } as CSSProperties}
          disabled={picked !== null && !chosen}
          aria-label={chosen && result ? `${result.name} 카드${reading ? "" : ", 풀이 보기"}` : `${index + 1}번 카드 고르기`}
          onClick={() => picked === null ? setPicked(index) : setReading(true)}>
          <span className={styles.cardInner}>
            <span className={styles.cardBack} aria-hidden="true"><span className={styles.cardMotif}><i /><b>☾</b><i /></span></span>
            <span className={styles.cardFront}>
              {chosen && result && <Image src={`/project-media/byeoljari-${result.file}.webp`} alt="" fill sizes="12rem" />}
            </span>
          </span>
        </button>;
      })}
    </div>
    <p className={styles.hint} aria-live="polite">
      {phase === "choose" ? "마음에 드는 카드를 한 장 골라보세요." : phase === "flip" ? "카드를 한 번 더 누르면 풀이가 열립니다." : `${result?.name} · ${result?.english}`}
    </p>
    {reading && result && <div className={styles.reading}>
      <p className={styles.readingLabel}>{result.english}</p>
      <h2>{result.name}</h2>
      <p>{result.detail}</p>
      <button type="button" onClick={() => {
        setReading(false);
        setPicked(null);
        setOffset((value) => (value + 1) % cards.length);
      }}>다시 고르기</button>
      <p className={styles.sample}>포트폴리오 체험용 예시</p>
    </div>}
  </div>;
}

type Tool = (typeof instruments)[number]["id"];

export function ByeoljariRoom() {
  const [tool, setTool] = useState<Tool | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [direction, setDirection] = useState<SkyDirection>("north");
  const [constellationsReady, setConstellationsReady] = useState(false);
  const buttons = useRef<ConstellationButtons>({});
  const returnFocus = useRef<ConstellationId | null>(null);
  const showConstellations = revealed && tool === null;
  const markConstellationsReady = useCallback(() => {
    setConstellationsReady(true);
    if (returnFocus.current) {
      buttons.current[returnFocus.current]?.focus({ preventScroll: true });
      returnFocus.current = null;
    }
  }, []);
  const reveal = useCallback(() => setRevealed(true), []);
  const intro = useRef<HTMLDivElement>(null);
  // Stable callback ref: focuses the stage once when a tool opens (the clicked button goes inert).
  const focusStage = useCallback((node: HTMLElement | null) => node?.focus({ preventScroll: true }), []);

  function closeTool() {
    const previous = tool;
    if (previous && previous !== "sky" && constellationsReady) returnFocus.current = previous;
    flushSync(() => {
      setDirection("north");
      setTool(null);
    });
    if (!returnFocus.current) {
      intro.current?.querySelector<HTMLButtonElement>(`[data-instrument="${previous}"]`)?.focus();
    }
  }

  // Safety net if WebGL never starts; the dome sweep normally reveals the panels first.
  useEffect(() => {
    const timer = window.setTimeout(reveal, 9000);
    return () => window.clearTimeout(timer);
  }, [reveal]);

  return (
    <div className={styles.room} onPointerDown={reveal} onKeyDown={reveal}>
      <div className={styles.backdrop} aria-hidden="true">
        <ObservatorySky onIntroEnd={reveal} direction={direction} skipIntro={revealed}
          buttons={buttons} showConstellations={showConstellations} onConstellationsReady={markConstellationsReady} />
      </div>
      <header className={styles.top}>
        <form method="dialog"><button type="submit" autoFocus>← 전시관으로 돌아가기</button></form>
      </header>
      {!revealed && <p className={styles.skipHint}>돔이 한 바퀴 도는 중 · 누르면 바로 시작</p>}
      {showConstellations && <div className={styles.constellationControls} data-ready={constellationsReady}
        aria-label="별자리 체험 선택" role="group">
        {constellations.map((item) => <button key={item.id} type="button" data-constellation={item.id}
          aria-label={`${item.name} 별자리 열기`}
          style={{ "--sky-accent": item.color, "--sky-art": `url(${item.art})` } as CSSProperties}
          ref={(button) => {
            if (button) buttons.current[item.id] = button;
            else delete buttons.current[item.id];
          }}
          onClick={() => setTool(item.id)}>{item.name}</button>)}
      </div>}
      <div className={styles.layout} data-revealed={revealed} data-celestial-menu={showConstellations && constellationsReady}>
        <div ref={intro} className={styles.intro} data-hidden={tool !== null} inert={tool !== null}>
          <p>Byeoljari.com</p>
          <h1 id="project-preview-title">별자리 관측실</h1>
          <div className={styles.instruments} role="group" aria-label="관측 도구 선택">
            {instruments.filter((item) => !constellationsReady || item.id === "sky").map((item) => (
              <button key={item.id} type="button" data-instrument={item.id} onClick={() => setTool(item.id)}>
                <span className={styles.instrumentIcon} aria-hidden="true">{item.symbol}</span>
                <span><strong>{item.name}</strong><small>{item.description}</small></span>
              </button>
            ))}
          </div>
          <div className={styles.links}>
            <a href="https://byeoljari.com" target="_blank" rel="noreferrer">별자리 서비스 열기 ↗</a>
            <Link href="/projects/byeoljari" prefetch={false}>프로젝트 자세히 보기 ↗</Link>
          </div>
        </div>
        {tool && <section key={tool} ref={focusStage} tabIndex={-1} className={styles.stage}
          aria-label={instruments.find((item) => item.id === tool)?.name}>
          <button type="button" className={styles.stageBack} onClick={closeTool}>← 관측실로</button>
          {tool === "sky" ? <div className={`${styles.workbench} ${styles.skyWorkbench}`}>
            <h2>어느 쪽 하늘을 볼까요?</h2>
            <div className={styles.skyDirections} role="group" aria-label="관측 방향">
              {skyDirections.map((item) => <button type="button" key={item.id} aria-pressed={direction === item.id}
                onClick={() => setDirection(item.id)}>{item.name}</button>)}
            </div>
            <p className={styles.sample} aria-live="polite">{skyDirections.find((item) => item.id === direction)?.description}</p>
          </div> : tool === "tarot" ? <Tarot /> : <div className={styles.workbench}>
            {tool === "saju" ? <Saju /> : <Astrology />}
            <p className={styles.sample}>포트폴리오 체험용 예시</p>
          </div>}
        </section>}
      </div>
      <footer className={styles.credits}><a href="/sky/credits.txt" target="_blank" rel="noreferrer">별 데이터 · HYG</a></footer>
    </div>
  );
}
