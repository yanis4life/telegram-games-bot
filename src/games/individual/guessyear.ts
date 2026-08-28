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

export class GuessYearGame extends BaseGame {
  constructor(
    ai: AiService, sessionManager: SessionManager, pointsSystem: PointsSystem,
    groupManager: GroupManager, leaderboardManager: LeaderboardManager,
    kv: KvStore, db: DbStore, telegram: TelegramApi, env: Env
  ) { super(ai, sessionManager, pointsSystem, groupManager, leaderboardManager, kv, db, telegram, env); }

  getGameId(): string { return 'guessyear'; }

  async generateQuestion(session: GameSession, round: number): Promise<AiResponse> {
    const aiResp = await this.ai.generate({
      gameType: 'guessyear',
      prompt: `أنت مولد أحداث تاريخية. قم بتوليد حدث تاريخي عربي أو عالمي مشهور مع سنة حدوثه. يجب أن يكون الحدث مختلفاً في كل مرة. أعد النتيجة بصيغة JSON فقط: {"question":"وصف الحدث التاريخي","correctAnswer":"سنة الحدث (رقم فقط)"}`,
      context: { round },
      difficulty: 'hard',
      round,
    });
    if (aiResp.success && aiResp.question) return aiResp;
    return this.fallbackQuestion(round);
  }

  private fallbackQuestion(round: number): AiResponse {
    const pool = [
      { e: 'سقوط جدار برلين', a: '1989' },
      { e: 'اختراع الهاتف على يد ألكسندر غراهام بيل', a: '1876' },
      { e: 'هبوط الإنسان على سطح القمر', a: '1969' },
      { e: 'بداية الحرب العالمية الأولى', a: '1914' },
      { e: 'تأسيس الأمم المتحدة', a: '1945' },
      { e: 'فتح مكة', a: '630' },
      { e: 'معركة حطين', a: '1187' },
      { e: 'اكتشاف أمريكا', a: '1492' },
      { e: 'الثورة الفرنسية', a: '1789' },
      { e: 'اختراع الطباعة', a: '1440' },
    ];
    const idx = round % pool.length;
    return {
      success: true, question: pool[idx].e, options: [], correctAnswer: pool[idx].a,
      storyBranch: [], choices: [], hint: '', explanation: '', metadata: {},
    };
  }

  async checkAnswer(session: GameSession, userId: number, answer: string): Promise<boolean> {
    const q = session.currentQuestion;
    if (!q) return false;
    const guess = parseInt(answer);
    const correct = parseInt(q.correctAnswer);
    if (isNaN(guess) || isNaN(correct)) return false;
    return Math.abs(guess - correct) <= 5;
  }

  renderQuestion(session: GameSession, q: AiResponse): string {
    return `📅 حدث: ${q.question}\n\nخمن سنة هذا الحدث (في حدود 5 سنوات):`;
  }

  renderRoundStart(session: GameSession): string {
    return '🎯 لعبة خمن السنة!\n\nسيتم عرض حدث تاريخي وعليك تخمين سنة حدوثه.';
  }
}