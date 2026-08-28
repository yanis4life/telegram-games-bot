#!/usr/bin/env python3
"""أطول كلمة - اكتب أطول كلمة ضمن الموضوع"""
import random
from games.base import BaseGame

class LongestWordGame(BaseGame):
    def get_game_id(self):
        return "longestword"
    def generate_question(self, session):
        topics = ["الحيوانات", "النباتات", "المدن العربية", "المهن", "الألوان", "الأطعمة", "المشروبات", "الرياضات"]
        return {"question": random.choice(topics), "correct_answer": ""}
    def check_answer(self, session, user_id, answer):
        word = answer.strip()
        if len(word) < 3:
            return False
        scores = session['scores']
        sid = str(user_id)
        prev = scores.get(sid, 0)
        if len(word) > prev:
            scores[sid] = len(word)
            return True
        return False
    def render_question(self, session, question):
        return f"📏 الموضوع: {question['question']}\n\nاكتب أطول كلمة ممكنة متعلقة بالموضوع:"