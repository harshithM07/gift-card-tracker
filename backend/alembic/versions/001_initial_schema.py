"""initial schema

Revision ID: 001
Revises:
Create Date: 2026-03-01
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("is_admin", sa.Boolean, default=False, nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "refresh_tokens",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token", sa.Text, unique=True, nullable=False),
        sa.Column("expires_at", sa.DateTime, nullable=False),
        sa.Column("revoked", sa.Boolean, default=False, nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )
    op.create_index("ix_refresh_tokens_token", "refresh_tokens", ["token"])

    op.create_table(
        "merchants",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(100), unique=True, nullable=False),
        sa.Column("slug", sa.String(100), unique=True, nullable=False),
        sa.Column("logo_url", sa.Text, nullable=True),
        sa.Column("website_url", sa.Text, nullable=True),
        sa.Column("balance_check_url", sa.Text, nullable=True),
        sa.Column("has_api", sa.Boolean, default=False, nullable=False),
        sa.Column("api_adapter", sa.String(50), nullable=True),
        sa.Column("brand_color", sa.String(7), nullable=True),
        sa.Column("is_active", sa.Boolean, default=True, nullable=False),
    )
    op.create_index("ix_merchants_name", "merchants", ["name"])
    op.create_index("ix_merchants_slug", "merchants", ["slug"])

    op.create_table(
        "gift_cards",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("merchant_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("merchants.id"), nullable=False),
        sa.Column("card_number_enc", sa.Text, nullable=False),
        sa.Column("pin_enc", sa.Text, nullable=True),
        sa.Column("balance", sa.Numeric(10, 2), nullable=True),
        sa.Column("balance_updated_at", sa.DateTime, nullable=True),
        sa.Column("nickname", sa.String(100), nullable=True),
        sa.Column("notes", sa.Text, nullable=True),
        sa.Column("image_url", sa.Text, nullable=True),
        sa.Column("is_archived", sa.Boolean, default=False, nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )
    op.create_index("ix_gift_cards_user_id", "gift_cards", ["user_id"])

    op.create_table(
        "balance_history",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("card_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("gift_cards.id", ondelete="CASCADE"), nullable=False),
        sa.Column("balance", sa.Numeric(10, 2), nullable=False),
        sa.Column("source", sa.String(20), nullable=False),
        sa.Column("recorded_at", sa.DateTime, nullable=False),
    )
    op.create_index("ix_balance_history_card_id", "balance_history", ["card_id"])


def downgrade() -> None:
    op.drop_table("balance_history")
    op.drop_table("gift_cards")
    op.drop_table("merchants")
    op.drop_table("refresh_tokens")
    op.drop_table("users")
