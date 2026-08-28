import { GameSession } from '../types';
import { KvStore } from '../db/kv';
import { GAMES, getGameTimeoutMinutes, getInactivityTimeoutMinutes, getMaxPlayers } from '../config';
import { Env } from '../types';

export class SessionManager {
  private kv: KvStore;
  private env: Env;

  constructor(kv: KvStore, env: Env) {
    this.kv = kv;
    this.env = env;
  }

  async createSession(creatorId: number, groupId: number, gameType: string, totalRounds: number): Promise<GameSession | null> {
    const existing = await this.kv.getSession(groupId);
    if (existing && existing.isActive) return null;
    const gameDef = GAMES[gameType];
    if (!gameDef) return null;
    const now = new Date();
    const timeoutMinutes = getGameTimeoutMinutes(this.env);
    const session: GameSession = {
      gameId: `${groupId}_${gameType}_${now.getTime()}`,
      gameType,
      groupId,
      creatorId,
      state: 'waiting',
      players: [],
      registeredPlayers: [],
      currentRound: 0,
      totalRounds: totalRounds || gameDef.defaultRounds,
      scores: {},
      currentQuestion: null,
      roundData: null,
      startedAt: now.toISOString(),
      lastActivityAt: now.toISOString(),
      timeoutAt: new Date(now.getTime() + timeoutMinutes * 60000).toISOString(),
      isActive: true,
      minPlayers: gameDef.minPlayers,
      maxPlayers: getMaxPlayers(this.env),
      isIndividual: gameDef.isIndividual,
    };
    await this.kv.setSession(session);
    await this.kv.setUserSession(creatorId, groupId);
    return session;
  }

  async getSession(groupId: number): Promise<GameSession | null> {
    return this.kv.getSession(groupId);
  }

  async updateSession(session: GameSession): Promise<void> {
    session.lastActivityAt = new Date().toISOString();
    await this.kv.setSession(session);
  }

  async registerPlayer(groupId: number, userId: number): Promise<{ success: boolean; error?: string }> {
    const session = await this.kv.getSession(groupId);
    if (!session || !session.isActive) return { success: false, error: 'noActiveSession' };
    if (session.state !== 'waiting') return { success: false, error: 'gameAlreadyStarted' };
    if (session.registeredPlayers.includes(userId)) return { success: false, error: 'alreadyRegistered' };
    const userSession = await this.kv.getUserSession(userId);
    if (userSession && userSession !== groupId) return { success: false, error: 'playerInAnotherGame' };
    if (session.registeredPlayers.length >= session.maxPlayers) return { success: false, error: 'gameFull' };
    session.registeredPlayers.push(userId);
    session.scores[userId] = 0;
    await this.kv.setUserSession(userId, groupId);
    await this.updateSession(session);
    return { success: true };
  }

  async startGame(groupId: number, userId: number): Promise<{ success: boolean; error?: string }> {
    const session = await this.kv.getSession(groupId);
    if (!session || !session.isActive) return { success: false, error: 'noActiveSession' };
    if (session.creatorId !== userId) return { success: false, error: 'notCreator' };
    if (session.state !== 'waiting') return { success: false, error: 'gameAlreadyStarted' };
    if (session.registeredPlayers.length < session.minPlayers) return { success: false, error: 'notEnoughPlayers' };
    session.state = 'playing';
    session.currentRound = 1;
    session.players = [...session.registeredPlayers];
    await this.updateSession(session);
    return { success: true };
  }

  async cancelGame(groupId: number, userId: number): Promise<{ success: boolean; error?: string }> {
    const session = await this.kv.getSession(groupId);
    if (!session || !session.isActive) return { success: false, error: 'noActiveSession' };
    if (session.creatorId !== userId) return { success: false, error: 'notCreator' };
    session.isActive = false;
    session.state = 'cancelled';
    await this.updateSession(session);
    for (const pid of session.players) {
      await this.kv.deleteUserSession(pid);
    }
    for (const pid of session.registeredPlayers) {
      if (!session.players.includes(pid)) {
        await this.kv.deleteUserSession(pid);
      }
    }
    return { success: true };
  }

  async endGameByAdmin(groupId: number): Promise<GameSession | null> {
    const session = await this.kv.getSession(groupId);
    if (!session) return null;
    session.isActive = false;
    session.state = 'ended';
    await this.updateSession(session);
    for (const pid of session.players) {
      await this.kv.deleteUserSession(pid);
    }
    for (const pid of session.registeredPlayers) {
      if (!session.players.includes(pid)) {
        await this.kv.deleteUserSession(pid);
      }
    }
    return session;
  }

  async endGame(groupId: number): Promise<GameSession | null> {
    const session = await this.kv.getSession(groupId);
    if (!session) return null;
    session.isActive = false;
    session.state = 'ended';
    await this.updateSession(session);
    for (const pid of session.players) {
      await this.kv.deleteUserSession(pid);
    }
    for (const pid of session.registeredPlayers) {
      if (!session.players.includes(pid)) {
        await this.kv.deleteUserSession(pid);
      }
    }
    return session;
  }

  async advanceRound(groupId: number): Promise<GameSession | null> {
    const session = await this.kv.getSession(groupId);
    if (!session || !session.isActive) return null;
    session.currentRound += 1;
    if (session.currentRound > session.totalRounds) {
      session.state = 'finished';
      await this.updateSession(session);
      return session;
    }
    await this.updateSession(session);
    return session;
  }

  async checkTimeout(groupId: number): Promise<boolean> {
    const session = await this.kv.getSession(groupId);
    if (!session || !session.isActive) return false;
    const now = new Date();
    if (now > new Date(session.timeoutAt)) {
      session.isActive = false;
      session.state = 'timeout';
      await this.updateSession(session);
      for (const pid of session.players) {
        await this.kv.deleteUserSession(pid);
      }
      for (const pid of session.registeredPlayers) {
        if (!session.players.includes(pid)) {
          await this.kv.deleteUserSession(pid);
        }
      }
      return true;
    }
    return false;
  }

  async removePlayer(groupId: number, userId: number): Promise<void> {
    const session = await this.kv.getSession(groupId);
    if (!session) return;
    session.players = session.players.filter(id => id !== userId);
    session.registeredPlayers = session.registeredPlayers.filter(id => id !== userId);
    delete session.scores[userId];
    await this.kv.deleteUserSession(userId);
    await this.updateSession(session);
  }

  async resetSession(groupId: number): Promise<void> {
    await this.kv.deleteSession(groupId);
    const session = await this.kv.getSession(groupId);
    if (session) {
      for (const pid of session.players) {
        await this.kv.deleteUserSession(pid);
      }
      for (const pid of session.registeredPlayers) {
        if (!session.players.includes(pid)) {
          await this.kv.deleteUserSession(pid);
        }
      }
    }
  }
}