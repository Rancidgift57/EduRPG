import redis.asyncio as redis

class LeaderboardService:
    def __init__(self):
        self.redis = redis.from_url(settings.REDIS_URL)

    async def update_score(self, user_id: str, xp_delta: int):
        # Global leaderboard
        await self.redis.zincrby('lb:global', xp_delta, user_id)
        # Weekly leaderboard
        await self.redis.zincrby('lb:weekly', xp_delta, user_id)

    async def get_top_n(self, board: str, n: int = 10) -> list[dict]:
        scores = await self.redis.zrevrange(
            f'lb:{board}', 0, n - 1, withscores=True
        )
        result = []
        for rank, (uid, score) in enumerate(scores, 1):
            user = await self.db.get_user(uid)
            result.append({
                'rank': rank,
                'user_id': uid,
                'username': user.username,
                'xp': int(score),
                'level': user.level
            })
        return result

    async def get_user_rank(self, user_id: str, board: str = 'global') -> int:
        rank = await self.redis.zrevrank(f'lb:{board}', user_id)
        return (rank or 0) + 1
