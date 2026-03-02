import base64
import json
import re
import anthropic
from app.config import get_settings


async def scan_gift_card_image(image_bytes: bytes, media_type: str = "image/jpeg") -> dict:
    """
    Send a gift card image to Claude and extract card details.
    Returns: {merchant, card_number, pin} — all values may be None if not found.
    """
    settings = get_settings()
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    image_b64 = base64.standard_b64encode(image_bytes).decode()

    message = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=512,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": image_b64,
                        },
                    },
                    {
                        "type": "text",
                        "text": (
                            "This is a gift card image. Extract the following details if visible:\n"
                            "1. Merchant/brand name\n"
                            "2. Gift card number (often 16-19 digits, may have dashes)\n"
                            "3. PIN or access code (usually 4-8 digits, labeled PIN, Access Code, Security Code, etc.)\n\n"
                            "Respond ONLY with a JSON object in this exact format (use null for missing fields):\n"
                            '{"merchant": "...", "card_number": "...", "pin": "..."}'
                        ),
                    },
                ],
            }
        ],
    )

    raw = message.content[0].text.strip()
    # Extract JSON even if Claude wraps it in markdown code fences
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        return {"merchant": None, "card_number": None, "pin": None}

    try:
        data = json.loads(match.group())
        return {
            "merchant": data.get("merchant"),
            "card_number": data.get("card_number"),
            "pin": data.get("pin"),
        }
    except json.JSONDecodeError:
        return {"merchant": None, "card_number": None, "pin": None}
