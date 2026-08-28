#!/usr/bin/env python3
"""
🤖 Telegram Games Bot - Python Version
All Arabic, 20 games, AI-powered, leaderboards, shop, admin commands
"""
import asyncio
import json
import logging
import os
import sqlite3
import sys
from datetime import datetime
from pathlib import Path

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, CallbackQueryHandler, filters, ContextTypes

from db.database import Database
from games.manager import GameManager
from config import Config

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

config = Config()
db = Database(config.DB_PATH)
game_manager = GameManager(config, db)

# ========== COMMAND HANDLERS ==========

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = db.get_or_create_user(update.effective_user)
    await update.message.reply_text(
        "🤖 مرحباً بك في بوت الألعاب الجماعية!\n\n"
        "هذا البوت يتيح لك لعب مجموعة متنوعة من الألعاب النصية مع أصدقائك.\n\n"
        "📋 /games - عرض الألعاب المتاحة\n"
        "❓ /help - قائمة المساعدة\n"
        "🏆 /leaderboard - لوحة المتصدرين"
    )

async def help_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "❓ قائمة المساعدة\n\n"
        "الأوامر المتاحة:\n"
        "/games - عرض قائمة الألعاب\n"
        "/play [اسم اللعبة] - بدء لعبة\n"
        "/points - نقاطي العالمية\n"
        "/gpoints - نقاطي في هذه المجموعة\n"
        "/level - مستواي ونقاط الخبرة\n"
        "/leaderboard - المتصدرين العالمي\n"
        "/gleaderboard - متصدرين المجموعة\n"
        "/groups_leaderboard - تصنيف المجموعات\n"
        "/shop - المتجر\n"
        "/buy [رقم] - شراء دعامة\n"
        "/inventory - دعاماتي\n"
        "/stats - إحصائياتي\n"
        "/cancel - إلغاء اللعبة الحالية"
    )

async def games_list(update: Update, context: ContextTypes.DEFAULT_TYPE):
    rows = []
    for gid, g in config.GAMES.items():
        rows.append([InlineKeyboardButton(f"🎮 {g['name']}", callback_data=f"play_{gid}")])
    rows.append([InlineKeyboardButton("❌ إلغاء", callback_data="cancel")])
    await update.message.reply_text(
        "🎮 اختر لعبة للعب:\n\n" + "\n".join([f"🎮 {g['name']} - {g['desc']}" for g in config.GAMES.values()]),
        reply_markup=InlineKeyboardMarkup(rows)
    )

