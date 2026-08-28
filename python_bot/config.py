#!/usr/bin/env python3
"""Configuration and constants for the Telegram Games Bot"""
import os
import json

class Config:
    BOT_TOKEN = os.environ.get("BOT_TOKEN", "8898635704:AAFsa--iLpZii20QQZANnOCDvBq46-MQ45Y")
    DB_PATH = "games_bot.db"
    AI_API_ENDPOINT = os.environ.get("AI_API_ENDPOINT", "https://jqz.cc.cd/api.php")
    SUDO_USERS = [int(x) for x in os.environ.get("SUDO_USERS", "7125289523").split(",") if x.strip()]
    GAME_TIMEOUT = 300
    MAX_PLAYERS = 50
    
    GAMES = {
        "qna": {"id": "qna", "name": "سؤال وجواب", "desc": "اختر الإجابة الصحيحة من 4 خيارات", "min": 1, "rounds": 5, "points": 10, "xp": 20, "cat": "puzzle"},
        "whoami": {"id": "whoami", "name": "من أنا؟", "desc": "خمن الشخصية الشهيرة من الوصف", "min": 1, "rounds": 5, "points": 15, "xp": 25, "cat": "puzzle"},
        "proverb": {"id": "proverb", "name": "أكمل المثل", "desc": "أكمل المثل الشعبي الشهير", "min": 1, "rounds": 5, "points": 10, "xp": 20, "cat": "puzzle"},
        "opposite": {"id": "opposite", "name": "عكس الكلمة", "desc": "اكتب عكس الكلمة المعطاة", "min": 1, "rounds": 5, "points": 8, "xp": 15, "cat": "puzzle"},
        "synonyms": {"id": "synonyms", "name": "المرادفات", "desc": "اختر المرادف الصحيح", "min": 1, "rounds": 5, "points": 8, "xp": 15, "cat": "puzzle"},
        "wordrace": {"id": "wordrace", "name": "سباق الكلمات", "desc": "اكتب كلمة تبدأ بالحرف المطلوب", "min": 1, "rounds": 5, "points": 12, "xp": 22, "cat": "word"},
        "anagrams": {"id": "anagrams", "name": "لعبة الحروف", "desc": "رتب الحروف المشوشرة", "min": 1, "rounds": 5, "points": 12, "xp": 22, "cat": "word"},
        "longestword": {"id": "longestword", "name": "أطول كلمة", "desc": "اكتب أطول كلمة ضمن الموضوع", "min": 1, "rounds": 3, "points": 15, "xp": 25, "cat": "word"},
        "missingword": {"id": "missingword", "name": "الكلمة الناقصة", "desc": "أكمل الجملة بالكلمة الناقصة", "min": 1, "rounds": 5, "points": 10, "xp": 20, "cat": "word"},
        "ta": {"id": "ta", "name": "تاء مربوطة أم تاء مفتوحة", "desc": "حدد نوع التاء", "min": 1, "rounds": 5, "points": 8, "xp": 15, "cat": "word"},
        "guessnumber": {"id": "guessnumber", "name": "خمن الرقم", "desc": "خمن الرقم بين 1 و 100", "min": 1, "rounds": 1, "points": 20, "xp": 30, "cat": "guess"},
        "coinflip": {"id": "coinflip", "name": "قلب عملة", "desc": "اختر وجه العملة", "min": 1, "rounds": 1, "points": 5, "xp": 10, "cat": "guess"},
        "rps": {"id": "rps", "name": "حجر ورقة مقص", "desc": "العب ضد البوت", "min": 1, "rounds": 3, "points": 8, "xp": 15, "cat": "guess"},
        "guessyear": {"id": "guessyear", "name": "خمن السنة", "desc": "خمن سنة الحدث التاريخي", "min": 1, "rounds": 5, "points": 15, "xp": 25, "cat": "guess"},
        "whichlarger": {"id": "whichlarger", "name": "أيهما أكبر؟", "desc": "اختر الرقم الأكبر", "min": 1, "rounds": 5, "points": 5, "xp": 10, "cat": "guess"},
        "choosepath": {"id": "choosepath", "name": "اختر طريقك", "desc": "قصة متفرعة بخيارات", "min": 1, "rounds": 5, "points": 20, "xp": 35, "cat": "adventure"},
        "escape": {"id": "escape", "name": "اهرب من الغرفة", "desc": "اختر الأدوات للهروب", "min": 1, "rounds": 5, "points": 25, "xp": 40, "cat": "adventure"},
        "treasure": {"id": "treasure", "name": "صيد الكنز", "desc": "تحرك شمال/جنوب/شرق/غرب", "min": 1, "rounds": 1, "points": 30, "xp": 50, "cat": "adventure"},
        "riddle": {"id": "riddle", "name": "حل اللغز", "desc": "ألغاز معقدة", "min": 1, "rounds": 3, "points": 20, "xp": 35, "cat": "adventure"},
        "challenge": {"id": "challenge", "name": "سباق التحديات", "desc": "5 تحديات مختلفة", "min": 1, "rounds": 5, "points": 35, "xp": 50, "cat": "adventure"},
    }
    
    PERKS = [
        {"id": 1, "name": "مساعدة إضافية", "desc": "احصل على تلميح إضافي", "price": 50, "max": 10},
        {"id": 2, "name": "تجميد الوقت", "desc": "جمد الوقت لمدة 30 ثانية", "price": 75, "max": 5},
        {"id": 3, "name": "تخطي السؤال", "desc": "تخطي السؤال الحالي", "price": 60, "max": 5},
        {"id": 4, "name": "مضاعف النقاط", "desc": "اضرب نقاطك في 2", "price": 100, "max": 3},
        {"id": 5, "name": "عكس النتيجة", "desc": "اعكس نتيجة الجولة", "price": 120, "max": 2},
        {"id": 6, "name": "حذف إجابة خاطئة", "desc": "احذف إجابة خاطئة", "price": 40, "max": 5},
        {"id": 7, "name": "تسريع اللعب", "desc": "انتقل للسؤال التالي", "price": 30, "max": 10},
        {"id": 8, "name": "إعادة المحاولة", "desc": "أعد المحاولة", "price": 80, "max": 3},
        {"id": 9, "name": "شارة خاصة", "desc": "شارة تميزك", "price": 200, "max": 1},
        {"id": 10, "name": "إحصائيات مفصلة", "desc": "إحصائياتك المفصلة", "price": 150, "max": 999},
    ]
    
    XP_LEVELS = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000]
    
    def get_xp_for_level(self, level):
        if level <= 0:
            return 0
        if level >= len(self.XP_LEVELS):
            return self.XP_LEVELS[-1]
        return self.XP_LEVELS[level]
    
    def get_level_from_xp(self, xp):
        for i in range(len(self.XP_LEVELS) - 1, -1, -1):
            if xp >= self.XP_LEVELS[i]:
                return i + 1
        return 1
    
    def get_perk(self, perk_id):
        for p in self.PERKS:
            if p['id'] == perk_id:
                return p
        return None