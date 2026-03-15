import requests
import json
from .config import settings


class TursoClient:
    """
    Direct HTTP client for Turso — works on all platforms
    including Windows where libsql_client WebSocket fails
    """

    def __init__(self):
        # Convert libsql:// to https:// for HTTP API
        url = settings.TURSO_DATABASE_URL
        url = url.replace("libsql://", "https://")
        url = url.replace("wss://", "https://")
        self.base_url  = f"{url}/v2/pipeline"
        self.headers   = {
            "Authorization": f"Bearer {settings.TURSO_AUTH_TOKEN}",
            "Content-Type":  "application/json",
        }

    def execute(self, sql: str, args: list = None) -> "TursoResult":
        """Execute a single SQL statement"""
        stmt = {"type": "execute", "stmt": {"sql": sql}}

        if args:
            stmt["stmt"]["args"] = [
                self._encode_value(a) for a in args
            ]

        payload = {
            "requests": [
                stmt,
                {"type": "close"}
            ]
        }

        response = requests.post(
            self.base_url,
            headers=self.headers,
            json=payload,
            timeout=10
        )

        if response.status_code != 200:
            raise Exception(
                f"Turso HTTP error {response.status_code}: {response.text}"
            )

        data    = response.json()
        result  = data["results"][0]

        if result["type"] == "error":
            raise Exception(f"SQL error: {result['error']['message']}")

        return TursoResult(result["response"]["result"])

    def batch(self, statements: list[tuple]) -> None:
        """Execute multiple SQL statements in one request"""
        requests_list = []

        for item in statements:
            if isinstance(item, tuple):
                sql, args = item[0], item[1] if len(item) > 1 else []
            else:
                sql, args = item, []

            stmt = {"type": "execute", "stmt": {"sql": sql}}
            if args:
                stmt["stmt"]["args"] = [
                    self._encode_value(a) for a in args
                ]
            requests_list.append(stmt)

        requests_list.append({"type": "close"})

        payload  = {"requests": requests_list}
        response = requests.post(
            self.base_url,
            headers=self.headers,
            json=payload,
            timeout=10
        )

        if response.status_code != 200:
            raise Exception(
                f"Turso HTTP error {response.status_code}: {response.text}"
            )

    def _encode_value(self, value):
        """Convert Python value to Turso API format"""
        if value is None:
            return {"type": "null"}
        elif isinstance(value, bool):
            return {"type": "integer", "value": str(int(value))}
        elif isinstance(value, int):
            return {"type": "integer", "value": str(value)}
        elif isinstance(value, float):
            return {"type": "float",   "value": str(value)}
        else:
            return {"type": "text",    "value": str(value)}

    def close(self):
        pass  # No persistent connection to close with HTTP


class TursoResult:
    """Wraps Turso HTTP API result to match libsql_client interface"""

    def __init__(self, result: dict):
        self._result = result
        cols         = [c["name"] for c in result.get("cols", [])]
        raw_rows     = result.get("rows", [])
        self.rows    = [
            TursoRow(cols, row) for row in raw_rows
        ]


class TursoRow:
    """Makes rows accessible by index like row[0], row[1]"""

    def __init__(self, cols: list, values: list):
        self._cols   = cols
        self._values = [self._decode(v) for v in values]

    def _decode(self, v):
        if v["type"] == "null":
            return None
        elif v["type"] == "integer":
            return int(v["value"])
        elif v["type"] == "float":
            return float(v["value"])
        else:
            return v["value"]

    def __getitem__(self, index):
        return self._values[index]

    def __len__(self):
        return len(self._values)


# ─── Public API ───────────────────────────────────────────────────────
def get_connection() -> TursoClient:
    return TursoClient()


def get_db():
    client = get_connection()
    try:
        yield client
    finally:
        client.close()


