"""
The paper-trading engine. All money logic lives here (the routers stay thin and
the frontend never computes balances), so there's exactly one source of truth
and nobody can give themselves cash by editing localStorage.

Order rules — simplified, but how real brokers behave:
- Market order: fills now at the latest trade price.
- Limit buy:  fills now if price <= limit (at the better market price),
              otherwise rests as an "open" order and holds the cash it needs.
- Limit sell: fills now if price >= limit, otherwise rests and holds the shares.
- Open orders are re-checked whenever the player loads their portfolio or
  orders, and fill at their limit price once the market crosses it.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Dict, List, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

import config
import market_service as market
import models
from schemas import OrderIn

EPSILON = 1e-9


def _now() -> datetime:
    return datetime.now(timezone.utc)


# --------------------------------------------------------------------------- #
# Users
# --------------------------------------------------------------------------- #
def get_or_create_user(db: Session, user_key: str) -> models.User:
    user = db.query(models.User).filter(models.User.username == user_key).first()
    if user is None:
        user = models.User(username=user_key, cash=config.STARTING_CASH, xp=0, current_level=1)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def _lock_user(db: Session, user: models.User) -> models.User:
    """Row-lock the player on Postgres so two fast clicks can't double-spend."""
    return db.query(models.User).filter(models.User.id == user.id).populate_existing().with_for_update().one()


# --------------------------------------------------------------------------- #
# Reservations held by open orders
# --------------------------------------------------------------------------- #
def _open_orders(db: Session, user: models.User, symbol: Optional[str] = None) -> List[models.Order]:
    q = db.query(models.Order).filter(models.Order.user_id == user.id, models.Order.status == "open")
    if symbol:
        q = q.filter(models.Order.symbol == symbol)
    return q.all()


def reserved_cash(db: Session, user: models.User, exclude_id: Optional[int] = None) -> float:
    return sum(
        (o.limit_price or 0) * o.quantity
        for o in _open_orders(db, user)
        if o.side == "buy" and o.id != exclude_id
    )


def reserved_shares(db: Session, user: models.User, symbol: str, exclude_id: Optional[int] = None) -> float:
    return sum(o.quantity for o in _open_orders(db, user, symbol) if o.side == "sell" and o.id != exclude_id)


def _position(db: Session, user: models.User, symbol: str) -> Optional[models.Position]:
    return (
        db.query(models.Position)
        .filter(models.Position.user_id == user.id, models.Position.symbol == symbol)
        .first()
    )


# --------------------------------------------------------------------------- #
# Fills
# --------------------------------------------------------------------------- #
def _apply_fill(db: Session, user: models.User, order: models.Order, price: float) -> None:
    """Move cash and shares for a fill. Caller has already checked affordability."""
    position = _position(db, user, order.symbol)
    if order.side == "buy":
        cost = price * order.quantity
        user.cash = round(user.cash - cost, 2)
        if position is not None:
            total_cost = position.avg_cost * position.quantity + cost
            position.quantity = round(position.quantity + order.quantity, 6)
            position.avg_cost = round(total_cost / position.quantity, 4)
        else:
            db.add(models.Position(user_id=user.id, symbol=order.symbol, quantity=order.quantity, avg_cost=round(price, 4)))
    else:
        assert position is not None
        order.realized_pnl = round((price - position.avg_cost) * order.quantity, 2)
        user.cash = round(user.cash + price * order.quantity, 2)
        position.quantity = round(position.quantity - order.quantity, 6)
        if position.quantity <= EPSILON:
            db.delete(position)

    order.price = round(price, 4)
    order.status = "filled"
    order.filled_at = _now()


def place_order(db: Session, user: models.User, order_in: OrderIn) -> models.Order:
    symbol = market.normalize_symbol(order_in.symbol)
    quote = market.get_quote(symbol)  # raises typed MarketDataError on failure
    market_price = float(quote["price"])
    qty = order_in.quantity

    user = _lock_user(db, user)
    position = _position(db, user, symbol)
    owned = position.quantity if position else 0.0

    order = models.Order(
        user_id=user.id,
        symbol=symbol,
        side=order_in.side,
        order_type=order_in.order_type,
        quantity=qty,
        limit_price=order_in.limit_price,
        status="open",
    )

    if order_in.order_type == "market":
        fill_price: Optional[float] = market_price
    elif order_in.side == "buy":
        fill_price = market_price if market_price <= order_in.limit_price else None
    else:
        fill_price = market_price if market_price >= order_in.limit_price else None

    buying_power = user.cash - reserved_cash(db, user)
    sellable = owned - reserved_shares(db, user, symbol)

    if order_in.side == "buy":
        # A resting limit buy must be able to pay its full limit price later.
        needed = (fill_price if fill_price is not None else order_in.limit_price) * qty
        if needed > buying_power + 0.005:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough buying power. This order needs ${needed:,.2f}; you have ${buying_power:,.2f} available.",
            )
    elif qty > sellable + EPSILON:
        if owned <= EPSILON:
            raise HTTPException(status_code=400, detail=f"You don't own any {symbol} to sell.")
        raise HTTPException(
            status_code=400,
            detail=f"You can sell at most {sellable:g} {symbol} shares (some may be held by open sell orders).",
        )

    db.add(order)
    db.flush()
    if fill_price is not None:
        _apply_fill(db, user, order, fill_price)
    db.commit()
    db.refresh(order)
    return order


