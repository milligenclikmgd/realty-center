-- Realty Center listing category foundation
-- Safe migration: never deletes or rewrites existing listing data.
-- Existing listings.category, property_type and details remain the compatibility source
-- until every record is reviewed and matched to a category_id.

create table if not exists public.listing_categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.listing_categories(id) on delete restrict,
  code text not null unique,
  name text not null,
  main_category text not null check (main_category in ('Konut', 'Arsa', 'İşyeri')),
  allowed_transaction_types text[] not null default array['Satılık','Kiralık'],
  sort_order integer not null default 0,
  is_active boolean not null default true,
  description text,
  seo_title text,
  seo_description text,
  image_url text,
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listing_categories_parent_sort_idx on public.listing_categories(parent_id, sort_order);
create index if not exists listing_categories_main_active_idx on public.listing_categories(main_category, is_active, sort_order);

create table if not exists public.listing_transaction_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table if not exists public.listing_category_transactions (
  category_id uuid not null references public.listing_categories(id) on delete cascade,
  transaction_type_id uuid not null references public.listing_transaction_types(id) on delete cascade,
  primary key (category_id, transaction_type_id)
);

-- Field definitions are independent of the category tree. This lets one field
-- power the listing form, detail page and search filter using the same key.
create table if not exists public.listing_field_groups (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table if not exists public.listing_field_definitions (
  id uuid primary key default gen_random_uuid(),
  field_key text not null unique,
  name text not null,
  group_id uuid references public.listing_field_groups(id) on delete set null,
  field_type text not null check (field_type in ('short_text','long_text','integer','decimal','currency','single_select','multi_select','boolean_unknown','date','range','meter','square_meter','percent','file','photo','location','parcel','link')),
  unit text,
  is_multiple boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.listing_field_options (
  id uuid primary key default gen_random_uuid(),
  field_id uuid not null references public.listing_field_definitions(id) on delete cascade,
  option_key text not null,
  label text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  unique(field_id, option_key)
);

create table if not exists public.listing_category_fields (
  category_id uuid not null references public.listing_categories(id) on delete cascade,
  field_id uuid not null references public.listing_field_definitions(id) on delete cascade,
  transaction_type_id uuid references public.listing_transaction_types(id) on delete cascade,
  is_required boolean not null default false,
  show_in_filter boolean not null default true,
  show_in_detail boolean not null default true,
  show_on_mobile boolean not null default true,
  filter_order integer not null default 0,
  form_order integer not null default 0,
  primary key(category_id, field_id, transaction_type_id)
);

create index if not exists listing_category_fields_category_idx on public.listing_category_fields(category_id, form_order);
create index if not exists listing_field_options_field_idx on public.listing_field_options(field_id, sort_order);

-- Reference only: existing details JSONB stays authoritative until the future
-- listing editor writes normalized values into this table.
create table if not exists public.listing_field_values (
  listing_id uuid not null references public.listings(id) on delete cascade,
  field_id uuid not null references public.listing_field_definitions(id) on delete restrict,
  value_json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(listing_id, field_id)
);
create index if not exists listing_field_values_field_idx on public.listing_field_values(field_id);

alter table public.listings add column if not exists category_id uuid references public.listing_categories(id) on delete set null;
create index if not exists listings_category_public_search_idx on public.listings(category_id, approval_status, created_at desc) where deleted_at is null;

insert into public.listing_transaction_types (code, name, sort_order) values
  ('sale', 'Satılık', 1), ('rent', 'Kiralık', 2), ('transfer', 'Devren', 3)
on conflict (code) do update set name = excluded.name, sort_order = excluded.sort_order;

insert into public.listing_field_groups (code, name, sort_order) values
  ('basic', 'Temel Bilgiler', 1), ('building', 'Bina Özellikleri', 2), ('interior', 'İç Özellikler', 3), ('exterior', 'Dış Özellikler', 4), ('zoning', 'İmar', 5), ('title', 'Tapu', 6), ('parcel', 'Parsel Özellikleri', 7), ('infrastructure', 'Altyapı', 8), ('technical', 'Teknik Altyapı', 9), ('business', 'İşletme Bilgileri', 10), ('finance', 'Tapu ve Finansman', 11)
on conflict (code) do update set name = excluded.name, sort_order = excluded.sort_order;

insert into public.listing_field_definitions (field_key, name, group_id, field_type, unit, is_multiple)
select seed.field_key, seed.name, groups.id, seed.field_type, seed.unit, seed.is_multiple
from (values
  ('price','Fiyat','basic','currency','TRY',false), ('gross_sqm','Brüt m²','basic','square_meter','m²',false), ('net_sqm','Net m²','basic','square_meter','m²',false),
  ('rooms','Oda Sayısı','basic','single_select',null,false), ('building_age','Bina Yaşı','building','integer','yıl',false), ('floor','Bulunduğu Kat','building','single_select',null,false), ('heating','Isıtma','building','single_select',null,false), ('parking','Otopark','exterior','single_select',null,false),
  ('zoning','İmar Durumu','zoning','single_select',null,false), ('title_deed_type','Tapu Niteliği','title','single_select',null,false), ('deed','Tapu Durumu','title','single_select',null,false), ('kaks','KAKS / Emsal','zoning','decimal',null,false), ('taks','TAKS','zoning','decimal',null,false), ('frontage','Yola Cephe','parcel','decimal','m',false), ('infrastructure','Altyapı','infrastructure','multi_select',null,true),
  ('closed_area','Kapalı Alan','technical','square_meter','m²',false), ('ceiling_height','Tavan Yüksekliği','technical','decimal','m',false), ('power_capacity','Elektrik Gücü','technical','integer','kVA',false), ('loading_ramp','Yükleme Rampası','technical','single_select',null,false), ('tir_access','TIR Girişi','technical','single_select',null,false), ('osb','OSB İçerisinde','technical','single_select',null,false),
  ('transfer_fee','Devir Bedeli','business','currency','TRY',false), ('monthly_rent','Aylık Kira','business','currency','TRY',false), ('deposit','Depozito','business','currency','TRY',false), ('stock_included','Stok Dahil mi?','business','boolean_unknown',null,false), ('license_status','Ruhsat Durumu','business','single_select',null,false), ('mortgage','Krediye Uygunluk','finance','boolean_unknown',null,false)
) as seed(field_key, name, group_code, field_type, unit, is_multiple)
join public.listing_field_groups groups on groups.code = seed.group_code
on conflict (field_key) do update set name = excluded.name, group_id = excluded.group_id, field_type = excluded.field_type, unit = excluded.unit, is_multiple = excluded.is_multiple;

-- Three roots plus every requested child category. Re-running this migration is safe.
insert into public.listing_categories (code, name, main_category, allowed_transaction_types, sort_order)
values ('residential','Konut','Konut',array['Satılık','Kiralık'],1), ('land','Arsa','Arsa',array['Satılık'],2), ('commercial','İş Yeri / Ticari Gayrimenkul','İşyeri',array['Satılık','Kiralık','Devren'],3)
on conflict (code) do update set name = excluded.name, main_category = excluded.main_category, allowed_transaction_types = excluded.allowed_transaction_types, sort_order = excluded.sort_order;

with seeds(main_category, code, name, transaction_types, sort_order) as (
  values
    ('Konut','apartment','Daire',array['Satılık','Kiralık'],1),('Konut','residence','Rezidans',array['Satılık','Kiralık'],2),('Konut','detached-house','Müstakil Ev',array['Satılık','Kiralık'],3),('Konut','villa','Villa',array['Satılık','Kiralık'],4),('Konut','summer-house','Yazlık',array['Satılık','Kiralık'],5),('Konut','waterside-mansion','Yalı',array['Satılık','Kiralık'],6),('Konut','waterside-flat','Yalı Dairesi',array['Satılık','Kiralık'],7),('Konut','mansion','Köşk',array['Satılık','Kiralık'],8),('Konut','manor','Konak',array['Satılık','Kiralık'],9),('Konut','farm-house','Çiftlik Evi',array['Satılık','Kiralık'],10),('Konut','mountain-house','Dağ Evi',array['Satılık','Kiralık'],11),('Konut','prefabricated-house','Prefabrik Ev',array['Satılık','Kiralık'],12),('Konut','cooperative','Kooperatif',array['Satılık'],13),('Konut','building','Bina',array['Satılık','Kiralık'],14),('Konut','timeshare','Devre Mülk',array['Satılık'],15),('Konut','tiny-house','Tiny House',array['Satılık','Kiralık'],16),('Konut','bungalow','Bungalov',array['Satılık','Kiralık'],17),('Konut','stone-house','Taş Ev',array['Satılık','Kiralık'],18),('Konut','housing-project','Konut Projesi',array['Satılık'],19),
    ('Arsa','residential-zoned','Konut İmarlı',array['Satılık'],1),('Arsa','commercial-zoned','Ticari İmarlı',array['Satılık'],2),('Arsa','mixed-zoned','Konut + Ticari İmarlı',array['Satılık'],3),('Arsa','industrial-zoned','Sanayi İmarlı',array['Satılık'],4),('Arsa','tourism-zoned','Turizm İmarlı',array['Satılık'],5),('Arsa','field','Tarla',array['Satılık'],6),('Arsa','vineyard','Bağ',array['Satılık'],7),('Arsa','garden','Bahçe',array['Satılık'],8),('Arsa','olive-grove','Zeytinlik',array['Satılık'],9),('Arsa','orchard','Meyvelik',array['Satılık'],10),('Arsa','greenhouse','Sera',array['Satılık'],11),('Arsa','farm','Çiftlik',array['Satılık'],12),('Arsa','hobby-garden','Hobi Bahçesi',array['Satılık'],13),('Arsa','warehouse-zoned','Depo / Antrepo İmarlı',array['Satılık'],14),('Arsa','education-zoned','Eğitim Tesisi İmarlı',array['Satılık'],15),('Arsa','health-zoned','Sağlık Tesisi İmarlı',array['Satılık'],16),('Arsa','fuel-zoned','Akaryakıt İstasyonu İmarlı',array['Satılık'],17),('Arsa','special-use','Özel Kullanım',array['Satılık'],18),('Arsa','un-zoned','İmarsız',array['Satılık'],19),('Arsa','misc-land','Muhtelif Arsa',array['Satılık'],20),
    ('İşyeri','office','Ofis / Büro',array['Satılık','Kiralık'],1),('İşyeri','plaza-floor','Plaza Katı',array['Satılık','Kiralık'],2),('İşyeri','business-center-floor','İş Hanı Katı',array['Satılık','Kiralık'],3),('İşyeri','shop','Dükkan',array['Satılık','Kiralık','Devren'],4),('İşyeri','store','Mağaza',array['Satılık','Kiralık','Devren'],5),('İşyeri','showroom','Showroom',array['Satılık','Kiralık','Devren'],6),('İşyeri','mall-shop','AVM Dükkanı',array['Satılık','Kiralık'],7),('İşyeri','restaurant','Restoran / Lokanta',array['Satılık','Kiralık','Devren'],8),('İşyeri','cafe','Kafe / Pastane',array['Satılık','Kiralık','Devren'],9),('İşyeri','hotel','Otel',array['Satılık','Kiralık','Devren'],10),('İşyeri','apart-hotel','Apart Otel',array['Satılık','Kiralık','Devren'],11),('İşyeri','pension','Pansiyon',array['Satılık','Kiralık','Devren'],12),('İşyeri','tourism-facility','Turistik Tesis',array['Satılık','Kiralık','Devren'],13),('İşyeri','factory','Fabrika',array['Satılık','Kiralık'],14),('İşyeri','manufacturing','İmalathane',array['Satılık','Kiralık'],15),('İşyeri','workshop','Atölye',array['Satılık','Kiralık'],16),('İşyeri','warehouse','Depo',array['Satılık','Kiralık'],17),('İşyeri','warehouse-bonded','Antrepo',array['Satılık','Kiralık'],18),('İşyeri','cold-storage','Soğuk Hava Deposu',array['Satılık','Kiralık'],19),('İşyeri','logistics','Lojistik Merkezi',array['Satılık','Kiralık'],20),('İşyeri','industrial-facility','Sanayi Tesisi',array['Satılık','Kiralık'],21),('İşyeri','fuel-station','Akaryakıt İstasyonu',array['Satılık','Kiralık'],22),('İşyeri','parking-lot','Otopark',array['Satılık','Kiralık'],23),('İşyeri','health-facility','Sağlık Tesisi',array['Satılık','Kiralık'],24),('İşyeri','education-facility','Eğitim Tesisi',array['Satılık','Kiralık'],25),('İşyeri','dormitory','Yurt',array['Satılık','Kiralık'],26),('İşyeri','sports-facility','Spor Tesisi',array['Satılık','Kiralık','Devren'],27),('İşyeri','event-hall','Düğün / Organizasyon Salonu',array['Satılık','Kiralık','Devren'],28),('İşyeri','production-farm','Çiftlik / Üretim Tesisi',array['Satılık','Kiralık'],29),('İşyeri','other-commercial','Diğer Ticari',array['Satılık','Kiralık','Devren'],30)
)
insert into public.listing_categories (parent_id, code, name, main_category, allowed_transaction_types, sort_order)
select roots.id, seeds.code, seeds.name, seeds.main_category, seeds.transaction_types, seeds.sort_order
from seeds join public.listing_categories roots on roots.code = case seeds.main_category when 'Konut' then 'residential' when 'Arsa' then 'land' else 'commercial' end
on conflict (code) do update set parent_id = excluded.parent_id, name = excluded.name, main_category = excluded.main_category, allowed_transaction_types = excluded.allowed_transaction_types, sort_order = excluded.sort_order;

insert into public.listing_category_transactions(category_id, transaction_type_id)
select categories.id, transactions.id
from public.listing_categories categories
join public.listing_transaction_types transactions on transactions.name = any(categories.allowed_transaction_types)
on conflict do nothing;

-- Existing public search keeps working. This backfill only adds category_id where a
-- reliable legacy property type match exists; unmatched listings stay untouched.
update public.listings listings set category_id = categories.id
from public.listing_categories categories
where listings.category_id is null
and categories.parent_id is not null
and lower(replace(replace(categories.name, ' / Büro', ''), 'İşyeri', 'İş Yeri')) = lower(replace(replace(coalesce(listings.property_type, ''), 'Residence', 'Rezidans'), 'Ev', 'Müstakil Ev'));

alter table public.listing_categories enable row level security;
alter table public.listing_transaction_types enable row level security;
alter table public.listing_category_transactions enable row level security;
alter table public.listing_field_groups enable row level security;
alter table public.listing_field_definitions enable row level security;
alter table public.listing_field_options enable row level security;
alter table public.listing_category_fields enable row level security;
alter table public.listing_field_values enable row level security;

drop policy if exists "public reads active listing categories" on public.listing_categories;
create policy "public reads active listing categories" on public.listing_categories for select using (is_active = true);
drop policy if exists "public reads active listing transaction types" on public.listing_transaction_types;
create policy "public reads active listing transaction types" on public.listing_transaction_types for select using (is_active = true);
drop policy if exists "public reads listing category transactions" on public.listing_category_transactions;
create policy "public reads listing category transactions" on public.listing_category_transactions for select using (true);
drop policy if exists "public reads active listing field groups" on public.listing_field_groups;
create policy "public reads active listing field groups" on public.listing_field_groups for select using (is_active = true);
drop policy if exists "public reads active listing field definitions" on public.listing_field_definitions;
create policy "public reads active listing field definitions" on public.listing_field_definitions for select using (is_active = true);
drop policy if exists "public reads active listing field options" on public.listing_field_options;
create policy "public reads active listing field options" on public.listing_field_options for select using (is_active = true);
drop policy if exists "public reads listing category fields" on public.listing_category_fields;
create policy "public reads listing category fields" on public.listing_category_fields for select using (true);

-- Managers/admins can be granted write policies in the next panel stage.
-- No write policy is introduced here, so the public client cannot alter definitions.
