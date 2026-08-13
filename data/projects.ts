export type ProjectCategory = "work" | "product" | "lab" | "student";

export type Project = {
  id: string;
  title: string;
  eyebrow: string;
  period: string;
  category: ProjectCategory;
  summary: string;
  role: string;
  tags: string[];
  status?: "운영" | "진행" | "완료" | "프로토타입";
  url?: string;
  urlLabel?: "Live site" | "Demo" | "Press" | "GitHub" | "Notion";
  links?: { label: string; url: string }[];
  image?: string;
  imageFit?: "cover" | "contain";
  imageAspect?: "landscape" | "portrait" | "square";
  video?: string;
  videoPoster?: string;
  videoCaption?: string;
};

export const categoryLabels: Record<ProjectCategory, string> = {
  work: "Professional",
  product: "Product",
  lab: "Lab",
  student: "Student",
};

export const projects: Project[] = [
  {
    id: "amazon-ads-agent",
    title: "Amazon Ads Reporting Agent",
    eyebrow: "Multi-agent reporting automation",
    period: "2025.10 — 2026.05",
    category: "work",
    summary:
      "SP-API와 Ads API 데이터를 매일 수집하고, 생성·검수 Agent가 근거 기반 광고 리포트와 차트를 만드는 자동화 시스템.",
    role: "기획 · AI · Backend · Cloud / 단독 개발",
    tags: ["Google ADK", "Gemini", "BigQuery", "Cloud Tasks", "Amazon API"],
    status: "운영",
    image: "/project-media/amazon-reporting.png",
    imageFit: "contain",
    video: "/project-media/amazon-ads-demo.mp4",
    videoPoster: "/project-media/amazon-reporting.png",
    videoCaption: "Amazon API 데이터 수집부터 AI 광고 리포트 생성까지의 실제 자동화 흐름입니다.",
    url: "https://www.donga.com/news/Economy/article/all/20260622/134158095/1",
    urlLabel: "Press",
  },
  {
    id: "multilingual-cms",
    title: "Multilingual Blog CMS",
    eyebrow: "Private medical network",
    period: "2026.06 — 2026.07",
    category: "work",
    summary:
      "언어별 초안·검수·발행 상태와 미디어, SEO 구조화 데이터를 한 흐름에서 관리하는 다국어 콘텐츠 운영 도구.",
    role: "Full-stack / 단독 개발",
    tags: ["Next.js", "Tiptap", "Prisma", "Supabase", "JSON-LD"],
    status: "운영",
  },
  {
    id: "snap-p",
    title: "Snap-p",
    eyebrow: "Amazon listing creative automation",
    period: "2026.03 — 2026.04",
    category: "work",
    summary:
      "상품 정보 하나로 아마존 리스팅 이미지 9장과 카피를 설계·생성하고 정책 및 이미지 품질을 자동 검수하는 제작 워크플로우.",
    role: "기획 · AI · Full-stack / 단독 개발",
    tags: ["Gemini", "Next.js 16", "React 19", "Prisma", "Monorepo"],
    status: "완료",
    image: "/project-media/snap-p.webp",
    imageFit: "contain",
    url: "https://snap-p.com/",
    urlLabel: "Live site",
    links: [{ label: "Demo", url: "https://youtu.be/BuTQ3EYLJ2Q?si=WUHLk2Pwqwo1IN1m" }],
  },
  {
    id: "bid-master",
    title: "Bid Master",
    eyebrow: "School meal tender automation",
    period: "2025.11 — 2025.12",
    category: "work",
    summary:
      "학교급식 입찰 공고와 현품설명서를 수집해 품목·지역·수익성을 판별하고 맞춤 공고를 이메일로 전달하는 서비스.",
    role: "화면·제품 흐름 설계 · Full-stack · 배포 / 단독 개발",
    tags: ["FastAPI", "SQLAlchemy", "Playwright", "Next.js", "PostgreSQL"],
    status: "운영",
    image: "/project-media/bid-master.webp",
    imageFit: "contain",
    url: "https://bid-master.co.kr",
    urlLabel: "Live site",
  },
  {
    id: "voc-analyzer",
    title: "VOC Counseling Analyzer",
    eyebrow: "Operational AI automation",
    period: "2025.08 · 2026.05 확장",
    category: "work",
    summary:
      "상담 데이터를 요약·분류하고 핵심 VOC를 추출해 Google Sheets 리포트로 연결한 사내 운영 자동화 도구.",
    role: "AI · Backend · Desktop packaging / 단독 개발",
    tags: ["OpenAI", "ChannelTalk API", "Streamlit", "Google Sheets", "PyInstaller"],
    status: "운영",
    image: "/project-media/voc-collector.webp",
    imageFit: "contain",
    video: "/project-media/voc-collector.mp4",
    videoPoster: "/project-media/voc-collector.webp",
    videoCaption: "상담 데이터 수집과 AI 요약·분류, Google Sheets 반영을 제어하는 실제 실행 화면입니다.",
    url: "https://www.newsroad.co.kr/news/articleView.html?idxno=45489",
    urlLabel: "Press",
  },
  {
    id: "review-classifier",
    title: "Review Sentiment Classifier",
    eyebrow: "Korean commerce NLP",
    period: "2025.09",
    category: "work",
    summary:
      "Cafe24 리뷰와 AIHub 데이터를 정제해 한국어 리뷰 감성을 판별하고 운영 데이터로 제공하는 경량 분류 API.",
    role: "ML · Data · Backend / 단독 개발",
    tags: ["scikit-learn", "Linear SVM", "TF-IDF", "Flask", "Cafe24 API"],
    status: "운영",
  },
  {
    id: "did-cms",
    title: "Digital Signage DID CMS",
    eyebrow: "On-premise media operations",
    period: "2025.05 — 2025.07",
    category: "work",
    summary:
      "폐쇄망 환경에서 디스플레이 콘텐츠·스케줄·단말 상태를 관리하는 디지털 사이니지 백엔드와 미디어 저장 구조.",
    role: "Backend 개발 · 팀 리딩",
    tags: ["FastAPI", "PostgreSQL", "MinIO", "MQTT", "On-premise"],
    status: "완료",
  },
  {
    id: "ga4-validator",
    title: "GA4 Event Validator",
    eyebrow: "Analytics QA automation",
    period: "2025.09",
    category: "work",
    summary:
      "모바일 웹의 사용자 플로우를 자동 탐색하며 dataLayer 이벤트를 캡처하고 GA4 계측 구현을 검증하는 QA 시스템.",
    role: "Automation · Data QA",
    tags: ["Playwright", "Python", "AsyncIO", "GA4", "dataLayer"],
    status: "완료",
  },
  {
    id: "local-browser-agent",
    title: "Local Browser Agent",
    eyebrow: "Local-first multimodal computer use",
    period: "2025.10",
    category: "work",
    summary:
      "클라우드 AI API 없이 자연어 목표를 실행 계획으로 바꾸고, 화면과 DOM을 함께 읽어 웹사이트를 조작·검증하는 자율 브라우저 에이전트.",
    role: "AI Agent · Browser Automation / 단독 개발",
    tags: ["Ollama", "LangGraph", "LLaVA", "Qwen2.5", "Playwright"],
    status: "프로토타입",
    image: "/project-media/local-browser-agent.png",
    imageFit: "contain",
    video: "/project-media/local-browser-agent.mp4",
    videoPoster: "/project-media/local-browser-agent.png",
  },
  {
    id: "text-to-sql",
    title: "BigQuery AI Analyst",
    eyebrow: "RAG-powered Text-to-SQL",
    period: "2025.11 — 2026.01",
    category: "work",
    summary:
      "자연어 질문을 스키마에 맞는 BigQuery SQL로 만들고 실행·복구·해석까지 연결한 대화형 데이터 분석 시스템.",
    role: "AI · Backend · Data Product / 단독 개발",
    tags: ["Google ADK", "LangGraph", "BigQuery", "RAG", "FastAPI"],
    status: "완료",
    image: "/project-media/text-to-sql.png",
    imageFit: "contain",
    imageAspect: "portrait",
  },
  {
    id: "instagram-insight",
    title: "Instagram Purchase-intent Analyzer",
    eyebrow: "Social commerce intelligence",
    period: "2025.07 — 2025.08",
    category: "work",
    summary:
      "게시물·릴스 댓글을 수집하고 다국어 필터와 하이브리드 분류로 구매 의도와 인플루언서 반응을 분석하는 도구.",
    role: "Crawling · ML · Backend",
    tags: ["Selenium", "KcBERT", "Regex", "FastAPI", "Python"],
    status: "완료",
  },
  {
    id: "byeoljari",
    title: "Byeoljari.com",
    eyebrow: "Paid AI fortune service",
    period: "2026.03 — 현재",
    category: "product",
    summary:
      "사주·점성술 계산, AI 해석 스트리밍, 콘텐츠 CMS와 결제를 하나의 사용자 여정으로 만든 B2C 서비스.",
    role: "Product · Design · Full-stack / 단독 개발",
    tags: ["Next.js", "FastAPI", "PortOne", "Supabase", "Vercel"],
    status: "운영",
    image: "/project-media/byeoljari.png",
    imageFit: "contain",
    url: "https://byeoljari.com",
    urlLabel: "Live site",
  },
  {
    id: "dubby",
    title: "Dubby",
    eyebrow: "Cross-platform social messenger",
    period: "2026.07 — 현재",
    category: "product",
    summary:
      "1:1·그룹 채팅, 스토리, 투표, 반응과 서버 권위형 카드게임을 한 앱에 담은 Flutter 기반 소셜 메신저.",
    role: "Product · Mobile · Backend / 단독 개발",
    tags: ["Flutter", "Firebase", "Firestore", "Cloud Functions", "FCM"],
    status: "진행",
    image: "/project-media/dubby.jpg",
  },
  {
    id: "meetsub",
    title: "MeetSub",
    eyebrow: "Real-time meeting subtitles",
    period: "2026.08 — 현재",
    category: "product",
    summary:
      "실시간 STT와 번역 자막, 회의 기록, 요약 리포트와 PDF 내보내기를 제공하는 접근성 중심 회의 도구.",
    role: "Product · Full-stack · Cloud / 단독 개발",
    tags: ["Deepgram", "Gemini", "WebSocket", "Cloud Run", "Firestore"],
    status: "진행",
    image: "/project-media/meetsub.webp",
    imageFit: "contain",
    url: "https://meetsub-1088621830905.asia-northeast3.run.app/",
    urlLabel: "Live site",
  },
  {
    id: "exam-forge",
    title: "Exam Forge",
    eyebrow: "Math exam authoring system",
    period: "2026.08 — 현재",
    category: "product",
    summary:
      "수치·선택지·정답·TikZ 도형이 함께 변하는 중학교 수학 문항 생성기와 A4 시험지 편집·인쇄 PWA.",
    role: "Product · Domain modeling · Full-stack / 단독 개발",
    tags: ["Next.js", "TikZ", "KaTeX", "PostgreSQL", "PWA"],
    status: "진행",
    image: "/project-media/exam-forge.svg",
  },
  {
    id: "sns-easyup",
    title: "SNS EasyUp",
    eyebrow: "AI social publishing",
    period: "2026.07 — 현재",
    category: "lab",
    summary:
      "짧은 아이디어를 채널별 카피와 이미지로 만들고 Facebook·Instagram 예약 발행까지 연결하는 SNS 운영 실험.",
    role: "Product · AI · Full-stack",
    tags: ["Meta API", "Image Generation", "Next.js", "Supabase", "Cron"],
    status: "진행",
    image: "/project-media/sns-easyup.png",
    imageFit: "contain",
  },
  {
    id: "cloudrun-monitor",
    title: "Cloud Run Monitor",
    eyebrow: "Bring-your-own-identity observability",
    period: "2026.04 — 현재",
    category: "lab",
    summary:
      "Google 로그인 한 번으로 사용자의 IAM 권한 안에서 여러 프로젝트의 Cloud Run 상태와 로그를 보는 통합 대시보드.",
    role: "Product research · Architecture",
    tags: ["GCP", "OAuth", "Cloud Run API", "Cloud Logging", "Next.js"],
    status: "프로토타입",
  },
  {
    id: "student-echo",
    title: "Echo Recycle Hub",
    eyebrow: "AI recycling assistant",
    period: "2023 — 2024 · Student",
    category: "student",
    summary: "폐기물 이미지 분류부터 배출 방법·재활용 추천, 챗봇과 음성 상담까지 하나의 흐름으로 연결한 AICC 웹 서비스.",
    role: "Architecture · Backend · ML / 기여도 50%",
    tags: ["Image Classification", "Recommendation", "Chatbot", "STT/TTS", "AWS"],
    status: "완료",
    image: "/project-media/echo-recycle-hub.webp",
    imageFit: "contain",
    url: "https://github.com/KangYeonbae/Project1_3",
    urlLabel: "GitHub",
    links: [
      {
        label: "Presentation",
        url: "https://docs.google.com/presentation/d/14vtC49rII5R-e8vuHbraRGmu6B2X0heA/preview",
      },
    ],
  },
  {
    id: "student-spaceplace",
    title: "SpacePlace.store",
    eyebrow: "MSA operations project",
    period: "2023 — 2024 · Student",
    category: "student",
    summary: "공간 검색·예약 흐름을 마이크로서비스 운영 환경에서 구현한 공간 대여 플랫폼.",
    role: "Frontend · API / 기여도 35%",
    tags: ["MSA", "REST API", "Service Operations", "Frontend"],
    status: "완료",
    image: "/project-media/spaceplace-system.webp",
    imageFit: "contain",
    url: "https://github.com/orgs/Spaces-Place/repositories",
    urlLabel: "GitHub",
    links: [
      {
        label: "Presentation",
        url: "https://docs.google.com/presentation/d/184J0nTfjHIFk2NhJgZcvhcq_-0ch-PiV/preview",
      },
    ],
  },
];

export const projectCount = projects.length;
