import random
from typing import Optional

class BattleEngine:
    BASE_HERO_DMG = 20
    CRIT_MULTIPLIER = 1.5
    CRIT_CHANCE = 0.15  # 15% critical hit chance

    def process_answer(
        self,
        session: BattleSession,
        is_correct: bool,
        hero: Hero,
        monster: MonsterInstance,
        skill_active: Optional[str] = None
    ) -> BattleResult:

        if is_correct:
            return self._hero_attacks(session, hero, monster, skill_active)
        else:
            return self._monster_attacks(session, hero, monster)

    def _hero_attacks(
        self, session, hero, monster, skill_active=None
    ) -> BattleResult:
        damage = hero.attack_power

        # Apply skill multiplier
        if skill_active == 'double_strike':
            damage *= 2

        # Critical hit roll
        is_crit = random.random() < self.CRIT_CHANCE
        if is_crit:
            damage = int(damage * self.CRIT_MULTIPLIER)

        monster.current_hp = max(0, monster.current_hp - damage)
        xp = self._calc_xp(damage, is_crit)

        return BattleResult(
            action='hero_attack',
            damage=damage,
            is_critical=is_crit,
            xp_gained=xp,
            monster_defeated=monster.current_hp == 0,
            player_hp=session.player_hp,
            monster_hp=monster.current_hp
        )

    def _monster_attacks(
        self, session, hero, monster
    ) -> BattleResult:
        # Reduce by hero defense
        raw_dmg = monster.attack_power
        defense_factor = 1 - (hero.defense / 200)  # 10 def = 5% reduction
        damage = max(1, int(raw_dmg * defense_factor))

        session.player_hp = max(0, session.player_hp - damage)

        return BattleResult(
            action='monster_attack',
            damage=damage,
            is_critical=False,
            xp_gained=0,
            player_defeated=session.player_hp == 0,
            player_hp=session.player_hp,
            monster_hp=monster.current_hp
        )

    def _calc_xp(self, damage: int, is_crit: bool) -> int:
        base = damage // 2
        return int(base * 1.5) if is_crit else base
