#!/usr/bin/env python3
"""
🤖 Telegram Games Bot - Python Version
========================================
All Arabic, 20 games, AI-powered, leaderboards, shop, admin broadcast

HOW TO RUN:
-----------
1. Install dependencies:
   pip install -r requirements.txt

2. Set environment variables (or edit config.py):
   export BOT_TOKEN="8898635704:AAFsa--iLpZii20QQZANnOCDvBq46-MQ45Y"
   export SUDO_USERS="7125289523"

3. Run the bot:
   python bot.py

OR use the run.sh script:
   chmod +x run.sh
   ./run.sh

FEATURES:
- 20 games (each in its own file under games/)
- Points & XP system with 10 levels
- Global, group, and groups leaderboards
- 10 perks shop with group-specific purchases
- Admin broadcast to ALL groups + private chats
- AI-powered creative questions (uses api.php)
- All Arabic UI
- SQLite database (no D1 needed!)
- No Cloudflare Workers complexity

COMMANDS:
- /start - Welcome
- /help - Help
- /games - Game list
- /play [id] - Start a game
- /points - My points
- /gpoints - Group points
- /level - My level
- /leaderboard - Global leaderboard
- /gleaderboard - Group leaderboard
- /groups_leaderboard - Groups ranking
- /shop - Perks shop
- /buy [n] - Buy perk
- /inventory - My perks
- /stats - My stats
- /cancel - Cancel game

SUDO COMMANDS:
- /broadcast [msg] - To ALL users + groups
- /broadcastusers [msg] - To users only
- /broadcastgroups [msg] - To groups only
- /botstats - Bot statistics

GAMES:
1. qna - سؤال وجواب
2. whoami - من أنا؟
3. proverb - أكمل المثل
4. opposite - عكس الكلمة
5. synonyms - المرادفات
6. wordrace - سباق الكلمات
7. anagrams - لعبة الحروف
8. longestword - أطول كلمة
9. missingword - الكلمة الناقصة
10. ta - تاء مربوطة أم مفتوحة
11. guessnumber - خمن الرقم
12. coinflip - قلب عملة
13. rps - حجر ورقة مقص
14. guessyear - خمن السنة
15. whichlarger - أيهما أكبر؟
16. choosepath - اختر طريقك
17. escape - اهرب من الغرفة
18. treasure - صيد الكنز
19. riddle - حل اللغز
20. challenge - سباق التحديات
"""