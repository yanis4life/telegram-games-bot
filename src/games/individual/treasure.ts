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

export class TreasureHuntGame extends BaseGame {
  constructor(
    ai: AiService, sessionManager: SessionManager, pointsSystem: PointsSystem,
    groupManager: GroupManager, leaderboardManager: LeaderboardManager,
    kv: KvStore, db: DbStore, telegram: TelegramApi, env: Env
  ) { super(ai, sessionManager, pointsSystem, groupManager, leaderboardManager, kv, db, telegram, env); }

  getGameId(): string { return 'treasure'; }

  async generateQuestion(session: GameSession, round: number): Promise<AiResponse> {
    const targetX = Math.floor(Math.random() * 10);
    const targetY = Math.floor(Math.random() * 10);
    const startX = Math.floor(Math.random() * 10);
    const startY = Math.floor(Math.random() * 10);
    return {
      success: true, question: 'ابحث عن الكنز!', options: ['شمال', 'جنوب', 'شرق', 'غرب'], correctAnswer: '',
      storyBranch: [], choices: ['شمال', 'جنوب', 'شرق', 'غرب'], hint: '', explanation: '',
      metadata: { targetX, targetY, currentX: startX, currentY: startY, found: false },
    };
  }

  async checkAnswer(session: GameSession, userId: number, answer: string): Promise<boolean> {
    const q = session.currentQuestion;
    if (!q) return false;
    const dir = ['شمال', 'جنوب', 'شرق', 'غرب'][parseInt(answer) - 1] || '';
    const meta = q.metadata;
    if (!meta) return false;
    switch (dir) {
      case 'شمال': meta.currentY = Math.max(0, meta.currentY - 1); break;
      case 'جنوب': meta.currentY = Math.min(9, meta.currentY + 1); break;
      case 'شرق': meta.currentX = Math.min(9, meta.currentX + 1); break;
      case 'غرب': meta.currentX = Math.max(0, meta.currentX - 1); break;
    }
    const found = meta.currentX === meta.targetX && meta.currentY === meta.targetY;
    meta.found = found;
    q.metadata = meta;
    return found;
  }

  renderQuestion(session: GameSession, q: AiResponse): string {
    if (q.metadata?.found) return '🎉 لقد وجدت الكنز!';
    const dx = Math.abs((q.metadata?.currentX || 0) - (q.metadata?.targetX || 0));
    const dy = Math.abs((q.metadata?.currentY || 0) - (q.metadata?.targetY || 0));
    const distance = dx + dy;
    const dirX = (q.metadata?.currentX || 0) < (q.metadata?.targetX || 0) ? 'شرق' : 'غرب';
    const dirY = (q.metadata?.currentY || 0) < (q.metadata?.targetY || 0) ? 'جنوب' : 'شمال';
    return `🗺️ ابحث عن الكنز!\n\n📍 موقعك: (${q.metadata?.currentX || 0}, ${q.metadata?.currentY || 0})\n📏 المسافة: ${distance} خطوات\n🧭 الاتجاه: ${dirX} و ${dirY}\n\nاختر:\n1. شمال\n2. جنوب\n3. شرق\n4. غرب`;
  }

  renderRoundStart(session: GameSession): string {
    return '🎯 لعبة صيد الكنز!\n\nتحرك على الخريطة للعثور على الكنز المخفي!';
  }
}