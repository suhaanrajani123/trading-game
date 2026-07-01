from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import market
from schemas import OrderIn, OrderOut
from routers.portfolio import get_or_create_user
from typing import List

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderOut)
def place_order(order_in: OrderIn, db: Session = Depends(get_db)):
    user = get_or_create_user(db)
    symbol = order_in.symbol.upper()

    if order_in.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than zero.")

    try:
        quote = market.get_quote(symbol)
    except Exception:
        raise HTTPException(status_code=404, detail=f"Could not fetch a price for '{symbol}'.")

    exec_price = quote["price"]

    # Limit order: only fill if market price has reached the limit.
    if order_in.order_type == "limit":
        if order_in.limit_price is None:
            raise HTTPException(status_code=400, detail="Limit orders require a limit_price.")
        if order_in.side == "buy" and exec_price > order_in.limit_price:
            raise HTTPException(status_code=409, detail="Market price is above your limit — order not filled yet.")
        if order_in.side == "sell" and exec_price < order_in.limit_price:
            raise HTTPException(status_code=409, detail="Market price is below your limit — order not filled yet.")
        exec_price = order_in.limit_price

    position = db.query(models.Position).filter(
        models.Position.user_id == user.id, models.Position.symbol == symbol
    ).first()

    realized_pnl = None

    if order_in.side == "buy":
        cost = exec_price * order_in.quantity
        if cost > user.cash:
            raise HTTPException(status_code=400, detail="Not enough cash for this trade.")
        user.cash -= cost

        if position:
            total_cost = position.avg_cost * position.quantity + cost
            position.quantity += order_in.quantity
            position.avg_cost = total_cost / position.quantity
        else:
            position = models.Position(
                user_id=user.id, symbol=symbol,
                quantity=order_in.quantity, avg_cost=exec_price,
            )
            db.add(position)

    elif order_in.side == "sell":
        if not position or position.quantity < order_in.quantity:
            raise HTTPException(status_code=400, detail="You don't own enough shares to sell that much.")
        proceeds = exec_price * order_in.quantity
        realized_pnl = (exec_price - position.avg_cost) * order_in.quantity
        user.cash += proceeds
        position.quantity -= order_in.quantity

    else:
        raise HTTPException(status_code=400, detail="side must be 'buy' or 'sell'.")

    new_order = models.Order(
        user_id=user.id, symbol=symbol, side=order_in.side,
        order_type=order_in.order_type, quantity=order_in.quantity,
        price=exec_price, limit_price=order_in.limit_price, realized_pnl=realized_pnl,
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order


@router.get("", response_model=List[OrderOut])
def order_history(db: Session = Depends(get_db)):
    user = get_or_create_user(db)
    return db.query(models.Order).filter(
        models.Order.user_id == user.id
    ).order_by(models.Order.timestamp.desc()).all()
