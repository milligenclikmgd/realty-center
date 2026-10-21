-- Realty Center: advisor, office, featured content and reversible trash support.
-- Additive migration: it preserves all existing users and office records.

alter table public.offices add column if not exists owner_profile_id uuid references public.profiles(id) on delete set null;
alter table public.offices add column if not exists deleted_at timestamptz;
alter table public.offices add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

create table if not exists public.office_advisors (
  office_id uuid not null references public.offices(id) on delete cascade,
  advisor_id uuid not null references public.profiles(id) on delete restrict,
  is_manager boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (office_id, advisor_id)
);
create index if not exists office_advisors_advisor_idx on public.office_advisors(advisor_id);

create table if not exists public.advisor_metrics (
  advisor_id uuid primary key references public.profiles(id) on delete cascade,
  messages_answered integer not null default 0 check (messages_answered >= 0),
  star_rating numeric(2,1) not null default 0 check (star_rating >= 0 and star_rating <= 5),
  updated_at timestamptz not null default now()
);

create table if not exists public.homepage_stars (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('advisor','office')),
  entity_id uuid not null,
  position smallint not null check (position between 1 and 3),
  created_at timestamptz not null default now(),
  unique (kind, entity_id),
  unique (kind, position)
);

alter table public.office_advisors enable row level security;
alter table public.advisor_metrics enable row level security;
alter table public.homepage_stars enable row level security;

create policy "admins manage office advisors" on public.office_advisors for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage advisor metrics" on public.advisor_metrics for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage homepage stars" on public.homepage_stars for all using (public.is_admin()) with check (public.is_admin());
create policy "public reads homepage stars" on public.homepage_stars for select using (true);

-- Replace only the old active-office read policy so trashed offices never reach the public site.
drop policy if exists "public reads active offices" on public.offices;
create policy "public reads active non trashed offices" on public.offices for select
  using ((status = 'active' and deleted_at is null) or public.is_admin());
