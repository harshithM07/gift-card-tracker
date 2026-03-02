import { getCurrentUser } from '@/lib/auth/currentUser';
import { createCardForUser, listCards } from '@/lib/cards/store';

type CreateCardBody = {
  merchant?: string;
  amount?: number;
  code?: string;
  pin?: string | null;
};

function validateCreateBody(body: CreateCardBody): string | null {
  const merchant = body.merchant?.trim() ?? '';
  if (!merchant) return 'Merchant is required';
  if (merchant.length > 60) return 'Merchant must be 60 characters or less';

  if (typeof body.amount !== 'number' || !Number.isFinite(body.amount)) {
    return 'Amount is invalid';
  }
  if (!Number.isInteger(body.amount) || body.amount <= 0) {
    return 'Amount must be a positive integer in cents';
  }

  const code = body.code?.trim() ?? '';
  if (!code) return 'Code is required';
  if (code.length < 4 || code.length > 100) {
    return 'Code must be between 4 and 100 characters';
  }

  if (body.pin !== null && body.pin !== undefined) {
    const pin = body.pin.trim();
    if (pin && !/^\d{4,10}$/.test(pin)) {
      return 'PIN must be 4-10 digits';
    }
  }

  return null;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return Response.json({ cards: listCards(user.id) });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: CreateCardBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const error = validateCreateBody(body);
  if (error) {
    return Response.json({ error }, { status: 400 });
  }

  const card = createCardForUser(user.id, {
    merchant: body.merchant!.trim(),
    amount: body.amount!,
    code: body.code!.trim(),
    pin: body.pin ? body.pin.trim() : null,
  });

  return Response.json({ card }, { status: 201 });
}
