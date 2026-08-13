import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPostBySlug } from "@/lib/content-store";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try { const post = await getPostBySlug(slug); return post ? { title: `${post.title} — 강연배`, description: post.excerpt } : {}; } catch { return {}; }
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params;
  let post = null;
  try { post = await getPostBySlug(slug); } catch { notFound(); }
  if (!post) notFound();
  const date = new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(post.publishedAt ?? post.createdAt));
  return <><SiteHeader /><main className="article-main"><div className="shell"><header className="article-header"><p className="overline"><span /> FIELD NOTE</p><h1>{post.title}</h1><p>{post.excerpt}</p><time>{date}</time></header><article className="prose" dangerouslySetInnerHTML={{ __html: post.contentHtml }} /></div></main><SiteFooter /></>;
}
