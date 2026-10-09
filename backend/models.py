"""
SQLAlchemy ORM models — everything the game remembers about a player.
"""
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    """One player. `username` holds the anonymous device ID the browser generates."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    cash = Column(Float, default=100_000.0)
    xp = Column(Integer, default=0)
    current_level = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    # When the current portfolio began (account creation, or the last reset).
    started_at = Column(DateTime(timezone=True), default=utcnow)

    positions = relationship("Position", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
    progress = relationship("LevelProgress", back_populates="user", cascade="all, delete-orphan")


class Position(Base):
    __tablename__ = "positions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    symbol = Column(String, index=True)
    quantity = Column(Float, default=0.0)
    avg_cost = Column(Float, default=0.0)  # average price paid per share

    user = relationship("User", back_populates="positions")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    symbol = Column(String, index=True)
    side = Column(String)  # "buy" | "sell"
    order_type = Column(String, default="market")  # "market" | "limit"
    status = Column(String, default="filled", index=True)  # "open" | "filled" | "cancelled"
    quantity = Column(Float)
    price = Column(Float, nullable=True)  # fill price; null while open
    limit_price = Column(Float, nullable=True)
    realized_pnl = Column(Float, nullable=True)  # only set on filled sells
    note = Column(String, nullable=True)  # e.g. why an open order was cancelled
    timestamp = Column(DateTime(timezone=True), default=utcnow)  # when it was placed
    filled_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="orders")


class LevelProgress(Base):
    __tablename__ = "level_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    level_id = Column(Integer)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="progress")
