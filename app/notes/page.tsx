import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "@/components/icons";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listPosts, type Post } from "@/lib/content-store";

export const metadata: Metadata = { title: "Notes — 강연배", description: "제품, AI, 운영에 관한 강연배의 기록" };
export const dynamic = "force-dynamic";

export default async function NotesPage() {
  let posts: Post[] = [];
  try { posts = await listPosts(); } catch { /* render the empty state */ }
  return <><SiteHeader /><main className="page-main"><section className="page-hero shell"><p className="overline"><span /> NOTES &amp; LOG</p><h1>생각하고, 만들고,<br /><em>기록합니다.</em></h1><p>AI 제품의 설계 판단, 운영 중 만난 문제, 개인적으로 탐구한 것들을 씁니다.</p></section><section className="shell notes-list">{posts.length ? posts.map((post) => <Link href={`/notes/${post.slug}`} className="notes-row" key={post.id}><span>{formatDate(post.publishedAt ?? post.createdAt)}</span><div><h2>{post.title}</h2><p>{post.excerpt}</p></div><ArrowUpRight /></Link>) : <div className="notes-empty"><span>FIELD NOTES / 000</span><h2>아직 발행된 글이 없습니다.</h2><p>Studio에서 작성하고 발행한 글이 이곳에 표시됩니다.</p></div>}</section></main><SiteFooter /></>;
}

function formatDate(value: string) { return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(value)); }
