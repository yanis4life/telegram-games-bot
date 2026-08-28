import { Env, UserData, GroupData } from '../types';
import { KvStore } from '../db/kv';
import { DbStore } from '../db/d1';
import { UserManager } from '../user/manager';
import { GroupManager } from '../group/manager';
import { PointsSystem } from '../points/system';
import { ShopManager } from '../shop/shop';
import { SessionManager } from '../session/manager';
import { LeaderboardManager } from '../leaderboard/manager';
import { SudoManager, AdminManager } from '../admin/sudo';
import { AiService } from '../ai/api';
import { TelegramApi } from '../telegram';
import { GAMES, PERKS } from '../config';
import { t } from '../i18n/ar';
import { getGameInstance, BaseGame } from '../games/all';

export class CommandHandler {
  private kv: KvStore;
  private db: DbStore;
  private userManager: UserManager;
  private groupManager: GroupManager;
  private pointsSystem: PointsSystem;
  private shopManager: ShopManager;
  private sessionManager: SessionManager;
  private leaderboardManager: LeaderboardManager;
  private sudoManager: SudoManager;
  private adminManager: AdminManager;
  private ai: AiService;
  private telegram: TelegramApi;
  private env: Env;

  constructor(kv: KvStore, db: DbStore, userManager: UserManager, groupManager: GroupManager,
    pointsSystem: PointsSystem, shopManager: ShopManager, sessionManager: SessionManager,
    leaderboardManager: LeaderboardManager, sudoManager: SudoManager, adminManager: AdminManager,
    ai: AiService, telegram: TelegramApi, env: Env) {
    this.kv = kv;
    this.db = db;
    this.userManager = userManager;
    this.groupManager = groupManager;
    this.pointsSystem = pointsSystem;
    this.shopManager = shopManager;
    this.sessionManager = sessionManager;
    this.leaderboardManager = leaderboardManager;
    this.sudoManager = sudoManager;
    this.adminManager = adminManager;
    this.ai = ai;
    this.telegram = telegram;
    this.env = env;
  }

  private getGameDeps() {
    return {
      ai: this.ai, sessionManager: this.sessionManager, pointsSystem: this.pointsSystem,
      groupManager: this.groupManager, leaderboardManager: this.leaderboardManager,
      kv: this.kv, db: this.db, telegram: this.telegram, env: this.env,
    };
  }

  async handleMessage(chatId: number, userId: number, text: string, msg: any): Promise<string | null> {
    if (await this.userManager.isBanned(userId)) {
      const user = await this.kv.getUser(userId);
      return t('bannedFromBot', { reason: user?.banReason || 'غير محدد' });
    }

    const isGroup = chatId !== userId;
    if (isGroup) {
      await this.groupManager.getOrCreateGroup(msg.chat);
      const isBanned = await this.groupManager.isMemberBanned(chatId, userId);
      if (isBanned) return t('bannedFromGroup');
    }

    const user = await this.userManager.getOrCreateUser(msg.from);
    if (!text) return null;

    if (text === 'سجلني' || text === '/register') {
      return this.handleRegister(chatId, userId);
    }
    if (text === 'ابدأ' || text === '/start_game') {
      return this.handleStartGame(chatId, userId);
    }
    if (text === 'توقف' || text === '/stop') {
      return this.handleCancelGame(chatId, userId);
    }
    if (text === 'تأكيد') {
      return this.handleConfirm(chatId, userId);
    }

    const session = await this.sessionManager.getSession(chatId);
    if (session && session.isActive && session.state === 'playing') {
      return this.handleGameAnswer(chatId, userId, text, session);
    }

    return null;
  }

