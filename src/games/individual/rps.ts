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

export class RpsGame extends BaseGame {
  constructor(
    ai: AiService, sessionManager: SessionManager, pointsSystem: PointsSystem,
    groupManager: GroupManager, leaderboardManager: LeaderboardManager,
    kv: KvStore, db: DbStore, telegram: TelegramApi, env: Env
  ) { super(ai, sessionManager, pointsSystem, groupManager, leaderboardManager, kv, db, telegram, env); }

  getGameId(): string { return 'rps'; }

  async generateQuestion(session: GameSession, round: number): Promise<AiResponse> {
    const choices = ['حجر', 'ورقة', 'مقص'];
    const botChoice = choices[Math.floor(Math.random() * 3)];
    return {
      success: true, question: 'اختر: حجر، ورقة، مقص', options: choices, correctAnswer: botChoice,
      storyBranch: [], choices: [], hint: '', explanation: '',
      metadata: { botChoice },
    };
  }

  async checkAnswer(session: GameSession, userId: number, answer: string): Promise<boolean> {
    const q = session.currentQuestion;
    if (!q) return false;
    const choices = ['حجر', 'ورقة', 'مقص'];
    const idx = parseInt(answer) - 1;
    if (idx < 0 || idx >= 3) return false;
    const playerChoice = choices[idx];
    const botChoice = q.metadata?.botChoice || q.correctAnswer;
    if (session.currentQuestion) {
      session.currentQuestion.metadata = { ...session.currentQuestion.metadata, playerChoice, botChoice };
    }
    if (playerChoice === botChoice) return false;
    if (
      (playerChoice === 'حجر' && botChoice === 'مقص') ||
      (playerChoice === 'ورقة' && botChoice === 'حجر') ||
      (playerChoice === 'مقص' && botChoice === 'ورقة')
    ) return true;
    return false;
  }

  renderQuestion(session: GameSession, q: AiResponse): string {
    const botChoice = q.metadata?.botChoice || '';
    if (session.currentRound > 1 && q.metadata?.playerChoice) {
      const pc = q.metadata.playerChoice;
      const bc = q.metadata.botChoice;
      return `✊✋✌️ الجولة ${session.currentRound}\n\n🤖 البوت اختار: ${bc}\nأنت اخترت: ${pc}\n\nاختر مرة أخرى:\n1. حجر\n2. ورقة\n3. مقص`;
    }
    return `✊✋✌️ الجولة ${session.currentRound}\n\nاختر:\n1. حجر\n2. ورقة\n3. مقص`;
  }

  renderRoundStart(session: GameSession): string {
    return '🎯 لعبة حجر ورقة مقص!\n\nالعب ضد البوت في 3 جولات.';
  }
}