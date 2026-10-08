# Tradepath backend

FastAPI + SQLAlchemy. Market data from [Alpaca](https://alpaca.markets) (free plan works).

```bash
python -m venv venv
source venv/Scripts/activate        # Git Bash on Windows; macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env                # then paste your Alpaca keys
uvicorn main:app --reload --port 8000
```

Interactive API docs: http://localhost:8000/docs. Health check: `GET /health`
(shows `"market_data": "missing_keys"` if the keys weren't picked up).

## Getting Alpaca keys

1. Sign up at https://app.alpaca.markets and open the **Paper** account.
2. Generate API keys from the dashboard home page.
3. Put them in `backend/.env` as `APCA_API_KEY_ID` and `APCA_API_SECRET_KEY`.

The keys are only used to *read* market data and the list of tickers. No orders
are ever sent to Alpaca; all trading is simulated in this app's database.

## Data feeds

| Data | Feed | Why |
| --- | --- | --- |
| Live quotes | IEX (`ALPACA_QUOTE_FEED`) | Real-time and free; prices come from the IEX exchange only, so they can differ by a few cents from the consolidated price. Set to `sip` on a paid plan. |
| Chart candles | SIP, 15 min delayed (`ALPACA_HISTORY_FEED`) | Free, full-market volume, split/dividend adjusted. Falls back to IEX automatically. |

## Endpoints

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/market/quote/{symbol}` | Price, change vs previous close, day OHLC, volume |
| GET | `/market/quotes?symbols=A,B,C` | Up to 50 symbols in one Alpaca call |
| GET | `/market/history/{symbol}?range=1M` | `1D 1W 1M 3M 6M 1Y 5Y MAX` |
| GET | `/market/search?q=apple` | Ticker/company search |
| GET | `/market/status` | Market open/closed and next open/close |
| GET | `/portfolio` | Cash, buying power, positions, day change, total return |
| POST | `/portfolio/reset` | Fresh $100k; keeps lessons and XP |
| GET/POST | `/orders` | List (filter `?status=open`) / place an order |
| DELETE | `/orders/{id}` | Cancel an open limit order |
| GET | `/game/levels` · POST `/game/complete` | Lessons and XP |

Every player endpoint needs an `X-User-ID` header (the browser's anonymous device ID).

## How orders work

- **Market** orders fill immediately at the latest trade price.
- **Limit** orders fill immediately if the price is already at or better than
  the limit. Otherwise they stay **open**, reserve the cash (buys) or shares
  (sells) they need, and fill at the limit price the next time the player's
  portfolio or orders are loaded after the market crosses it.

## Tests

```bash
pytest        # ~2s, fully offline (fake Alpaca client + temp SQLite)
```

## Configuration

See `.env.example` for every setting. In production (Render) set
`APCA_API_KEY_ID`, `APCA_API_SECRET_KEY`, `DATABASE_URL` (Postgres, so player
data survives redeploys) and `FRONTEND_ORIGINS`.
