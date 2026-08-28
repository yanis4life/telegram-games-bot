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

export class TaGame extends BaseGame {
  private words = [
    { w: 'مدرسة', m: true },
    { w: 'بيت', m: false },
    { w: 'جامعة', m: true },
    { w: 'كرتون', m: false },
    { w: 'شجرة', m: true },
    { w: 'نبات', m: false },
    { w: 'غرفة', m: true },
    { w: 'سكر', m: false },
    { w: 'سيارة', m: true },
    { w: 'باب', m: false },
    { w: 'معلمة', m: true },
    { w: 'قلم', m: false },
    { w: 'حديقة', m: true },
    { w: 'مفتاح', m: false },
    { w: 'طاولة', m: true },
  ];

  constructor(
    ai: AiService, sessionManager: SessionManager, pointsSystem: PointsSystem,
    groupManager: GroupManager, leaderboardManager: LeaderboardManager,
    kv: KvStore, db: DbStore, telegram: TelegramApi, env: Env
  ) { super(ai, sessionManager, pointsSystem, groupManager, leaderboardManager, kv, db, telegram, env); }

  getGameId(): string { return 'ta'; }

  async generateQuestion(session: GameSession, round: number): Promise<AiResponse> {
    const w = this.words[round % this.words.length];
    return {
      success: true, question: w.w, options: [], correctAnswer: w.m ? '0' : '1',
      storyBranch: [], choices: [], hint: '', explanation: '',
      metadata: { word: w.w, isMarbuta: w.m },
    };
  }

  async checkAnswer(session: GameSession, userId: number, answer: string): Promise<boolean> {
    const q = session.currentQuestion;
    if (!q) return false;
    const correct = q.correctAnswer === '0' ? '1' : '2';
    return answer.trim() === correct;
  }

  renderQuestion(session: GameSession, q: AiResponse): string {
    return `🔤 كلمة: ${q.question}\n\nهل التاء في الكلمة:\n1. تاء مربوطة (ة)\n2. تاء مفتوحة (ت)\n\nأرسل رقم الإجابة:`;
  }

  renderRoundStart(session: GameSession): string {
    return '🎯 لعبة تاء مربوطة أم تاء مفتوحة!\n\nسيتم عرض كلمة وعليك تحديد نوع التاء فيها.';
  }
}