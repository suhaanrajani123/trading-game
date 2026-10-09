from datetime import datetime, timedelta, timezone

import models
from database import SessionLocal


def _backdate(user_key: str, days: int):
    """Pretend the player started and traded `days` ago."""
    db = SessionLocal()
    then = datetime.now(timezone.utc) - timedelta(days=days)
    user = db.query(models.User).filter(models.User.username == user_key).one()
    user.started_at = then
    for o in user.orders:
        o.timestamp = then
        o.filled_at = then
    db.commit()
    db.close()


def test_new_player_history_is_flat_at_starting_cash(client):
    h = client.get("/portfolio/history").json()
    assert h["points"][0]["total"] == 100_000
    assert h["points"][-1]["total"] == 100_000
    assert h["change"] == 0
    assert h["symbols"] == []


def test_history_replays_fills_against_real_prices(client):
    r = client.post("/orders", json={"symbol": "AAPL", "side": "buy", "quantity": 10})
    assert r.status_code == 201
    _backdate("test-player-1", 20)

    h = client.get("/portfolio/history?range=1M").json()
    assert h["intraday"] is False
    assert h["symbols"] == ["AAPL"]
    pts = h["points"]
    assert len(pts) > 10
    # every past point = cash after the buy + 10 shares at that day's close
    mid = pts[len(pts) // 2]
    assert mid["cash"] == 98_000
    assert mid["total"] == round(98_000 + mid["holdings"]["AAPL"], 2)
    # the chart ends exactly at the live account value
    live = client.get("/portfolio").json()
    assert pts[-1]["total"] == live["total_equity"]
    # nothing is drawn before the portfolio began
    assert pts[0]["time"] >= (datetime.now(timezone.utc) - timedelta(days=21)).strftime("%Y-%m-%d")


def test_all_range_picks_resolution_from_account_age(client):
    h = client.get("/portfolio/history?range=ALL").json()
    assert h["resolution"] == "1D"  # brand-new account -> intraday
    client.post("/orders", json={"symbol": "MSFT", "side": "buy", "quantity": 1})
    _backdate("test-player-1", 20)
    h = client.get("/portfolio/history?range=ALL").json()
    assert h["resolution"] == "1M"


def test_reset_restarts_history(client):
    client.post("/orders", json={"symbol": "AAPL", "side": "buy", "quantity": 10})
    _backdate("test-player-1", 20)
    client.post("/portfolio/reset")
    h = client.get("/portfolio/history?range=1M").json()
    assert h["symbols"] == []
    assert all(p["total"] == 100_000 for p in h["points"])


def test_bad_range_is_rejected(client):
    assert client.get("/portfolio/history?range=10Y").status_code == 422
