"""
Pydantic schemas — the shape of what the API sends/receives.
Kept separate from ORM models so the DB can change shape
without breaking the API contract.
"""
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from typing import Dict, List, Literal, Optional, Union
from datetime import datetime


class QuoteOut(BaseModel):
    symbol: str
    name: Optional[str] = None
    price: float
    change: float
    change_percent: float
    prev_close: Optional[float] = None
    open: Optional[float] = None
    high: Optional[float] = None
    low: Optional[float] = None
    volume: Optional[float] = None
    currency: str = "USD"
    feed: str = "iex"
    is_delayed: bool = False
    updated_at: Optional[str] = None


class CandleOut(BaseModel):
    # "YYYY-MM-DD" for daily+ ranges, unix seconds (UTC) for intraday ranges
    time: Union[str, int]
    open: float
    high: float
    low: float
    close: float
    volume: float


class AssetOut(BaseModel):
    symbol: str
    name: str
    exchange: str


class MarketStatusOut(BaseModel):
    is_open: bool
    next_open: Optional[str] = None
    next_close: Optional[str] = None


class PositionOut(BaseModel):
    symbol: str
    name: Optional[str] = None
    quantity: float
    avg_cost: float
    current_price: float
    market_value: float
    cost_basis: float
    unrealized_pnl: float
    unrealized_pnl_percent: float
    day_change: float
    day_change_percent: float
    weight: float
    price_is_live: bool = True


class PortfolioOut(BaseModel):
    cash: float
    buying_power: float
    reserved_cash: float
    positions: List[PositionOut]
    total_market_value: float
    total_equity: float
    total_unrealized_pnl: float
    total_realized_pnl: float
    day_change: float
    day_change_percent: float
    starting_cash: float
    total_return: float
    total_return_percent: float
    open_orders: int
    xp: int
    current_level: int


class OrderIn(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=12)
    side: Literal["buy", "sell"]
    order_type: Literal["market", "limit"] = "market"
    quantity: float = Field(..., gt=0, le=1_000_000)
    limit_price: Optional[float] = Field(None, gt=0, le=1_000_000)

    @field_validator("quantity")
    @classmethod
    def round_quantity(cls, v: float) -> float:
        v = round(v, 4)  # fractional shares down to 0.0001
        if v <= 0:
            raise ValueError("Quantity must be at least 0.0001 shares.")
        return v

    @model_validator(mode="after")
    def limit_needs_price(self) -> "OrderIn":
        if self.order_type == "limit" and self.limit_price is None:
            raise ValueError("Limit orders need a limit price.")
        if self.order_type == "market":
            self.limit_price = None
        else:
            self.limit_price = round(self.limit_price, 2)
        return self


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    symbol: str
    side: str
    order_type: str
    status: str
    quantity: float
    price: Optional[float] = None
    limit_price: Optional[float] = None
    realized_pnl: Optional[float] = None
    note: Optional[str] = None
    timestamp: datetime
    filled_at: Optional[datetime] = None


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


class LevelCompleteOut(BaseModel):
    message: str
    xp_gained: int
    total_xp: int
    current_level: int


class HistoryPointOut(BaseModel):
    time: Union[str, int]
    total: float
    cash: float
    holdings: Dict[str, float]


class PortfolioHistoryOut(BaseModel):
    range: str
    resolution: str
    intraday: bool
    started_at: str
    starting_cash: float
    symbols: List[str]
    points: List[HistoryPointOut]
    change: float
    change_percent: float
