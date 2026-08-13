-- This database is shared by multiple applications.
-- Portfolio objects live only in this dedicated schema.
-- This migration never drops or alters objects outside kyb_portfolio.
create schema if not exists kyb_portfolio;

create table if not exists kyb_portfolio.posts (
  id uuid primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 160),
  excerpt text not null default '',
  content_html text not null default '',
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists kyb_portfolio.projects (
  id text primary key,
  title text not null,
  eyebrow text not null default '',
  period text not null default '',
  category text not null check (category in ('work', 'product', 'lab', 'student')),
  summary text not null,
  role text not null default '',
  tags jsonb not null default '[]'::jsonb,
  status text check (status is null or status in ('운영', '진행', '완료', '프로토타입')),
  url text,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on schema kyb_portfolio is 'Isolated content storage for the Kang YeonBae portfolio';
