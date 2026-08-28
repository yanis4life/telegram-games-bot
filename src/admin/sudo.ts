import { Env, UserData } from '../types';
import { KvStore } from '../db/kv';
import { DbStore } from '../db/d1';
import { UserManager } from '../user/manager';
import { GroupManager } from '../group/manager';
import { PointsSystem } from '../points/system';
import { LeaderboardManager } from '../leaderboard/manager';
import { TelegramApi } from '../telegram';
import { t } from '../i18n/ar';
import { getSudoUsers } from '../config';

export class SudoManager {
  private kv: KvStore;
  private db: DbStore;
  private userManager: UserManager;
  private pointsSystem: PointsSystem;
  private telegram: TelegramApi;
  private env: Env;

  constructor(kv: KvStore, db: DbStore, userManager: UserManager, pointsSystem: PointsSystem, telegram: TelegramApi, env: Env) {
    this.kv = kv;
    this.db = db;
    this.userManager = userManager;
    this.pointsSystem = pointsSystem;
    this.telegram = telegram;
    this.env = env;
  }

  isSudo(userId: number): boolean {
    const sudos = getSudoUsers(this.env);
    return sudos.includes(userId);
  }

  async addSudo(userId: number): Promise<boolean> {
    const sudos = getSudoUsers(this.env);
    if (sudos.includes(userId)) return false;
    sudos.push(userId);
    await this.kv.setSudoUsers(sudos);
    const newEnv = JSON.parse(JSON.stringify(this.env));
    newEnv.SUDO_USERS = JSON.stringify(sudos);
    return true;
  }

  async removeSudo(userId: number): Promise<boolean> {
    const sudos = getSudoUsers(this.env);
    const filtered = sudos.filter(id => id !== userId);
    if (filtered.length === sudos.length) return false;
    await this.kv.setSudoUsers(filtered);
    return true;
  }

  async listSudos(): Promise<number[]> {
    return getSudoUsers(this.env);
  }

