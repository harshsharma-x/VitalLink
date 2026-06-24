from __future__ import annotations

import logging
from typing import Dict, List, Optional

import httpx

logger = logging.getLogger(__name__)

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


def _send_expo_push(messages: List[Dict]) -> None:
    if not messages:
        return
    try:
        with httpx.Client(timeout=10) as client:
            resp = client.post(
                EXPO_PUSH_URL,
                json=messages,
                headers={"Accept": "application/json", "Content-Type": "application/json"},
            )
            resp.raise_for_status()
            data = resp.json()
            for item in data.get("data", []):
                if item.get("status") == "error":
                    logger.warning("Expo push error: %s", item.get("message"))
    except Exception as exc:
        logger.error("Failed to send Expo push: %s", exc)


def send_push(push_token: Optional[str], title: str, body: str, data: Optional[Dict] = None) -> None:
    if not push_token or not push_token.startswith("ExponentPushToken"):
        logger.debug("No valid push token — skipping push to %s", push_token)
        return
    _send_expo_push([{
        "to": push_token,
        "title": title,
        "body": body,
        "data": data or {},
        "sound": "default",
        "priority": "high",
        "channelId": "emergency",
    }])


def alert_donor(push_token: Optional[str], blood_group: str, hospital: str, request_id: str, match_id: str) -> None:
    send_push(
        push_token,
        title=f"🩸 Emergency: {blood_group} blood needed NOW",
        body=f"{hospital} · Tap to respond",
        data={
            "type": "emergency_alert",
            "request_id": request_id,
            "match_id": match_id,
            "blood_group": blood_group,
            "hospital": hospital,
        },
    )


def send_sms(phone: str, message: str) -> None:
    logger.info("[SMS] To: %s  Msg: %s", phone, message)


notification_service = type("_NS", (), {
    "send_push": staticmethod(send_push),
    "alert_donor": staticmethod(alert_donor),
    "send_sms": staticmethod(send_sms),
})()
