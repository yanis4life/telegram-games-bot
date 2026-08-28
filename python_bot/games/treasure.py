#!/usr/bin/env python3
"""صيد الكنز - تحرك شمال/جنوب/شرق/غرب للعثور على الكنز"""
import random
from games.base import BaseGame

class TreasureHuntGame(BaseGame):
    def get_game_id(self):
        return "treasure"
    def generate_question(self, session):
        return {
            "question": "ابحث عن الكنز!",
            "choices": ["شمال", "جنوب", "شرق", "غرب"],
            "correct_answer": "",
            "target_x": random.randint(0, 9),
            "target_y": random.randint(0, 9),
            "current_x": random.randint(0, 9),
            "current_y": random.randint(0, 9),
            "found": False
        }
    def check_answer(self, session, user_id, answer):
        q = session['question_data']
        dirs = {"1": "شمال", "2": "جنوب", "3": "شرق", "4": "غرب"}
        d = dirs.get(answer.strip(), "")
        if d == "شمال":
            q['current_y'] = max(0, q['current_y'] - 1)
        elif d == "جنوب":
            q['current_y'] = min(9, q['current_y'] + 1)
        elif d == "شرق":
            q['current_x'] = min(9, q['current_x'] + 1)
        elif d == "غرب":
            q['current_x'] = max(0, q['current_x'] - 1)
        found = q['current_x'] == q['target_x'] and q['current_y'] == q['target_y']
        q['found'] = found
        return found
    def render_question(self, session, question):
        if question.get('found'):
            return "🎉 لقد وجدت الكنز!"
        dx = abs(question['current_x'] - question['target_x'])
        dy = abs(question['current_y'] - question['target_y'])
        dist = dx + dy
        dir_x = "شرق" if question['current_x'] < question['target_x'] else "غرب"
        dir_y = "جنوب" if question['current_y'] < question['target_y'] else "شمال"
        return (f"🗺️ ابحث عن الكنز!\n\n📍 موقعك: ({question['current_x']}, {question['current_y']})\n"
                f"📏 المسافة: {dist} خطوات\n🧭 الاتجاه: {dir_x} و {dir_y}\n\n"
                f"اختر:\n1. شمال\n2. جنوب\n3. شرق\n4. غرب")