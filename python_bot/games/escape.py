#!/usr/bin/env python3
"""اهرب من الغرفة - اختر الأدوات للهروب"""
import random
from games.base import BaseGame

class EscapeRoomGame(BaseGame):
    def get_game_id(self):
        return "escape"
    def generate_question(self, session):
        pool = [
            {"t": ["مفتاح صدئ", "مصباح يدوي", "حبل", "عصا خشبية"], "c": 0},
            {"t": ["مفك براغي", "بطاقة ممغنطة", "شريط لاصق", "مقص"], "c": 1},
            {"t": ["فأس", "قفازات", "نظارات", "منشار"], "c": 0},
            {"t": ["سلم", "حبل", "مفتاح", "مصباح"], "c": 2},
            {"t": ["شمعة", "قداحة", "ورقة", "قلم"], "c": 1},
        ]
        q = random.choice(pool)
        return {"question": "أنت في غرفة مغلقة. اختر الأداة المناسبة للهروب!", "choices": q["t"], "correct_answer": str(q["c"])}
    def check_answer(self, session, user_id, answer):
        q = session['question_data']
        return answer.strip() == q['correct_answer']
    def render_question(self, session, question):
        tools = "\n".join([f"{i+1}. {t}" for i, t in enumerate(question['choices'])])
        return f"🚪 أنت في غرفة مغلقة!\n\nالأدوات المتاحة:\n{tools}\n\nاختر أداة لاستخدامها (أرسل الرقم):"