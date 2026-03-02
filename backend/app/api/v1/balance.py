from __future__ import annotations
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.gift_card import GiftCard
from app.models.balance_history import BalanceHistory
from app.models.user import User
from app.schemas.card import BalanceCheckResponse, BalanceUpdateRequest
from app.services.encryption import decrypt
from app.services.merchant_apis import get_adapter
from app.deps import get_current_user

router = APIRouter(prefix="/cards", tags=["balance"])


@router.post("/{card_id}/check-balance", response_model=BalanceCheckResponse)
async def check_balance(
    card_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GiftCard)
        .options(selectinload(GiftCard.merchant))
        .where(GiftCard.id == card_id, GiftCard.user_id == current_user.id)
    )
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    merchant = card.merchant
    card_number = decrypt(card.card_number_enc)
    pin = decrypt(card.pin_enc) if card.pin_enc else None

    adapter = get_adapter(merchant.api_adapter)
    balance_result = await adapter.check_balance(card_number, pin)

    if balance_result.balance is not None:
        card.balance = balance_result.balance
        card.balance_updated_at = datetime.utcnow()
        history = BalanceHistory(card_id=card.id, balance=balance_result.balance, source="api")
        db.add(history)
        await db.commit()
        return BalanceCheckResponse(balance=balance_result.balance, check_url=None, error=None, source="api")

    # No API result — return the merchant's balance check URL
    return BalanceCheckResponse(
        balance=None,
        check_url=balance_result.check_url or merchant.balance_check_url,
        error=balance_result.error,
        source="manual",
    )


@router.post("/{card_id}/update-balance", response_model=BalanceCheckResponse)
async def update_balance_manually(
    card_id: uuid.UUID,
    body: BalanceUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GiftCard).where(GiftCard.id == card_id, GiftCard.user_id == current_user.id)
    )
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    card.balance = body.balance
    card.balance_updated_at = datetime.utcnow()
    history = BalanceHistory(card_id=card.id, balance=body.balance, source="manual")
    db.add(history)
    await db.commit()

    return BalanceCheckResponse(balance=body.balance, check_url=None, error=None, source="manual")
