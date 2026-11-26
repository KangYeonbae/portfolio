"use client";

import Link from "next/link";
import { useState } from "react";
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

function Figure({ slope, givenArc, answerArc, given }: { slope: number; givenArc: number[]; answerArc: number[]; given: number }) {
  const [ax, ay] = point(slope, 128);
  const [bx, by] = point(slope + 180, 128);
  const label = (range: number[], radius: number) => point((range[0] + range[1]) / 2, radius);
  const [gx, gy] = label(givenArc, 44);
  const [xx, xy] = label(answerArc, 40);
  return <svg viewBox="0 0 320 224" role="img" aria-label={`두 직선이 만나 한 각이 ${given}도인 그림`}>
    <line x1={C.x - 140} y1={C.y} x2={C.x + 140} y2={C.y} />
    <line x1={bx} y1={by} x2={ax} y2={ay} />
    <path d={arc(givenArc, 24)} />
    <path d={arc(answerArc, 20)} data-answer />
    <text x={gx} y={gy}>{given}°</text>
    <text x={xx} y={xy} data-answer><tspan fontStyle="italic">x</tspan>°</text>
  </svg>;
}

export default function ExamRoom() {
  const [given, setGiven] = useState(70);
  const [relation, setRelation] = useState<Relation>("vertical");
  const [picked, setPicked] = useState<number | null>(null);
  const item = build(given, relation);
  const version = `${given}-${relation}`;
  const choice = picked === null ? null : item.choices[picked];

  function change(next: { given?: number; relation?: Relation }) {
    setPicked(null);
    if (next.given !== undefined) setGiven(next.given);
    if (next.relation) setRelation(next.relation);
  }

  return <div className={styles.room}>
    <header className={styles.toolbar}>
      <form method="dialog"><button type="submit" autoFocus>← 전시관으로 돌아가기</button></form>
      <Link href="/projects/exam-forge" prefetch={false}>프로젝트 자세히 보기 ↗</Link>
    </header>
    <div className={styles.body}>
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
      </section>

      <article className={styles.paper} aria-label="A4 시험지 미리보기">
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
      </article>
    </div>

    <dl className={styles.facts}>
      <div><dt>문항 정의</dt><dd>파라미터 기반 생성기</dd></div>
      <div><dt>도형</dt><dd>TikZ → SVG 격리 렌더링</dd></div>
      <div><dt>수학 규칙</dt><dd>빌드에서 자동 검증</dd></div>
    </dl>
  </div>;
}
