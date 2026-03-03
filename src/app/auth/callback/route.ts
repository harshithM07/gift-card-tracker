import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type'); // e.g. 'signup' | 'recovery' | 'magiclink'
  const next = searchParams.get('next');

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }
  } else if (
    tokenHash &&
    (type === 'signup' || type === 'recovery' || type === 'magiclink' || type === 'invite')
  ) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (error) {
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }
  } else {
    return NextResponse.redirect(`${origin}/login?error=missing_token`);
  }

  // Password reset links land on reset-password so the user can set a new password
  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/reset-password`);
  }

  if (next?.startsWith('/')) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(origin);
}
