# ⚔️ EduRPG — AI-Powered Gamified Education Platform

<div align="center">

![EduRPG Banner](https://img.shields.io/badge/EduRPG-Learn.Battle.Level%20Up-purple?style=for-the-badge&logo=gamepad&logoColor=white)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python)](https://python.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Turso](https://img.shields.io/badge/Turso-SQLite-4FF8D2?style=flat-square)](https://turso.tech)
[![HuggingFace](https://img.shields.io/badge/HuggingFace-AI%20Tutor-FFD21F?style=flat-square&logo=huggingface)](https://huggingface.co)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**Turn studying into an addictive RPG battle game. Defeat monsters by answering questions correctly.**

[Live Demo](https://edu-rpg-six.vercel.app/) · [Backend API Docs](https://edurpg-api.onrender.com/docs) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [Game Systems](#-game-systems)
  - [Battle System](#battle-system)
  - [Hero System](#hero-system)
  - [Monster System](#monster-system)
  - [XP & Level System](#xp--level-system)
  - [Multiplayer System](#multiplayer-system)
  - [Clan War System](#clan-war-system)
  - [AI Tutor](#ai-tutor)
- [Frontend Pages](#-frontend-pages)
- [Deployment](#-deployment)
  - [Deploy Backend on Render](#deploy-backend-on-render)
  - [Deploy Frontend on Vercel](#deploy-frontend-on-vercel)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎮 Overview

EduRPG is a full-stack gamified education platform that transforms studying into an RPG-style battle game. Students select heroes, enter dungeons (topic areas), and battle monsters by answering quiz questions correctly. Wrong answers let monsters attack back — creating genuine learning stakes that make the experience addictive.

### Why EduRPG?

Traditional learning apps are boring. EduRPG combines:

- **RPG mechanics** — heroes, monsters, HP bars, XP, levels, skills
- **AI tutoring** — HuggingFace LLM explains wrong answers instantly
- **Multiplayer** — Clash of Clans-style async PvP with trophy system
- **Clan Wars** — Form study groups, battle rival clans in team quiz wars
- **Curated content** — hand-picked YouTube videos per topic, no API keys needed
- **Beautiful UI** — full-body SVG character animations, attack animations, damage floats

### Who Is It For?

Students aged 15–25 learning STEM subjects: Mathematics, Science, Programming, History, and AI/Technology.

---

## ✨ Features

### Core Features

| Feature | Description |
|---------|-------------|
| 🗡️ **Hero System** | 5 unique heroes — Samurai, Wizard, Ninja, Knight, Robot — each specializing in a subject |
| 👹 **Monster System** | 10+ monsters themed to topics — Loop Dragon, OOP Overlord, Calculus Titan, etc. |
| ⚔️ **Battle System** | Answer questions to attack. Wrong answer = monster attacks back. Real HP/damage mechanics |
| 🤖 **AI Tutor** | HuggingFace Mistral-7B explains wrong answers, gives hints, generates quiz questions |
| ⭐ **XP & Leveling** | Earn XP from battles, level up, unlock new heroes and harder dungeons |
| 🔥 **Streak System** | Daily login streaks with XP bonuses |
| 🏆 **Leaderboard** | Global and weekly XP rankings with league system |
| 📚 **Training Room** | Curated YouTube videos per topic — no YouTube API needed |
| 🎖️ **Achievements** | Badges for milestones: First Blood, Dragon Slayer, 7-Day Streak, etc. |

### Multiplayer Features

| Feature | Description |
|---------|-------------|
| ⚔️ **Async PvP** | Attack opponents by picking questions for them to answer |
| 🏆 **Trophy System** | Win/lose trophies based on battle outcomes |
| 👑 **League System** | Bronze → Silver → Gold → Diamond → Legend |
| 📬 **Defense Inbox** | Get notified when someone attacks you, defend within 24 hours |
| 🌍 **Matchmaking** | Find opponents within ±200 trophy range |

### 🏰 Clan War Features

| Feature | Description |
|---------|-------------|
| 🏰 **Clan Creation** | Create or join a clan (study group) of up to 15 members |
| 👑 **Clan Leader** | Leader sets the war roster, assigns battle order, and chooses topics |
| ⚔️ **Clan Wars** | Challenge rival clans to a quiz war — each member fights a 1v1 battle |
| 📋 **Battle Order** | Leader decides who fights whom and in what sequence |
| 🧮 **War Score** | Clan that wins more individual battles wins the war |
| 🏅 **Clan XP & Trophies** | Clans earn collective XP and trophies — climb the Clan Leaderboard |
| 📣 **Clan Chat** | In-clan messaging to coordinate strategy before wars |
| 🛡️ **War History** | Full log of past wars — wins, losses, and member performance |

### Technical Features

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Auth** | Secure login/register with bcrypt password hashing |
| 🌐 **REST API** | FastAPI with auto-generated OpenAPI docs |
| 🗄️ **Turso DB** | SQLite-based edge database — cloud-hosted, no local DB needed |
| 🤗 **HuggingFace** | Free AI with fallback questions if API is unavailable |
| 📱 **Responsive** | Works on desktop and mobile |

---

## 🛠️ Tech Stack

### Frontend
```
Next.js 16          — React framework with App Router
TypeScript 5        — Type safety
Tailwind CSS 4      — Utility-first styling
Axios               — HTTP client for API calls
Zustand             — Lightweight state management
Inline SVG          — Custom hand-drawn character animations
```

### Backend
```
FastAPI 0.115       — Python web framework
Python 3.11         — Server language
bcrypt 4.0.1        — Password hashing (no passlib)
python-jose         — JWT token handling
pydantic v2         — Data validation and settings
requests            — HTTP client for Turso and HuggingFace
```

### Database
```
Turso               — Cloud SQLite (libsql)
                      8GB free, globally distributed
                      No local PostgreSQL needed
                      Works via HTTP API
```

### AI Layer
```
HuggingFace         — Free inference API
Mistral-7B-Instruct — Primary model (best quality)
Phi-3-mini          — Fallback model (faster)
Zephyr-7B           — Secondary fallback
Hardcoded fallback  — Works even when AI is offline
```

### Deployment
```
Vercel              — Frontend hosting (free)
Render              — Backend hosting (free)
Turso               — Database (free)
HuggingFace         — AI API (free)
GitHub              — Source control
UptimeRobot         — Keep-alive pinging (free)
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                               │
│                                                                     │
│   Next.js 16 App (Vercel)                                          │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│   │  /        │ │ /battle  │ │/training │ │/leaderbd │            │
│   │ Hero     │ │ Battle   │ │Training  │ │Trophy    │            │
│   │ Select   │ │ Arena    │ │ Room     │ │ Board    │            │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
│   ┌──────────────────────────────────────────────────┐            │
│   │         /multiplayer  (PvP System)               │            │
│   │   Attack │  Inbox  │  Rankings  │  History       │            │
│   └──────────────────────────────────────────────────┘            │
│   ┌──────────────────────────────────────────────────┐            │
│   │           /clans  (Clan War System)              │            │
│   │  My Clan │ War Room │ Leaderboard │ War History  │            │
│   └──────────────────────────────────────────────────┘            │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ HTTPS / REST API calls (axios)
                           │
┌──────────────────────────▼──────────────────────────────────────────┐
│                   FastAPI Backend (Render)                          │
│                                                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│  │  /auth  │  │/battle  │  │/heroes  │  │/monsters│             │
│  │ Login   │  │ Engine  │  │ Select  │  │ Spawn   │             │
│  │ Register│  │ Answers │  │ Skills  │  │ Scale   │             │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│  │  /ai    │  │/ldrbd   │  │/multi   │  │/training│             │
│  │ Explain │  │ Global  │  │ PvP     │  │ Videos  │             │
│  │ Hints   │  │ Weekly  │  │ Trophies│  │ Tips    │             │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘             │
│  ┌─────────────────────────────────────────────────┐             │
│  │                   /clans                        │             │
│  │  Create │ Join │ War Start │ Submit │ Results   │             │
│  └─────────────────────────────────────────────────┘             │
└──────┬──────────────────────────────────┬───────────────────────────┘
       │                                  │
       ▼                                  ▼
┌──────────────┐                 ┌────────────────────┐
│ Turso Cloud  │                 │  HuggingFace API   │
│ (SQLite DB)  │                 │                    │
│              │                 │  Mistral-7B-Inst.  │
│  users       │                 │  Phi-3-mini        │
│  heroes      │                 │  Zephyr-7B         │
│  monsters    │                 │                    │
│  battles     │                 │  → Explain errors  │
│  questions   │                 │  → Generate quizzes│
│  xp_log      │                 │  → Give hints      │
│  rankings    │                 └────────────────────┘
│  achievements│
│  clans       │
│  clan_members│
│  clan_wars   │
│  war_battles │
└──────────────┘
```

---

## 📁 Project Structure

```
EduRPG/
│
├── backend/                          ← FastAPI Python backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   ← FastAPI app entry point
│   │   ├── config.py                 ← Settings (pydantic-settings)
│   │   ├── database.py               ← TursoClient HTTP wrapper
│   │   ├── auth.py                   ← JWT + bcrypt auth
│   │   │
│   │   ├── routers/                  ← API route handlers
│   │   │   ├── __init__.py
│   │   │   ├── auth.py               ← POST /auth/login, /register
│   │   │   ├── battle.py             ← POST /battle/start, /answer
│   │   │   ├── heroes.py             ← GET/POST /heroes/*
│   │   │   ├── leaderboard.py        ← GET /leaderboard/*
│   │   │   ├── ai_tutor.py           ← POST /ai/explain, /hint
│   │   │   ├── multiplayer.py        ← POST /multiplayer/*
│   │   │   └── clans.py              ← POST/GET /clans/* (Clan Wars)
│   │   │
│   │   ├── models/                   ← Data models + DB operations
│   │   │   ├── __init__.py
│   │   │   ├── user.py               ← User + UserRepository
│   │   │   ├── hero.py               ← Hero + HeroRepository
│   │   │   ├── monster.py            ← Monster + MonsterRepository
│   │   │   ├── battle.py             ← BattleSession + BattleRepository
│   │   │   ├── multiplayer.py        ← MultiplayerBattle + Rankings
│   │   │   └── clan.py               ← Clan + ClanWar + WarBattle
│   │   │
│   │   ├── services/                 ← Business logic
│   │   │   ├── battle_engine.py      ← Damage calc, crit hits, XP
│   │   │   ├── gamification.py       ← XP awards, level-ups, badges
│   │   │   └── clan_war_engine.py    ← War scoring, matchmaking, results
│   │   │
│   │   └── ai/
│   │       └── gemini_tutor.py       ← HuggingFace AI tutor (renamed)
│   │
│   ├── requirements.txt
│   ├── runtime.txt                   ← python-3.11.9 (for Render)
│   ├── .python-version               ← 3.11.9
│   ├── render.yaml                   ← Render deployment config
│   └── .env                          ← Local env vars (never commit)
│
├── frontend/                         ← Next.js 16 frontend
│   ├── src/
│   │   ├── app/                      ← Next.js App Router pages
│   │   │   ├── layout.tsx            ← Root layout + fonts
│   │   │   ├── page.tsx              ← Home / Hero Select
│   │   │   ├── globals.css           ← All animations + keyframes
│   │   │   ├── battle/
│   │   │   │   └── page.tsx          ← Battle Arena
│   │   │   ├── training/
│   │   │   │   └── page.tsx          ← Training Room + Videos
│   │   │   ├── leaderboard/
│   │   │   │   └── page.tsx          ← Trophy Leaderboard
│   │   │   ├── multiplayer/
│   │   │   │   ├── page.tsx          ← Multiplayer Hub
│   │   │   │   ├── attack/
│   │   │   │   │   └── page.tsx      ← Pick questions + attack
│   │   │   │   └── inbox/
│   │   │   │       └── page.tsx      ← Defend incoming attacks
│   │   │   └── clans/
│   │   │       ├── page.tsx          ← Clan Hub (create/join/manage)
│   │   │       ├── war/
│   │   │       │   └── page.tsx      ← War Room (active war view)
│   │   │       └── leaderboard/
│   │   │           └── page.tsx      ← Clan trophy leaderboard
│   │   │
│   │   ├── components/
│   │   │   ├── battle/
│   │   │   │   ├── Characters.tsx    ← All SVG hero + monster drawings
│   │   │   │   ├── HPBar.tsx         ← Animated HP bar component
│   │   │   │   └── QuizCard.tsx      ← Answer choices component
│   │   │   ├── training/
│   │   │   │   └── VideoPlayer.tsx   ← YouTube embed (hardcoded)
│   │   │   ├── ai/
│   │   │   │   └── AITutorPanel.tsx  ← AI explanation panel
│   │   │   └── clans/
│   │   │       ├── ClanCard.tsx      ← Clan info + stats card
│   │   │       ├── WarRoster.tsx     ← Battle order assignment UI
│   │   │       └── WarResultsPanel.tsx ← Win/loss breakdown per member
│   │   │
│   │   └── lib/
│   │       └── videoDatabase.ts      ← Hardcoded YouTube video list
│   │
│   ├── next.config.ts                ← Next.js config
│   ├── tsconfig.json                 ← TypeScript config
│   ├── tailwind.config.ts            ← Tailwind config
│   ├── package.json
│   └── .env.local                    ← Local env vars (never commit)
│
├── .gitignore
└── README.md                         ← This file
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:

| Software | Version | Download |
|----------|---------|----------|
| Node.js | 20+ (LTS) | [nodejs.org](https://nodejs.org) |
| Python | 3.11+ | [python.org](https://python.org) |
| Git | Latest | [git-scm.com](https://git-scm.com) |

You also need free accounts at:
- [Turso](https://turso.tech) — database
- [HuggingFace](https://huggingface.co) — AI API
- [GitHub](https://github.com) — source control

You do **NOT** need:
- PostgreSQL (replaced by Turso)
- Redis (optional, only for leaderboard caching)
- Docker (optional)
- Any paid subscriptions

---

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/edurpg.git
cd edurpg
```

#### 2. Set up the backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 3. Set up the frontend

```bash
cd ../frontend

# Install dependencies
npm install
```

#### 4. Set up Turso database

```bash
# Install Turso CLI
# Mac/Linux:
curl -sSfL https://get.turso.tech/install.sh | bash

# Windows (PowerShell):
irm get.turso.tech/install.ps1 | iex

# Login to Turso
turso auth login

# Create your database
turso db create edurpg

# Get your database URL
turso db show edurpg --url
# Output: libsql://edurpg-yourname.turso.io

# Create an auth token
turso db tokens create edurpg
# Output: eyJhbGc...long_token_string
```

#### 5. Get HuggingFace API key

```
1. Go to https://huggingface.co/settings/tokens
2. Click "New token"
3. Name: edurpg
4. Type: Read
5. Click Generate
6. Copy the token: hf_xxxxxxxxxxxxx
```

---

### Environment Variables

#### Backend — `backend/.env`

Create this file and fill in your values:

```env
# ── Turso Database ────────────────────────────────────────────
# Get from: turso db show edurpg --url
TURSO_DATABASE_URL=libsql://edurpg-yourname.turso.io

# Get from: turso db tokens create edurpg
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSJ9.your_token_here

# ── HuggingFace AI ────────────────────────────────────────────
# Get from: https://huggingface.co/settings/tokens
HUGGINGFACE_API_KEY=hf_your_key_here

# ── JWT Authentication ────────────────────────────────────────
# Generate with: python -c "import secrets; print(secrets.token_hex(32))"
JWT_SECRET=your_random_64_character_secret_here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080

# ── App Settings ──────────────────────────────────────────────
APP_NAME=EduRPG
DEBUG=True

# ── CORS (add your frontend URL) ─────────────────────────────
CORS_ORIGINS=["http://localhost:3000"]
```

#### Frontend — `frontend/.env.local`

```env
# Backend API URL (local development)
NEXT_PUBLIC_API_URL=http://localhost:8000

# WebSocket URL
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

> ⚠️ **Never commit `.env` or `.env.local` files to GitHub.**
> Both files are already in `.gitignore`.

---

### Running Locally

#### Terminal 1 — Start the backend

```bash
cd backend

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Start the server
uvicorn app.main:app --reload --port 8000

# You should see:
# INFO: Uvicorn running on http://127.0.0.1:8000
# All tables created successfully!
```

#### Terminal 2 — Seed the database (first time only)

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows

python -m app.seed

# You should see:
# Seeded 5 heroes!
# Seeded 10 monsters!
# Seeding complete!
```

#### Terminal 3 — Start the frontend

```bash
cd frontend
npm run dev

# You should see:
# ▲ Next.js 16.x
# - Local: http://localhost:3000
```

#### Verify everything works

```bash
# Test backend health
curl http://localhost:8000/health
# Expected: {"status":"ok","version":"2.0.0"}

# Test API docs
# Open: http://localhost:8000/docs

# Test frontend
# Open: http://localhost:3000
```

---

## 🗄️ Database Schema

EduRPG uses Turso (SQLite) with the following tables:

### `users`
```sql
CREATE TABLE users (
    id            TEXT PRIMARY KEY,      -- UUID
    username      TEXT UNIQUE NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,         -- bcrypt hashed
    xp            INTEGER DEFAULT 0,
    level         INTEGER DEFAULT 1,
    streak        INTEGER DEFAULT 0,
    last_login    TEXT,                  -- ISO datetime
    created_at    TEXT NOT NULL,
    is_active     INTEGER DEFAULT 1      -- 1=active, 0=banned
);
```

### `heroes`
```sql
CREATE TABLE heroes (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,          -- Samurai, Wizard, etc.
    subject      TEXT NOT NULL,          -- Mathematics, Programming
    attack_power INTEGER DEFAULT 20,
    defense      INTEGER DEFAULT 10,
    max_hp       INTEGER DEFAULT 100,
    skill_name   TEXT,                   -- double_strike, hint_spell
    skill_effect TEXT,                   -- Description
    sprite_key   TEXT,                   -- samurai, wizard, ninja
    unlock_level INTEGER DEFAULT 1       -- Level required to unlock
);
```

### `monsters`
```sql
CREATE TABLE monsters (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,          -- Loop Dragon, OOP Overlord
    topic        TEXT NOT NULL,          -- python-loops, python-oop
    subject      TEXT NOT NULL,          -- Programming, Mathematics
    difficulty   INTEGER DEFAULT 1,      -- 1-5 scale
    max_hp       INTEGER DEFAULT 100,    -- Scaled by user level
    attack_power INTEGER DEFAULT 10,
    xp_reward    INTEGER DEFAULT 50,
    sprite_key   TEXT,
    is_boss      INTEGER DEFAULT 0       -- 1 = boss monster
);
```

### `battle_sessions`
```sql
CREATE TABLE battle_sessions (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL,
    hero_id         TEXT NOT NULL,
    monster_id      TEXT NOT NULL,
    player_hp       INTEGER NOT NULL,
    monster_hp      INTEGER NOT NULL,
    status          TEXT DEFAULT 'active',  -- active/victory/defeat
    xp_earned       INTEGER DEFAULT 0,
    questions_asked INTEGER DEFAULT 0,
    correct_count   INTEGER DEFAULT 0,
    started_at      TEXT NOT NULL,
    ended_at        TEXT
);
```

### `questions`
```sql
CREATE TABLE questions (
    id            TEXT PRIMARY KEY,
    topic         TEXT NOT NULL,          -- python-basics, calculus
    subject       TEXT NOT NULL,
    body          TEXT NOT NULL,          -- Question text
    type          TEXT DEFAULT 'mcq',     -- mcq, code, concept
    explanation   TEXT,                   -- Shown on wrong answer
    difficulty    INTEGER DEFAULT 1,
    options_json  TEXT NOT NULL,          -- JSON array of 4 options
    correct_index INTEGER NOT NULL        -- 0-3
);
```

### `multiplayer_battles`
```sql
CREATE TABLE multiplayer_battles (
    id                  TEXT PRIMARY KEY,
    attacker_id         TEXT NOT NULL,
    defender_id         TEXT NOT NULL,
    attacker_questions  TEXT DEFAULT '[]',  -- Questions A picked for B
    defender_questions  TEXT DEFAULT '[]',  -- Questions B picks for A
    attacker_answers    TEXT DEFAULT '[]',
    defender_answers    TEXT DEFAULT '[]',
    attacker_score      INTEGER DEFAULT 0,
    defender_score      INTEGER DEFAULT 0,
    status              TEXT DEFAULT 'pending',
    winner_id           TEXT,
    trophies_wagered    INTEGER DEFAULT 20,
    created_at          TEXT NOT NULL,
    expires_at          TEXT NOT NULL       -- 24 hour window
);
```

### `player_rankings`
```sql
CREATE TABLE player_rankings (
    user_id      TEXT PRIMARY KEY,
    trophies     INTEGER DEFAULT 100,
    league       TEXT DEFAULT 'Bronze',   -- Bronze/Silver/Gold/Diamond/Legend
    wins         INTEGER DEFAULT 0,
    losses       INTEGER DEFAULT 0,
    attack_wins  INTEGER DEFAULT 0,
    defense_wins INTEGER DEFAULT 0,
    win_streak   INTEGER DEFAULT 0
);
```

### `clans` *(New — Clan War System)*
```sql
CREATE TABLE clans (
    id           TEXT PRIMARY KEY,        -- UUID
    name         TEXT UNIQUE NOT NULL,
    tag          TEXT UNIQUE NOT NULL,    -- Short tag e.g. #EDURPG
    description  TEXT,
    leader_id    TEXT NOT NULL,           -- User ID of clan leader
    max_members  INTEGER DEFAULT 15,
    trophies     INTEGER DEFAULT 0,       -- Collective clan trophies
    xp           INTEGER DEFAULT 0,       -- Collective clan XP
    wins         INTEGER DEFAULT 0,
    losses       INTEGER DEFAULT 0,
    created_at   TEXT NOT NULL
);
```

### `clan_members` *(New — Clan War System)*
```sql
CREATE TABLE clan_members (
    id         TEXT PRIMARY KEY,
    clan_id    TEXT NOT NULL,
    user_id    TEXT NOT NULL,
    role       TEXT DEFAULT 'member',     -- leader, co-leader, member
    joined_at  TEXT NOT NULL,
    wars_fought INTEGER DEFAULT 0,
    war_wins    INTEGER DEFAULT 0,
    UNIQUE(clan_id, user_id)
);
```

### `clan_wars` *(New — Clan War System)*
```sql
CREATE TABLE clan_wars (
    id               TEXT PRIMARY KEY,
    clan_a_id        TEXT NOT NULL,       -- Challenging clan
    clan_b_id        TEXT NOT NULL,       -- Defending clan
    status           TEXT DEFAULT 'prep', -- prep/active/completed
    clan_a_score     INTEGER DEFAULT 0,   -- Battles won by Clan A
    clan_b_score     INTEGER DEFAULT 0,   -- Battles won by Clan B
    winner_clan_id   TEXT,
    topic            TEXT NOT NULL,       -- Topic set by leader for the war
    war_size         INTEGER NOT NULL,    -- Number of battles (e.g. 5, 10, 15)
    trophies_wagered INTEGER DEFAULT 50,
    prep_ends_at     TEXT NOT NULL,       -- End of 24hr preparation phase
    war_ends_at      TEXT NOT NULL,       -- 48hr window to complete all battles
    created_at       TEXT NOT NULL
);
```

### `war_battles` *(New — Clan War System)*
```sql
CREATE TABLE war_battles (
    id              TEXT PRIMARY KEY,
    war_id          TEXT NOT NULL,        -- Parent clan war
    battle_order    INTEGER NOT NULL,     -- Position in war (1, 2, 3...)
    clan_a_member   TEXT NOT NULL,        -- User ID assigned by Clan A leader
    clan_b_member   TEXT NOT NULL,        -- User ID assigned by Clan B leader
    topic           TEXT NOT NULL,        -- Battle topic (can override war topic)
    clan_a_score    INTEGER DEFAULT 0,    -- Questions answered correctly
    clan_b_score    INTEGER DEFAULT 0,
    winner_user_id  TEXT,
    status          TEXT DEFAULT 'pending', -- pending/active/completed
    started_at      TEXT,
    completed_at    TEXT
);
```

---

## 📡 API Documentation

Full interactive API docs available at `http://localhost:8000/docs` when running locally.

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Create new account | No |
| POST | `/auth/login` | Login, get JWT token | No |
| GET | `/auth/me` | Get current user info | Yes |
| GET | `/auth/profile/{id}` | Get user profile | No |
| GET | `/auth/xp-log` | Get XP history | Yes |

**Register Request:**
```json
{
  "username": "Nikhil",
  "email": "nikhil@example.com",
  "password": "securepassword123"
}
```

**Register Response:**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user_id": "uuid-here",
  "username": "Nikhil",
  "level": 1,
  "xp": 0
}
```

---

### Hero Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/heroes/` | Get all heroes | No |
| GET | `/heroes/active` | Get your active hero | Yes |
| GET | `/heroes/my-heroes` | Get your unlocked heroes | Yes |
| POST | `/heroes/select/{hero_id}` | Select/switch hero | Yes |
| GET | `/heroes/subject/{subject}` | Get hero by subject | No |
| POST | `/heroes/seed` | Seed default heroes | No |

---

### Battle Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/battle/start` | Start a new battle | Yes |
| POST | `/battle/answer` | Submit answer | Yes |
| GET | `/battle/state/{session_id}` | Get battle state | Yes |
| GET | `/battle/history` | Get battle history | Yes |
| POST | `/battle/forfeit/{session_id}` | Forfeit battle | Yes |

**Start Battle Request:**
```json
{
  "topic": "python-loops"
}
```

**Start Battle Response:**
```json
{
  "session_id": "uuid",
  "hero": {
    "id": "uuid",
    "name": "Wizard",
    "max_hp": 90,
    "attack_power": 30,
    "defense": 8,
    "skill_name": "hint_spell",
    "sprite_key": "wizard"
  },
  "monster": {
    "name": "Loop Dragon",
    "max_hp": 100,
    "current_hp": 100,
    "sprite_key": "loop_serpent",
    "is_boss": false
  },
  "question": {
    "id": "uuid",
    "body": "What does range(3) produce?",
    "options": ["[1,2,3]", "[0,1,2]", "[0,1,2,3]", "[1,2]"],
    "correct_index": 1,
    "explanation": "range(3) starts at 0 and goes up to but not including 3"
  },
  "player_hp": 90,
  "monster_hp": 100
}
```

**Submit Answer Request:**
```json
{
  "session_id": "uuid",
  "selected_index": 1,
  "question_id": "uuid"
}
```

**Submit Answer Response (correct):**
```json
{
  "action": "hero_attack",
  "is_correct": true,
  "damage": 38,
  "is_critical": true,
  "xp_gained": 25,
  "player_hp": 90,
  "monster_hp": 62,
  "battle_over": false,
  "explanation": "",
  "next_question": { "..." }
}
```

---

### AI Tutor Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/ai/explain` | Explain wrong answer | Yes |
| POST | `/ai/hint` | Get hint for question | Yes |
| POST | `/ai/generate-quiz` | Generate quiz questions | Yes |
| POST | `/ai/simplify` | Simplify a concept | Yes |
| GET | `/ai/status` | Check AI health | No |

**Explain Request:**
```json
{
  "question": "What does range(3) produce?",
  "student_answer": "[1,2,3]",
  "correct_answer": "[0,1,2]",
  "subject": "Programming",
  "user_level": 3
}
```

---

### Multiplayer Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/multiplayer/find-opponent` | Find matched opponent | Yes |
| POST | `/multiplayer/start-battle` | Start PvP battle | Yes |
| POST | `/multiplayer/submit-attack` | Submit your answers | Yes |
| POST | `/multiplayer/submit-defense` | Answer opponent's questions | Yes |
| GET | `/multiplayer/inbox` | Pending battles to defend | Yes |
| GET | `/multiplayer/my-battles` | Battle history | Yes |
| GET | `/multiplayer/leaderboard` | Trophy rankings | No |
| GET | `/multiplayer/my-ranking` | Your trophy rank | Yes |

---

### Clan War Endpoints *(New)*

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/clans/create` | Create a new clan | Yes |
| POST | `/clans/join/{clan_id}` | Join an existing clan | Yes |
| POST | `/clans/leave` | Leave your current clan | Yes |
| GET | `/clans/my-clan` | Get your clan details + members | Yes |
| GET | `/clans/search` | Search clans by name or tag | No |
| GET | `/clans/{clan_id}` | Get public clan profile | No |
| POST | `/clans/promote/{user_id}` | Promote member to co-leader | Yes (leader) |
| DELETE | `/clans/kick/{user_id}` | Remove a member from clan | Yes (leader) |
| POST | `/clans/war/challenge/{clan_id}` | Challenge another clan to war | Yes (leader) |
| POST | `/clans/war/set-roster` | Set war roster + battle order | Yes (leader) |
| GET | `/clans/war/active` | Get current active war | Yes |
| POST | `/clans/war/battle/start/{war_battle_id}` | Start your assigned war battle | Yes |
| POST | `/clans/war/battle/answer` | Submit answer in a war battle | Yes |
| GET | `/clans/war/{war_id}/results` | Get full war results | Yes |
| GET | `/clans/war/history` | Get clan's past wars | Yes |
| GET | `/clans/leaderboard` | Clan trophy leaderboard | No |

**Create Clan Request:**
```json
{
  "name": "Math Warriors",
  "tag": "MATHW",
  "description": "We grind calculus and conquer all"
}
```

**Create Clan Response:**
```json
{
  "clan_id": "uuid",
  "name": "Math Warriors",
  "tag": "#MATHW",
  "leader_id": "uuid",
  "members": 1,
  "trophies": 0
}
```

**Challenge Clan Request:**
```json
{
  "opponent_clan_id": "uuid",
  "topic": "calculus",
  "war_size": 5
}
```

**Set Roster Request (leader only):**
```json
{
  "war_id": "uuid",
  "roster": [
    { "battle_order": 1, "member_user_id": "uuid-alice", "topic": "calculus" },
    { "battle_order": 2, "member_user_id": "uuid-bob",   "topic": "algebra-basics" },
    { "battle_order": 3, "member_user_id": "uuid-carol", "topic": "calculus" }
  ]
}
```

---

## ⚔️ Game Systems

### Battle System

```
Battle Flow:
────────────
1. Player selects topic → Monster spawns (scaled to player level)
2. Question appears → Player has unlimited time to answer
3. Correct Answer:
   → Hero attacks monster
   → Damage = hero.attack_power × (1 + level_scaling)
   → 15% chance of CRITICAL HIT (1.5× damage)
   → If "double_strike" skill active: 2× damage
   → XP awarded: 10 base + 5 bonus for crits
4. Wrong Answer:
   → Monster attacks hero
   → Damage = monster.attack_power × (1 - defense/200)
   → If "iron_shield" skill active: 50% damage reduction
5. Battle ends when:
   → Monster HP = 0 → Victory → XP + badges
   → Hero HP = 0   → Defeat  → Retry prompt
```

**Damage Formula:**
```python
# Hero attacks
damage = hero.attack_power
if skill == "double_strike": damage *= 2
if is_critical (15% chance):  damage = int(damage * 1.5)

# Monster attacks
defense_factor = 1 - (hero.defense / 200)
if skill == "iron_shield": defense_factor -= 0.5
damage = max(1, int(monster.attack_power * defense_factor))
```

**Monster Scaling:**
```python
scale      = 1 + (user_level * 0.08)
scaled_hp  = ceil(base_hp * scale)
scaled_atk = ceil(base_attack * (1 + user_level * 0.05))
```

---

### Hero System

| Hero | Subject | Attack | Defense | HP | Skill | Unlocks |
|------|---------|--------|---------|-----|-------|---------|
| ⚔️ Samurai | Mathematics | 25 | 12 | 110 | Double Strike (2× damage) | Level 1 |
| 🔮 Wizard | Programming | 30 | 8 | 90 | Hint Spell (reveal wrong option) | Level 1 |
| 🥷 Ninja | Science | 22 | 15 | 100 | Shadow Dodge (skip penalty) | Level 5 |
| 🛡️ Knight | History | 18 | 20 | 130 | Iron Shield (50% damage reduction) | Level 8 |
| 🤖 Robot | AI Technology | 28 | 10 | 95 | Data Scan (show topic hint) | Level 12 |

---

### Monster System

| Monster | Topic | HP | Attack | XP | Boss? |
|---------|-------|----|--------|----|-------|
| 🐍 Variable Viper | python-basics | 60 | 8 | 30 | No |
| 🐉 Loop Dragon | python-loops | 90 | 12 | 50 | No |
| 👻 Function Phantom | python-functions | 85 | 11 | 45 | No |
| 💀 OOP Overlord | python-oop | 180 | 22 | 150 | **Yes** |
| 👹 Algebra Beast | algebra-basics | 80 | 11 | 45 | No |
| 🧟 Calculus Titan | calculus | 200 | 28 | 200 | **Yes** |
| 🗿 Physics Golem | physics-mechanics | 85 | 12 | 50 | No |
| 🧌 Chemistry Dragon | chemistry | 120 | 16 | 90 | No |
| 👾 Data Demon | machine-learning | 130 | 17 | 100 | No |
| 🦾 Neural Nightmare | neural-networks | 160 | 21 | 130 | **Yes** |

---

### XP & Level System

```python
# XP Sources
XP_TABLE = {
    "correct_answer":  10,    # Base XP per correct answer
    "crit_bonus":       5,    # Bonus for critical hits
    "monster_defeat":  75,    # Defeating a regular monster
    "boss_defeat":    200,    # Defeating a boss monster
    "daily_login":     10,    # Daily login bonus
    "streak_3":       100,    # 3-day streak bonus
    "streak_7":       250,    # 7-day streak bonus
    "war_battle_win": 100,    # Winning a war battle
    "clan_war_win":   300,    # Your clan wins the war
}

# Level Formula
level = max(1, floor(sqrt(xp / 100)))

# XP needed for each level
level 1  → 0 XP
level 2  → 400 XP
level 3  → 900 XP
level 5  → 2500 XP  (unlocks Ninja)
level 8  → 6400 XP  (unlocks Knight)
level 12 → 14400 XP (unlocks Robot)
```

---

### Multiplayer System

```
Complete Flow:
──────────────
1. Player A opens /multiplayer → sees their trophy count + league
2. A clicks "ATTACK" → backend finds Player B (±200 trophies)
3. A sees 15 questions about their chosen topic
4. A picks 5 questions to "throw" at B (like deploying troops)
5. A answers 5 different questions themselves → score recorded
6. A's attack is sent → B gets notified in their inbox
7. B has 24 hours to open /multiplayer/inbox and defend
8. B answers A's 5 chosen questions → scores compared
9. Winner = higher score
10. Trophies transferred:
    Win  → +20 to +40 trophies (depends on league)
    Loss → -15 trophies
    Draw → +5 both players
```

**League Thresholds:**
```
0    - 499   → 🥉 Bronze
500  - 999   → 🥈 Silver
1000 - 1999  → 🥇 Gold
2000 - 2999  → 💎 Diamond
3000+        → 👑 Legend
```

---

### 🏰 Clan War System *(New)*

Clan Wars turn studying into a full team sport. Form a study group as a clan, challenge your rivals, and prove your crew knows the subject best.

```
Complete Clan War Flow:
────────────────────────────────────────────────────────

PHASE 0 — Setup
───────────────
1. Any user creates a clan (max 15 members)
2. Members join via clan tag (e.g. #MATHW) or search
3. Clan leader (or co-leader) manages the roster

PHASE 1 — Challenge (Preparation, 24 hrs)
──────────────────────────────────────────
1. Leader opens /clans → clicks "Declare War"
2. Searches for a rival clan (matched by similar clan trophies)
3. Selects war size: 5v5, 10v10, or 15v15 battles
4. Sets a primary topic (e.g. calculus) for the war
5. Leader assigns the battle roster:
   - Picks which members fight
   - Sets the battle ORDER (who fights first, second, etc.)
   - Optionally assigns a different topic per individual battle
6. Both clans have 24 hours to finalize rosters
   - Each side's leader sets their own roster independently
   - Roster is hidden from the enemy until war starts

PHASE 2 — War (Battle Window, 48 hrs)
───────────────────────────────────────
1. War goes ACTIVE — all assigned battles unlock simultaneously
2. Each member logs in → sees their war assignment:
   "You are Battle #3 — fight PlayerX from Clan Rivals!"
3. They click START BATTLE → a 10-question quiz begins
4. Standard battle rules apply (correct = points, wrong = opponent's points)
5. Each battle concludes independently — no waiting on teammates
6. War score updates live:
   "Math Warriors: 3 wins | Rivals FC: 1 win"

PHASE 3 — Results
──────────────────
1. War ends when all battles complete OR 48hr timer runs out
2. Clan with most battle wins takes the war
3. Trophies transfer: winning clan +50, losing clan -30
4. Each member earns personal XP for their battle outcome
5. Clan War History shows all past wars with per-member stats
```

**War Score Logic:**
```python
# Each war battle is a standalone 10-question quiz
# Battle winner = player with more correct answers
# Ties count as 0.5 wins for each side

clan_a_score = sum(1 for b in battles if b.winner == "clan_a")
clan_b_score = sum(1 for b in battles if b.winner == "clan_b")

# Draws: each gets 0.5
for b in battles:
    if b.clan_a_score == b.clan_b_score:
        clan_a_score += 0.5
        clan_b_score += 0.5

war_winner = "clan_a" if clan_a_score > clan_b_score else "clan_b"
# Perfect war bonus: win all battles → extra +100 clan XP
```

**Clan Roles & Permissions:**

| Role | Start War | Set Roster | Kick Members | Promote | Invite |
|------|-----------|------------|--------------|---------|--------|
| 👑 Leader | ✅ | ✅ | ✅ | ✅ | ✅ |
| ⭐ Co-Leader | ✅ | ✅ | ✅ (members only) | ❌ | ✅ |
| 🧑 Member | ❌ | ❌ | ❌ | ❌ | ❌ |

**Clan Trophy System:**
```
Clan War Win   → +50 clan trophies
Clan War Loss  → -30 clan trophies
Perfect War    → +25 bonus clan trophies (win all battles)

Clan Leagues:
0    - 299   → 🥉 Bronze Clan
300  - 699   → 🥈 Silver Clan
700  - 1499  → 🥇 Gold Clan
1500 - 2999  → 💎 Diamond Clan
3000+        → 👑 Legend Clan
```

---

### AI Tutor

The AI tutor uses HuggingFace's free inference API with three models:

```
Primary:   mistralai/Mistral-7B-Instruct-v0.3  (best quality)
Fallback:  microsoft/Phi-3-mini-4k-instruct    (if primary busy)
Fast:      HuggingFaceH4/zephyr-7b-beta        (if rate limited)
Hardcoded: Local fallback questions             (if all AI down)
```

**Features:**
- Explains why the wrong answer was incorrect (2-3 sentences)
- Gives hints without revealing the answer
- Generates new quiz questions for any topic
- Simplifies complex concepts with analogies
- Adapts explanation to user's level (1-20)

---

## 🖥️ Frontend Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home / Hero Select | Choose hero, select topic, start battle |
| `/battle` | Battle Arena | Full battle with animated SVG characters |
| `/training` | Training Room | Videos + tips per topic |
| `/leaderboard` | Leaderboard | Global/weekly XP rankings with leagues |
| `/multiplayer` | Multiplayer Hub | Trophy count, attack button, battle history |
| `/multiplayer/attack` | Attack Flow | Find opponent → pick questions → answer yours |
| `/multiplayer/inbox` | Defense Inbox | Answer incoming attacks |
| `/clans` | Clan Hub | Create/join clan, view roster, declare war |
| `/clans/war` | War Room | Live war score, battle assignments, countdown timer |
| `/clans/leaderboard` | Clan Leaderboard | Clan trophy rankings by league |

---

## 🚢 Deployment

### Deploy Backend on Render

**Step 1 — Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/edurpg.git
git push -u origin main
```

**Step 2 — Create Web Service on Render**
```
1. Go to render.com → New → Web Service
2. Connect GitHub → select edurpg repo
3. Configure:
   Name:           edurpg-api
   Runtime:        Python
   Build Command:  cd backend && pip install -r requirements.txt
   Start Command:  cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
   Instance Type:  Free
```

**Step 3 — Add Environment Variables on Render**
```
TURSO_DATABASE_URL  = libsql://edurpg-yourname.turso.io
TURSO_AUTH_TOKEN    = eyJhbGc...your_token
HUGGINGFACE_API_KEY = hf_your_key
JWT_SECRET          = your_random_secret_64_chars
CORS_ORIGINS        = ["https://your-app.vercel.app"]
PYTHON_VERSION      = 3.11.9
```

**Step 4 — Verify deployment**
```bash
curl https://edurpg-api.onrender.com/health
# → {"status":"ok","version":"2.0.0"}
```

---

### Deploy Frontend on Vercel

**Step 1 — Import project**
```
1. Go to vercel.com → New Project
2. Import from GitHub → select edurpg
3. Configure:
   Framework Preset:  Next.js (auto-detected)
   Root Directory:    frontend
   Build Command:     npm run build
```

**Step 2 — Add Environment Variables on Vercel**
```
NEXT_PUBLIC_API_URL = https://edurpg-api.onrender.com
NEXT_PUBLIC_WS_URL  = wss://edurpg-api.onrender.com
```

**Step 3 — Deploy**
```
Click Deploy → wait 2-3 minutes
Your app: https://edurpg.vercel.app
```

---

### Keep Backend Awake (Free)

Render free tier sleeps after 15 minutes. Add a keep-alive monitor:

```
1. Go to uptimerobot.com → Sign up free
2. New Monitor:
   Type:     HTTP(s)
   Name:     EduRPG API
   URL:      https://edurpg-api.onrender.com/health
   Interval: Every 5 minutes
3. Save → backend stays awake 24/7
```

---

### Complete Deployment Checklist

```
Backend ────────────────────────────────────
[ ] GitHub repo created and pushed
[ ] Render web service created
[ ] Root directory set to backend
[ ] Build/start commands correct
[ ] All 5 env vars added
[ ] PYTHON_VERSION = 3.11.9 set
[ ] Deploy succeeded
[ ] /health endpoint returns 200

Frontend ───────────────────────────────────
[ ] Vercel project created
[ ] Root directory set to frontend
[ ] NEXT_PUBLIC_API_URL set to Render URL
[ ] Build succeeded (no TypeScript errors)
[ ] All 6 pages load correctly

Post-deploy ────────────────────────────────
[ ] Register new account
[ ] Select hero + topic
[ ] Battle starts and questions appear
[ ] Correct answer damages monster
[ ] Wrong answer plays AI explanation
[ ] Multiplayer page loads
[ ] Leaderboard shows rankings
[ ] Training room videos play
[ ] Clan creation works
[ ] War declaration and roster assignment work
[ ] War battles complete and scores update
[ ] UptimeRobot monitor active
```

---

## 🔧 Troubleshooting

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `URL_INVALID: URL 'undefined'` | Turso env vars missing | Add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` to Render |
| `ModuleNotFoundError: No module named 'app.config'` | Wrong start command | Use `cd backend && uvicorn app.main:app...` |
| `pydantic-core build failed` | Python 3.14 on Render | Add `PYTHON_VERSION=3.11.9` env var, add `runtime.txt` |
| `CORS policy blocked` | Frontend URL not in CORS | Update `CORS_ORIGINS` on Render to include Vercel URL |
| `'TursoResult' has no attribute 'fetchone'` | Old SQLAlchemy syntax | Use `result.rows[0]` instead of `.fetchone()` |
| `bcrypt error reading version` | passlib incompatible | Remove passlib, use `import bcrypt` directly |
| `Call retries exceeded` (Vercel) | Page bundle too large | Split SVG components into `Characters.tsx` |
| `ChunkLoadError` (Next.js) | `<style jsx>` in App Router | Move CSS to `globals.css`, remove `<style jsx>` tags |
| AI tutor returns empty | HuggingFace model loading | Wait 20s and retry — model is warming up (cold start) |
| Battle gives 404 | Missing page files | Create `src/app/battle/page.tsx` etc. |
| `clan_wars table not found` | DB not migrated after update | Re-run `python -m app.seed` or run migration script |
| War roster returns 403 | Non-leader trying to set roster | Only leader/co-leader can call `/clans/war/set-roster` |
| War battle shows wrong opponent | Roster set before opponent confirmed | Ensure both clans finalize roster before prep phase ends |

### Debug Commands

```bash
# Check backend is running
curl http://localhost:8000/health

# Check database connection
curl http://localhost:8000/heroes/

# Check AI is working
curl http://localhost:8000/ai/status

# Check clan tables exist
curl http://localhost:8000/clans/leaderboard

# Check frontend builds
cd frontend && npm run build

# View FastAPI logs
uvicorn app.main:app --reload --log-level debug

# Check for TypeScript errors
cd frontend && npx tsc --noEmit
```

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

```bash
# Fork the repo, then:
git clone https://github.com/YOUR_USERNAME/edurpg.git
cd edurpg

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes, then:
git add .
git commit -m "feat: describe your change"
git push origin feature/your-feature-name

# Open Pull Request on GitHub
```

### Contribution Ideas

- 🌍 Add new subjects/topics (History, Geography, etc.)
- 🗡️ Add new hero classes with unique skills
- 👹 Add new monsters with different attack patterns
- 🎮 Add real-time multiplayer with WebSockets
- 💬 Add real-time clan chat with WebSockets
- 📊 Add teacher dashboard with class analytics
- 🏅 Add more achievement badges
- 📱 Build React Native mobile app
- 🌐 Add multilingual support
- 🏰 Add clan-exclusive dungeons unlocked only during wars

---

## 📄 License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2026 EduRPG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgements

- [FastAPI](https://fastapi.tiangolo.com) — Incredible Python web framework
- [Next.js](https://nextjs.org) — The best React framework
- [Turso](https://turso.tech) — SQLite for the edge
- [HuggingFace](https://huggingface.co) — Free AI models
- [3Blue1Brown](https://www.youtube.com/@3blue1brown) — Amazing math videos
- [Corey Schafer](https://www.youtube.com/@coreyms) — Best Python tutorials
- [freeCodeCamp](https://www.youtube.com/@freecodecamp) — Free learning content

---

<div align="center">

**Built for students who hate boring studying**

</div>

<div>
  <b>Contact: nnair7598@gmail.com</b><br>
  <b>Thank You 🙏🙏</b>
</div>