def process_open_orders(db: Session, user: models.User) -> int:
    """Fill any resting limit orders the market has reached. Returns fills made."""
    open_orders = _open_orders(db, user)
    if not open_orders:
        return 0
    try:
        quotes = market.get_quotes({o.symbol for o in open_orders})
    except market.MarketDataError:
        return 0  # can't price right now; try again next load

    user = _lock_user(db, user)
    fills = 0
    for order in sorted(open_orders, key=lambda o: o.timestamp or _now()):
        quote = quotes.get(order.symbol)
        if not quote:
            continue
        price = float(quote["price"])
        limit = order.limit_price or 0
        if order.side == "buy" and price <= limit:
            if limit * order.quantity > user.cash - reserved_cash(db, user, exclude_id=order.id) + 0.005:
                order.status, order.note = "cancelled", "Cancelled: not enough cash when the price was reached."
                continue
            _apply_fill(db, user, order, limit)
            fills += 1
        elif order.side == "sell" and price >= limit:
            position = _position(db, user, order.symbol)
            if position is None or position.quantity + EPSILON < order.quantity:
                order.status, order.note = "cancelled", "Cancelled: you no longer own enough shares."
                continue
            _apply_fill(db, user, order, limit)
            fills += 1
        db.flush()
    db.commit()
    return fills


def cancel_order(db: Session, user: models.User, order_id: int) -> models.Order:
    order = (
        db.query(models.Order)
        .filter(models.Order.id == order_id, models.Order.user_id == user.id)
        .first()
    )
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found.")
    if order.status != "open":
        raise HTTPException(status_code=409, detail=f"This order is already {order.status}.")
    order.status = "cancelled"
    order.note = "Cancelled by you."
    db.commit()
    db.refresh(order)
    return order


def reset_account(db: Session, user: models.User) -> None:
    """Fresh start: starting cash, no positions, no orders. Lessons and XP are kept."""
    db.query(models.Order).filter(models.Order.user_id == user.id).delete()
    db.query(models.Position).filter(models.Position.user_id == user.id).delete()
    user.cash = config.STARTING_CASH
    db.commit()


# --------------------------------------------------------------------------- #
# Portfolio view
# --------------------------------------------------------------------------- #
def build_portfolio(db: Session, user: models.User) -> Dict:
    positions = [p for p in user.positions if p.quantity > EPSILON]
    quotes: Dict[str, Dict] = {}
    if positions:
        try:
            quotes = market.get_quotes({p.symbol for p in positions})
        except market.MarketDataError:
            quotes = {}  # fall back to cost basis rather than failing the whole page

    rows = []
    total_value = total_cost = total_day = 0.0
    for p in positions:
        q = quotes.get(p.symbol)
        price = float(q["price"]) if q else p.avg_cost
        value = price * p.quantity
        cost = p.avg_cost * p.quantity
        day_change = float(q["change"]) * p.quantity if q else 0.0
        total_value += value
        total_cost += cost
        total_day += day_change
        rows.append({
            "symbol": p.symbol,
            "name": (q or {}).get("name") or market.asset_name(p.symbol),
            "quantity": round(p.quantity, 6),
            "avg_cost": round(p.avg_cost, 4),
            "current_price": round(price, 2),
            "market_value": round(value, 2),
            "cost_basis": round(cost, 2),
            "unrealized_pnl": round(value - cost, 2),
            "unrealized_pnl_percent": round((value - cost) / cost * 100, 2) if cost else 0.0,
            "day_change": round(day_change, 2),
            "day_change_percent": float(q["change_percent"]) if q else 0.0,
            "price_is_live": q is not None,
        })

    equity = user.cash + total_value
    for r in rows:
        r["weight"] = round(r["market_value"] / equity * 100, 2) if equity else 0.0
    rows.sort(key=lambda r: r["market_value"], reverse=True)

    realized = sum(
        o.realized_pnl or 0
        for o in db.query(models.Order).filter(models.Order.user_id == user.id, models.Order.status == "filled")
    )
    held = reserved_cash(db, user)
    prev_equity = equity - total_day
    total_return = equity - config.STARTING_CASH

    return {
        "cash": round(user.cash, 2),
        "buying_power": round(user.cash - held, 2),
        "reserved_cash": round(held, 2),
        "positions": rows,
        "total_market_value": round(total_value, 2),
        "total_equity": round(equity, 2),
        "total_unrealized_pnl": round(total_value - total_cost, 2),
        "total_realized_pnl": round(realized, 2),
        "day_change": round(total_day, 2),
        "day_change_percent": round(total_day / prev_equity * 100, 2) if prev_equity else 0.0,
        "starting_cash": config.STARTING_CASH,
        "total_return": round(total_return, 2),
        "total_return_percent": round(total_return / config.STARTING_CASH * 100, 2),
        "open_orders": len(_open_orders(db, user)),
        "xp": user.xp,
        "current_level": user.current_level,
    }
