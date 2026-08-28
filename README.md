# 🤖 بوت الألعاب الجماعية على Cloudflare Workers

## 📋 المتطلبات

- Node.js 18+
- حساب Cloudflare مع Workers و D1 و KV
- بوت تيليغرام (من @BotFather)
- (اختياري) خادم AI API - `api.php` (لا يحتاج مفتاح API)

## 🚀 التثبيت والنشر

### 1. تثبيت الاعتمادات

```bash
npm install
```

### 2. إعداد KV Namespace

```bash
npx wrangler kv:namespace create "STORAGE"
```

انسخ الـ ID الناتج وضعه في `wrangler.toml`.

### 3. إعداد D1 Database

```bash
npx wrangler d1 create games_db
```

انسخ الـ ID الناتج وضعه في `wrangler.toml`.

### 4. إعداد المتغيرات السرية

```bash
npx wrangler secret put BOT_TOKEN
# أدخل توكن البوت من @BotFather
```

**ملاحظة:** لا حاجة لمفتاح API! الـ `api.php` يستخدم Perplexity AI مجاناً بدون مفتاح.

### 5. تعديل الإعدادات

عدل ملف `wrangler.toml`:
- `BOT_USERNAME`: اسم المستخدم للبوت
- `AI_API_ENDPOINT`: رابط خادم AI API (مثال: `https://your-server.com/api.php`)
- `SUDO_USERS`: قائمة معرفات المستخدمين المالكين (JSON array)

### 6. رفع `api.php` على سيرفر PHP

ارفع ملف `api.php` إلى أي سيرفر PHP يدعم curl (مثل Hostinger, 000webhost, etc).

### 7. النشر

```bash
npm run deploy
```

### 8. إعداد Webhook

```bash
curl -F "url=https://your-worker.workers.dev/YOUR_BOT_TOKEN" \
     https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook
```

## 🎮 الألعاب المتاحة (20 لعبة)

### ألغاز ومعرفة عامة
1. **سؤال وجواب** - اختر الإجابة الصحيحة من 4 خيارات
2. **من أنا؟** - خمن الشخصية من الوصف
3. **أكمل المثل** - أكمل المثل الشعبي
4. **عكس الكلمة** - اكتب عكس الكلمة
5. **المرادفات** - اختر المرادف الصحيح

### كلمات وحروف
6. **سباق الكلمات** - كلمة تبدأ بالحرف المطلوب
7. **لعبة الحروف** - رتب الحروف المشوشرة
8. **أطول كلمة** - أطول كلمة ضمن الموضوع
9. **الكلمة الناقصة** - أكمل الجملة
10. **تاء مربوطة أم مفتوحة** - حدد نوع التاء

### تخمين وأرقام
11. **خمن الرقم** - خمن الرقم بين 1-100
12. **قلب عملة** - اختر وجه العملة
13. **حجر ورقة مقص** - العب ضد البوت
14. **خمن السنة** - خمن سنة الحدث التاريخي
15. **أيهما أكبر؟** - اختر الرقم الأكبر

### مغامرات وقصص
16. **اختر طريقك** - قصة متفرعة بخيارات
17. **اهرب من الغرفة** - اختر الأدوات للهروب
18. **صيد الكنز** - تحرك على الخريطة
19. **حل اللغز** - ألغاز معقدة
20. **سباق التحديات** - 5 تحديات متتالية

## 👑 أوامر المشرف العام (Sudo)

- `/addsudo [id]` - إضافة مشرف عام
- `/removesudo [id]` - إزالة مشرف عام
- `/setpoints [id] [points]` - تعيين نقاط مستخدم
- `/setxp [id] [xp]` - تعيين XP مستخدم
- `/resetuser [id]` - إعادة تعيين حساب مستخدم
- `/banuser [id] [reason]` - حظر مستخدم من البوت
- `/unbanuser [id]` - رفع الحظر
- `/broadcast [message]` - إرسال رسالة لجميع المستخدمين والمجموعات
- `/broadcastusers [message]` - إرسال للمستخدمين فقط (دردشة خاصة)
- `/broadcastgroups [message]` - إرسال للمجموعات فقط
- `/botstats` - إحصائيات البوت
- `/sudolist` - قائمة المشرفين العامين

## 👥 أوامر مشرف المجموعة

- `/viewuser [id]` - عرض بيانات مستخدم
- `/resetsession` - إعادة تعيين جلسة اللعب
- `/endgame` - إنهاء اللعبة فوراً
- `/enablegame [id]` - تفعيل لعبة
- `/disablegame [id]` - تعطيل لعبة
- `/setrounds [n]` - تعيين عدد الجولات
- `/banmember [id]` - حظر عضو من المجموعة
- `/unbanmember [id]` - رفع الحظر
- `/deletegroup` - حذف المجموعة من البوت
- `/restoregroup` - استعادة المجموعة
- `/removefromlb` - إزالة من لوحة المتصدرين
- `/restoretolb` - إعادة للوحة المتصدرين
- `/groupsettings` - عرض إعدادات المجموعة

## 🛒 المتجر (10 دعامات)

| # | الدعامة | السعر | الاستخدامات |
|---|---------|-------|-------------|
| 1 | مساعدة إضافية | 50 | 10 |
| 2 | تجميد الوقت | 75 | 5 |
| 3 | تخطي السؤال | 60 | 5 |
| 4 | مضاعف النقاط | 100 | 3 |
| 5 | عكس النتيجة | 120 | 2 |
| 6 | حذف إجابة خاطئة | 40 | 5 |
| 7 | تسريع اللعب | 30 | 10 |
| 8 | إعادة المحاولة | 80 | 3 |
| 9 | شارة خاصة | 200 | 1 |
| 10 | إحصائيات مفصلة | 150 | غير محدود |

