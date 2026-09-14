import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://portfolio-one-navy-s47ebs4dp8.vercel.app");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
  alternates: { canonical: "/" },
  openGraph: {
    title: "강연배 — AI Product Engineer",
    description: "AI를 실제 업무 흐름과 운영 환경에 연결합니다.",
    url: "/",
    locale: "ko_KR",
    siteName: "강연배 포트폴리오",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "강연배 — AI Product Engineer",
    description: "AI를 실제 업무 흐름과 운영 환경에 연결합니다.",
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
