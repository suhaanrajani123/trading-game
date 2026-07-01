# Tradepath — Trading Game / Stock Simulator

A gamified stock market simulator: real market prices (via Yahoo Finance), 100% fake
money, and a level-based curriculum that unlocks trading features as you learn.

## Quick start (two terminals)

**Terminal 1 — backend**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Terminal 2 — frontend**
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000. You start with $100,000 in fake cash.

## What's already built
- Live/delayed real stock quotes and price history (yfinance, no API key)
- Buy/sell with market and limit orders against real prices
- Portfolio tracking: cash, positions, unrealized P&L
- Candlestick chart per symbol (lightweight-charts)
- 6-level learning path with lessons, unlocks, and XP
- Dark trading-terminal UI with a live scrolling ticker

## Deliberately left out of v1 (next steps)
- **Auth** — currently single hardcoded player. Add Clerk/NextAuth, then swap
  `get_or_create_user()` in `backend/routers/portfolio.py` for real user lookup.
- **Postgres** — SQLite works fine for one player; swap the URL in `backend/database.py`
  when you add multi-user support.
- **Leaderboards / multiplayer** — would need a `users` ranking endpoint + a public
  leaderboard page.
- **Short selling / options** — Level 6 is a lesson-only scenario right now, no real
  execution logic yet.
- **Redis caching** — the in-memory cache in `market.py` is fine for one dev machine;
  swap in Redis if you deploy for real traffic.

## Project structure
```
backend/
  main.py            FastAPI app, CORS, router wiring
  database.py         SQLite engine/session
  models.py            ORM: User, Position, Order, LevelProgress
  schemas.py           Pydantic request/response shapes
  market.py            yfinance wrapper + TTL cache
  game_data.py         The curriculum (levels, lessons, unlocks)
  routers/
    market.py           GET /market/quote/:symbol, /market/history/:symbol
    portfolio.py         GET /portfolio
    orders.py            POST/GET /orders
    game.py              GET /game/levels, POST /game/complete

frontend/
  app/
    layout.tsx          Root layout, fonts, nav, ticker
    page.tsx             Dashboard (portfolio + holdings)
    trade/page.tsx        Symbol search, chart, trade panel
    game/page.tsx          Level map + lesson modal
  components/            Nav, Ticker, PortfolioSummary, StockChart,
                          TradePanel, LevelMap, LessonModal
  lib/api.ts             Typed fetch wrapper for the backend
  types/index.ts          Shared TS types matching backend schemas
```
