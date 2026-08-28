#!/usr/bin/env python3
"""لعبة الحروف - رتب الحروف المشوشرة"""
import random
from games.base import BaseGame

class AnagramsGame(BaseGame):
    def get_game_id(self):
        return "anagrams"
    def scramble(self, word):
        chars = list(word)
        random.shuffle(chars)
        scrambled = ''.join(chars)
        if scrambled == word:
            chars[0], chars[-1] = chars[-1], chars[0]
            scrambled = ''.join(chars)
        return scrambled
    
    def generate_question(self, session):
        words = ["كتاب", "مدرسة", "جامعة", "حديقة", "مطبخ", "نافذة", "ساعة", "قلم", "وردة", "شمس",
                 "باب", "سيارة", "طائرة", "جبل", "نهر", "غابة", "محطة", "مكتب", "كرسي", "هاتف"]
        word = random.choice(words)
        scrambled = self.scramble(word)
        return {"question": scrambled, "correct_answer": word}
    def check_answer(self, session, user_id, answer):
        q = session['question_data']
        return answer.strip().lower() == q['correct_answer'].strip().lower()
    def render_question(self, session, question):
        return f"🔀 الحروف المشوشة: {question['question']}\n\nرتبها لتكوين كلمة صحيحة:"