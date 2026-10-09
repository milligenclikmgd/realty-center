import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  // Supabase JS istemcisinin tüm CORS ön-istek başlıklarını kabul et.
  // x-retry-count eksik olduğunda tarayıcı POST isteğini fonksiyona ulaşmadan engeller.
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-retry-count, traceparent, tracestate, baggage',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
};

type CreateUserPayload = {
  firstName: string; lastName: string; username: string; email: string; phone?: string | null;
  role: 'advisor' | 'manager'; password: string; status: 'active' | 'inactive'; forcePasswordChange: boolean;
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  const url = Deno.env.get('SUPABASE_URL')!;
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return json({ error: 'Oturum bulunamadı.' }, 401);

  const admin = createClient(url, serviceRole, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: authData } = await admin.auth.getUser(token);
  if (!authData.user) return json({ error: 'Oturum doğrulanamadı.' }, 401);

  const { data: actor } = await admin.from('profiles').select('id, role, status').eq('id', authData.user.id).maybeSingle();
  if (!actor || actor.role !== 'admin' || actor.status !== 'active') return json({ error: 'Bu işlem için Admin yetkisi gerekir.' }, 403);

  const body = await request.json().catch(() => null);
  if (body?.action !== 'create_user') return json({ error: 'Geçersiz istek.' }, 400);
  const payload = body.payload as CreateUserPayload;
  const username = String(payload?.username || '').trim().toLowerCase();
  const email = String(payload?.email || '').trim().toLowerCase();
  if (!payload?.firstName?.trim() || !payload?.lastName?.trim() || !username || !email || !payload?.password) return json({ error: 'Zorunlu alanları doldurun.' }, 400);
  if (!/^[a-z0-9._-]{3,40}$/.test(username)) return json({ error: 'Geçerli bir kullanıcı adı girin.' }, 400);
  if (!/^\S+@\S+\.\S+$/.test(email)) return json({ error: 'Geçerli bir e-posta adresi girin.' }, 400);
  if (payload.password.length < 10) return json({ error: 'Şifre en az 10 karakter olmalıdır.' }, 400);
  if (!['advisor', 'manager'].includes(payload.role) || !['active', 'inactive'].includes(payload.status)) return json({ error: 'Geçersiz rol veya durum.' }, 400);

  const { data: duplicate } = await admin.from('profiles').select('id').or(`username.eq.${username},email.eq.${email}`).limit(1);
  if (duplicate?.length) return json({ error: 'Bu kullanıcı adı veya e-posta zaten kullanılıyor.' }, 409);

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email, password: payload.password, email_confirm: true,
    user_metadata: { first_name: payload.firstName.trim(), last_name: payload.lastName.trim(), username },
  });
  if (createError || !created.user) return json({ error: 'Giriş hesabı oluşturulamadı.' }, 400);

  const { error: profileError } = await admin.from('profiles').insert({
    id: created.user.id, first_name: payload.firstName.trim(), last_name: payload.lastName.trim(), username, email,
    phone: payload.phone || null, role: payload.role, status: payload.status, force_password_change: Boolean(payload.forcePasswordChange),
  });
  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return json({ error: 'Kullanıcı profili oluşturulamadı.' }, 400);
  }

  await admin.from('audit_logs').insert({ actor_id: actor.id, actor_role: 'admin', action: 'user.created', entity_type: 'profile', entity_id: created.user.id, new_values: { username, role: payload.role, status: payload.status } });
  return json({ id: created.user.id, username, email }, 201);
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
