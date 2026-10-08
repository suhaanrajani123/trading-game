"""
Market data layer, backed by Alpaca.

Why it's built this way:
- Quotes use Alpaca *snapshots*: one HTTP call returns the latest trade, today's
  bar and yesterday's bar for up to hundreds of symbols. The old version made two
  calls per symbol, so the ticker + top movers alone cost ~40 requests per page.
- Everything goes through a small thread-safe TTL cache, so a classroom of
  students looking at AAPL costs one Alpaca call, not thirty.
- Failures raise typed errors (not found / bad symbol / unavailable) so the API
  can return the right status code instead of a generic 404.
"""
from __future__ import annotations

import re
import threading
import time
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any, Callable, Dict, Iterable, List, Optional

import config

try:
    from alpaca.data.enums import Adjustment, DataFeed
    from alpaca.data.historical.stock import StockHistoricalDataClient
    from alpaca.data.requests import StockBarsRequest, StockSnapshotRequest
    from alpaca.data.timeframe import TimeFrame, TimeFrameUnit
    from alpaca.trading.client import TradingClient
    from alpaca.trading.enums import AssetClass, AssetStatus
    from alpaca.trading.requests import GetAssetsRequest

    HAS_ALPACA_SDK = True
except ImportError:  # pragma: no cover - only hit if requirements weren't installed
    HAS_ALPACA_SDK = False


# --------------------------------------------------------------------------- #
# Errors
# --------------------------------------------------------------------------- #
class MarketDataError(Exception):
    """Base class. `status_code` is what the API layer should return."""

    status_code = 502


class InvalidSymbol(MarketDataError):
    status_code = 400


class SymbolNotFound(MarketDataError):
    status_code = 404


class MarketDataUnavailable(MarketDataError):
    status_code = 503


# --------------------------------------------------------------------------- #
# Small thread-safe TTL cache
# --------------------------------------------------------------------------- #
class TTLCache:
    def __init__(self) -> None:
        self._data: Dict[str, tuple[float, Any]] = {}
        self._lock = threading.Lock()

    def get(self, key: str, ttl: float) -> Any:
        with self._lock:
            hit = self._data.get(key)
        if hit and time.time() - hit[0] < ttl:
            return hit[1]
        return None

    def set(self, key: str, value: Any) -> None:
        with self._lock:
            self._data[key] = (time.time(), value)

    def clear(self) -> None:
        with self._lock:
            self._data.clear()


_quotes = TTLCache()
_history = TTLCache()
_misc = TTLCache()


def clear_caches() -> None:
    _quotes.clear()
    _history.clear()
    _misc.clear()


# --------------------------------------------------------------------------- #
# Clients (created lazily so importing this module never needs network/keys)
# --------------------------------------------------------------------------- #
_data_client: Any = None
_trading_client: Any = None
_client_lock = threading.Lock()


def _require_keys() -> None:
    if not HAS_ALPACA_SDK:
        raise MarketDataUnavailable("alpaca-py is not installed. Run: pip install -r requirements.txt")
    if not config.HAS_ALPACA_KEYS:
        raise MarketDataUnavailable(
            "Market data isn't configured. Set APCA_API_KEY_ID and APCA_API_SECRET_KEY in backend/.env."
        )


def data_client() -> Any:
    global _data_client
    if _data_client is None:
        _require_keys()
        with _client_lock:
            if _data_client is None:
                _data_client = StockHistoricalDataClient(config.ALPACA_API_KEY, config.ALPACA_SECRET_KEY)
    return _data_client


def trading_client() -> Any:
    """Paper trading client — used only for read-only reference data (assets, clock)."""
    global _trading_client
    if _trading_client is None:
        _require_keys()
        with _client_lock:
            if _trading_client is None:
                _trading_client = TradingClient(config.ALPACA_API_KEY, config.ALPACA_SECRET_KEY, paper=True)
    return _trading_client


def _feed(name: str) -> Any:
    return {"iex": DataFeed.IEX, "sip": DataFeed.SIP, "delayed_sip": DataFeed.DELAYED_SIP}.get(name, DataFeed.IEX)


# --------------------------------------------------------------------------- #
# Symbols
# --------------------------------------------------------------------------- #
_SYMBOL_RE = re.compile(r"^[A-Z][A-Z0-9]{0,5}([.\-/][A-Z]{1,2})?$")


