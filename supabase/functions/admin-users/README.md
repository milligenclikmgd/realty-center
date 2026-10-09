# Admin Users Edge Function

This function creates real Supabase Auth accounts only after verifying that the requesting session belongs to an active Admin profile. Passwords are not logged or returned.

Deploy from a local Supabase CLI session linked to this project:

```bash
supabase functions deploy admin-users
```

Supabase automatically provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` inside deployed Edge Functions. Do not place the service-role key in Vercel or frontend environment variables.
