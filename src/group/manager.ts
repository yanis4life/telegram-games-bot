import { GroupData, GroupUserData } from '../types';
import { KvStore } from '../db/kv';
import { DbStore } from '../db/d1';
import { GAMES } from '../config';

export class GroupManager {
  private kv: KvStore;
  private db: DbStore;

  constructor(kv: KvStore, db: DbStore) {
    this.kv = kv;
    this.db = db;
  }

  async getOrCreateGroup(chat: any): Promise<GroupData> {
    let group = await this.kv.getGroup(chat.id);
    if (!group) {
      const enabledGames: Record<string, boolean> = {};
      for (const key of Object.keys(GAMES)) {
        enabledGames[key] = true;
      }
      group = {
        id: chat.id,
        title: chat.title || '',
        type: chat.type || 'group',
        enabledGames,
        defaultRounds: 5,
        bannedMembers: [],
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        totalGamesPlayed: 0,
        totalPointsAwarded: 0,
        isDeleted: false,
        deletedAt: '',
        excludeFromLeaderboard: false,
        leaderboardExcludedAt: '',
      };
      await this.kv.setGroup(group);
    } else {
      group.title = chat.title || group.title;
      group.lastActiveAt = new Date().toISOString();
      if (group.isDeleted) {
        group.isDeleted = false;
        group.deletedAt = '';
      }
      await this.kv.setGroup(group);
    }
    return group;
  }

  async getGroupUser(userId: number, groupId: number): Promise<GroupUserData | null> {
    return this.kv.getGroupUser(userId, groupId);
  }

  async getOrCreateGroupUser(userId: number, groupId: number, username: string, firstName: string): Promise<GroupUserData> {
    let gu = await this.kv.getGroupUser(userId, groupId);
    if (!gu) {
      gu = {
        userId,
        groupId,
        groupPoints: 0,
        gamesPlayed: 0,
        gamesWon: 0,
        perks: {},
        lastActiveAt: new Date().toISOString(),
        joinedAt: new Date().toISOString(),
      };
      await this.kv.setGroupUser(gu);
      await this.kv.addUserGroup(userId, groupId);
    }
    return gu;
  }

  async addGroupPoints(userId: number, groupId: number, points: number): Promise<GroupUserData | null> {
    const gu = await this.kv.getGroupUser(userId, groupId);
    if (!gu) return null;
    gu.groupPoints += points;
    gu.lastActiveAt = new Date().toISOString();
    await this.kv.setGroupUser(gu);
    return gu;
  }

  async incrementGroupGamesPlayed(userId: number, groupId: number): Promise<void> {
    const gu = await this.kv.getGroupUser(userId, groupId);
    if (gu) {
      gu.gamesPlayed += 1;
      gu.lastActiveAt = new Date().toISOString();
      await this.kv.setGroupUser(gu);
    }
    const group = await this.kv.getGroup(groupId);
    if (group) {
      group.totalGamesPlayed += 1;
      await this.kv.setGroup(group);
    }
  }

  async incrementGroupGamesWon(userId: number, groupId: number): Promise<void> {
    const gu = await this.kv.getGroupUser(userId, groupId);
    if (gu) {
      gu.gamesWon += 1;
      gu.lastActiveAt = new Date().toISOString();
      await this.kv.setGroupUser(gu);
    }
  }

  async addGroupPointsAwarded(groupId: number, points: number): Promise<void> {
    const group = await this.kv.getGroup(groupId);
    if (group) {
      group.totalPointsAwarded += points;
      await this.kv.setGroup(group);
    }
  }

  async isGameEnabled(groupId: number, gameId: string): Promise<boolean> {
    const group = await this.kv.getGroup(groupId);
    if (!group) return false;
    return group.enabledGames[gameId] !== false;
  }

  async setGameEnabled(groupId: number, gameId: string, enabled: boolean): Promise<boolean> {
    const group = await this.kv.getGroup(groupId);
    if (!group) return false;
    group.enabledGames[gameId] = enabled;
    await this.kv.setGroup(group);
    return true;
  }

  async setDefaultRounds(groupId: number, rounds: number): Promise<boolean> {
    const group = await this.kv.getGroup(groupId);
    if (!group) return false;
    group.defaultRounds = rounds;
    await this.kv.setGroup(group);
    return true;
  }

  async banMember(groupId: number, userId: number): Promise<boolean> {
    const group = await this.kv.getGroup(groupId);
    if (!group) return false;
    if (!group.bannedMembers.includes(userId)) {
      group.bannedMembers.push(userId);
      await this.kv.setGroup(group);
    }
    await this.kv.setGroupBans(groupId, group.bannedMembers);
    return true;
  }

  async unbanMember(groupId: number, userId: number): Promise<boolean> {
    const group = await this.kv.getGroup(groupId);
    if (!group) return false;
    group.bannedMembers = group.bannedMembers.filter(id => id !== userId);
    await this.kv.setGroup(group);
    await this.kv.setGroupBans(groupId, group.bannedMembers);
    return true;
  }

  async isMemberBanned(groupId: number, userId: number): Promise<boolean> {
    const group = await this.kv.getGroup(groupId);
    if (!group) return false;
    return group.bannedMembers.includes(userId);
  }

  async softDeleteGroup(groupId: number): Promise<boolean> {
    const group = await this.kv.getGroup(groupId);
    if (!group) return false;
    group.isDeleted = true;
    group.deletedAt = new Date().toISOString();
    await this.kv.setGroup(group);
    return true;
  }

  async restoreGroup(groupId: number): Promise<boolean> {
    const group = await this.kv.getGroup(groupId);
    if (!group) return false;
    group.isDeleted = false;
    group.deletedAt = '';
    await this.kv.setGroup(group);
    return true;
  }

  async excludeFromLeaderboard(groupId: number): Promise<boolean> {
    const group = await this.kv.getGroup(groupId);
    if (!group) return false;
    group.excludeFromLeaderboard = true;
    group.leaderboardExcludedAt = new Date().toISOString();
    await this.kv.setGroup(group);
    return true;
  }

  async includeInLeaderboard(groupId: number): Promise<boolean> {
    const group = await this.kv.getGroup(groupId);
    if (!group) return false;
    group.excludeFromLeaderboard = false;
    group.leaderboardExcludedAt = '';
    await this.kv.setGroup(group);
    return true;
  }

  async isAdmin(telegram: any, chatId: number, userId: number): Promise<boolean> {
    try {
      const resp = await telegram.getChatAdministrators(chatId);
      if (!resp.ok || !resp.result) return false;
      return resp.result.some((m: any) => m.user.id === userId);
    } catch {
      return false;
    }
  }

  async updateGroupTitle(groupId: number, title: string): Promise<void> {
    const group = await this.kv.getGroup(groupId);
    if (group) {
      group.title = title;
      await this.kv.setGroup(group);
    }
  }
}