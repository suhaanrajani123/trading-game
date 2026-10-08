from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
import trading
from database import get_db
from deps import current_user
from schemas import PortfolioOut

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("", response_model=PortfolioOut)
def get_portfolio(user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    trading.process_open_orders(db, user)
    return trading.build_portfolio(db, user)


@router.post("/reset", response_model=PortfolioOut)
def reset_portfolio(user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    """Start over with fresh cash. Lesson progress and XP are kept."""
    trading.reset_account(db, user)
    return trading.build_portfolio(db, user)
