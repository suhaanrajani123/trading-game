"""
Account value over time, rebuilt from the player's own fills plus real
historical prices — so the chart works for existing accounts with no extra
tracking, and stays correct after limit orders fill later.

For each point on the market calendar (SPY's bars for the chosen range):
    value = cash at that moment + sum(shares held x that stock's price then)
The last point is "now", priced with live quotes, so the chart always ends at
exactly the account value shown on the dashboard.
"""
from __future__ import annotations

from bisect import bisect_right
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional, Tuple, Union

from sqlalchemy.orm import Session

import config
import market_service as market
import models
from trading import EPSILON, build_portfolio

CALENDAR_SYMBOL = "SPY"
RANGES = ("1D", "1W", "1M", "3M", "1Y", "ALL")

TimeKey = Union[int, str]


def _aware(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def _pick_market_range(range_: str, started_at: datetime) -> str:
    """Map a chart range onto the bar resolution the market service offers."""
    if range_ != "ALL":
        return range_
    age = datetime.now(timezone.utc) - started_at
    if age <= timedelta(days=1):
        return "1D"
    if age <= timedelta(days=7):
        return "1W"
    if age <= timedelta(days=31):
        return "1M"
    if age <= timedelta(days=366):
        return "1Y"
    return "5Y"


def _key_for(dt: datetime, intraday: bool) -> TimeKey:
    return int(dt.timestamp()) if intraday else market._session_date(dt)


def build_history(db: Session, user: models.User, range_: str = "ALL") -> Dict:
    range_ = range_.upper() if range_ and range_.upper() in RANGES else "ALL"

    fills: List[models.Order] = (
        db.query(models.Order)
        .filter(models.Order.user_id == user.id, models.Order.status == "filled")
        .all()
    )
    fills = [f for f in fills if (f.filled_at or f.timestamp) is not None]
    fills.sort(key=lambda o: (_aware(o.filled_at or o.timestamp), o.id))

    started_at = _aware(user.started_at) or _aware(user.created_at)
    if fills:
        first_fill = _aware(fills[0].filled_at or fills[0].timestamp)
        started_at = min(started_at, first_fill) if started_at else first_fill
    started_at = started_at or datetime.now(timezone.utc)

    market_range = _pick_market_range(range_, started_at)
    intraday = market_range in ("1D", "1W")
    symbols = sorted({f.symbol for f in fills})

    # --- price series per symbol: sorted keys + closes -----------------------
    # Intraday uses the real-time IEX feed; free SIP data lags 15 minutes, which
    # would leave a brand-new account with nothing but a straight line.
    feed = "iex" if intraday else None
    calendar = market.get_history(CALENDAR_SYMBOL, market_range, feed)
    series: Dict[str, Tuple[List[TimeKey], List[float]]] = {}
    for sym in symbols:
        try:
            bars = market.get_history(sym, market_range, feed)
        except market.MarketDataError:
            bars = []
        series[sym] = ([b["time"] for b in bars], [b["close"] for b in bars])

    def price_at(sym: str, key: TimeKey, fallback: float) -> float:
        keys, closes = series.get(sym, ([], []))
        i = bisect_right(keys, key) - 1
        return closes[i] if i >= 0 else fallback

    # --- replay fills along the calendar -------------------------------------
    start_key = _key_for(started_at, intraday)
    fill_keys = [_key_for(_aware(f.filled_at or f.timestamp), intraday) for f in fills]
    bar_seconds = 300 if market_range == "1D" else 1800  # bar covers [t, t+bar)

    cash = config.STARTING_CASH
    held: Dict[str, float] = {}
    last_price: Dict[str, float] = {}
    fi = 0
    points: List[Dict] = []

    for bar in calendar:
        key = bar["time"]
        horizon = key + bar_seconds if intraday else key
        while fi < len(fills) and fill_keys[fi] <= horizon:
            f = fills[fi]
            qty = f.quantity or 0.0
            px = f.price or 0.0
            if f.side == "buy":
                cash -= px * qty
                held[f.symbol] = held.get(f.symbol, 0.0) + qty
            else:
                cash += px * qty
                held[f.symbol] = held.get(f.symbol, 0.0) - qty
            last_price[f.symbol] = px
            fi += 1
        if key < start_key:
            continue  # before this portfolio existed (the start anchor covers it)
        holdings = {}
        for sym, qty in held.items():
            if qty > EPSILON:
                holdings[sym] = round(qty * price_at(sym, key, last_price.get(sym, 0.0)), 2)
        points.append({
            "time": key,
            "cash": round(cash, 2),
            "holdings": holdings,
            "total": round(cash + sum(holdings.values()), 2),
        })

    # --- anchor the start ----------------------------------------------------
    # If this range reaches back to when the portfolio began, the chart starts
    # at exactly the starting cash, at that moment.
    covers_start = not calendar or start_key >= calendar[0]["time"]
    start_point = {"time": start_key, "cash": config.STARTING_CASH, "holdings": {}, "total": config.STARTING_CASH}
    if covers_start:
        if not points or points[0]["time"] > start_key:
            points.insert(0, start_point)
        elif points[0]["time"] == start_key:
            # The first session already closed with trades in it; put the
            # $100k anchor just before it (two points can't share a time).
            before = (
                start_key - 60
                if intraday
                else (datetime.strptime(start_key, "%Y-%m-%d") - timedelta(days=1)).strftime("%Y-%m-%d")
            )
            points.insert(0, {**start_point, "time": before})

    # --- the live "now" ------------------------------------------------------
    live = build_portfolio(db, user)
    now_point = {
        "time": _key_for(datetime.now(timezone.utc), intraday),
        "cash": live["cash"],
        "holdings": {p["symbol"]: p["market_value"] for p in live["positions"]},
        "total": live["total_equity"],
    }
    try:
        market_open = bool(market.market_status()["is_open"])
    except market.MarketDataError:
        market_open = True
    if not points:
        points.append(now_point)
    elif not market_open or points[-1]["time"] >= now_point["time"]:
        # Market closed (nights/weekends): prices can't move, so update the last
        # session's point instead of drawing a flat line out to "now".
        points[-1] = {**now_point, "time": points[-1]["time"]}
    else:
        points.append(now_point)

    all_symbols = sorted({s for p in points for s in p["holdings"]})
    first = config.STARTING_CASH if covers_start else points[0]["total"]
    last = points[-1]["total"]
    return {
        "range": range_,
        "resolution": market_range,
        "intraday": intraday,
        "started_at": started_at.isoformat(),
        "starting_cash": config.STARTING_CASH,
        "symbols": all_symbols,
        "points": points,
        "market_open": market_open,
        # What the change is measured from: starting cash if the range reaches
        # back to the start, otherwise the first point in the range.
        "baseline": round(first, 2),
        "change": round(last - first, 2),
        "change_percent": round((last - first) / first * 100, 2) if first else 0.0,
    }
