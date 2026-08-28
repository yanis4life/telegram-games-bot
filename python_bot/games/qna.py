#!/usr/bin/env python3
"""سؤال وجواب - اختر الإجابة الصحيحة من 4 خيارات"""
import random
from games.base import BaseGame

class QnaGame(BaseGame):
    def get_game_id(self):
        return "qna"
    
    def generate_question(self, session):
        pool = [
            {"q": "ما عاصمة مصر؟", "o": ["القاهرة", "الجيزة", "الإسكندرية", "أسوان"], "c": "القاهرة"},
            {"q": "كم عدد ألوان قوس قزح؟", "o": ["5", "6", "7", "8"], "c": "7"},
            {"q": "من أول إنسان صعد إلى الفضاء؟", "o": ["نيل أرمسترونغ", "يوري غاغارين", "محمد فارس", "توماس بيسون"], "c": "يوري غاغارين"},
            {"q": "ما أكبر محيط في العالم؟", "o": ["الأطلسي", "الهندي", "الهادئ", "المتجمد الشمالي"], "c": "الهادئ"},
            {"q": "كم عدد سور القرآن الكريم؟", "o": ["110", "114", "120", "100"], "c": "114"},
            {"q": "ما عاصفة اليابان؟", "o": ["طوكيو", "كيوتو", "أوساكا", "هيروشيما"], "c": "طوكيو"},
            {"q": "من اخترع المصباح الكهربائي؟", "o": ["توماس إديسون", "ألبرت أينشتاين", "نيوتن", "غاليليو"], "c": "توماس إديسون"},
            {"q": "ما أطول نهر في العالم؟", "o": ["النيل", "الأمازون", "المسيسيبي", "اليانغتسي"], "c": "النيل"},
            {"q": "كم عدد أيام السنة الكبيسة؟", "o": ["365", "366", "364", "360"], "c": "366"},
            {"q": "ما أكبر قارة في العالم؟", "o": ["آسيا", "أفريقيا", "أوروبا", "أمريكا"], "c": "آسيا"},
        ]
        q = random.choice(pool)
        return {"question": q["q"], "options": q["o"], "correct_answer": q["c"]}
    
    def check_answer(self, session, user_id, answer):
        q = session['question_data']
        try:
            idx = int(answer) - 1
            return 0 <= idx < len(q['options']) and q['options'][idx] == q['correct_answer']
        except:
            return answer.strip() == q['correct_answer']
    
    def render_question(self, session, question):
        options = "\n".join([f"{i+1}. {opt}" for i, opt in enumerate(question['options'])])
        return f"❓ {question['question']}\n\n{options}\n\nأرسل رقم الإجابة (1-4):"