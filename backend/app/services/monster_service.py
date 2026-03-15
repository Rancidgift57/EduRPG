class MonsterService:
    def get_monster_for_topic(self, topic: str, user_level: int) -> Monster:
        base_monster = self.db.query(Monster).filter(Monster.topic == topic).first()

        # Scale difficulty to user level
        scaled_hp = int(base_monster.max_hp * (1 + (user_level * 0.1)))
        scaled_atk = int(base_monster.attack_power * (1 + (user_level * 0.05)))

        return MonsterInstance(
            monster_id=base_monster.id,
            current_hp=scaled_hp,
            max_hp=scaled_hp,
            attack_power=scaled_atk,
        )

    def get_boss(self, module_id: str, user_level: int) -> Monster:
        boss = self.db.query(Monster).filter(Monster.is_boss == True, Monster.topic == module_id).first()
        # Boss is 2.5x harder than level equivalent
        return self.get_monster_for_topic(boss.topic, user_level * 2)
