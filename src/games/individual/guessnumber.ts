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

export class GuessNumberGame extends BaseGame {
  constructor(
    ai: AiService, sessionManager: SessionManager, pointsSystem: PointsSystem,
    groupManager: GroupManager, leaderboardManager: LeaderboardManager,
    kv: KvStore, db: DbStore, telegram: TelegramApi, env: Env
  ) { super(ai, sessionManager, pointsSystem, groupManager, leaderboardManager, kv, db, telegram, env); }

  getGameId(): string { return 'guessnumber'; }

  async generateQuestion(session: GameSession, round: number): Promise<AiResponse> {
    const target = Math.floor(Math.random() * 100) + 1;
    return {
      success: true, question: 'خمن الرقم بين 1 و 100', options: [], correctAnswer: String(target),
      storyBranch: [], choices: [], hint: 'الرقم بين 1 و 100', explanation: '',
      metadata: { target, attempts: 0, hints: [] as string[] },
    };
  }

  async checkAnswer(session: GameSession, userId: number, answer: string): Promise<boolean> {
    const q = session.currentQuestion;
    if (!q) return false;
    const guess = parseInt(answer);
    const target = parseInt(q.correctAnswer);
    if (isNaN(guess)) return false;
    const attempts = (q.metadata?.attempts || 0) + 1;
    q.metadata = { ...q.metadata, attempts };
    if (guess === target) return true;
    const hint = guess < target ? 'الرقم أكبر 📈' : 'الرقم أصغر 📉';
    q.hint = hint;
    q.metadata.hints = [...(q.metadata.hints || []), hint];
    return false;
  }

  renderQuestion(session: GameSession, q: AiResponse): string {
    const hints = (q.metadata?.hints || []) as string[];
    const hintText = hints.length > 0 ? `\n\nتلميحات:\n${hints.join('\n')}` : '';
    return `🔢 خمن الرقم بين 1 و 100${hintText}\n\nاكتب رقماً:`;
  }

  renderRoundStart(session: GameSession): string {
    return '🎯 لعبة خمن الرقم!\n\nتم اختيار رقم عشوائي بين 1 و 100. حاول تخمينه!';
  }
}