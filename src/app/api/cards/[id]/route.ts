import { getCurrentUser } from '@/lib/auth/currentUser';
import { deleteCardForUser, updateCardForUser } from '@/lib/cards/store';

type UpdateCardBody = {
  merchant?: string;
  amount?: number;
  code?: string;
  pin?: string | null;
};

function validateUpdateBody(body: UpdateCardBody): string | null {
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  let body: UpdateCardBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const error = validateUpdateBody(body);
  if (error) {
    return Response.json({ error }, { status: 400 });
  }

  const card = updateCardForUser(user.id, id, {
    merchant: body.merchant!.trim(),
    amount: body.amount!,
    code: body.code!.trim(),
    pin: body.pin ? body.pin.trim() : null,
  });

  if (!card) {
    return Response.json({ error: 'Card not found' }, { status: 404 });
  }

  return Response.json({ card });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const deleted = deleteCardForUser(user.id, id);
  if (!deleted) {
    return Response.json({ error: 'Card not found' }, { status: 404 });
  }

  return Response.json({ ok: true });
}
