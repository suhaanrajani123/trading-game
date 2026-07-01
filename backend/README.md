# Trading Game — Backend

## Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs (auto-generated): http://localhost:8000/docs

## Notes
- Prices come from Yahoo Finance via `yfinance` — free, no API key, delayed data (fine for a learning game).
- SQLite file `trading_game.db` is created automatically on first run.
- Single hardcoded user ("player1") for v1. To add real accounts later, swap
  `get_or_create_user` in `routers/portfolio.py` for real auth-derived user lookup —
  nothing else needs to change.
