"""
FastAPI application entry point for deployment platforms.
This file imports the main FastAPI app from the backend directory.
"""

import sys
import os

# Add the backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

# Import the FastAPI app from backend/main.py
from main import app

# Export the app for deployment platforms
__all__ = ['app']
