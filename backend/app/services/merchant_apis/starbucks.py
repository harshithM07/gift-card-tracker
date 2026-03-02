from __future__ import annotations
from decimal import Decimal
from typing import Optional
import httpx
from app.services.merchant_apis.base import MerchantAdapter, BalanceResult

STARBUCKS_BALANCE_URL = "https://card.starbucks.com/CardBalance.aspx"
STARBUCKS_MANUAL_URL = "https://www.starbucks.com/gift-cards/"


class StarbucksAdapter(MerchantAdapter):
    async def check_balance(self, card_number: str, pin: Optional[str]) -> BalanceResult:
        if not pin:
            return BalanceResult(
                balance=None,
                error="PIN required to check Starbucks card balance",
                check_url=STARBUCKS_MANUAL_URL,
            )

        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                resp = await client.post(
                    STARBUCKS_BALANCE_URL,
                    data={"cardNumber": card_number, "cardPin": pin},
                    headers={"User-Agent": "Mozilla/5.0"},
                )
                if resp.status_code == 200 and "balance" in resp.text.lower():
                    return BalanceResult(balance=None, check_url=STARBUCKS_MANUAL_URL)
        except httpx.RequestError:
            pass

        return BalanceResult(balance=None, check_url=STARBUCKS_MANUAL_URL)
