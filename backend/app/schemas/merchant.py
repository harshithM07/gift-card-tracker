from __future__ import annotations
import uuid
from typing import Optional
from pydantic import BaseModel


class MerchantResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    logo_url: Optional[str]
    website_url: Optional[str]
    balance_check_url: Optional[str]
    has_api: bool
    brand_color: Optional[str]
    is_active: bool

    model_config = {"from_attributes": True}


class MerchantCreate(BaseModel):
    name: str
    slug: str
    logo_url: Optional[str] = None
    website_url: Optional[str] = None
    balance_check_url: Optional[str] = None
    has_api: bool = False
    api_adapter: Optional[str] = None
    brand_color: Optional[str] = None
    is_active: bool = True


class MerchantUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    logo_url: Optional[str] = None
    website_url: Optional[str] = None
    balance_check_url: Optional[str] = None
    has_api: Optional[bool] = None
    api_adapter: Optional[str] = None
    brand_color: Optional[str] = None
    is_active: Optional[bool] = None
