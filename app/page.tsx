import type { Metadata } from "next";
import { Experience } from "@/components/experience";
import { projects as fallbackProjects } from "@/data/projects";
import { listProjects } from "@/lib/content-store";
export const metadata: Metadata = { title: "강연배 — AI Product Engineer", description: "사용자 문제에서 운영되는 제품까지" };
export const dynamic = "force-dynamic";
export default async function Home() {
  let projects = fallbackProjects;
  try { projects = await listProjects(); } catch { /* 정적 아카이브 유지 */ }
  return <Experience projects={projects} />;
}
