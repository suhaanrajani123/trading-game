"""
Market data layer — wraps yfinance with a small in-memory TTL cache
so a classroom of students hitting the same symbol doesn't hammer
Yahoo Finance with duplicate requests.
"""
import time
import yfinance as yf
from typing import Dict, Any, List

_quote_cache: Dict[str, Dict[str, Any]] = {}
_history_cache: Dict[str, Dict[str, Any]] = {}
QUOTE_TTL = 30       # seconds
HISTORY_TTL = 300    # seconds


def get_quote(symbol: str) -> Dict[str, Any]:
    symbol = symbol.upper()
    cached = _quote_cache.get(symbol)
    if cached and (time.time() - cached["ts"]) < QUOTE_TTL:
        return cached["data"]

    ticker = yf.Ticker(symbol)
    fast = ticker.fast_info
    price = float(fast["last_price"])
    
    try:
        recent_min = ticker.history(period="1d", interval="1m")
        if not recent_min.empty:
            price = float(recent_min["Close"].iloc[-1])
    except Exception:
        pass

    prev_close = None
    for key in ("previous_close", "previousClose", "regular_market_previous_close", "regularMarketPreviousClose"):
        try:
            val = fast[key]
        except (KeyError, TypeError):
            continue
        if val:
            prev_close = float(val)
            break

    if prev_close is None or prev_close == price:
        try:
            recent = ticker.history(period="5d", interval="1d")
            if len(recent) >= 2:
                prev_close = float(recent["Close"].iloc[-2])
        except Exception:
            pass

    if prev_close is None:
        prev_close = price

    change = price - prev_close
    change_pct = (change / prev_close * 100) if prev_close else 0.0

    data = {
        "symbol": symbol,
        "price": round(price, 2),
        "change": round(change, 2),
        "change_percent": round(change_pct, 2),
        "currency": fast.get("currency", "USD"),
        "is_delayed": True,
    }
    _quote_cache[symbol] = {"data": data, "ts": time.time()}
    return data


def get_history(symbol: str, period: str = "1mo", interval: str = "1d") -> List[Dict[str, Any]]:
    symbol = symbol.upper()
    cache_key = f"{symbol}:{period}:{interval}"
    cached = _history_cache.get(cache_key)
    if cached and (time.time() - cached["ts"]) < HISTORY_TTL:
        return cached["data"]

    ticker = yf.Ticker(symbol)
    hist = ticker.history(period=period, interval=interval)

    candles = []
    for idx, row in hist.iterrows():
        candles.append({
            "time": idx.strftime("%Y-%m-%d") if interval.endswith("d") or interval.endswith("wk") or interval.endswith("mo") else idx.isoformat(),
            "open": round(float(row["Open"]), 2),
            "high": round(float(row["High"]), 2),
            "low": round(float(row["Low"]), 2),
            "close": round(float(row["Close"]), 2),
            "volume": float(row["Volume"]),
        })

    _history_cache[cache_key] = {"data": candles, "ts": time.time()}
    return candles
