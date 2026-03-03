import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const password = body.password ?? '';
  if (!password) {
    return Response.json({ error: 'Current password is required' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json(
      { error: 'Session expired. Please sign in again.' },
      { status: 401 }
    );
  }

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email ?? '',
    password,
  });
  if (reauthError) {
    return Response.json({ error: 'Current password is incorrect' }, { status: 401 });
  }

  return Response.json({ ok: true });
}
