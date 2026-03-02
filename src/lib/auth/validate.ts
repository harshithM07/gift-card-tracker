export function validateCredentials(email: string, password: string): string | null {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return 'Email is invalid';

  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 72) return 'Password must be 72 characters or less';

  return null;
}
