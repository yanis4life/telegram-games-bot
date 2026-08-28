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

export class WhoAmIGame extends BaseGame {
  constructor(
    ai: AiService, sessionManager: SessionManager, pointsSystem: PointsSystem,
    groupManager: GroupManager, leaderboardManager: LeaderboardManager,
    kv: KvStore, db: DbStore, telegram: TelegramApi, env: Env
  ) { super(ai, sessionManager, pointsSystem, groupManager, leaderboardManager, kv, db, telegram, env); }

  getGameId(): string { return 'whoami'; }

  async generateQuestion(session: GameSession, round: number): Promise<AiResponse> {
    const aiResp = await this.ai.generate({
      gameType: 'whoami',
      prompt: `أنت مولد ألغاز شخصيات. قم بتوليد وصف لشخصية عربية أو عالمية مشهورة (علماء، قادة، أدباء، فنانين) بطريقة غامضة. يجب أن يكون الوصف مختلفاً تماماً في كل مرة. أعد النتيجة بصيغة JSON فقط: {"question":"وصف غامض للشخصية","correctAnswer":"اسم الشخصية"}`,
      context: { round },
      difficulty: round > 3 ? 'hard' : 'medium',
      round,
    });
    if (aiResp.success && aiResp.question) return aiResp;
    return this.fallbackQuestion(round);
  }

  private fallbackQuestion(round: number): AiResponse {
    const pool = [
      { d: 'أنا عالم مصري حصلت على جائزة نوبل في الفيزياء عام 1999', a: 'أحمد زويل' },
      { d: 'أنا قائد عربي حررت القدس من الصليبيين', a: 'صلاح الدين الأيوبي' },
      { d: 'أنا كاتب مصري حصلت على جائزة نوبل في الأدب عام 1988', a: 'نجيب محفوظ' },
      { d: 'أنا عالم مسلم كتبت كتاب "الحاوي" في الطب', a: 'الرازي' },
      { d: 'أنا شاعر عربي لقبت بالأمير', a: 'أحمد شوقي' },
    ];
    const idx = round % pool.length;
    return {
      success: true, question: pool[idx].d, options: [], correctAnswer: pool[idx].a,
      storyBranch: [], choices: [], hint: '', explanation: '', metadata: {},
    };
  }

  async checkAnswer(session: GameSession, userId: number, answer: string): Promise<boolean> {
    const q = session.currentQuestion;
    if (!q) return false;
    return answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
  }

  renderQuestion(session: GameSession, q: AiResponse): string {
    return `🕵️ من أنا؟\n\n${q.question}\n\nاكتب اسم الشخصية:`;
  }

  renderRoundStart(session: GameSession): string {
    return '🎯 لعبة من أنا؟\n\nسيتم عرض وصف لشخصية مشهورة وعليك تخمين اسمها.';
  }
}