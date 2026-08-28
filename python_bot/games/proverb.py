#!/usr/bin/env python3
"""أكمل المثل - أكمل المثل الشعبي الشهير"""
import random
from games.base import BaseGame

class ProverbGame(BaseGame):
    def get_game_id(self):
        return "proverb"
    def generate_question(self, session):
        pool = [
            {"f": "إذا كان الكلام من فضة", "a": "فالسكوت من ذهب"},
            {"f": "في التأني السلامة", "a": "وفي العجلة الندامة"},
            {"f": "من شب على شيء", "a": "شاب عليه"},
            {"f": "الصديق وقت الضيق", "a": "الحاجة أم الاختراع"},
            {"f": "أكلت يوم أكل الثور الأبيض", "a": "من ذاق ظلمة الجهل أدرك أن العلم نور"},
            {"f": "عندما يخلو السوق", "a": "يقل الكلام"},
            {"f": "اللي تأكل منه", "a": "لا تعضه"},
            {"f": "اللي فات مات", "a": "واللي جاي أت"},
            {"f": "القلب قلب", "a": "والعين عين"},
            {"f": "اللي ما يعرف الصقر", "a": "يشويه"},
        ]
        q = random.choice(pool)
        return {"question": q["f"], "correct_answer": q["a"]}
    def check_answer(self, session, user_id, answer):
        q = session['question_data']
        return answer.strip().lower() == q['correct_answer'].strip().lower()
    def render_question(self, session, question):
        return f"📜 أكمل المثل:\n\n\"{question['question']}\"\n\nاكتب إكمال المثل:"