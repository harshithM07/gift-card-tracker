from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, RefreshRequest, UserResponse
from app.services import auth_service
from app.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(email=body.email, password_hash=auth_service.hash_password(body.password))
    db.add(user)
    await db.commit()
    await db.refresh(user)

    access_token = auth_service.create_access_token(user.id)
    refresh_token = auth_service.create_refresh_token()
    await auth_service.store_refresh_token(db, user.id, refresh_token)

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user or not auth_service.verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = auth_service.create_access_token(user.id)
    refresh_token = auth_service.create_refresh_token()
    await auth_service.store_refresh_token(db, user.id, refresh_token)

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    rt = await auth_service.get_valid_refresh_token(db, body.refresh_token)
    if not rt:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    await auth_service.revoke_refresh_token(db, body.refresh_token)

    access_token = auth_service.create_access_token(rt.user_id)
    new_refresh_token = auth_service.create_refresh_token()
    await auth_service.store_refresh_token(db, rt.user_id, new_refresh_token)

    return TokenResponse(access_token=access_token, refresh_token=new_refresh_token)


@router.post("/logout")
async def logout(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    await auth_service.revoke_refresh_token(db, body.refresh_token)
    return {"message": "Logged out"}


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return UserResponse(id=str(current_user.id), email=current_user.email, is_admin=current_user.is_admin)
