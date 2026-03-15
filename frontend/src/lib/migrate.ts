import { db } from './db';

export async function runMigrations() {

  await db.execute(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS heroes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    attack_power INTEGER DEFAULT 20,
    defense INTEGER DEFAULT 10,
    max_hp INTEGER DEFAULT 100,
    skill_name TEXT,
    sprite_key TEXT,
    unlock_level INTEGER DEFAULT 1
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS monsters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    topic TEXT NOT NULL,
    subject TEXT NOT NULL,
    difficulty INTEGER DEFAULT 1,
    max_hp INTEGER DEFAULT 100,
    attack_power INTEGER DEFAULT 10,
    xp_reward INTEGER DEFAULT 50,
    is_boss INTEGER DEFAULT 0
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS battle_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    hero_id TEXT NOT NULL,
    monster_id TEXT NOT NULL,
    player_hp INTEGER NOT NULL,
    monster_hp INTEGER NOT NULL,
    status TEXT DEFAULT 'active',
    xp_earned INTEGER DEFAULT 0,
    started_at TEXT NOT NULL
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    topic TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT DEFAULT 'mcq',
    explanation TEXT,
    difficulty INTEGER DEFAULT 1,
    options_json TEXT NOT NULL,
    correct_index INTEGER NOT NULL
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS xp_log (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    source TEXT,
    earned_at TEXT NOT NULL
  )`);

  console.log("Migrations complete!");
}