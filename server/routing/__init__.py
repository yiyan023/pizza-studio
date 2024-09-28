from flask import Flask, Blueprint
from propelauth_flask import init_auth, current_user
from dotenv import load_dotenv
import os

load_dotenv()

AUTH_URL = os.getenv("AUTH_URL");
API_KEY = os.getenv("AUTH_API_KEY")

def create_app():
  app = Flask(__name__)
  auth = init_auth(AUTH_URL, API_KEY)

  return app