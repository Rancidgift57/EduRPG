# backend/app/models/clan.py
from dataclasses import dataclass
from typing import Optional
from datetime import datetime, timedelta
import uuid, json


# ── Data Classes ──────────────────────────────────────────────────────

@dataclass
class Clan:
    id:          str
    name:        str
    tag:         str           # e.g. #STUDY42
    description: str
    leader_id:   str
    badge_emoji: str
    badge_color: str
    total_xp:    int
    member_count: int
    max_members: int
    is_open:     bool          # open = anyone can join; closed = invite only
    level:       int
    created_at:  str

@dataclass
class ClanMember:
    clan_id:    str
    user_id:    str
    username:   str
    role:       str            # leader / co_leader / member
    xp:         int
    level:      int
    joined_at:  str

@dataclass
class ClanMessage:
    id:         str
    clan_id:    str
    user_id:    str
    username:   str
    body:       str
    msg_type:   str            # text / question / resource / announcement
    created_at: str

@dataclass
class ClanWar:
    id:              str
    clan_a_id:       str
    clan_b_id:       str
    clan_a_name:     str
    clan_b_name:     str
    clan_a_score:    int
    clan_b_score:    int
    status:          str       # preparation / active / ended
    topic:           str
    start_time:      str
    end_time:        str
    winner_clan_id:  Optional[str]

@dataclass
class WarMatchup:
    id:           str
    war_id:       str
    attacker_id:  str          # assigned by clan leader
    defender_id:  str
    topic:        str
    attacker_score: int
    defender_score: int
    status:       str          # pending / completed
    result:       Optional[str]  # attacker_won / defender_won / draw


def row_to_clan(r) -> Clan:
    return Clan(id=r[0],name=r[1],tag=r[2],description=r[3],leader_id=r[4],
                badge_emoji=r[5],badge_color=r[6],total_xp=r[7],member_count=r[8],
                max_members=r[9],is_open=bool(r[10]),level=r[11],created_at=r[12])

def row_to_war(r) -> ClanWar:
    return ClanWar(id=r[0],clan_a_id=r[1],clan_b_id=r[2],clan_a_name=r[3],
                   clan_b_name=r[4],clan_a_score=r[5],clan_b_score=r[6],
                   status=r[7],topic=r[8],start_time=r[9],end_time=r[10],
                   winner_clan_id=r[11])

BADGE_EMOJIS = ["🔥","⚡","🌟","💎","🏆","🛡️","⚔️","🧠","🚀","🎯",
                "🌊","🌙","☀️","🦁","🐉","🦅","🌸","❄️","💜","🔮"]

BADGE_COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#06b6d4",
                "#6366f1","#a855f7","#ec4899","#14b8a6","#f59e0b"]

CLAN_LEVELS = {1:0,2:5000,3:15000,4:35000,5:75000}  # xp thresholds


