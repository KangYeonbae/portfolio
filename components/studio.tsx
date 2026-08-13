"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import type { Post } from "@/lib/content-store";
import type { ProjectCategory } from "@/data/projects";
import { ArrowUpRight } from "./icons";

type StudioTab = "posts" | "projects" | "api";

const emptyPost = { id: "", title: "", slug: "", excerpt: "", contentHtml: "", published: false };
const emptyProject = { id: "", title: "", eyebrow: "", period: "", category: "product" as ProjectCategory, summary: "", role: "", tags: "", status: "진행", url: "" };

export function Studio() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [configured, setConfigured] = useState(true);
  const [token, setToken] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    fetch("/api/session").then((response) => response.json()).then((data) => {
      setAuthenticated(Boolean(data.authenticated));
      setConfigured(Boolean(data.configured));
    }).catch(() => setAuthenticated(false));
  }, []);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setLoginError("");
    const response = await fetch("/api/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
    const data = await response.json();
    if (!response.ok) return setLoginError(data.error ?? "로그인하지 못했습니다.");
    setToken("");
    setAuthenticated(true);
  }

  if (authenticated === null) return <div className="studio-loading">Studio를 여는 중…</div>;
  if (!authenticated) return (
    <main className="studio-login">
      <div className="studio-login-card">
        <span className="studio-badge">PRIVATE STUDIO</span>
        <h1>콘텐츠를<br />계속 이어가세요.</h1>
        <p>글을 쓰고 프로젝트를 추가하는 강연배의 개인 편집실입니다.</p>
        {!configured && <div className="studio-warning"><strong>Studio가 잠겨 있습니다.</strong><code>ADMIN_API_TOKEN</code>을 환경 변수에 추가하세요.</div>}
        <form onSubmit={login}>
          <label>관리자 키<input type="password" value={token} onChange={(event) => setToken(event.target.value)} autoComplete="current-password" placeholder="ADMIN_API_TOKEN" disabled={!configured} /></label>
          {loginError && <p className="form-error">{loginError}</p>}
          <button className="button button-primary" type="submit" disabled={!configured}>Studio 열기 <span>→</span></button>
        </form>
        <Link href="/">← 공개 페이지로 돌아가기</Link>
      </div>
    </main>
  );

  return <StudioWorkspace onLogout={() => setAuthenticated(false)} />;
}

function StudioWorkspace({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<StudioTab>("posts");
  async function logout() { await fetch("/api/session", { method: "DELETE" }); onLogout(); }
  return (
    <main className="studio-shell">
      <aside className="studio-sidebar">
        <Link href="/" className="studio-logo"><span>KYB</span> Content Studio</Link>
        <nav>{(["posts", "projects", "api"] as StudioTab[]).map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item === "posts" ? "글" : item === "projects" ? "프로젝트" : "API"}</button>)}</nav>
        <div><Link href="/" target="_blank">사이트 보기 <ArrowUpRight /></Link><button onClick={logout}>로그아웃</button></div>
      </aside>
      <section className="studio-workspace">
        {tab === "posts" && <PostManager />}
        {tab === "projects" && <ProjectManager />}
        {tab === "api" && <ApiGuide />}
      </section>
    </main>
  );
}

function PostManager() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [form, setForm] = useState(emptyPost);
  const [message, setMessage] = useState("");
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, LinkExtension.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } })],
    content: "",
    onUpdate: ({ editor }) => setForm((current) => ({ ...current, contentHtml: editor.getHTML() })),
  });

  async function refresh() {
    const response = await fetch("/api/posts?drafts=true");
    if (response.ok) setPosts((await response.json()).posts);
  }
  useEffect(() => {
    fetch("/api/posts?drafts=true")
      .then((response) => response.ok ? response.json() : { posts: [] })
      .then((data) => setPosts(data.posts));
  }, []);

  function select(post?: Post) {
    const next = post ? { id: post.id, title: post.title, slug: post.slug, excerpt: post.excerpt, contentHtml: post.contentHtml, published: post.published } : emptyPost;
    setForm(next);
    editor?.commands.setContent(next.contentHtml);
    setMessage("");
  }

  async function save(event: React.FormEvent) {
    event.preventDefault(); setMessage("저장 중…");
    const response = await fetch(form.id ? `/api/posts/${form.id}` : "/api/posts", { method: form.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error ?? "저장하지 못했습니다.");
    await refresh(); select(data.post); setMessage("저장했습니다.");
  }

  async function remove() {
    if (!form.id || !window.confirm("이 글을 삭제할까요? 복구할 수 없습니다.")) return;
    const response = await fetch(`/api/posts/${form.id}`, { method: "DELETE" });
    if (response.ok) { await refresh(); select(); }
  }

  return <div className="manager-layout">
    <div className="manager-list"><div className="manager-list-head"><div><span>WRITING</span><h1>글</h1></div><button onClick={() => select()}>+ 새 글</button></div>{posts.map((post) => <button className={form.id === post.id ? "active" : ""} key={post.id} onClick={() => select(post)}><span>{post.published ? "발행" : "초안"}</span><strong>{post.title}</strong><small>{post.slug}</small></button>)}</div>
    <form className="editor-form" onSubmit={save}>
      <div className="editor-top"><div><span>{form.id ? "EDIT NOTE" : "NEW NOTE"}</span><h2>{form.id ? form.title || "제목 없음" : "새로운 기록"}</h2></div><div><button type="button" className="danger-link" onClick={remove} disabled={!form.id}>삭제</button><button className="save-button" type="submit">저장</button></div></div>
      <div className="form-grid"><label>제목<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value, slug: form.slug || slugifyClient(event.target.value) })} required /></label><label>슬러그<input value={form.slug} onChange={(event) => setForm({ ...form, slug: slugifyClient(event.target.value) })} required /></label></div>
      <label>요약<textarea rows={2} value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} /></label>
      <div className="tiptap-wrap">
        <div className="editor-toolbar">
          <button type="button" className={editor?.isActive("bold") ? "active" : ""} onClick={() => editor?.chain().focus().toggleBold().run()}>Bold</button>
          <button type="button" className={editor?.isActive("heading", { level: 2 }) ? "active" : ""} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
          <button type="button" className={editor?.isActive("heading", { level: 3 }) ? "active" : ""} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
          <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()}>List</button>
          <button type="button" onClick={() => editor?.chain().focus().toggleBlockquote().run()}>Quote</button>
          <button type="button" onClick={() => editor?.chain().focus().toggleCodeBlock().run()}>Code</button>
          <button type="button" onClick={() => { const href = window.prompt("링크 URL"); if (href) editor?.chain().focus().setLink({ href }).run(); }}>Link</button>
        </div>
        <EditorContent editor={editor} />
      </div>
      <div className="publish-row"><label className="switch-label"><input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} /><span /> 공개 발행</label><p>{message}</p></div>
    </form>
  </div>;
}