  async handleSudoCommand(chatId: number, userId: number, command: string, args: string[], msg: any): Promise<string> {
    if (!this.isSudo(userId)) return t('onlySudo');

    switch (command) {
      case 'addsudo': {
        if (!args[0]) return '⚠️ الرجاء تحديد معرف المستخدم.';
        const targetId = parseInt(args[0]);
        if (isNaN(targetId)) return '⚠️ معرف مستخدم غير صالح.';
        await this.addSudo(targetId);
        await this.db.logAudit({ userId, groupId: chatId, action: 'add_sudo', details: `Added sudo: ${targetId}`, timestamp: new Date().toISOString() });
        return t('adminAdded', { user: targetId.toString() });
      }
      case 'removesudo': {
        if (!args[0]) return '⚠️ الرجاء تحديد معرف المستخدم.';
        const targetId = parseInt(args[0]);
        if (isNaN(targetId)) return '⚠️ معرف مستخدم غير صالح.';
        await this.removeSudo(targetId);
        await this.db.logAudit({ userId, groupId: chatId, action: 'remove_sudo', details: `Removed sudo: ${targetId}`, timestamp: new Date().toISOString() });
        return t('adminRemoved', { user: targetId.toString() });
      }
      case 'setpoints': {
        if (args.length < 2) return '⚠️ الرجاء تحديد المستخدم وعدد النقاط.';
        const targetId = parseInt(args[0]);
        const points = parseInt(args[1]);
        if (isNaN(targetId) || isNaN(points)) return '⚠️ بيانات غير صالحة.';
        const success = await this.pointsSystem.setUserPointsDirect(targetId, points);
        if (!success) return t('userNotRegistered');
        await this.db.logAudit({ userId, groupId: chatId, action: 'set_points', details: `Set ${targetId} points to ${points}`, timestamp: new Date().toISOString() });
        return t('pointsSet', { user: targetId.toString(), points: points.toString() });
      }
      case 'setxp': {
        if (args.length < 2) return '⚠️ الرجاء تحديد المستخدم وعدد XP.';
        const targetId = parseInt(args[0]);
        const xp = parseInt(args[1]);
        if (isNaN(targetId) || isNaN(xp)) return '⚠️ بيانات غير صالحة.';
        const success = await this.pointsSystem.setUserXpDirect(targetId, xp);
        if (!success) return t('userNotRegistered');
        await this.db.logAudit({ userId, groupId: chatId, action: 'set_xp', details: `Set ${targetId} XP to ${xp}`, timestamp: new Date().toISOString() });
        return t('xpSet', { user: targetId.toString(), xp: xp.toString() });
      }
      case 'resetuser': {
        if (!args[0]) return '⚠️ الرجاء تحديد المستخدم.';
        const targetId = parseInt(args[0]);
        if (isNaN(targetId)) return '⚠️ معرف مستخدم غير صالح.';
        await this.userManager.resetUser(targetId);
        await this.db.logAudit({ userId, groupId: chatId, action: 'reset_user', details: `Reset user: ${targetId}`, timestamp: new Date().toISOString() });
        return t('userReset', { user: targetId.toString() });
      }
      case 'banuser': {
        if (args.length < 2) return '⚠️ الرجاء تحديد المستخدم والسبب.';
        const targetId = parseInt(args[0]);
        if (isNaN(targetId)) return '⚠️ معرف مستخدم غير صالح.';
        const reason = args.slice(1).join(' ');
        await this.userManager.banUser(targetId, reason);
        await this.db.logAudit({ userId, groupId: chatId, action: 'ban_user', details: `Banned ${targetId}: ${reason}`, timestamp: new Date().toISOString() });
        return t('userBanned', { user: targetId.toString(), reason });
      }
      case 'unbanuser': {
        if (!args[0]) return '⚠️ الرجاء تحديد المستخدم.';
        const targetId = parseInt(args[0]);
        if (isNaN(targetId)) return '⚠️ معرف مستخدم غير صالح.';
        await this.userManager.unbanUser(targetId);
        await this.db.logAudit({ userId, groupId: chatId, action: 'unban_user', details: `Unbanned ${targetId}`, timestamp: new Date().toISOString() });
        return t('userUnbanned', { user: targetId.toString() });
      }
      case 'broadcast': {
        if (args.length === 0) return '⚠️ الرجاء كتابة الرسالة.';
        const message = args.join(' ');
        let sentUsers = 0;
        let sentGroups = 0;
        let failed = 0;
        const userIds = await this.kv.listAllUsers();
        for (const uid of userIds) {
          try {
            const resp = await this.telegram.sendMessage(uid, `📢 إعلان رسمي:\n\n${message}`);
            if (resp.ok) sentUsers++;
            else failed++;
          } catch { failed++; }
        }
        const groupIds = await this.kv.listAllGroups();
        for (const gid of groupIds) {
          try {
            const resp = await this.telegram.sendMessage(gid, `📢 إعلان رسمي:\n\n${message}`);
            if (resp.ok) sentGroups++;
            else failed++;
          } catch { failed++; }
        }
        await this.db.logAudit({ userId, groupId: chatId, action: 'broadcast', details: `Sent to ${sentUsers} users + ${sentGroups} groups`, timestamp: new Date().toISOString() });
        return t('broadcastSent', { users: sentUsers.toString(), groups: sentGroups.toString(), failed: failed.toString() });
      }
      case 'broadcastusers': {
        if (args.length === 0) return '⚠️ الرجاء كتابة الرسالة.';
        const message = args.join(' ');
        let sent = 0;
        let failed = 0;
        const userIds = await this.kv.listAllUsers();
        for (const uid of userIds) {
          try {
            const resp = await this.telegram.sendMessage(uid, `📢 إعلان للمستخدمين:\n\n${message}`);
            if (resp.ok) sent++;
            else failed++;
          } catch { failed++; }
        }
        await this.db.logAudit({ userId, groupId: chatId, action: 'broadcast_users', details: `Sent to ${sent} users`, timestamp: new Date().toISOString() });
        return t('broadcastUsersSent', { count: sent.toString(), failed: failed.toString() });
      }
      case 'broadcastgroups': {
        if (args.length === 0) return '⚠️ الرجاء كتابة الرسالة.';
        const message = args.join(' ');
        let sent = 0;
        let failed = 0;
        const groupIds = await this.kv.listAllGroups();
        for (const gid of groupIds) {
          try {
            const resp = await this.telegram.sendMessage(gid, `📢 إعلان للمجموعات:\n\n${message}`);
            if (resp.ok) sent++;
            else failed++;
          } catch { failed++; }
        }
        await this.db.logAudit({ userId, groupId: chatId, action: 'broadcast_groups', details: `Sent to ${sent} groups`, timestamp: new Date().toISOString() });
        return t('broadcastGroupsSent', { count: sent.toString(), failed: failed.toString() });
      }
      case 'botstats': {
        const userIds = await this.kv.listAllUsers();
        const groupIds = await this.kv.listAllGroups();
        const stats = await this.db.getBotStats();
        return t('botStats', {
          users: userIds.length.toString(),
          groups: groupIds.length.toString(),
          games: stats.totalGames.toString(),
          points: stats.totalPoints.toString(),
        });
      }
      case 'sudolist': {
        const sudos = await this.listSudos();
        const names = await Promise.all(sudos.map(async (id) => {
          const user = await this.kv.getUser(id);
          return user ? `${user.firstName} (@${user.username || id})` : `#${id}`;
        }));
        return t('sudosList', { sudos: names.join('\n') });
      }
      default:
        return '';
    }
  }
}

export class AdminManager {
  private kv: KvStore;
  private db: DbStore;
  private groupManager: GroupManager;
  private sessionManager: any;
  private telegram: TelegramApi;