  async handleCommand(chatId: number, userId: number, command: string, args: string[], msg: any): Promise<string> {
    if (await this.userManager.isBanned(userId)) {
      const user = await this.kv.getUser(userId);
      return t('bannedFromBot', { reason: user?.banReason || 'غير محدد' });
    }

    await this.userManager.getOrCreateUser(msg.from);
    const isGroup = chatId !== userId;

    if (isGroup) {
      await this.groupManager.getOrCreateGroup(msg.chat);
      const isBanned = await this.groupManager.isMemberBanned(chatId, userId);
      if (isBanned) return t('bannedFromGroup');
    }

    const sudoResult = await this.sudoManager.handleSudoCommand(chatId, userId, command, args, msg);
    if (sudoResult) return sudoResult;

    const adminResult = await this.adminManager.handleAdminCommand(chatId, userId, command, args, msg);
    if (adminResult) return adminResult;

    switch (command) {
      case 'start':
        return t('welcome');
      case 'help':
        return t('help');
      case 'games':
        return this.handleGamesList(chatId);
      case 'play':
        return this.handlePlay(chatId, userId, args, msg);
      case 'points':
        return this.handlePoints(userId);
      case 'gpoints':
        if (!isGroup) return t('notInGroup');
        return this.handleGroupPoints(userId, chatId);
      case 'level':
        return this.handleLevel(userId);
      case 'shop':
        return this.handleShop(chatId);
      case 'buy':
        return this.handleBuy(chatId, userId, args);
      case 'inventory':
        return this.handleInventory(userId, chatId);
      case 'leaderboard':
        return this.handleLeaderboard();
      case 'gleaderboard':
        if (!isGroup) return t('notInGroup');
        return this.handleGroupLeaderboard(chatId);
      case 'groups_leaderboard':
        return this.handleGroupsLeaderboard();
      case 'cancel':
        return this.handleCancelGame(chatId, userId);
      case 'stats':
        return this.handleStats(userId);
      case 'use':
        return this.handleUsePerk(chatId, userId, args);
      default:
        return t('unknownCommand');
    }
  }

  private async handleRegister(chatId: number, userId: number): Promise<string> {
    const session = await this.sessionManager.getSession(chatId);
    if (!session || !session.isActive) return t('noActiveGame');
    const result = await this.sessionManager.registerPlayer(chatId, userId);
    if (result.success) {
      const user = await this.kv.getUser(userId);
      const playerCount = session.registeredPlayers.length;
      const playerNames = await Promise.all(session.registeredPlayers.map(async (pid) => {
        const u = await this.kv.getUser(pid);
        return u?.firstName || `#${pid}`;
      }));
      const playersList = playerNames.join('، ');
      return `${t('registered')}\n\n${t('currentPlayers', { count: playerCount.toString(), max: session.maxPlayers.toString(), players: playersList })}`;
    }
    switch (result.error) {
      case 'noActiveSession': return t('noActiveGame');
      case 'gameAlreadyStarted': return t('gameAlreadyStarted');
      case 'alreadyRegistered': return t('alreadyRegistered');
      case 'playerInAnotherGame': return t('playerInGame');
      case 'gameFull': return t('gameFull', { max: session.maxPlayers.toString() });
      default: return t('errorOccurred');
    }
  }

  private async handleStartGame(chatId: number, userId: number): Promise<string> {
    const result = await this.sessionManager.startGame(chatId, userId);
    if (result.success) {
      const session = await this.sessionManager.getSession(chatId);
      if (!session) return t('errorOccurred');
      const game = getGameInstance(session.gameType, this.getGameDeps());
      if (!game) return t('errorOccurred');
      const roundInfo = await game.handleRound(session);
      return `${t('gameStarted')}\n\n${t('roundInfo', { current: '1', total: session.totalRounds.toString() })}\n\n${roundInfo.text}`;
    }
    switch (result.error) {
      case 'noActiveSession': return t('noActiveGame');
      case 'notCreator': return t('notGameCreator');
      case 'gameAlreadyStarted': return t('gameAlreadyStarted');
      case 'notEnoughPlayers': return t('notEnoughPlayers');
      default: return t('errorOccurred');
    }
  }

  private async handleCancelGame(chatId: number, userId: number): Promise<string> {
    const result = await this.sessionManager.cancelGame(chatId, userId);
    if (result.success) return t('gameCancelled');
    switch (result.error) {
      case 'noActiveSession': return t('noActiveGame');
      case 'notCreator': return t('notGameCreator');
      default: return t('errorOccurred');
    }
  }

  private async handleConfirm(chatId: number, userId: number): Promise<string> {
    return t('actionCancelled');
  }