class ClanRepository:

    def __init__(self, client):
        self.db = client

    # ── Table creation ────────────────────────────────────────────────
    def create_tables(self):
        statements = [
            """CREATE TABLE IF NOT EXISTS clans (
                id           TEXT PRIMARY KEY,
                name         TEXT UNIQUE NOT NULL,
                tag          TEXT UNIQUE NOT NULL,
                description  TEXT DEFAULT '',
                leader_id    TEXT NOT NULL,
                badge_emoji  TEXT DEFAULT '🔥',
                badge_color  TEXT DEFAULT '#ef4444',
                total_xp     INTEGER DEFAULT 0,
                member_count INTEGER DEFAULT 1,
                max_members  INTEGER DEFAULT 30,
                is_open      INTEGER DEFAULT 1,
                level        INTEGER DEFAULT 1,
                created_at   TEXT NOT NULL
            )""",
            """CREATE TABLE IF NOT EXISTS clan_members (
                clan_id   TEXT NOT NULL,
                user_id   TEXT NOT NULL,
                role      TEXT DEFAULT 'member',
                joined_at TEXT NOT NULL,
                PRIMARY KEY (clan_id, user_id)
            )""",
            """CREATE TABLE IF NOT EXISTS clan_messages (
                id         TEXT PRIMARY KEY,
                clan_id    TEXT NOT NULL,
                user_id    TEXT NOT NULL,
                body       TEXT NOT NULL,
                msg_type   TEXT DEFAULT 'text',
                created_at TEXT NOT NULL
            )""",
            """CREATE TABLE IF NOT EXISTS clan_wars (
                id             TEXT PRIMARY KEY,
                clan_a_id      TEXT NOT NULL,
                clan_b_id      TEXT NOT NULL,
                clan_a_name    TEXT NOT NULL,
                clan_b_name    TEXT NOT NULL,
                clan_a_score   INTEGER DEFAULT 0,
                clan_b_score   INTEGER DEFAULT 0,
                status         TEXT DEFAULT 'preparation',
                topic          TEXT NOT NULL,
                start_time     TEXT NOT NULL,
                end_time       TEXT NOT NULL,
                winner_clan_id TEXT
            )""",
            """CREATE TABLE IF NOT EXISTS war_matchups (
                id             TEXT PRIMARY KEY,
                war_id         TEXT NOT NULL,
                attacker_id    TEXT NOT NULL,
                defender_id    TEXT NOT NULL,
                topic          TEXT NOT NULL,
                attacker_score INTEGER DEFAULT 0,
                defender_score INTEGER DEFAULT 0,
                status         TEXT DEFAULT 'pending',
                result         TEXT
            )""",
            """CREATE TABLE IF NOT EXISTS clan_invites (
                id         TEXT PRIMARY KEY,
                clan_id    TEXT NOT NULL,
                to_user_id TEXT NOT NULL,
                from_user_id TEXT NOT NULL,
                status     TEXT DEFAULT 'pending',
                created_at TEXT NOT NULL
            )""",
        ]
        for sql in statements:
            self.db.execute(sql)

    # ── Clan CRUD ─────────────────────────────────────────────────────
    def create_clan(self, name: str, description: str, leader_id: str,
                    badge_emoji: str, badge_color: str, is_open: bool) -> Clan:
        import random, string
        clan_id = str(uuid.uuid4())
        tag = "#" + "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
        now = datetime.utcnow().isoformat()

        self.db.execute(
            """INSERT INTO clans
               (id,name,tag,description,leader_id,badge_emoji,badge_color,
                total_xp,member_count,max_members,is_open,level,created_at)
               VALUES (?,?,?,?,?,?,?,0,1,30,?,1,?)""",
            [clan_id,name,tag,description,leader_id,
             badge_emoji,badge_color,int(is_open),now]
        )
        self.db.execute(
            """INSERT INTO clan_members (clan_id,user_id,role,joined_at)
               VALUES (?,?,'leader',?)""",
            [clan_id, leader_id, now]
        )
        r = self.db.execute("SELECT * FROM clans WHERE id=?",[clan_id])
        return row_to_clan(r.rows[0])

    def get_clan(self, clan_id: str) -> Optional[Clan]:
        r = self.db.execute("SELECT * FROM clans WHERE id=?",[clan_id])
        return row_to_clan(r.rows[0]) if r.rows else None

    def get_clan_by_tag(self, tag: str) -> Optional[Clan]:
        r = self.db.execute("SELECT * FROM clans WHERE tag=?",[tag.upper()])
        return row_to_clan(r.rows[0]) if r.rows else None

    def search_clans(self, query: str) -> list:
        r = self.db.execute(
            """SELECT c.*,u.username as leader_name FROM clans c
               JOIN users u ON c.leader_id=u.id
               WHERE c.name LIKE ? OR c.tag LIKE ?
               ORDER BY c.total_xp DESC LIMIT 20""",
            [f"%{query}%", f"%{query}%"]
        )
        return [{"id":row[0],"name":row[1],"tag":row[2],"description":row[3],
                 "badge_emoji":row[5],"badge_color":row[6],"total_xp":row[7],
                 "member_count":row[8],"max_members":row[9],"is_open":bool(row[10]),
                 "level":row[11],"leader_name":row[13]} for row in r.rows]

    def get_top_clans(self, limit: int = 50) -> list:
        r = self.db.execute(
            """SELECT c.*,u.username as leader_name FROM clans c
               JOIN users u ON c.leader_id=u.id
               ORDER BY c.total_xp DESC LIMIT ?""", [limit]
        )
        return [{"rank":i+1,"id":row[0],"name":row[1],"tag":row[2],
                 "badge_emoji":row[5],"badge_color":row[6],"total_xp":row[7],
                 "member_count":row[8],"level":row[11],"leader_name":row[13]}
                for i,row in enumerate(r.rows)]

    def get_my_clan(self, user_id: str) -> Optional[dict]:
        r = self.db.execute(
            """SELECT c.*,cm.role FROM clans c
               JOIN clan_members cm ON c.id=cm.clan_id
               WHERE cm.user_id=?""", [user_id]
        )
        if not r.rows:
            return None
        row = r.rows[0]
        clan = row_to_clan(row)
        return {**clan.__dict__, "my_role": row[13]}

    def join_clan(self, clan_id: str, user_id: str) -> bool:
        clan = self.get_clan(clan_id)
        if not clan or not clan.is_open:
            return False
        if clan.member_count >= clan.max_members:
            return False
        # Check not already a member
        existing = self.db.execute(
            "SELECT 1 FROM clan_members WHERE clan_id=? AND user_id=?",
            [clan_id, user_id]
        )
        if existing.rows:
            return False
        now = datetime.utcnow().isoformat()
        self.db.execute(
            "INSERT INTO clan_members (clan_id,user_id,role,joined_at) VALUES (?,?,'member',?)",
            [clan_id, user_id, now]
        )
        self.db.execute(
            "UPDATE clans SET member_count=member_count+1 WHERE id=?", [clan_id]
        )
        return True

    def leave_clan(self, clan_id: str, user_id: str) -> bool:
        clan = self.get_clan(clan_id)
        if not clan:
            return False
        if clan.leader_id == user_id:
            return False  # Leader must transfer first
        self.db.execute(
            "DELETE FROM clan_members WHERE clan_id=? AND user_id=?",
            [clan_id, user_id]
        )
        self.db.execute(
            "UPDATE clans SET member_count=MAX(0,member_count-1) WHERE id=?",
            [clan_id]
        )
        return True

    def get_members(self, clan_id: str) -> list:
        r = self.db.execute(
            """SELECT cm.user_id,cm.role,cm.joined_at,
                      u.username,u.xp,u.level
               FROM clan_members cm
               JOIN users u ON cm.user_id=u.id
               WHERE cm.clan_id=?
               ORDER BY u.xp DESC""",
            [clan_id]
        )
        return [{"user_id":row[0],"role":row[1],"joined_at":row[2],
                 "username":row[3],"xp":row[4],"level":row[5]}
                for row in r.rows]

    def promote_member(self, clan_id: str, user_id: str, new_role: str,
                       requester_id: str) -> bool:
        requester = self.db.execute(
            "SELECT role FROM clan_members WHERE clan_id=? AND user_id=?",
            [clan_id, requester_id]
        )
        if not requester.rows or requester.rows[0][0] not in ("leader","co_leader"):
            return False
        self.db.execute(
            "UPDATE clan_members SET role=? WHERE clan_id=? AND user_id=?",
            [new_role, clan_id, user_id]
        )
        return True

    def add_xp_to_clan(self, clan_id: str, xp: int):
        self.db.execute(
            "UPDATE clans SET total_xp=total_xp+? WHERE id=?",
            [xp, clan_id]
        )
        # Update clan level
        r = self.db.execute("SELECT total_xp FROM clans WHERE id=?",[clan_id])
        if r.rows:
            total = r.rows[0][0]
            new_level = 1
            for lvl, threshold in sorted(CLAN_LEVELS.items()):
                if total >= threshold:
                    new_level = lvl
            self.db.execute(
                "UPDATE clans SET level=? WHERE id=?", [new_level, clan_id]
            )

    def get_user_clan_id(self, user_id: str) -> Optional[str]:
        r = self.db.execute(
            "SELECT clan_id FROM clan_members WHERE user_id=?", [user_id]
        )
        return r.rows[0][0] if r.rows else None

    # ── Messages (Study Room) ─────────────────────────────────────────
    def post_message(self, clan_id: str, user_id: str, body: str,
                     msg_type: str = "text") -> dict:
        msg_id = str(uuid.uuid4())
        now    = datetime.utcnow().isoformat()
        self.db.execute(
            """INSERT INTO clan_messages
               (id,clan_id,user_id,body,msg_type,created_at)
               VALUES (?,?,?,?,?,?)""",
            [msg_id, clan_id, user_id, body, msg_type, now]
        )
        u = self.db.execute("SELECT username FROM users WHERE id=?",[user_id])
        username = u.rows[0][0] if u.rows else "Unknown"
        return {"id":msg_id,"clan_id":clan_id,"user_id":user_id,
                "username":username,"body":body,"msg_type":msg_type,"created_at":now}

    def get_messages(self, clan_id: str, limit: int = 50) -> list:
        r = self.db.execute(
            """SELECT cm.id,cm.clan_id,cm.user_id,u.username,
                      cm.body,cm.msg_type,cm.created_at
               FROM clan_messages cm
               JOIN users u ON cm.user_id=u.id
               WHERE cm.clan_id=?
               ORDER BY cm.created_at DESC LIMIT ?""",
            [clan_id, limit]
        )
        msgs = [{"id":row[0],"clan_id":row[1],"user_id":row[2],"username":row[3],
                 "body":row[4],"msg_type":row[5],"created_at":row[6]}
                for row in r.rows]
        return list(reversed(msgs))  # oldest first for chat display

    # ── Clan Wars ─────────────────────────────────────────────────────
    def declare_war(self, clan_a_id: str, clan_b_id: str, topic: str) -> ClanWar:
        war_id = str(uuid.uuid4())
        now    = datetime.utcnow()
        # Preparation 24h, then war starts and lasts 24h
        start  = (now + timedelta(hours=24)).isoformat()
        end    = (now + timedelta(hours=48)).isoformat()

        ca = self.get_clan(clan_a_id)
        cb = self.get_clan(clan_b_id)

        self.db.execute(
            """INSERT INTO clan_wars
               (id,clan_a_id,clan_b_id,clan_a_name,clan_b_name,
                clan_a_score,clan_b_score,status,topic,
                start_time,end_time)
               VALUES (?,?,?,?,?,0,0,'preparation',?,?,?)""",
            [war_id,clan_a_id,clan_b_id,
             ca.name if ca else "Clan A",
             cb.name if cb else "Clan B",
             topic, start, end]
        )
        r = self.db.execute("SELECT * FROM clan_wars WHERE id=?",[war_id])
        return row_to_war(r.rows[0])

    def get_war(self, war_id: str) -> Optional[ClanWar]:
        r = self.db.execute("SELECT * FROM clan_wars WHERE id=?",[war_id])
        return row_to_war(r.rows[0]) if r.rows else None

    def get_active_war(self, clan_id: str) -> Optional[ClanWar]:
        r = self.db.execute(
            """SELECT * FROM clan_wars
               WHERE (clan_a_id=? OR clan_b_id=?)
               AND status IN ('preparation','active')
               ORDER BY start_time DESC LIMIT 1""",
            [clan_id, clan_id]
        )
        return row_to_war(r.rows[0]) if r.rows else None

    def assign_matchup(self, war_id: str, attacker_id: str,
                       defender_id: str, topic: str) -> dict:
        matchup_id = str(uuid.uuid4())
        self.db.execute(
            """INSERT INTO war_matchups
               (id,war_id,attacker_id,defender_id,topic,
                attacker_score,defender_score,status)
               VALUES (?,?,?,?,?,0,0,'pending')""",
            [matchup_id,war_id,attacker_id,defender_id,topic]
        )
        return {"id":matchup_id,"war_id":war_id,"attacker_id":attacker_id,
                "defender_id":defender_id,"topic":topic,"status":"pending"}

    def submit_war_battle(self, matchup_id: str, user_id: str,
                          score: int) -> dict:
        r = self.db.execute(
            "SELECT * FROM war_matchups WHERE id=?",[matchup_id]
        )
        if not r.rows:
            return {}
        row = r.rows[0]
        # row: id,war_id,attacker_id,defender_id,topic,atk_score,def_score,status,result
        attacker_id = row[2]
        defender_id = row[3]
        war_id      = row[1]

        if user_id == attacker_id:
            self.db.execute(
                "UPDATE war_matchups SET attacker_score=? WHERE id=?",
                [score, matchup_id]
            )
        elif user_id == defender_id:
            self.db.execute(
                "UPDATE war_matchups SET defender_score=? WHERE id=?",
                [score, matchup_id]
            )

        # Recheck
        r2 = self.db.execute("SELECT * FROM war_matchups WHERE id=?",[matchup_id])
        m  = r2.rows[0]
        atk_score = m[5]
        def_score = m[6]

        # Both submitted → resolve
        if atk_score > 0 and def_score > 0 and m[7] == "pending":
            if atk_score > def_score:
                result = "attacker_won"
            elif def_score > atk_score:
                result = "defender_won"
            else:
                result = "draw"
            self.db.execute(
                "UPDATE war_matchups SET status='completed',result=? WHERE id=?",
                [result, matchup_id]
            )
            # Add to war score
            war = self.get_war(war_id)
            if war:
                is_a_attacker = self._is_clan_a_member(war, attacker_id)
                if result == "attacker_won":
                    col = "clan_a_score" if is_a_attacker else "clan_b_score"
                elif result == "defender_won":
                    col = "clan_b_score" if is_a_attacker else "clan_a_score"
                else:
                    col = None
                if col:
                    self.db.execute(
                        f"UPDATE clan_wars SET {col}={col}+1 WHERE id=?",
                        [war_id]
                    )
            return {"result": result, "attacker_score": atk_score,
                    "defender_score": def_score}
        return {"status": "waiting_for_opponent"}

    def _is_clan_a_member(self, war: ClanWar, user_id: str) -> bool:
        r = self.db.execute(
            "SELECT 1 FROM clan_members WHERE clan_id=? AND user_id=?",
            [war.clan_a_id, user_id]
        )
        return bool(r.rows)

    def get_war_matchups(self, war_id: str) -> list:
        r = self.db.execute(
            """SELECT wm.*,ua.username,ud.username
               FROM war_matchups wm
               JOIN users ua ON wm.attacker_id=ua.id
               JOIN users ud ON wm.defender_id=ud.id
               WHERE wm.war_id=?""",
            [war_id]
        )
        return [{"id":row[0],"war_id":row[1],
                 "attacker_id":row[2],"defender_id":row[3],
                 "topic":row[4],"attacker_score":row[5],
                 "defender_score":row[6],"status":row[7],
                 "result":row[8],"attacker_name":row[9],
                 "defender_name":row[10]}
                for row in r.rows]

    def end_expired_wars(self):
        now = datetime.utcnow().isoformat()
        r = self.db.execute(
            "SELECT * FROM clan_wars WHERE status='active' AND end_time < ?", [now]
        )
        for row in r.rows:
            war = row_to_war(row)
            if war.clan_a_score > war.clan_b_score:
                winner = war.clan_a_id
            elif war.clan_b_score > war.clan_a_score:
                winner = war.clan_b_id
            else:
                winner = None
            self.db.execute(
                "UPDATE clan_wars SET status='ended',winner_clan_id=? WHERE id=?",
                [winner, war.id]
            )
            # Award XP to winning clan
            if winner:
                self.add_xp_to_clan(winner, 2000)
