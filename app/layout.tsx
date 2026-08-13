import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://kangyeonbae.dev"),
  title: "강연배 — AI Product Engineer",
  description:
    "LLM과 AI Agent를 데모에서 멈추지 않고 운영 제품으로 완성하는 AI Product Engineer 강연배의 포트폴리오입니다.",
  keywords: [
    "강연배",
    "AI Product Engineer",
    "AI Full-stack Engineer",
    "LLM",
    "AI Agent",
    "Next.js",
    "FastAPI",
  ],
  openGraph: {
    title: "강연배 — AI Product Engineer",
    description: "AI를 실제 업무 흐름과 운영 환경에 연결합니다.",
    locale: "ko_KR",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0d0c",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
