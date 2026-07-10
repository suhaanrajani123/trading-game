from fastapi import APIRouter, HTTPException, Query
import market
from schemas import QuoteOut, CandleOut
from typing import List
import traceback

router = APIRouter(prefix="/market", tags=["market"])


@router.get("/quote/{symbol}", response_model=QuoteOut)
def quote(symbol: str):
    try:
        return market.get_quote(symbol)
    except Exception as e:
        print(f"[QUOTE ERROR] {symbol}: {type(e).__name__}: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=404, detail=f"Could not fetch quote for '{symbol}'. Check the ticker symbol.")


@router.get("/history/{symbol}", response_model=List[CandleOut])
def history(symbol: str, period: str = Query("1mo"), interval: str = Query("1d")):
    try:
        return market.get_history(symbol, period, interval)
    except Exception:
        raise HTTPException(status_code=404, detail=f"Could not fetch history for '{symbol}'.")
