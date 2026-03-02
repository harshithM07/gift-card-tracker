from __future__ import annotations
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.merchant import Merchant
from app.models.user import User
from app.schemas.merchant import MerchantResponse, MerchantCreate, MerchantUpdate
from app.deps import get_admin_user

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/merchants", response_model=list[MerchantResponse])
async def admin_list_merchants(
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Merchant).order_by(Merchant.name))
    return result.scalars().all()


@router.post("/merchants", response_model=MerchantResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_merchant(
    body: MerchantCreate,
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    merchant = Merchant(**body.model_dump())
    db.add(merchant)
    await db.commit()
    await db.refresh(merchant)
    return merchant


@router.patch("/merchants/{merchant_id}", response_model=MerchantResponse)
async def admin_update_merchant(
    merchant_id: uuid.UUID,
    body: MerchantUpdate,
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Merchant).where(Merchant.id == merchant_id))
    merchant = result.scalar_one_or_none()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(merchant, field, value)

    await db.commit()
    await db.refresh(merchant)
    return merchant


@router.delete("/merchants/{merchant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_merchant(
    merchant_id: uuid.UUID,
    _: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Merchant).where(Merchant.id == merchant_id))
    merchant = result.scalar_one_or_none()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    await db.delete(merchant)
    await db.commit()
