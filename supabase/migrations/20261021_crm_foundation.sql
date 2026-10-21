-- Realty Center CRM: merkezi müşteri, takip ve aktivite kayıtları
create extension if not exists pgcrypto;

create table if not exists public.crm_customers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  assigned_to uuid references auth.users(id) on delete set null,
  name text not null,
  phone text not null,
  email text,
  customer_type text not null default 'Alıcı',
  stage text not null default 'Yeni' check (stage in ('Yeni','Görüşülüyor','Randevu','Teklif','Sonuçlandı','Kaybedildi')),
  source text not null default 'Manuel kayıt',
  city text,
  district text,
  budget text,
  preference text,
  next_action text,
  last_contact_at timestamptz,
  archived_at timestamptz,
  archived_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists crm_customers_phone_active_unique
  on public.crm_customers (lower(regexp_replace(phone, '\\s+', '', 'g')))
  where archived_at is null;
create index if not exists crm_customers_assigned_to_idx on public.crm_customers(assigned_to);
create index if not exists crm_customers_stage_idx on public.crm_customers(stage);
create index if not exists crm_customers_created_at_idx on public.crm_customers(created_at desc);

create table if not exists public.crm_activities (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.crm_customers(id) on delete restrict,
  actor_id uuid not null references auth.users(id) on delete restrict,
  activity_type text not null default 'note' check (activity_type in ('note','call','email','whatsapp','appointment','stage_change','assignment')),
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists crm_activities_customer_created_idx on public.crm_activities(customer_id, created_at desc);

create or replace function public.crm_touch_customer()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists crm_customers_touch on public.crm_customers;
create trigger crm_customers_touch before update on public.crm_customers
for each row execute function public.crm_touch_customer();

create or replace function public.crm_is_manager_or_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin','manager')
      and status = 'active' and deleted_at is null
  );
$$;

alter table public.crm_customers enable row level security;
alter table public.crm_activities enable row level security;

drop policy if exists "crm_customer_read" on public.crm_customers;
create policy "crm_customer_read" on public.crm_customers for select to authenticated
using (owner_id = auth.uid() or assigned_to = auth.uid() or public.crm_is_manager_or_admin());

drop policy if exists "crm_customer_insert" on public.crm_customers;
create policy "crm_customer_insert" on public.crm_customers for insert to authenticated
with check (owner_id = auth.uid() or public.crm_is_manager_or_admin());

drop policy if exists "crm_customer_update" on public.crm_customers;
create policy "crm_customer_update" on public.crm_customers for update to authenticated
using (owner_id = auth.uid() or assigned_to = auth.uid() or public.crm_is_manager_or_admin())
with check (owner_id = auth.uid() or assigned_to = auth.uid() or public.crm_is_manager_or_admin());

drop policy if exists "crm_activity_read" on public.crm_activities;
create policy "crm_activity_read" on public.crm_activities for select to authenticated
using (exists (select 1 from public.crm_customers c where c.id = customer_id and (c.owner_id = auth.uid() or c.assigned_to = auth.uid() or public.crm_is_manager_or_admin())));

drop policy if exists "crm_activity_insert" on public.crm_activities;
create policy "crm_activity_insert" on public.crm_activities for insert to authenticated
with check (actor_id = auth.uid() and exists (select 1 from public.crm_customers c where c.id = customer_id and (c.owner_id = auth.uid() or c.assigned_to = auth.uid() or public.crm_is_manager_or_admin())));

grant select, insert, update on public.crm_customers to authenticated;
grant select, insert on public.crm_activities to authenticated;
