export type NarrativeItem = {
  title: string;
  detail: string;
};

export type FeaturedDetail = {
  challenge: NarrativeItem;
  operations: NarrativeItem[];
  collaboration: string;
  retrospective: string;
};

export type ProjectNarrative = {
  kind: string;
  team: string;
  user: string;
  need: string;
  success: string;
  experiences: NarrativeItem[];
  ownership: string[];
  outcomes: NarrativeItem[];
  featured?: FeaturedDetail;
};

export const projectNarratives: Record<string, ProjectNarrative> = {
  "amazon-ads-agent": {
    kind: "실무 프로젝트",
    team: "단독 개발 · 광고 운영팀 협업",
    user: "아마존 광고를 운영하는 마케터",
    need: "수집·분석·차트·문서 작성으로 분절된 반복 업무",
    success: "원본 데이터에 근거한 일관된 리포트와 사람의 최종 판단 유지",
    experiences: [
      { title: "자동 데이터 수집", detail: "SP-API·Ads API 일일 수집 및 BigQuery 적재" },
      { title: "근거 기반 분석", detail: "관찰 데이터만 사용한 광고 성과 해석" },
      { title: "생성·검수 분리", detail: "리포트 작성 Agent와 수치 검증 Agent의 교차 확인" },
      { title: "최종 승인", detail: "재고·시즌성 판단을 남겨 둔 마케터 승인 흐름" },
    ],
    ownership: ["제품 흐름 및 Agent 역할 설계", "Amazon API 수집·BigQuery 파이프라인", "리포트·차트 생성과 검증", "Cloud Run·Tasks 운영"],
    outcomes: [
      { title: "반복 작성 자동화", detail: "기존 리포트 작성 업무 약 70% 자동화" },
      { title: "실무 운영", detail: "광고 데이터 일일 수집과 리포트 생성 운영" },
      { title: "외부 보도", detail: "AI 광고 분석 시스템 관련 언론 보도" },
    ],
    featured: {
      challenge: { title: "생성 결과의 수치 불일치", detail: "원본 집계값 재조회와 별도 검수 Agent를 통한 근거 대조" },
      operations: [
        { title: "재시도 경계", detail: "수집·분석·문서 생성의 비동기 작업 분리" },
        { title: "품질 기준", detail: "관찰 사실과 해석의 분리, 사람의 최종 승인" },
        { title: "운영 추적", detail: "작업 상태·산출물·실패 구간 기록" },
      ],
      collaboration: "마케터의 재고·시즌성 판단과 시스템의 데이터 근거 사이 역할 합의",
      retrospective: "완전 자동화보다 근거 추적과 승인 경계의 중요성 확인",
    },
  },
  "multilingual-cms": {
    kind: "실무 프로젝트",
    team: "단독 개발 · 콘텐츠 운영팀 협업",
    user: "여러 언어의 의료 콘텐츠를 운영하는 마케팅 담당자",
    need: "언어별 번역·검수·발행 시점 차이와 반복적인 수동 관리",
    success: "언어마다 독립적인 상태 관리와 검색 노출용 데이터의 일관된 발행",
    experiences: [
      { title: "언어별 작업 상태", detail: "초안·검수·발행의 독립 관리" },
      { title: "콘텐츠 편집", detail: "Tiptap 기반 본문·미디어 편집과 미리보기" },
      { title: "검색 노출", detail: "언어별 메타데이터와 JSON-LD 발행" },
    ],
    ownership: ["콘텐츠 모델 및 권한 설계", "편집·검수·발행 UI", "미디어 저장과 서명 URL", "SEO 구조화 데이터"],
    outcomes: [
      { title: "운영 흐름 통합", detail: "언어별 콘텐츠 작업을 하나의 CMS로 통합" },
      { title: "수동 작업 축소", detail: "반복적인 발행·메타데이터 관리의 제품화" },
    ],
  },
  "snap-p": {
    kind: "실무 프로젝트",
    team: "단독 개발 · 커머스 운영팀 협업",
    user: "아마존 상품 페이지를 제작하는 브랜드 운영자",
    need: "상품 분석·기획·현지화·정책 검수로 분산된 이미지 제작 과정",
    success: "상품 정보 한 번으로 역할이 구분된 이미지 9장과 카피 완성",
    experiences: [
      { title: "상품 분석", detail: "특징·타깃·판매 포인트의 구조화" },
      { title: "크리에이티브 브리프", detail: "이미지별 목적과 메시지 선행 설계" },
      { title: "이미지·카피 생성", detail: "미국 시장 문맥을 반영한 9개 슬롯 제작" },
      { title: "품질 검수", detail: "정책·규격·모바일 가독성 확인" },
    ],
    ownership: ["요구사항 및 생성 흐름 설계", "AI 이미지·카피 파이프라인", "품질·정책 검사", "웹 제품 및 배포"],
    outcomes: [
      { title: "제작 흐름 단일화", detail: "상품 입력부터 결과 검수까지 한 제품으로 연결" },
      { title: "반복 제작 축소", detail: "브리프와 슬롯 규칙을 통한 결과 일관성 확보" },
    ],
  },
  "bid-master": {
    kind: "실무 프로젝트",
    team: "단독 개발 · 식자재 입찰 실무자 협업",
    user: "학교급식 입찰 공고를 매일 확인하는 식자재 사업자",
    need: "형식이 다른 공고와 현품설명서에서 취급 품목·수익성을 직접 판별하는 업무",
    success: "조건에 맞는 공고만 선별한 정시 알림과 판별 근거 제공",
    experiences: [
      { title: "공고 자동 수집", detail: "새 공고와 첨부 문서의 예약 수집" },
      { title: "품목 표준화", detail: "서로 다른 표기명을 식재료 코드로 정규화" },
      { title: "수익성 판별", detail: "지역·품목·가격 조건 기반 후보 선별" },
      { title: "맞춤 알림", detail: "검토할 공고만 이메일로 전달" },
    ],
    ownership: ["현업 인터뷰와 판별 규칙 정의", "크롤러·문서 파서", "수익성 엔진과 알림", "웹 화면·DB·배포"],
    outcomes: [
      { title: "탐색 자동화", detail: "공고 검색부터 1차 수익성 판별까지 자동 연결" },
      { title: "실서비스 운영", detail: "실무자가 사용하는 입찰 자동화 서비스" },
    ],
    featured: {
      challenge: { title: "비정형 첨부 문서", detail: "표기 차이를 표준 코드로 정규화하고 파싱 실패를 별도 검토 대상으로 분리" },
      operations: [
        { title: "수집 안정성", detail: "API 우선 수집, 동적 다운로드 구간만 브라우저 자동화" },
        { title: "중복 방지", detail: "공고 변경 감지와 예약 작업 멱등성" },
        { title: "실패 관찰", detail: "파싱·알림 실패 구간의 재실행 가능 구조" },
      ],
      collaboration: "실무자의 ‘좋은 공고’ 판단을 품목·지역·수익성 규칙으로 변환",
      retrospective: "크롤링 범위 확대보다 판별 근거의 설명 가능성이 더 중요한 제품",
    },
  },
  "voc-analyzer": {
    kind: "실무 프로젝트",
    team: "단독 개발 · CS 운영팀 협업",
    user: "상담 내용을 분류하고 리포트로 만드는 CS 담당자",
    need: "상담 원문 재검토와 요약·분류·시트 입력의 반복",
    success: "비개발자가 실행 가능한 도구와 수정 가능한 분석 결과",
    experiences: [
      { title: "상담 수집", detail: "ChannelTalk 상담 데이터의 일괄 수집" },
      { title: "요약·분류", detail: "핵심 VOC 추출과 운영 기준 분류" },
      { title: "검토·수정", detail: "자동 결과의 수동 보정" },
      { title: "리포트 연결", detail: "Google Sheets 결과 반영" },
    ],
    ownership: ["현업 분석 항목 정의", "상담 수집·AI 분석", "Streamlit GUI", "데스크톱 패키징"],
    outcomes: [
      { title: "업무 생산성 향상", detail: "CS 분석 업무 생산성 40% 개선" },
      { title: "현업 배포", detail: "설치형 실행 파일과 Google Sheets 연동" },
    ],
  },
  "review-classifier": {
    kind: "실무 프로젝트",
    team: "단독 개발",
    user: "대량 리뷰에서 부정 신호를 빠르게 찾는 커머스 운영자",
    need: "요청마다 LLM을 호출하는 비용·지연과 카테고리별 표현 차이",
    success: "저비용 대량 판독과 부정 리뷰 조기 대응",
    experiences: [
      { title: "리뷰 수집", detail: "Cafe24 리뷰의 정기 수집" },
      { title: "감성 판독", detail: "자체 학습 경량 모델의 긍정·부정 분류" },
      { title: "조기 알림", detail: "부정 리뷰의 운영 알림 연결" },
    ],
    ownership: ["학습 데이터 정제", "TF-IDF·Linear SVM 학습", "Flask 추론 API", "Cafe24 수집·알림"],
    outcomes: [
      { title: "정확도 95%+", detail: "긍정·부정 분류 기준" },
      { title: "호출 비용 절감", detail: "반복 분류에서 범용 LLM 의존 제거" },
    ],
  },
  "local-browser-agent": {
    kind: "실무 연구 프로젝트",
    team: "단독 개발",
    user: "화면 데이터를 외부 AI API로 보낼 수 없는 서비스 운영자",
    need: "사이트마다 다른 UI의 자연어 조작과 개인정보의 로컬 보존",
    success: "클라우드 모델 없이 목표 실행·검증·실패 복구",
    experiences: [
      { title: "자연어 작업", detail: "목표를 단계별 브라우저 행동으로 분해" },
      { title: "화면·DOM 결합", detail: "Set-of-Mark 기반 클릭 후보 선택" },
      { title: "자동 검증", detail: "실행 결과와 GA4 dataLayer 확인" },
      { title: "실패 학습", detail: "성공 셀렉터 저장과 단계별 폴백" },
    ],
    ownership: ["Agent 상태 그래프", "로컬 멀티모달 추론", "Playwright 실행기", "GA4 검증 적용"],
    outcomes: [
      { title: "외부 모델 전송 0", detail: "Qwen2.5·LLaVA의 로컬 실행" },
      { title: "검증 범위 80.5%", detail: "내부 실행 기준 33개 GA4 이벤트 자동 검증" },
    ],
  },
  "text-to-sql": {
    kind: "실무 프로젝트",
    team: "단독 개발",
    user: "SQL 없이 GA4 데이터를 확인하려는 실무자",
    need: "스키마 이해·SQL 작성·오류 수정이 필요한 데이터 탐색 과정",
    success: "자연어 질문부터 안전한 실행·복구·해석까지의 단일 흐름",
    experiences: [
      { title: "자연어 질문", detail: "업무 언어로 데이터 질의" },
      { title: "안전한 SQL 생성", detail: "스키마·유사 예시 기반 BigQuery SQL" },
      { title: "오류 복구", detail: "실행 오류 기반 최대 2회 자동 수정" },
      { title: "결과 해석", detail: "인사이트와 후속 질문 제공" },
    ],
    ownership: ["RAG·SQL 생성 파이프라인", "실행 안전 규칙", "Recovery Agent", "SSE 진행 UI·FastAPI"],
    outcomes: [
      { title: "분석 진입장벽 축소", detail: "질문·실행·해석의 대화형 연결" },
      { title: "실행 위험 통제", detail: "읽기 전용 SQL과 파티션 검증" },
    ],
  },
  "ga4-validator": {
    kind: "실무 프로젝트",
    team: "자동화·데이터 QA 담당",
    user: "GA4 구현을 검수하는 개발·마케팅 담당자",
    need: "정상 화면 뒤에 숨은 이벤트 누락과 잘못된 파라미터",
    success: "사용자 행동과 dataLayer 증거의 반복 가능한 동시 검증",
    experiences: [
      { title: "시나리오 실행", detail: "실제 사용자 플로우 자동 탐색" },
      { title: "이벤트 캡처", detail: "행동 시점의 dataLayer 원문 기록" },
      { title: "규칙 검증", detail: "이벤트명·필수 파라미터 대조" },
    ],
    ownership: ["검증 시나리오 정의", "Playwright 자동화", "이벤트 증거 수집", "QA 결과 정리"],
    outcomes: [
      { title: "검수 재현성", detail: "실행자와 시점에 무관한 동일 경로 비교" },
      { title: "오류 근거 확보", detail: "화면 성공과 계측 성공의 분리 기록" },
    ],
  },
  "instagram-insight": {
    kind: "실무 프로젝트",
    team: "크롤링·ML·Backend 담당",
    user: "인플루언서 반응과 구매 의도를 비교하는 마케터",
    need: "댓글 수만으로 구분하기 어려운 단순 반응과 실제 구매 의도",
    success: "다국어 댓글의 수집·정제·분류와 비교 가능한 결과",
    experiences: [
      { title: "댓글 수집", detail: "게시물·릴스 반응의 배치 수집" },
      { title: "다국어 정제", detail: "언어·이모지·짧은 표현 처리" },
      { title: "의도 분류", detail: "규칙과 KcBERT의 하이브리드 판독" },
    ],
    ownership: ["Selenium 수집기", "정제 파이프라인", "하이브리드 분류", "FastAPI 결과 제공"],
    outcomes: [
      { title: "반응 구분", detail: "단순 호응과 가격·구매처 문의의 분리" },
      { title: "재분석 가능", detail: "원문 수집과 모델 분석 단계 분리" },
    ],
  },
  "did-cms": {
    kind: "실무 팀 프로젝트",
    team: "Backend 개발 · 팀 리딩",
    user: "폐쇄망에서 여러 디스플레이를 운영하는 관리자",
    need: "대용량 미디어·스케줄·단말 상태의 안정적인 내부망 관리",
    success: "외부 인터넷 의존 없는 콘텐츠 배포와 단말 상태 확인",
    experiences: [
      { title: "콘텐츠 관리", detail: "미디어 등록과 스케줄 편성" },
      { title: "단말 제어", detail: "재생 명령과 연결 상태 확인" },
      { title: "내부 저장", detail: "PostgreSQL 메타데이터와 MinIO 파일 분리" },
    ],
    ownership: ["Backend API", "미디어 저장 구조", "MQTT 단말 통신", "팀 일정·API 경계 조율"],
    outcomes: [
      { title: "폐쇄망 운영", detail: "내부 인프라만 사용한 DID 관리 구조" },
      { title: "역할 분리", detail: "파일·메타데이터·단말 메시지의 저장 경계 확립" },
    ],
  },
  "byeoljari": {
    kind: "개인 프로젝트",
    team: "기획·디자인·개발·운영 / 단독",
    user: "사주·점성술 결과를 이해하기 쉬운 설명으로 보고 싶은 사용자",
    need: "계산 정확도·긴 AI 생성·결제 이후 결과 전달을 함께 보장해야 하는 B2C 흐름",
    success: "무료 결과부터 결제·AI 해석·재열람까지 끊기지 않는 사용자 여정",
    experiences: [
      { title: "무료 계산", detail: "사주·점성술의 결정론적 계산 결과" },
      { title: "AI 심층 해석", detail: "계산값에 근거한 스트리밍 설명" },
      { title: "결제·보관", detail: "게스트·회원 결제와 결과 재열람" },
      { title: "콘텐츠 탐색", detail: "CMS 콘텐츠와 검색 유입 연결" },
    ],
    ownership: ["제품 기획과 UI 설계", "Next.js·FastAPI 전체 개발", "PortOne 결제·환불", "AI 생성·CMS·SEO·운영"],
    outcomes: [
      { title: "실결제 서비스", detail: "결제·환불·결과 보관을 포함한 운영" },
      { title: "전체 퍼널 구축", detail: "검색·광고 유입부터 무료·유료 전환까지 연결" },
      { title: "결과 전달 보장", detail: "실패 재시도와 AI 실패 시 자동 환불" },
    ],
    featured: {
      challenge: { title: "결제 사용자 바인딩 누락", detail: "SDK customData 사용자 식별자와 서버 세션 사용자의 일치 검증 추가" },
      operations: [
        { title: "결제 멱등성", detail: "payment_id UNIQUE와 서버 거래 재조회" },
        { title: "실패 복구", detail: "생성 상태 저장·재시도·AI 실패 자동 환불" },
        { title: "운영 검증", detail: "24개 사용자·결제 시나리오 점검" },
      ],
      collaboration: "실사용 피드백과 결제사·광고 플랫폼 제약을 제품 수용 기준으로 반영",
      retrospective: "결제 성공보다 결제 이후 결과 전달 보장이 더 중요한 운영 기준",
    },
  },
  "dubby": {
    kind: "개인 프로젝트",
    team: "기획·Mobile·Backend / 단독",
    user: "친구와 채팅·스토리·게임을 한 앱에서 즐기는 사용자",
    need: "성격이 다른 실시간 기능과 모바일 네트워크 단절의 일관된 처리",
    success: "재접속 후에도 이어지는 채팅과 서버가 검증하는 공정한 게임 상태",
    experiences: [
      { title: "실시간 대화", detail: "1:1·그룹 채팅과 반응" },
      { title: "소셜 콘텐츠", detail: "스토리·투표·친구 관계" },
      { title: "카드게임", detail: "최대 8명 서버 권위형 턴 진행" },
      { title: "모바일 알림", detail: "FCM 기반 메시지·이벤트 알림" },
    ],
    ownership: ["제품·화면 설계", "Flutter 앱 전체 개발", "Firestore 데이터·보안 규칙", "Cloud Functions·FCM"],
    outcomes: [
      { title: "Google Play 배포", detail: "실제 설치 가능한 Android 앱" },
      { title: "실시간 경험 통합", detail: "채팅·스토리·투표·게임의 단일 계정 연결" },
    ],
  },
  "meetsub": {
    kind: "개인 프로젝트",
    team: "기획·디자인·개발·배포 / 단독",
    user: "설치 제한 환경에서 다국어 회의를 진행하는 참가자",
    need: "전문용어 오인식과 이미 읽은 번역 자막의 뒤늦은 변경",
    success: "무설치 접속, 빠르고 안정적인 자막, 회의 이후 기록 활용",
    experiences: [
      { title: "브라우저 오디오", detail: "Teams·Zoom 탭 소리의 무설치 캡처" },
      { title: "실시간 자막", detail: "Deepgram STT와 한·영 번역" },
      { title: "전문용어 보정", detail: "도메인 용어집의 STT·번역 이중 주입" },
      { title: "회의 기록", detail: "요약 리포트·회의록·PDF 내보내기" },
    ],
    ownership: ["제품 요구사항과 UX", "WebSocket 실시간 파이프라인", "인증·플랜·사용자 격리", "Cloud Run·WIF 배포"],
    outcomes: [
      { title: "무설치 회의 자막", detail: "브라우저만으로 오디오 캡처와 번역" },
      { title: "자막 안정화", detail: "확정 구간 중심 번역으로 읽은 문장의 변경 축소" },
      { title: "운영형 제품", detail: "체험·유료 플랜과 사용자별 기록 분리" },
    ],
    featured: {
      challenge: { title: "번역 자막의 반복 변경", detail: "안정된 영어 구간 누적 후 발화 종료 시 한 번의 최종 번역 확정" },
      operations: [
        { title: "품질 검증", detail: "인도·미국·영국 억양 벤치마크와 용어집 비교" },
        { title: "보안 경계", detail: "scrypt 세션·HttpOnly 쿠키·사용자별 데이터 격리" },
        { title: "키 없는 배포", detail: "GitHub Actions Workload Identity Federation" },
      ],
      collaboration: "실제 회의 환경의 설치 제한·용어 정확도·자막 안정성을 제품 기준으로 정의",
      retrospective: "최저 지연보다 사용자가 읽을 수 있는 자막 안정성의 우선순위",
    },
  },
  "exam-forge": {
    kind: "개인 프로젝트",
    team: "기획·도메인 모델링·개발 / 단독",
    user: "수학 문항과 시험지를 직접 편집하는 현직 강사",
    need: "숫자·선택지 수정 시 정답·풀이·도형이 함께 바뀌지 않는 문서 도구",
    success: "문항 요소의 동기화와 A4 시험지의 즉시 편집·인쇄",
    experiences: [
      { title: "문항 생성", detail: "수치·선택지·정답·풀이의 일관된 변형" },
      { title: "도형 동기화", detail: "같은 파라미터 기반 TikZ 도형 생성" },
      { title: "시험지 편집", detail: "학교·시험 정보, 문항·배점·난이도 구성" },
      { title: "A4 출력", detail: "자동 페이지 분할과 PDF 인쇄" },
    ],
    ownership: ["강사 문제 정의와 제품 기획", "문항·교육과정 도메인 모델", "TikZ 렌더·캐시", "편집기·PWA·배포"],
    outcomes: [
      { title: "문항 요소 동기화", detail: "문제·선택지·정답·풀이·도형의 단일 생성 규칙" },
      { title: "문서 도구 대체", detail: "생성부터 A4 편집·인쇄까지 한 화면으로 연결" },
      { title: "설치형 사용성", detail: "브라우저와 PWA 지원" },
    ],
    featured: {
      challenge: { title: "TikZ 렌더링 환경 차이", detail: "TeX 컴파일을 별도 렌더 API로 격리하고 SVG 결과 캐시 적용" },
      operations: [
        { title: "문항 검증", detail: "정답·선택지·배점·난이도 구성 검증 스크립트" },
        { title: "API 보호", detail: "서버 간 토큰 기반 원시 TikZ 렌더 제한" },
        { title: "배포 경계", detail: "Vercel 웹 앱과 별도 렌더 서비스 분리" },
      ],
      collaboration: "현직 강사의 실제 문항 수정 방식을 생성 규칙과 편집 수용 기준으로 변환",
      retrospective: "생성 품질보다 문항 전체의 동기화와 인쇄 완성도가 핵심 가치",
    },
  },
  "sns-easyup": {
    kind: "개인 실험 프로젝트",
    team: "Product·AI·Full-stack",
    user: "여러 SNS 채널을 함께 운영하는 소규모 사업자",
    need: "아이디어·카피·이미지·예약 발행으로 흩어진 반복 작업",
    success: "짧은 입력에서 채널별 결과 생성과 예약 게시까지의 단일 흐름",
    experiences: [
      { title: "아이디어 확장", detail: "짧은 메모의 채널별 카피 변환" },
      { title: "이미지 생성", detail: "게시 목적에 맞춘 시각물 제작" },
      { title: "예약 발행", detail: "Facebook·Instagram 게시 일정 관리" },
    ],
    ownership: ["제품 흐름", "프롬프트 레지스트리", "Meta 게시 어댑터", "예약 작업·복구"],
    outcomes: [
      { title: "운영 흐름 통합", detail: "작성·생성·예약 발행의 한 화면 연결" },
      { title: "채널 차이 격리", detail: "Facebook·Instagram 인증과 게시 규칙의 어댑터화" },
    ],
  },
  "cloudrun-monitor": {
    kind: "개인 연구 프로젝트",
    team: "Product research·Architecture / 단독",
    user: "여러 GCP 프로젝트의 Cloud Run을 관리하는 개발자",
    need: "콘솔 전환과 별도 서비스 계정 키 등록이 필요한 모니터링 과정",
    success: "기존 사용자 IAM 범위 안에서 상태·로그를 한 화면에 통합",
    experiences: [
      { title: "Google 로그인", detail: "사용자 OAuth 기반 권한 연결" },
      { title: "서비스 통합", detail: "여러 프로젝트의 Cloud Run 상태 조회" },
      { title: "로그 탐색", detail: "Cloud Logging 결과의 단일 화면 확인" },
    ],
    ownership: ["제품 조사", "BYOI 권한 모델", "Cloud Run·Logging 어댑터", "대시보드 구조"],
    outcomes: [
      { title: "키 업로드 제거", detail: "별도 서비스 계정 파일 없는 시작" },
      { title: "권한 일치", detail: "GCP IAM을 진실의 원천으로 사용" },
    ],
  },
  "student-echo": {
    kind: "학생 팀 프로젝트",
    team: "Architecture·Backend·ML / 기여도 50%",
    user: "폐기물 이름이나 배출 방법을 모르는 사용자",
    need: "사진 속 폐기물의 종류와 올바른 처리 방법을 따로 찾아야 하는 불편",
    success: "사진 판별부터 배출 안내·추천·음성 상담까지의 연결",
    experiences: [
      { title: "이미지 판별", detail: "촬영·업로드한 폐기물 분류" },
      { title: "배출 안내", detail: "분류 결과에 맞는 처리 방법" },
      { title: "재활용 추천", detail: "다음 행동과 활용 정보 제공" },
      { title: "음성 상담", detail: "챗봇·STT·TTS 기반 접근" },
    ],
    ownership: ["전체 아키텍처", "Backend API", "이미지 분류 연동", "추천·챗봇·음성 흐름"],
    outcomes: [
      { title: "행동 중심 결과", detail: "클래스명에서 배출 방법까지 연결" },
      { title: "접근 방식 확장", detail: "텍스트와 음성 상담 지원" },
    ],
  },
  "student-spaceplace": {
    kind: "학생 팀 프로젝트",
    team: "Frontend·API / 기여도 35%",
    user: "목적에 맞는 공간을 찾고 예약하는 사용자",
    need: "검색·공간 정보·예약 상태를 하나의 흐름으로 연결하는 팀 개발 경험",
    success: "독립 서비스의 API를 통합한 일관된 검색·예약 화면",
    experiences: [
      { title: "공간 검색", detail: "조건 기반 공간 탐색" },
      { title: "상세 확인", detail: "공간 정보와 예약 가능 상태" },
      { title: "예약 흐름", detail: "선택부터 예약 결과까지의 연결" },
    ],
    ownership: ["Frontend 화면", "REST API 연동", "응답·오류 상태 통합", "서비스 간 계약 조율"],
    outcomes: [
      { title: "MSA 통합 경험", detail: "분리된 서비스의 사용자 흐름 통합" },
      { title: "팀 운영 경험", detail: "API 계약 기반 병렬 개발과 통합" },
    ],
  },
};
