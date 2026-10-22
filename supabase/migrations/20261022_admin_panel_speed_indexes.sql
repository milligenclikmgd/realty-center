-- Realty Center admin panel: common list and filter queries.
-- These indexes keep panel reads responsive as users, offices and logs grow.
create index if not exists profiles_active_created_at_idx
  on public.profiles (created_at desc)
  where deleted_at is null;

create index if not exists profiles_active_role_created_at_idx
  on public.profiles (role, created_at desc)
  where deleted_at is null;

create index if not exists offices_active_created_at_idx
  on public.offices (created_at desc)
  where deleted_at is null;

create index if not exists office_advisors_advisor_id_idx
  on public.office_advisors (advisor_id);

create index if not exists homepage_stars_kind_position_idx
  on public.homepage_stars (kind, position);

create index if not exists audit_logs_entity_created_at_idx
  on public.audit_logs (entity_id, created_at desc);
