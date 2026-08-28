#!/usr/bin/env python3
"""SQLite database for the Telegram Games Bot"""
import sqlite3
import json
from datetime import datetime

class Database:
    def __init__(self, db_path):
        self.db_path = db_path
        self.init_db()
    
    def get_conn(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        return conn
    
    def init_db(self):
        with self.get_conn() as conn:
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY,
                    username TEXT DEFAULT '',
                    first_name TEXT DEFAULT '',
                    global_points INTEGER DEFAULT 0,
                    xp INTEGER DEFAULT 0,
                    level INTEGER DEFAULT 1,
                    games_played INTEGER DEFAULT 0,
                    games_won INTEGER DEFAULT 0,
                    total_play_time INTEGER DEFAULT 0,
                    is_banned INTEGER DEFAULT 0,
                    ban_reason TEXT DEFAULT '',
                    created_at TEXT DEFAULT (datetime('now')),
                    last_active TEXT DEFAULT (datetime('now'))
                );
                
                CREATE TABLE IF NOT EXISTS groups_t (
                    id INTEGER PRIMARY KEY,
                    title TEXT DEFAULT '',
                    total_games INTEGER DEFAULT 0,
                    total_points INTEGER DEFAULT 0,
                    created_at TEXT DEFAULT (datetime('now')),
                    last_active TEXT DEFAULT (datetime('now'))
                );
                
                CREATE TABLE IF NOT EXISTS group_users (
                    user_id INTEGER,
                    group_id INTEGER,
                    group_points INTEGER DEFAULT 0,
                    games_played INTEGER DEFAULT 0,
                    games_won INTEGER DEFAULT 0,
                    perks TEXT DEFAULT '{}',
                    joined_at TEXT DEFAULT (datetime('now')),
                    PRIMARY KEY (user_id, group_id)
                );
                
                CREATE TABLE IF NOT EXISTS game_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    game_type TEXT,
                    group_id INTEGER,
                    creator_id INTEGER,
                    winner_id INTEGER,
                    players TEXT,
                    rounds INTEGER DEFAULT 0,
                    points_awarded INTEGER DEFAULT 0,
                    played_at TEXT DEFAULT (datetime('now'))
                );
                
                CREATE TABLE IF NOT EXISTS game_sessions (
                    group_id INTEGER PRIMARY KEY,
                    game_id TEXT,
                    creator_id INTEGER,
                    state TEXT DEFAULT 'waiting',
                    players TEXT DEFAULT '[]',
                    registered TEXT DEFAULT '[]',
                    current_round INTEGER DEFAULT 0,
                    total_rounds INTEGER DEFAULT 5,
                    scores TEXT DEFAULT '{}',
                    question_data TEXT DEFAULT '{}',
                    created_at TEXT DEFAULT (datetime('now'))
                );
            """)
    
    # ========== USERS ==========
    
    def get_or_create_user(self, tg_user):
        with self.get_conn() as conn:
            user = conn.execute("SELECT * FROM users WHERE id = ?", (tg_user.id,)).fetchone()
            if not user:
                conn.execute(
                    "INSERT INTO users (id, username, first_name) VALUES (?, ?, ?)",
                    (tg_user.id, tg_user.username or '', tg_user.first_name or '')
                )
                user = conn.execute("SELECT * FROM users WHERE id = ?", (tg_user.id,)).fetchone()
            else:
                conn.execute(
                    "UPDATE users SET username=?, first_name=?, last_active=datetime('now') WHERE id=?",
                    (tg_user.username or '', tg_user.first_name or '', tg_user.id)
                )
            return dict(user)
    
    def get_user(self, user_id):
        with self.get_conn() as conn:
            user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
            return dict(user) if user else None
    
    def update_user(self, user_id, **kwargs):
        with self.get_conn() as conn:
            sets = ", ".join([f"{k}=?" for k in kwargs])
            vals = list(kwargs.values()) + [user_id]
            conn.execute(f"UPDATE users SET {sets} WHERE id=?", vals)
    
    def add_points(self, user_id, points, xp=0):
        with self.get_conn() as conn:
            user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
            if user:
                new_xp = user['xp'] + xp
                new_level = 1
                from config import Config
                c = Config()
                for i in range(len(c.XP_LEVELS) - 1, -1, -1):
                    if new_xp >= c.XP_LEVELS[i]:
                        new_level = i + 1
                        break
                conn.execute(
                    "UPDATE users SET global_points=global_points+?, xp=?, level=?, last_active=datetime('now') WHERE id=?",
                    (points, new_xp, new_level, user_id)
                )
    
    def add_group_points(self, user_id, group_id, points):
        with self.get_conn() as conn:
            gu = conn.execute("SELECT * FROM group_users WHERE user_id=? AND group_id=?", (user_id, group_id)).fetchone()
            if gu:
                conn.execute("UPDATE group_users SET group_points=group_points+? WHERE user_id=? AND group_id=?", (points, user_id, group_id))
            else:
                conn.execute("INSERT INTO group_users (user_id, group_id, group_points) VALUES (?, ?, ?)", (user_id, group_id, points))
    
    def increment_games(self, user_id, group_id, won=False):
        with self.get_conn() as conn:
            conn.execute("UPDATE users SET games_played=games_played+1, last_active=datetime('now') WHERE id=?", (user_id,))
            if won:
                conn.execute("UPDATE users SET games_won=games_won+1 WHERE id=?", (user_id,))
            gu = conn.execute("SELECT * FROM group_users WHERE user_id=? AND group_id=?", (user_id, group_id)).fetchone()
            if gu:
                conn.execute("UPDATE group_users SET games_played=games_played+1 WHERE user_id=? AND group_id=?", (user_id, group_id))
                if won:
                    conn.execute("UPDATE group_users SET games_won=games_won+1 WHERE user_id=? AND group_id=?", (user_id, group_id))
            conn.execute("UPDATE groups_t SET total_games=total_games+1, last_active=datetime('now') WHERE id=?", (group_id,))
    
    # ========== GROUPS ==========
    
    def get_or_create_group(self, chat):
        with self.get_conn() as conn:
            group = conn.execute("SELECT * FROM groups_t WHERE id = ?", (chat.id,)).fetchone()
            if not group:
                conn.execute("INSERT INTO groups_t (id, title) VALUES (?, ?)", (chat.id, chat.title or ''))
                group = conn.execute("SELECT * FROM groups_t WHERE id = ?", (chat.id,)).fetchone()
            return dict(group)
    
    def get_all_users(self):
        with self.get_conn() as conn:
            return [r['id'] for r in conn.execute("SELECT id FROM users").fetchall()]
    
    def get_all_groups(self):
        with self.get_conn() as conn:
            return [r['id'] for r in conn.execute("SELECT id FROM groups_t").fetchall()]
    
    def get_group_user(self, user_id, group_id):
        with self.get_conn() as conn:
            gu = conn.execute("SELECT * FROM group_users WHERE user_id=? AND group_id=?", (user_id, group_id)).fetchone()
            return dict(gu) if gu else None
    
    # ========== LEADERBOARDS ==========
    
    def get_global_leaderboard(self, limit=10):
        with self.get_conn() as conn:
            return [dict(r) for r in conn.execute(
                "SELECT id, username, first_name, global_points FROM users ORDER BY global_points DESC LIMIT ?", (limit,)
            ).fetchall()]
    
    def get_group_leaderboard(self, group_id, limit=10):
        with self.get_conn() as conn:
            return [dict(r) for r in conn.execute(
                """SELECT u.id, u.username, u.first_name, gu.group_points 
                   FROM group_users gu JOIN users u ON u.id=gu.user_id 
                   WHERE gu.group_id=? ORDER BY gu.group_points DESC LIMIT ?""", (group_id, limit)
            ).fetchall()]
    
    def get_groups_leaderboard(self, limit=10):
        with self.get_conn() as conn:
            return [dict(r) for r in conn.execute(
                "SELECT id, title, total_games, total_points FROM groups_t ORDER BY total_points DESC LIMIT ?", (limit,)
            ).fetchall()]
    
    # ========== SHOP ==========
    
    def buy_perk(self, user_id, group_id, perk_id, price):
        with self.get_conn() as conn:
            gu = conn.execute("SELECT * FROM group_users WHERE user_id=? AND group_id=?", (user_id, group_id)).fetchone()
            if gu:
                perks = json.loads(gu['perks'] or '{}')
                perks[str(perk_id)] = perks.get(str(perk_id), 0) + 1
                conn.execute(
                    "UPDATE group_users SET group_points=group_points-?, perks=? WHERE user_id=? AND group_id=?",
                    (price, json.dumps(perks), user_id, group_id)
                )
    
    def get_user_perks(self, user_id, group_id):
        with self.get_conn() as conn:
            gu = conn.execute("SELECT * FROM group_users WHERE user_id=? AND group_id=?", (user_id, group_id)).fetchone()
            if gu:
                perks = json.loads(gu['perks'] or '{}')
                return [{'perk_id': int(k), 'uses': v} for k, v in perks.items() if v > 0]
            return []
    
    # ========== GAME HISTORY ==========
    
    def record_game(self, game_type, group_id, creator_id, winner_id, players, rounds, points):
        with self.get_conn() as conn:
            conn.execute(
                "INSERT INTO game_history (game_type, group_id, creator_id, winner_id, players, rounds, points_awarded) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (game_type, group_id, creator_id, winner_id, json.dumps(players), rounds, points)
            )
            conn.execute("UPDATE groups_t SET total_points=total_points+? WHERE id=?", (points, group_id))
    
    def get_bot_stats(self):
        with self.get_conn() as conn:
            row = conn.execute("SELECT COUNT(*) as total_games, COALESCE(SUM(points_awarded),0) as total_points FROM game_history").fetchone()
            return dict(row) if row else {'total_games': 0, 'total_points': 0}
    
    # ========== SESSIONS ==========
    
    def save_session(self, session):
        with self.get_conn() as conn:
            conn.execute("""INSERT OR REPLACE INTO game_sessions 
                (group_id, game_id, creator_id, state, players, registered, current_round, total_rounds, scores, question_data)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (session['group_id'], session['game_id'], session['creator_id'], session['state'],
                 json.dumps(session['players']), json.dumps(session['registered']),
                 session['current_round'], session['total_rounds'],
                 json.dumps(session['scores']), json.dumps(session['question_data'])))
    
    def get_session(self, group_id):
        with self.get_conn() as conn:
            s = conn.execute("SELECT * FROM game_sessions WHERE group_id = ?", (group_id,)).fetchone()
            if s:
                sess = dict(s)
                sess['players'] = json.loads(sess['players'])
                sess['registered'] = json.loads(sess['registered'])
                sess['scores'] = json.loads(sess['scores'])
                sess['question_data'] = json.loads(sess['question_data'])
                return sess
            return None
    
    def delete_session(self, group_id):
        with self.get_conn() as conn:
            conn.execute("DELETE FROM game_sessions WHERE group_id = ?", (group_id,))