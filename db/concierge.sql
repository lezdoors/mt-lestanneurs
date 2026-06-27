-- Maison Tanneurs — Concierge schema (additive; safe to run on production).
-- Three tables form the shared state plane between the on-site concierge
-- (Vercel serverless, Claude-powered) and Mouha (the VPS oversight agent):
--
--   concierge_conversations  one thread per visitor session
--   concierge_messages       every turn (user / assistant / agent[=Mouha or human])
--   concierge_tickets        escalations Mouha works from behind
--
-- The site writes via SUPABASE_SERVICE_ROLE_KEY (server-only). RLS is ON with
-- no public policies, so the anon key cannot read or write these tables — only
-- the service role (which bypasses RLS) and Mouha's own credentials can.

create extension if not exists "pgcrypto";

create table if not exists concierge_conversations (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  last_activity timestamptz not null default now(),
  status        text not null default 'open'
                  check (status in ('open', 'escalated', 'human', 'closed')),
  locale        text not null default 'en',
  customer_email text,
  page_url      text,
  user_agent    text
);

create table if not exists concierge_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references concierge_conversations(id) on delete cascade,
  role            text not null check (role in ('user', 'assistant', 'agent')),
  content         text not null,
  created_at      timestamptz not null default now(),
  meta            jsonb
);

create index if not exists concierge_messages_conv_idx
  on concierge_messages (conversation_id, created_at);

create table if not exists concierge_tickets (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references concierge_conversations(id) on delete cascade,
  created_at      timestamptz not null default now(),
  reason          text not null,
  summary         text,
  customer_email  text,
  priority        text not null default 'normal'
                    check (priority in ('low', 'normal', 'high')),
  status          text not null default 'open'
                    check (status in ('open', 'resolved'))
);

create index if not exists concierge_tickets_status_idx
  on concierge_tickets (status, created_at desc);

alter table concierge_conversations enable row level security;
alter table concierge_messages      enable row level security;
alter table concierge_tickets       enable row level security;

-- No anon/public policies on purpose. Service role bypasses RLS; Mouha reads
-- and writes (agent messages, ticket resolution) with its own service key.
