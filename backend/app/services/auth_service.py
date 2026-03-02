from __future__ import annotations
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.config import get_settings
from app.models.user import User, RefreshToken

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: uuid.UUID) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode(
        {"sub": str(user_id), "exp": expire, "type": "access"},
        settings.secret_key,
        algorithm=settings.algorithm,
    )


def create_refresh_token() -> str:
    return uuid.uuid4().hex + uuid.uuid4().hex


def decode_access_token(token: str) -> uuid.UUID:
    payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    if payload.get("type") != "access":
        raise JWTError("Not an access token")
    return uuid.UUID(payload["sub"])


async def store_refresh_token(db: AsyncSession, user_id: uuid.UUID, token: str) -> RefreshToken:
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    rt = RefreshToken(user_id=user_id, token=token, expires_at=expires_at)
    db.add(rt)
    await db.commit()
    await db.refresh(rt)
    return rt


async def get_valid_refresh_token(db: AsyncSession, token: str) -> Optional[RefreshToken]:
    result = await db.execute(select(RefreshToken).where(RefreshToken.token == token))
    rt = result.scalar_one_or_none()
    if not rt or rt.revoked or rt.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        return None
    return rt


async def revoke_refresh_token(db: AsyncSession, token: str) -> None:
    result = await db.execute(select(RefreshToken).where(RefreshToken.token == token))
    rt = result.scalar_one_or_none()
    if rt:
        rt.revoked = True
        await db.commit()