def create_tables():
    client = get_connection()

    tables = [
        """CREATE TABLE IF NOT EXISTS users (
            id            TEXT PRIMARY KEY,
            username      TEXT UNIQUE NOT NULL,
            email         TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            xp            INTEGER DEFAULT 0,
            level         INTEGER DEFAULT 1,
            streak        INTEGER DEFAULT 0,
            last_login    TEXT,
            created_at    TEXT NOT NULL,
            is_active     INTEGER DEFAULT 1
        )""",
        """CREATE TABLE IF NOT EXISTS heroes (
            id           TEXT PRIMARY KEY,
            name         TEXT NOT NULL,
            subject      TEXT NOT NULL,
            attack_power INTEGER DEFAULT 20,
            defense      INTEGER DEFAULT 10,
            max_hp       INTEGER DEFAULT 100,
            skill_name   TEXT,
            skill_effect TEXT,
            sprite_key   TEXT,
            unlock_level INTEGER DEFAULT 1
        )""",
        """CREATE TABLE IF NOT EXISTS user_heroes (
            user_id    TEXT NOT NULL,
            hero_id    TEXT NOT NULL,
            is_active  INTEGER DEFAULT 0,
            times_used INTEGER DEFAULT 0,
            PRIMARY KEY (user_id, hero_id)
        )""",
        """CREATE TABLE IF NOT EXISTS monsters (
            id           TEXT PRIMARY KEY,
            name         TEXT NOT NULL,
            topic        TEXT NOT NULL,
            subject      TEXT NOT NULL,
            difficulty   INTEGER DEFAULT 1,
            max_hp       INTEGER DEFAULT 100,
            attack_power INTEGER DEFAULT 10,
            xp_reward    INTEGER DEFAULT 50,
            sprite_key   TEXT,
            is_boss      INTEGER DEFAULT 0
        )""",
        """CREATE TABLE IF NOT EXISTS battle_sessions (
            id              TEXT PRIMARY KEY,
            user_id         TEXT NOT NULL,
            hero_id         TEXT NOT NULL,
            monster_id      TEXT NOT NULL,
            player_hp       INTEGER NOT NULL,
            monster_hp      INTEGER NOT NULL,
            status          TEXT DEFAULT 'active',
            xp_earned       INTEGER DEFAULT 0,
            questions_asked INTEGER DEFAULT 0,
            correct_count   INTEGER DEFAULT 0,
            started_at      TEXT NOT NULL,
            ended_at        TEXT
        )""",
        """CREATE TABLE IF NOT EXISTS questions (
            id            TEXT PRIMARY KEY,
            topic         TEXT NOT NULL,
            subject       TEXT NOT NULL,
            body          TEXT NOT NULL,
            type          TEXT DEFAULT 'mcq',
            explanation   TEXT,
            difficulty    INTEGER DEFAULT 1,
            options_json  TEXT NOT NULL,
            correct_index INTEGER NOT NULL
        )""",
        """CREATE TABLE IF NOT EXISTS xp_log (
            id        TEXT PRIMARY KEY,
            user_id   TEXT NOT NULL,
            amount    INTEGER NOT NULL,
            source    TEXT,
            earned_at TEXT NOT NULL
        )""",
        """CREATE TABLE IF NOT EXISTS achievements (
            id          TEXT PRIMARY KEY,
            name        TEXT UNIQUE NOT NULL,
            description TEXT,
            badge_icon  TEXT
        )""",
        """CREATE TABLE IF NOT EXISTS user_achievements (
            user_id        TEXT NOT NULL,
            achievement_id TEXT NOT NULL,
            earned_at      TEXT NOT NULL,
            PRIMARY KEY (user_id, achievement_id)
        )""",
        # Add these to your existing tables list in create_tables()
        """CREATE TABLE IF NOT EXISTS multiplayer_battles (
            id                  TEXT PRIMARY KEY,
            attacker_id         TEXT NOT NULL,
            defender_id         TEXT NOT NULL,
            attacker_questions  TEXT DEFAULT '[]',
            defender_questions  TEXT DEFAULT '[]',
            attacker_answers    TEXT DEFAULT '[]',
            defender_answers    TEXT DEFAULT '[]',
            attacker_score      INTEGER DEFAULT 0,
            defender_score      INTEGER DEFAULT 0,
            status              TEXT DEFAULT 'pending',
            winner_id           TEXT,
            trophies_wagered    INTEGER DEFAULT 20,
            created_at          TEXT NOT NULL,
            expires_at          TEXT NOT NULL
        )""",
        """CREATE TABLE IF NOT EXISTS player_rankings (
            user_id      TEXT PRIMARY KEY,
            trophies     INTEGER DEFAULT 100,
            league       TEXT DEFAULT 'Bronze',
            wins         INTEGER DEFAULT 0,
            losses       INTEGER DEFAULT 0,
            attack_wins  INTEGER DEFAULT 0,
            defense_wins INTEGER DEFAULT 0,
            win_streak   INTEGER DEFAULT 0
        )""",
        ]

    for table in tables:
        client.execute(table)

    client.close()
    print("All tables created successfully!")