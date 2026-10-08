from typing import List, Literal, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

import models
import trading
from database import get_db
from deps import current_user
from schemas import OrderIn, OrderOut

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=201)
def place_order(order_in: OrderIn, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    return trading.place_order(db, user, order_in)


@router.get("", response_model=List[OrderOut])
def list_orders(
    status: Optional[Literal["open", "filled", "cancelled"]] = None,
    limit: int = Query(100, ge=1, le=500),
    user: models.User = Depends(current_user),
    db: Session = Depends(get_db),
):
    trading.process_open_orders(db, user)
    q = db.query(models.Order).filter(models.Order.user_id == user.id)
    if status:
        q = q.filter(models.Order.status == status)
    return q.order_by(models.Order.timestamp.desc(), models.Order.id.desc()).limit(limit).all()


@router.delete("/{order_id}", response_model=OrderOut)
def cancel_order(order_id: int, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    return trading.cancel_order(db, user, order_id)
