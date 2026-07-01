"""
SQLAlchemy ORM models — the shape of everything the game remembers.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, default="player1")
    cash = Column(Float, default=100_000.0)  # fake starting cash
    xp = Column(Integer, default=0)
    current_level = Column(Integer, default=1)

    positions = relationship("Position", back_populates="user")
    orders = relationship("Order", back_populates="user")
    progress = relationship("LevelProgress", back_populates="user")


class Position(Base):
    __tablename__ = "positions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    symbol = Column(String, index=True)
    quantity = Column(Float, default=0.0)
    avg_cost = Column(Float, default=0.0)  # average price paid per share

    user = relationship("User", back_populates="positions")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    symbol = Column(String, index=True)
    side = Column(String)  # "buy" | "sell"
    order_type = Column(String, default="market")  # "market" | "limit"
    quantity = Column(Float)
    price = Column(Float)  # execution price
    limit_price = Column(Float, nullable=True)
    realized_pnl = Column(Float, nullable=True)  # only set on sells
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="orders")


class LevelProgress(Base):
    __tablename__ = "level_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    level_id = Column(Integer)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="progress")
