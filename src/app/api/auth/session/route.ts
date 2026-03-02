import { cookies } from 'next/headers';
import { SESSION_COOKIE } from '@/lib/auth/constants';
import { getUserBySessionId } from '@/lib/auth/store';

export async function GET() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionId) {
    return Response.json({ user: null }, { status: 401 });
  }

  const user = getUserBySessionId(sessionId);
  if (!user) {
    return Response.json({ user: null }, { status: 401 });
  }

  return Response.json({ user });
}
