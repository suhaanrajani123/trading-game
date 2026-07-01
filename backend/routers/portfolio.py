from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
import market
from schemas import PortfolioOut, PositionOut

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


def get_or_create_user(db: Session) -> models.User:
    user = db.query(models.User).filter(models.User.username == "player1").first()
    if not user:
        user = models.User(username="player1", cash=100_000.0, xp=0, current_level=1)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


@router.get("", response_model=PortfolioOut)
def get_portfolio(db: Session = Depends(get_db)):
    user = get_or_create_user(db)
    positions_out = []
    total_market_value = 0.0

    for pos in user.positions:
        if pos.quantity <= 0:
            continue
        try:
            q = market.get_quote(pos.symbol)
            current_price = q["price"]
        except Exception:
            current_price = pos.avg_cost

        market_value = current_price * pos.quantity
        unrealized_pnl = (current_price - pos.avg_cost) * pos.quantity
        total_market_value += market_value

        positions_out.append(PositionOut(
            symbol=pos.symbol,
            quantity=pos.quantity,
            avg_cost=pos.avg_cost,
            current_price=current_price,
            market_value=round(market_value, 2),
            unrealized_pnl=round(unrealized_pnl, 2),
        ))

    return PortfolioOut(
        cash=round(user.cash, 2),
        positions=positions_out,
        total_market_value=round(total_market_value, 2),
        total_equity=round(user.cash + total_market_value, 2),
        xp=user.xp,
        current_level=user.current_level,
    )
