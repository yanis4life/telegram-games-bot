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

export class LongestWordGame extends BaseGame {
  private topics = ['الحيوانات', 'النباتات', 'المدن العربية', 'المهن', 'الألوان', 'الأطعمة', 'المشروبات', 'الرياضات', 'الأدوات', 'المشاعر', 'العلوم', 'الفنون'];

  constructor(
    ai: AiService, sessionManager: SessionManager, pointsSystem: PointsSystem,
    groupManager: GroupManager, leaderboardManager: LeaderboardManager,
    kv: KvStore, db: DbStore, telegram: TelegramApi, env: Env
  ) { super(ai, sessionManager, pointsSystem, groupManager, leaderboardManager, kv, db, telegram, env); }

  getGameId(): string { return 'longestword'; }

  async generateQuestion(session: GameSession, round: number): Promise<AiResponse> {
    return {
      success: true, question: this.topics[round % this.topics.length], options: [], correctAnswer: '',
      storyBranch: [], choices: [], hint: '', explanation: '',
      metadata: {},
    };
  }

  async checkAnswer(session: GameSession, userId: number, answer: string): Promise<boolean> {
    const q = session.currentQuestion;
    if (!q) return false;
    const word = answer.trim();
    if (word.length < 3) return false;
    const prev = session.roundData?.answers?.[userId];
    if (prev) return word.length > prev.length;
    return true;
  }

  renderQuestion(session: GameSession, q: AiResponse): string {
    return `📏 الموضوع: ${q.question}\n\nاكتب أطول كلمة ممكنة متعلقة بالموضوع:`;
  }

  renderRoundStart(session: GameSession): string {
    return '🎯 لعبة أطول كلمة!\n\nسيتم عرض موضوع وعليك كتابة أطول كلمة ممكنة متعلقة به.';
  }
}