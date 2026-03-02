from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.merchant import Merchant
from app.schemas.merchant import MerchantResponse

router = APIRouter(prefix="/merchants", tags=["merchants"])


@router.get("", response_model=list[MerchantResponse])
async def list_merchants(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Merchant).where(Merchant.is_active == True).order_by(Merchant.name))
    return result.scalars().all()


@router.get("/{merchant_id}", response_model=MerchantResponse)
async def get_merchant(merchant_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Merchant).where(Merchant.id == merchant_id))
    merchant = result.scalar_one_or_none()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    return merchant
