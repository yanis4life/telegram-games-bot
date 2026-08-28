import { UserData } from '../types';
import { KvStore } from '../db/kv';
import { DbStore } from '../db/d1';

export class UserManager {
  private kv: KvStore;
  private db: DbStore;

  constructor(kv: KvStore, db: DbStore) {
    this.kv = kv;
    this.db = db;
  }

  async getOrCreateUser(from: any): Promise<UserData> {
    let user = await this.kv.getUser(from.id);
    if (!user) {
      user = {
        id: from.id,
        username: from.username || '',
        firstName: from.first_name || '',
        lastName: from.last_name || '',
        languageCode: from.language_code || 'ar',
        isBot: from.is_bot || false,
        globalPoints: 0,
        xp: 0,
        level: 1,
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        isBanned: false,
        banReason: '',
        gamesPlayed: 0,
        gamesWon: 0,
        totalPlayTime: 0,
      };
      await this.kv.setUser(user);
    } else {
      user.username = from.username || user.username;
      user.firstName = from.first_name || user.firstName;
      user.lastName = from.last_name || user.lastName;
      user.lastActiveAt = new Date().toISOString();
      await this.kv.setUser(user);
    }
    return user;
  }

  async updateUser(userId: number, updates: Partial<UserData>): Promise<UserData | null> {
    const user = await this.kv.getUser(userId);
    if (!user) return null;
    Object.assign(user, updates);
    user.lastActiveAt = new Date().toISOString();
    await this.kv.setUser(user);
    return user;
  }

  async addPoints(userId: number, points: number): Promise<UserData | null> {
    const user = await this.kv.getUser(userId);
    if (!user) return null;
    user.globalPoints += points;
    user.lastActiveAt = new Date().toISOString();
    await this.kv.setUser(user);
    return user;
  }

  async addXp(userId: number, xp: number): Promise<{ user: UserData; leveledUp: boolean; newLevel: number }> {
    const user = await this.kv.getUser(userId);
    if (!user) throw new Error('User not found');
    user.xp += xp;
    const oldLevel = user.level;
    const { getLevelFromXp } = await import('../config');
    user.level = getLevelFromXp(user.xp);
    user.lastActiveAt = new Date().toISOString();
    await this.kv.setUser(user);
    return { user, leveledUp: user.level > oldLevel, newLevel: user.level };
  }

  async incrementGamesPlayed(userId: number): Promise<void> {
    await this.updateUser(userId, { gamesPlayed: (await this.kv.getUser(userId))?.gamesPlayed ?? 0 + 1 });
    const user = await this.kv.getUser(userId);
    if (user) {
      user.gamesPlayed += 1;
      await this.kv.setUser(user);
    }
  }

  async incrementGamesWon(userId: number): Promise<void> {
    const user = await this.kv.getUser(userId);
    if (user) {
      user.gamesWon += 1;
      await this.kv.setUser(user);
    }
  }

  async banUser(userId: number, reason: string): Promise<boolean> {
    const user = await this.kv.getUser(userId);
    if (!user) return false;
    user.isBanned = true;
    user.banReason = reason;
    await this.kv.setUser(user);
    await this.kv.deleteUserSession(userId);
    await this.db.logAudit({
      userId, groupId: 0, action: 'ban', details: reason, timestamp: new Date().toISOString(),
    });
    return true;
  }

  async unbanUser(userId: number): Promise<boolean> {
    const user = await this.kv.getUser(userId);
    if (!user) return false;
    user.isBanned = false;
    user.banReason = '';
    await this.kv.setUser(user);
    await this.db.logAudit({
      userId, groupId: 0, action: 'unban', details: '', timestamp: new Date().toISOString(),
    });
    return true;
  }

  async resetUser(userId: number): Promise<boolean> {
    const user = await this.kv.getUser(userId);
    if (!user) return false;
    user.globalPoints = 0;
    user.xp = 0;
    user.level = 1;
    user.gamesPlayed = 0;
    user.gamesWon = 0;
    user.totalPlayTime = 0;
    await this.kv.setUser(user);
    return true;
  }

  async isBanned(userId: number): Promise<boolean> {
    const user = await this.kv.getUser(userId);
    return user?.isBanned ?? false;
  }
}