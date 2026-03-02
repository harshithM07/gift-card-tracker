from __future__ import annotations
from abc import ABC, abstractmethod
from decimal import Decimal
from typing import Optional
from dataclasses import dataclass


@dataclass
class BalanceResult:
    balance: Optional[Decimal]
    error: Optional[str] = None
    check_url: Optional[str] = None


class MerchantAdapter(ABC):
    @abstractmethod
    async def check_balance(self, card_number: str, pin: Optional[str]) -> BalanceResult:
        pass
