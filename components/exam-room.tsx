"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import styles from "./exam-room.module.css";

// Ported from the Exam Forge "crossing-angle" generator: the question, answer, choices and figure
// are all computed from the same two parameters, so they can never disagree.
type Relation = "vertical" | "linear";
const relations: Record<Relation, { label: string; misconception: string; steps: (given: number, answer: number) => string[] }> = {
  vertical: {
    label: "맞꼭지각",
    misconception: "맞꼭지각의 크기가 같다는 성질 대신 두 각을 더해 180°로 보았습니다.",
    steps: (given) => ["서로 마주 보는 맞꼭지각의 크기는 같습니다.", `x = ${given}° 입니다.`],
  },
  linear: {
    label: "한 직선 위의 이웃한 각",
    misconception: "한 직선 위의 이웃한 두 각을 맞꼭지각처럼 같은 크기로 보았습니다.",
    steps: (given, answer) => ["한 직선 위의 이웃한 두 각의 합은 180°입니다.", `x + ${given}° = 180° 이므로 x = ${answer}° 입니다.`],
  },
};
const MIN = 25;
const MAX = 155;
const slip = "관계는 맞게 적용했지만 계산 과정에서 실수했습니다.";

function build(given: number, relation: Relation) {
  // Direction of the slanted line; x always sits between it and the left half of the horizontal line.
  const slope = relation === "vertical" ? 180 - given : given;
  const answer = 180 - slope;
  const candidates = [
    { value: answer === given ? 180 - given : given, feedback: relations[relation].misconception },
    ...[-5, 5, -10, 10, -1, 1].map((offset) => ({ value: answer + offset, feedback: slip })),
  ];
  const seen = new Set([answer]);
  const wrong = candidates.filter(({ value }) => {
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  }).slice(0, 4);
  const choices = [...wrong.map((item) => ({ ...item, correct: false }))];
  // The real builder places the answer by variant; the given angle plays that role here.
  choices.splice(given % 5, 0, { value: answer, feedback: "정답입니다.", correct: true });
  return {
    slope, answer, choices,
    givenArc: relation === "vertical" ? [180 + slope, 360] : [0, slope],
    answerArc: [slope, 180],
  };
}

