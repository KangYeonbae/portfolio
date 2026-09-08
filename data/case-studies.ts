// Deep case-study content shared by the print portfolio and the web case pages.
// Every number here is measured, not estimated. Keep it that way — an unverifiable
// figure is the first thing an interviewer pulls on.

export type Metric = { value: string; label: string; note?: string };

export type FlowNode = { title: string; detail?: string; kind?: "llm" | "check" | "store" | "io"; tag?: string };

export type FlowLane = {
  name: string;
  caption?: string;
  nodes?: FlowNode[];
  /** Renders a decision point with labelled outcome paths instead of a linear row. */
  split?: { condition: string; paths: { label: string; weight?: string; nodes: FlowNode[] }[] };
  loop?: string;
};

export type Decision = {
  index: string;
  title: string;
  considered: string;
  problem: string;
  decision: string;
  kept?: string;
  takeaway: string;
  /** Known trade-off left unpaid. Naming it is stronger than hiding it. */
  debt?: string;
};

export type Incident = {
  label: string;
  value: string;
};

export type Collaboration = {
  /** Section label — solo products earn this section through review, not clients. */
  label?: string;
  note?: string;
  headers?: [string, string];
  setting: string;
  translations: { heard: string; delivered: string }[];
  boundary: { title: string; body: string };
};

export type CaseStudy = {
  id: string;
  order: string;
  type: string;
  title: string;
  thesis: string;
  period: string;
  role: string;
  status: string;
  collaboration: string;
  stack: string[];
  link?: { label: string; url: string };
  scale: Metric[];
  scaleNote: string;
  scaleSource: string;
  architectureNote: string;
  codeQuote?: { code: string; cite: string };
  lanes: FlowLane[];
  outcomes: { label: string; body: string }[];
  decisions: Decision[];
  troubleshooting: {
    headline: string;
    evidence: string;
    incident: { when: string; report: string; fix: string };
    residue: string;
    secondary: { headline: string; context: string; rows: Incident[]; resolution: string };
  };
  collaboration_detail: Collaboration;
};

