import { UserData, GroupUserData } from '../types';
import { KvStore } from '../db/kv';
import { UserManager } from '../user/manager';
import { GroupManager } from '../group/manager';
import { getLevelFromXp, getXpForNextLevel, XP_LEVEL_THRESHOLDS } from '../config';

export class PointsSystem {
  private kv: KvStore;
  private userManager: UserManager;
  private groupManager: GroupManager;

  constructor(kv: KvStore, userManager: UserManager, groupManager: GroupManager) {
    this.kv = kv;
    this.userManager = userManager;
    this.groupManager = groupManager;
  }

  async awardPoints(userId: number, groupId: number, globalPoints: number, groupPoints: number, xp: number): Promise<{
    user: UserData;
    groupUser: GroupUserData | null;
    leveledUp: boolean;
    newLevel: number;
  }> {
    const userResult = await this.userManager.addXp(userId, xp);
    await this.userManager.addPoints(userId, globalPoints);
    const gu = await this.groupManager.addGroupPoints(userId, groupId, groupPoints);
    await this.groupManager.addGroupPointsAwarded(groupId, groupPoints);
    await this.userManager.incrementGamesPlayed(userId);
    await this.groupManager.incrementGroupGamesPlayed(userId, groupId);
    const user = await this.kv.getUser(userId);
    return {
      user: user!,
      groupUser: gu,
      leveledUp: userResult.leveledUp,
      newLevel: userResult.newLevel,
    };
  }

  async awardWin(userId: number, groupId: number, pointsWin: number, xpWin: number): Promise<{
    user: UserData;
    groupUser: GroupUserData | null;
    leveledUp: boolean;
    newLevel: number;
  }> {
    await this.userManager.incrementGamesWon(userId);
    await this.groupManager.incrementGroupGamesWon(userId, groupId);
    return this.awardPoints(userId, groupId, pointsWin, pointsWin, xpWin);
  }

  async getUserPoints(userId: number): Promise<{ globalPoints: number; xp: number; level: number }> {
    const user = await this.kv.getUser(userId);
    if (!user) return { globalPoints: 0, xp: 0, level: 1 };
    return { globalPoints: user.globalPoints, xp: user.xp, level: user.level };
  }

  async getGroupUserPoints(userId: number, groupId: number): Promise<number> {
    const gu = await this.kv.getGroupUser(userId, groupId);
    return gu?.groupPoints ?? 0;
  }

  async getUserLevel(userId: number): Promise<{ level: number; xp: number; nextXp: number; progress: number }> {
    const user = await this.kv.getUser(userId);
    if (!user) return { level: 1, xp: 0, nextXp: 100, progress: 0 };
    const level = user.level;
    const currentThreshold = level > 1 ? XP_LEVEL_THRESHOLDS[level - 2] : 0;
    const nextThreshold = level < XP_LEVEL_THRESHOLDS.length ? XP_LEVEL_THRESHOLDS[level - 1] : XP_LEVEL_THRESHOLDS[XP_LEVEL_THRESHOLDS.length - 1];
    const xpInLevel = user.xp - currentThreshold;
    const xpNeeded = nextThreshold - currentThreshold;
    const progress = xpNeeded > 0 ? Math.min(100, Math.round((xpInLevel / xpNeeded) * 100)) : 100;
    return { level: user.level, xp: user.xp, nextXp: nextThreshold, progress };
  }

  async setUserPointsDirect(userId: number, points: number): Promise<boolean> {
    const user = await this.kv.getUser(userId);
    if (!user) return false;
    user.globalPoints = points;
    await this.kv.setUser(user);
    return true;
  }

  async setUserXpDirect(userId: number, xp: number): Promise<boolean> {
    const user = await this.kv.getUser(userId);
    if (!user) return false;
    user.xp = xp;
    user.level = getLevelFromXp(xp);
    await this.kv.setUser(user);
    return true;
  }
}