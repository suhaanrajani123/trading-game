# Tradepath

Learn how the stock market works by trading **real, live prices** with
**$100,000 of practice money**. Fifty short lessons take you from "what is a
share?" to options and the Fed, and a final exam checks what stuck.

- **Frontend:** Next.js 14, TypeScript, Tailwind, lightweight-charts (deployed on Vercel)
- **Backend:** FastAPI, SQLAlchemy, Postgres/SQLite (deployed on Render)
- **Market data:** Alpaca (free plan): live IEX quotes, split-adjusted candles, ticker search

## Features

- Market and limit orders; open limit orders reserve cash and fill when the price gets there
- Dashboard with account value, today's change, total return and an allocation bar
- Price charts with 1D to 5Y ranges, line or candlestick
- Search any US stock or ETF by name or ticker (press `/`)
- Order history with cancel, plus a "start over" reset
- 50 lessons with XP and progress, a 21-question final exam, curated videos
- Light and dark themes, works on phones
- No sign-up: each browser gets its own anonymous account

## Run it locally

You'll need Python 3.11+, Node 18+, and free Alpaca API keys (see `backend/README.md`).

**Terminal 1: backend**
```bash
cd backend
python -m venv venv
source venv/Scripts/activate      # Windows Git Bash  (macOS/Linux: source venv/bin/activate)
pip install -r requirements.txt
cp .env.example .env              # paste your Alpaca keys into .env
uvicorn main:app --reload --port 8000
```

**Terminal 2: frontend**
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000.

## Checks

```bash
cd backend && pytest                                      # API + trading engine tests
cd frontend && npm run lint && npm run typecheck && npm run build
```

## Deploying

| Service | Settings |
| --- | --- |
| Render (backend) | Root `backend`, build `pip install -r requirements.txt`, start `uvicorn main:app --host 0.0.0.0 --port $PORT`. Env: `APCA_API_KEY_ID`, `APCA_API_SECRET_KEY`, `DATABASE_URL` (Postgres), `FRONTEND_ORIGINS` |
| Vercel (frontend) | Root `frontend`. Env: `NEXT_PUBLIC_API_URL` = your Render URL |

Use Postgres in production: Render's disk is wiped on every deploy, so a SQLite
file would reset everyone's portfolio. The app adds any new database columns
on startup, so upgrading an existing database needs no manual migration.

## Project layout

```
backend/
  main.py            App setup, CORS, error handling
  config.py          All settings (reads backend/.env)
  market_service.py  Alpaca quotes, candles, search, market clock + caching
  trading.py         Paper-trading engine (orders, fills, portfolio math)
  models.py          User, Position, Order, LevelProgress
  routers/           market, portfolio, orders, game
  game_data.py       The 50 lessons
  tests/             pytest suite (offline)
frontend/
  app/               Dashboard, trade, activity, learn, exam, videos
  components/        Shell, search, chart, order ticket, tables
  lib/               API client, formatting, hooks, static data
```