export const amazonAdsAgent: CaseStudy = {
  id: "amazon-ads-agent",
  order: "01",
  type: "APPLIED AI · AD TECH",
  title: "Amazon Ads Reporting Agent",
  thesis: "리포트를 쓰는 LLM과, 그 숫자를 검증하는 Python을 분리했습니다.",
  period: "2025.10 — 2026.05",
  role: "기획 · AI · Backend · Cloud / 단독 개발",
  status: "운영 중",
  collaboration: "클라이언트 요구 분석 · 마케터와 AI 역할 경계 합의",
  stack: ["Google ADK", "Gemini", "BigQuery", "Cloud Tasks", "Cloud Functions", "Amazon SP-API"],
  link: { label: "동아일보 경제면 보도", url: "https://www.donga.com/news/Economy/article/all/20260622/134158095/1" },

  scale: [
    { value: "1억 3,500만 행", label: "누적 적재", note: "약 29.7GB" },
    { value: "21,607건", label: "누적 수집 작업", note: "21종 report type" },
    { value: "319일", label: "광고 성과 커버", note: "2025.09.23 — 2026.08.09" },
    { value: "12개사 / 41키", label: "멀티테넌트", note: "sp_api 15 · advertising 14 · ads_v3 12" },
    { value: "239 → 1", label: "테이블 마이그레이션", note: "날짜 샤딩 → 단일 파티션" },
    { value: "296개", label: "관리 캠페인", note: "성과 레코드 48,988행" },
  ],
  scaleSource: "BigQuery 실측 · 2026.08 기준",
  architectureNote: "LLM 생성 / Python 검증 분리",
  codeQuote: {
    code:
      "This is intentionally not an LLM judge. The final report is checked against the Python-built tables and raw DB rows that came from BigQuery, so another model cannot approve hallucinated numbers or rewritten campaign names.",
    cite: "report_qa_agent.py — 코드에 남긴 설계 의도",
  },
  scaleNote:
    "단일 최대 테이블은 brand_analytics_data 1억 2,952만 행 / 28.7GB입니다. 날짜 샤딩(239개 샤드) 구조를 단일 파티션 테이블로 마이그레이션해 쿼리 경로를 단순화했습니다.",

  lanes: [
    {
      name: "INGESTION",
      caption: "비동기 리포트 · 재시도 계층",
      nodes: [
        { title: "SP-API / Ads API", detail: "21종 report type", kind: "io" },
        { title: "비동기 요청 → 폴링", detail: "Cloud Functions", kind: "io" },
        { title: "Cloud Tasks · APScheduler", detail: "타임아웃·4xx 재시도", kind: "check", tag: "재시도" },
        { title: "BigQuery", detail: "단일 파티션 테이블", kind: "store" },
      ],
      loop: "실패 유형별 재시도 정책 · 구축 기간 누적 676건 회수",
    },
    {
      name: "GENERATION",
      caption: "Python 직선 오케스트레이션 · ADK는 LLM 호출 단위로만",
      nodes: [
        { title: "Worker", tag: "LLM", detail: "근거 기반 섹션 초안", kind: "llm" },
        { title: "fact_guard", tag: "Python", detail: "원본 금액·캠페인명 대조", kind: "check" },
        { title: "style_editor", tag: "LLM", detail: "광고 문체와 표현 정돈", kind: "llm" },
        { title: "report_qa_agent", tag: "Python", detail: "출고 전 위반 차단", kind: "check" },
      ],
      loop: "fact_guard 위반 → 재프롬프트 · QA 위반 섹션만 재생성(최대 3회)",
    },
  ],

  outcomes: [
    {
      label: "운영",
      body: "테넌트별 주간·월간 리포트를 자동 생성해 운영 중입니다. 최근 기준 하루 26~54개 수집 job이 돌고, 산출물은 주간 3~4분 / 월간 4~8분에 생성됩니다.",
    },
    {
      label: "검증 가능성",
      body: "리포트의 모든 금액은 BigQuery 원본 행으로 만든 표의 값 집합과 대조해 통과시킵니다. 모델이 만들어낸 숫자는 문서에 남지 않습니다.",
    },
    {
      label: "대외",
      body: "구축 사례가 동아일보 경제면에 보도됐습니다. 리포트가 다루는 광고 집행 규모는 누적 광고비 $463,984 · 매출 $734,727(ROAS 1.58)입니다.",
    },
  ],

  decisions: [
    {
      index: "01",
      title: "에이전트 자율 라우팅을 폐기했습니다",
      considered: "ADK Coordinator가 리포트 5개 섹션을 자율 라우팅하는 multi-turn 구조로 먼저 구현했습니다.",
      problem:
        "같은 입력이 실행마다 다른 경로를 탔습니다. 실패를 재현할 수 없으니 디버깅이 성립하지 않았고, 리포트 품질 편차의 원인을 특정할 수 없었습니다.",
      decision:
        "2026-05-14 재설계로 오케스트레이션을 Python 직선 흐름으로 되돌렸습니다. ADK는 LLM 호출 래퍼로만 씁니다.",
      kept:
        "Vertex 네이티브 인증(ADC), tool calling 추상화, before/after_model_callback 훅(토큰 사용량 로깅·tool_config 스왑), 세션 state는 그대로 활용합니다.",
      takeaway:
        "프레임워크 선택의 문제가 아니라, 프로덕션에서 자율성을 어디까지 허용할지의 문제였습니다. 재현 가능성을 포기하는 자율성은 쓰지 않습니다.",
    },
    {
      index: "02",
      title: "검증자를 LLM으로 두지 않았습니다",
      considered: "생성 결과를 다른 LLM이 심사하는 LLM-as-judge 구성이 일반적인 선택지였습니다.",
      problem: "검증자를 LLM으로 두면 환각을 환각이 승인합니다. 조작된 숫자와 바뀐 캠페인명을 걸러낼 근거가 없습니다.",
      decision:
        "생성(LLM) → fact_guard(Python) → 교정(LLM) → report_qa_agent(Python)의 3계층으로 나누고, 두 검증 계층을 전부 결정론적 Python으로 구현했습니다. 달러 금액은 BigQuery 원본 행으로 만든 표의 값 집합에 없으면 통과하지 못합니다.",
      takeaway:
        "LLM은 서사를 고르고, 숫자의 진위는 코드가 판정합니다. 역할을 섞지 않는 것이 신뢰도의 전제입니다.",
    },
    {
      index: "03",
      title: "AI의 역할을 '현상 정리'로 한정했습니다",
      considered: "재고·시즌성·프로모션 맥락까지 LLM이 추론해 전략을 제안하는 방향도 검토했습니다.",
      problem:
        "데이터 밖 맥락을 모델이 추정하기 시작하면 리포트 전체의 신뢰도가 흔들립니다. 틀린 전략 제안 한 줄이 맞는 분석 열 줄을 무효로 만듭니다.",
      decision:
        "AI는 지출 변화·ROAS 증감처럼 데이터로 확인되는 현상만 정리하고, 최종 전략 판단은 마케터가 맡도록 역할을 분리했습니다. 이 경계는 클라이언트·마케터와 합의해 설계에 반영했습니다.",
      takeaway: "성급한 결론 리스크를 프롬프트가 아니라 협업 구조로 막았습니다.",
    },
  ],

  troubleshooting: {
    headline: "LLM 환각 — 숫자와 용어의 조작",
    evidence: "실제 전환이 있는데도 ‘직접 매출 없음’으로 서술된 고객 피드백 P0를 계기로, 생성 결과를 원본 데이터와 대조하는 출고 차단선을 세웠습니다.",
    incident: {
      when: "2026-06-04 · 고객 피드백 P0",
      report: "Cross-sell 섹션에 direct conversion이 실제로 존재했는데 “직접 매출 없음”으로 서술 — 실제 성과와 정반대의 문장이 나갔습니다.",
      fix: "fact_guard에 _DIRECT_ABSENCE_CLAIM_RE 정규식을 추가해 같은 유형의 서술을 생성 단계에서 차단했습니다.",
    },
    residue:
      "report_qa_agent의 금칙어 규칙에는 source_type, served_search_term, Drill-Down, Top of Search, 구매 여정, 후광 효과 등 수십 개가 쌓여 있습니다. 한 번에 설계한 규칙이 아니라 반복 실패가 남긴 화석입니다.",
    secondary: {
      headline: "수집 계층 — 변경 중인 외부 API 위에서의 수집 안정화",
      context:
        "구축 시점의 Amazon 리포트 API는 개편이 진행 중이었습니다. 콘솔 화면과 응답 스펙이 함께 바뀌었고 참고할 선례가 없어, 실패 유형을 하나씩 관측해 분류하는 방식으로 대응했습니다.",
      rows: [
        { label: "SP-API Unauthorized (토큰 만료)", value: "최다" },
        { label: "catalog 200 응답 에러", value: "143건" },
        { label: "Inventory 리포트 FATAL", value: "73건" },
        { label: "Sales 3일 초과 타임아웃 · 404", value: "59건" },
        { label: "Brand Analytics FATAL", value: "26건" },
      ],
      resolution:
        "실패 유형별로 재시도 정책을 나눈 결과, 구축 기간 누적 21,607건 중 676건을 재시도로 회수했습니다. 남은 영구 실패 373건은 대부분 API 스펙을 역설계하던 PoC 구간에 몰려 있습니다.",
    },
  },

  collaboration_detail: {
    setting:
      "클라이언트사의 마케터가 실제 사용자였습니다. 요구는 “리포트를 자동으로 만들어 달라”였지만, 업체마다 리포트 형식과 판단 기준이 달라 그대로는 자동화할 대상이 정의되지 않았습니다.",
    translations: [
      {
        heard: "“업체마다 리포트가 달라서 비교가 안 됩니다.”",
        delivered:
          "기존 리포트를 직접 수집·분석해 공통 항목을 추려 표준 리포트 생성 기준을 정립했습니다. 자동화 이전에 문서 규격을 먼저 합의했습니다.",
      },
      {
        heard: "“AI가 전략까지 제안해 주면 좋겠습니다.”",
        delivered:
          "재고·시즌성·프로모션은 데이터에 없어 모델이 추정하면 틀립니다. AI는 현상 정리까지, 전략 판단은 마케터가 맡는 것으로 역할 경계를 합의했습니다.",
      },
      {
        heard: "“Cross-sell 항목이 실제와 반대로 쓰여 있습니다.” (2026-06-04 · P0)",
        delivered:
          "재발 방지를 프롬프트가 아니라 결정론적 규칙으로 잡겠다고 정하고, fact_guard에 해당 서술 패턴을 차단하는 검사를 추가했습니다.",
      },
    ],
    boundary: {
      title: "사람이 개입할 지점을 남겨 두었습니다",
      body: "완전 자동화 대신, AI가 만든 문장의 근거가 되는 표와 원본 수치를 리포트에 함께 실었습니다. 마케터가 결론을 검토할 수 있어야 자동화를 신뢰하고 계속 쓴다고 판단했습니다.",
    },
  },
};

