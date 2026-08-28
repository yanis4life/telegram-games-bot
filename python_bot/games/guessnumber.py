#!/usr/bin/env python3
"""خمن الرقم - خمن الرقم بين 1 و 100"""
import random
from games.base import BaseGame

class GuessNumberGame(BaseGame):
    def get_game_id(self):
        return "guessnumber"
    def generate_question(self, session):
        target = random.randint(1, 100)
        return {"question": "خمن الرقم بين 1 و 100", "correct_answer": str(target), "hints": []}
    def check_answer(self, session, user_id, answer):
        q = session['question_data']
        try:
            guess = int(answer)
            target = int(q['correct_answer'])
            if guess == target:
                return True
            hint = "الرقم أكبر 📈" if guess < target else "الرقم أصغر 📉"
            q['hints'].append(hint)
            return False
        except:
            return False
    def render_question(self, session, question):
        hints = question.get('hints', [])
        hint_text = "\n\n" + "\n".join(hints) if hints else ""
        return f"🔢 خمن الرقم بين 1 و 100{hint_text}\n\nاكتب رقماً:"