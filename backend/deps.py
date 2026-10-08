"""
Shared request dependencies.

There are no accounts: the browser generates a random device ID once and sends
it as the X-User-ID header. That ID *is* the player.
"""
import re

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

import models
from database import get_db
from trading import get_or_create_user

_USER_ID_RE = re.compile(r"^[A-Za-z0-9_-]{6,64}$")


def current_user(
    x_user_id: str | None = Header(default=None, alias="X-User-ID"),
    db: Session = Depends(get_db),
) -> models.User:
    if not x_user_id or not _USER_ID_RE.match(x_user_id):
        raise HTTPException(status_code=401, detail="Missing or invalid X-User-ID header.")
    return get_or_create_user(db, x_user_id)
