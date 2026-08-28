#!/usr/bin/env python3
"""خمن السنة - خمن سنة الحدث التاريخي"""
import random
from games.base import BaseGame

class GuessYearGame(BaseGame):
    def get_game_id(self):
        return "guessyear"
    def generate_question(self, session):
        pool = [
            {"e": "سقوط جدار برلين", "a": "1989"}, {"e": "اختراع الهاتف", "a": "1876"},
            {"e": "هبوط الإنسان على سطح القمر", "a": "1969"}, {"e": "بداية الحرب العالمية الأولى", "a": "1914"},
            {"e": "تأسيس الأمم المتحدة", "a": "1945"}, {"e": "فتح مكة", "a": "630"},
            {"e": "معركة حطين", "a": "1187"}, {"e": "اكتشاف أمريكا", "a": "1492"},
            {"e": "الثورة الفرنسية", "a": "1789"}, {"e": "اختراع الطباعة", "a": "1440"},
        ]
        q = random.choice(pool)
        return {"question": q["e"], "correct_answer": q["a"]}
    def check_answer(self, session, user_id, answer):
        q = session['question_data']
        try:
            guess = int(answer)
            correct = int(q['correct_answer'])
            return abs(guess - correct) <= 5
        except:
            return False
    def render_question(self, session, question):
        return f"📅 حدث: {question['question']}\n\nخمن سنة هذا الحدث (في حدود 5 سنوات):"