# Kang YeonBae — Personal Hub

포트폴리오, 전체 프로젝트 아카이브, 블로그, 개인 Content Studio를 한곳에 구성한 Next.js 애플리케이션입니다.

## 구성

- `/` — 소개, 성과, 대표 사례, 경력, 최신 글
- `/projects` — 실무·개인 제품·Lab·학생 프로젝트 전체 검색/필터
- `/notes` — 발행된 글
- `/studio` — Tiptap 글 편집 및 프로젝트 추가
- `/api/posts` — 글 CRUD API
- `/api/projects` — 프로젝트 CRUD API

## 로컬 실행

```bash
npm install
npm run dev
```

환경 변수는 `.env.example`을 참고해 `.env.local`에 설정합니다.

```env
DATABASE_URL=postgresql://...
MIGRATION_URL=postgresql://...
SUPABASE_PASSWORD=...
ADMIN_API_TOKEN=...
```

Supabase가 제공하는 URL에 `[YOUR-PASSWORD]`가 남아 있어도 애플리케이션은 런타임 메모리에서 `SUPABASE_PASSWORD`를 URL 인코딩해 사용합니다. 실제 비밀번호가 들어간 `.env.local`은 Git에서 제외됩니다.

## 공유 Supabase DB 안전 설정

다른 애플리케이션과 같은 DB를 사용하므로 모든 객체는 `kyb_portfolio` 스키마에만 생성합니다. [supabase/schema.sql](./supabase/schema.sql)에는 외부 객체를 삭제하거나 변경하는 SQL이 없습니다.

```bash
psql "$MIGRATION_URL" -v ON_ERROR_STOP=1 -f supabase/schema.sql
```

연결 URL의 플레이스홀더를 사용하는 경우 Supabase SQL Editor에 `supabase/schema.sql` 내용만 붙여 실행하는 방법이 가장 간단합니다.

DB가 연결되지 않아도 정적 프로젝트 아카이브는 정상 표시됩니다. 글 작성과 동적 프로젝트 추가만 비활성화됩니다.

## API 인증

공개 GET은 인증 없이 사용할 수 있습니다. 작성·수정·삭제는 다음 헤더가 필요합니다.

```http
Authorization: Bearer ADMIN_API_TOKEN
```

Studio 로그인에도 같은 키를 사용합니다. 로그인 성공 시 원본 키 대신 12시간 유효한 HMAC 서명 HttpOnly 쿠키가 저장됩니다.

## 검증

```bash
npm run lint
npm run typecheck
npm run build
npm audit --omit=dev
```

빌드는 샌드박스와 Vercel에서 안정적으로 동작하도록 Webpack 경로를 사용합니다.
