from __future__ import annotations
import uuid
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

if TYPE_CHECKING:
    from app.models.gift_card import GiftCard


class Merchant(Base):
    __tablename__ = "merchants"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    logo_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    website_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    balance_check_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    has_api: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    api_adapter: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    brand_color: Mapped[Optional[str]] = mapped_column(String(7), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    cards: Mapped[list[GiftCard]] = relationship("GiftCard", back_populates="merchant", lazy="select")
