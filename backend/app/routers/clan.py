# backend/app/routers/clan.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from ..database import get_db
from ..auth import get_current_user
from ..models.clan import ClanRepository, BADGE_EMOJIS, BADGE_COLORS

router = APIRouter(prefix="/clan", tags=["Clans"])

# ── Schemas ───────────────────────────────────────────────────────────
class CreateClanRequest(BaseModel):
    name:        str
    description: str  = ""
    badge_emoji: str  = "🔥"
    badge_color: str  = "#ef4444"
    is_open:     bool = True

class PostMessageRequest(BaseModel):
    body:     str
    msg_type: str = "text"   # text / question / resource / announcement

class AssignMatchupRequest(BaseModel):
    war_id:      str
    attacker_id: str
    defender_id: str
    topic:       str

class DeclareWarRequest(BaseModel):
    target_clan_id: str
    topic:          str

class WarBattleRequest(BaseModel):
    matchup_id: str
    score:      int

class PromoteRequest(BaseModel):
    user_id:  str
    new_role: str   # member / co_leader

# ── Clan Discovery ────────────────────────────────────────────────────
@router.get("/leaderboard")
def clan_leaderboard(conn=Depends(get_db)):
    repo = ClanRepository(conn)
    return repo.get_top_clans(50)

@router.get("/search")
def search_clans(q: str = "", conn=Depends(get_db)):
    repo = ClanRepository(conn)
    if not q:
        return repo.get_top_clans(20)
    return repo.search_clans(q)

@router.get("/badges")
def get_badge_options():
    return {"emojis": BADGE_EMOJIS, "colors": BADGE_COLORS}

