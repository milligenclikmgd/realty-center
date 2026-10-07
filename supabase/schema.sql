-- Realty Center panel foundation: run once in Supabase SQL Editor.
-- Authentication passwords are managed only by Supabase Auth and never stored here.

create extension if not exists pgcrypto;

create type public.user_role as enum ('advisor', 'manager', 'admin');
create type public.account_status as enum ('active', 'inactive', 'suspended', 'left');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  first_name text not null,
  last_name text not null,
  username text not null,
  email text not null,
  phone text,
  role public.user_role not null default 'advisor',
  status public.account_status not null default 'active',
  avatar_url text,
  expertise_areas text[] not null default '{}',
  whatsapp text,
  bio text,
  force_password_change boolean not null default false,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id),
  delete_reason text,
  unique (username),
  unique (email),
  constraint profiles_username_normalized check (username = lower(trim(username))),
  constraint profiles_email_normalized check (email = lower(trim(email)))
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_role public.user_role,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_values jsonb,
  new_values jsonb,
  request_id text,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_entity_idx on public.audit_logs(entity_type, entity_id, created_at desc);
create index if not exists audit_logs_actor_idx on public.audit_logs(actor_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and status = 'active' and deleted_at is null); $$;

create policy "users can read own profile" on public.profiles for select using (id = auth.uid());
create policy "admins manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());
create policy "admins read audit logs" on public.audit_logs for select using (public.is_admin());

create or replace function public.audit_profile_change()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.audit_logs(actor_id, actor_role, action, entity_type, entity_id, old_values, new_values)
  values (
    auth.uid(),
    (select role from public.profiles where id = auth.uid()),
    case when tg_op = 'INSERT' then 'user.created' when tg_op = 'UPDATE' then 'user.updated' else 'user.deleted' end,
    'profile',
    coalesce(new.id, old.id),
    case when tg_op = 'INSERT' then null else to_jsonb(old) - 'email' end,
    case when tg_op = 'DELETE' then null else to_jsonb(new) - 'email' end
  );
  return coalesce(new, old);
end;
$$;

drop trigger if exists profiles_audit_trigger on public.profiles;
create trigger profiles_audit_trigger after insert or update or delete on public.profiles
for each row execute function public.audit_profile_change();

-- First admin: create the user from Authentication > Users, then run this after replacing values.
-- insert into public.profiles (id, first_name, last_name, username, email, role)
-- values ('AUTH_USER_UUID', 'Admin', 'Realty Center', 'admin', 'YOUR_EMAIL@example.com', 'admin');