  private async handleGameAnswer(chatId: number, userId: number, answer: string, session: any): Promise<string> {
    const game = getGameInstance(session.gameType, this.getGameDeps());
    if (!game) return t('errorOccurred');
    const result = await game.handleAnswer(session, userId, answer);
    if (result.correct) {
      session.scores[userId] = (session.scores[userId] || 0) + 1;
      await this.sessionManager.updateSession(session);
    }
    if (session.currentRound >= session.totalRounds && this.allPlayersAnswered(session)) {
      const finish = await game.finishGame(session);
      await this.sessionManager.endGame(chatId);
      return finish.results;
    }
    if (this.allPlayersAnswered(session)) {
      const nextRound = await this.sessionManager.advanceRound(chatId);
      if (!nextRound || nextRound.state === 'finished') {
        const finish = await game.finishGame(session);
        await this.sessionManager.endGame(chatId);
        return finish.results;
      }
      const roundInfo = await game.handleRound(nextRound);
      return `${t('roundInfo', { current: String(nextRound.currentRound), total: String(nextRound.totalRounds) })}\n\n${roundInfo.text}`;
    }
    return result.message;
  }

  private allPlayersAnswered(session: any): boolean {
    for (const pid of session.players) {
      if (!session.scores[pid] && session.scores[pid] !== 0) return false;
    }
    return true;
  }

  private async handleGamesList(chatId: number): Promise<string> {
    const group = await this.kv.getGroup(chatId);
    const enabled = group?.enabledGames || {};
    const games = Object.entries(GAMES)
      .filter(([id]) => enabled[id] !== false)
      .map(([id, g]) => `🎮 <b>${g.name}</b>\n📝 ${g.description}\n🏆 ${g.pointsWin} نقطة | ⭐ ${g.xpWin} XP\n📋 /play ${id}`)
      .join('\n\n');
    return `${t('gameList')}\n\n${games}`;
  }

  private async handlePlay(chatId: number, userId: number, args: string[], msg: any): Promise<string> {
    const gameId = args[0]?.toLowerCase();
    if (!gameId || !GAMES[gameId]) return t('invalidGameName');
    const isEnabled = await this.groupManager.isGameEnabled(chatId, gameId);
    if (!isEnabled) return t('gameNotEnabled');
    const gameDef = GAMES[gameId];
    const group = await this.kv.getGroup(chatId);
    const rounds = group?.defaultRounds || gameDef.defaultRounds;
    const session = await this.sessionManager.createSession(userId, chatId, gameId, rounds);
    if (!session) return t('gameAlreadyActive');
    const playerNames = await Promise.all(session.registeredPlayers.map(async (pid) => {
      const u = await this.kv.getUser(pid);
      return u?.firstName || `#${pid}`;
    }));
    const playersList = playerNames.join('، ') || 'لا يوجد';
    return `${t('gameInfo', { name: gameDef.name, desc: gameDef.description, points: gameDef.pointsWin.toString(), xp: gameDef.xpWin.toString() })}\n\n${t('registerPrompt')}\n${t('currentPlayers', { count: '1', max: session.maxPlayers.toString(), players: playersList })}\n\n📝 ${t('startButton')}: اكتب "ابدأ"\n⏹ ${t('cancelButton')}: اكتب "توقف"`;
  }

  private async handlePoints(userId: number): Promise<string> {
    const pts = await this.pointsSystem.getUserPoints(userId);
    return t('currentPoints', { points: pts.globalPoints.toString() });
  }

  private async handleGroupPoints(userId: number, groupId: number): Promise<string> {
    const pts = await this.pointsSystem.getGroupUserPoints(userId, groupId);
    return t('currentGroupPoints', { points: pts.toString() });
  }

  private async handleLevel(userId: number): Promise<string> {
    const info = await this.pointsSystem.getUserLevel(userId);
    return t('currentLevel', { level: info.level.toString(), xp: info.xp.toString(), nextXp: info.nextXp.toString(), percent: info.progress.toString() });
  }

