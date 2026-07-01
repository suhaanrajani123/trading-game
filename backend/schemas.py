"""
Pydantic schemas — the shape of what the API sends/receives.
Kept separate from ORM models so the DB can change shape
without breaking the API contract.
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class QuoteOut(BaseModel):
    symbol: str
    price: float
    change: float
    change_percent: float
    currency: str = "USD"
    is_delayed: bool = True


class CandleOut(BaseModel):
    time: str
    open: float
    high: float
    low: float
    close: float
    volume: float


class PositionOut(BaseModel):
    symbol: str
    quantity: float
    avg_cost: float
    current_price: Optional[float] = None
    market_value: Optional[float] = None
    unrealized_pnl: Optional[float] = None

    class Config:
        from_attributes = True


class PortfolioOut(BaseModel):
    cash: float
    positions: List[PositionOut]
    total_market_value: float
    total_equity: float
    xp: int
    current_level: int


class OrderIn(BaseModel):
    symbol: str
    side: str  # "buy" | "sell"
    order_type: str = "market"  # "market" | "limit"
    quantity: float
    limit_price: Optional[float] = None


class OrderOut(BaseModel):
    id: int
    symbol: str
    side: str
    order_type: str
    quantity: float
    price: float
    realized_pnl: Optional[float]
    timestamp: datetime

    class Config:
        from_attributes = True


class LevelOut(BaseModel):
    id: int
    title: str
    description: str
    lesson: str
    unlocks: List[str]
    xp_reward: int
    locked: bool
    completed: bool


class CompleteLevelIn(BaseModel):
    level_id: int
