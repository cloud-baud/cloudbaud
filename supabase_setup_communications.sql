-- Unified Communications inbound email storage

create extension if not exists pgcrypto;

create table if not exists public.communications_inbox (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'resend',
  direction text not null default 'inbound',
  event_type text,
  message_id text,
  thread_key text,
  from_email text,
  from_name text,
  to_emails text[] not null default '{}',
  cc_emails text[] not null default '{}',
  bcc_emails text[] not null default '{}',
  subject text,
  text_body text,
  html_body text,
  raw_payload jsonb not null,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists ux_communications_inbox_provider_message
  on public.communications_inbox(provider, message_id)
  where message_id is not null;

create index if not exists ix_communications_inbox_received_at
  on public.communications_inbox(received_at desc);

create index if not exists ix_communications_inbox_thread_key
  on public.communications_inbox(thread_key);

alter table public.communications_inbox enable row level security;

-- App users can read inbound communications in workspace UI.
drop policy if exists communications_inbox_select_auth on public.communications_inbox;
create policy communications_inbox_select_auth
  on public.communications_inbox
  for select
  to authenticated
  using (true);

-- Service role writes webhook payloads.
drop policy if exists communications_inbox_insert_service on public.communications_inbox;
create policy communications_inbox_insert_service
  on public.communications_inbox
  for insert
  to service_role
  with check (true);
