#!/usr/bin/env python3
"""سباق الكلمات - اكتب كلمة تبدأ بالحرف المطلوب"""
import random
from games.base import BaseGame

class WordRaceGame(BaseGame):
    def get_game_id(self):
        return "wordrace"
    def generate_question(self, session):
        letters = "أبتثجحخدذرزسشصضطظعغفقكلمنهوي"
        topics = ["حيوانات", "نباتات", "مدن", "مهن", "ألوان", "أطعمة", "مشروبات", "رياضات"]
        letter = random.choice(letters)
        topic = random.choice(topics)
        return {"question": letter, "topic": topic, "correct_answer": ""}
    def check_answer(self, session, user_id, answer):
        q = session['question_data']
        letter = q['question']
        return answer.strip().startswith(letter) and len(answer.strip()) >= 2
    def render_question(self, session, question):
        return f"🔤 اكتب كلمة تبدأ بحرف: {question['question']}\n\nالموضوع: {question.get('topic', 'عام')}"