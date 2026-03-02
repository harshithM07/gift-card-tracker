import { cookies } from 'next/headers';
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from '@/lib/auth/constants';
import { createSession, registerUser } from '@/lib/auth/store';
import { validateCredentials } from '@/lib/auth/validate';

export async function POST(req: Request) {
  let body: { email?: string; password?: string };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const email = body.email ?? '';
  const password = body.password ?? '';

  const validationError = validateCredentials(email, password);
  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 });
  }

  const user = registerUser(email, password);
  if (!user) {
    return Response.json({ error: 'Email is already registered' }, { status: 409 });
  }

  const sessionId = createSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return Response.json({ user }, { status: 201 });
}
