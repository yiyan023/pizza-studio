from flask import Flask, Blueprint, request, jsonify
from propelauth_flask import init_auth, current_user
from dotenv import load_dotenv
from propelauth_flask import init_auth, current_user
import os
from flask_pymongo import PyMongo
from pymongo import MongoClient
from urllib.parse import quote_plus
from .audio import audio_bp

load_dotenv()

AUTH_URL = os.getenv("AUTH_URL")
API_KEY = os.getenv("AUTH_API_KEY")
MONGO_USERNAME = os.getenv("MONGO_USERNAME")
MONGO_PASSWORD = os.getenv("MONGO_PASSWORD")
MONGO_CLUSTER = os.getenv("MONGO_CLUSTER")
auth = init_auth(AUTH_URL, API_KEY)

def create_app():
  app = Flask(__name__)

  from .authentication import authentication

  app.register_blueprint(authentication, url_prefix="/")
  app.config['AUTH_URL'] = AUTH_URL
  app.config['AUTH_API_KEY'] = API_KEY

  # blueprints
  app.register_blueprint(audio_bp)

  return app
