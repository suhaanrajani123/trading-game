"""
Entrypoint. Run with:  uvicorn main:app --reload --port 8000
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
import models  # noqa: F401 — needed so Base knows about the tables
from routers import market, portfolio, orders, game

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Trading Game API", version="0.1.0")

# Comma-separated list in env var FRONTEND_ORIGINS, e.g.
# "https://your-app.vercel.app,http://localhost:3000"
extra_origins = os.getenv("FRONTEND_ORIGINS", "")
origins = ["http://localhost:3000"] + [o.strip() for o in extra_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",  # covers Vercel preview URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(market.router)
app.include_router(portfolio.router)
app.include_router(orders.router)
app.include_router(game.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "Trading Game API is running."}
