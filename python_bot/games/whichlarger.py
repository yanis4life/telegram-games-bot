#!/usr/bin/env python3
"""أيهما أكبر؟ - اختر الرقم الأكبر"""
import random
from games.base import BaseGame

class WhichLargerGame(BaseGame):
    def get_game_id(self):
        return "whichlarger"
    def generate_question(self, session):
        n1 = random.randint(1, 1000)
        n2 = random.randint(1, 1000)
        correct = "1" if n1 >= n2 else "2"
        return {"question": "أيهما أكبر؟", "options": [str(n1), str(n2)], "correct_answer": correct}
    def check_answer(self, session, user_id, answer):
        q = session['question_data']
        return answer.strip() == q['correct_answer']
    def render_question(self, session, question):
        return f"🔢 أي رقم أكبر؟\n\n1. {question['options'][0]}\n2. {question['options'][1]}\n\nأرسل رقم الإجابة:"