export const staticPosts = [
  {
    id: "note-lightweight-sentiment-model",
    slug: "reduce-ai-api-cost-with-lightweight-model",
    title: "AI API 비용을 99.9% 줄인 방법",
    excerpt: "월 80만원의 감정분석 API를 1.2MB Linear SVM으로 바꾼 기록. LinkedIn에서 4,609회 노출됐습니다.",
    published: true,
    publishedAt: "2026-08-11T00:00:00.000Z",
    createdAt: "2026-08-11T00:00:00.000Z",
    updatedAt: "2026-08-11T00:00:00.000Z",
    contentHtml: `
      <p>LinkedIn에서 4,609회 노출된 글을 기술 기록으로 다시 정리했습니다.</p>
      <p>팀의 AI API 비용이 빠르게 늘어나는 것을 보며 질문했습니다. <strong>단순한 감정분석까지 매번 범용 LLM을 호출해야 할까?</strong></p>
      <p>고객 리뷰 감정분석을 직접 학습한 경량 모델로 교체했습니다. 월 10만 건을 기준으로 GPT API는 건당 약 8원, 월 80만원이 필요했습니다. 자체 모델은 건당 약 0.01원, 월 약 1천원으로 추산했습니다. 같은 계산 기준에서 약 99.9%의 비용 차이입니다.</p>
      <h2>하루 동안 만든 첫 모델</h2>
      <p>AI-Hub의 라벨링된 커머스 리뷰 데이터를 정제하고 Linear SVM과 Logistic Regression을 비교했습니다. 가벼운 모델이라 한 번의 학습은 수십 초 안에 끝났고, 파라미터를 여러 번 조정하며 빠르게 실험할 수 있었습니다.</p>
      <h2>최종 결과</h2>
      <ul>
        <li>운영용 긍·부정 분류 정확도 95% 이상</li>
        <li>약 10ms 추론 시간</li>
        <li>1.2MB 모델 크기</li>
        <li>TF-IDF 1–2gram + Linear SVM</li>
      </ul>
      <p>처음에는 한 도메인에서만 학습해 다른 상품군 정확도가 40%까지 떨어졌습니다. 이후 5개 커머스 카테고리의 리뷰 10만 건으로 학습 범위를 넓히고, 작은 테스트셋의 변동성을 줄이기 위해 고정된 분할과 클래스별 지표를 사용했습니다.</p>
      <h2>가벼운 모델이 더 나은 순간</h2>
      <p>복잡한 요약이나 번역에는 큰 모델이 필요합니다. 반면 라벨이 명확하고 반복량이 많은 분류 문제에서는 작은 모델이 비용과 지연, 배포 난이도를 동시에 줄일 수 있습니다. 특히 Cloud Run이나 Lambda 같은 서버리스 환경에서는 작은 아티팩트가 빠른 콜드 스타트와 자유로운 스케일링으로 이어집니다.</p>
      <p>이번 작업에서 가장 크게 배운 것은 모델의 크기가 문제 해결의 크기를 결정하지 않는다는 점입니다. 먼저 문제를 좁히고, 데이터가 충분한지 확인하고, 가장 단순한 기준선부터 측정하는 편이 훨씬 빠른 길일 수 있습니다.</p>
      <p><a href="/projects/review-classifier">Review Sentiment Classifier 프로젝트 보기 →</a></p>
    `,
  },
  {
    id: "note-bigquery-ai-analyst",
    slug: "building-bigquery-ai-analyst",
    title: "SQL을 몰라도 데이터를 분석할 수 있다면",
    excerpt: "자연어 질문을 BigQuery SQL과 비즈니스 인사이트로 바꾸는 AI Analyst를 만든 이유와 구조.",
    published: true,
    publishedAt: "2026-08-11T00:00:00.000Z",
    createdAt: "2026-08-11T00:00:00.000Z",
    updatedAt: "2026-08-11T00:00:00.000Z",
    contentHtml: `
      <p><strong>“이번 주 매출 추이 보여줘.”</strong></p>
      <p>SQL을 몰라도 데이터를 분석할 수 있다면 어떨까. 이 질문을 오래 품고 있다가 자연어로 BigQuery 데이터를 분석하는 AI Analyst를 직접 만들었습니다.</p>
      <h2>왜 만들었나</h2>
      <p>Snowflake 같은 강력한 솔루션이 이미 있지만 많은 팀에는 여전히 비용과 도입 복잡도라는 진입장벽이 있습니다. “우리 회사 데이터로, 우리만의 방식으로 분석하고 싶다”는 요구를 더 작은 제품으로 해결해보고 싶었습니다.</p>
      <h2>어떻게 작동하나</h2>
      <p>사용자가 “지난 7일간 구매 전환율을 소스별로 분석해줘”라고 질문하면, 시스템은 선택된 프로젝트·데이터셋·테이블의 스키마와 유사 SQL을 모읍니다. 그 문맥으로 SQL을 생성하고 안전성 검사를 통과한 쿼리만 BigQuery에서 실행합니다. 마지막으로 결과를 비즈니스 인사이트와 액션 플랜으로 변환합니다.</p>
      <ul>
        <li>Frontend: Next.js 14, TypeScript, FSD Architecture</li>
        <li>Backend: FastAPI, LangGraph, RAG</li>
        <li>Infrastructure: Cloud Run, BigQuery, GitHub Actions</li>
      </ul>
      <p>여러 GCP 프로젝트와 다중 테이블을 지원하고, 생성·실행·분석 단계를 SSE로 전달합니다. 복잡한 질문은 여러 쿼리로 나누고, 실행 오류가 나면 SQL을 수정해 다시 시도합니다.</p>
      <h2>만들며 배운 점</h2>
      <p>데이터 분석의 민주화라는 말은 거창해 보이지만 핵심은 단순합니다. 조직 안에서 궁금한 것을 바로 물어보고, 결과와 근거 SQL을 함께 확인할 수 있는 환경을 만드는 것입니다.</p>
      <p><a href="/projects/text-to-sql">BigQuery AI Analyst 프로젝트 보기 →</a></p>
    `,
  },
] as const;