def normalize_symbol(raw: str) -> str:
    symbol = (raw or "").strip().upper().replace("-", ".")
    if not _SYMBOL_RE.match(symbol):
        raise InvalidSymbol(f"'{raw}' isn't a valid ticker symbol.")
    return symbol


# --------------------------------------------------------------------------- #
# Quotes
# --------------------------------------------------------------------------- #
def _r(value: Optional[float], digits: int = 2) -> Optional[float]:
    return None if value is None else round(float(value), digits)


def _quote_from_snapshot(symbol: str, snap: Any) -> Dict[str, Any]:
    trade = getattr(snap, "latest_trade", None)
    daily = getattr(snap, "daily_bar", None)
    prev = getattr(snap, "previous_daily_bar", None)
    minute = getattr(snap, "minute_bar", None)

    price = None
    updated = None
    if trade is not None and trade.price:
        price, updated = float(trade.price), trade.timestamp
    elif minute is not None:
        price, updated = float(minute.close), minute.timestamp
    elif daily is not None:
        price, updated = float(daily.close), daily.timestamp
    if price is None:
        raise SymbolNotFound(f"No recent trades for '{symbol}'.")

    prev_close = float(prev.close) if prev is not None else None
    change = price - prev_close if prev_close else 0.0
    change_pct = (change / prev_close * 100) if prev_close else 0.0

    return {
        "symbol": symbol,
        "name": asset_name(symbol),
        "price": round(price, 2),
        "change": round(change, 2),
        "change_percent": round(change_pct, 2),
        "prev_close": _r(prev_close),
        "open": _r(daily.open) if daily is not None else None,
        "high": _r(daily.high) if daily is not None else None,
        "low": _r(daily.low) if daily is not None else None,
        "volume": float(daily.volume) if daily is not None else None,
        "currency": "USD",
        "feed": config.ALPACA_QUOTE_FEED,
        "is_delayed": config.ALPACA_QUOTE_FEED == "delayed_sip",
        "updated_at": updated.isoformat() if updated is not None else None,
    }


def get_quotes(symbols: Iterable[str]) -> Dict[str, Dict[str, Any]]:
    """Batch quote lookup. Unknown symbols are simply missing from the result."""
    wanted = list(dict.fromkeys(normalize_symbol(s) for s in symbols))
    out: Dict[str, Dict[str, Any]] = {}
    missing: List[str] = []
    for s in wanted:
        cached = _quotes.get(s, config.QUOTE_TTL)
        if cached is not None:
            out[s] = cached
        else:
            missing.append(s)

    if missing:
        try:
            snaps = data_client().get_stock_snapshot(
                StockSnapshotRequest(symbol_or_symbols=missing, feed=_feed(config.ALPACA_QUOTE_FEED))
            )
        except MarketDataError:
            raise
        except Exception as exc:  # network errors, auth errors, invalid symbol lists
            err = _translate(exc, missing[0])
            if isinstance(err, MarketDataUnavailable) or len(missing) == 1:
                raise err from exc
            # Alpaca rejects the *whole* batch if one symbol is malformed for it;
            # retry one at a time so a single bad ticker can't blank the ticker tape.
            for s in missing:
                try:
                    out.update(get_quotes([s]))
                except MarketDataUnavailable:
                    raise
                except MarketDataError:
                    continue
            return {s: out[s] for s in wanted if s in out}

        for s in missing:
            snap = snaps.get(s) if isinstance(snaps, dict) else None
            if snap is None:
                continue
            try:
                quote = _quote_from_snapshot(s, snap)
            except SymbolNotFound:
                continue
            _quotes.set(s, quote)
            out[s] = quote

    return {s: out[s] for s in wanted if s in out}


def get_quote(symbol: str) -> Dict[str, Any]:
    symbol = normalize_symbol(symbol)
    quote = get_quotes([symbol]).get(symbol)
    if quote is None:
        raise SymbolNotFound(f"Couldn't find a price for '{symbol}'. Check the ticker symbol.")
    return quote