export const bidMaster: CaseStudy = {
  id: "bid-master",
  order: "02",
  type: "BACKEND · WORKFLOW AUTOMATION",
  title: "Bid Master",
  thesis: "여러 사이트를 긁는 대신, 폐쇄형 조달 시스템 한 곳을 API 레벨까지 역설계했습니다.",
  period: "2025.11 — 2025.12",
  role: "제품 흐름 설계 · Full-stack · 배포 / 단독 개발",
  status: "운영 중",
  collaboration: "기획은 클라이언트 · 회의록 기반 수용 기준 합의",
  stack: ["FastAPI", "SQLAlchemy", "PostgreSQL", "Next.js", "Cloud Run Job", "pandas", "Gemini"],
  link: { label: "bid-master.co.kr", url: "https://bid-master.co.kr" },

  scale: [
    { value: "3~4시간 → 30분", label: "실사용 소요시간", note: "클라이언트 회의록 기준 · 약 85% 단축" },
    { value: "877건", label: "누적 수집 공고", note: "일 자동 수집 · 어제자 진행중 8건 내외" },
    { value: "29,761행", label: "누적 품목", note: "공고당 평균 34행" },
    { value: "9,521개", label: "정규화 품목 코드", note: "대분류 4 · 중분류 59 · 품목그룹 4,229" },
    { value: "1,416개교", label: "학교 마스터", note: "묶음입찰 개별학교 306행" },
    { value: "1,608건", label: "첨부파일 파싱", note: "엑셀 자동 파서 + LLM 폴백" },
  ],
  scaleSource: "운영 DB 덤프 실측 · 2026.03.06 기준",
  architectureNote: "수집 → 품목 해석 분기",
  scaleNote:
    "수집 대상은 eaT 학교급식전자조달 1곳이고, 역설계한 API 엔드포인트는 목록·상세·첨부 3종입니다. 지역코드 250개를 파싱해 보유하되 운영은 서울·경기 2개 지역 × 축산 3개 키워드, 하루 6조합으로 좁혀 실행합니다.",

  lanes: [
    {
      name: "INGESTION",
      caption: "매일 자정(KST) Cloud Run Job",
      nodes: [
        { title: "eaT · Nexacro SPA", detail: "XHR 역설계", kind: "io" },
        { title: "목록 / 상세 / 첨부 API", detail: "XML 컬럼 ID 파싱", kind: "io" },
        { title: "중복 · 멱등 방어", detail: "dedup + upsert", kind: "check", tag: "멱등" },
        { title: "PostgreSQL", detail: "tenders / tender_items", kind: "store" },
      ],
      loop: "etn_bid_id 인메모리 dedup · bid_number UNIQUE upsert · 기수집 공고 상세조회 스킵",
    },
    {
      name: "ITEM RESOLUTION",
      caption: "분기 기준은 사이트가 아니라 공고입니다",
      split: {
        condition: "공고가 품목을 구조화해서 올렸는가?",
        paths: [
          {
            label: "구조화 품목 있음",
            weight: "로그 8건 중 2건",
            nodes: [{ title: "school_items 그대로 사용", detail: "구조화 데이터", kind: "store" }],
          },
          {
            label: "구조화 품목 없음 — 주력 경로",
            weight: "로그 8건 중 6건",
            nodes: [
              { title: "첨부 엑셀 다운로드", detail: "1,608건", kind: "io" },
              { title: "pandas 파서", detail: "헤더행 자동탐색 · 컬럼 매핑", kind: "check", tag: "규칙" },
              { title: "Gemini 폴백", detail: "파서 실패 시에만", kind: "llm", tag: "LLM" },
            ],
          },
        ],
      },
      loop: "매칭은 조회 시점이 아니라 저장 직후 50건 배치로 미리 계산해 캐시에 적재",
    },
  ],

  outcomes: [
    {
      label: "업무",
      body: "매월 20일 전후 5~6일에 물량이 몰리는 업무입니다. 엑셀로 3~4시간 걸리던 검토가 30분 내외로 줄었다는 것이 클라이언트 회의록에 기록돼 있습니다.",
    },
    {
      label: "자동화 범위",
      body: "수집(자정 자동 실행) · 매칭(저장 직후 사전 계산) · 판단(하한가 = 단가 × 사정률, 예상이익 = 하한가합계 − 내물품가) 세 단계에서 수작업을 제거했습니다.",
    },
    {
      label: "데이터 자산",
      body: "공고를 모으는 데서 끝내지 않고 9,521개 표준 식품코드로 정규화해, 품목·단가를 누적 비교할 수 있는 DB를 만들었습니다.",
    },
  ],

  decisions: [
    {
      index: "01",
      title: "브라우저 자동화에서 API 직접 호출로 전환했습니다",
      considered:
        "대상이 Nexacro 기반 SPA라 HTML 소스에 데이터가 없었습니다. HTML 파서로는 파싱할 대상 자체가 없어 후보에서 먼저 제외했습니다.",
      problem:
        "그래서 Playwright로 브라우저를 띄워 클릭 가능 요소를 스캔·좌표 매핑(SoM)해 조작했습니다. 다만 화면 DOM 변경에 취약했고, Cloud Run Job에서 브라우저 기동 비용이 컸습니다.",
      decision:
        "조작 과정에서 XHR을 관찰해 Nexacro XML 요청 스펙을 역설계하고, 목록·상세·첨부 3개 API를 직접 호출하는 순수 requests 파이프라인으로 전환했습니다.",
      kept:
        "브라우저 기동이 사라져 Cloud Run Job(2Gi, asia-northeast3)에서 안정적으로 돌고, XML 컬럼 ID 기반 파싱이라 화면 변경에 둔감해졌습니다.",
      takeaway:
        "자동화 도구를 고르는 문제가 아니라, 조작해야 할 화면을 관측 가능한 계약으로 바꾸는 문제였습니다.",
      debt: "Dockerfile에 chromium 설치가 남아 이미지가 불필요하게 큽니다. 전환은 마쳤지만 정리하지 못한 부채로 인지하고 있습니다.",
    },
    {
      index: "02",
      title: "매칭을 조회 시점이 아니라 저장 직후에 계산했습니다",
      considered: "목록을 열 때 사용자별 수익성을 실시간으로 계산하는 방식이 기본 선택지였습니다.",
      problem:
        "입찰 시즌이 매월 20일 전후 5~6일에 몰립니다. 사용자가 가장 몰리는 시점에 가장 무거운 계산이 겹치는 구조였습니다.",
      decision:
        "수집 저장 직후 calculate-matches를 50건 배치로 트리거해 user_tender_matches 캐시에 미리 계산해 두고, 목록 조회는 캐시만 읽도록 분리했습니다.",
      takeaway: "사용자가 몰리는 시점과 계산이 가능한 시점이 다르면, 계산을 앞으로 당깁니다.",
    },
    {
      index: "03",
      title: "자동화가 불가능한 지점은 사용자 참여로 바꿨습니다",
      considered:
        "G마크 요구 학교는 정보가 엑셀이 아니라 한글 파일로 오는 경우가 있어 자동 추출이 불가능했습니다.",
      problem: "완전 자동화를 고집하면 해당 학교는 아예 다룰 수 없게 되고, 사용자는 다시 수작업으로 돌아갑니다.",
      decision:
        "자동 추출을 포기하고, 사용자가 한 번 체크하면 다음부터 배지로 표시되는 토글로 바꿨습니다. 단가 DB와 공유 단가 DB도 같은 방식으로 설계했습니다.",
      takeaway: "자동화 실패를 사용자 참여형 데이터 자산으로 바꿨습니다. 한 번의 입력이 다음 사용자에게 남습니다.",
    },
  ],

  troubleshooting: {
    headline: "학교마다 제각각인 엑셀 양식",
    evidence:
      "실제 변동은 사이트 구조가 아니라 첨부 파일이었습니다. API 경로는 XML 컬럼 ID 기반이라 화면 변경에 둔감했고, 깨지는 쪽은 항상 학교가 직접 올린 엑셀이었습니다.",
    incident: {
      when: "다중 시트 공고",
      report:
        "한 학교가 농산·축산·수산을 시트로 나눠 올린 경우, 전체 시트를 읽어 매칭률과 예상 금액이 함께 왜곡됐습니다.",
      fix:
        "키워드와 시트명을 매칭해 대상 시트만 파싱하고, 매칭되는 시트가 없으면 전체로 폴백합니다. 그리고 실제로 읽은 시트명을 UI에 노출해 사용자가 확인할 수 있게 했습니다.",
    },
    residue:
      "파싱은 헤더행 자동 탐색 → 컬럼명 매핑 → 인덱스 컬럼 판별 순으로 시도하고, 모두 실패할 때만 Gemini로 넘깁니다. LLM을 기본 경로가 아니라 마지막 폴백에 둔 이유는 비용과 재현성 때문입니다.",
    secondary: {
      headline: "중복 · 재실행 · 유실 방어",
      context:
        "지역별로 순회하는 구조라 같은 공고가 여러 번 수집됩니다. 중복 제거와 재실행 안전성을 계층으로 나눠 처리했습니다.",
      rows: [
        { label: "etn_bid_id 인메모리 dedup", value: "1차" },
        { label: "bid_number UNIQUE + upsert", value: "멱등" },
        { label: "기수집 공고 상세조회 스킵", value: "LLM 비용" },
        { label: "네트워크 오류만 선별 백오프", value: "5→10→20초" },
        { label: "시작 전 DB 연결 확인", value: "5회" },
      ],
      resolution:
        "저장이 불가능한 상태에서 크롤링하면 수집한 데이터가 그대로 유실됩니다. 그래서 크롤링을 시작하기 전에 DB 연결을 백오프로 확인하고, 실패하면 아예 시작하지 않습니다. 남은 과제는 엑셀 경로 품목의 school_id가 NULL로 남는 케이스입니다 — tender_schools가 API 품목 경로에서만 insert되는 구조가 원인입니다.",
    },
  },

  collaboration_detail: {
    setting:
      "기획을 클라이언트가 맡은 프로젝트였습니다. 요구는 대부분 증상으로 전달됐고, 저는 그것을 가설과 수용 기준으로 번역하는 역할을 했습니다.",
    translations: [
      {
        heard: "“학교를 6번째 연속으로 클릭하면 데이터가 안 나옵니다.”",
        delivered:
          "요청 레이스 컨디션 · 세션 만료 · 요청 취소 미처리 · 429 · 전역 상태 덮어쓰기로 가설을 나눴습니다. 수용 기준은 “20회 연속 클릭에도 미재현” 그리고 “빈 화면 대신 재시도·원인 메시지·자동 재요청 중 최소 하나는 동작”으로 합의했습니다.",
      },
      {
        heard: "“뒤로 가면 데이터가 없어집니다. 될 때도 있고 안 될 때도 있고요.”",
        delivered:
          "상태 소실로 가설을 세우고, “검색어·필터·스크롤 위치·결과 리스트 100% 복구, 브라우저 뒤로가기와 앱 내 뒤로가기 동일 동작”을 수용 기준으로 문서화했습니다.",
      },
      {
        heard: "“축산 시트만 읽어주세요.”",
        delivered:
          "첨부 구조상 사용자가 시트를 고를 수 없는 케이스가 있었습니다. 자동 판별 규칙을 적용하되 현재 읽은 시트명을 화면에 표시하는 것으로 합의했습니다. 완전 자동화 대신 관측 가능성으로 신뢰를 확보한 경우입니다.",
      },
    ],
    boundary: {
      title: "우선순위를 근거를 갖고 합의했습니다",
      body: "클라이언트가 “안정성만 잡히면 유료로 쓰겠다”고 말한 것을 근거로, 신규 기능보다 P0 안정성 버그를 먼저 처리하기로 정했습니다. 실제로 P0 8건을 끝낸 뒤 기능 6건 순서로 진행했습니다.",
    },
  },
};

