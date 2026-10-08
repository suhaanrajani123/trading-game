"""
Test setup: a throwaway SQLite database and a fake Alpaca client, so the whole
suite runs offline in about a second. Tests set prices with `prices["AAPL"] = 190`.
"""
import os
import sys
import tempfile
from datetime import datetime, timedelta, timezone
from pathlib import Path
from types import SimpleNamespace

import pytest

_tmp = tempfile.mkdtemp()
os.environ["DATABASE_URL"] = f"sqlite:///{Path(_tmp) / 'test.db'}"
os.environ["APCA_API_KEY_ID"] = "test-key"
os.environ["APCA_API_SECRET_KEY"] = "test-secret"
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import market_service  # noqa: E402
from database import Base, engine  # noqa: E402


def _bar(close, ts, open_=None, volume=1_000):
    return SimpleNamespace(open=open_ or close, high=close * 1.01, low=close * 0.99, close=close, volume=volume, timestamp=ts)


class FakeDataClient:
    def __init__(self, prices, prev_closes):
        self.prices, self.prev_closes = prices, prev_closes
        self.snapshot_calls = 0

    def get_stock_snapshot(self, req):
        self.snapshot_calls += 1
        now = datetime.now(timezone.utc)
        out = {}
        for s in req.symbol_or_symbols:
            if s not in self.prices:
                continue
            p = self.prices[s]
            out[s] = SimpleNamespace(
                latest_trade=SimpleNamespace(price=p, timestamp=now),
                minute_bar=_bar(p, now),
                daily_bar=_bar(p, now),
                previous_daily_bar=_bar(self.prev_closes.get(s, p), now - timedelta(days=1)),
            )
        return out

    def get_stock_bars(self, req):
        s = req.symbol_or_symbols
        if s not in self.prices:
            return SimpleNamespace(data={})
        start = datetime(2026, 10, 7, 13, 30, tzinfo=timezone.utc)
        bars = [_bar(self.prices[s] + i, start + timedelta(minutes=5 * i)) for i in range(5)]
        return SimpleNamespace(data={s: bars})


class FakeTradingClient:
    def get_all_assets(self, req):
        rows = [("AAPL", "Apple Inc. Common Stock"), ("AAP", "Advance Auto Parts Inc."),
                ("MSFT", "Microsoft Corporation Common Stock"), ("APLE", "Apple Hospitality REIT, Inc.")]
        return [SimpleNamespace(symbol=s, name=n, exchange="NASDAQ", tradable=True) for s, n in rows]

    def get_clock(self):
        now = datetime.now(timezone.utc)
        return SimpleNamespace(is_open=True, next_open=now + timedelta(days=1), next_close=now + timedelta(hours=2))


@pytest.fixture()
def prices():
    return {"AAPL": 200.0, "MSFT": 400.0, "SPY": 500.0}


@pytest.fixture()
def fake_market(prices, monkeypatch):
    client = FakeDataClient(prices, {"AAPL": 195.0, "MSFT": 410.0, "SPY": 500.0})
    monkeypatch.setattr(market_service, "_data_client", client)
    monkeypatch.setattr(market_service, "_trading_client", FakeTradingClient())
    market_service.clear_caches()
    yield client
    market_service.clear_caches()


@pytest.fixture()
def client(fake_market):
    from fastapi.testclient import TestClient

    import main

    Base.metadata.drop_all(bind=engine)
    with TestClient(main.app) as c:
        c.headers.update({"X-User-ID": "test-player-1"})
        yield c
