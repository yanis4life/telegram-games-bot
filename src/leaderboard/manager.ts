import { LeaderboardEntry, GroupLeaderboardEntry } from '../types';
import { KvStore } from '../db/kv';

export class LeaderboardManager {
  private kv: KvStore;

  constructor(kv: KvStore) {
    this.kv = kv;
  }

  async rebuildGlobalLeaderboard(): Promise<LeaderboardEntry[]> {
    const userIds = await this.kv.listAllUsers();
    const entries: LeaderboardEntry[] = [];
    for (const id of userIds) {
      const user = await this.kv.getUser(id);
      if (user && !user.isBanned) {
        entries.push({
          userId: user.id,
          username: user.username,
          firstName: user.firstName,
          points: user.globalPoints,
          rank: 0,
        });
      }
    }
    entries.sort((a, b) => b.points - a.points);
    entries.forEach((e, i) => { e.rank = i + 1; });
    await this.kv.setLeaderboard(entries);
    return entries;
  }

  async rebuildGroupLeaderboard(groupId: number): Promise<LeaderboardEntry[]> {
    const groupUsers = await this.kv.getAllGroupUsers(groupId);
    const entries: LeaderboardEntry[] = [];
    for (const gu of groupUsers) {
      const user = await this.kv.getUser(gu.userId);
      if (user) {
        entries.push({
          userId: user.id,
          username: user.username,
          firstName: user.firstName,
          points: gu.groupPoints,
          rank: 0,
        });
      }
    }
    entries.sort((a, b) => b.points - a.points);
    entries.forEach((e, i) => { e.rank = i + 1; });
    await this.kv.setGroupLeaderboard(groupId, entries);
    return entries;
  }

  async rebuildGroupsLeaderboard(): Promise<GroupLeaderboardEntry[]> {
    const groupIds = await this.kv.listAllGroups();
    const entries: GroupLeaderboardEntry[] = [];
    for (const id of groupIds) {
      const group = await this.kv.getGroup(id);
      if (group && !group.isDeleted && !group.excludeFromLeaderboard) {
        entries.push({
          groupId: group.id,
          groupTitle: group.title,
          totalGames: group.totalGamesPlayed,
          totalPoints: group.totalPointsAwarded,
          rank: 0,
        });
      }
    }
    entries.sort((a, b) => b.totalPoints - a.totalPoints);
    entries.forEach((e, i) => { e.rank = i + 1; });
    await this.kv.setGroupsLeaderboard(entries);
    return entries;
  }

  async getGlobalLeaderboard(): Promise<LeaderboardEntry[]> {
    let entries = await this.kv.getLeaderboard();
    if (entries.length === 0) {
      entries = await this.rebuildGlobalLeaderboard();
    }
    return entries;
  }

  async getGroupLeaderboard(groupId: number): Promise<LeaderboardEntry[]> {
    let entries = await this.kv.getGroupLeaderboard(groupId);
    if (entries.length === 0) {
      entries = await this.rebuildGroupLeaderboard(groupId);
    }
    return entries;
  }

  async getGroupsLeaderboard(): Promise<GroupLeaderboardEntry[]> {
    let entries = await this.kv.getGroupsLeaderboard();
    if (entries.length === 0) {
      entries = await this.rebuildGroupsLeaderboard();
    }
    return entries;
  }

  async getUserRank(userId: number): Promise<number> {
    const entries = await this.getGlobalLeaderboard();
    const entry = entries.find(e => e.userId === userId);
    return entry?.rank || 0;
  }

  async getUserGroupRank(userId: number, groupId: number): Promise<number> {
    const entries = await this.getGroupLeaderboard(groupId);
    const entry = entries.find(e => e.userId === userId);
    return entry?.rank || 0;
  }
}