-- ============================================================
-- Quiet Dissent Client Portal — Supabase Schema
-- Run this in the Supabase SQL editor for your project.
-- ============================================================

-- Clients
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,
  name text not null,
  business_name text,
  email text not null,
  phone text,
  engagement_type text check (engagement_type in ('01', '02', '03')),
  status text default 'active' check (status in ('active', 'paused', 'complete', 'archived')),
  -- Phase 2 CRM fields (scaffold now, UI later)
  pipeline_stage text,
  notes text,
  source text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Documents
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  title text not null,
  type text check (type in ('welcome', 'agreement', 'deliverable', 'invoice', 'resource', 'tax', 'other')),
  visibility text default 'client' check (visibility in ('client', 'internal')),
  storage_path text,       -- Supabase Storage path for uploaded files
  html_content text,       -- For rendered HTML documents
  is_signed boolean default false,
  signed_at timestamptz,
  created_at timestamptz default now()
);

-- Messages (per-client threaded)
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  sender_role text check (sender_role in ('admin', 'client')),
  sender_name text not null,
  content text not null,
  read_by_client boolean default false,
  read_by_admin boolean default false,
  created_at timestamptz default now()
);

-- Scheduled events
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  title text not null,
  scheduled_at timestamptz,
  cal_event_uid text,      -- Cal.com event reference
  status text default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz default now()
);

-- Phase 2: Invoices (scaffold only — no UI in Phase 1)
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  amount_cents integer,
  status text default 'unpaid' check (status in ('unpaid', 'paid', 'overdue')),
  due_date date,
  paid_at timestamptz,
  description text,
  created_at timestamptz default now()
);

-- ============================================================
-- updated_at trigger for clients
-- ============================================================
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger clients_updated_at
  before update on clients
  for each row execute function update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table clients enable row level security;
alter table documents enable row level security;
alter table messages enable row level security;
alter table events enable row level security;
alter table invoices enable row level security;

-- Clients: a row is visible to the client whose clerk_user_id matches.
-- Admin access is handled server-side via service role key — no RLS policy needed
-- because the service role bypasses RLS entirely.

create policy "clients: own row only"
  on clients for select
  using (clerk_user_id = requesting_user_id());

create policy "documents: own client only"
  on documents for select
  using (
    client_id in (
      select id from clients where clerk_user_id = requesting_user_id()
    )
    and visibility = 'client'
  );

create policy "messages: own client only"
  on messages for select
  using (
    client_id in (
      select id from clients where clerk_user_id = requesting_user_id()
    )
  );

create policy "events: own client only"
  on events for select
  using (
    client_id in (
      select id from clients where clerk_user_id = requesting_user_id()
    )
  );

-- Helper function: returns the Clerk user ID from JWT sub claim.
-- In Supabase, set the JWT template to include sub = clerk_user_id.
-- For simplicity in Phase 1, all client-side reads go through API routes
-- using the service role, so this function is a scaffold for future direct access.
create or replace function requesting_user_id()
returns text language sql stable as $$
  select coalesce(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  )
$$;

-- ============================================================
-- Supabase Realtime — enable on messages table
-- ============================================================
-- In the Supabase dashboard: Database > Replication > Tables
-- Enable replication for the `messages` table.
-- Or run:
-- alter publication supabase_realtime add table messages;
