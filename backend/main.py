"""
Tradepath API.  Run locally with:  uvicorn main:app --reload --port 8000
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import config
import market_service as market
from database import init_db
from routers import game, market as market_router, orders, portfolio


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    if config.HAS_ALPACA_KEYS:
        # Pre-load the ~11k US ticker list so the first search is instant.
        market.run_in_background(market.warm_assets)
    else:
        print("[startup] APCA_API_KEY_ID / APCA_API_SECRET_KEY not set — market data endpoints will return 503.")
    yield


app = FastAPI(title="Tradepath API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", *config.FRONTEND_ORIGINS],
    allow_origin_regex=r"https://.*\.vercel\.app",  # Vercel preview + production URLs
    allow_credentials=False,  # auth is a header, not cookies
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "X-User-ID"],
)


@app.exception_handler(market.MarketDataError)
async def market_error_handler(_: Request, exc: market.MarketDataError):
    return JSONResponse(status_code=exc.status_code, content={"detail": str(exc)})


app.include_router(market_router.router)
app.include_router(portfolio.router)
app.include_router(orders.router)
app.include_router(game.router)


@app.get("/", tags=["meta"])
def root():
    return {"status": "ok", "service": "tradepath-api", "docs": "/docs"}


@app.get("/health", tags=["meta"])
def health():
    return {
        "status": "ok",
        "market_data": "configured" if config.HAS_ALPACA_KEYS else "missing_keys",
        "quote_feed": config.ALPACA_QUOTE_FEED,
    }
