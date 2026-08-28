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

export class RiddleGame extends BaseGame {
  constructor(
    ai: AiService, sessionManager: SessionManager, pointsSystem: PointsSystem,
    groupManager: GroupManager, leaderboardManager: LeaderboardManager,
    kv: KvStore, db: DbStore, telegram: TelegramApi, env: Env
  ) { super(ai, sessionManager, pointsSystem, groupManager, leaderboardManager, kv, db, telegram, env); }

  getGameId(): string { return 'riddle'; }

  async generateQuestion(session: GameSession, round: number): Promise<AiResponse> {
    const aiResp = await this.ai.generate({
      gameType: 'riddle',
      prompt: `أنت مولد ألغاز عربية. قم بتوليد لغز عربي صعب مع إجابته. يجب أن يكون اللغز جديداً ومبتكراً في كل مرة. أعد النتيجة بصيغة JSON فقط: {"question":"اللغز","correctAnswer":"الإجابة"}`,
      context: { round },
      difficulty: 'hard',
      round,
    });
    if (aiResp.success && aiResp.question) return aiResp;
    return this.fallbackQuestion(round);
  }

  private fallbackQuestion(round: number): AiResponse {
    const pool = [
      { r: 'ما الشيء الذي يكسو الناس وهو عارٍ؟', a: 'الإبرة' },
      { r: 'ما الشيء الذي له أسنان ولا يعض؟', a: 'المشط' },
      { r: 'ما الشيء الذي كلما أخذت منه يكبر؟', a: 'الحفرة' },
      { r: 'ما الشيء الذي يكتب ولا يقرأ؟', a: 'القلم' },
      { r: 'ما الشيء الذي تراه في الليل ثلاث مرات وفي النهار مرة؟', a: 'حرف اللام' },
      { r: 'ما الشيء الذي يمشي بلا أرجل ويبكي بلا عيون؟', a: 'الغيوم' },
      { r: 'ما الشيء الذي له عين واحدة ولا يرى؟', a: 'الإبرة' },
      { r: 'ما الشيء الذي يكون في الدقيقة مرتين وفي القرن مرة؟', a: 'حرف القاف' },
    ];
    const idx = round % pool.length;
    return {
      success: true, question: pool[idx].r, options: [], correctAnswer: pool[idx].a,
      storyBranch: [], choices: [], hint: '', explanation: '', metadata: {},
    };
  }

  async checkAnswer(session: GameSession, userId: number, answer: string): Promise<boolean> {
    const q = session.currentQuestion;
    if (!q) return false;
    return answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
  }

  renderQuestion(session: GameSession, q: AiResponse): string {
    return `🧩 اللغز:\n${q.question}\n\nاكتب إجابتك:`;
  }

  renderRoundStart(session: GameSession): string {
    return '🎯 لعبة حل اللغز!\n\nألغاز معقدة تتطلب التفكير. هل تستطيع حلها؟';
  }
}