const C = { x: 160, y: 112 };
const point = (angle: number, radius: number) => {
  const rad = angle * Math.PI / 180;
  return [C.x + radius * Math.cos(rad), C.y - radius * Math.sin(rad)];
};
function arc([from, to]: number[], radius: number) {
  const [x1, y1] = point(from, radius);
  const [x2, y2] = point(to, radius);
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${radius} ${radius} 0 0 0 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

// Five variants with different angles and answers, stepping through the generator range from the current one.
function variants(given: number, relation: Relation) {
  const list: { given: number; relation: Relation; answer: number }[] = [];
  const answers = new Set([build(given, relation).answer]);
  for (let step = 1; list.length < 5; step++) {
    const next = { given: MIN + (given - MIN + step * 26) % (MAX - MIN + 1), relation: step % 2 ? (relation === "vertical" ? "linear" : "vertical") as Relation : relation };
    const answer = build(next.given, next.relation).answer;
    if (answers.has(answer)) continue;
    answers.add(answer);
    list.push({ ...next, answer });
  }
  return list;
}

const ORIGINAL = 65;
const original = build(ORIGINAL, "vertical");
const friend = [
  "기출 그대로 내면 안 돼서 숫자를 조금씩 바꿔서 내야 하거든",
  "근데 숫자 하나 바꾸면 도형을 한글로 다시 그려야 해… 워드도 똑같고 😭",
];

function Figure({ slope, givenArc, answerArc, given, text }: { slope: number; givenArc: number[]; answerArc: number[]; given: number; text?: string }) {
  const [ax, ay] = point(slope, 128);
  const [bx, by] = point(slope + 180, 128);
  const label = (range: number[], radius: number) => point((range[0] + range[1]) / 2, radius);
  const [gx, gy] = label(givenArc, 44);
  const [xx, xy] = label(answerArc, 40);
  return <svg viewBox="0 0 320 224" role="img" aria-label={text === undefined ? `두 직선이 만나 한 각이 ${given}도인 그림` : `각 표시는 ${text}로 바뀌었지만 선은 그대로 ${given}도인 그림`}>
    <line x1={C.x - 140} y1={C.y} x2={C.x + 140} y2={C.y} />
    <line x1={bx} y1={by} x2={ax} y2={ay} />
    <path d={arc(givenArc, 24)} />
    <path d={arc(answerArc, 20)} data-answer />
    <text x={gx} y={gy} data-edited={text !== undefined || undefined}>{text ?? `${given}°`}</text>
    <text x={xx} y={xy} data-answer><tspan fontStyle="italic">x</tspan>°</text>
  </svg>;
}

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(notify: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
}

function CafeScene({ onNext }: { onNext: () => void }) {
  const [shown, setShown] = useState(0);
  const [zooming, setZooming] = useState(false);
  const reduced = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => true);
  const count = reduced ? friend.length : shown;

  useEffect(() => {
    if (count >= friend.length) return;
    const timer = window.setTimeout(() => setShown(count + 1), count ? 1600 : 900);
    return () => window.clearTimeout(timer);
  }, [count]);

  useEffect(() => {
    if (!zooming) return;
    const timer = window.setTimeout(onNext, 950);
    return () => window.clearTimeout(timer);
  }, [zooming, onNext]);

  return <section className={styles.cafe} aria-labelledby="project-preview-title" data-zooming={zooming}>
    <h1 id="project-preview-title" className={styles.srOnly}>Exam Forge</h1>
    <div className={styles.cafeCamera}>
      <Image src="/project-media/exam-cafe.webp" alt="카페에서 선생님 친구가 노트북을 보여 주며 이마를 짚고, 개발자인 내가 화면을 들여다봅니다." fill sizes="(max-width: 700px) 100vw, 82rem" loading="eager" />
    </div>
    <div className={styles.talk}>
      <ol className={styles.bubbles} aria-live="polite">
        {friend.slice(0, count).map((text) => <li key={text}><p><span className={styles.srOnly}>선생님 친구: </span>{text}</p></li>)}
      </ol>
      {count >= friend.length && <button type="button" className={styles.reply} disabled={zooming}
        onClick={() => reduced ? onNext() : setZooming(true)}>어떤데? 보여 줘 봐</button>}
    </div>
  </section>;
}