def _translate(exc: Exception, symbol: str) -> MarketDataError:
    """Map SDK / network exceptions onto our typed errors."""
    status = getattr(exc, "status_code", None)
    if status is None and getattr(exc, "response", None) is not None:
        status = getattr(exc.response, "status_code", None)
    text = str(exc).lower()

    if status is None and _is_network_error(exc):
        return MarketDataUnavailable("Couldn't reach Alpaca. Check your internet connection and try again.")
    if status in (401, 403):
        return MarketDataUnavailable("Alpaca rejected the API keys. Check APCA_API_KEY_ID / APCA_API_SECRET_KEY.")
    if status == 429 or "rate limit" in text:
        return MarketDataUnavailable("Market data rate limit hit. Try again in a few seconds.")
    if status in (400, 404, 422) or "invalid symbol" in text:
        return SymbolNotFound(f"Couldn't find '{symbol}'. Check the ticker symbol.")
    return MarketDataError(f"Market data provider error for '{symbol}'.")


def _is_network_error(exc: Exception) -> bool:
    try:
        import requests

        return isinstance(exc, (requests.exceptions.ConnectionError, requests.exceptions.Timeout))
    except ImportError:  # pragma: no cover
        return False


# --------------------------------------------------------------------------- #
# History
# --------------------------------------------------------------------------- #
@dataclass(frozen=True)
class RangeSpec:
    lookback: timedelta
    amount: int
    unit: str  # "Min" | "Hour" | "Day" | "Week" | "Month"
    intraday: bool
    last_session_only: bool = False


RANGES: Dict[str, RangeSpec] = {
    "1D": RangeSpec(timedelta(days=5), 5, "Min", True, last_session_only=True),
    "1W": RangeSpec(timedelta(days=7), 30, "Min", True),
    "1M": RangeSpec(timedelta(days=31), 1, "Day", False),
    "3M": RangeSpec(timedelta(days=92), 1, "Day", False),
    "6M": RangeSpec(timedelta(days=183), 1, "Day", False),
    "1Y": RangeSpec(timedelta(days=366), 1, "Day", False),
    "5Y": RangeSpec(timedelta(days=5 * 366), 1, "Week", False),
    "MAX": RangeSpec(timedelta(days=11 * 366), 1, "Month", False),  # Alpaca data begins 2016
}

# Old yfinance-style `period` values the previous frontend sent.
LEGACY_PERIODS = {"1d": "1D", "5d": "1W", "1mo": "1M", "3mo": "3M", "6mo": "6M", "1y": "1Y", "5y": "5Y", "max": "MAX"}


def resolve_range(range_: Optional[str], period: Optional[str] = None) -> str:
    if range_ and range_.upper() in RANGES:
        return range_.upper()
    if period and period.lower() in LEGACY_PERIODS:
        return LEGACY_PERIODS[period.lower()]
    return "1M"


def _timeframe(spec: RangeSpec) -> Any:
    unit = getattr(TimeFrameUnit, {"Min": "Minute", "Hour": "Hour", "Day": "Day", "Week": "Week", "Month": "Month"}[spec.unit])
    return TimeFrame(spec.amount, unit)


def _fetch_bars(symbol: str, spec: RangeSpec, feed_name: str) -> List[Any]:
    now = datetime.now(timezone.utc)
    # Free plans may only read SIP data that's at least 15 minutes old.
    end = now - timedelta(minutes=16) if feed_name == "sip" else now
    req = StockBarsRequest(
        symbol_or_symbols=symbol,
        timeframe=_timeframe(spec),
        start=now - spec.lookback,
        end=end,
        adjustment=Adjustment.ALL,  # split/dividend adjusted, so splits don't look like crashes
        feed=_feed(feed_name),
    )
    result = data_client().get_stock_bars(req)
    data = getattr(result, "data", result) or {}
    return list(data.get(symbol, []))


