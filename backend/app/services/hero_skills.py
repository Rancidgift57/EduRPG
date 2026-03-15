class HeroSkillEngine:
    SKILLS = {
        "double_strike": {
            "name": "Double Strike",
            "effect": "multiply_damage",
            "multiplier": 2.0,
            "cooldown_turns": 3
        },
        "shadow_dodge": {
            "name": "Shadow Dodge",
            "effect": "skip_penalty",
            "uses_per_battle": 1
        },
        "hint_spell": {
            "name": "Hint Spell",
            "effect": "reveal_option",
            "uses_per_battle": 2
        },
        "iron_shield": {
            "name": "Iron Shield",
            "effect": "damage_reduction",
            "reduction_percent": 50,
            "duration_turns": 2
        },
    }

    def activate_skill(self, skill_key: str, battle_state: dict) -> dict:
        skill = self.SKILLS.get(skill_key)
        if not skill:
            raise ValueError(f'Unknown skill: {skill_key}')
        # Apply effect to battle_state
        effect = skill['effect']
        if effect == 'multiply_damage':
            battle_state['damage_multiplier'] = skill['multiplier']
        elif effect == 'skip_penalty':
            battle_state['skip_next_penalty'] = True
        elif effect == 'reveal_option':
            battle_state['reveal_hint'] = True
        elif effect == 'damage_reduction':
            battle_state['damage_reduction'] = skill['reduction_percent'] / 100
        return battle_state
