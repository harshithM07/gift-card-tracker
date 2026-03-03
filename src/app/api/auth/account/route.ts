import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function DELETE() {
  // Verify the caller is authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use the service role key to delete the user (admin-only operation).
  // Cards are cascade-deleted by the DB foreign key constraint.
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Clear the session cookie
  await supabase.auth.signOut();

  return Response.json({ ok: true });
}
