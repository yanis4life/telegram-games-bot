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

export class OppositeGame extends BaseGame {
  constructor(
    ai: AiService, sessionManager: SessionManager, pointsSystem: PointsSystem,
    groupManager: GroupManager, leaderboardManager: LeaderboardManager,
    kv: KvStore, db: DbStore, telegram: TelegramApi, env: Env
  ) { super(ai, sessionManager, pointsSystem, groupManager, leaderboardManager, kv, db, telegram, env); }

  getGameId(): string { return 'opposite'; }

  async generateQuestion(session: GameSession, round: number): Promise<AiResponse> {
    const aiResp = await this.ai.generate({
      gameType: 'opposite',
      prompt: `أنت مولد كلمات عربية. قم بتوليد كلمة عربية فريدة مع عكسها (ضدها). يجب أن تكون الكلمة والعكس مختلفين في كل مرة. أعد النتيجة بصيغة JSON فقط: {"question":"كلمة عربية","correctAnswer":"عكس الكلمة"}`,
      context: { round },
      difficulty: 'easy',
      round,
    });
    if (aiResp.success && aiResp.question) return aiResp;
    return this.fallbackQuestion(round);
  }

  private fallbackQuestion(round: number): AiResponse {
    const pool = [
      { w: 'كبير', a: 'صغير' },
      { w: 'طويل', a: 'قصير' },
      { w: 'سريع', a: 'بطيء' },
      { w: 'قوي', a: 'ضعيف' },
      { w: 'ثري', a: 'فقير' },
      { w: 'نظيف', a: 'قذر' },
      { w: 'جديد', a: 'قديم' },
      { w: 'ساخن', a: 'بارد' },
      { w: 'خفيف', a: 'ثقيل' },
      { w: 'واسع', a: 'ضيق' },
    ];
    const idx = round % pool.length;
    return {
      success: true, question: pool[idx].w, options: [], correctAnswer: pool[idx].a,
      storyBranch: [], choices: [], hint: '', explanation: '', metadata: {},
    };
  }

  async checkAnswer(session: GameSession, userId: number, answer: string): Promise<boolean> {
    const q = session.currentQuestion;
    if (!q) return false;
    return answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
  }

  renderQuestion(session: GameSession, q: AiResponse): string {
    return `🔤 كلمة: ${q.question}\n\nاكتب عكس الكلمة:`;
  }

  renderRoundStart(session: GameSession): string {
    return '🎯 لعبة عكس الكلمة!\n\nسيتم عرض كلمة وعليك كتابة عكسها.';
  }
}