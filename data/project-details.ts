export type ProjectDetail = {
  problem: string;
  architecture: string[];
  signals: string[];
  decisions: { title: string; detail: string }[];
};

export const projectDetails: Record<string, ProjectDetail> = {
  "amazon-ads-agent": {
    problem: "광고 데이터 수집·분석·차트·문서 작성의 분절로 인한 느린 리포트 작성과 불안정한 근거 일관성",
    architecture: ["Amazon APIs", "Scheduled ingestion", "BigQuery", "Generator ↔ Verifier", "Artifact / Report"],
    signals: ["Idempotent ingestion", "Task retry", "Evidence check", "Human approval"],
    decisions: [
      { title: "생성과 검수를 분리", detail: "작성 Agent와 데이터 근거를 재대조하는 검수 Agent의 별도 경계 구성" },
      { title: "원본 데이터가 진실의 원천", detail: "LLM 결과 저장 전 BigQuery 집계값·출처 재검증으로 환각 전파 차단" },
      { title: "비동기 작업으로 운영", detail: "수집과 리포트 생성을 Cloud Tasks·스케줄러로 분리해 재시도와 장애 범위 통제" },
    ],
  },
  "multilingual-cms": {
    problem: "언어별 번역·검수·발행 시점 차이로 단일 published 값만으로는 표현할 수 없는 운영 상태",
    architecture: ["Tiptap editor", "Locale state", "Prisma", "Signed media", "Publish / JSON-LD"],
    signals: ["Per-locale workflow", "Role boundary", "Signed URL", "SEO validation"],
    decisions: [
      { title: "언어별 상태 머신", detail: "각 언어 버전이 draft·review·published 상태를 독립적으로 갖는 콘텐츠 모델" },
      { title: "편집기와 발행 결과 분리", detail: "Tiptap 편집 데이터와 공개 렌더 결과를 분리한 미리보기·발행 경계" },
      { title: "비공개 프로젝트", detail: "고객명·도메인·실제 스키마·운영 데이터 제외, 설계 판단과 기여 범위만 공개" },
    ],
  },
  "snap-p": {
    problem: "상품 분석·기획·현지화·정책 검수가 여러 도구와 사람 사이에서 반복되는 아마존 리스팅 제작 과정",
    architecture: ["Product input", "Visual analysis", "Creative brief", "Image / Copy generation", "Policy QA"],
    signals: ["Structured brief", "Locale prompt", "Image QA", "Policy gate"],
    decisions: [
      { title: "이미지보다 기획서를 먼저", detail: "상품 특징·타깃·판매 포인트를 구조화한 creative brief를 중간 산출물로 선행" },
      { title: "9개 결과물의 역할 분리", detail: "썸네일·장점·사용 장면 등 이미지 슬롯별 목적 고정으로 메시지 중복 방지" },
    ],
  },
  "bid-master": {
    problem: "제각각인 현품설명서에서 취급 품목과 수익성에 맞는 공고를 직접 찾는 높은 탐색 비용",
    architecture: ["Tender source", "Crawler / Parser", "Normalized items", "Profitability rule", "Email alert"],
    signals: ["Change detection", "Code normalization", "Scheduled crawl", "Deduplication"],
    decisions: [
      { title: "API 우선, 브라우저는 예외", detail: "안정 구간은 직접 API 수집, 동적 다운로드 구간만 Playwright 적용" },
      { title: "표준 식재료 코드", detail: "서로 다른 품목 표기를 비교 가능한 표준 코드 계층으로 정규화" },
    ],
  },
  "voc-analyzer": {
    problem: "상담 원문 재검토와 분류·요약·리포트 입력에 소요되는 반복 업무 시간",
    architecture: ["ChannelTalk", "PII-safe extract", "LLM summary", "Rule classification", "Sheets / Desktop"],
    signals: ["Batch resume", "Prompt version", "Manual correction", "Packaged app"],
    decisions: [
      { title: "현업 도구에 맞춘 배포", detail: "새 SaaS 대신 Streamlit GUI를 데스크톱 앱으로 패키징한 비개발자 실행 환경" },
      { title: "LLM과 규칙의 혼합", detail: "LLM 요약과 고정 운영 규칙의 결합으로 결과 일관성 확보" },
    ],
  },
  "review-classifier": {
    problem: "매 요청 LLM 호출의 비용·지연을 줄이면서 대량 판독이 가능한 경량 리뷰 분류 모델 필요",
    architecture: ["Cafe24 reviews", "Clean / Label", "Feature pipeline", "SVM classifier", "Flask API"],
    signals: ["95%+ 긍·부정 정확도", "자체 학습 모델", "빠른 대량 판독", "부정 리뷰 조기 알림"],
    decisions: [
      { title: "전통 ML을 선택", detail: "판단 경계가 명확한 반복 분류에 범용 LLM 대신 응답성과 비용 효율이 높은 scikit-learn 모델 선택" },
      { title: "도메인 다양성을 먼저 확보", detail: "단일 카테고리 정확도 40% 실패 이후 AI-Hub 5개 커머스 카테고리 10만 건으로 학습 범위 확장" },
      { title: "판독을 대응 흐름에 연결", detail: "Cafe24 리뷰 수집과 부정 리뷰 알림을 연결한 현업 조기 대응 흐름" },
    ],
  },
  "local-browser-agent": {
    problem: "고객 화면의 외부 전송 없이 자연어 목표를 이해하고 서로 다른 UI를 탐색·조작해야 하는 제약",
    architecture: ["Natural-language task", "Qwen2.5 planner", "DOM + Set-of-Mark", "LLaVA vision", "Playwright action", "Validate + learn"],
    signals: ["Cloud model API 0", "2 local models", "4-stage fallback", "33 GA4 events"],
    decisions: [
      { title: "추론을 완전히 로컬로", detail: "Qwen2.5 계획·LLaVA 화면 판단을 Ollama에서 실행해 고객 화면과 작업 문맥의 외부 전송 차단" },
      { title: "픽셀과 DOM을 결합", detail: "클릭 가능 DOM에 번호를 부여한 Set-of-Mark로 좌표 추측 대신 제한된 후보 선택" },
      { title: "실패를 다음 실행의 자산으로", detail: "학습 셀렉터 → Vision → 텍스트 → 좌표 폴백과 성공 셀렉터의 SQLite 신뢰도 반영" },
      { title: "GA4 검증에 적용", detail: "실제 사이트 플로우의 dataLayer 수집으로 확장, 내부 기준 33개 이벤트 중 80.5% 자동 검증" },
    ],
  },
  "text-to-sql": {
    problem: "비분석가의 자연어 데이터 탐색과 스키마 추측·잘못된 SQL·과도한 스캔 비용을 함께 통제할 실행 경계",
    architecture: ["Natural-language question", "Schema context + RAG", "SQL safety gate", "BigQuery execution", "Recovery agent", "Insight / follow-up"],
    signals: ["SELECT / WITH only", "SSE progress", "Query cache", "Up to 3-step exploration"],
    decisions: [
      { title: "SQL 예시를 RAG로 재사용", detail: "다국어 임베딩·키워드 부스트로 찾은 유사 SQL과 실제 스키마를 함께 제공해 문맥 정확도 개선" },
      { title: "생성과 실행 사이에 안전 경계", detail: "SELECT·WITH만 허용하고 위험 구문·GA4 파티션·스키마를 검증한 SQL만 실행" },
      { title: "실패를 자동 복구", detail: "원본 SQL·오류 메시지·질문을 Recovery 도구에 전달하는 최대 2회 수정 실행" },
      { title: "두 오케스트레이션을 비교", detail: "Handler Chain과 Google ADK Agent 구조를 같은 UI에서 전환해 단일 질의·다단계 탐색 방식 비교" },
    ],
  },
  "ga4-validator": {
    problem: "정상 화면 뒤에 숨은 GA4 이벤트 누락·잘못된 파라미터를 사용자 플로우와 함께 검증할 자동화 필요",
    architecture: ["Flow scenario", "Playwright runner", "Browser dataLayer", "Event matcher", "Evidence log", "QA report"],
    signals: ["Async scenarios", "Raw event evidence", "Rule-based check", "Repeatable run"],
    decisions: [
      { title: "UI 성공과 계측 성공을 분리", detail: "화면 동작과 같은 시점의 dataLayer 이벤트·필수 파라미터를 별도 결과로 기록" },
      { title: "재현 가능한 시나리오", detail: "탐색 순서와 대기 조건을 코드로 고정한 동일 계측 경로 비교" },
    ],
  },
  "instagram-insight": {
    problem: "다국어·이모지·짧은 댓글에서 단순 반응과 실제 구매 의도를 구분하기 어려운 분류 문제",
    architecture: ["Post / Reels crawler", "Language filter", "Regex signals", "KcBERT classifier", "Intent aggregation", "FastAPI result"],
    signals: ["Hybrid classification", "Multilingual cleanup", "Influencer comparison", "Batch analysis"],
    decisions: [
      { title: "규칙과 모델을 결합", detail: "가격·구매처 표현은 규칙, 문맥 판단은 분류 모델에 맡긴 정확도·처리 비용 균형" },
      { title: "수집과 분석을 분리", detail: "원문 저장·정제·분류 단계 분리로 브라우저 수집 실패 이후에도 재분석 가능" },
    ],
  },
  "did-cms": {
    problem: "외부 인터넷이 제한된 폐쇄망에서 대용량 미디어와 다수 단말 재생 상태의 안정적 관리",
    architecture: ["Admin CMS", "FastAPI", "PostgreSQL / MinIO", "MQTT broker", "DID devices"],
    signals: ["Private network", "Object storage", "Device status", "Schedule sync"],
    decisions: [
      { title: "메타데이터와 파일 분리", detail: "PostgreSQL 콘텐츠 정보와 MinIO 대용량 파일로 나눈 백업·전송 경계" },
      { title: "상태 전달에 MQTT", detail: "잦은 단말 연결 상태·재생 명령을 HTTP 폴링 대신 메시지 브로커로 처리" },
    ],
  },
  "byeoljari": {
    problem: "무료 결과 확인 → 유료 AI 리딩 선택 → 결제 → 결과 수령까지 계산 정확도·결제 신뢰·생성 대기를 연결한 B2C 경험",
    architecture: ["Next.js client", "Payment verification", "FastAPI domain engine", "AI stream", "Supabase archive"],
    signals: ["무료 → 유료 전환", "실결제 운영", "결과 전달 보장", "SEO · 광고 퍼널"],
    decisions: [
      { title: "계산과 해석 분리", detail: "결정론적 Python 엔진의 사주·점성술 계산과 LLM 설명 역할 분리" },
      { title: "서버 기준 결제 검증", detail: "PortOne 거래 상태·금액의 서버 재검증 이후 유료 콘텐츠 개방" },
      { title: "긴 응답은 스트리밍", detail: "생성 결과의 점진적 표시와 연결 종료 이후 저장 결과 재열람" },
    ],
  },
  "dubby": {
    problem: "채팅·스토리·투표·게임처럼 동시성이 다른 기능을 하나로 연결한 모바일 실시간 경험",
    architecture: ["Flutter client", "Firebase Auth", "Firestore", "Cloud Functions", "FCM / Realtime UI"],
    signals: ["Offline recovery", "Server-authoritative game", "Push fan-out", "Security rules"],
    decisions: [
      { title: "게임 상태는 서버 권위", detail: "Cloud Functions가 최대 8명의 턴·카드 상태를 검증하는 서버 권위 구조" },
      { title: "오프라인을 정상 상태로", detail: "모바일 연결 단절을 기본 조건으로 본 Firestore 캐시·재동기화 흐름" },
    ],
  },
  "meetsub": {
    problem: "설치 제한 회의 환경에서 전문용어 정확도와 이미 읽은 번역의 안정성을 함께 확보해야 하는 실시간 자막",
    architecture: ["Browser tab audio", "WebSocket / Deepgram", "용어집 보정", "Vertex Gemini", "Record / Report / PDF"],
    signals: ["무설치 브라우저", "전문용어 교정", "자막 안정화", "장기 인증키 없는 배포"],
    decisions: [
      { title: "설치 대신 브라우저 탭 캡처", detail: "Teams·Zoom 오디오를 브라우저에서 직접 수집하는 무설치 사용 환경" },
      { title: "용어집을 두 단계에 주입", detail: "도메인 용어를 STT keyterm과 번역 프롬프트에 함께 적용한 전문용어 오인식 교정" },
      { title: "읽은 자막을 다시 바꾸지 않기", detail: "안정된 영어 구간 누적 후 발화 종료 시 한 번 확정하는 최종 번역" },
      { title: "장기 서비스 계정 키 제거", detail: "GitHub Actions Workload Identity Federation 기반 Cloud Run 배포" },
    ],
  },
  "exam-forge": {
    problem: "숫자·선택지 수정 시 정답·풀이·도형이 함께 바뀌지 않는 문서 도구와 A4 시험지 편집의 단절",
    architecture: ["Question generator", "Domain validation", "TikZ render API", "SVG cache", "A4 editor / PWA"],
    signals: ["도형까지 함께 갱신", "교육과정 매핑", "A4 자동 분할", "무설치 PWA"],
    decisions: [
      { title: "문항 전체를 하나의 생성기로 모델링", detail: "같은 파라미터에서 문제·선택지·정답·풀이·도형을 함께 만드는 단일 생성 규칙" },
      { title: "TikZ 렌더러 격리", detail: "TeX 컴파일을 별도 API로 분리하고 서버 간 토큰으로 보호한 렌더 경계" },
      { title: "교육과정과 난이도를 조립 규칙으로", detail: "성취기준·문항 수·배점·난이도 분포를 데이터와 조립 규칙으로 구성" },
      { title: "편집에서 인쇄까지 한 화면에", detail: "시험지 편집·A4 자동 분할·PWA 설치를 연결한 무설치 출력 흐름" },
    ],
  },
  "sns-easyup": {
    problem: "아이디어·채널별 문구·이미지 생성·예약 발행이 여러 도구로 분산된 SNS 운영 흐름",
    architecture: ["Idea / Asset", "Prompt registry", "Copy / Image AI", "Schedule queue", "Meta publishing"],
    signals: ["BYO API key", "Prompt version", "Cron recovery", "Channel adapter"],
    decisions: [
      { title: "프롬프트를 콘텐츠로 관리", detail: "플랫폼·길이별 프롬프트를 교체 가능한 레지스트리로 분리" },
      { title: "채널 어댑터", detail: "Facebook·Instagram의 인증·게시 차이를 공통 작성 흐름 밖으로 격리" },
    ],
  },
  "cloudrun-monitor": {
    problem: "여러 GCP 프로젝트를 오가며 상태·로그를 확인하고 별도 서비스 계정을 등록해야 하는 모니터링 과정",
    architecture: ["Google OAuth", "Identity resolver", "Cloud Run adapter", "Logging API", "Unified dashboard"],
    signals: ["User IAM source", "Incremental scope", "Short cache", "Zero key upload"],
    decisions: [
      { title: "Bring Your Own Identity", detail: "사용자 OAuth 권한으로 GCP API를 호출하는 Service Account 키 없는 시작 흐름" },
      { title: "GCP가 진실의 원천", detail: "서비스 메타데이터의 짧은 캐시로 GCP 권한 변경을 그대로 반영" },
    ],
  },
  "student-echo": {
    problem: "폐기물 이름을 몰라도 사진으로 종류를 확인하고 배출 방법·재활용 추천까지 얻을 수 있는 안내 흐름",
    architecture: ["Camera / upload", "Image classifier", "Waste catalog", "Recommendation", "Chatbot + STT / TTS", "AWS"],
    signals: ["50% contribution", "Image classification", "Voice interface", "Recommendation flow"],
    decisions: [
      { title: "분류를 행동 안내로 연결", detail: "분류 결과와 폐기물 배출 방법·다음 추천을 하나의 상담 흐름으로 연결" },
      { title: "접근 경로 확장", detail: "STT·TTS를 연결한 음성·키보드 정보 접근 방식" },
    ],
  },
  "student-spaceplace": {
    problem: "공간 검색과 예약을 서비스 단위로 나누고 팀별 독립 개발·운영을 연결해야 하는 MSA 과제",
    architecture: ["Web frontend", "API boundary", "Space service", "Reservation service", "Data stores", "Operations"],
    signals: ["35% contribution", "Service boundary", "REST integration", "Team operations"],
    decisions: [
      { title: "기능이 아닌 변경 이유로 분리", detail: "변경 주기와 책임이 다른 공간 정보·예약 상태의 서비스 경계와 API 계약 우선 정의" },
      { title: "통합 비용을 경험", detail: "분산 서비스의 응답·오류를 하나로 조정한 프론트엔드 사용자 흐름" },
    ],
  },
};