## 🤖 AI API Integration

**لا حاجة لمفتاح API!** الـ `api.php` يستخدم Perplexity AI مجاناً.

### تنسيق الطلب (POST to `api.php`)

```json
{
  "model": "gemini3.1pro",
  "question": "أنت مولد أسئلة ثقافية عربية..."
}
```

### تنسيق الاستجابة

```json
{
  "success": true,
  "answer": "{\"question\":\"ما عاصمة مصر؟\",\"options\":[\"القاهرة\",\"الجيزة\",\"الإسكندرية\",\"أسوان\"],\"correctAnswer\":\"القاهرة\"}",
  "model": "Gemini 3.1 Pro"
}
```

إذا تعذر الاتصال بـ API، يستخدم البوت محتوى ثابتاً احتياطياً.

### الموديلات المتاحة في `api.php`

- `gemini3.1pro` - Gemini 3.1 Pro (افتراضي)
- `gpt54`, `gpt55` - GPT-5.4, GPT-5.5
- `claude46sonnet`, `claude47opus`, `claude48opus` - Claude 4.6-4.8
- `claude50sonnet`, `claude50sonnetthinking`, `claude50opus` - Claude 5.0
- `gpt56_sol`, `gpt56_sol_thinking`, `gpt56_terra`, `gpt56_terra_thinking` - GPT-5.6
- `kimik26instant` - Kimi K2.6
- `glm_5_2` - GLM-5.2
- `nano_banana` - Image generation

## 🗄️ هيكل قاعدة البيانات

### KV Storage
- `user:{id}` - بيانات المستخدم
- `group:{id}` - بيانات المجموعة
- `group_user:{groupId}:{userId}` - بيانات المستخدم في المجموعة
- `session:{groupId}` - جلسة اللعبة الحالية
- `lb:global` - لوحة المتصدرين العالمية
- `glb:{groupId}` - لوحة متصدرين المجموعة
- `groups_lb:global` - تصنيف المجموعات
- `sudo:list` - قائمة المشرفين العامين
- `user_groups:{userId}` - مجموعات المستخدم
- `user_session:{userId}` - جلسة المستخدم النشطة

### D1 Database
- `game_history` - سجل الألعاب
- `audit_log` - سجل التدقيق
- `game_stats` - إحصائيات الألعاب
- `daily_stats` - إحصائيات يومية

## 📁 هيكل الملفات

```
├── api.php                     # AI API (لا يحتاج مفتاح)
├── src/
│   ├── index.ts                # نقطة الدخول
│   ├── types.ts                # أنواع البيانات
│   ├── config.ts               # الإعدادات
│   ├── telegram.ts             # API التيليغرام
│   ├── db/
│   │   ├── kv.ts               # KV storage
│   │   └── d1.ts               # D1 SQL
│   ├── i18n/
│   │   └── ar.ts               # النصوص العربية
│   ├── user/
│   │   └── manager.ts          # إدارة المستخدمين
│   ├── group/
│   │   └── manager.ts          # إدارة المجموعات
│   ├── points/
│   │   └── system.ts           # نظام النقاط و XP
│   ├── shop/
│   │   └── shop.ts             # المتجر والدعامات
│   ├── session/
│   │   └── manager.ts          # إدارة جلسات اللعب
│   ├── leaderboard/
│   │   └── manager.ts          # لوحات المتصدرين
│   ├── admin/
│   │   └── sudo.ts             # أوامر المشرفين
│   ├── ai/
│   │   └── api.ts              # AI API integration
│   ├── games/
│   │   ├── base.ts             # الفئة الأساسية
│   │   ├── all.ts              # تجميع الألعاب
│   │   └── individual/         # كل لعبة في ملف منفصل
│   │       ├── qna.ts
│   │       ├── whoami.ts
│   │       ├── proverb.ts
│   │       ├── opposite.ts
│   │       ├── synonyms.ts
│   │       ├── wordrace.ts
│   │       ├── anagrams.ts
│   │       ├── longestword.ts
│   │       ├── missingword.ts
│   │       ├── ta.ts
│   │       ├── guessnumber.ts
│   │       ├── coinflip.ts
│   │       ├── rps.ts
│   │       ├── guessyear.ts
│   │       ├── whichlarger.ts
│   │       ├── choosepath.ts
│   │       ├── escape.ts
│   │       ├── treasure.ts
│   │       ├── riddle.ts
│   │       └── challenge.ts
│   └── commands/
│       └── handler.ts          # معالج الأوامر
├── wrangler.toml               # إعدادات Cloudflare
├── package.json
├── tsconfig.json
└── README.md
```

## 🧠 الذكاء الاصطناعي الإبداعي

البوت يستخدم AI لتوليد أسئلة إبداعية ومتنوعة في كل مرة:

- **أسئلة ثقافية** - توليد أسئلة جديدة مع خيارات
- **ألغاز شخصيات** - وصف غامض لشخصيات مشهورة
- **أمثال شعبية** - أمثال عربية متنوعة
- **أحداث تاريخية** - أحداث عربية وعالمية
- **ألغاز معقدة** - ألغاز تحتاج تفكير عميق
- **قصص تفاعلية** - قصص متفرعة بخيارات متعددة
- **غرف هروب** - سيناريوهات هروب متنوعة
- **كلمات وعكسها** - كلمات عربية متنوعة
- **مرادفات** - كلمات مع مرادفات مختلفة

كل لعبة تستخدم AI لتوليد محتوى فريد، مع احتياطي ثابت في حال تعذر الاتصال بالـ API.