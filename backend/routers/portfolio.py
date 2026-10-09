from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

import models
import portfolio_history
import trading
from database import get_db
from deps import current_user
from schemas import PortfolioHistoryOut, PortfolioOut

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


@router.get("/history", response_model=PortfolioHistoryOut)
def get_portfolio_history(
    range: Literal["1D", "1W", "1M", "3M", "1Y", "ALL"] = Query("ALL"),
    user: models.User = Depends(current_user),
    db: Session = Depends(get_db),
):
    """Account value over time, split into cash and each stock."""
    trading.process_open_orders(db, user)
    return portfolio_history.build_history(db, user, range)
