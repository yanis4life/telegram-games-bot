#!/usr/bin/env python3
"""قلب عملة - اختر وجه العملة"""
import random
from games.base import BaseGame

class CoinFlipGame(BaseGame):
    def get_game_id(self):
        return "coinflip"
    def generate_question(self, session):
        result = random.choice(["وجه", "كتابة"])
        return {"question": "اختر وجه العملة", "options": ["وجه", "كتابة"], "correct_answer": result}
    def check_answer(self, session, user_id, answer):
        q = session['question_data']
        choice = "وجه" if answer.strip() == "1" else "كتابة"
        return choice == q['correct_answer']
    def render_question(self, session, question):
        return "🪙 اختر:\n1. وجه\n2. كتابة"