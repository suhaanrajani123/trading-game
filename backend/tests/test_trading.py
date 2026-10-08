import pytest


def buy(client, symbol="AAPL", qty=10, **kw):
    return client.post("/orders", json={"symbol": symbol, "side": "buy", "quantity": qty, **kw})


def sell(client, symbol="AAPL", qty=10, **kw):
    return client.post("/orders", json={"symbol": symbol, "side": "sell", "quantity": qty, **kw})


def portfolio(client):
    return client.get("/portfolio").json()


def test_new_player_starts_with_100k(client):
    p = portfolio(client)
    assert p["cash"] == 100_000
    assert p["positions"] == []
    assert p["total_return"] == 0


def test_header_is_required(client):
    r = client.get("/portfolio", headers={"X-User-ID": ""})
    assert r.status_code == 401


def test_market_buy_then_sell_round_trip(client, prices):
    r = buy(client, qty=10)
    assert r.status_code == 201
    assert r.json()["status"] == "filled"
    p = portfolio(client)
    assert p["cash"] == 98_000
    assert p["positions"][0]["quantity"] == 10

    prices["AAPL"] = 210.0
    from market_service import clear_caches
    clear_caches()

    r = sell(client, qty=10)
    assert r.json()["realized_pnl"] == 100.0
    p = portfolio(client)
    assert p["cash"] == 100_100
    assert p["positions"] == []  # empty positions are removed
    assert p["total_realized_pnl"] == 100.0


def test_cannot_overspend(client):
    r = buy(client, qty=1_000)  # $200k
    assert r.status_code == 400
    assert "buying power" in r.json()["detail"]


def test_cannot_sell_what_you_dont_own(client):
    r = sell(client, qty=1)
    assert r.status_code == 400


def test_validation_errors(client):
    assert buy(client, qty=0).status_code == 422
    assert buy(client, qty=-5).status_code == 422
    assert client.post("/orders", json={"symbol": "AAPL", "side": "hold", "quantity": 1}).status_code == 422
    assert buy(client, order_type="limit").status_code == 422  # no limit price


def test_marketable_limit_fills_at_better_price(client):
    r = buy(client, qty=1, order_type="limit", limit_price=250)
    body = r.json()
    assert body["status"] == "filled"
    assert body["price"] == 200.0


def test_resting_limit_reserves_cash_then_fills(client, prices):
    r = buy(client, qty=100, order_type="limit", limit_price=190)
    assert r.json()["status"] == "open"
    p = portfolio(client)
    assert p["cash"] == 100_000
    assert p["buying_power"] == 100_000 - 19_000
    assert p["open_orders"] == 1

    # Reserved cash can't be spent twice
    assert buy(client, "MSFT", qty=203).status_code == 400

    prices["AAPL"] = 185.0
    from market_service import clear_caches
    clear_caches()

    p = portfolio(client)
    assert p["open_orders"] == 0
    assert p["positions"][0]["avg_cost"] == 190.0  # filled at the limit
    assert p["cash"] == 81_000


def test_cancel_open_order(client):
    order = buy(client, qty=1, order_type="limit", limit_price=100).json()
    r = client.delete(f"/orders/{order['id']}")
    assert r.json()["status"] == "cancelled"
    assert client.delete(f"/orders/{order['id']}").status_code == 409
    assert portfolio(client)["buying_power"] == 100_000


def test_open_sell_holds_shares(client):
    buy(client, qty=10)
    assert sell(client, qty=6, order_type="limit", limit_price=300).json()["status"] == "open"
    r = sell(client, qty=5)
    assert r.status_code == 400
    assert sell(client, qty=4).status_code == 201


def test_players_are_isolated(client):
    buy(client, qty=1)
    other = client.get("/portfolio", headers={"X-User-ID": "someone-else-2"}).json()
    assert other["positions"] == []
    assert other["cash"] == 100_000


def test_day_change_uses_previous_close(client):
    buy(client, qty=10)  # AAPL prev close 195, now 200
    p = portfolio(client)
    assert p["day_change"] == 50.0
    assert p["positions"][0]["day_change_percent"] == pytest.approx(2.56, abs=0.01)


def test_reset_keeps_lessons(client):
    client.post("/game/complete", json={"level_id": 1})
    buy(client, qty=1)
    p = client.post("/portfolio/reset").json()
    assert p["cash"] == 100_000 and p["positions"] == []
    assert p["xp"] > 0
    assert client.get("/orders").json() == []


def test_lessons_award_xp_once(client):
    first = client.post("/game/complete", json={"level_id": 1}).json()
    again = client.post("/game/complete", json={"level_id": 1}).json()
    assert first["xp_gained"] > 0
    assert again["xp_gained"] == 0
    assert first["current_level"] == 2
    levels = client.get("/game/levels").json()
    assert levels[0]["completed"] is True
    assert client.post("/game/complete", json={"level_id": 9999}).status_code == 404
