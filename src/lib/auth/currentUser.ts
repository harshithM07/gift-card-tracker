import 'server-only';
import { cookies } from 'next/headers';
import { SESSION_COOKIE } from '@/lib/auth/constants';
import { getUserBySessionId } from '@/lib/auth/store';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;
  return getUserBySessionId(sessionId);
}
