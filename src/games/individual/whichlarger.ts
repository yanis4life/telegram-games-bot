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

export class WhichLargerGame extends BaseGame {
  constructor(
    ai: AiService, sessionManager: SessionManager, pointsSystem: PointsSystem,
    groupManager: GroupManager, leaderboardManager: LeaderboardManager,
    kv: KvStore, db: DbStore, telegram: TelegramApi, env: Env
  ) { super(ai, sessionManager, pointsSystem, groupManager, leaderboardManager, kv, db, telegram, env); }

  getGameId(): string { return 'whichlarger'; }

  async generateQuestion(session: GameSession, round: number): Promise<AiResponse> {
    const num1 = Math.floor(Math.random() * 1000);
    const num2 = Math.floor(Math.random() * 1000);
    const correct = num1 >= num2 ? '1' : '2';
    return {
      success: true, question: 'أيهما أكبر؟', options: [String(num1), String(num2)], correctAnswer: correct,
      storyBranch: [], choices: [], hint: '', explanation: '',
      metadata: { num1, num2 },
    };
  }

  async checkAnswer(session: GameSession, userId: number, answer: string): Promise<boolean> {
    const q = session.currentQuestion;
    if (!q) return false;
    return answer.trim() === q.correctAnswer;
  }

  renderQuestion(session: GameSession, q: AiResponse): string {
    const [num1, num2] = q.options;
    return `🔢 أي رقم أكبر؟\n\n1. ${num1}\n2. ${num2}\n\nأرسل رقم الإجابة:`;
  }

  renderRoundStart(session: GameSession): string {
    return '🎯 لعبة أيهما أكبر!\n\nسيتم عرض رقمين وعليك اختيار الأكبر.';
  }
}