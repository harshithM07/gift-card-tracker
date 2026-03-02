from __future__ import annotations
from typing import Optional
from app.services.merchant_apis.base import MerchantAdapter
from app.services.merchant_apis.manual import ManualAdapter
from app.services.merchant_apis.starbucks import StarbucksAdapter

ADAPTERS: dict[str, type[MerchantAdapter]] = {
    "starbucks": StarbucksAdapter,
}


def get_adapter(api_adapter: Optional[str]) -> MerchantAdapter:
    if api_adapter and api_adapter in ADAPTERS:
        return ADAPTERS[api_adapter]()
    return ManualAdapter()
