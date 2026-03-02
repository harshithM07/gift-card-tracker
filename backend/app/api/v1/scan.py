from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from app.schemas.scan import ScanResponse
from app.services.ai_scanner import scan_gift_card_image
from app.models.user import User
from app.deps import get_current_user

router = APIRouter(prefix="/scan", tags=["scan"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


@router.post("", response_model=ScanResponse)
async def scan_card(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported image type: {file.content_type}")

    image_bytes = await file.read()
    if len(image_bytes) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Image too large (max 10 MB)")

    result = await scan_gift_card_image(image_bytes, media_type=file.content_type)
    return ScanResponse(**result)
