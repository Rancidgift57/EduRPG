import math

class GamificationEngine:
    # XP Sources
    XP_TABLE = {
        'lesson_complete': 20,
        'quiz_pass': 50,
        'monster_defeat': 75,
        'boss_defeat': 200,
        'perfect_quiz': 30,    # bonus
        'daily_login': 10,
        'streak_3': 100,
        'streak_7': 250,
    }

    def level_from_xp(self, xp: int) -> int:
        # Formula: Level = floor(sqrt(xp / 100))
        return max(1, int(math.sqrt(xp / 100)))

    def xp_for_level(self, level: int) -> int:
        return (level ** 2) * 100

    def award_xp(
        self, user_id: str, source: str, bonus_xp: int = 0
    ) -> dict:
        amount = self.XP_TABLE.get(source, 0) + bonus_xp
        user = self.db.get_user(user_id)
        old_level = self.level_from_xp(user.xp)
        user.xp += amount
        new_level = self.level_from_xp(user.xp)

        leveled_up = new_level > old_level
        if leveled_up:
            user.level = new_level
            self._unlock_hero_if_eligible(user, new_level)

        self._log_xp(user_id, amount, source)
        self.db.save(user)

        return {
            'xp_gained': amount,
            'total_xp': user.xp,
            'level': new_level,
            'leveled_up': leveled_up,
            'new_hero_unlocked': leveled_up and new_level in HERO_UNLOCK_LEVELS
        }

    def update_streak(self, user_id: str) -> dict:
        user = self.db.get_user(user_id)
        today = date.today()
        yesterday = today - timedelta(days=1)

        if user.last_login and user.last_login.date() == yesterday:
            user.streak += 1
        elif not user.last_login or user.last_login.date() < yesterday:
            user.streak = 1

        user.last_login = datetime.now()
        bonus_xp = self.XP_TABLE.get(f'streak_{user.streak}', 0)

        return { 'streak': user.streak, 'bonus_xp': bonus_xp }

def check_and_award_badges(self, user_id: str, context: dict):
        rules = [
            { 'badge': 'First Blood',   'condition': context.get('monsters_slain') == 1 },
            { 'badge': 'Scholar',       'condition': context.get('lessons_done', 0) >= 5 },
            { 'badge': '7-Day Streak',  'condition': context.get('streak', 0) >= 7 },
            { 'badge': 'Dragon Slayer', 'condition': context.get('bosses_defeated', 0) >= 1 },
            { 'badge': 'Perfect Score', 'condition': context.get('perfect_quizzes', 0) >= 1 },
            { 'badge': 'Speed Kill',    'condition': context.get('fast_wins', 0) >= 3 },
            { 'badge': 'Guild King',    'condition': context.get('leaderboard_rank') == 1 },
        ]
        awarded = []
        for rule in rules:
            if rule['condition']:
                already = self.db.has_badge(user_id, rule['badge'])
                if not already:
                    self.db.award_badge(user_id, rule['badge'])
                    awarded.append(rule['badge'])
        return awarded
