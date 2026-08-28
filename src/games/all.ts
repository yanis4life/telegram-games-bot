import { BaseGame } from './base';
import { AiService } from '../ai/api';
import { SessionManager } from '../session/manager';
import { PointsSystem } from '../points/system';
import { GroupManager } from '../group/manager';
import { LeaderboardManager } from '../leaderboard/manager';
import { KvStore } from '../db/kv';
import { DbStore } from '../db/d1';
import { TelegramApi } from '../telegram';
import { Env } from '../types';

import { QnaGame } from './individual/qna';
import { WhoAmIGame } from './individual/whoami';
import { ProverbGame } from './individual/proverb';
import { OppositeGame } from './individual/opposite';
import { SynonymsGame } from './individual/synonyms';
import { WordRaceGame } from './individual/wordrace';
import { AnagramsGame } from './individual/anagrams';
import { LongestWordGame } from './individual/longestword';
import { MissingWordGame } from './individual/missingword';
import { TaGame } from './individual/ta';
import { GuessNumberGame } from './individual/guessnumber';
import { CoinFlipGame } from './individual/coinflip';
import { RpsGame } from './individual/rps';
import { GuessYearGame } from './individual/guessyear';
import { WhichLargerGame } from './individual/whichlarger';
import { ChoosePathGame } from './individual/choosepath';
import { EscapeRoomGame } from './individual/escape';
import { TreasureHuntGame } from './individual/treasure';
import { RiddleGame } from './individual/riddle';
import { ChallengeRaceGame } from './individual/challenge';

export { BaseGame } from './base';
export {
  QnaGame, WhoAmIGame, ProverbGame, OppositeGame, SynonymsGame,
  WordRaceGame, AnagramsGame, LongestWordGame, MissingWordGame, TaGame,
  GuessNumberGame, CoinFlipGame, RpsGame, GuessYearGame, WhichLargerGame,
  ChoosePathGame, EscapeRoomGame, TreasureHuntGame, RiddleGame, ChallengeRaceGame,
};

const GAME_MAP: Record<string, new (...args: any[]) => BaseGame> = {
  qna: QnaGame,
  whoami: WhoAmIGame,
  proverb: ProverbGame,
  opposite: OppositeGame,
  synonyms: SynonymsGame,
  wordrace: WordRaceGame,
  anagrams: AnagramsGame,
  longestword: LongestWordGame,
  missingword: MissingWordGame,
  ta: TaGame,
  guessnumber: GuessNumberGame,
  coinflip: CoinFlipGame,
  rps: RpsGame,
  guessyear: GuessYearGame,
  whichlarger: WhichLargerGame,
  choosepath: ChoosePathGame,
  escape: EscapeRoomGame,
  treasure: TreasureHuntGame,
  riddle: RiddleGame,
  challenge: ChallengeRaceGame,
};

export function getGameInstance(gameId: string, deps: {
  ai: AiService; sessionManager: SessionManager; pointsSystem: PointsSystem;
  groupManager: GroupManager; leaderboardManager: LeaderboardManager;
  kv: KvStore; db: DbStore; telegram: TelegramApi; env: Env;
}): BaseGame | null {
  const cls = GAME_MAP[gameId];
  if (!cls) return null;
  return new cls(deps.ai, deps.sessionManager, deps.pointsSystem, deps.groupManager, deps.leaderboardManager, deps.kv, deps.db, deps.telegram, deps.env);
}