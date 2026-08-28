import { GameDefinition, PerkDefinition } from './types';

export const GAMES: Record<string, GameDefinition> = {
  qna: { id: 'qna', name: 'سؤال وجواب', description: 'اختر الإجابة الصحيحة من 4 خيارات', isIndividual: true, minPlayers: 1, defaultRounds: 5, pointsWin: 10, xpWin: 20, xpLose: 5, category: 'puzzle' },
  whoami: { id: 'whoami', name: 'من أنا؟', description: 'خمن الشخصية الشهيرة من الوصف', isIndividual: true, minPlayers: 1, defaultRounds: 5, pointsWin: 15, xpWin: 25, xpLose: 5, category: 'puzzle' },
  proverb: { id: 'proverb', name: 'أكمل المثل', description: 'أكمل المثل الشعبي الشهير', isIndividual: true, minPlayers: 1, defaultRounds: 5, pointsWin: 10, xpWin: 20, xpLose: 5, category: 'puzzle' },
  opposite: { id: 'opposite', name: 'عكس الكلمة', description: 'اكتب عكس الكلمة المعطاة', isIndividual: true, minPlayers: 1, defaultRounds: 5, pointsWin: 8, xpWin: 15, xpLose: 4, category: 'puzzle' },
  synonyms: { id: 'synonyms', name: 'المرادفات', description: 'اختر المرادف الصحيح للكلمة', isIndividual: true, minPlayers: 1, defaultRounds: 5, pointsWin: 8, xpWin: 15, xpLose: 4, category: 'puzzle' },
  wordrace: { id: 'wordrace', name: 'سباق الكلمات', description: 'اكتب كلمة تبدأ بالحرف المطلوب', isIndividual: true, minPlayers: 1, defaultRounds: 5, pointsWin: 12, xpWin: 22, xpLose: 5, category: 'word' },
  anagrams: { id: 'anagrams', name: 'لعبة الحروف', description: 'رتب الحروف المشوشرة لتكوين كلمة صحيحة', isIndividual: true, minPlayers: 1, defaultRounds: 5, pointsWin: 12, xpWin: 22, xpLose: 5, category: 'word' },
  longestword: { id: 'longestword', name: 'أطول كلمة', description: 'اكتب أطول كلمة ممكنة ضمن الموضوع', isIndividual: true, minPlayers: 1, defaultRounds: 3, pointsWin: 15, xpWin: 25, xpLose: 5, category: 'word' },
  missingword: { id: 'missingword', name: 'الكلمة الناقصة', description: 'أكمل الجملة بالكلمة الناقصة', isIndividual: true, minPlayers: 1, defaultRounds: 5, pointsWin: 10, xpWin: 20, xpLose: 5, category: 'word' },
  ta: { id: 'ta', name: 'تاء مربوطة أم تاء مفتوحة', description: 'حدد نوع التاء في الكلمات المعطاة', isIndividual: true, minPlayers: 1, defaultRounds: 5, pointsWin: 8, xpWin: 15, xpLose: 4, category: 'word' },
  guessnumber: { id: 'guessnumber', name: 'خمن الرقم', description: 'خمن الرقم المخفي بين 1 و 100', isIndividual: true, minPlayers: 1, defaultRounds: 1, pointsWin: 20, xpWin: 30, xpLose: 10, category: 'guess' },
  coinflip: { id: 'coinflip', name: 'قلب عملة', description: 'اختر وجه العملة', isIndividual: true, minPlayers: 1, defaultRounds: 1, pointsWin: 5, xpWin: 10, xpLose: 2, category: 'guess' },
  rps: { id: 'rps', name: 'حجر ورقة مقص', description: 'العب ضد البوت', isIndividual: true, minPlayers: 1, defaultRounds: 3, pointsWin: 8, xpWin: 15, xpLose: 4, category: 'guess' },
  guessyear: { id: 'guessyear', name: 'خمن السنة', description: 'خمن سنة الحدث التاريخي', isIndividual: true, minPlayers: 1, defaultRounds: 5, pointsWin: 15, xpWin: 25, xpLose: 5, category: 'guess' },
  whichlarger: { id: 'whichlarger', name: 'أيهما أكبر؟', description: 'اختر الرقم الأكبر من اثنين', isIndividual: true, minPlayers: 1, defaultRounds: 5, pointsWin: 5, xpWin: 10, xpLose: 2, category: 'guess' },
  choosepath: { id: 'choosepath', name: 'اختر طريقك', description: 'قصة متفرعة بخيارات متعددة', isIndividual: true, minPlayers: 1, defaultRounds: 5, pointsWin: 20, xpWin: 35, xpLose: 10, category: 'adventure' },
  escape: { id: 'escape', name: 'اهرب من الغرفة', description: 'اختر الأدوات للهروب من الغرفة المغلقة', isIndividual: true, minPlayers: 1, defaultRounds: 5, pointsWin: 25, xpWin: 40, xpLose: 10, category: 'adventure' },
  treasure: { id: 'treasure', name: 'صيد الكنز', description: 'تحرك شمال/جنوب/شرق/غرب للعثور على الكنز', isIndividual: true, minPlayers: 1, defaultRounds: 1, pointsWin: 30, xpWin: 50, xpLose: 15, category: 'adventure' },
  riddle: { id: 'riddle', name: 'حل اللغز', description: 'ألغاز معقدة تتطلب التفكير', isIndividual: true, minPlayers: 1, defaultRounds: 3, pointsWin: 20, xpWin: 35, xpLose: 8, category: 'adventure' },
  challenge: { id: 'challenge', name: 'سباق التحديات', description: '5 تحديات مختلفة متتالية', isIndividual: true, minPlayers: 1, defaultRounds: 5, pointsWin: 35, xpWin: 50, xpLose: 15, category: 'adventure' },
};

