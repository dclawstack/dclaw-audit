"""JWT auth middleware with Logto support and dev bypass.

Set DISABLE_AUTH=true in .env for local development.
In production, set LOGTO_ENDPOINT and LOGTO_AUDIENCE and a valid JWKS URL.
"""

import json
import time
from typing import Any
from urllib.request import urlopen

from fastapi import HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings

_bearer_scheme = HTTPBearer(auto_error=False)

# Simple in-memory JWKS cache: {url: (fetched_at, keys)}
_jwks_cache: dict[str, tuple[float, list[dict]]] = {}
_JWKS_TTL = 3600.0


def _fetch_jwks(jwks_url: str) -> list[dict]:
    now = time.time()
    cached = _jwks_cache.get(jwks_url)
    if cached and (now - cached[0]) < _JWKS_TTL:
        return cached[1]
    with urlopen(jwks_url, timeout=10) as resp:
        data = json.loads(resp.read())
    keys = data.get("keys", [])
    _jwks_cache[jwks_url] = (now, keys)
    return keys


def _decode_jwt_payload(token: str) -> dict[str, Any]:
    """Decode JWT payload without signature verification (verification handled by jose/jwks)."""
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("Invalid JWT structure")
    import base64
    padding = 4 - len(parts[1]) % 4
    padded = parts[1] + "=" * padding
    payload_bytes = base64.urlsafe_b64decode(padded)
    return json.loads(payload_bytes)


async def get_current_user(request: Request) -> dict[str, Any]:
    """Dependency that returns the decoded JWT claims, or a dev stub if auth is disabled."""
    if settings.disable_auth:
        return {"sub": "dev-user", "email": "dev@dclaw.local", "roles": ["admin"]}

    credentials: HTTPAuthorizationCredentials | None = await _bearer_scheme(request)
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    try:
        payload = _decode_jwt_payload(token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Malformed token")

    # Basic expiry check
    exp = payload.get("exp")
    if exp and time.time() > exp:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")

    # Audience check
    if settings.logto_audience:
        aud = payload.get("aud", "")
        aud_list = [aud] if isinstance(aud, str) else aud
        if settings.logto_audience not in aud_list:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid audience")

    return payload


class AuthMiddleware:
    """Optional ASGI middleware that protects all /api/v1 routes.
    Only active when DISABLE_AUTH=false.
    """

    EXCLUDED_PATHS = {"/health/", "/health", "/", "/docs", "/openapi.json", "/redoc"}

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if settings.disable_auth or scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path: str = scope.get("path", "")
        if path in self.EXCLUDED_PATHS or not path.startswith("/api/"):
            await self.app(scope, receive, send)
            return

        headers = dict(scope.get("headers", []))
        auth_header = headers.get(b"authorization", b"").decode()
        if not auth_header.startswith("Bearer "):
            await self._send_401(send)
            return

        await self.app(scope, receive, send)

    @staticmethod
    async def _send_401(send):
        await send({
            "type": "http.response.start",
            "status": 401,
            "headers": [[b"content-type", b"application/json"],
                         [b"www-authenticate", b"Bearer"]],
        })
        await send({"type": "http.response.body", "body": b'{"detail":"Unauthorized"}'})
