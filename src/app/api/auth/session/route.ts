import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return Response.json({ user: null }, { status: 401 });
  }

  return Response.json({ user: { id: user.id, email: user.email } });
}
