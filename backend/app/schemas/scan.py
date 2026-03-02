from __future__ import annotations
from typing import Optional
from pydantic import BaseModel


class ScanResponse(BaseModel):
    merchant: Optional[str]
    card_number: Optional[str]
    pin: Optional[str]
