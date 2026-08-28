#!/usr/bin/env python3
"""سباق التحديات - 5 تحديات مختلفة متتالية"""
import random
from games.base import BaseGame

class ChallengeRaceGame(BaseGame):
    def get_game_id(self):
        return "challenge"
    def generate_question(self, session):
        pool = [
            {"p": "ما عاصفة فرنسا؟", "c": "باريس"},
            {"p": "كم ناتج 15 × 3؟", "c": "45"},
            {"p": "اكتب كلمة بوت بالعكس", "c": "توب"},
            {"p": "ما الجذر التربيعي لـ 64؟", "c": "8"},
            {"p": "ما أكبر كوكب في المجموعة الشمسية؟", "c": "المشتري"},
            {"p": "كم ناتج 12 × 12؟", "c": "144"},
            {"p": "ما عاصفة الأردن؟", "c": "عمان"},
            {"p": "كم عدد أيام الأسبوع؟", "c": "7"},
            {"p": "ما لون الدم عند الإنسان؟", "c": "أحمر"},
            {"p": "كم عدد الفصول في السنة؟", "c": "4"},
        ]
        r = (session['current_round'] - 1) % len(pool)
        q = pool[r]
        return {"question": q["p"], "correct_answer": q["c"], "challenge_index": session['current_round']}
    def check_answer(self, session, user_id, answer):
        q = session['question_data']
        return answer.strip().lower() == q['correct_answer'].strip().lower()
    def render_question(self, session, question):
        idx = question.get('challenge_index', session['current_round'])
        return f"🏆 التحدي {idx} من 5:\n\n{question['question']}\n\nاكتب إجابتك:"