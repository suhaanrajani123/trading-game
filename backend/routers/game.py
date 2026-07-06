from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
from game_data import LEVELS, get_level
from schemas import LevelOut, CompleteLevelIn
from routers.portfolio import get_or_create_user
from datetime import datetime
from typing import List

router = APIRouter(prefix="/game", tags=["game"])


@router.get("/levels", response_model=List[LevelOut])
def list_levels(db: Session = Depends(get_db)):
    user = get_or_create_user(db)
    completed_ids = {
        p.level_id for p in user.progress if p.completed
    }

    out = []
    for lvl in LEVELS:
        locked = False
        out.append(LevelOut(
            id=lvl["id"], title=lvl["title"], description=lvl["description"],
            lesson=lvl["lesson"], unlocks=lvl["unlocks"], xp_reward=lvl["xp_reward"],
            locked=locked, completed=lvl["id"] in completed_ids,
        ))
    return out


@router.post("/complete")
def complete_level(payload: CompleteLevelIn, db: Session = Depends(get_db)):
    user = get_or_create_user(db)
    level = get_level(payload.level_id)
    if not level:
        raise HTTPException(status_code=404, detail="Level not found.")

    existing = db.query(models.LevelProgress).filter(
        models.LevelProgress.user_id == user.id,
        models.LevelProgress.level_id == payload.level_id,
    ).first()

    if existing and existing.completed:
        return {"message": "Level already completed.", "xp": user.xp}

    if existing:
        existing.completed = True
        existing.completed_at = datetime.utcnow()
    else:
        db.add(models.LevelProgress(
            user_id=user.id, level_id=payload.level_id,
            completed=True, completed_at=datetime.utcnow(),
        ))

    user.xp += level["xp_reward"]
    if payload.level_id >= user.current_level:
        user.current_level = payload.level_id + 1

    db.commit()
    return {"message": f"Level {payload.level_id} complete!", "xp_gained": level["xp_reward"], "total_xp": user.xp}
