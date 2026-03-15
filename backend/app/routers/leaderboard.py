from fastapi import APIRouter, Depends, HTTPException, status
from ..database import get_db
from ..auth import get_current_user
from ..models.user import UserRepository

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])


# ─── Global Leaderboard ───────────────────────────────────
@router.get("/global")
def global_leaderboard(
    limit: int = 10,
    conn=Depends(get_db)
):
    repo = UserRepository(conn)
    users = repo.get_top_by_xp(limit)

    return [
        {
            "rank":     i + 1,
            "user_id":  u.id,
            "username": u.username,
            "xp":       u.xp,
            "level":    u.level,
            "streak":   u.streak,
        }
        for i, u in enumerate(users)
    ]


# ─── Weekly Leaderboard ───────────────────────────────────
@router.get("/weekly")
def weekly_leaderboard(
    limit: int = 10,
    conn=Depends(get_db)
):
    from datetime import datetime, timedelta

    # Get start of current week (Monday)
    today = datetime.utcnow()
    week_start = (today - timedelta(days=today.weekday())).isoformat()

    # ─── Weekly Leaderboard ─── replace the query section
    rows = conn.execute(
        """SELECT user_id, SUM(amount) as weekly_xp
            FROM xp_log
            WHERE earned_at >= ?
            GROUP BY user_id
            ORDER BY weekly_xp DESC
            LIMIT ?""",
        [week_start, limit]
        )

# ✅ use .rows not .fetchall()
    result = []
    for row in rows.rows:
        user = repo.get_by_id(row[0])
        if user:
            result.append({
                "rank":      len(result) + 1,
                "user_id":   user.id,
                "username":  user.username,
                "weekly_xp": row[1],
                "level":     user.level,
            })
    return result


# ─── My Rank ──────────────────────────────────────────────
# ✅ Replace fetchone() with .rows[0]
@router.get("/my-rank")
def get_my_rank(
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    row = conn.execute(
        """SELECT COUNT(*) FROM users
           WHERE xp > (SELECT xp FROM users WHERE id = ?)
           AND is_active = 1""",
        [current_user["id"]]
    )
    rank = (row.rows[0][0] + 1) if row.rows else 1

    user_row = conn.execute(
        "SELECT xp, level, streak FROM users WHERE id = ?",
        [current_user["id"]]
    )
    u = user_row.rows[0] if user_row.rows else [0, 1, 0]

    return {
        "rank":     rank,
        "user_id":  current_user["id"],
        "username": current_user["username"],
        "xp":       u[0],
        "level":    u[1],
        "streak":   u[2],
    }