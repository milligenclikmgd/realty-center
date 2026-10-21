-- Realty Center office records: only active offices are public.
create table if not exists public.offices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  district text not null,
  address text not null default '',
  phone text,
  email text,
  manager_name text,
  image_url text,
  status text not null default 'active' check (status in ('active','inactive','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists offices_public_idx on public.offices (status, city, district);
alter table public.offices enable row level security;

create policy "public reads active offices" on public.offices for select using (status = 'active' or public.is_admin());
create policy "admins manage offices" on public.offices for all using (public.is_admin()) with check (public.is_admin());
