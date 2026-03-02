from __future__ import annotations
from typing import Optional
from app.services.merchant_apis.base import MerchantAdapter, BalanceResult


class ManualAdapter(MerchantAdapter):
    """Fallback for merchants with no API — signals the client to open browser."""

    async def check_balance(self, card_number: str, pin: Optional[str]) -> BalanceResult:
        return BalanceResult(
            balance=None,
            error=None,
            check_url=None,  # The merchant's balance_check_url from DB is used by the API route
        )
