#!/usr/bin/env python3
"""تاء مربوطة أم تاء مفتوحة - حدد نوع التاء"""
import random
from games.base import BaseGame

class TaGame(BaseGame):
    def get_game_id(self):
        return "ta"
    def generate_question(self, session):
        pool = [
            {"w": "مدرسة", "m": True}, {"w": "بيت", "m": False},
            {"w": "جامعة", "m": True}, {"w": "كرتون", "m": False},
            {"w": "شجرة", "m": True}, {"w": "نبات", "m": False},
            {"w": "غرفة", "m": True}, {"w": "سكر", "m": False},
            {"w": "سيارة", "m": True}, {"w": "باب", "m": False},
            {"w": "معلمة", "m": True}, {"w": "قلم", "m": False},
            {"w": "حديقة", "m": True}, {"w": "مفتاح", "m": False},
            {"w": "طاولة", "m": True},
        ]
        q = random.choice(pool)
        return {"question": q["w"], "correct_answer": "1" if q["m"] else "2"}
    def check_answer(self, session, user_id, answer):
        q = session['question_data']
        return answer.strip() == q['correct_answer']
    def render_question(self, session, question):
        return f"🔤 كلمة: {question['question']}\n\nهل التاء في الكلمة:\n1. تاء مربوطة (ة)\n2. تاء مفتوحة (ت)\n\nأرسل رقم الإجابة:"