  constructor(kv: KvStore, db: DbStore, groupManager: GroupManager, sessionManager: any, telegram: TelegramApi) {
    this.kv = kv;
    this.db = db;
    this.groupManager = groupManager;
    this.sessionManager = sessionManager;
    this.telegram = telegram;
  }

  async handleAdminCommand(chatId: number, userId: number, command: string, args: string[], msg: any): Promise<string> {
    const isAdmin = await this.groupManager.isAdmin(this.telegram, chatId, userId);
    if (!isAdmin) return t('onlyAdmin');

    switch (command) {
      case 'viewuser': {
        if (!args[0]) return '⚠️ الرجاء تحديد المستخدم.';
        const targetId = parseInt(args[0]);
        if (isNaN(targetId)) return '⚠️ معرف مستخدم غير صالح.';
        const user = await this.kv.getUser(targetId);
        if (!user) return t('userNotRegistered');
        const gu = await this.kv.getGroupUser(targetId, chatId);
        const groups = await this.kv.getUserGroups(targetId);
        return `👤 المستخدم: ${user.firstName} (@${user.username || 'N/A'})\n💎 النقاط العالمية: ${user.globalPoints}\n⭐ المستوى: ${user.level}\n🔥 XP: ${user.xp}\n🎮 ألعاب: ${user.gamesPlayed}\n🏆 فوز: ${user.gamesWon}\n📊 نقاط المجموعة: ${gu?.groupPoints || 0}\n📋 المجموعات: ${groups.length}`;
      }
      case 'resetsession': {
        await this.sessionManager.resetSession(chatId);
        await this.db.logAudit({ userId, groupId: chatId, action: 'reset_session', details: 'Session reset by admin', timestamp: new Date().toISOString() });
        return t('sessionReset');
      }
      case 'endgame': {
        const session = await this.sessionManager.endGameByAdmin(chatId);
        if (!session) return t('noActiveGame');
        await this.db.logAudit({ userId, groupId: chatId, action: 'end_game', details: 'Game ended by admin', timestamp: new Date().toISOString() });
        return t('gameEndedByAdmin');
      }
      case 'enablegame': {
        if (!args[0]) return '⚠️ الرجاء تحديد اسم اللعبة.';
        await this.groupManager.setGameEnabled(chatId, args[0], true);
        return t('gameEnabled', { game: args[0] });
      }
      case 'disablegame': {
        if (!args[0]) return '⚠️ الرجاء تحديد اسم اللعبة.';
        await this.groupManager.setGameEnabled(chatId, args[0], false);
        return t('gameDisabled', { game: args[0] });
      }
      case 'setrounds': {
        if (!args[0]) return '⚠️ الرجاء تحديد عدد الجولات.';
        const rounds = parseInt(args[0]);
        if (isNaN(rounds) || rounds < 1 || rounds > 20) return '⚠️ عدد جولات غير صالح (1-20).';
        await this.groupManager.setDefaultRounds(chatId, rounds);
        return t('roundsSet', { rounds: rounds.toString() });
      }
      case 'banmember': {
        if (!args[0]) return '⚠️ الرجاء تحديد العضو.';
        const targetId = parseInt(args[0]);
        if (isNaN(targetId)) return '⚠️ معرف مستخدم غير صالح.';
        await this.groupManager.banMember(chatId, targetId);
        await this.db.logAudit({ userId, groupId: chatId, action: 'ban_member', details: `Banned ${targetId} from group`, timestamp: new Date().toISOString() });
        return t('memberBanned');
      }
      case 'unbanmember': {
        if (!args[0]) return '⚠️ الرجاء تحديد العضو.';
        const targetId = parseInt(args[0]);
        if (isNaN(targetId)) return '⚠️ معرف مستخدم غير صالح.';
        await this.groupManager.unbanMember(chatId, targetId);
        return t('memberUnbanned');
      }
      case 'deletegroup': {
        await this.groupManager.softDeleteGroup(chatId);
        await this.db.logAudit({ userId, groupId: chatId, action: 'delete_group', details: 'Group soft deleted', timestamp: new Date().toISOString() });
        return t('groupDeleted');
      }
      case 'restoregroup': {
        await this.groupManager.restoreGroup(chatId);
        return t('groupRestored');
      }
      case 'removefromlb': {
        await this.groupManager.excludeFromLeaderboard(chatId);
        return t('groupRemovedFromLeaderboard');
      }
      case 'restoretolb': {
        await this.groupManager.includeInLeaderboard(chatId);
        return t('groupRestoredToLeaderboard');
      }
      case 'groupsettings': {
        const group = await this.kv.getGroup(chatId);
        if (!group) return t('groupNotRegistered');
        const games = Object.entries(group.enabledGames)
          .map(([k, v]) => `${v ? '✅' : '❌'} ${k}`)
          .join('\n');
        const banned = group.bannedMembers.length > 0
          ? group.bannedMembers.join(', ')
          : 'لا يوجد';
        return t('groupSettings', { games, rounds: group.defaultRounds.toString(), banned });
      }
      default:
        return '';
    }
  }
}