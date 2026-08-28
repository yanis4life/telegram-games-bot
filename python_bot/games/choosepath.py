#!/usr/bin/env python3
"""اختر طريقك - قصة متفرعة بخيارات"""
import random
from games.base import BaseGame

class ChoosePathGame(BaseGame):
    def get_game_id(self):
        return "choosepath"
    def generate_question(self, session):
        pool = [
            {"n": "أنت في غابة مظلمة. أمامك طريقان:", "c": ["الطريق الأيسر", "الطريق الأيمن"], "correct": 0},
            {"n": "أنت في قلعة قديمة. ترى بابين:", "c": ["الباب الذهبي", "الباب الفضي"], "correct": 0},
            {"n": "أنت على شاطئ بحر. ترى قارباً:", "c": ["اركب القارب", "ابق على الشاطئ"], "correct": 0},
            {"n": "أنت في كهف مظلم. تسمع صوت ماء:", "c": ["اتبع الصوت", "أشعل عود ثقاب"], "correct": 0},
            {"n": "أنت في مدينة قديمة. ترى سوقاً:", "c": ["ادخل السوق", "اصعد إلى القلعة"], "correct": 0},
        ]
        q = random.choice(pool)
        return {"question": q["n"], "choices": q["c"], "correct_answer": str(q["correct"])}
    def check_answer(self, session, user_id, answer):
        q = session['question_data']
        return answer.strip() == q['correct_answer']
    def render_question(self, session, question):
        choices = "\n".join([f"{i+1}. {c}" for i, c in enumerate(question['choices'])])
        return f"📖 {question['question']}\n\nخياراتك:\n{choices}\n\nأرسل رقم اختيارك:"