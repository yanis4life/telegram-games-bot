#!/usr/bin/env python3
"""عكس الكلمة - اكتب عكس الكلمة المعطاة"""
import random
from games.base import BaseGame

class OppositeGame(BaseGame):
    def get_game_id(self):
        return "opposite"
    def generate_question(self, session):
        pool = [
            {"w": "كبير", "a": "صغير"}, {"w": "طويل", "a": "قصير"},
            {"w": "سريع", "a": "بطيء"}, {"w": "قوي", "a": "ضعيف"},
            {"w": "غني", "a": "فقير"}, {"w": "نظيف", "a": "قذر"},
            {"w": "جديد", "a": "قديم"}, {"w": "ساخن", "a": "بارد"},
            {"w": "خفيف", "a": "ثقيل"}, {"w": "واسع", "a": "ضيق"},
            {"w": "قريب", "a": "بعيد"}, {"w": "سهل", "a": "صعب"},
            {"w": "ناعم", "a": "خشن"}, {"w": "جميل", "a": "قبيح"},
            {"w": "شجاع", "a": "جبان"},
        ]
        q = random.choice(pool)
        return {"question": q["w"], "correct_answer": q["a"]}
    def check_answer(self, session, user_id, answer):
        q = session['question_data']
        return answer.strip().lower() == q['correct_answer'].strip().lower()
    def render_question(self, session, question):
        return f"🔤 كلمة: {question['question']}\n\nاكتب عكس الكلمة:"