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

export class SynonymsGame extends BaseGame {
  constructor(
    ai: AiService, sessionManager: SessionManager, pointsSystem: PointsSystem,
    groupManager: GroupManager, leaderboardManager: LeaderboardManager,
    kv: KvStore, db: DbStore, telegram: TelegramApi, env: Env
  ) { super(ai, sessionManager, pointsSystem, groupManager, leaderboardManager, kv, db, telegram, env); }

  getGameId(): string { return 'synonyms'; }

  async generateQuestion(session: GameSession, round: number): Promise<AiResponse> {
    const aiResp = await this.ai.generate({
      gameType: 'synonyms',
      prompt: `أنت مولد كلمات عربية مع مرادفات. قم بتوليد كلمة عربية و 3 خيارات للمرادف الصحيح (خيار واحد صحيح واثنان خطأ). يجب أن تكون الكلمة والخيارات مختلفة في كل مرة. أعد النتيجة بصيغة JSON فقط: {"question":"الكلمة","options":["مرادف صحيح","خيار خطأ1","خيار خطأ2"],"correctAnswer":"المرادف الصحيح"}`,
      context: { round },
      difficulty: 'medium',
      round,
    });
    if (aiResp.success && aiResp.question) return aiResp;
    return this.fallbackQuestion(round);
  }

  private fallbackQuestion(round: number): AiResponse {
    const pool = [
      { w: 'جميل', o: ['قبيح', 'وسيم', 'طويل'], c: 'وسيم' },
      { w: 'شجاع', o: ['جبان', 'خائف', 'مقدام'], c: 'مقدام' },
      { w: 'كريم', o: ['بخيل', 'جواد', 'لئيم'], c: 'جواد' },
      { w: 'ذكي', o: ['غبي', 'أحمق', 'عبقري'], c: 'عبقري' },
      { w: 'قوي', o: ['ضعيف', 'متين', 'واهن'], c: 'متين' },
    ];
    const idx = round % pool.length;
    return {
      success: true, question: pool[idx].w, options: pool[idx].o, correctAnswer: pool[idx].c,
      storyBranch: [], choices: [], hint: '', explanation: '', metadata: {},
    };
  }

  async checkAnswer(session: GameSession, userId: number, answer: string): Promise<boolean> {
    const q = session.currentQuestion;
    if (!q) return false;
    const idx = parseInt(answer) - 1;
    return idx >= 0 && idx < q.options.length && q.options[idx] === q.correctAnswer;
  }

  renderQuestion(session: GameSession, q: AiResponse): string {
    const options = q.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n');
    return `🔤 كلمة: ${q.question}\n\nاختر المرادف الصحيح:\n${options}\n\nأرسل رقم الإجابة (1-3):`;
  }

  renderRoundStart(session: GameSession): string {
    return '🎯 لعبة المرادفات!\n\nسيتم عرض كلمة وعليك اختيار مرادفها الصحيح.';
  }
}