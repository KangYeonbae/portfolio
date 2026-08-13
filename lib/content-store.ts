import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { projects as staticProjects, type Project, type ProjectCategory } from "@/data/projects";
import { staticPosts } from "@/data/static-posts";

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PostInput = {
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  published: boolean;
};

export type ProjectInput = Omit<Project, "id"> & { id?: string };

type DbPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content_html: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type DbProject = {
  id: string;
  title: string;
  eyebrow: string;
  period: string;
  category: ProjectCategory;
  summary: string;
  role: string;
  tags: string[];
  status: Project["status"] | null;
  url: string | null;
  sort_order: number;
};

let client: ReturnType<typeof postgres> | undefined;
const QUERY_TIMEOUT_MS = 2500;

function runtimeDatabaseUrl() {
  const template = process.env.DATABASE_URL ?? "";
  const password = process.env.SUPABASE_PASSWORD ?? "";
  if (/\[YOUR-PASSWORD\]/i.test(template) && password) {
    return template.replace(/\[YOUR-PASSWORD\]/gi, encodeURIComponent(password));
  }
  return template;
}

export function isContentDatabaseConfigured() {
  return Boolean(runtimeDatabaseUrl());
}

function db() {
  if (!isContentDatabaseConfigured()) throw new Error("CONTENT_DATABASE_NOT_CONFIGURED");
  client ??= postgres(runtimeDatabaseUrl(), {
    max: 3,
    idle_timeout: 20,
    connect_timeout: 5,
    prepare: false,
    ssl: "require",
  });
  return client;
}

async function bounded<T>(query: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error("CONTENT_DATABASE_TIMEOUT")), QUERY_TIMEOUT_MS);
  });
  try {
    return await Promise.race([query, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function toPost(row: DbPost): Post {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    contentHtml: row.content_html,
    published: row.published,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toProject(row: DbProject): Project {
  return {
    id: row.id,
    title: row.title,
    eyebrow: row.eyebrow,
    period: row.period,
    category: row.category,
    summary: row.summary,
    role: row.role,
    tags: row.tags ?? [],
    status: row.status ?? undefined,
    url: row.url ?? undefined,
  };
}

export async function listPosts({ includeDrafts = false }: { includeDrafts?: boolean } = {}) {
  const fallback = staticPosts.filter((post) => includeDrafts || post.published) as unknown as Post[];
  if (!isContentDatabaseConfigured()) return fallback;
  try {
    const sql = db();
    const rows = await bounded(includeDrafts
      ? sql<DbPost[]>`select * from kyb_portfolio.posts order by published_at desc nulls last, created_at desc`
      : sql<DbPost[]>`select * from kyb_portfolio.posts where published = true order by published_at desc nulls last, created_at desc`);
    const dynamic = rows.map(toPost);
    const dynamicSlugs = new Set(dynamic.map((post) => post.slug));
    return [...dynamic, ...fallback.filter((post) => !dynamicSlugs.has(post.slug))];
  } catch {
    return fallback;
  }
}

export async function getPostBySlug(slug: string, includeDrafts = false) {
  const fallback = staticPosts.find((post) => post.slug === slug && (includeDrafts || post.published)) as Post | undefined;
  if (!isContentDatabaseConfigured()) return fallback ?? null;
  try {
    const sql = db();
    const rows = await bounded(includeDrafts
      ? sql<DbPost[]>`select * from kyb_portfolio.posts where slug = ${slug} limit 1`
      : sql<DbPost[]>`select * from kyb_portfolio.posts where slug = ${slug} and published = true limit 1`);
    return rows[0] ? toPost(rows[0]) : fallback ?? null;
  } catch {
    return fallback ?? null;
  }
}

export async function createPost(input: PostInput) {
  const sql = db();
  const id = randomUUID();
  const publishedAt = input.published ? new Date().toISOString() : null;
  const rows = await bounded(sql<DbPost[]>`
    insert into kyb_portfolio.posts (id, slug, title, excerpt, content_html, published, published_at)
    values (${id}, ${input.slug}, ${input.title}, ${input.excerpt}, ${input.contentHtml}, ${input.published}, ${publishedAt})
    returning *
  `);
  return toPost(rows[0]);
}

export async function updatePost(id: string, input: PostInput) {
  const sql = db();
  const publishedAt = input.published ? new Date().toISOString() : null;
  const rows = await bounded(sql<DbPost[]>`
    update kyb_portfolio.posts
    set slug = ${input.slug}, title = ${input.title}, excerpt = ${input.excerpt},
        content_html = ${input.contentHtml}, published = ${input.published},
        published_at = ${publishedAt}, updated_at = now()
    where id = ${id}::uuid
    returning *
  `);
  return rows[0] ? toPost(rows[0]) : null;
}

export async function deletePost(id: string) {
  const sql = db();
  await sql`delete from kyb_portfolio.posts where id = ${id}::uuid`;
}

export async function listProjects() {
  if (!isContentDatabaseConfigured()) return staticProjects;
  const sql = db();
  const rows = await bounded(sql<DbProject[]>`select * from kyb_portfolio.projects order by sort_order asc, created_at desc`);
  const dynamic = rows.map(toProject);
  const dynamicIds = new Set(dynamic.map((project) => project.id));
  return [...dynamic, ...staticProjects.filter((project) => !dynamicIds.has(project.id))];
}

export async function createProject(input: ProjectInput) {
  const sql = db();
  const id = input.id || randomUUID();
  const status = input.status ?? null;
  const url = input.url ?? null;
  const rows = await bounded(sql<DbProject[]>`
    insert into kyb_portfolio.projects (id, title, eyebrow, period, category, summary, role, tags, status, url)
    values (${id}, ${input.title}, ${input.eyebrow}, ${input.period}, ${input.category}, ${input.summary}, ${input.role}, ${sql.json(input.tags)}, ${status}, ${url})
    returning *
  `);
  return toProject(rows[0]);
}

export async function updateProject(id: string, input: ProjectInput) {
  const sql = db();
  const status = input.status ?? null;
  const url = input.url ?? null;
  const rows = await bounded(sql<DbProject[]>`
    update kyb_portfolio.projects
    set title = ${input.title}, eyebrow = ${input.eyebrow}, period = ${input.period},
        category = ${input.category}, summary = ${input.summary}, role = ${input.role},
        tags = ${sql.json(input.tags)}, status = ${status}, url = ${url}, updated_at = now()
    where id = ${id}
    returning *
  `);
  return rows[0] ? toProject(rows[0]) : null;
}

export async function deleteProject(id: string) {
  const sql = db();
  await sql`delete from kyb_portfolio.projects where id = ${id}`;
}
