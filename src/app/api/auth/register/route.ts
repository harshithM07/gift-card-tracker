import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const email = (body.email ?? '').trim().toLowerCase();
  const password = body.password ?? '';

  if (!email || !password) {
    return Response.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const origin = new URL(req.url).origin;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  // If email confirmation is enabled, data.user exists but data.session is null.
  // Return the user so the client can show "check your email".
  return Response.json(
    { user: { id: data.user!.id, email: data.user!.email } },
    { status: 201 }
  );
}
