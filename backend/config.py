"""
Central configuration. Every setting comes from an environment variable so the
same code runs locally (values from backend/.env) and on Render (values from the
dashboard). Nothing else in the app should call os.getenv directly.
"""
import os
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent

# Local dev: load backend/.env first, then a repo-root .env as a fallback.
# Real environment variables always win over values in these files.
load_dotenv(BACKEND_DIR / ".env")
load_dotenv(BACKEND_DIR.parent / ".env")


def _first_env(*names: str, default: str = "") -> str:
    for name in names:
        value = os.getenv(name, "").strip()
        if value:
            return value
    return default


# --- Alpaca -----------------------------------------------------------------
# Accepts both the official APCA_* names and the friendlier ALPACA_* names.
ALPACA_API_KEY = _first_env("APCA_API_KEY_ID", "ALPACA_API_KEY")
ALPACA_SECRET_KEY = _first_env("APCA_API_SECRET_KEY", "ALPACA_SECRET_KEY")

# "iex" works on Alpaca's free plan and is real-time (IEX exchange only).
# Paid plans can switch to "sip" for consolidated data from every exchange.
ALPACA_QUOTE_FEED = _first_env("ALPACA_QUOTE_FEED", default="iex").lower()

# Historical candles: SIP data older than 15 minutes is free and has full
# market volume, so it's the better default for charts. Falls back to IEX
# automatically if the account can't access it.
ALPACA_HISTORY_FEED = _first_env("ALPACA_HISTORY_FEED", default="sip").lower()

HAS_ALPACA_KEYS = bool(ALPACA_API_KEY and ALPACA_SECRET_KEY)

# --- Cache TTLs (seconds) ---------------------------------------------------
QUOTE_TTL = int(_first_env("QUOTE_TTL", default="15"))
HISTORY_TTL = int(_first_env("HISTORY_TTL", default="300"))
ASSETS_TTL = int(_first_env("ASSETS_TTL", default=str(24 * 3600)))
CLOCK_TTL = int(_first_env("CLOCK_TTL", default="60"))

# --- Game -------------------------------------------------------------------
STARTING_CASH = float(_first_env("STARTING_CASH", default="100000"))

# --- Database ---------------------------------------------------------------
DATABASE_URL = _first_env("DATABASE_URL", default=f"sqlite:///{BACKEND_DIR / 'trading_game.db'}")

# --- CORS -------------------------------------------------------------------
# Comma-separated, e.g. "https://tradepath.vercel.app,http://localhost:3000"
FRONTEND_ORIGINS = [
    o.strip()
    for o in _first_env("FRONTEND_ORIGINS", default="").split(",")
    if o.strip()
]
