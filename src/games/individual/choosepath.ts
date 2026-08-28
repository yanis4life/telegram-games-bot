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

export class ChoosePathGame extends BaseGame {
  private stories = [
    { n: 'أنت في غابة مظلمة. أمامك طريقان:', c: ['الطريق الأيسر', 'الطريق الأيمن'], o: ['تجد كنزاً دفيناً', 'تقابل وحشاً ضخماً'], cr: 0 },
    { n: 'أنت في قلعة قديمة. ترى بابين:', c: ['الباب الذهبي', 'الباب الفضي'], o: ['غرفة العرش الملكي', 'زنزانة مظلمة'], cr: 0 },
    { n: 'أنت على شاطئ بحر. ترى قارباً:', c: ['اركب القارب', 'ابق على الشاطئ'], o: ['جزيرة جميلة', 'غروب رائع'], cr: 0 },
    { n: 'أنت في كهف مظلم. تسمع صوت ماء:', c: ['اتبع الصوت', 'أشعل عود ثقاب'], o: ['شلال جميل', 'كنز قديم'], cr: 0 },
    { n: 'أنت في مدينة قديمة. ترى سوقاً:', c: ['ادخل السوق', 'اصعد إلى القلعة'], o: ['تاجر عجوز يعطيك خريطة', 'منظر رائع للمدينة'], cr: 0 },
    { n: 'أنت في صحراء قاحلة. ترى شيئاً يلمع:', c: ['اذهب نحو اللمعان', 'تابع السير'], o: ['واحة خضراء', 'سراب'], cr: 0 },
  ];

  constructor(
    ai: AiService, sessionManager: SessionManager, pointsSystem: PointsSystem,
    groupManager: GroupManager, leaderboardManager: LeaderboardManager,
    kv: KvStore, db: DbStore, telegram: TelegramApi, env: Env
  ) { super(ai, sessionManager, pointsSystem, groupManager, leaderboardManager, kv, db, telegram, env); }

  getGameId(): string { return 'choosepath'; }

  async generateQuestion(session: GameSession, round: number): Promise<AiResponse> {
    const story = this.stories[round % this.stories.length];
    const aiResp = await this.ai.generate({
      gameType: 'choosepath',
      prompt: `أنت مولد قصص تفاعلية عربية. قم بتوليد قصة قصيرة متفرعة مع خيارين. يجب أن تكون القصة جديدة ومبتكرة في كل مرة. أعد النتيجة بصيغة JSON فقط: {"question":"القصة أو السيناريو","choices":["الخيار الأول","الخيار الثاني"],"correctAnswer":"النتيجة المتوقعة للخيار الصحيح"}`,
      context: { round, storyIndex: round },
      difficulty: 'medium',
      round,
    });
    if (aiResp.success && aiResp.question && aiResp.choices && aiResp.choices.length >= 2) {
      return aiResp;
    }
    return this.fallbackQuestion(round);
  }

  private fallbackQuestion(round: number): AiResponse {
    const story = this.stories[round % this.stories.length];
    return {
      success: true, question: story.n, options: story.c, correctAnswer: story.o[story.cr],
      storyBranch: story.o, choices: story.c, hint: '', explanation: '',
      metadata: { story, correctIndex: story.cr },
    };
  }

  async checkAnswer(session: GameSession, userId: number, answer: string): Promise<boolean> {
    const q = session.currentQuestion;
    if (!q) return false;
    const idx = parseInt(answer) - 1;
    return idx === q.metadata?.correctIndex;
  }

  renderQuestion(session: GameSession, q: AiResponse): string {
    const choices = q.choices.map((c, i) => `${i + 1}. ${c}`).join('\n');
    return `📖 ${q.question}\n\nخياراتك:\n${choices}\n\nأرسل رقم اختيارك:`;
  }

  renderRoundStart(session: GameSession): string {
    return '🎯 لعبة اختر طريقك!\n\nقصة تفاعلية متفرعة. اختر مسارك بحكمة!';
  }
}