def get_history(symbol: str, range_: str = "1M") -> List[Dict[str, Any]]:
    symbol = normalize_symbol(symbol)
    range_ = resolve_range(range_)
    key = f"{symbol}:{range_}"
    cached = _history.get(key, config.HISTORY_TTL)
    if cached is not None:
        return cached

    spec = RANGES[range_]
    feeds = [config.ALPACA_HISTORY_FEED]
    if config.ALPACA_HISTORY_FEED != "iex":
        feeds.append("iex")

    bars: List[Any] = []
    last_error: Optional[Exception] = None
    for feed_name in feeds:
        try:
            bars = _fetch_bars(symbol, spec, feed_name)
            last_error = None
            break
        except MarketDataError:
            raise
        except Exception as exc:
            last_error = exc
    if last_error is not None:
        raise _translate(last_error, symbol) from last_error

    if spec.last_session_only and bars:
        last_day = _session_date(bars[-1].timestamp)
        bars = [b for b in bars if _session_date(b.timestamp) == last_day]

    candles = [
        {
            # Intraday: unix seconds (UTC). Daily+: "YYYY-MM-DD" business-day strings.
            "time": int(b.timestamp.timestamp()) if spec.intraday else b.timestamp.strftime("%Y-%m-%d"),
            "open": round(float(b.open), 2),
            "high": round(float(b.high), 2),
            "low": round(float(b.low), 2),
            "close": round(float(b.close), 2),
            "volume": float(b.volume),
        }
        for b in bars
    ]
    if not candles:
        raise SymbolNotFound(f"No price history for '{symbol}'.")

    _history.set(key, candles)
    return candles


def _session_date(ts: datetime) -> str:
    # US market sessions fit inside a single UTC-4/5 calendar day; shifting by
    # 5 hours puts every bar of a session on the same date without needing tzdata.
    return (ts - timedelta(hours=5)).strftime("%Y-%m-%d")


# --------------------------------------------------------------------------- #
# Assets (names + search) and market clock
# --------------------------------------------------------------------------- #
_assets_lock = threading.Lock()


def _load_assets() -> List[Dict[str, str]]:
    cached = _misc.get("assets", config.ASSETS_TTL)
    if cached is not None:
        return cached
    with _assets_lock:
        cached = _misc.get("assets", config.ASSETS_TTL)
        if cached is not None:
            return cached
        raw = trading_client().get_all_assets(
            GetAssetsRequest(status=AssetStatus.ACTIVE, asset_class=AssetClass.US_EQUITY)
        )
        assets = [
            {"symbol": a.symbol, "name": _clean_name(a.name or ""), "exchange": str(getattr(a.exchange, "value", a.exchange))}
            for a in raw
            if getattr(a, "tradable", True) and a.symbol
        ]
        assets.sort(key=lambda a: a["symbol"])
        _misc.set("assets", assets)
        _misc.set("asset_index", {a["symbol"]: a["name"] for a in assets})
        return assets


_NAME_NOISE = re.compile(r"\s+(Common Stock|Class [A-C] Common Stock|Ordinary Shares|Common Shares|American Depositary Shares.*)$", re.I)


def _clean_name(name: str) -> str:
    return _NAME_NOISE.sub("", name).strip()


def warm_assets() -> None:
    """Called at startup in a background thread so the first search is instant."""
    try:
        _load_assets()
    except Exception as exc:  # never crash startup over reference data
        print(f"[market] asset list not loaded: {exc}")


def asset_name(symbol: str) -> Optional[str]:
    """Name lookup that never triggers a network call (uses whatever is cached)."""
    index = _misc.get("asset_index", config.ASSETS_TTL)
    return index.get(symbol) if index else None


def search_assets(query: str, limit: int = 8) -> List[Dict[str, str]]:
    q = (query or "").strip().upper()
    if not q:
        return []
    assets = _load_assets()
    exact, prefix, name_hits = [], [], []
    for a in assets:
        sym, name = a["symbol"], a["name"].upper()
        if sym == q:
            exact.append(a)
        elif sym.startswith(q):
            prefix.append(a)
        elif len(q) >= 2 and q in name:
            name_hits.append(a)
    prefix.sort(key=lambda a: len(a["symbol"]))
    name_hits.sort(key=lambda a: (not a["name"].upper().startswith(q), len(a["symbol"])))
    return (exact + prefix + name_hits)[:limit]


def market_status() -> Dict[str, Any]:
    cached = _misc.get("clock", config.CLOCK_TTL)
    if cached is not None:
        return cached
    try:
        clock = trading_client().get_clock()
        status = {
            "is_open": bool(clock.is_open),
            "next_open": clock.next_open.isoformat() if clock.next_open else None,
            "next_close": clock.next_close.isoformat() if clock.next_close else None,
        }
    except MarketDataError:
        raise
    except Exception as exc:
        raise _translate(exc, "clock") from exc
    _misc.set("clock", status)
    return status


def run_in_background(fn: Callable[[], None]) -> None:
    threading.Thread(target=fn, daemon=True).start()
