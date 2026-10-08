from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
from database import get_db
from deps import current_user
from game_data import LEVELS, get_level
from schemas import CompleteLevelIn, LevelCompleteOut, LevelOut

router = APIRouter(prefix="/game", tags=["game"])


def _completed_ids(user: models.User) -> set[int]:
    return {p.level_id for p in user.progress if p.completed}


@router.get("/levels", response_model=List[LevelOut])
def list_levels(user: models.User = Depends(current_user)):
    done = _completed_ids(user)
    # Every lesson is open — learners can jump to whatever they're curious about.
    return [LevelOut(**{k: lvl[k] for k in ("id", "title", "description", "lesson", "unlocks", "xp_reward")},
                     locked=False, completed=lvl["id"] in done) for lvl in LEVELS]


@router.post("/complete", response_model=LevelCompleteOut)
def complete_level(payload: CompleteLevelIn, user: models.User = Depends(current_user), db: Session = Depends(get_db)):
    level = get_level(payload.level_id)
    if not level:
        raise HTTPException(status_code=404, detail="Lesson not found.")

    if payload.level_id in _completed_ids(user):
        return LevelCompleteOut(message="Already completed.", xp_gained=0, total_xp=user.xp, current_level=user.current_level)

    existing = db.query(models.LevelProgress).filter(
        models.LevelProgress.user_id == user.id, models.LevelProgress.level_id == payload.level_id
    ).first()
    if existing:
        existing.completed, existing.completed_at = True, datetime.now(timezone.utc)
    else:
        db.add(models.LevelProgress(user_id=user.id, level_id=payload.level_id,
                                    completed=True, completed_at=datetime.now(timezone.utc)))

    user.xp += level["xp_reward"]
    # "Level" = the first lesson you haven't finished yet.
    done = _completed_ids(user) | {payload.level_id}
    user.current_level = next((lvl["id"] for lvl in LEVELS if lvl["id"] not in done), len(LEVELS) + 1)
    db.commit()
    return LevelCompleteOut(message=f"Lesson {payload.level_id} complete!", xp_gained=level["xp_reward"],
                            total_xp=user.xp, current_level=user.current_level)
