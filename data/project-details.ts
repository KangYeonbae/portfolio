export type ProjectDetail = {
  problem: string;
  architecture: string[];
  signals: string[];
  decisions: { title: string; detail: string }[];
};

export const projectDetails: Record<string, ProjectDetail> = {
  "amazon-ads-agent": {
    problem: "광고 데이터 수집, 분석, 차트 생성, 문서 작성이 사람의 반복 작업으로 분리되어 있어 리포트 속도와 근거 일관성이 낮았습니다.",
    architecture: ["Amazon APIs", "Scheduled ingestion", "BigQuery", "Generator ↔ Verifier", "Artifact / Report"],
    signals: ["Idempotent ingestion", "Task retry", "Evidence check", "Human approval"],
    decisions: [
      { title: "생성과 검수를 분리", detail: "한 Agent에게 작성과 자기 검증을 동시에 맡기지 않고, 데이터 근거를 다시 대조하는 검수 Agent를 별도 경계로 뒀습니다." },
      { title: "원본 데이터가 진실의 원천", detail: "LLM 결과를 저장하기 전에 BigQuery의 집계값과 출처를 다시 확인해 환각이 최종 문서로 전파되지 않게 했습니다." },
      { title: "비동기 작업으로 운영", detail: "수집과 리포트 생성을 Cloud Tasks와 스케줄러로 분리해 긴 작업의 재시도와 장애 범위를 제어했습니다." },
    ],
  },
  "multilingual-cms": {
    problem: "언어마다 번역·검수·발행 시점이 달라 단일 published 값으로는 실제 콘텐츠 운영 상태를 표현할 수 없었습니다.",
    architecture: ["Tiptap editor", "Locale state", "Prisma", "Signed media", "Publish / JSON-LD"],
    signals: ["Per-locale workflow", "Role boundary", "Signed URL", "SEO validation"],
    decisions: [
      { title: "언어별 상태 머신", detail: "게시물 전체가 아니라 각 언어 버전이 draft, review, published 상태를 독립적으로 갖도록 모델링했습니다." },
      { title: "편집기와 발행 결과 분리", detail: "Tiptap 편집 데이터와 공개 렌더 결과를 구분해 미리보기와 실제 발행의 경계를 명확히 했습니다." },
      { title: "비공개 프로젝트", detail: "고객명, 도메인, 실제 스키마와 운영 데이터는 공개하지 않고 설계 판단과 기여 범위만 설명합니다." },
    ],
  },
  "snap-p": {
    problem: "아마존 리스팅용 이미지와 카피를 만들 때 상품 분석, 기획, 현지화, 정책 검수가 여러 도구와 사람 사이에서 반복됐습니다.",
    architecture: ["Product input", "Visual analysis", "Creative brief", "Image / Copy generation", "Policy QA"],
    signals: ["Structured brief", "Locale prompt", "Image QA", "Policy gate"],
    decisions: [
      { title: "이미지보다 기획서를 먼저", detail: "바로 이미지를 생성하지 않고 상품 특징·타깃·판매 포인트를 구조화한 brief를 중간 산출물로 만들었습니다." },
      { title: "9개 결과물의 역할 분리", detail: "각 이미지가 동일한 내용을 반복하지 않도록 썸네일, 장점, 사용 장면 등 슬롯별 목적을 고정했습니다." },
    ],
  },
  "bid-master": {
    problem: "공고 수가 많고 첨부 현품설명서 형식이 제각각이라 실제 취급 품목과 수익성에 맞는 입찰을 찾는 비용이 컸습니다.",
    architecture: ["Tender source", "Crawler / Parser", "Normalized items", "Profitability rule", "Email alert"],
    signals: ["Change detection", "Code normalization", "Scheduled crawl", "Deduplication"],
    decisions: [
      { title: "API 우선, 브라우저는 예외", detail: "안정적인 구간은 직접 API로 수집하고 동적 다운로드처럼 필요한 구간만 Playwright를 사용했습니다." },
      { title: "표준 식재료 코드", detail: "표기명이 달라도 비교할 수 있도록 품목을 표준 코드 계층으로 정규화했습니다." },
    ],
  },
  "voc-analyzer": {
    problem: "상담 내용을 사람이 다시 읽고 분류·요약해 리포트로 옮기는 반복 작업이 응대 품질 개선보다 더 많은 시간을 차지했습니다.",
    architecture: ["ChannelTalk", "PII-safe extract", "LLM summary", "Rule classification", "Sheets / Desktop"],
    signals: ["Batch resume", "Prompt version", "Manual correction", "Packaged app"],
    decisions: [
      { title: "현업 도구에 맞춘 배포", detail: "새 SaaS 도입 대신 Streamlit GUI를 데스크톱 앱으로 패키징해 비개발자가 바로 실행할 수 있게 했습니다." },
      { title: "LLM과 규칙의 혼합", detail: "요약은 LLM이 맡고 고정된 운영 분류는 규칙으로 보강해 결과의 일관성을 높였습니다." },
    ],
  },
  "review-classifier": {
    problem: "리뷰 감성 분류에 매 요청마다 LLM을 사용하면 비용과 지연이 커, 대량 처리에 적합한 경량 모델이 필요했습니다.",
    architecture: ["Cafe24 reviews", "Clean / Label", "Feature pipeline", "SVM classifier", "Flask API"],
    signals: ["95%+ 긍·부정 정확도", "자체 학습 모델", "빠른 대량 판독", "부정 리뷰 조기 알림"],
    decisions: [
      { title: "전통 ML을 선택", detail: "긍정·부정처럼 판단 경계가 명확한 반복 분류였기 때문에 범용 LLM 대신 비용과 응답성이 좋은 scikit-learn 모델을 선택했습니다." },
      { title: "도메인 다양성을 먼저 확보", detail: "한 카테고리에서 40%까지 떨어진 실패를 확인한 뒤, AI-Hub의 5개 커머스 카테고리 10만 건으로 학습 범위를 넓혔습니다." },
      { title: "판독을 대응 흐름에 연결", detail: "모델 정확도만 보여주는 데서 끝내지 않고 Cafe24 리뷰 수집과 부정 리뷰 알림을 연결해 현업의 조기 대응 흐름으로 만들었습니다." },
    ],
  },
  "local-browser-agent": {
    problem: "고객 사이트 화면을 외부 모델 API로 전송하지 않으면서도 자연어 목표를 이해하고, 사이트마다 다른 UI를 자율적으로 탐색·조작해야 했습니다.",
    architecture: ["Natural-language task", "Qwen2.5 planner", "DOM + Set-of-Mark", "LLaVA vision", "Playwright action", "Validate + learn"],
    signals: ["Cloud model API 0", "2 local models", "4-stage fallback", "33 GA4 events"],
    decisions: [
      { title: "추론을 완전히 로컬로", detail: "계획은 Qwen2.5, 화면 판단은 LLaVA가 맡고 두 모델 모두 Ollama에서 실행해 고객 화면과 작업 문맥이 외부 API로 나가지 않게 했습니다." },
      { title: "픽셀과 DOM을 결합", detail: "클릭 가능한 DOM 요소를 추출해 화면 위에 번호를 붙이는 Set-of-Mark를 사용했습니다. 모델은 전체 좌표를 추측하지 않고 제한된 후보 중 하나를 선택합니다." },
      { title: "실패를 다음 실행의 자산으로", detail: "학습 셀렉터 → Vision → 텍스트 매칭 → 좌표 클릭 순으로 폴백하고, 성공한 좌표에서 CSS 셀렉터를 역추적해 SQLite 신뢰도에 반영했습니다." },
      { title: "GA4 검증에 적용", detail: "국내 주얼리 브랜드·글로벌 F&B 프랜차이즈 등 실제 사이트 플로우를 탐색하며 dataLayer 이벤트를 수집하는 용도로 확장했고, 내부 실행 기준 33개 이벤트 중 80.5% 자동 검증 커버리지를 기록했습니다." },
    ],
  },
  "text-to-sql": {
    problem: "분석가가 아닌 사용자도 GA4 BigQuery 데이터를 질문할 수 있어야 했지만, 스키마 추측·잘못된 SQL·과도한 스캔 비용을 통제할 실행 경계가 필요했습니다.",
    architecture: ["Natural-language question", "Schema context + RAG", "SQL safety gate", "BigQuery execution", "Recovery agent", "Insight / follow-up"],
    signals: ["SELECT / WITH only", "SSE progress", "Query cache", "Up to 3-step exploration"],
    decisions: [
      { title: "SQL 예시를 RAG로 재사용", detail: "다국어 임베딩과 키워드 부스트로 유사 SQL을 찾고 실제 테이블 스키마와 함께 생성 모델에 전달해 문맥 정확도와 반복 비용을 개선했습니다." },
      { title: "생성과 실행 사이에 안전 경계", detail: "SELECT·WITH만 허용하고 DROP·DELETE·ALTER 등을 차단한 뒤, GA4 파티션 필터와 스키마를 검증한 SQL만 BigQuery로 보냅니다." },
      { title: "실패를 자동 복구", detail: "실행 오류가 나면 원본 SQL·오류 메시지·질문을 Recovery 도구에 전달하고 최대 2회 수정 실행하도록 구성했습니다." },
      { title: "두 오케스트레이션을 비교", detail: "명시적 Handler Chain과 Google ADK의 Root·Query·Exploration Agent 구조를 같은 UI에서 전환해, 단일 질의와 다단계 탐색에 맞는 방식을 비교했습니다." },
    ],
  },
  "ga4-validator": {
    problem: "GA4 이벤트는 화면 기능이 정상이어도 누락되거나 잘못된 파라미터로 전송될 수 있어, 사용자 플로우와 dataLayer를 함께 검증할 자동화가 필요했습니다.",
    architecture: ["Flow scenario", "Playwright runner", "Browser dataLayer", "Event matcher", "Evidence log", "QA report"],
    signals: ["Async scenarios", "Raw event evidence", "Rule-based check", "Repeatable run"],
    decisions: [
      { title: "UI 성공과 계측 성공을 분리", detail: "버튼 클릭이 끝났다는 사실만 보지 않고, 같은 시점의 dataLayer 이벤트 이름과 필수 파라미터를 별도 결과로 기록했습니다." },
      { title: "재현 가능한 시나리오", detail: "탐색 순서와 대기 조건을 코드로 고정해 담당자나 실행 시점이 달라도 같은 계측 경로를 비교할 수 있게 했습니다." },
    ],
  },
  "instagram-insight": {
    problem: "댓글 수만으로는 실제 구매 의도와 단순 반응을 구분하기 어려웠고, 다국어·이모지·짧은 문장 때문에 단일 분류 방식의 오탐이 많았습니다.",
    architecture: ["Post / Reels crawler", "Language filter", "Regex signals", "KcBERT classifier", "Intent aggregation", "FastAPI result"],
    signals: ["Hybrid classification", "Multilingual cleanup", "Influencer comparison", "Batch analysis"],
    decisions: [
      { title: "규칙과 모델을 결합", detail: "가격·구매처처럼 명확한 표현은 규칙으로 잡고 문맥 판단이 필요한 댓글은 분류 모델로 보내 정확도와 처리 비용을 균형 있게 가져갔습니다." },
      { title: "수집과 분석을 분리", detail: "브라우저 수집 실패가 모델 추론까지 막지 않도록 원문 저장, 정제, 분류 단계를 나눠 재실행 가능하게 했습니다." },
    ],
  },
  "did-cms": {
    problem: "외부 인터넷이 제한된 환경에서 대용량 미디어와 여러 단말의 재생 상태를 안정적으로 관리해야 했습니다.",
    architecture: ["Admin CMS", "FastAPI", "PostgreSQL / MinIO", "MQTT broker", "DID devices"],
    signals: ["Private network", "Object storage", "Device status", "Schedule sync"],
    decisions: [
      { title: "메타데이터와 파일 분리", detail: "콘텐츠 정보는 PostgreSQL, 대용량 파일은 MinIO에 저장해 백업과 전송 경계를 나눴습니다." },
      { title: "상태 전달에 MQTT", detail: "단말의 연결 상태와 재생 명령처럼 잦은 이벤트를 HTTP 폴링 대신 메시지 브로커로 처리했습니다." },
    ],
  },
  "byeoljari": {
    problem: "무료 결과를 본 사용자가 유료 AI 리딩을 선택하고, 결제한 뒤에는 반드시 자신의 결과를 받아야 했습니다. 계산 정확도와 결제 신뢰, 긴 생성 대기를 하나의 B2C 경험으로 연결하는 것이 핵심이었습니다.",
    architecture: ["Next.js client", "Payment verification", "FastAPI domain engine", "AI stream", "Supabase archive"],
    signals: ["무료 → 유료 전환", "실결제 운영", "결과 전달 보장", "SEO · 광고 퍼널"],
    decisions: [
      { title: "계산과 해석 분리", detail: "사주·점성술 값은 결정론적 Python 엔진에서 계산하고 LLM은 계산 결과를 설명하는 역할만 맡습니다." },
      { title: "서버 기준 결제 검증", detail: "브라우저의 성공 응답을 신뢰하지 않고 서버에서 PortOne 거래 상태와 금액을 재검증한 뒤 콘텐츠를 엽니다." },
      { title: "긴 응답은 스트리밍", detail: "생성 중인 내용을 점진적으로 보여주되 연결이 끊겨도 저장된 결과를 다시 불러올 수 있게 했습니다." },
    ],
  },
  "dubby": {
    problem: "채팅·스토리·투표·게임처럼 동시성이 다른 기능을 모바일 하나의 실시간 경험으로 묶어야 했습니다.",
    architecture: ["Flutter client", "Firebase Auth", "Firestore", "Cloud Functions", "FCM / Realtime UI"],
    signals: ["Offline recovery", "Server-authoritative game", "Push fan-out", "Security rules"],
    decisions: [
      { title: "게임 상태는 서버 권위", detail: "클라이언트가 결과를 결정하지 않고 Cloud Functions가 최대 8명의 턴과 카드 상태를 검증합니다." },
      { title: "오프라인을 정상 상태로", detail: "연결 단절을 예외가 아니라 모바일의 기본 조건으로 보고 Firestore 캐시와 재동기화 흐름을 설계했습니다." },
    ],
  },
  "meetsub": {
    problem: "보안 정책상 프로그램을 설치할 수 없는 회의 환경에서도 전문 기술용어가 정확한 한·영 자막을 제공해야 했습니다. 빠른 첫 자막뿐 아니라 이미 읽은 문장이 뒤늦게 뒤집히지 않는 안정성도 중요했습니다.",
    architecture: ["Browser tab audio", "WebSocket / Deepgram", "용어집 보정", "Vertex Gemini", "Record / Report / PDF"],
    signals: ["무설치 브라우저", "전문용어 교정", "자막 안정화", "장기 인증키 없는 배포"],
    decisions: [
      { title: "설치 대신 브라우저 탭 캡처", detail: "Teams·Zoom 오디오를 브라우저에서 바로 받아 별도 프로그램 설치가 제한된 환경에서도 사용할 수 있게 했습니다." },
      { title: "용어집을 두 단계에 주입", detail: "도메인별 용어를 STT keyterm과 번역 프롬프트에 함께 넣어 부품명과 고유 기술명의 오인식을 교정합니다." },
      { title: "읽은 자막을 다시 바꾸지 않기", detail: "안정된 영어 구간만 이어 붙이고 발화가 끝나면 전체 번역을 한 번 확정해 자막이 뒤늦게 흔들리는 문제를 줄였습니다." },
      { title: "장기 서비스 계정 키 제거", detail: "Cloud Run 배포는 GitHub Actions Workload Identity Federation을 사용해 장기 인증키 파일 없이 운영합니다." },
    ],
  },
  "exam-forge": {
    problem: "현직 강사는 워드·한글에서 문제의 숫자와 선택지는 고쳐도 도형까지 함께 수정하기 어려웠습니다. 값을 바꿀 때 문제·선택지·정답·풀이·도형이 서로 어긋나지 않고, 마지막에는 A4 시험지로 바로 인쇄돼야 했습니다.",
    architecture: ["Question generator", "Domain validation", "TikZ render API", "SVG cache", "A4 editor / PWA"],
    signals: ["도형까지 함께 갱신", "교육과정 매핑", "A4 자동 분할", "무설치 PWA"],
    decisions: [
      { title: "문항 전체를 하나의 생성기로 모델링", detail: "같은 파라미터에서 문제 문장·선택지·정답·풀이·도형을 함께 만들어 일부만 바뀌어 서로 어긋나는 문제를 막았습니다." },
      { title: "TikZ 렌더러 격리", detail: "TeX 바이너리가 필요한 컴파일 작업을 일반 웹 앱과 분리하고 서버 간 토큰으로 원시 TikZ API를 보호합니다." },
      { title: "교육과정과 난이도를 조립 규칙으로", detail: "성취기준 체계를 데이터로 정리하고 문항 수와 배점, 난이도 분포가 시험지 안에서 맞도록 구성했습니다." },
      { title: "편집에서 인쇄까지 한 화면에", detail: "시험지 편집 UI와 A4 페이지 자동 분할, PWA 설치를 연결해 별도 문서 프로그램 없이 완성본을 출력하도록 했습니다." },
    ],
  },
  "sns-easyup": {
    problem: "아이디어 작성부터 채널별 문구·이미지 생성, 예약 발행까지 SNS 운영 흐름이 여러 도구로 분산돼 있었습니다.",
    architecture: ["Idea / Asset", "Prompt registry", "Copy / Image AI", "Schedule queue", "Meta publishing"],
    signals: ["BYO API key", "Prompt version", "Cron recovery", "Channel adapter"],
    decisions: [
      { title: "프롬프트를 콘텐츠로 관리", detail: "플랫폼과 길이별 프롬프트를 코드에 박지 않고 교체 가능한 레지스트리로 분리했습니다." },
      { title: "채널 어댑터", detail: "Facebook과 Instagram의 인증·게시 차이를 공통 작성 흐름 밖으로 격리했습니다." },
    ],
  },
  "cloudrun-monitor": {
    problem: "여러 GCP 프로젝트를 오가며 서비스 상태와 로그를 확인하는 과정이 느리고, 별도 서비스 계정 온보딩도 복잡했습니다.",
    architecture: ["Google OAuth", "Identity resolver", "Cloud Run adapter", "Logging API", "Unified dashboard"],
    signals: ["User IAM source", "Incremental scope", "Short cache", "Zero key upload"],
    decisions: [
      { title: "Bring Your Own Identity", detail: "사용자의 OAuth 권한으로 GCP API를 호출해 별도 Service Account 키 업로드 없이 시작하도록 설계했습니다." },
      { title: "GCP가 진실의 원천", detail: "서비스 메타데이터를 복제하지 않고 짧게 캐시해 권한 변경이 자연스럽게 반영되도록 했습니다." },
    ],
  },
  "student-echo": {
    problem: "폐기물 이름을 모르는 사용자도 사진으로 종류를 확인하고, 실제 배출 방법과 재활용 추천을 음성·텍스트 상담으로 이어갈 수 있어야 했습니다.",
    architecture: ["Camera / upload", "Image classifier", "Waste catalog", "Recommendation", "Chatbot + STT / TTS", "AWS"],
    signals: ["50% contribution", "Image classification", "Voice interface", "Recommendation flow"],
    decisions: [
      { title: "분류를 행동 안내로 연결", detail: "모델의 클래스 이름만 보여주지 않고 해당 폐기물의 배출 방법과 다음 추천을 상담 흐름 안에서 함께 제공했습니다." },
      { title: "접근 경로 확장", detail: "키보드 입력 외에 STT와 TTS를 연결해 정보 접근 방식을 넓혔습니다." },
    ],
  },
  "student-spaceplace": {
    problem: "공간 검색과 예약처럼 서로 다른 업무를 서비스 단위로 나누고, 팀이 각 기능을 독립적으로 개발·운영하는 MSA 경험이 목표였습니다.",
    architecture: ["Web frontend", "API boundary", "Space service", "Reservation service", "Data stores", "Operations"],
    signals: ["35% contribution", "Service boundary", "REST integration", "Team operations"],
    decisions: [
      { title: "기능이 아닌 변경 이유로 분리", detail: "공간 정보와 예약 상태는 변경 주기와 책임이 다르므로 별도 서비스 경계로 보고 API 계약을 먼저 맞췄습니다." },
      { title: "통합 비용을 경험", detail: "프론트엔드와 API 연동을 맡아 분산된 서비스의 응답과 오류를 하나의 사용자 흐름으로 조정했습니다." },
    ],
  },
};
