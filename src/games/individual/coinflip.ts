import { GameSession, AiResponse } from '../../types';
import { BaseGame } from '../base';
import { AiService } from '../../ai/api';
import { SessionManager } from '../../session/manager';
import { PointsSystem } from '../../points/system';
import { GroupManager } from '../../group/manager';
import { LeaderboardManager } from '../../leaderboard/manager';
import { KvStore } from '../../db/kv';
import { DbStore } from '../../db/d1';
import { TelegramApi } from '../../telegram';
import { Env } from '../../types';

export class CoinFlipGame extends BaseGame {
  constructor(
    ai: AiService, sessionManager: SessionManager, pointsSystem: PointsSystem,
    groupManager: GroupManager, leaderboardManager: LeaderboardManager,
    kv: KvStore, db: DbStore, telegram: TelegramApi, env: Env
  ) { super(ai, sessionManager, pointsSystem, groupManager, leaderboardManager, kv, db, telegram, env); }

  getGameId(): string { return 'coinflip'; }

  async generateQuestion(session: GameSession, round: number): Promise<AiResponse> {
    const result = Math.random() < 0.5 ? 'وجه' : 'كتابة';
    return {
      success: true, question: 'اختر وجه العملة', options: ['وجه', 'كتابة'], correctAnswer: result,
      storyBranch: [], choices: [], hint: '', explanation: '',
      metadata: { result },
    };
  }

  async checkAnswer(session: GameSession, userId: number, answer: string): Promise<boolean> {
    const q = session.currentQuestion;
    if (!q) return false;
    const choice = answer === '1' ? 'وجه' : 'كتابة';
    return choice === q.correctAnswer;
  }

  renderQuestion(session: GameSession, q: AiResponse): string {
    return '🪙 اختر:\n1. وجه\n2. كتابة';
  }

  renderRoundStart(session: GameSession): string {
    return '🎯 لعبة قلب عملة!\n\nاختر وجه العملة واربح إذا كان اختيارك صحيحاً!';
  }
}