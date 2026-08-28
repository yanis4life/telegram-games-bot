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

export class EscapeRoomGame extends BaseGame {
  private rooms = [
    { t: ['مفتاح صدئ', 'مصباح يدوي', 'حبل', 'عصا خشبية'], c: 0, u: 'فتح الباب بالمفتاح' },
    { t: ['مفك براغي', 'بطاقة ممغنطة', 'شريط لاصق', 'مقص'], c: 1, u: 'فتح الباب بالبطاقة' },
    { t: ['فأس', 'قفازات', 'نظارات', 'منشار'], c: 0, u: 'كسر الباب بالفأس' },
    { t: ['سلم', 'حبل', 'مفتاح', 'مصباح'], c: 2, u: 'فتح الباب بالمفتاح' },
    { t: ['شمعة', 'قداحة', 'ورقة', 'قلم'], c: 1, u: 'إضاءة الشمعة للرؤية' },
  ];

  constructor(
    ai: AiService, sessionManager: SessionManager, pointsSystem: PointsSystem,
    groupManager: GroupManager, leaderboardManager: LeaderboardManager,
    kv: KvStore, db: DbStore, telegram: TelegramApi, env: Env
  ) { super(ai, sessionManager, pointsSystem, groupManager, leaderboardManager, kv, db, telegram, env); }

  getGameId(): string { return 'escape'; }

  async generateQuestion(session: GameSession, round: number): Promise<AiResponse> {
    const room = this.rooms[round % this.rooms.length];
    const aiResp = await this.ai.generate({
      gameType: 'escape',
      prompt: `أنت مولد ألغاز غرفة الهروب. قم بتوليد سيناريو لغرفة مغلقة مع 4 أدوات مختلفة وأداة واحدة صحيحة للهروب. يجب أن يكون السيناريو مختلفاً في كل مرة. أعد النتيجة بصيغة JSON فقط: {"question":"وصف الغرفة المغلقة","choices":["أداة1","أداة2","أداة3","أداة4"],"correctAnswer":"وصف طريقة الهروب"}`,
      context: { round, roomIndex: round },
      difficulty: 'medium',
      round,
    });
    if (aiResp.success && aiResp.question && aiResp.choices && aiResp.choices.length >= 4) {
      return aiResp;
    }
    return this.fallbackQuestion(round);
  }

  private fallbackQuestion(round: number): AiResponse {
    const room = this.rooms[round % this.rooms.length];
    return {
      success: true, question: 'أنت في غرفة مغلقة. اختر الأداة المناسبة للهروب!', options: room.t, correctAnswer: room.u,
      storyBranch: [], choices: room.t, hint: '', explanation: '',
      metadata: { room, correctIndex: room.c },
    };
  }

  async checkAnswer(session: GameSession, userId: number, answer: string): Promise<boolean> {
    const q = session.currentQuestion;
    if (!q) return false;
    const idx = parseInt(answer) - 1;
    return idx === q.metadata?.correctIndex;
  }

  renderQuestion(session: GameSession, q: AiResponse): string {
    const tools = q.choices.map((tool, i) => `${i + 1}. ${tool}`).join('\n');
    return `🚪 أنت في غرفة مغلقة!\n\nالأدوات المتاحة:\n${tools}\n\nاختر أداة لاستخدامها (أرسل الرقم):`;
  }

  renderRoundStart(session: GameSession): string {
    return '🎯 لعبة اهرب من الغرفة!\n\nأنت في غرفة مغلقة. اختر الأدوات الصحيحة للهروب!';
  }
}