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

export class MissingWordGame extends BaseGame {
  private sentences = [
    { s: 'ذهب الولد إلى ... ليتعلم', a: 'المدرسة' },
    { s: 'السماء ... اليوم', a: 'صافية' },
    { s: 'أكلت ... لذيذة', a: 'تفاحة' },
    { s: 'ركب الرجل ... إلى العمل', a: 'السيارة' },
    { s: 'الكتاب على ...', a: 'الطاولة' },
    { s: 'الشمس تشرق من ...', a: 'الشرق' },
    { s: 'الفلاح يحرث ...', a: 'الأرض' },
    { s: 'الطبيب يعالج ...', a: 'المرضى' },
    { s: 'الماء ... للحياة', a: 'ضروري' },
    { s: 'العلم ... في الحياة', a: 'نور' },
  ];

  constructor(
    ai: AiService, sessionManager: SessionManager, pointsSystem: PointsSystem,
    groupManager: GroupManager, leaderboardManager: LeaderboardManager,
    kv: KvStore, db: DbStore, telegram: TelegramApi, env: Env
  ) { super(ai, sessionManager, pointsSystem, groupManager, leaderboardManager, kv, db, telegram, env); }

  getGameId(): string { return 'missingword'; }

  async generateQuestion(session: GameSession, round: number): Promise<AiResponse> {
    const s = this.sentences[round % this.sentences.length];
    const display = s.s.replace('...', '_____');
    return {
      success: true, question: display, options: [], correctAnswer: s.a,
      storyBranch: [], choices: [], hint: '', explanation: '',
      metadata: { original: s.s, answer: s.a },
    };
  }

  async checkAnswer(session: GameSession, userId: number, answer: string): Promise<boolean> {
    const q = session.currentQuestion;
    if (!q) return false;
    return answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
  }

  renderQuestion(session: GameSession, q: AiResponse): string {
    return `📝 ${q.question}\n\nاملأ الكلمة الناقصة:`;
  }

  renderRoundStart(session: GameSession): string {
    return '🎯 لعبة الكلمة الناقصة!\n\nسيتم عرض جملة تحتوي على كلمة ناقصة وعليك إكمالها.';
  }
}