async def play(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    chat = update.effective_chat
    args = context.args
    game_id = args[0].lower() if args else None
    
    if not game_id or game_id not in config.GAMES:
        available = ", ".join(config.GAMES.keys())
        await update.message.reply_text(f"⚠️ اسم اللعبة غير صالح. الألعاب المتاحة:\n{available}\n\nمثال: /play qna")
        return
    
    result = game_manager.create_session(chat.id, user.id, game_id)
    await update.message.reply_text(result)

async def points(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = db.get_or_create_user(update.effective_user)
    await update.message.reply_text(f"💎 نقاطك العالمية: {user['global_points']}")

async def gpoints(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_chat.type == "private":
        await update.message.reply_text("⚠️ هذا الأمر يعمل فقط داخل المجموعات.")
        return
    user = db.get_or_create_user(update.effective_user)
    gu = db.get_group_user(user['id'], update.effective_chat.id)
    await update.message.reply_text(f"💎 نقاطك في هذه المجموعة: {gu['group_points'] if gu else 0}")

async def level(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = db.get_or_create_user(update.effective_user)
    xp = user['xp']
    level = user['level']
    next_xp = config.get_xp_for_level(level)
    prev_xp = config.get_xp_for_level(level - 1) if level > 1 else 0
    progress = ((xp - prev_xp) / (next_xp - prev_xp)) * 100 if next_xp > prev_xp else 100
    await update.message.reply_text(
        f"⭐ مستواك: {level}\n"
        f"🔵 XP: {xp}/{next_xp}\n"
        f"📊 التقدم: {min(100, int(progress))}%"
    )

async def leaderboard(update: Update, context: ContextTypes.DEFAULT_TYPE):
    entries = db.get_global_leaderboard(10)
    if not entries:
        await update.message.reply_text("📭 لا توجد بيانات متاحة.")
        return
    text = "🏆 لوحة المتصدرين العالمية:\n\n"
    for i, e in enumerate(entries, 1):
        text += f"{i}. {e['first_name']} - {e['global_points']} نقطة\n"
    await update.message.reply_text(text)

async def gleaderboard(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_chat.type == "private":
        await update.message.reply_text("⚠️ هذا الأمر يعمل فقط داخل المجموعات.")
        return
    entries = db.get_group_leaderboard(update.effective_chat.id, 10)
    if not entries:
        await update.message.reply_text("📭 لا توجد بيانات متاحة.")
        return
    text = "🏆 لوحة متصدرين المجموعة:\n\n"
    for i, e in enumerate(entries, 1):
        text += f"{i}. {e['first_name']} - {e['group_points']} نقطة\n"
    await update.message.reply_text(text)

async def groups_leaderboard(update: Update, context: ContextTypes.DEFAULT_TYPE):
    entries = db.get_groups_leaderboard(10)
    if not entries:
        await update.message.reply_text("📭 لا توجد بيانات متاحة.")
        return
    text = "🏆 تصنيف المجموعات:\n\n"
    for i, e in enumerate(entries, 1):
        text += f"{i}. {e['title']} - {e['total_games']} لعبة | {e['total_points']} نقطة\n"
    await update.message.reply_text(text)

async def shop(update: Update, context: ContextTypes.DEFAULT_TYPE):
    perks = config.PERKS
    text = "🛒 المتجر\n\nاختر دعامة للشراء:\n\n"
    for p in perks:
        text += f"{p['id']}. {p['name']} - {p['price']} نقطة\n   {p['desc']}\n\n"
    text += "📝 للشراء: /buy [رقم الدعامة]"
    await update.message.reply_text(text)

async def buy(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = db.get_or_create_user(update.effective_user)
    chat = update.effective_chat
    args = context.args
    if not args or not args[0].isdigit():
        await update.message.reply_text("⚠️ الرجاء تحديد رقم الدعامة. مثال: /buy 1")
        return
    perk_id = int(args[0])
    perk = config.get_perk(perk_id)
    if not perk:
        await update.message.reply_text("⚠️ الدعامة غير موجودة.")
        return
    gu = db.get_group_user(user['id'], chat.id)
    if not gu or gu['group_points'] < perk['price']:
        await update.message.reply_text(f"⚠️ نقاطك غير كافية. تحتاج {perk['price']} نقطة.")
        return
    db.buy_perk(user['id'], chat.id, perk_id, perk['price'])
    await update.message.reply_text(f"✅ تم شراء {perk['name']} بنجاح!")

async def inventory(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = db.get_or_create_user(update.effective_user)
    chat = update.effective_chat
    perks = db.get_user_perks(user['id'], chat.id)
    if not perks:
        await update.message.reply_text("📭 لا تملك أي دعامات حالياً.")
        return
    text = "📦 دعاماتك:\n\n"
    for p in perks:
        perk_def = config.get_perk(p['perk_id'])
        text += f"• {perk_def['name'] if perk_def else 'غير معروف'} - {p['uses']} استخدامات\n"
    await update.message.reply_text(text)

async def stats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = db.get_or_create_user(update.effective_user)
    win_rate = (user['games_won'] / user['games_played'] * 100) if user['games_played'] > 0 else 0
    await update.message.reply_text(
        f"📊 إحصائياتك:\n\n"
        f"الألعاب التي لعبتها: {user['games_played']}\n"
        f"الألعاب التي ربحتها: {user['games_won']}\n"
        f"نسبة الفوز: {int(win_rate)}%\n"
        f"إجمالي وقت اللعب: {user['total_play_time']} ثانية"
    )

async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    result = game_manager.cancel_session(update.effective_chat.id, update.effective_user.id)
    await update.message.reply_text(result)

# ========== SUDO COMMANDS ==========

async def broadcast(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    if user_id not in config.SUDO_USERS:
        await update.message.reply_text("⚠️ هذا الأمر مخصص لمالك البوت فقط.")
        return
    message = " ".join(context.args) if context.args else ""
    if not message:
        await update.message.reply_text("⚠️ الرجاء كتابة الرسالة.")
        return
    
    sent_users = 0
    sent_groups = 0
    failed = 0
    
    for uid in db.get_all_users():
        try:
            await context.bot.send_message(chat_id=uid, text=f"📢 إعلان رسمي:\n\n{message}")
            sent_users += 1
        except:
            failed += 1
        await asyncio.sleep(0.05)
    
    for gid in db.get_all_groups():
        try:
            await context.bot.send_message(chat_id=gid, text=f"📢 إعلان رسمي:\n\n{message}")
            sent_groups += 1
        except:
            failed += 1
        await asyncio.sleep(0.05)
    
    await update.message.reply_text(
        f"✅ تم إرسال البث.\n"
        f"👤 المستخدمين: {sent_users}\n"
        f"👥 المجموعات: {sent_groups}\n"
        f"❌ الفاشل: {failed}"
    )

async def broadcast_users(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id not in config.SUDO_USERS:
        await update.message.reply_text("⚠️ هذا الأمر مخصص لمالك البوت فقط.")
        return
    message = " ".join(context.args) if context.args else ""
    if not message:
        await update.message.reply_text("⚠️ الرجاء كتابة الرسالة.")
        return
    sent = 0
    for uid in db.get_all_users():
        try:
            await context.bot.send_message(chat_id=uid, text=f"📢 إعلان للمستخدمين:\n\n{message}")
            sent += 1
        except:
            pass
        await asyncio.sleep(0.05)
    await update.message.reply_text(f"✅ تم إرسال البث إلى {sent} مستخدم.")

async def broadcast_groups(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id not in config.SUDO_USERS:
        await update.message.reply_text("⚠️ هذا الأمر مخصص لمالك البوت فقط.")
        return
    message = " ".join(context.args) if context.args else ""
    if not message:
        await update.message.reply_text("⚠️ الرجاء كتابة الرسالة.")
        return
    sent = 0
    for gid in db.get_all_groups():
        try:
            await context.bot.send_message(chat_id=gid, text=f"📢 إعلان للمجموعات:\n\n{message}")
            sent += 1
        except:
            pass
        await asyncio.sleep(0.05)
    await update.message.reply_text(f"✅ تم إرسال البث إلى {sent} مجموعة.")

async def botstats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_user.id not in config.SUDO_USERS:
        await update.message.reply_text("⚠️ هذا الأمر مخصص لمالك البوت فقط.")
        return
    users = db.get_all_users()
    groups = db.get_all_groups()
    stats = db.get_bot_stats()
    await update.message.reply_text(
        f"📊 إحصائيات البوت:\n\n"
        f"المستخدمين: {len(users)}\n"
        f"المجموعات: {len(groups)}\n"
        f"الألعاب المنعقدة: {stats['total_games']}\n"
        f"إجمالي النقاط الموزعة: {stats['total_points']}"
    )

# ========== MESSAGE HANDLER ==========

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not update.message or not update.message.text:
        return
    
    text = update.message.text.strip()
    user = update.effective_user
    chat = update.effective_chat
    
    # Check for game commands
    if text == "سجلني":
        result = game_manager.register_player(chat.id, user.id)
        await update.message.reply_text(result)
    elif text == "ابدأ":
        result = game_manager.start_game(chat.id, user.id)
        await update.message.reply_text(result)
        # Send first round if game started
        session = game_manager.get_session(chat.id)
        if session and session['state'] == 'playing':
            round_text = game_manager.get_round_text(session)
            if round_text:
                await update.message.reply_text(round_text)
    elif text == "توقف":
        result = game_manager.cancel_session(chat.id, user.id)
        await update.message.reply_text(result)
    else:
        # Check if there's an active game and this is an answer
        session = game_manager.get_session(chat.id)
        if session and session['state'] == 'playing':
            result = game_manager.handle_answer(chat.id, user.id, text)
            if result:
                await update.message.reply_text(result)

# ========== CALLBACK HANDLER ==========

async def handle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    data = query.data
    
    if data.startswith("play_"):
        game_id = data.replace("play_", "")
        if game_id in config.GAMES:
            result = game_manager.create_session(query.message.chat.id, query.from_user.id, game_id)
            await query.edit_message_text(result)
    elif data == "cancel":
        await query.edit_message_text("❌ تم الإلغاء.")

# ========== MAIN ==========

async def main():
    token = config.BOT_TOKEN
    if not token:
        logger.error("BOT_TOKEN not set!")
        sys.exit(1)
    
    app = Application.builder().token(token).build()
    
    # User commands
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_cmd))
    app.add_handler(CommandHandler("games", games_list))
    app.add_handler(CommandHandler("play", play))
    app.add_handler(CommandHandler("points", points))
    app.add_handler(CommandHandler("gpoints", gpoints))
    app.add_handler(CommandHandler("level", level))
    app.add_handler(CommandHandler("leaderboard", leaderboard))
    app.add_handler(CommandHandler("gleaderboard", gleaderboard))
    app.add_handler(CommandHandler("groups_leaderboard", groups_leaderboard))
    app.add_handler(CommandHandler("shop", shop))
    app.add_handler(CommandHandler("buy", buy))
    app.add_handler(CommandHandler("inventory", inventory))
    app.add_handler(CommandHandler("stats", stats))
    app.add_handler(CommandHandler("cancel", cancel))
    
    # Sudo commands
    app.add_handler(CommandHandler("broadcast", broadcast))
    app.add_handler(CommandHandler("broadcastusers", broadcast_users))
    app.add_handler(CommandHandler("broadcastgroups", broadcast_groups))
    app.add_handler(CommandHandler("botstats", botstats))
    
    # Message and callback handlers
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    app.add_handler(CallbackQueryHandler(handle_callback))
    
    logger.info("🤖 Bot started! Press Ctrl+C to stop.")
    await app.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    asyncio.run(main())