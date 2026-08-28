#!/usr/bin/env python3
"""حجر ورقة مقص - العب ضد البوت"""
import random
from games.base import BaseGame

class RpsGame(BaseGame):
    def get_game_id(self):
        return "rps"
    def generate_question(self, session):
        bot = random.choice(["حجر", "ورقة", "مقص"])
        return {"question": "اختر: حجر، ورقة، مقص", "options": ["حجر", "ورقة", "مقص"], "correct_answer": bot}
    def check_answer(self, session, user_id, answer):
        q = session['question_data']
        choices = ["حجر", "ورقة", "مقص"]
        try:
            idx = int(answer) - 1
            if idx < 0 or idx >= 3:
                return False
            player = choices[idx]
            bot = q['correct_answer']
            session['question_data']['player_choice'] = player
            session['question_data']['bot_choice'] = bot
            if player == bot:
                return False
            return (player == "حجر" and bot == "مقص") or \
                   (player == "ورقة" and bot == "حجر") or \
                   (player == "مقص" and bot == "ورقة")
        except:
            return False
    def render_question(self, session, question):
        bc = question.get('bot_choice', '')
        pc = question.get('player_choice', '')
        if bc and pc:
            return f"✊✋✌️ الجولة {session['current_round']}\n\n🤖 البوت اختار: {bc}\nأنت اخترت: {pc}\n\nاختر:\n1. حجر\n2. ورقة\n3. مقص"
        return f"✊✋✌️ الجولة {session['current_round']}\n\nاختر:\n1. حجر\n2. ورقة\n3. مقص"