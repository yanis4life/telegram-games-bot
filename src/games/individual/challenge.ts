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

export class ChallengeRaceGame extends BaseGame {
  private challenges = [
    { t: 'qna', p: 'ما عاصفة فرنسا؟', c: 'باريس' },
    { t: 'math', p: 'كم ناتج 15 × 3؟', c: '45' },
    { t: 'reverse', p: 'اكتب كلمة "بوت" بالعكس', c: 'توب' },
    { t: 'letter', p: 'اذكر كلمة تبدأ بحرف "ش"', c: 'شمس' },
    { t: 'number', p: 'ما الجذر التربيعي لـ 64؟', c: '8' },
    { t: 'qna', p: 'ما أكبر كوكب في المجموعة الشمسية؟', c: 'المشتري' },
    { t: 'math', p: 'كم ناتج 12 × 12؟', c: '144' },
    { t: 'reverse', p: 'اكتب كلمة "نور" بالعكس', c: 'رون' },
    { t: 'letter', p: 'اذكر كلمة تنتهي بحرف "ة"', c: 'مدرسة' },
    { t: 'number', p: 'ما ناتج 7 × 8؟', c: '56' },
  ];

  constructor(
    ai: AiService, sessionManager: SessionManager, pointsSystem: PointsSystem,
    groupManager: GroupManager, leaderboardManager: LeaderboardManager,
    kv: KvStore, db: DbStore, telegram: TelegramApi, env: Env
  ) { super(ai, sessionManager, pointsSystem, groupManager, leaderboardManager, kv, db, telegram, env); }

  getGameId(): string { return 'challenge'; }

  async generateQuestion(session: GameSession, round: number): Promise<AiResponse> {
    const challenge = this.challenges[round % this.challenges.length];
    return {
      success: true, question: challenge.p, options: [], correctAnswer: challenge.c,
      storyBranch: [], choices: [], hint: '', explanation: '',
      metadata: { challenge, challengeIndex: round },
    };
  }

  async checkAnswer(session: GameSession, userId: number, answer: string): Promise<boolean> {
    const q = session.currentQuestion;
    if (!q) return false;
    return answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
  }

  renderQuestion(session: GameSession, q: AiResponse): string {
    const idx = (q.metadata?.challengeIndex || 0) + 1;
    return `🏆 التحدي ${idx} من 5:\n\n${q.question}\n\nاكتب إجابتك:`;
  }

  renderRoundStart(session: GameSession): string {
    return '🎯 لعبة سباق التحديات!\n\n5 تحديات مختلفة في انتظارك. أكملها جميعاً لتربح!';
  }
}