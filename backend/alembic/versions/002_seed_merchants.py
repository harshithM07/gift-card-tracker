"""seed priority merchants

Revision ID: 002
Revises: 001
Create Date: 2026-03-01
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
import uuid
from datetime import datetime

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

MERCHANTS = [
    {
        "id": str(uuid.uuid4()),
        "name": "Amazon",
        "slug": "amazon",
        "logo_url": None,
        "website_url": "https://www.amazon.com",
        "balance_check_url": "https://www.amazon.com/gc/redeem",
        "has_api": False,
        "api_adapter": None,
        "brand_color": "#FF9900",
        "is_active": True,
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Starbucks",
        "slug": "starbucks",
        "logo_url": None,
        "website_url": "https://www.starbucks.com",
        "balance_check_url": "https://www.starbucks.com/account/card",
        "has_api": True,
        "api_adapter": "starbucks",
        "brand_color": "#00704A",
        "is_active": True,
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Target",
        "slug": "target",
        "logo_url": None,
        "website_url": "https://www.target.com",
        "balance_check_url": "https://www.target.com/gift-cards/check-balance",
        "has_api": False,
        "api_adapter": None,
        "brand_color": "#CC0000",
        "is_active": True,
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Walmart",
        "slug": "walmart",
        "logo_url": None,
        "website_url": "https://www.walmart.com",
        "balance_check_url": "https://www.walmart.com/gift-cards/check-balance",
        "has_api": False,
        "api_adapter": None,
        "brand_color": "#0071CE",
        "is_active": True,
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Apple",
        "slug": "apple",
        "logo_url": None,
        "website_url": "https://www.apple.com",
        "balance_check_url": "https://checkbalance.apple.com",
        "has_api": False,
        "api_adapter": None,
        "brand_color": "#000000",
        "is_active": True,
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Google Play",
        "slug": "google-play",
        "logo_url": None,
        "website_url": "https://play.google.com",
        "balance_check_url": "https://play.google.com/store/account/redemption",
        "has_api": False,
        "api_adapter": None,
        "brand_color": "#01875F",
        "is_active": True,
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Best Buy",
        "slug": "best-buy",
        "logo_url": None,
        "website_url": "https://www.bestbuy.com",
        "balance_check_url": "https://www.bestbuy.com/gift-card-balance",
        "has_api": False,
        "api_adapter": None,
        "brand_color": "#003087",
        "is_active": True,
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Uber",
        "slug": "uber",
        "logo_url": None,
        "website_url": "https://www.uber.com",
        "balance_check_url": "https://www.uber.com/gift-cards",
        "has_api": False,
        "api_adapter": None,
        "brand_color": "#000000",
        "is_active": True,
    },
    {
        "id": str(uuid.uuid4()),
        "name": "DoorDash",
        "slug": "doordash",
        "logo_url": None,
        "website_url": "https://www.doordash.com",
        "balance_check_url": "https://www.doordash.com/gift-cards",
        "has_api": False,
        "api_adapter": None,
        "brand_color": "#FF3008",
        "is_active": True,
    },
    {
        "id": str(uuid.uuid4()),
        "name": "Visa",
        "slug": "visa",
        "logo_url": None,
        "website_url": "https://www.visa.com",
        "balance_check_url": "https://www.myvanillacard.com",
        "has_api": False,
        "api_adapter": None,
        "brand_color": "#1A1F71",
        "is_active": True,
    },
]


def upgrade() -> None:
    merchants_table = sa.table(
        "merchants",
        sa.column("id", sa.String),
        sa.column("name", sa.String),
        sa.column("slug", sa.String),
        sa.column("logo_url", sa.String),
        sa.column("website_url", sa.String),
        sa.column("balance_check_url", sa.String),
        sa.column("has_api", sa.Boolean),
        sa.column("api_adapter", sa.String),
        sa.column("brand_color", sa.String),
        sa.column("is_active", sa.Boolean),
    )
    op.bulk_insert(merchants_table, MERCHANTS)


def downgrade() -> None:
    op.execute("DELETE FROM merchants WHERE slug IN ('amazon','starbucks','target','walmart','apple','google-play','best-buy','uber','doordash','visa')")
