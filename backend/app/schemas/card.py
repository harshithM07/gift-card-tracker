from __future__ import annotations
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel
from app.schemas.merchant import MerchantResponse


class CardCreate(BaseModel):
    merchant_id: uuid.UUID
    card_number: str
    pin: Optional[str] = None
    nickname: Optional[str] = None
    notes: Optional[str] = None
    initial_balance: Optional[Decimal] = None


class CardUpdate(BaseModel):
    nickname: Optional[str] = None
    notes: Optional[str] = None
    balance: Optional[Decimal] = None
    is_archived: Optional[bool] = None


class CardResponse(BaseModel):
    id: uuid.UUID
    merchant_id: uuid.UUID
    merchant: MerchantResponse
    card_number_masked: str
    nickname: Optional[str]
    notes: Optional[str]
    balance: Optional[Decimal]
    balance_updated_at: Optional[datetime]
    image_url: Optional[str]
    is_archived: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class CardDetailResponse(CardResponse):
    card_number: str
    pin: Optional[str]


class BalanceCheckResponse(BaseModel):
    balance: Optional[Decimal]
    check_url: Optional[str]
    error: Optional[str]
    source: str


class BalanceUpdateRequest(BaseModel):
    balance: Decimal
