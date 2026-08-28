import { UserData, GroupData, GroupUserData, GameSession, LeaderboardEntry, GroupLeaderboardEntry } from '../types';

const KV_PREFIXES = {
  USER: 'user:',
  GROUP: 'group:',
  GROUP_USER: 'group_user:',
  SESSION: 'session:',
  LEADERBOARD: 'lb:',
  GROUP_LEADERBOARD: 'glb:',
  GROUPS_LB: 'groups_lb:',
  SUDO: 'sudo:',
  USER_GROUPS: 'user_groups:',
  GROUP_BANS: 'group_bans:',
  USER_SESSION: 'user_session:',
};

export class KvStore {
  private kv: KVNamespace;

  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

  async getUser(userId: number): Promise<UserData | null> {
    const data = await this.kv.get(`${KV_PREFIXES.USER}${userId}`, 'json');
    return data as any;
  }

  async setUser(user: UserData): Promise<void> {
    await this.kv.put(`${KV_PREFIXES.USER}${user.id}`, JSON.stringify(user));
  }

  async deleteUser(userId: number): Promise<void> {
    await this.kv.delete(`${KV_PREFIXES.USER}${userId}`);
  }

  async getGroup(groupId: number): Promise<GroupData | null> {
    const data = await this.kv.get(`${KV_PREFIXES.GROUP}${groupId}`, 'json');
    return data as any;
  }

  async setGroup(group: GroupData): Promise<void> {
    await this.kv.put(`${KV_PREFIXES.GROUP}${group.id}`, JSON.stringify(group));
  }

  async deleteGroup(groupId: number): Promise<void> {
    await this.kv.delete(`${KV_PREFIXES.GROUP}${groupId}`);
  }

  async getGroupUser(userId: number, groupId: number): Promise<GroupUserData | null> {
    const data = await this.kv.get(`${KV_PREFIXES.GROUP_USER}${groupId}:${userId}`, 'json');
    return data as any;
  }

  async setGroupUser(data: GroupUserData): Promise<void> {
    await this.kv.put(`${KV_PREFIXES.GROUP_USER}${data.groupId}:${data.userId}`, JSON.stringify(data));
  }

  async deleteGroupUser(userId: number, groupId: number): Promise<void> {
    await this.kv.delete(`${KV_PREFIXES.GROUP_USER}${groupId}:${userId}`);
  }

  async getSession(groupId: number): Promise<GameSession | null> {
    const data = await this.kv.get(`${KV_PREFIXES.SESSION}${groupId}`, 'json');
    return data as any;
  }

  async setSession(session: GameSession): Promise<void> {
    await this.kv.put(`${KV_PREFIXES.SESSION}${session.groupId}`, JSON.stringify(session));
  }

  async deleteSession(groupId: number): Promise<void> {
    await this.kv.delete(`${KV_PREFIXES.SESSION}${groupId}`);
  }

  async getUserSession(userId: number): Promise<number | null> {
    const data = await this.kv.get(`${KV_PREFIXES.USER_SESSION}${userId}`, 'json');
    return data as any;
  }

  async setUserSession(userId: number, groupId: number): Promise<void> {
    await this.kv.put(`${KV_PREFIXES.USER_SESSION}${userId}`, JSON.stringify(groupId));
  }

  async deleteUserSession(userId: number): Promise<void> {
    await this.kv.delete(`${KV_PREFIXES.USER_SESSION}${userId}`);
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const data = await this.kv.get(`${KV_PREFIXES.LEADERBOARD}global`, 'json');
    return (data as any) || [];
  }

  async setLeaderboard(entries: LeaderboardEntry[]): Promise<void> {
    await this.kv.put(`${KV_PREFIXES.LEADERBOARD}global`, JSON.stringify(entries));
  }

  async getGroupLeaderboard(groupId: number): Promise<LeaderboardEntry[]> {
    const data = await this.kv.get(`${KV_PREFIXES.GROUP_LEADERBOARD}${groupId}`, 'json');
    return (data as any) || [];
  }

  async setGroupLeaderboard(groupId: number, entries: LeaderboardEntry[]): Promise<void> {
    await this.kv.put(`${KV_PREFIXES.GROUP_LEADERBOARD}${groupId}`, JSON.stringify(entries));
  }

  async getGroupsLeaderboard(): Promise<GroupLeaderboardEntry[]> {
    const data = await this.kv.get(`${KV_PREFIXES.GROUPS_LB}global`, 'json');
    return (data as any) || [];
  }

  async setGroupsLeaderboard(entries: GroupLeaderboardEntry[]): Promise<void> {
    await this.kv.put(`${KV_PREFIXES.GROUPS_LB}global`, JSON.stringify(entries));
  }

  async getSudoUsers(): Promise<number[]> {
    const data = await this.kv.get(`${KV_PREFIXES.SUDO}list`, 'json');
    return (data as any) || [];
  }

  async setSudoUsers(users: number[]): Promise<void> {
    await this.kv.put(`${KV_PREFIXES.SUDO}list`, JSON.stringify(users));
  }

  async getUserGroups(userId: number): Promise<number[]> {
    const data = await this.kv.get(`${KV_PREFIXES.USER_GROUPS}${userId}`, 'json');
    return (data as any) || [];
  }

  async setUserGroups(userId: number, groups: number[]): Promise<void> {
    await this.kv.put(`${KV_PREFIXES.USER_GROUPS}${userId}`, JSON.stringify(groups));
  }

  async addUserGroup(userId: number, groupId: number): Promise<void> {
    const groups = await this.getUserGroups(userId);
    if (!groups.includes(groupId)) {
      groups.push(groupId);
      await this.setUserGroups(userId, groups);
    }
  }

  async getGroupBans(groupId: number): Promise<number[]> {
    const data = await this.kv.get(`${KV_PREFIXES.GROUP_BANS}${groupId}`, 'json');
    return (data as any) || [];
  }

  async setGroupBans(groupId: number, users: number[]): Promise<void> {
    await this.kv.put(`${KV_PREFIXES.GROUP_BANS}${groupId}`, JSON.stringify(users));
  }

  async listAllUsers(): Promise<number[]> {
    const list = await this.kv.list({ prefix: KV_PREFIXES.USER });
    return list.keys.map(k => parseInt(k.name.replace(KV_PREFIXES.USER, '')));
  }

  async listAllGroups(): Promise<number[]> {
    const list = await this.kv.list({ prefix: KV_PREFIXES.GROUP });
    return list.keys.map(k => parseInt(k.name.replace(KV_PREFIXES.GROUP, '')));
  }

  async getAllGroupUsers(groupId: number): Promise<GroupUserData[]> {
    const list = await this.kv.list({ prefix: `${KV_PREFIXES.GROUP_USER}${groupId}:` });
    const results: GroupUserData[] = [];
    for (const key of list.keys) {
      const data = await this.kv.get(key.name, 'json');
      if (data) results.push(data as any);
    }
    return results;
  }
}