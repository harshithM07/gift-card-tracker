import { cookies } from 'next/headers';
import { deleteSession } from '@/lib/auth/store';
import { SESSION_COOKIE } from '@/lib/auth/constants';

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionId) {
    deleteSession(sessionId);
  }

  cookieStore.set(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });

  return Response.json({ ok: true });
}
