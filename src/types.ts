export interface Env {
  STORAGE: KVNamespace;
  DB: D1Database;
  BOT_TOKEN: string;
  BOT_USERNAME: string;
  AI_API_ENDPOINT: string;
  AI_API_KEY: string;
  GAME_TIMEOUT_MINUTES: string;
  INACTIVITY_TIMEOUT_MINUTES: string;
  MAX_PLAYERS_PER_GAME: string;
  XP_LEVELS: string;
  SUDO_USERS: string;
}

export interface UserData {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  languageCode: string;
  isBot: boolean;
  globalPoints: number;
  xp: number;
  level: number;
  createdAt: string;
  lastActiveAt: string;
  isBanned: boolean;
  banReason: string;
  gamesPlayed: number;
  gamesWon: number;
  totalPlayTime: number;
}

export interface GroupData {
  id: number;
  title: string;
  type: string;
  enabledGames: Record<string, boolean>;
  defaultRounds: number;
  bannedMembers: number[];
  createdAt: string;
  lastActiveAt: string;
  totalGamesPlayed: number;
  totalPointsAwarded: number;
  isDeleted: boolean;
  deletedAt: string;
  excludeFromLeaderboard: boolean;
  leaderboardExcludedAt: string;
}

export interface GroupUserData {
  userId: number;
  groupId: number;
  groupPoints: number;
  gamesPlayed: number;
  gamesWon: number;
  perks: Record<string, number>;
  lastActiveAt: string;
  joinedAt: string;
}

export interface GameSession {
  gameId: string;
  gameType: string;
  groupId: number;
  creatorId: number;
  state: string;
  players: number[];
  registeredPlayers: number[];
  currentRound: number;
  totalRounds: number;
  scores: Record<string, number>;
  currentQuestion: any;
  roundData: any;
  startedAt: string;
  lastActivityAt: string;
  timeoutAt: string;
  isActive: boolean;
  minPlayers: number;
  maxPlayers: number;
  isIndividual: boolean;
}

export interface LeaderboardEntry {
  userId: number;
  username: string;
  firstName: string;
  points: number;
  rank: number;
}

export interface GroupLeaderboardEntry {
  groupId: number;
  groupTitle: string;
  totalGames: number;
  totalPoints: number;
  rank: number;
}

export interface GameDefinition {
  id: string;
  name: string;
  description: string;
  isIndividual: boolean;
  minPlayers: number;
  defaultRounds: number;
  pointsWin: number;
  xpWin: number;
  xpLose: number;
  category: string;
}

export interface PerkDefinition {
  id: number;
  name: string;
  description: string;
  price: number;
  maxUses: number;
}

export interface AiRequest {
  gameType: string;
  prompt: string;
  context: Record<string, any>;
  difficulty: string;
  round: number;
}

export interface AiResponse {
  success: boolean;
  question: string;
  options: string[];
  correctAnswer: string;
  storyBranch: string[];
  choices: string[];
  hint: string;
  explanation: string;
  metadata: Record<string, any>;
}

export interface ApiResponse {
  ok: boolean;
  result?: any;
  description?: string;
  error_code?: number;
}

export interface GameResult {
  winnerId: number;
  winnerUsername: string;
  pointsAwarded: number;
  xpAwarded: number;
  roundResults: any[];
  duration: number;
}

export interface AuditLog {
  id: number;
  userId: number;
  groupId: number;
  action: string;
  details: string;
  timestamp: string;
}

export interface GameHistory {
  id: number;
  gameType: string;
  groupId: number;
  creatorId: number;
  winnerId: number;
  players: string;
  rounds: number;
  duration: number;
  pointsAwarded: number;
  playedAt: string;
}