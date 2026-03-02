import 'server-only';
import { randomUUID } from 'crypto';
import { SESSION_MAX_AGE_SECONDS } from './constants';
import { hashPassword, verifyPassword } from './password';

type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

type SessionRecord = {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
};

export type AuthUser = {
  id: string;
  email: string;
};

const usersByEmail = new Map<string, UserRecord>();
const usersById = new Map<string, UserRecord>();
const sessions = new Map<string, SessionRecord>();

function nowMs(): number {
  return Date.now();
}

function pruneExpiredSessions() {
  const current = nowMs();
  for (const [id, session] of sessions.entries()) {
    if (new Date(session.expiresAt).getTime() <= current) {
      sessions.delete(id);
    }
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toPublicUser(user: UserRecord): AuthUser {
  return { id: user.id, email: user.email };
}

export function registerUser(email: string, password: string): AuthUser | null {
  const normalized = normalizeEmail(email);
  if (usersByEmail.has(normalized)) return null;

  const now = new Date().toISOString();
  const user: UserRecord = {
    id: randomUUID(),
    email: normalized,
    passwordHash: hashPassword(password),
    createdAt: now,
  };

  usersByEmail.set(normalized, user);
  usersById.set(user.id, user);
  return toPublicUser(user);
}

export function authenticateUser(email: string, password: string): AuthUser | null {
  const user = usersByEmail.get(normalizeEmail(email));
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;
  return toPublicUser(user);
}

export function createSession(userId: string): string {
  pruneExpiredSessions();

  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + SESSION_MAX_AGE_SECONDS * 1000);
  const sessionId = randomUUID();

  sessions.set(sessionId, {
    id: sessionId,
    userId,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  });

  return sessionId;
}

export function getUserBySessionId(sessionId: string): AuthUser | null {
  pruneExpiredSessions();

  const session = sessions.get(sessionId);
  if (!session) return null;

  const user = usersById.get(session.userId);
  if (!user) return null;
  return toPublicUser(user);
}

export function deleteSession(sessionId: string) {
  sessions.delete(sessionId);
}
