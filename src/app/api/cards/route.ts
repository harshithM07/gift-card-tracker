import { createClient } from '@/lib/supabase/server';
import { rowToCard } from '@/lib/storage';

type CreateCardBody = {
  merchant?: string;
  merchantId?: string | null;
  amount?: number;
  code?: string;
  pin?: string | null;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

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

  if (body.merchantId !== null && body.merchantId !== undefined) {
    const merchantId = body.merchantId.trim();
    if (merchantId && !isUuid(merchantId)) {
      return 'merchantId must be a valid UUID';
    }
  }

  return null;
}

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('gift_cards')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ cards: (data ?? []).map(rowToCard) });
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: CreateCardBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validationError = validateCreateBody(body);
  if (validationError) {
    return Response.json({ error: validationError }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('gift_cards')
    .insert({
      user_id: user.id,
      merchant: body.merchant!.trim(),
      merchant_id: body.merchantId ? body.merchantId.trim() : null,
      amount: body.amount!,
      code: body.code!.trim(),
      pin: body.pin ? body.pin.trim() || null : null,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ card: rowToCard(data) }, { status: 201 });
}
