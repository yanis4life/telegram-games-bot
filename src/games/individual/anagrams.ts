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

export class AnagramsGame extends BaseGame {
  private words = ['كتاب', 'مدرسة', 'جامعة', 'حديقة', 'مطبخ', 'نافذة', 'ساعة', 'قلم', 'وردة', 'شمس', 'باب', 'سيارة', 'طائرة', 'جبل', 'نهر', 'غابة', 'محطة', 'مكتب', 'كرسي', 'هاتف'];

  constructor(
    ai: AiService, sessionManager: SessionManager, pointsSystem: PointsSystem,
    groupManager: GroupManager, leaderboardManager: LeaderboardManager,
    kv: KvStore, db: DbStore, telegram: TelegramApi, env: Env
  ) { super(ai, sessionManager, pointsSystem, groupManager, leaderboardManager, kv, db, telegram, env); }

  getGameId(): string { return 'anagrams'; }

  private scramble(word: string): string {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    if (arr.join('') === word) {
      [arr[0], arr[arr.length - 1]] = [arr[arr.length - 1], arr[0]];
    }
    return arr.join('');
  }

  async generateQuestion(session: GameSession, round: number): Promise<AiResponse> {
    const word = this.words[round % this.words.length];
    const scrambled = this.scramble(word);
    return {
      success: true, question: scrambled, options: [], correctAnswer: word,
      storyBranch: [], choices: [], hint: '', explanation: '',
      metadata: { original: word },
    };
  }

  async checkAnswer(session: GameSession, userId: number, answer: string): Promise<boolean> {
    const q = session.currentQuestion;
    if (!q) return false;
    return answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
  }

  renderQuestion(session: GameSession, q: AiResponse): string {
    return `🔀 الحروف المشوشة: ${q.question}\n\nرتبها لتكوين كلمة صحيحة:`;
  }

  renderRoundStart(session: GameSession): string {
    return '🎯 لعبة الحروف!\n\nسيتم عرض حروف مشوشرة وعليك ترتيبها لتكوين كلمة صحيحة.';
  }
}