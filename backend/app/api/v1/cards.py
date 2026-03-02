from __future__ import annotations
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.gift_card import GiftCard
from app.models.merchant import Merchant
from app.models.balance_history import BalanceHistory
from app.models.user import User
from app.schemas.card import CardCreate, CardUpdate, CardResponse, CardDetailResponse, BalanceUpdateRequest
from app.services.encryption import encrypt, decrypt
from app.deps import get_current_user

router = APIRouter(prefix="/cards", tags=["cards"])


def _mask_card_number(card_number: str) -> str:
    digits = card_number.replace(" ", "").replace("-", "")
    if len(digits) <= 4:
        return digits
    return "*" * (len(digits) - 4) + digits[-4:]


def _card_to_response(card: GiftCard) -> CardResponse:
    card_number = decrypt(card.card_number_enc)
    return CardResponse(
        id=card.id,
        merchant_id=card.merchant_id,
        merchant=card.merchant,
        card_number_masked=_mask_card_number(card_number),
        nickname=card.nickname,
        notes=card.notes,
        balance=card.balance,
        balance_updated_at=card.balance_updated_at,
        image_url=card.image_url,
        is_archived=card.is_archived,
        created_at=card.created_at,
    )


def _card_to_detail(card: GiftCard) -> CardDetailResponse:
    card_number = decrypt(card.card_number_enc)
    pin = decrypt(card.pin_enc) if card.pin_enc else None
    return CardDetailResponse(
        id=card.id,
        merchant_id=card.merchant_id,
        merchant=card.merchant,
        card_number_masked=_mask_card_number(card_number),
        card_number=card_number,
        pin=pin,
        nickname=card.nickname,
        notes=card.notes,
        balance=card.balance,
        balance_updated_at=card.balance_updated_at,
        image_url=card.image_url,
        is_archived=card.is_archived,
        created_at=card.created_at,
    )


@router.get("", response_model=list[CardResponse])
async def list_cards(
    include_archived: bool = False,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(GiftCard)
        .options(selectinload(GiftCard.merchant))
        .where(GiftCard.user_id == current_user.id)
    )
    if not include_archived:
        query = query.where(GiftCard.is_archived == False)
    result = await db.execute(query.order_by(GiftCard.created_at.desc()))
    cards = result.scalars().all()
    return [_card_to_response(c) for c in cards]


@router.post("", response_model=CardResponse, status_code=status.HTTP_201_CREATED)
async def create_card(
    body: CardCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify merchant exists
    result = await db.execute(select(Merchant).where(Merchant.id == body.merchant_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Merchant not found")

    card = GiftCard(
        user_id=current_user.id,
        merchant_id=body.merchant_id,
        card_number_enc=encrypt(body.card_number),
        pin_enc=encrypt(body.pin) if body.pin else None,
        nickname=body.nickname,
        notes=body.notes,
        balance=body.initial_balance,
        balance_updated_at=datetime.utcnow() if body.initial_balance is not None else None,
    )
    db.add(card)
    await db.commit()
    await db.refresh(card)

    if body.initial_balance is not None:
        history = BalanceHistory(card_id=card.id, balance=body.initial_balance, source="manual")
        db.add(history)
        await db.commit()

    # Reload with merchant
    result = await db.execute(
        select(GiftCard).options(selectinload(GiftCard.merchant)).where(GiftCard.id == card.id)
    )
    card = result.scalar_one()
    return _card_to_response(card)


@router.get("/{card_id}", response_model=CardDetailResponse)
async def get_card(
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
    return _card_to_detail(card)


@router.patch("/{card_id}", response_model=CardResponse)
async def update_card(
    card_id: uuid.UUID,
    body: CardUpdate,
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

    if body.nickname is not None:
        card.nickname = body.nickname
    if body.notes is not None:
        card.notes = body.notes
    if body.is_archived is not None:
        card.is_archived = body.is_archived
    if body.balance is not None:
        card.balance = body.balance
        card.balance_updated_at = datetime.utcnow()
        history = BalanceHistory(card_id=card.id, balance=body.balance, source="manual")
        db.add(history)

    await db.commit()
    await db.refresh(card)
    return _card_to_response(card)


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_card(
    card_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GiftCard).where(GiftCard.id == card_id, GiftCard.user_id == current_user.id)
    )
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    await db.delete(card)
    await db.commit()
