#!/usr/bin/env python3
"""Simple launcher that handles event loop issues"""
import sys
import os

# Fix path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Patch asyncio for environments with running loops
import asyncio
try:
    import nest_asyncio
    nest_asyncio.apply()
except ImportError:
    pass

from bot import main

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except RuntimeError:
        # Event loop already running
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(main())