function HwpEditor({ onSolve }: { onSolve: (given: number) => void }) {
  const [value, setValue] = useState(String(ORIGINAL));
  const [edited, setEdited] = useState<number | null>(null);
  const valid = /^\d{1,3}$/.test(value) && Number(value) >= MIN && Number(value) <= MAX && Number(value) !== ORIGINAL;
  const issues = edited === null ? [] : [
    `선은 그대로 ${ORIGINAL}° — 선을 다시 그려야 합니다`,
    `정답 선택지는 그대로 ${ORIGINAL}° — 선택지 5개를 다시 계산해야 합니다`,
    `해설도 x = ${ORIGINAL}° — 해설을 고쳐야 합니다`,
  ];

  return <div className={styles.editorStage}>
    <h1 id="project-preview-title" className={styles.srOnly}>Exam Forge</h1>
    <section className={styles.hwp} aria-label="문서 편집기에서 기출문제 고치기">
      <div className={styles.hwpTitle} aria-hidden="true"><span>기출_중1_기본도형.hwp</span><span>— ▢ ✕</span></div>
      <div className={styles.hwpMenu} aria-hidden="true">{["파일", "편집", "보기", "입력", "서식", "쪽", "도구"].map((menu) => <span key={menu}>{menu}</span>)}</div>
      <form className={styles.hwpBox} onSubmit={(event) => { event.preventDefault(); if (valid) setEdited(Number(value)); }}>
        <label htmlFor="hwp-label">선택한 글상자</label>
        <input id="hwp-label" inputMode="numeric" value={value} onChange={(event) => setValue(event.target.value.trim())} maxLength={3} />
        <span>°</span>
        <button type="submit" disabled={!valid}>바꾸기</button>
      </form>
      <div className={styles.hwpPage}>
        <p><b>1.</b> 다음 그림에서 <i>x</i>의 크기를 구하시오.</p>
        <div data-bad={edited !== null || undefined}>
          <Figure slope={original.slope} givenArc={original.givenArc} answerArc={original.answerArc} given={ORIGINAL} text={edited === null ? undefined : `${edited}°`} />
        </div>
        <ol className={styles.hwpChoices} data-bad={edited !== null || undefined}>
          {original.choices.map((option, index) => <li key={option.value}>{"①②③④⑤"[index]} {option.value}°</li>)}
        </ol>
        <p className={styles.hwpNote} data-bad={edited !== null || undefined}>해설: 맞꼭지각의 크기는 같으므로 x = {ORIGINAL}°</p>
      </div>
    </section>

    <aside className={styles.task} aria-live="polite">
      {edited === null ? <>
        <h2>기출문제를 새 문제로 바꿔 보세요</h2>
        <p>그림 속 <b>{ORIGINAL}°</b>를 다른 숫자({MIN}~{MAX}°, 예: 70)로 고치고 <b>바꾸기</b>를 누르세요.</p>
      </> : <>
        <h2>숫자 하나 고쳤는데, 다시 손볼 곳 {issues.length}곳</h2>
        <ul>{issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>
        <p>이걸 문제마다, 시험마다 반복해야 합니다.</p>
        <button type="button" className={styles.reply} onClick={() => onSolve(edited)}>내가 만들어 줄게 →</button>
      </>}
    </aside>
  </div>;
}

export default function ExamRoom() {
  const [stage, setStage] = useState<"chat" | "editor" | "forge">("chat");
  const [given, setGiven] = useState(70);
  const [relation, setRelation] = useState<Relation>("vertical");
  const [picked, setPicked] = useState<number | null>(null);
  const [fan, setFan] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLElement>(null);
  const item = build(given, relation);
  const version = `${given}-${relation}`;
  const choice = picked === null ? null : item.choices[picked];

  useEffect(() => {
    if (stage === "chat") return;
    stageRef.current?.focus({ preventScroll: true });
    stageRef.current?.scrollIntoView({ block: "start" });
  }, [stage]);

  const openEditor = useCallback(() => setStage("editor"), []);

  function change(next: { given?: number; relation?: Relation }) {
    setPicked(null);
    setFan(false);
    if (next.given !== undefined) setGiven(next.given);
    if (next.relation) setRelation(next.relation);
  }

  return <div className={styles.room}>
    <header className={styles.toolbar}>
      <form method="dialog"><button type="submit" autoFocus>← 전시관으로 돌아가기</button></form>
      <div className={styles.toolbarActions}>
        {stage === "forge" ? <button type="button" onClick={() => { change({ given: 70, relation: "vertical" }); setStage("chat"); }}>처음부터 보기</button>
          : <button type="button" onClick={() => setStage("forge")}>바로 Exam Forge 열기</button>}
        <Link href="/projects/exam-forge" prefetch={false}>프로젝트 자세히 보기 ↗</Link>
      </div>
    </header>
    <div ref={stageRef} tabIndex={-1} className={styles.stage}>
    {stage === "chat" ? <CafeScene onNext={openEditor} />
      : stage === "editor" ? <HwpEditor onSolve={(value) => { change({ given: value, relation: "vertical" }); setStage("forge"); }} />
      : <div className={styles.body}>
      <section className={styles.board} aria-labelledby="project-preview-title">
        <p className={styles.roomName}>수학 편집실</p>
        <h1 id="project-preview-title">Exam Forge</h1>
        <p className={styles.lead}>문제와 정답을 저장하지 않습니다. <strong>숫자 두 개에서 문제·정답·선택지·그림이 함께 만들어집니다.</strong></p>

        <div className={styles.controls}>
          <label htmlFor="exam-given">주어진 각 <output htmlFor="exam-given">{given}°</output></label>
          <input id="exam-given" type="range" min={MIN} max={MAX} value={given}
            onChange={(event) => change({ given: Number(event.target.value) })} />
          <p className={styles.range}>편집 범위 {MIN}°~{MAX}°는 생성기 정의에서 옵니다.</p>
          <div className={styles.relations} role="group" aria-label="두 각의 관계">
            {(Object.keys(relations) as Relation[]).map((key) => <button key={key} type="button" aria-pressed={relation === key}
              onClick={() => change({ relation: key })}>{relations[key].label}</button>)}
          </div>
        </div>

        <pre className={styles.code} aria-label="생성기 호출"><code>{`build({ 주어진각: ${given}, 관계: "${relations[relation].label}" })`}</code></pre>
        <ul className={styles.outputs} aria-label="함께 다시 만들어진 것">
          {["문제 본문", `정답 ${item.answer}°`, "선택지 5개", "그림"].map((label) =>
            <li key={`${label}-${version}`}>↳ {label}</li>)}
        </ul>
        <button type="button" className={styles.reply} aria-pressed={fan} onClick={() => setFan(!fan)}>{fan ? "시험지 하나로 보기" : "변형 문제 5개 만들기"}</button>
      </section>

      {fan ? <section className={styles.fan} aria-label="변형 문제 5개. 하나를 누르면 크게 봅니다.">
        {variants(given, relation).map((variant, index) => {
          const built = build(variant.given, variant.relation);
          return <button key={`${variant.given}-${variant.relation}`} type="button" style={{ "--i": index - 2 } as CSSProperties}
            onClick={() => { change(variant); requestAnimationFrame(() => paperRef.current?.focus()); }} aria-label={`변형 ${index + 1}: ${relations[variant.relation].label}, 주어진 각 ${variant.given}도, 정답 ${variant.answer}도`}>
            <span>변형 {index + 1} · {relations[variant.relation].label}</span>
            <Figure slope={built.slope} givenArc={built.givenArc} answerArc={built.answerArc} given={variant.given} />
            <small>정답 {variant.answer}°</small>
          </button>;
        })}
      </section>
      : <article ref={paperRef} tabIndex={-1} className={styles.paper} aria-label="A4 시험지 미리보기">
        <header><span>수학 · 중1 기본 도형</span><span>1 / 1</span></header>
        <div key={version} className={styles.question}>
          <p><b>1.</b> 다음 그림에서 <i>x</i>의 크기를 구하시오.</p>
          <Figure slope={item.slope} givenArc={item.givenArc} answerArc={item.answerArc} given={given} />
          <ol className={styles.choices} aria-label="선택지">
            {item.choices.map((option, index) => <li key={option.value}>
              <button type="button" aria-pressed={picked === index} data-result={picked === index ? (option.correct ? "correct" : "wrong") : undefined}
                onClick={() => setPicked(index)}>
                <span aria-hidden="true">{"①②③④⑤"[index]}</span> {option.value}°
              </button>
            </li>)}
          </ol>
        </div>
        <div className={styles.feedback} aria-live="polite">
          {!choice ? <p>선택지를 눌러 보세요. 오답마다 학생이 흔히 하는 실수가 담겨 있습니다.</p>
            : choice.correct ? <><p data-result="correct"><b>정답</b> · {item.answer}°</p>
              <ol>{relations[relation].steps(given, item.answer).map((step) => <li key={step}>{step}</li>)}</ol></>
            : <p data-result="wrong"><b>오답 · {choice.value}°</b> — {choice.feedback}</p>}
        </div>
      </article>}
    </div>}
    </div>

    <dl className={styles.facts}>
      <div><dt>문항 정의</dt><dd>파라미터 기반 생성기</dd></div>
      <div><dt>도형</dt><dd>TikZ → SVG 격리 렌더링</dd></div>
      <div><dt>수학 규칙</dt><dd>빌드에서 자동 검증</dd></div>
    </dl>
  </div>;
}
