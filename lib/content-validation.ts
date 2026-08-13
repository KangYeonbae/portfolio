import type { PostInput, ProjectInput } from "./content-store";
import type { ProjectCategory } from "@/data/projects";

const categories = new Set<ProjectCategory>(["work", "product", "lab", "student"]);
const statuses = new Set(["운영", "진행", "완료", "프로토타입"]);

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function parsePostInput(value: unknown): PostInput {
  const body = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const title = text(body.title, 160);
  const slug = slugify(text(body.slug, 180) || title);
  if (!title || !slug) throw new Error("제목과 슬러그가 필요합니다.");
  return {
    title,
    slug,
    excerpt: text(body.excerpt, 500),
    contentHtml: text(body.contentHtml, 300_000),
    published: body.published === true,
  };
}

export function parseProjectInput(value: unknown): ProjectInput {
  const body = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const title = text(body.title, 160);
  const summary = text(body.summary, 1500);
  const rawCategory = text(body.category, 20) as ProjectCategory;
  if (!title || !summary || !categories.has(rawCategory)) {
    throw new Error("제목, 설명, 올바른 카테고리가 필요합니다.");
  }
  const rawTags = Array.isArray(body.tags) ? body.tags : text(body.tags, 1000).split(",");
  const tags = rawTags.map((tag) => text(tag, 60)).filter(Boolean).slice(0, 16);
  const rawStatus = text(body.status, 20);
  return {
    id: text(body.id, 120) || undefined,
    title,
    eyebrow: text(body.eyebrow, 180),
    period: text(body.period, 80),
    category: rawCategory,
    summary,
    role: text(body.role, 240),
    tags,
    status: statuses.has(rawStatus) ? (rawStatus as ProjectInput["status"]) : undefined,
    url: text(body.url, 500) || undefined,
  };
}
