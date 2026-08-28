import { AuditLog, GameHistory } from '../types';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS game_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_type TEXT NOT NULL,
  group_id INTEGER NOT NULL,
  creator_id INTEGER NOT NULL,
  winner_id INTEGER,
  players TEXT NOT NULL,
  rounds INTEGER NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 0,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  played_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  group_id INTEGER,
  action TEXT NOT NULL,
  details TEXT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS game_stats (
  game_type TEXT PRIMARY KEY,
  total_played INTEGER NOT NULL DEFAULT 0,
  total_points_awarded INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS daily_stats (
  date TEXT PRIMARY KEY,
  games_played INTEGER NOT NULL DEFAULT 0,
  users_active INTEGER NOT NULL DEFAULT 0,
  points_awarded INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_game_history_group ON game_history(group_id);
CREATE INDEX IF NOT EXISTS idx_game_history_type ON game_history(game_type);
CREATE INDEX IF NOT EXISTS idx_game_history_played ON game_history(played_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
`;

export class DbStore {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  async initialize(): Promise<void> {
    await this.db.exec(SCHEMA);
  }

  async recordGame(history: Omit<GameHistory, 'id'>): Promise<void> {
    await this.db.prepare(
      `INSERT INTO game_history (game_type, group_id, creator_id, winner_id, players, rounds, duration, points_awarded, played_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(history.gameType, history.groupId, history.creatorId, history.winnerId, history.players, history.rounds, history.duration, history.pointsAwarded, history.playedAt).run();

    await this.db.prepare(
      `INSERT INTO game_stats (game_type, total_played, total_points_awarded)
       VALUES (?, 1, ?)
       ON CONFLICT(game_type) DO UPDATE SET
         total_played = total_played + 1,
         total_points_awarded = total_points_awarded + ?`
    ).bind(history.gameType, history.pointsAwarded, history.pointsAwarded).run();
  }

  async getGameHistory(groupId?: number, limit = 50): Promise<GameHistory[]> {
    if (groupId) {
      const result = await this.db.prepare(
        `SELECT * FROM game_history WHERE group_id = ? ORDER BY played_at DESC LIMIT ?`
      ).bind(groupId, limit).all();
      return result.results as any;
    }
    const result = await this.db.prepare(
      `SELECT * FROM game_history ORDER BY played_at DESC LIMIT ?`
    ).bind(limit).all();
    return result.results as any;
  }

  async getMostPlayedGames(): Promise<{ game_type: string; total_played: number; total_points: number }[]> {
    const result = await this.db.prepare(
      `SELECT game_type, total_played, total_points_awarded as total_points FROM game_stats ORDER BY total_played DESC`
    ).all();
    return result.results as any;
  }

  async getMostActiveMembers(groupId: number, limit = 10): Promise<{ user_id: number; games_played: number }[]> {
    const result = await this.db.prepare(
      `SELECT winner_id as user_id, COUNT(*) as games_played FROM game_history
       WHERE group_id = ? AND winner_id IS NOT NULL
       GROUP BY winner_id ORDER BY games_played DESC LIMIT ?`
    ).bind(groupId, limit).all();
    return result.results as any;
  }

  async logAudit(log: Omit<AuditLog, 'id'>): Promise<void> {
    await this.db.prepare(
      `INSERT INTO audit_log (user_id, group_id, action, details, timestamp) VALUES (?, ?, ?, ?, ?)`
    ).bind(log.userId, log.groupId, log.action, log.details, log.timestamp).run();
  }

  async getAuditLog(limit = 100): Promise<AuditLog[]> {
    const result = await this.db.prepare(
      `SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT ?`
    ).bind(limit).all();
    return result.results as any;
  }

  async getBotStats(): Promise<{ totalGames: number; totalPoints: number }> {
    const result = await this.db.prepare(
      `SELECT COUNT(*) as totalGames, COALESCE(SUM(points_awarded), 0) as totalPoints FROM game_history`
    ).first();
    return result as any;
  }

  async updateDailyStats(userCount: number, pointsAwarded: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    await this.db.prepare(
      `INSERT INTO daily_stats (date, games_played, users_active, points_awarded)
       VALUES (?, 1, ?, ?)
       ON CONFLICT(date) DO UPDATE SET
         games_played = games_played + 1,
         users_active = MAX(users_active, ?),
         points_awarded = points_awarded + ?`
    ).bind(today, userCount, pointsAwarded, userCount, pointsAwarded).run();
  }
}