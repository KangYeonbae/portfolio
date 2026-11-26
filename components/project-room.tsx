"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import styles from "./project-room.module.css";

const rooms = {
  "local-browser-agent": {
    name: "로컬 AI 작업실",
    headline: "내 브라우저에서 실행되는 AI",
    steps: [
      ["목표 입력", "요청을 실행 단계로 나눕니다", "내 PC의 모델이 자연어 요청을 읽고 브라우저에서 확인할 작업 순서를 정합니다."],
      ["화면 읽기", "화면과 DOM을 함께 읽습니다", "버튼과 링크에 번호를 붙여 모델이 클릭할 대상을 고를 수 있게 합니다."],
      ["동작 확인", "실행 뒤 화면을 다시 읽습니다", "Playwright로 동작한 뒤 화면의 실제 변화를 확인하고, 성공한 경로를 다음 실행에 활용합니다."],
    ],
  },
  "bid-master": {
    name: "입찰 작업장",
    headline: "어떤 공고를 검토할까?",
    steps: [
      ["공고 수집", "여러 곳의 공고를 한곳에 모읍니다", "학교급식 입찰 공고와 첨부된 현품설명서를 가져와 마감일과 품목을 확인합니다."],
      ["품목 대조", "공고의 표현을 표준 품목과 대조합니다", "같은 식재료의 표기가 달라도 취급 품목과 비교할 수 있도록 표준 코드로 정리합니다."],
      ["검토 대상", "조건에 맞는 공고를 골라냅니다", "품목, 지역, 수익성을 함께 판단한 뒤 검토할 공고를 메일로 보냅니다."],
    ],
  },
  "snap-p": {
    name: "상품 촬영 스튜디오",
    headline: "상품 하나에서 아홉 개의 이미지로",
    steps: [
      ["기획서", "누구에게 어떤 장점을 보여줄지 정합니다", "상품 정보와 이미지를 분석한 뒤 타깃과 판매 포인트가 담긴 기획서를 먼저 만듭니다."],
      ["이미지 구성", "각 이미지가 맡을 역할을 정합니다", "대표 이미지, 주요 장점, 사용 장면의 역할을 분리해 상세 페이지 전체에서 메시지가 반복되지 않게 구성합니다."],
      ["정책 검수", "게시 전 이미지와 카피를 확인합니다", "상품 문구와 이미지 품질을 검수하고 아마존 리스팅 정책에 맞는지 확인합니다."],
    ],
  },
  "voc-analyzer": {
    name: "상담 분석실",
    headline: "긴 상담을 다시 읽지 않아도",
    steps: [
      ["상담 수집", "상담 내용을 분석용으로 준비합니다", "ChannelTalk 상담 기록에서 분석할 내용을 추출하고 개인정보를 줄여 작업에 넘깁니다."],
      ["요약·분류", "고객의 요청과 처리 상태를 정리합니다", "모델은 상담을 요약하고, 운영 규칙은 반복해서 비교할 수 있도록 같은 기준으로 분류합니다."],
      ["리포트 반영", "팀이 쓰는 Google Sheets로 보냅니다", "상담별 요약과 VOC를 정리해 팀이 후속 조치와 반복 문의를 확인할 수 있게 합니다."],
    ],
  },
  "exam-forge": {
    name: "수학 편집실",
    headline: "숫자를 바꾸면 답도 함께 바뀝니다",
    steps: [
      ["문항 설계", "출제 범위와 난이도를 선택합니다", "교육과정과 난이도에 맞는 문항을 찾아 시험지를 구성합니다."],
      ["수치 바꾸기", "문항의 수치를 바꿔 보세요", "같은 생성 규칙으로 문제와 정답을 함께 갱신합니다."],
      ["시험지 편집", "편집한 문제를 A4로 정리합니다", "문항을 배열하면 A4 페이지가 자동으로 나뉘고 인쇄할 수 있습니다."],
    ],
  },
} as const;

type RoomId = keyof typeof rooms;

function MathSample() {
  const [length, setLength] = useState(6);
  return <div className={styles.mathSample}>
    <label htmlFor="room-triangle-base">밑변 고르기</label>
    <select id="room-triangle-base" value={length} onChange={(event) => setLength(Number(event.target.value))}>
      {[4, 6, 8].map((size) => <option key={size} value={size}>{size} cm</option>)}
    </select>
    <p aria-live="polite">밑변이 {length} cm, 높이가 5 cm인 삼각형의 넓이는 <strong>{length * 5 / 2} cm²</strong>입니다.</p>
  </div>;
}

export default function ProjectRoom({ id, name, text, media }: {
  id: RoomId;
  name: string;
  text: string;
  media: string;
}) {
  const room = rooms[id];
  const [step, setStep] = useState(0);
  const [, title, description] = room.steps[step];

  return <div className={styles.room} data-project={id}>
    <header className={styles.toolbar}>
      <form method="dialog"><button type="submit" autoFocus>← 전시관으로 돌아가기</button></form>
      <Link href={`/projects/${id}`} prefetch={false}>프로젝트 자세히 보기 ↗</Link>
    </header>
    <div className={styles.layout}>
      <div className={styles.intro}>
        <p className={styles.roomName}>{room.name}</p>
        <h1 id="project-preview-title">{name}</h1>
        <h2>{room.headline}</h2>
        <p>{text}</p>
      </div>
      <section className={styles.desk} aria-label={`${name} 체험`}>
        <div className={styles.steps} role="group" aria-label="살펴볼 작업 선택">
          {room.steps.map(([label], index) => (
            <button key={label} type="button" aria-pressed={index === step}
              onClick={() => setStep(index)}>{label}</button>
          ))}
        </div>
        <div className={styles.step} aria-live="polite">
          <h3>{title}</h3>
          <p>{description}</p>
          {id === "exam-forge" && step === 1 && <MathSample />}
        </div>
        <figure className={styles.preview}>
          <Image src={media} alt={`${name} 실제 제품 화면`} width={960} height={540}
            sizes="(max-width: 840px) 88vw, 52vw" />
        </figure>
      </section>
    </div>
  </div>;
}
