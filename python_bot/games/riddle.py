#!/usr/bin/env python3
"""حل اللغز - ألغاز معقدة"""
import random
from games.base import BaseGame

class RiddleGame(BaseGame):
    def get_game_id(self):
        return "riddle"
    def generate_question(self, session):
        pool = [
            {"r": "ما الشيء الذي يكسو الناس وهو عارٍ؟", "a": "الإبرة"},
            {"r": "ما الشيء الذي له أسنان ولا يعض؟", "a": "المشط"},
            {"r": "ما الشيء الذي كلما أخذت منه يكبر؟", "a": "الحفرة"},
            {"r": "ما الشيء الذي يكتب ولا يقرأ؟", "a": "القلم"},
            {"r": "ما الشيء الذي تراه في الليل ثلاث مرات وفي النهار مرة؟", "a": "حرف اللام"},
            {"r": "ما الشيء الذي يمشي بلا أرجل ويبكي بلا عيون؟", "a": "الغيوم"},
            {"r": "ما الشيء الذي له عين واحدة ولا يرى؟", "a": "الإبرة"},
            {"r": "ما الشيء الذي يكون في الدقيقة مرتين وفي القرن مرة؟", "a": "حرف القاف"},
            {"r": "ما الشيء الذي إذا دخل الماء لم يبتل؟", "a": "الضوء"},
            {"r": "ما الشيء الذي تأكل منه ولا تأكله؟", "a": "الطبق"},
        ]
        q = random.choice(pool)
        return {"question": q["r"], "correct_answer": q["a"]}
    def check_answer(self, session, user_id, answer):
        q = session['question_data']
        return answer.strip().lower() == q['correct_answer'].strip().lower()
    def render_question(self, session, question):
        return f"🧩 اللغز:\n{question['question']}\n\nاكتب إجابتك:"