  private async handleShop(chatId: number): Promise<string> {
    const perks = PERKS.map(p => `${p.id}. ${p.name} - ${p.price} نقطة\n   ${p.description}`).join('\n\n');
    return `${t('shopTitle')}\n\n${perks}\n\n📝 للشراء: /buy [رقم الدعامة]`;
  }

  private async handleBuy(chatId: number, userId: number, args: string[]): Promise<string> {
    if (!args[0]) return '⚠️ الرجاء تحديد رقم الدعامة.';
    const perkId = parseInt(args[0]);
    if (isNaN(perkId)) return '⚠️ رقم غير صالح.';
    const result = await this.shopManager.buyPerk(userId, chatId, perkId);
    if (result.success) {
      const perk = this.shopManager.getPerk(perkId);
      return t('boughtPerk', { perk: perk?.name || 'Unknown' });
    }
    switch (result.error) {
      case 'perkNotFound': return '⚠️ الدعامة غير موجودة.';
      case 'insufficientPoints': {
        const perk = this.shopManager.getPerk(perkId);
        return t('notEnoughPoints', { price: (perk?.price || 0).toString() });
      }
      case 'maxUses': return t('maxUsesReached');
      default: return t('errorOccurred');
    }
  }

  private async handleInventory(userId: number, groupId: number): Promise<string> {
    const perks = await this.shopManager.getUserPerks(userId, groupId);
    if (perks.length === 0) return t('noPerks');
    const list = perks.map(p => `• ${p.name} - ${p.uses} استخدامات`).join('\n');
    return `${t('inventoryTitle')}${list}`;
  }

  private async handleLeaderboard(): Promise<string> {
    const entries = await this.leaderboardManager.getGlobalLeaderboard();
    if (entries.length === 0) return t('noLeaderboardData');
    const top10 = entries.slice(0, 10);
    const list = top10.map(e => t('rankDisplay', { rank: e.rank.toString(), name: e.firstName || e.username || `#${e.userId}`, points: e.points.toString() })).join('');
    return `${t('leaderboardTitle')}${list}`;
  }

  private async handleGroupLeaderboard(groupId: number): Promise<string> {
    const entries = await this.leaderboardManager.getGroupLeaderboard(groupId);
    if (entries.length === 0) return t('noLeaderboardData');
    const top10 = entries.slice(0, 10);
    const list = top10.map(e => t('rankDisplay', { rank: e.rank.toString(), name: e.firstName || e.username || `#${e.userId}`, points: e.points.toString() })).join('');
    return `${t('groupLeaderboardTitle')}${list}`;
  }

  private async handleGroupsLeaderboard(): Promise<string> {
    const entries = await this.leaderboardManager.getGroupsLeaderboard();
    if (entries.length === 0) return t('noLeaderboardData');
    const top10 = entries.slice(0, 10);
    const list = top10.map(e => t('groupRankDisplay', { rank: e.rank.toString(), group: e.groupTitle, games: e.totalGames.toString(), points: e.totalPoints.toString() })).join('');
    return `${t('groupsLeaderboardTitle')}${list}`;
  }

  private async handleStats(userId: number): Promise<string> {
    const user = await this.kv.getUser(userId);
    if (!user) return t('userNotRegistered');
    const winRate = user.gamesPlayed > 0 ? Math.round((user.gamesWon / user.gamesPlayed) * 100) : 0;
    const minutes = Math.floor(user.totalPlayTime / 60);
    const timeStr = minutes > 0 ? `${minutes} دقيقة` : `${user.totalPlayTime} ثانية`;
    return t('statsTitle', { played: user.gamesPlayed.toString(), won: user.gamesWon.toString(), percent: winRate.toString(), time: timeStr });
  }

  private async handleUsePerk(chatId: number, userId: number, args: string[]): Promise<string> {
    if (!args[0]) return '⚠️ الرجاء تحديد رقم الدعامة.';
    const perkId = parseInt(args[0]);
    if (isNaN(perkId)) return '⚠️ رقم غير صالح.';
    const result = await this.shopManager.usePerk(userId, chatId, perkId);
    if (result.success) {
      const perk = this.shopManager.getPerk(perkId);
      return t('perkUsed', { perk: perk?.name || 'Unknown' });
    }
    return t('perkNotAvailable');
  }
}