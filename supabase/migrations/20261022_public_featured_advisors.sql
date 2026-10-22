-- Public home page may display only active advisor cards selected by Admin.
-- This policy exposes no authentication or audit data.
drop policy if exists "public reads active advisors" on public.profiles;
create policy "public reads active advisors" on public.profiles for select
  using (role = 'advisor' and status = 'active' and deleted_at is null);
