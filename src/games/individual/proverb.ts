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

export class ProverbGame extends BaseGame {
  constructor(
    ai: AiService, sessionManager: SessionManager, pointsSystem: PointsSystem,
    groupManager: GroupManager, leaderboardManager: LeaderboardManager,
    kv: KvStore, db: DbStore, telegram: TelegramApi, env: Env
  ) { super(ai, sessionManager, pointsSystem, groupManager, leaderboardManager, kv, db, telegram, env); }

  getGameId(): string { return 'proverb'; }

  async generateQuestion(session: GameSession, round: number): Promise<AiResponse> {
    const aiResp = await this.ai.generate({
      gameType: 'proverb',
      prompt: `أنت مولد أمثال شعبية عربية. قم بتوليد مثل شعبي عربي مشهور مع إعطاء النصف الأول فقط. يجب أن يكون المثل مختلفاً في كل مرة. أعد النتيجة بصيغة JSON فقط: {"question":"النصف الأول من المثل","correctAnswer":"النصف الثاني من المثل"}`,
      context: { round },
      difficulty: 'medium',
      round,
    });
    if (aiResp.success && aiResp.question) return aiResp;
    return this.fallbackQuestion(round);
  }

  private fallbackQuestion(round: number): AiResponse {
    const pool = [
      { f: 'إذا كان الكلام من فضة', a: 'فالسكوت من ذهب' },
      { f: 'في التأني السلامة', a: 'وفي العجلة الندامة' },
      { f: 'من شب على شيء', a: 'شاب عليه' },
      { f: 'الصديق وقت الضيق', a: 'الحاجة أم الاختراع' },
      { f: 'عندما يخلو السوق', a: 'يقل الكلام' },
    ];
    const idx = round % pool.length;
    return {
      success: true, question: pool[idx].f, options: [], correctAnswer: pool[idx].a,
      storyBranch: [], choices: [], hint: '', explanation: '', metadata: {},
    };
  }

  async checkAnswer(session: GameSession, userId: number, answer: string): Promise<boolean> {
    const q = session.currentQuestion;
    if (!q) return false;
    return answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
  }

  renderQuestion(session: GameSession, q: AiResponse): string {
    return `📜 أكمل المثل:\n\n"${q.question}"\n\nاكتب إكمال المثل:`;
  }

  renderRoundStart(session: GameSession): string {
    return '🎯 لعبة أكمل المثل!\n\nسيتم عرض نصف مثل شعبي وعليك إكماله.';
  }
}