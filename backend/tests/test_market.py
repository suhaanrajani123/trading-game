import pytest

import market_service as m


def test_quote_uses_previous_close_for_change(client):
    r = client.get("/market/quote/aapl")
    assert r.status_code == 200
    q = r.json()
    assert q["symbol"] == "AAPL"
    assert q["price"] == 200.0
    assert q["change"] == 5.0
    assert q["change_percent"] == pytest.approx(2.56, abs=0.01)


def test_batch_quotes_is_one_upstream_call(client, fake_market):
    r = client.get("/market/quotes?symbols=AAPL,MSFT,SPY,!!bad")
    assert r.status_code == 200
    assert set(r.json()) == {"AAPL", "MSFT", "SPY"}
    assert fake_market.snapshot_calls == 1


def test_quotes_are_cached(client, fake_market):
    client.get("/market/quote/AAPL")
    client.get("/market/quote/AAPL")
    assert fake_market.snapshot_calls == 1


def test_unknown_symbol_is_404(client):
    assert client.get("/market/quote/ZZZZ").status_code == 404


def test_invalid_symbol_is_400(client):
    assert client.get("/market/quote/not a ticker").status_code == 400


def test_intraday_history_uses_unix_times(client):
    r = client.get("/market/history/AAPL?range=1D")
    assert r.status_code == 200
    candles = r.json()
    assert len(candles) == 5
    assert all(isinstance(c["time"], int) for c in candles)


def test_legacy_period_param_still_works(client):
    r = client.get("/market/history/AAPL?period=1d")
    assert r.status_code == 200


def test_missing_keys_returns_503(client, monkeypatch):
    monkeypatch.setattr(m, "_data_client", None)
    monkeypatch.setattr(m.config, "HAS_ALPACA_KEYS", False)
    m.clear_caches()
    r = client.get("/market/quote/AAPL")
    assert r.status_code == 503
    assert "APCA_API_KEY_ID" in r.json()["detail"]


def test_normalize_symbol():
    assert m.normalize_symbol(" brk-b ") == "BRK.B"
    with pytest.raises(m.InvalidSymbol):
        m.normalize_symbol("$$$")


def test_search_ranks_exact_then_prefix_then_name(client):
    r = client.get("/market/search?q=aap")
    assert [a["symbol"] for a in r.json()] == ["AAP", "AAPL"]
    r = client.get("/market/search?q=apple")
    names = [a["symbol"] for a in r.json()]
    assert names[0] == "AAPL" and "APLE" in names
    assert r.json()[0]["name"] == "Apple Inc."  # "Common Stock" noise stripped


def test_quote_includes_company_name_once_assets_loaded(client):
    client.get("/market/search?q=AAPL")
    assert client.get("/market/quote/AAPL").json()["name"] == "Apple Inc."


def test_market_status(client):
    assert client.get("/market/status").json()["is_open"] is True
