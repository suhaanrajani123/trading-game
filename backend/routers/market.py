"""
Market data endpoints. Errors from market_service are typed and turned into
the right status code by the handler in main.py (400 / 404 / 502 / 503).
"""
from typing import Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query

import market_service as market
from schemas import AssetOut, CandleOut, MarketStatusOut, QuoteOut

router = APIRouter(prefix="/market", tags=["market"])

MAX_BATCH = 50


@router.get("/quote/{symbol}", response_model=QuoteOut)
def quote(symbol: str):
    return market.get_quote(symbol)


@router.get("/quotes", response_model=Dict[str, QuoteOut])
def quotes(symbols: str = Query(..., description="Comma-separated tickers, e.g. AAPL,MSFT,SPY")):
    """One request for many symbols — used by the ticker tape and movers list."""
    wanted = [s for s in symbols.split(",") if s.strip()]
    if not wanted:
        raise HTTPException(status_code=400, detail="Pass at least one symbol.")
    if len(wanted) > MAX_BATCH:
        raise HTTPException(status_code=400, detail=f"At most {MAX_BATCH} symbols per request.")
    valid = []
    for s in wanted:
        try:
            valid.append(market.normalize_symbol(s))
        except market.InvalidSymbol:
            continue  # skip junk instead of failing the whole batch
    return market.get_quotes(valid) if valid else {}


@router.get("/history/{symbol}", response_model=List[CandleOut])
def history(
    symbol: str,
    range: Optional[str] = Query(None, description="1D, 1W, 1M, 3M, 6M, 1Y, 5Y or MAX"),
    period: Optional[str] = Query(None, include_in_schema=False),  # legacy yfinance-style param
):
    return market.get_history(symbol, market.resolve_range(range, period))


@router.get("/search", response_model=List[AssetOut])
def search(q: str = Query(..., min_length=1, max_length=40), limit: int = Query(8, ge=1, le=20)):
    return market.search_assets(q, limit)


@router.get("/status", response_model=MarketStatusOut)
def status():
    return market.market_status()
