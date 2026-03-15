import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
    id: text('id').primaryKey(),
    username: text('username').notNull().unique(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    xp: integer('xp').notNull().default(0),
    level: integer('level').notNull().default(1),
    streak: integer('streak').notNull().default(0),
    createdAt: text('created_at').notNull(),
});

export const heroes = sqliteTable('heroes', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    subject: text('subject').notNull(),
    attackPower: integer('attack_power').notNull().default(20),
    defense: integer('defense').notNull().default(10),
    maxHp: integer('max_hp').notNull().default(100),
    skillName: text('skill_name'),
    spriteKey: text('sprite_key'),
    unlockLevel: integer('unlock_level').notNull().default(1),
});

export const monsters = sqliteTable('monsters', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    topic: text('topic').notNull(),
    subject: text('subject').notNull(),
    difficulty: integer('difficulty').notNull().default(1),
    maxHp: integer('max_hp').notNull().default(100),
    attackPower: integer('attack_power').notNull().default(10),
    xpReward: integer('xp_reward').notNull().default(50),
    isBoss: integer('is_boss').notNull().default(0), // SQLite has no boolean
});

export const battleSessions = sqliteTable('battle_sessions', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    heroId: text('hero_id').notNull(),
    monsterId: text('monster_id').notNull(),
    playerHp: integer('player_hp').notNull(),
    monsterHp: integer('monster_hp').notNull(),
    status: text('status').notNull().default('active'),
    xpEarned: integer('xp_earned').default(0),
    startedAt: text('started_at').notNull(),
});

export const questions = sqliteTable('questions', {
    id: text('id').primaryKey(),
    topic: text('topic').notNull(),
    body: text('body').notNull(),
    type: text('type').default('mcq'),
    explanation: text('explanation'),
    difficulty: integer('difficulty').default(1),
    optionsJson: text('options_json').notNull(), // store options as JSON string
    correctIndex: integer('correct_index').notNull(),
});

export const xpLog = sqliteTable('xp_log', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    amount: integer('amount').notNull(),
    source: text('source'),
    earnedAt: text('earned_at').notNull(),
});