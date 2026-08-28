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

export class WordRaceGame extends BaseGame {
  private letters = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'];
  private topics = ['حيوانات', 'نباتات', 'مدن', 'مهن', 'ألوان', 'أطعمة', 'مشروبات', 'رياضات', 'أدوات', 'مشاعر'];

  constructor(
    ai: AiService, sessionManager: SessionManager, pointsSystem: PointsSystem,
    groupManager: GroupManager, leaderboardManager: LeaderboardManager,
    kv: KvStore, db: DbStore, telegram: TelegramApi, env: Env
  ) { super(ai, sessionManager, pointsSystem, groupManager, leaderboardManager, kv, db, telegram, env); }

  getGameId(): string { return 'wordrace'; }

  async generateQuestion(session: GameSession, round: number): Promise<AiResponse> {
    const letter = this.letters[round % this.letters.length];
    const topic = this.topics[round % this.topics.length];
    return {
      success: true, question: letter, options: [], correctAnswer: '',
      storyBranch: [], choices: [], hint: '', explanation: '',
      metadata: { letter, topic },
    };
  }

  async checkAnswer(session: GameSession, userId: number, answer: string): Promise<boolean> {
    const q = session.currentQuestion;
    if (!q) return false;
    const letter = q.metadata?.letter || '';
    return answer.trim().startsWith(letter) && answer.trim().length >= 2;
  }

  renderQuestion(session: GameSession, q: AiResponse): string {
    return `🔤 اكتب كلمة تبدأ بحرف: ${q.metadata?.letter || 'أ'}\n\nالموضوع: ${q.metadata?.topic || 'عام'}`;
  }

  renderRoundStart(session: GameSession): string {
    return '🎯 لعبة سباق الكلمات!\n\nسيتم عرض حرف وعليك كتابة كلمة تبدأ به ضمن الوقت المحدد.';
  }
}