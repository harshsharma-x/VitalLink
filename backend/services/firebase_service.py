import os
import json
import logging
from typing import Optional

logger = logging.getLogger(__name__)

_initialized = False
_firebase_auth = None


def _init() -> bool:
    global _initialized, _firebase_auth
    if _initialized:
        return _firebase_auth is not None

    sa_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    if not sa_json:
        logger.info("FIREBASE_SERVICE_ACCOUNT_JSON not set — Firebase token verification disabled (dev mode)")
        _initialized = True
        return False

    try:
        import firebase_admin
        from firebase_admin import credentials, auth as fb_auth

        if not firebase_admin._apps:
            sa_dict = json.loads(sa_json)
            cred = credentials.Certificate(sa_dict)
            firebase_admin.initialize_app(cred)

        _firebase_auth = fb_auth
        _initialized = True
        logger.info("Firebase Admin SDK initialized")
        return True
    except Exception as exc:
        logger.error("Firebase Admin init failed: %s", exc)
        _initialized = True
        return False


def verify_firebase_token(id_token: str) -> Optional[str]:
    """
    Verify a Firebase Phone Auth ID token.
    Returns the phone number on success, None if verification fails or SDK not configured.
    """
    if not _init():
        return None
    try:
        decoded = _firebase_auth.verify_id_token(id_token)
        return decoded.get("phone_number")
    except Exception as exc:
        logger.warning("Firebase token verification failed: %s", exc)
        return None


def is_firebase_enabled() -> bool:
    return _init()