function ProjectManager() {
  const [form, setForm] = useState(emptyProject);
  const [message, setMessage] = useState("");
  async function save(event: React.FormEvent) {
    event.preventDefault(); setMessage("저장 중…");
    const response = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, id: form.id || slugifyClient(form.title), tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean) }) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error ?? "저장하지 못했습니다.");
    setMessage("프로젝트를 추가했습니다."); setForm(emptyProject);
  }
  return <div className="single-manager"><header><span>ARCHIVE</span><h1>프로젝트 추가</h1><p>저장한 프로젝트는 정적 아카이브와 합쳐져 공개 페이지에 바로 표시됩니다.</p></header><form className="project-form" onSubmit={save}><div className="form-grid"><label>프로젝트명<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label><label>고유 ID<input value={form.id} onChange={(e) => setForm({ ...form, id: slugifyClient(e.target.value) })} placeholder="비우면 제목에서 생성" /></label></div><div className="form-grid thirds"><label>분류<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ProjectCategory })}><option value="work">Professional</option><option value="product">Product</option><option value="lab">Lab</option><option value="student">Student</option></select></label><label>상태<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>운영</option><option>진행</option><option>완료</option><option>프로토타입</option></select></label><label>기간<input value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} /></label></div><label>한 줄 영문 설명<input value={form.eyebrow} onChange={(e) => setForm({ ...form, eyebrow: e.target.value })} /></label><label>프로젝트 설명<textarea rows={4} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} required /></label><label>역할과 기여도<input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></label><div className="form-grid"><label>기술 태그 <small>쉼표로 구분</small><input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></label><label>외부 링크<input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} /></label></div><div className="form-submit"><p>{message}</p><button className="save-button" type="submit">프로젝트 추가</button></div></form></div>;
}

function ApiGuide() {
  return <div className="api-guide"><header><span>CONTENT API</span><h1>어디서든 기록하기</h1><p>외부 도구에서는 Bearer 토큰으로 글과 프로젝트를 관리할 수 있습니다. 공개 조회에는 인증이 필요 없습니다.</p></header><section><h2>글 작성</h2><pre>{`curl -X POST https://your-domain.com/api/posts \\\n  -H "Authorization: Bearer $ADMIN_API_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "title": "제목",\n    "slug": "note-slug",\n    "excerpt": "요약",\n    "contentHtml": "<p>본문</p>",\n    "published": true\n  }'`}</pre></section><section><h2>프로젝트 추가</h2><pre>{`curl -X POST https://your-domain.com/api/projects \\\n  -H "Authorization: Bearer $ADMIN_API_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "id": "project-id",\n    "title": "Project",\n    "category": "product",\n    "summary": "설명",\n    "tags": ["Next.js", "AI"]\n  }'`}</pre></section><section className="endpoint-list"><h2>Endpoints</h2><p><code>GET /api/posts</code><span>발행된 글</span></p><p><code>POST /api/posts</code><span>글 작성</span></p><p><code>PATCH /api/posts/:id</code><span>글 수정</span></p><p><code>DELETE /api/posts/:id</code><span>글 삭제</span></p><p><code>GET /api/projects</code><span>전체 프로젝트</span></p><p><code>POST /api/projects</code><span>프로젝트 추가</span></p></section></div>;
}

function slugifyClient(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-|-$/g, ""); }
