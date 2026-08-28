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
import { t } from '../../i18n/ar';

export class QnaGame extends BaseGame {
  constructor(
    ai: AiService, sessionManager: SessionManager, pointsSystem: PointsSystem,
    groupManager: GroupManager, leaderboardManager: LeaderboardManager,
    kv: KvStore, db: DbStore, telegram: TelegramApi, env: Env
  ) { super(ai, sessionManager, pointsSystem, groupManager, leaderboardManager, kv, db, telegram, env); }

  getGameId(): string { return 'qna'; }

  async generateQuestion(session: GameSession, round: number): Promise<AiResponse> {
    const aiResp = await this.ai.generate({
      gameType: 'qna',
      prompt: `أنت مولد أسئلة ثقافية عربية. قم بتوليد سؤال ثقافي عربي فريد مع 4 خيارات وإجابة صحيحة واحدة. يجب أن يكون السؤال مختلفاً تماماً عن أي سؤال سابق. أعد النتيجة بصيغة JSON فقط: {"question":"السؤال","options":["خيار1","خيار2","خيار3","خيار4"],"correctAnswer":"الإجابة الصحيحة"}`,
      context: { round, previousQuestions: session.roundData?.previousQuestions || [] },
      difficulty: round > 3 ? 'hard' : round > 1 ? 'medium' : 'easy',
      round,
    });
    if (aiResp.success && aiResp.question) return aiResp;
    return this.fallbackQuestion(round);
  }

  private fallbackQuestion(round: number): AiResponse {
    const pool = [
      { q: 'ما عاصمة مصر؟', o: ['القاهرة', 'الجيزة', 'الإسكندرية', 'أسوان'], c: 'القاهرة' },
      { q: 'كم عدد ألوان قوس قزح؟', o: ['5', '6', '7', '8'], c: '7' },
      { q: 'من أول إنسان صعد إلى الفضاء؟', o: ['نيل أرمسترونغ', 'يوري غاغارين', 'محمد فارس', 'توماس بيسون'], c: 'يوري غاغارين' },
      { q: 'ما أكبر محيط في العالم؟', o: ['الأطلسي', 'الهندي', 'الهادئ', 'المتجمد الشمالي'], c: 'الهادئ' },
      { q: 'كم عدد سور القرآن الكريم؟', o: ['110', '114', '120', '100'], c: '114' },
    ];
    const idx = round % pool.length;
    return {
      success: true, question: pool[idx].q, options: pool[idx].o, correctAnswer: pool[idx].c,
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
    return `❓ ${q.question}\n\n${options}\n\nأرسل رقم الإجابة (1-4):`;
  }

  renderRoundStart(session: GameSession): string {
    return '🎯 لعبة سؤال وجواب!\n\nسيتم عرض أسئلة ثقافية متعددة الخيارات. اختر الإجابة الصحيحة!';
  }
}