from fastapi import APIRouter
from app.api.v1 import auth, merchants, cards, balance, scan, admin

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(merchants.router)
router.include_router(cards.router)
router.include_router(balance.router)
router.include_router(scan.router)
router.include_router(admin.router)
