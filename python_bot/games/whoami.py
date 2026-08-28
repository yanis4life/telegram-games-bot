#!/usr/bin/env python3
"""من أنا؟ - خمن الشخصية الشهيرة من الوصف"""
import random
from games.base import BaseGame

class WhoAmIGame(BaseGame):
    def get_game_id(self):
        return "whoami"
    
    def generate_question(self, session):
        pool = [
            {"d": "أنا عالم مصري حصلت على جائزة نوبل في الفيزياء عام 1999", "a": "أحمد زويل"},
            {"d": "أنا قائد عربي حررت القدس من الصليبيين", "a": "صلاح الدين الأيوبي"},
            {"d": "أنا كاتب مصري حصلت على جائزة نوبل في الأدب عام 1988", "a": "نجيب محفوظ"},
            {"d": "أنا عالم مسلم كتبت كتاب الحاوي في الطب", "a": "الرازي"},
            {"d": "أنا شاعر عربي لقبت بالأمير", "a": "أحمد شوقي"},
            {"d": "أنا أول من اخترع الهاتف", "a": "ألكسندر غراهام بيل"},
            {"d": "أنا عالم رياضيات مسلم أسس علم الجبر", "a": "الخوارزمي"},
            {"d": "أنا فيلسوف يوناني معلم الإسكندر الأكبر", "a": "أرسطو"},
            {"d": "أنا رسام إيطالي لوحتي الموناليزا", "a": "ليوناردو دافنشي"},
            {"d": "أنا عالم فيزياء وضعت نظرية النسبية", "a": "ألبرت أينشتاين"},
        ]
        q = random.choice(pool)
        return {"question": q["d"], "correct_answer": q["a"]}
    
    def check_answer(self, session, user_id, answer):
        q = session['question_data']
        return answer.strip().lower() == q['correct_answer'].strip().lower()
    
    def render_question(self, session, question):
        return f"🕵️ من أنا؟\n\n{question['question']}\n\nاكتب اسم الشخصية:"