# ── My Clan ───────────────────────────────────────────────────────────
@router.get("/mine")
def get_my_clan(
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    repo = ClanRepository(conn)
    clan = repo.get_my_clan(current_user["id"])
    if not clan:
        return {"in_clan": False}
    members = repo.get_members(clan["id"])
    war     = repo.get_active_war(clan["id"])
    return {
        "in_clan": True,
        "clan":    clan,
        "members": members,
        "active_war": war.__dict__ if war else None,
    }

# ── Create Clan ───────────────────────────────────────────────────────
@router.post("/create")
def create_clan(
    data: CreateClanRequest,
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    repo = ClanRepository(conn)

    # Check already in a clan
    existing = repo.get_my_clan(current_user["id"])
    if existing and existing.get("in_clan"):
        raise HTTPException(
            status_code=400,
            detail="Leave your current clan before creating a new one"
        )

    if len(data.name) < 3 or len(data.name) > 30:
        raise HTTPException(
            status_code=400,
            detail="Clan name must be 3–30 characters"
        )

    try:
        clan = repo.create_clan(
            name=data.name,
            description=data.description,
            leader_id=current_user["id"],
            badge_emoji=data.badge_emoji,
            badge_color=data.badge_color,
            is_open=data.is_open,
        )
        return {"message": "Clan created!", "clan": clan.__dict__}
    except Exception as e:
        if "UNIQUE" in str(e):
            raise HTTPException(
                status_code=400,
                detail="A clan with that name already exists"
            )
        raise

# ── Join Clan ─────────────────────────────────────────────────────────
@router.post("/join/{clan_id}")
def join_clan(
    clan_id: str,
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    repo = ClanRepository(conn)

    existing = repo.get_my_clan(current_user["id"])
    if existing and existing.get("in_clan"):
        raise HTTPException(
            status_code=400,
            detail="Leave your current clan first"
        )

    success = repo.join_clan(clan_id, current_user["id"])
    if not success:
        raise HTTPException(
            status_code=400,
            detail="Cannot join this clan (full or invite-only)"
        )

    # Award clan XP from user's existing XP
    user_r = conn.execute(
        "SELECT xp FROM users WHERE id=?", [current_user["id"]]
    )
    if user_r.rows:
        repo.add_xp_to_clan(clan_id, user_r.rows[0][0] // 10)

    return {"message": "Joined clan successfully!"}

# ── Leave Clan ────────────────────────────────────────────────────────
@router.post("/leave")
def leave_clan(
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    repo    = ClanRepository(conn)
    my_clan = repo.get_my_clan(current_user["id"])
    if not my_clan:
        raise HTTPException(status_code=400, detail="Not in a clan")

    if my_clan["my_role"] == "leader":
        raise HTTPException(
            status_code=400,
            detail="Transfer leadership before leaving"
        )

    success = repo.leave_clan(my_clan["id"], current_user["id"])
    if not success:
        raise HTTPException(status_code=400, detail="Could not leave clan")

    return {"message": "Left clan"}

# ── Clan Detail ───────────────────────────────────────────────────────
@router.get("/{clan_id}")
def get_clan(clan_id: str, conn=Depends(get_db)):
    repo    = ClanRepository(conn)
    clan    = repo.get_clan(clan_id)
    if not clan:
        raise HTTPException(status_code=404, detail="Clan not found")
    members = repo.get_members(clan_id)
    return {"clan": clan.__dict__, "members": members}

# ── Promote Member ────────────────────────────────────────────────────
@router.post("/promote")
def promote_member(
    data: PromoteRequest,
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    repo    = ClanRepository(conn)
    my_clan = repo.get_my_clan(current_user["id"])
    if not my_clan:
        raise HTTPException(status_code=403, detail="Not in a clan")

    success = repo.promote_member(
        my_clan["id"], data.user_id, data.new_role, current_user["id"]
    )
    if not success:
        raise HTTPException(status_code=403, detail="No permission to promote")

    return {"message": f"Member promoted to {data.new_role}"}

# ── Study Room Messages ───────────────────────────────────────────────
@router.get("/room/messages")
def get_messages(
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    repo    = ClanRepository(conn)
    my_clan = repo.get_my_clan(current_user["id"])
    if not my_clan:
        raise HTTPException(status_code=403, detail="Join a clan first")

    messages = repo.get_messages(my_clan["id"], limit=100)
    return {"messages": messages, "clan_id": my_clan["id"]}

@router.post("/room/post")
def post_message(
    data: PostMessageRequest,
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    repo    = ClanRepository(conn)
    my_clan = repo.get_my_clan(current_user["id"])
    if not my_clan:
        raise HTTPException(status_code=403, detail="Join a clan first")

    if not data.body.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    if len(data.body) > 1000:
        raise HTTPException(status_code=400, detail="Message too long (max 1000 chars)")

    valid_types = {"text","question","resource","announcement"}
    if data.msg_type not in valid_types:
        data.msg_type = "text"

    msg = repo.post_message(
        my_clan["id"], current_user["id"],
        data.body.strip(), data.msg_type
    )
    return msg

# ── Clan Wars ─────────────────────────────────────────────────────────
@router.post("/war/declare")
def declare_war(
    data: DeclareWarRequest,
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    repo    = ClanRepository(conn)
    my_clan = repo.get_my_clan(current_user["id"])

    if not my_clan:
        raise HTTPException(status_code=403, detail="Not in a clan")
    if my_clan["my_role"] not in ("leader", "co_leader"):
        raise HTTPException(status_code=403, detail="Only leaders can declare war")

    # Check not already at war
    existing_war = repo.get_active_war(my_clan["id"])
    if existing_war:
        raise HTTPException(
            status_code=400,
            detail="Your clan is already in a war"
        )

    if data.target_clan_id == my_clan["id"]:
        raise HTTPException(
            status_code=400,
            detail="Cannot declare war against your own clan"
        )

    war = repo.declare_war(my_clan["id"], data.target_clan_id, data.topic)
    return {
        "message": "War declared! 24-hour preparation phase begins.",
        "war":     war.__dict__,
    }

@router.get("/war/{war_id}")
def get_war(
    war_id: str,
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    repo     = ClanRepository(conn)
    war      = repo.get_war(war_id)
    if not war:
        raise HTTPException(status_code=404, detail="War not found")
    matchups = repo.get_war_matchups(war_id)
    return {"war": war.__dict__, "matchups": matchups}

@router.post("/war/assign")
def assign_matchup(
    data: AssignMatchupRequest,
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    repo    = ClanRepository(conn)
    my_clan = repo.get_my_clan(current_user["id"])

    if not my_clan:
        raise HTTPException(status_code=403, detail="Not in a clan")
    if my_clan["my_role"] not in ("leader","co_leader"):
        raise HTTPException(status_code=403, detail="Only leaders can assign matchups")

    matchup = repo.assign_matchup(
        data.war_id, data.attacker_id, data.defender_id, data.topic
    )
    return {"message": "Matchup assigned!", "matchup": matchup}

@router.post("/war/battle")
def submit_war_battle(
    data: WarBattleRequest,
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    repo   = ClanRepository(conn)
    result = repo.submit_war_battle(
        data.matchup_id, current_user["id"], data.score
    )
    return result

@router.get("/war/active/mine")
def my_active_war(
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    repo    = ClanRepository(conn)
    my_clan = repo.get_my_clan(current_user["id"])
    if not my_clan:
        return {"has_war": False}

    war = repo.get_active_war(my_clan["id"])
    if not war:
        return {"has_war": False}

    matchups    = repo.get_war_matchups(war.id)
    my_matchups = [m for m in matchups
                   if m["attacker_id"] == current_user["id"]
                   or m["defender_id"] == current_user["id"]]

    return {
        "has_war":    True,
        "war":        war.__dict__,
        "matchups":   matchups,
        "my_matchups": my_matchups,
    }
