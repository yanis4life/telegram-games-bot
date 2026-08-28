#!/usr/bin/env python3
"""Base game class - all games inherit from this"""
import random
import requests
import json

class BaseGame:
    def __init__(self, config, db):
        self.config = config
        self.db = db
    
    def get_game_id(self):
        raise NotImplementedError
    
    def generate_question(self, session):
        raise NotImplementedError
    
    def check_answer(self, session, user_id, answer):
        raise NotImplementedError
    
    def render_question(self, session, question):
        raise NotImplementedError
    
    def ai_generate(self, prompt):
        """Call AI API for dynamic content generation"""
        try:
            resp = requests.post(
                self.config.AI_API_ENDPOINT,
                json={"model": "gemini3.1pro", "question": prompt},
                headers={"Content-Type": "application/json", "X-App-System-Prompt": "You are an Arabic game content generator. Respond in JSON format only."},
                timeout=15
            )
            if resp.ok:
                data = resp.json()
                if data.get('success') and data.get('answer'):
                    answer = data['answer']
                    # Try to parse JSON from answer
                    cleaned = answer.replace('```json', '').replace('```', '').strip()
                    try:
                        return json.loads(cleaned)
                    except:
                        return {"question": answer, "options": [], "correct_answer": ""}
        except:
            pass
        return None