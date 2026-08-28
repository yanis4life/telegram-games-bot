import { GameSession, AiResponse, Env } from '../types';
import { AiService } from '../ai/api';
import { SessionManager } from '../session/manager';
import { PointsSystem } from '../points/system';
import { GroupManager } from '../group/manager';
import { LeaderboardManager } from '../leaderboard/manager';
import { KvStore } from '../db/kv';
import { DbStore } from '../db/d1';
import { TelegramApi } from '../telegram';
import { GAMES } from '../config';
import { t } from '../i18n/ar';

export abstract class BaseGame {
  protected ai: AiService;
  protected sessionManager: SessionManager;
  protected pointsSystem: PointsSystem;
  protected groupManager: GroupManager;
  protected leaderboardManager: LeaderboardManager;
  protected kv: KvStore;
  protected db: DbStore;
  protected telegram: TelegramApi;
  protected env: Env;

  constructor(
    ai: AiService, sessionManager: SessionManager, pointsSystem: PointsSystem,
    groupManager: GroupManager, leaderboardManager: LeaderboardManager,
    kv: KvStore, db: DbStore, telegram: TelegramApi, env: Env
  ) {
    this.ai = ai;
    this.sessionManager = sessionManager;
    this.pointsSystem = pointsSystem;
    this.groupManager = groupManager;
    this.leaderboardManager = leaderboardManager;
    this.kv = kv;
    this.db = db;
    this.telegram = telegram;
    this.env = env;
  }

  abstract getGameId(): string;
  abstract generateQuestion(session: GameSession, round: number): Promise<AiResponse>;
  abstract checkAnswer(session: GameSession, userId: number, answer: string): Promise<boolean>;
  abstract renderQuestion(session: GameSession, question: AiResponse): string;
  abstract renderRoundStart(session: GameSession): string;

  async start(session: GameSession): Promise<string> {
    return this.renderRoundStart(session);
  }

  async handleRound(session: GameSession): Promise<{ text: string; question: AiResponse }> {
    const question = await this.generateQuestion(session, session.currentRound);
    session.currentQuestion = question;
    session.roundData = { question, answers: {} };
    await this.sessionManager.updateSession(session);
    return { text: this.renderQuestion(session, question), question };
  }

  async handleAnswer(session: GameSession, userId: number, answer: string): Promise<{ correct: boolean; points: number; xp: number; message: string }> {
    const correct = await this.checkAnswer(session, userId, answer);
    const gameDef = GAMES[this.getGameId()];
    if (correct) {
      session.scores[userId] = (session.scores[userId] || 0) + 1;
      await this.sessionManager.updateSession(session);
      return { correct: true, points: gameDef.pointsWin, xp: gameDef.xpWin, message: t('correctAnswer') };
    }
    return { correct: false, points: 0, xp: gameDef.xpLose, message: t('wrongAnswer', { answer: session.currentQuestion?.correctAnswer || '' }) };
  }

  async finishGame(session: GameSession): Promise<{ winnerId: number; winnerUsername: string; results: string }> {
    let winnerId = session.players[0];
    let maxScore = -1;
    for (const pid of session.players) {
      const score = session.scores[pid] || 0;
      if (score > maxScore) {
        maxScore = score;
        winnerId = pid;
      }
    }
    const winnerUser = await this.kv.getUser(winnerId);
    const winnerUsername = winnerUser?.firstName || `#${winnerId}`;
    const gameDef = GAMES[this.getGameId()];
    await this.pointsSystem.awardWin(winnerId, session.groupId, gameDef.pointsWin, gameDef.xpWin);
    for (const pid of session.players) {
      if (pid !== winnerId) {
        await this.pointsSystem.awardPoints(pid, session.groupId, 0, 0, gameDef.xpLose);
      }
    }
    const duration = Math.round((new Date().getTime() - new Date(session.startedAt).getTime()) / 1000);
    await this.db.recordGame({
      gameType: this.getGameId(),
      groupId: session.groupId,
      creatorId: session.creatorId,
      winnerId,
      players: JSON.stringify(session.players),
      rounds: session.totalRounds,
      duration,
      pointsAwarded: gameDef.pointsWin,
      playedAt: new Date().toISOString(),
    });
    await this.db.updateDailyStats(session.players.length, gameDef.pointsWin);
    await this.leaderboardManager.rebuildGlobalLeaderboard();
    await this.leaderboardManager.rebuildGroupLeaderboard(session.groupId);
    await this.leaderboardManager.rebuildGroupsLeaderboard();
    const scores = session.players.map(pid => {
      const user = session.players.find(p => p === pid);
      return `#${pid}: ${session.scores[pid] || 0} نقطة`;
    }).join('\n');
    const results = `🏁 انتهت اللعبة!\n\n🏆 الفائز: ${winnerUsername}\n\n📊 النتائج:\n${scores}\n\n🎁 الجائزة: ${gameDef.pointsWin} نقطة و ${gameDef.xpWin} XP`;
    return { winnerId, winnerUsername, results };
  }
}