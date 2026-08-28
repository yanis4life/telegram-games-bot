#!/usr/bin/env python3
"""Game Manager - handles game sessions, rounds, and scoring"""
import json
import random
import time
from datetime import datetime

from config import Config
from games.qna import QnaGame
from games.whoami import WhoAmIGame
from games.proverb import ProverbGame
from games.opposite import OppositeGame
from games.synonyms import SynonymsGame
from games.wordrace import WordRaceGame
from games.anagrams import AnagramsGame
from games.longestword import LongestWordGame
from games.missingword import MissingWordGame
from games.ta import TaGame
from games.guessnumber import GuessNumberGame
from games.coinflip import CoinFlipGame
from games.rps import RpsGame
from games.guessyear import GuessYearGame
from games.whichlarger import WhichLargerGame
from games.choosepath import ChoosePathGame
from games.escape import EscapeRoomGame
from games.treasure import TreasureHuntGame
from games.riddle import RiddleGame
from games.challenge import ChallengeRaceGame

class GameManager:
    def __init__(self, config, db):
        self.config = config
        self.db = db
        self.games = {
            "qna": QnaGame(config, db),
            "whoami": WhoAmIGame(config, db),
            "proverb": ProverbGame(config, db),
            "opposite": OppositeGame(config, db),
            "synonyms": SynonymsGame(config, db),
            "wordrace": WordRaceGame(config, db),
            "anagrams": AnagramsGame(config, db),
            "longestword": LongestWordGame(config, db),
            "missingword": MissingWordGame(config, db),
            "ta": TaGame(config, db),
            "guessnumber": GuessNumberGame(config, db),
            "coinflip": CoinFlipGame(config, db),
            "rps": RpsGame(config, db),
            "guessyear": GuessYearGame(config, db),
            "whichlarger": WhichLargerGame(config, db),
            "choosepath": ChoosePathGame(config, db),
            "escape": EscapeRoomGame(config, db),
            "treasure": TreasureHuntGame(config, db),
            "riddle": RiddleGame(config, db),
            "challenge": ChallengeRaceGame(config, db),
        }
    
    def get_game(self, game_id):
        return self.games.get(game_id)
    
    def get_session(self, group_id):
        return self.db.get_session(group_id)
    
    def create_session(self, group_id, creator_id, game_id):
        game_def = self.config.GAMES.get(game_id)
        if not game_def:
            return "⚠️ اللعبة غير موجودة."
        
        existing = self.db.get_session(group_id)
        if existing and existing['state'] != 'finished':
            return "⚠️ توجد لعبة نشطة بالفعل في هذه المجموعة!"
        
        session = {
            'group_id': group_id,
            'game_id': game_id,
            'creator_id': creator_id,
            'state': 'waiting',
            'players': [],
            'registered': [creator_id],
            'current_round': 0,
            'total_rounds': game_def['rounds'],
            'scores': {str(creator_id): 0},
            'question_data': {},
            'created_at': datetime.now().isoformat()
        }
        self.db.save_session(session)
        
        g = game_def
        return (
            f"🎮 {g['name']}\n"
            f"📝 {g['desc']}\n"
            f"👥 فردي\n"
            f"🏆 نقاط الفوز: {g['points']}\n"
            f"⭐ خبرة الفوز: {g['xp']}\n\n"
            f"✍️ اكتب \"سجلني\" للمشاركة في اللعبة\n"
            f"👥 اللاعبون الحاليون (1/{self.config.MAX_PLAYERS}): {creator_id}\n\n"
            f"📝 اكتب \"ابدأ\" لبدء اللعبة\n"
            f"⏹ اكتب \"توقف\" للإلغاء"
        )
    
    def register_player(self, group_id, user_id):
        session = self.db.get_session(group_id)
        if not session or session['state'] == 'finished':
            return "⚠️ لا توجد لعبة نشطة حالياً."
        if session['state'] != 'waiting':
            return "⚠️ اللعبة قد بدأت بالفعل."
        if user_id in session['registered']:
            return "⚠️ أنت مسجل بالفعل."
        if len(session['registered']) >= self.config.MAX_PLAYERS:
            return "⚠️ اللعبة ممتلئة."
        
        session['registered'].append(user_id)
        session['scores'][str(user_id)] = 0
        self.db.save_session(session)
        return f"✅ تم تسجيلك في اللعبة!\n👥 اللاعبون الحاليون ({len(session['registered'])}/{self.config.MAX_PLAYERS})"
    
    def start_game(self, group_id, user_id):
        session = self.db.get_session(group_id)
        if not session or session['state'] == 'finished':
            return "⚠️ لا توجد لعبة نشطة حالياً."
        if session['creator_id'] != user_id:
            return "⚠️ أنت لست منشئ هذه اللعبة."
        if session['state'] != 'waiting':
            return "⚠️ اللعبة قد بدأت بالفعل."
        if len(session['registered']) < 1:
            return "⚠️ عدد اللاعبين غير كافٍ."
        
        session['state'] = 'playing'
        session['current_round'] = 1
        session['players'] = list(session['registered'])
        self.db.save_session(session)
        return "🎯 بدأت اللعبة!"
    
    def cancel_session(self, group_id, user_id):
        session = self.db.get_session(group_id)
        if not session or session['state'] == 'finished':
            return "⚠️ لا توجد لعبة نشطة حالياً."
        if session['creator_id'] != user_id:
            return "⚠️ أنت لست منشئ هذه اللعبة."
        self.db.delete_session(group_id)
        return "❌ تم إلغاء اللعبة."
    
    def get_round_text(self, session):
        game = self.get_game(session['game_id'])
        if not game:
            return None
        question = game.generate_question(session)
        session['question_data'] = question
        self.db.save_session(session)
        return game.render_question(session, question)
    
    def handle_answer(self, group_id, user_id, answer):
        session = self.db.get_session(group_id)
        if not session or session['state'] != 'playing':
            return None
        
        game = self.get_game(session['game_id'])
        if not game:
            return None
        
        correct = game.check_answer(session, user_id, answer)
        game_def = self.config.GAMES[session['game_id']]
        
        if correct:
            session['scores'][str(user_id)] = session['scores'].get(str(user_id), 0) + 1
            self.db.save_session(session)
            msg = "✅ إجابة صحيحة!"
        else:
            correct_ans = session['question_data'].get('correct_answer', '')
            msg = f"❌ إجابة خاطئة! الإجابة الصحيحة: {correct_ans}"
        
        # Check if round is complete
        session['current_round'] += 1
        if session['current_round'] > session['total_rounds']:
            return self.finish_game(session)
        
        self.db.save_session(session)
        round_text = self.get_round_text(session)
        return f"{msg}\n\n📋 الجولة {session['current_round']} من {session['total_rounds']}\n\n{round_text}"
    
    def finish_game(self, session):
        # Find winner
        winner_id = None
        max_score = -1
        for pid_str, score in session['scores'].items():
            if score > max_score:
                max_score = score
                winner_id = int(pid_str)
        
        if not winner_id:
            winner_id = session['players'][0]
        
        game_def = self.config.GAMES[session['game_id']]
        
        # Award points
        self.db.add_points(winner_id, game_def['points'], game_def['xp'])
        self.db.add_group_points(winner_id, session['group_id'], game_def['points'])
        self.db.increment_games(winner_id, session['group_id'], won=True)
        
        for pid in session['players']:
            if pid != winner_id:
                self.db.add_points(pid, 0, game_def['xp'] // 2)
                self.db.add_group_points(pid, session['group_id'], 0)
                self.db.increment_games(pid, session['group_id'])
        
        # Record game
        self.db.record_game(
            session['game_id'], session['group_id'], session['creator_id'],
            winner_id, session['players'], session['total_rounds'], game_def['points']
        )
        
        # Get winner info
        winner = self.db.get_user(winner_id)
        winner_name = winner['first_name'] if winner else f"#{winner_id}"
        
        # Build scores
        scores_text = "\n".join([
            f"#{pid}: {session['scores'].get(str(pid), 0)} نقطة"
            for pid in session['players']
        ])
        
        self.db.delete_session(session['group_id'])
        
        return (
            f"🏁 انتهت اللعبة!\n\n"
            f"🏆 الفائز: {winner_name}\n\n"
            f"📊 النتائج:\n{scores_text}\n\n"
            f"🎁 الجائزة: {game_def['points']} نقطة و {game_def['xp']} XP"
        )