#!/bin/bash
# Simple run script for the Telegram Games Bot
echo "🤖 Starting Telegram Games Bot..."
echo ""

# Set your bot token here (or use environment variable)
export BOT_TOKEN="${BOT_TOKEN:-8898635704:AAFsa--iLpZii20QQZANnOCDvBq46-MQ45Y}"
export SUDO_USERS="${SUDO_USERS:-7125289523}"

# Check if python-telegram-bot is installed
python3 -c "import telegram" 2>/dev/null || {
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
}

echo "✅ Bot is ready! Press Ctrl+C to stop."
echo ""

# Run the bot
python3 bot.py