export const byeoljari: CaseStudy = {
  id: "byeoljari",
  order: "03",
  type: "B2C PRODUCT · SOLO",
  title: "Byeoljari.com",
  thesis: "성공 기준을 ‘결제 완료’가 아니라 ‘결제한 사람이 결과를 받는 것’으로 정의했습니다.",
  period: "2026.03 — 운영 중",
  role: "기획 · 디자인 · Frontend · Backend · Infra / 단독 개발",
  status: "실결제 운영 중",
  collaboration: "외부 코드 리뷰 수용 · 사업자 등록 및 PG 계약 직접 수행",
  stack: ["Next.js 16", "React 19", "FastAPI", "Supabase", "PortOne V2", "Gemini", "Vercel"],
  link: { label: "byeoljari.com", url: "https://byeoljari.com" },

  scale: [
    { value: "실결제 운영", label: "B2C 서비스", note: "사업자 등록 · PG 가맹점 계약" },
    { value: "기획 → 운영", label: "전 과정 단독 책임", note: "제품 · 디자인 · 개발 · 배포" },
    { value: "무료 → 유료", label: "전환 흐름", note: "기본 결과 후 AI 상세 리딩" },
    { value: "11종", label: "유료·무료 서비스", note: "사주 · 점성술 · 타로 · 궁합 · 일일운세" },
    { value: "24개", label: "핵심 사용자 시나리오", note: "결제 · 결과 전달 · 환불 검증" },
    { value: "유입 → 결제", label: "직접 운영한 퍼널", note: "SEO · Meta 광고 · PG" },
  ],
  scaleSource: "실서비스 운영 · 사용자 시나리오 검증",
  architectureNote: "결정론적 계산 / AI 해석 분리",
  codeQuote: {
    code: "성공 기준 : 결제 → 사용자가 제대로된 리딩 결과를 받는다. 환불은 fallback이 아니라 실패.",
    cite: "CLAUDE.md — 프로젝트 문서 첫 줄에 적어둔 성공 기준",
  },
  scaleNote:
    "결제는 PortOne V2로 카카오페이(회원)와 토스페이(비회원)를 모두 지원합니다. 가격은 코드 상수가 아니라 service_prices 테이블이 유일 권위 소스이며, 관리자 화면에서 배포 없이 변경합니다.",

  lanes: [
    {
      name: "READING",
      caption: "정답이 있는 계산과 서술을 분리",
      nodes: [
        { title: "생년월일시 입력", detail: "AES-256-GCM 암호화 저장", kind: "io" },
        { title: "FastAPI 계산 엔진", detail: "lunar_python · kerykeion", kind: "check", tag: "결정론적" },
        { title: "무료 미리보기", detail: "결제 강제 없음", kind: "io" },
        { title: "Gemini 해석", detail: "SSE 스트리밍 · 3회 재시도", kind: "llm", tag: "LLM" },
      ],
      loop: "50자 미만 응답은 저장하지 않고 자동 재시도 · 이탈 시 AbortController로 중단",
    },
    {
      name: "PAYMENT → DELIVERY",
      caption: "환불은 fallback이 아니라 실패입니다",
      nodes: [
        { title: "PortOne V2", detail: "서버에서 금액 대조", kind: "check", tag: "검증" },
        { title: "payments INSERT", detail: "payment_id UNIQUE · 멱등", kind: "store" },
        { title: "reading_token", detail: "원자적 UPDATE used=false→true", kind: "check", tag: "멱등" },
        { title: "결과 저장 + 메일", detail: "results.ai_reading", kind: "store" },
      ],
      loop: "실패 시 토큰 롤백 → cron 재시도 → 그래도 실패하면 관리자 알림 후 환불",
    },
  ],

  outcomes: [
    {
      label: "제품",
      body: "기획·디자인부터 프론트엔드·백엔드·인프라까지 단독으로 만들어 실결제가 일어나는 B2C 서비스로 운영 중입니다. 사업자 등록과 PG 가맹점 계약도 직접 진행했습니다.",
    },
    {
      label: "무결성",
      body: "결제 금액 서버 대조, payment_id 멱등성, 낙관적 잠금, 토큰 원자적 소비, 타인 결제 환불 차단을 코드 레벨에서 강제합니다. 감사에서 나온 CRITICAL 7건·HIGH 10건을 모두 해소했습니다.",
    },
    {
      label: "운영",
      body: "가격을 DB 권위로 두어 광고 집행 중에도 배포 없이 조정할 수 있고, 관리자 화면에서 매출·사용자·리딩 현황을 확인합니다. Meta 광고를 직접 집행해 유입부터 결제까지의 퍼널을 봤습니다.",
    },
  ],

  decisions: [
    {
      index: "01",
      title: "도메인 계산을 LLM이 아니라 Python으로 분리했습니다",
      considered: "생년월일을 그대로 LLM에 넘겨 명식 산출과 해석을 한 번에 시키는 구성이 가장 빠른 길이었습니다.",
      problem:
        "만세력 변환·절기 경계·행성 위치는 정답이 있는 계산입니다. 모델이 추정하면 같은 생년월일에 다른 결과가 나오고, 유료 서비스에서 그건 제품 실패입니다.",
      decision:
        "lunar_python과 kerykeion을 쓰는 FastAPI 계산 엔진을 분리해 명식을 결정론적으로 산출하고, Gemini는 산출된 명식을 해석하는 역할만 맡깁니다.",
      takeaway:
        "정답이 있는 것은 코드가 계산하고, 서술이 필요한 것만 모델에 맡깁니다. Amazon Ads Agent에서 검증을 Python에 둔 것과 같은 원칙입니다.",
    },
    {
      index: "02",
      title: "성공 기준을 ‘결제 완료’가 아니라 ‘결과 수신’으로 잡았습니다",
      considered: "결제 검증까지 책임지고 AI가 실패하면 환불하는 구조가 일반적인 선택지였습니다.",
      problem:
        "환불은 사용자 입장에서 실패입니다. 돈은 돌아오지만 원했던 결과는 받지 못합니다. 게다가 토큰을 먼저 used=true로 잠그는 구조에서는, AI 호출 중 런타임이 끊기면 그 주문이 재시도 대상에서 아예 빠집니다.",
      decision:
        "‘환불은 fallback이 아니라 실패’를 기준으로 삼고, 토큰 롤백 · cron 재처리 · 관리자 알림을 붙여 결제된 주문이 결과에 도달할 때까지 추적되도록 만들었습니다.",
      takeaway: "성공 기준을 어디에 두느냐가 아키텍처를 결정합니다. 결제가 아니라 전달을 기준으로 잡으면 필요한 상태가 달라집니다.",
      debt:
        "게스트 결제는 webhook이 결과의 writeToken을 검증할 수 없어 클라이언트 verify에 의존이 남아 있고, vercel.json에는 cron 스케줄 정의가 없습니다. 저장소 기준으로 자동 복구가 주기 실행된다는 보장은 아직 없습니다.",
    },
    {
      index: "03",
      title: "가격을 코드가 아니라 DB에 두었습니다",
      considered: "가격을 코드 상수로 관리하는 방식이 단순하고 타입 안전합니다.",
      problem: "가격을 바꿀 때마다 배포가 필요합니다. 광고를 집행하는 중에는 가격 실험 자체가 불가능해집니다.",
      decision:
        "service_prices 테이블을 유일 권위 소스로 두고 관리자 화면에서 변경합니다. 코드의 상수는 타입과 초기값 전용으로만 남겼습니다.",
      takeaway: "사업 판단으로 자주 바뀌는 값은 배포 경로에서 빼냅니다.",
    },
  ],

  troubleshooting: {
    headline: "환불 계산이 금융 손실로 이어질 수 있었던 문제",
    evidence:
      "사용자 시나리오 검증 중 결제 식별자와 사용자의 연결 누락을 발견해, 결제 SDK에 식별자를 심고 서버에서 다시 대조·차단하도록 바꿨습니다.",
    incident: {
      when: "2026-05-21 · P0-A",
      report:
        "회원이 외부결제로 콘텐츠를 사면 충전과 구분되지 않는 PAID 행이 남습니다. FIFO 잔여 계산이 이를 충전금으로 취급해, 이미 100% 소진된 14,900원 결제에 환불 가능 잔액 10,000원이 잡혔습니다. 서비스도 받고 환불도 받는 경로였습니다.",
      fix:
        "charge-and-use 결제를 충전형과 구분해 기록하고, FIFO 계산이 use 트랜잭션의 chargePaymentId까지 보도록 고쳤습니다. 어느 결제가 이미 소진됐는지를 계산이 알 수 있게 만든 것이 핵심입니다.",
    },
    residue:
      "기존 결제와 데이터 구조를 깨지 않으면서 신규 결제부터 식별자 검증을 적용했습니다. 결제 로직에서는 빠른 수정 자체보다 기존 주문의 호환성과 결과 전달 순서를 지키는 것이 중요했습니다.",
    secondary: {
      headline: "결제 · 리딩 무결성 방어",
      context:
        "결제 성공 화면이 아니라 사용자가 결과를 받는 순간까지를 하나의 시나리오로 보고, 결제·토큰·리딩·환불 경계를 반복 검증했습니다. 아래는 그 과정에서 닫은 대표 실패 경로입니다.",
      rows: [
        { label: "결제 금액 클라이언트 변조", value: "서버 대조" },
        { label: "reading_token 이중 사용", value: "원자적 UPDATE" },
        { label: "charge TOCTOU 레이스", value: "UNIQUE + 23505" },
        { label: "게스트 결제 금액 무제한", value: "상한 검증" },
        { label: "returnUrl open redirect", value: "상대경로만" },
      ],
      resolution:
        "CRITICAL 7건과 HIGH 10건을 모두 해소했습니다. 남은 과제는 게스트 결제의 webhook 자동 보강과 cron 스케줄 정의이며, 문서에 그대로 기록해 두었습니다.",
    },
  },

  collaboration_detail: {
    label: "REVIEW",
    note: "혼자 만든 제품에서 검증을 확보하는 법",
    headers: ["리뷰에서 지적받은 것", "내가 검증하고 고친 것"],
    setting:
      "클라이언트도 리뷰어도 없는 1인 제품이었습니다. 요구를 주는 사람과 검증하는 사람이 모두 저라는 것이 가장 큰 리스크라고 보고, 외부 코드 리뷰를 의도적으로 끌어들여 검증 경로를 만들었습니다.",
    translations: [
      {
        heard: "“회원 charge-and-use 결제가 환불 pool을 오염시킨다.”",
        delivered:
          "지적을 그대로 수용하지 않고 코드로 시나리오를 재현해 실제 금융 손실 경로임을 먼저 확인했습니다. 그 과정에서 지적되지 않은 결함 2건을 추가로 찾아 함께 고쳤습니다.",
      },
      {
        heard: "“cron 라우트는 있는데 스케줄이 보장되는지 모르겠다.”",
        delivered:
          "vercel.json에 crons 정의가 없다는 사실만 확인하고, 외부 대시보드에서 돌고 있을 가능성은 추측으로 적지 않았습니다. “저장소 기준으로는 보장이 없다”고 문서에 그대로 남겼습니다.",
      },
      {
        heard: "“결제를 강제하면 유입이 이탈한다.” (광고 집행 결과)",
        delivered:
          "온보딩과 즉시 결제를 강제하던 랜딩을 접고, 무료 기본 결과를 먼저 보여준 뒤 AI 상세 리딩만 결제로 유도하는 흐름으로 바꿨습니다. 기존 랜딩은 삭제하지 않고 복구 절차와 함께 보관했습니다.",
      },
    ],
    boundary: {
      title: "판단 근거를 운영 원칙으로 남겼습니다",
      body: "리뷰에서 배운 것을 개발 원칙으로 정리했습니다. 증상을 감추는 예외 처리보다 원인을 제거하고, 문제가 생긴 뒤의 처리보다 발생 조건을 먼저 검증한다는 기준입니다. 다음 변경에서도 같은 실패를 반복하지 않기 위한 제품 운영 규칙입니다.",
    },
  },
};

export const caseStudies = [amazonAdsAgent, bidMaster, byeoljari];

/** Projects that carry a deep case study. Others fall back to `projectDetails`. */
export function findCaseStudy(id: string) {
  return caseStudies.find((study) => study.id === id) ?? null;
}
