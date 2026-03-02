from __future__ import annotations
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Text, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.merchant import Merchant
    from app.models.balance_history import BalanceHistory


class GiftCard(Base):
    __tablename__ = "gift_cards"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    merchant_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("merchants.id"), nullable=False)
    card_number_enc: Mapped[str] = mapped_column(Text, nullable=False)
    pin_enc: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    balance: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    balance_updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    nickname: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user: Mapped[User] = relationship("User", back_populates="cards")
    merchant: Mapped[Merchant] = relationship("Merchant", back_populates="cards")
    balance_history: Mapped[list[BalanceHistory]] = relationship("BalanceHistory", back_populates="card", lazy="select")