export const PERKS: PerkDefinition[] = [
  { id: 1, name: 'مساعدة إضافية', description: 'احصل على تلميح إضافي في اللعبة', price: 50, maxUses: 10 },
  { id: 2, name: 'تجميد الوقت', description: 'جمد الوقت لمدة 30 ثانية إضافية', price: 75, maxUses: 5 },
  { id: 3, name: 'تخطي السؤال', description: 'تخطي السؤال الحالي بدون عقوبة', price: 60, maxUses: 5 },
  { id: 4, name: 'مضاعف النقاط', description: 'اضرب نقاطك في 2 للجولة التالية', price: 100, maxUses: 3 },
  { id: 5, name: 'عكس النتيجة', description: 'اعكس نتيجة الجولة لصالحك', price: 120, maxUses: 2 },
  { id: 6, name: 'حذف إجابة خاطئة', description: 'احذف إجابة خاطئة من الخيارات', price: 40, maxUses: 5 },
  { id: 7, name: 'تسريع اللعب', description: 'انتقل للسؤال التالي فوراً', price: 30, maxUses: 10 },
  { id: 8, name: 'إعادة المحاولة', description: 'أعد المحاولة في السؤال الخاطئ', price: 80, maxUses: 3 },
  { id: 9, name: 'شارة خاصة', description: 'احصل على شارة تميزك في المجموعة', price: 200, maxUses: 1 },
  { id: 10, name: 'إحصائيات مفصلة', description: 'اعرض إحصائياتك المفصلة', price: 150, maxUses: 999 },
];

export const XP_LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000];

export function getLevelFromXp(xp: number): number {
  for (let i = XP_LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getXpForNextLevel(level: number): number {
  if (level >= XP_LEVEL_THRESHOLDS.length) return XP_LEVEL_THRESHOLDS[XP_LEVEL_THRESHOLDS.length - 1];
  return XP_LEVEL_THRESHOLDS[level];
}

export function getGameTimeoutMinutes(env: Env): number {
  return parseInt(env.GAME_TIMEOUT_MINUTES || '5');
}

export function getInactivityTimeoutMinutes(env: Env): number {
  return parseInt(env.INACTIVITY_TIMEOUT_MINUTES || '10');
}

export function getMaxPlayers(env: Env): number {
  return parseInt(env.MAX_PLAYERS_PER_GAME || '50');
}

export function getSudoUsers(env: Env): number[] {
  try {
    return JSON.parse(env.SUDO_USERS || '[]');
  } catch {
    return [];
  }
}