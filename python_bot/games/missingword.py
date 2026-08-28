#!/usr/bin/env python3
"""الكلمة الناقصة - أكمل الجملة بالكلمة الناقصة"""
import random
from games.base import BaseGame

class MissingWordGame(BaseGame):
    def get_game_id(self):
        return "missingword"
    def generate_question(self, session):
        pool = [
            {"s": "ذهب الولد إلى ... ليتعلم", "a": "المدرسة"},
            {"s": "السماء ... اليوم", "a": "صافية"},
            {"s": "أكلت ... لذيذة", "a": "تفاحة"},
            {"s": "ركب الرجل ... إلى العمل", "a": "السيارة"},
            {"s": "الكتاب على ...", "a": "الطاولة"},
            {"s": "الشمس تشرق من ...", "a": "الشرق"},
            {"s": "الفلاح يحرث ...", "a": "الأرض"},
            {"s": "الطبيب يعالج ...", "a": "المرضى"},
            {"s": "الماء ... للحياة", "a": "ضروري"},
            {"s": "العلم ... في الحياة", "a": "نور"},
        ]
        q = random.choice(pool)
        display = q["s"].replace("...", "______")
        return {"question": display, "correct_answer": q["a"]}
    def check_answer(self, session, user_id, answer):
        q = session['question_data']
        return answer.strip().lower() == q['correct_answer'].strip().lower()
    def render_question(self, session, question):
        return f"📝 {question['question']}\n\nاملأ الكلمة الناقصة:"