-- Atomic star selection. This avoids a UI-only state change and keeps the 3-card limit reliable.
create or replace function public.toggle_homepage_star(p_kind text, p_entity_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  is_allowed boolean;
  star_count integer;
begin
  if p_kind not in ('advisor', 'office') then
    raise exception 'Geçersiz yıldız türü.';
  end if;

  select role = 'admin' into is_allowed
  from public.profiles
  where id = auth.uid();

  if coalesce(is_allowed, false) is false then
    raise exception 'Bu işlem için admin yetkisi gerekir.';
  end if;

  if exists (select 1 from public.homepage_stars where kind = p_kind and entity_id = p_entity_id) then
    delete from public.homepage_stars where kind = p_kind and entity_id = p_entity_id;
    return false;
  end if;

  select count(*) into star_count from public.homepage_stars where kind = p_kind;
  if star_count >= 3 then
    raise exception 'Ana sayfa için en fazla 3 seçim yapılabilir.';
  end if;

  insert into public.homepage_stars (kind, entity_id, position)
  values (p_kind, p_entity_id, star_count + 1);

  return true;
end;
$$;

revoke all on function public.toggle_homepage_star(text, uuid) from public;
grant execute on function public.toggle_homepage_star(text, uuid) to authenticated;
