#!/usr/bin/env python3
"""المرادفات - اختر المرادف الصحيح"""
import random
from games.base import BaseGame

class SynonymsGame(BaseGame):
    def get_game_id(self):
        return "synonyms"
    def generate_question(self, session):
        pool = [
            {"w": "جميل", "o": ["وسيم", "قبيح", "طويل"], "c": "وسيم"},
            {"w": "شجاع", "o": ["مقدام", "جبان", "خائف"], "c": "مقدام"},
            {"w": "كريم", "o": ["جواد", "بخيل", "لئيم"], "c": "جواد"},
            {"w": "ذكي", "o": ["عبقري", "غبي", "أحمق"], "c": "عبقري"},
            {"w": "قوي", "o": ["متين", "ضعيف", "واهن"], "c": "متين"},
            {"w": "سعيد", "o": ["فرحان", "حزين", "غاضب"], "c": "فرحان"},
            {"w": "غاضب", "o": ["غضبان", "هادئ", "سعيد"], "c": "غضبان"},
            {"w": "سريع", "o": ["خاطف", "بطيء", "ثقيل"], "c": "خاطف"},
        ]
        q = random.choice(pool)
        random.shuffle(q["o"])
        return {"question": q["w"], "options": q["o"], "correct_answer": q["c"]}
    def check_answer(self, session, user_id, answer):
        q = session['question_data']
        try:
            idx = int(answer) - 1
            return 0 <= idx < len(q['options']) and q['options'][idx] == q['correct_answer']
        except:
            return answer.strip().lower() == q['correct_answer'].strip().lower()
    def render_question(self, session, question):
        options = "\n".join([f"{i+1}. {opt}" for i, opt in enumerate(question['options'])])
        return f"🔤 كلمة: {question['question']}\n\nاختر المرادف الصحيح:\n{options}\n\nأرسل رقم الإجابة (1-3):"